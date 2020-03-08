import re
import json
import logging
import requests
import time
from operator import itemgetter


def get_uber_eats_menu_list(restaurant_id, user_query):
    url = "https://www.ubereats.com/api/getStoreV1"

    querystring = {"localeCode": "en-IN"}

    payload = {"sfNuggetCount": 2, "storeUuid": str(restaurant_id)}
    headers = {
        'Content-Type': "application/json",
        'x-csrf-token': "x",
    }

    response = requests.request("POST", url, data=json.dumps(
        payload), headers=headers, params=querystring)

    print(response.text)

    response = json.loads(response.text)

    query_keywords = user_query.lower().split(' ')
    total_menu_detail_list = []
    if response["status"] == "success":
        subsections_dict = {}
        subsections_list = response["data"]["subsectionsMap"]
        restaurant_name = response["data"]["title"]
        restaurant_rating = "Na"
        restaurant_phone_number = response["data"]["phoneNumber"]
        restaurant_address = response["data"]["location"]["address"]
        restaurant_location = [response["data"]["location"][
            "latitude"], response["data"]["location"]["longitude"]]
        if "children" in response["data"]["ratingBadge"][0]:
            restaurant_rating = response["data"][
                "ratingBadge"][0]["children"][0]["text"]
        for key in subsections_list:
            for men_item_id in subsections_list[key]["itemUuids"]:
                subsections_dict[men_item_id] = subsections_list[key]["uuid"]
        total_menu_list = response["data"]["sectionEntitiesMap"]
        res_url = json.loads(response["data"]["metaJson"])["@id"]
        for key in total_menu_list:
            for men_item_id in total_menu_list[key]:
                item_name = total_menu_list[key][men_item_id]["title"]
                item_name_keywords = item_name.lower().split(' ')
                menu_item_is_veg = False
                item_img_url = ""
                if (total_menu_list[key][men_item_id]["imageUrl"] is not None) and (total_menu_list[key][men_item_id]["imageUrl"]!=""):
                    item_img_url = total_menu_list[key][men_item_id]["imageUrl"]

                if "Vegetarian" in total_menu_list[key][men_item_id]["classifications"]:
                    menu_item_is_veg = True

                if len(list(set(item_name_keywords) & set(query_keywords))) > 0:
                    item_id = total_menu_list[key][men_item_id]["uuid"]
                    total_menu_detail_list.append({
                        "price": total_menu_list[key][men_item_id]["price"],
                        "no_word_match": len(list(set(item_name_keywords) & set(query_keywords))),
                        "menu_item_name": item_name,
                        "item_img_url":item_img_url,
                        "restaurant_name": restaurant_name,
                        "restaurant_rating": restaurant_rating,
                        "restaurant_location":restaurant_location,
                        "restaurant_address":restaurant_address,
                        "res_url":res_url,
                        "restaurant_phone_number": restaurant_phone_number,
                        "menu_item_is_veg": menu_item_is_veg,
                        "storeUuid": restaurant_id,
                        "sectionUuid": key,
                        "subsectionUuid": subsections_dict[men_item_id],
                        "menuItemUuid": item_id
                    })
    return total_menu_detail_list


def get_uber_eats_menu_item_details(final_items_list):
    menu_item_detail_list = []

    url = "https://www.ubereats.com/api/getMenuItemV1"

    querystring = {"localeCode": "en-IN"}

    headers = {
        'Content-Type': "application/json",
        'x-csrf-token': "x",
    }
    for menu_item in final_items_list:

        payload = {
            "storeUuid": menu_item["storeUuid"],
            "sectionUuid": menu_item["sectionUuid"],
            "subsectionUuid": menu_item["subsectionUuid"],
            "menuItemUuid": menu_item["menuItemUuid"]
        }
        response = requests.request(
            "POST", url, data=json.dumps(payload), headers=headers, params=querystring)

        try:
            response = json.loads(response.text)
        except:
            continue

        if response["status"] == "success":
            menu_item_detail = response["data"]
            for customization_cat in menu_item_detail["customizationsList"]:
                if(customization_cat["minPermitted"] == 0):
                    continue
                for customization_optn in customization_cat["options"]:
                    if customization_optn["isSoldOut"]:
                        continue
                    temp_menu_item = menu_item.copy()
                    temp_menu_item["menu_item_name"] += " ( "+ customization_optn["title"] +" )"
                    menu_item_detail_list.append({
                        "menu_item_detail": temp_menu_item,
                        "cart_item_detail": {
                            "uuid": menu_item["menuItemUuid"],
                            "shoppingCartItemUuid": "40605a9a-1405-5fcb-a71a-4274182f5932",
                            "storeUuid": menu_item["storeUuid"],
                            "sectionUuid": menu_item["sectionUuid"],
                            "subsectionUuid": menu_item["subsectionUuid"],
                            "price": 0,
                            "title": "",
                            "quantity": 1,
                            "specialInstructions": "",
                            "customizationV2s": [
                                {
                                    "uuid": customization_cat["uuid"],
                                    "childOptions": {
                                        "options": [
                                            {
                                                "quantity": 1,
                                                "uuid": customization_optn["uuid"]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    })
            if len(menu_item_detail["customizationsList"]) == 0:
                menu_item_detail_list.append(
                    {"menu_item_detail": menu_item,
                     "cart_item_detail": {
                         "uuid": menu_item["menuItemUuid"],
                         "shoppingCartItemUuid": "40605a9a-1405-5fcb-a71a-4274182f5932",
                         "storeUuid": menu_item["storeUuid"],
                         "sectionUuid": menu_item["sectionUuid"],
                         "subsectionUuid": menu_item["subsectionUuid"],
                         "price": 0,
                         "title": "",
                         "quantity": 1,
                         "specialInstructions": "",
                         "customizationV2s": []
                     }
                     }
                )

    return menu_item_detail_list


def get_price_detail_list_for_uber_eats(menu_item_detail_list, lat, lng):

    url = "https://www.ubereats.com/api/getOrderEstimateV1"

    querystring = {"localeCode": "en-IN"}
    headers = {
        'Content-Type': "application/json",
        'x-csrf-token': "x",
    }
    total_details_list =[]
    for cart_item_detail in menu_item_detail_list:
        payload = {
            "shoppingCartItems": [cart_item_detail["cart_item_detail"]],
            "useCredits": False,
            "currencyCode": "INR",
            "paymentProfileUuid": "",
            "time": {
                "asap": True
            },
            "location": {
                "address": {
                    "address1": "",
                    "address2": "",
                    "aptOrSuite": "",
                    "city": "",
                            "country": "",
                            "eaterFormattedAddress": "",
                            "postalCode": "",
                            "region": "",
                            "subtitle": "",
                            "title": "",
                            "uuid": ""
                },
                "latitude": lat,
                "longitude": lng,
                "reference": "",
                "referenceType": "google_places",
                "type": "google_places"
            },
            "diningMode": "DELIVERY"
        }

        response = requests.request("POST", url, data=json.dumps(
            payload), headers=headers, params=querystring)

        response = json.loads(response.text)
        final_price_details_dict = {}
        if response["status"] == "success":
            delivery_charges = ""
            menu_item_price = ""
            grand_total = ""
            total_tax  =""

            for charge_details in response["data"]["charges"]:
                if charge_details["key"] == "eats_fare.delivery_fee":
                    delivery_charges = charge_details["rawValue"]
                if charge_details["key"] == "eats_fare.subtotal":
                    menu_item_price = charge_details["rawValue"]
                if charge_details["key"] == "eats_fare.total":
                    grand_total = charge_details["rawValue"]
                if charge_details["key"] == "eats_fare.tax":
                    total_tax = charge_details["rawValue"]


            del_time = response["data"]["etaRange"]["min"]
            del_time_min = response["data"]["etaRange"]["min"]
            del_time_min_max = response["data"]["etaRange"]["max"]
            final_price_details_dict = {
                "vendor":"u_eats",
                "delivery_charges": delivery_charges,
                "menu_item_price": menu_item_price,
                "grand_total": grand_total,
                "del_time": del_time,
                "del_time_min": del_time_min,
                "del_time_max": del_time_min_max,
                "total_tax":total_tax,
                "res_url": cart_item_detail["menu_item_detail"]["res_url"],
                "item_img_url": cart_item_detail["menu_item_detail"]["item_img_url"],
                "restaurant_location": cart_item_detail["menu_item_detail"]["restaurant_location"] ,
                "restaurant_phone_number": cart_item_detail["menu_item_detail"]["restaurant_phone_number"],
                "restaurant_address": cart_item_detail["menu_item_detail"]["restaurant_address"],
                "restaurant_name": cart_item_detail["menu_item_detail"]["restaurant_name"],
                "restaurant_rating": cart_item_detail["menu_item_detail"]["restaurant_rating"],
                "menu_item_name": cart_item_detail["menu_item_detail"]["menu_item_name"],
                "menu_item_is_veg": cart_item_detail["menu_item_detail"]["menu_item_is_veg"],
                "storeUuid": cart_item_detail["menu_item_detail"]["storeUuid"],
                "sectionUuid": cart_item_detail["menu_item_detail"]["sectionUuid"],
                "subsectionUuid": cart_item_detail["menu_item_detail"]["subsectionUuid"],
                "menuItemUuid": cart_item_detail["menu_item_detail"]["menuItemUuid"]}
            total_details_list.append(final_price_details_dict)
    return total_details_list


def get_dish_results_from_uber_eats(lat, lng, user_query):

    url = "https://www.ubereats.com/api/getFeedV1"

    querystring = {"localeCode": "en-IN"}

    payload = {
        "cacheKey": "",
        "feedSessionCount": {
            "announcementCount": 1,
            "announcementLabel": "\"subscription.analytics_label\""
        },
        "userQuery": user_query,
        "chainName": "",
        "date": "",
        "startTime": 0,
        "endTime": 0,
        "carouselId": "",
        "slugName": "",
        "categorySlug": "",
        "sortAndFilters": []
    }

    headers = {
        'Cookie': "uev2.loc={%22address%22:\
        {%22address1%22:%22%22%2C%22address2%22:%22%22%2C%22aptOrSuite%22:%22%22%2C%22city%22:%22%22%2C%22country%22:%22%22\
        %2C%22eaterFormattedAddress%22:%22%22%2C%22postalCode%22:%22%22%2C%22region%22:%22%22%2C%22subtitle%22:%22%22%2C\
        %22title%22:%22%22%2C%22uuid%22:%22%22}%2C%22latitude%22:" + str(lat) + "%2C%22longitude%22:" + str(lng) + "%2C%22reference%22:%22%22\
        %2C%22referenceType%22:%22google_places%22%2C%22type%22:%22google_places%22}",
        'x-csrf-token': "x",
        'Content-Type': "application/json"
    }

    response = requests.request(
        "POST", url, headers=headers, params=querystring, data=json.dumps(payload))

    response = json.loads(response.text)

    if response["status"] == "success":
        restaurants = response["data"]["storesMap"]

        final_items_list = []
        for restaurant_id in list(restaurants.keys())[:4]:
            if restaurants[restaurant_id]["isOpen"]:
                final_items_list += get_uber_eats_menu_list(
                    restaurant_id, user_query)

        top_100_item_list =  sorted(final_items_list, key=lambda k: (-k['no_word_match'], k['price']))[:100]

    return top_100_item_list

def main():
    top_100_item_list = get_dish_results_from_uber_eats(19.2307, 72.8567, "pav bhaji")

    menu_item_detail_list = get_uber_eats_menu_item_details(top_100_item_list)

    final_price_details_dict = get_price_detail_list_for_uber_eats(menu_item_detail_list, 19.2307, 72.8567)

    print(json.dumps(final_price_details_dict))

if __name__ == '__main__':
    main()

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
