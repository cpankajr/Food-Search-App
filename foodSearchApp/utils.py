from foodSearchApp.models import *
from django.conf import settings
import re
import json
import logging
import requests
import time
import uuid
from foodSearchApp.utils_swiggy import *
from foodSearchApp.utils_uber_eats import *
from foodSearchApp.utils_zomato import *
from foodSearchApp.utils_zomato import *
from geopy.distance import geodesic
from datetime import datetime, timedelta
import sys

logger = logging.getLogger(__name__)

no_items_each_call = 5


def make_equal_chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def remove_html_from_string(raw_str):
    regex_cleaner = re.compile('<.*?>')
    cleaned_raw_str = re.sub(regex_cleaner, '', raw_str)
    return cleaned_raw_str


def get_food_search_data(unique_search_id, page_no, FoodSearchData, lat, lng, user_query):
    logger.info("[SEARCH DATA] Inside get_food_search_data")
    search_data_obj = None
    food_search_data = []
    try:
        if unique_search_id != "":
            logger.info("[SEARCH DATA] Got Exact unique search id: "+ str(unique_search_id))
            search_data_obj = FoodSearchData.objects.get(
                unique_search_id=unique_search_id)
        else:
            logger.info("[SEARCH DATA] Got No serach id")
            logger.info("[SEARCH DATA] Searching Database for same query results in same time span")
            search_data_objs = FoodSearchData.objects.filter(
                user_query=user_query, created_date__gte=datetime.now() - timedelta(minutes=60)).order_by('-pk')
            max_dist = 500
            logger.info("[SEARCH DATA] Filtering based on area")
            for data_obj in search_data_objs:
                origin = (float(lat), float(lng))
                dist = (float(data_obj.latitude), float(data_obj.longitude))
                dis_meters = float(geodesic(origin, dist).meters)
                
                if dis_meters < max_dist:
                    max_dist = dis_meters
                    search_data_obj = data_obj
    except Exception as e:
        logger.warning("[SEARCH DATA] Error while filtering search id in database")
        pass

    if search_data_obj is None:
        logger.info("[SEARCH DATA] NEW search id")
        search_data_obj = get_full_list_of_dishes_based_on_query(
            lat, lng, user_query, FoodSearchData)
    item_search_data = json.loads(search_data_obj.item_data)
    if len(item_search_data) >= page_no:
        food_search_data = item_search_data[page_no - 1]

    logger.info("[SEARCH DATA] UNIQUE ID: " + str(unique_search_id))
    logger.info("[SEARCH DATA] Page No: " + str(page_no))
    logger.info("[SEARCH DATA] Length of search data: " + str(len(item_search_data)))

    logger.info("[SEARCH DATA] Exit from get_food_search_data")
    return food_search_data, page_no, search_data_obj.unique_search_id


def get_full_list_of_dishes_based_on_query(lat, lng, user_query, FoodSearchData):
    logger.info("[ITEM DATA] Inside get_full_list_of_dishes_based_on_query")
    try:
        logger.info("[ITEM DATA] Getting results from Uber Eats")
        item_list_ueats = get_dish_results_from_uber_eats(
            float(lat), float(lng), str(user_query))
    except Exception as e:
        item_list_ueats = []
        logger.error(
            "[ITEM DATA] Error while getting menu items from uber eats: " + str(e))
    logger.info("[ITEM DATA] No results from Uber Eats: "+ str(len(item_list_ueats)))
    try:
        logger.info("[ITEM DATA] Getting results from Swiggy")
        item_list_swiggy = get_dish_results_from_swiggy(
            float(lat), float(lng), str(user_query))["opened"]
    except Exception as e:
        item_list_swiggy = []
        logger.error("[ITEM DATA] Error while getting menu items from swiggy: " + str(e))
    logger.info("[ITEM DATA] No results from Swiggy: "+ str(len(item_list_swiggy)))
    try:
        logger.info("[ITEM DATA] Getting results from Zomato")
        #item_list_zomato = []
        item_list_zomato = get_dish_results_from_zomato(
            float(lat), float(lng), str(user_query))
    except Exception as e:
        item_list_zomato = []
        logger.error("[ITEM DATA] Error while getting menu items from zomato: " + str(e))
    logger.info("[ITEM DATA] No results from Zomato: "+ str(len(item_list_zomato)))

    full_detail_list_of_dishes = []

    for item in item_list_ueats:
        full_detail_list_of_dishes.append({
            "vendor": "u_eats",
            "item_data": item,
            "price": item["price"]/100,
            "no_word_match": item["no_word_match"]
        })
    for item in item_list_swiggy:
        full_detail_list_of_dishes.append({
            "vendor": "swiggy",
            "item_data": item,
            "price": item["menu_item_price"]/100,
            "no_word_match": item["no_word_match"]
        })
    for item in item_list_zomato:
        full_detail_list_of_dishes.append({
            "vendor": "zomato",
            "item_data": item,
            "price": item['base_detail']['menu_item_price'],
            "no_word_match": item['base_detail']["no_word_match"]
        })
    if len(full_detail_list_of_dishes) > 0:
        full_detail_list_of_dishes = sorted(
            full_detail_list_of_dishes, key=lambda k: (-k['no_word_match'], float(k['price'])))
        logger.info(len(full_detail_list_of_dishes))
        full_detail_list_of_dishes = list(make_equal_chunks(
            full_detail_list_of_dishes, no_items_each_call))

    unique_search_id = str(uuid.uuid4())
    search_data_obj = FoodSearchData.objects.create(unique_search_id=unique_search_id,
                                                    latitude=str(lat),
                                                    longitude=str(lng),
                                                    user_query=str(user_query),
                                                    item_data=json.dumps(full_detail_list_of_dishes))
    logger.info("[ITEM DATA] Exit from get_full_list_of_dishes_based_on_query")
    return search_data_obj


def get_food_detail_data(lat, lng, unique_search_id, page_no):
    food_detail_data = []
    try:
        if unique_search_id != "":
            logger.info("[PRICE DATA] Inside get_food_detail_data")
            search_data_obj = FoodSearchData.objects.get(
                unique_search_id=unique_search_id)
            stored_food_detail_data = json.loads(search_data_obj.detailed_data)
            item_search_data = json.loads(search_data_obj.item_data)
            if len(item_search_data) >= page_no:
                food_search_data = item_search_data[page_no - 1]
                if str(page_no) in stored_food_detail_data:
                    logger.info("[PRICE DATA] Returning price data from Database for id: "+ str(unique_search_id) +" and page no: "+ str(page_no) )
                    food_detail_data = stored_food_detail_data[str(page_no)]
                    logger.info("[PRICE DATA] Exit from get_food_detail_data")
                    return food_detail_data, page_no, False
            else:
                logger.info("[PRICE DATA] Requested Page no is not found. No More Data")
                logger.info("[PRICE DATA] Exit from get_food_detail_data")
                return [], page_no,True
            # print(json.dumps(food_search_data))
            logger.info("[PRICE DATA] Requesting APIs for price data for id: " +str(unique_search_id) +" and page no: "+ str(page_no) )
            for item_data_obj in food_search_data:
                # print(item_data_obj)
                if item_data_obj["vendor"] == "swiggy":
                    logger.info('[PRICE DATA] Getting data from SWIGGY')
                    swiggy_price_data = parse_required_details_from_item(
                        [item_data_obj["item_data"]])
                    logger.info('[PRICE DATA] SWIGGY Data Length: '+ str(len(swiggy_price_data)))
                    food_detail_data += swiggy_price_data

                if item_data_obj["vendor"] == "u_eats":
                    logger.info('[PRICE DATA] Getting data from UBER EATS')
                    menu_item_detail_list = get_uber_eats_menu_item_details(
                        [item_data_obj["item_data"]])
                    u_eats_price_data = get_price_detail_list_for_uber_eats(
                        menu_item_detail_list, lat, lng)
                    logger.info('[PRICE DATA] UBER EATS Data Length: '+ str(len(u_eats_price_data)))
                    food_detail_data += u_eats_price_data

                if item_data_obj["vendor"] == "zomato":
                    logger.info('[PRICE DATA] Getting data from ZOMATO')
                    csrf_token, cookies_value = get_basic_auth_cookies_zomato()
                    zomato_price_data = get_final_price_detail_for_zomato(
                        csrf_token, cookies_value, [item_data_obj["item_data"]])
                    logger.info('[PRICE DATA] ZOMATO Data Length: '+ str(len(zomato_price_data)))
                    if len(zomato_price_data)>0:
                        if float(zomato_price_data[0]['total_price'])>100:
                            food_detail_data += zomato_price_data
            logger.info('[PRICE DATA] No of price data: '+ str(len(food_detail_data)))
            stored_food_detail_data [str(page_no)]=food_detail_data
            search_data_obj.detailed_data = json.dumps(stored_food_detail_data)
            search_data_obj.save() 
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        logger.error("[PRICE DATA] Error while getting final_details: " +str(e)+ ": "+ str(exc_tb.tb_lineno))
    logger.info("[PRICE DATA] Exit from get_food_detail_data")
    return food_detail_data, page_no, False
This is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is lineThis is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
