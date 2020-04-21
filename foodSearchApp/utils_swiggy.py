import re
import json
import logging
import requests
import time

def get_dish_results_from_swiggy(lat, lng, query):

    restaurants_details_dict = {
        "opened": [],
        "closed": [],
        "unavailable": [],
        "unserviceable": []
    }

    url = "https://www.swiggy.com/dapi/restaurants/search/v2_2"

    querystring = {"lat": str(lat),
                   "lng": str(lng),
                   "str": str(query),
                   "withMenuItems": "true"}

    headers = {}

    response = requests.request(
        "GET", url, headers=headers, params=querystring)

    response = json.loads(response.text)
    query_keywords = query.lower().split(' ')
    if response["statusCode"] == 0:
        restaurants_groups = response['data']['restaurants']
        for restaurants_group in restaurants_groups:
            group_type = restaurants_group["type"]
            group_desc = restaurants_group["title"]
            restaurants_list = restaurants_group["restaurants"]
            no_restaurants = len(restaurants_list)
            for restaurant in restaurants_list:
                restaurant_name = restaurant["name"]
                restaurant_id = restaurant["id"]
                restaurant_rating = restaurant["avg_rating"]
                res_url = "https://www.swiggy.com/restaurants/"+restaurant["slugs"]["restaurant"]+"-"+restaurant["slugs"]["city"]+"-"+str(restaurant_id)
                restaurant_menu_list = []

                for restaurant_item in restaurant["menuItems"]:
                    menu_item_id = restaurant_item["id"]
                    menu_item_name = restaurant_item["name"]
                    menu_item_price = restaurant_item["price"]
                    menu_item_is_veg = restaurant_item["isVeg"]
                    item_name_keywords = menu_item_name.lower().split(' ')
                    menu_item_variants = []
                    item_img_url=""
                    if "cloudinaryImageId" in restaurant_item:
                        if (restaurant_item["cloudinaryImageId"] is not None) and (restaurant_item["cloudinaryImageId"] != "" ):
                            item_img_url =  "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_112,h_112,c_fill/"+restaurant_item["cloudinaryImageId"]
                    if "variant_groups" in restaurant_item["variants_new"]:
                        if len(restaurant_item["variants_new"]["variant_groups"]) > 0:
                            for variant_detail in restaurant_item["variants_new"]["variant_groups"][0]["variations"]:
                                variant_id = variant_detail["id"]
                                variant_name = variant_detail["name"]
                                variant_group_id = restaurant_item["variants_new"][
                                    "variant_groups"][0]["group_id"]
                                menu_item_variants.append({
                                    "variation_id": variant_id,
                                    "name": variant_name,
                                    "group_id": variant_group_id,
                                    "price": 0
                                })
                    restaurants_details_dict[group_type].append({
                        "restaurant_group_type": group_type,
                        "restaurant_group_desc": group_desc,
                        "restaurant_name": restaurant_name,
                        "restaurant_id": restaurant_id,
                        "restaurant_rating": restaurant_rating,
                        "menu_item_id": menu_item_id,
                        "menu_item_name": menu_item_name,
                        "menu_item_is_veg": menu_item_is_veg,
                        "menu_item_variants": menu_item_variants,
                        "menu_item_price":menu_item_price,
                        "res_url":res_url,
                        "item_img_url":item_img_url,
                        "no_word_match":len(list(set(item_name_keywords) & set(query_keywords))),

                    })
    return restaurants_details_dict


def parse_required_details_from_item(restaurant_menu_list):
    total_details_list = []
    for menu_item in restaurant_menu_list:
        restaurant_id = menu_item["restaurant_id"]
        if len(menu_item["menu_item_variants"]) > 0:
            print("1")
        else:
            selected_items_detail_list = [
                {
                    "addons": [],
                    "variants": [],
                    "menu_item_id": menu_item["menu_item_id"],
                    "quantity": 1
                }
            ]
            final_price_details_dict = get_final_price_details_from_swiggy(
                selected_items_detail_list, restaurant_id)
            if len(final_price_details_dict.keys())>0:
                menu_item.update(final_price_details_dict)
                total_details_list.append(menu_item)
    return total_details_list


def get_final_price_details_from_swiggy(selected_items_detail_list, restaurant_id):

    url = "https://www.swiggy.com/mapi/cart_new"

    payload = {
        "flushFirst": False,
        "cart": {
            "restaurantId": restaurant_id,
            "address_id": "",
            "couponCode": "",
            "cartItems": selected_items_detail_list,
            "mealItems": [],
            "subscriptionItems": [],
            "sld": 0
        },
        "_csrf": "0DSwJwguYmzt-fSQpQclwHR7ZCrV1TRZAV9fPyNc"
    }
    headers = {
        'Content-Type': "application/json",
        'Cookie': "__SW=O2gClrEYEWt_gQsG0mFpxrWb_9UFUZHS;,__SW=O2gClrEYEWt_gQsG0mFpxrWb_9UFUZHS;; visid_incap_1554223=7K5o/7QQSx6L9CHao9SIXIxZxl0AAAAAQUIPAAAAAAAArjMFCH86oKZ/e4JlRYm0; __cfduid=d49b536ea92d12f38a7f3e4595d1c2c621574186329; _device_id=f617c673-73ab-48cd-b5ce-407614add86e; __SW=WU8zIgXqOpsRUftD6pvCuIEpnkHCV3R9; _guest_tid=190fa3ef-a600-4892-bc10-21a02d2f7317; _sid=juoa5da9-d4ef-449d-9e74-c100fa84637a",
        'Host': "www.swiggy.com",
    }

    response = requests.request(
        "POST", url, data=json.dumps(payload), headers=headers)

    response = json.loads(response.text)
    final_price_details_dict = {}
    if response["statusCode"] == 0:
        final_price_details_dict["vendor"] ="swiggy" 
        final_price_details_dict["threshold_fee"] = response[
            "data"]["cartMeta"]["threshold_fee_effective"]
        final_price_details_dict["threshold_fee_message"] = response[
            "data"]["cartMeta"]["threshold_fee_message"]
        final_price_details_dict["distance_fee"] = response[
            "data"]["cartMeta"]["distance_fee_effective"]
        final_price_details_dict["distance_fee_message"] = response[
            "data"]["cartMeta"]["distance_fee_message"]
        final_price_details_dict["time_fee"] = response[
            "data"]["cartMeta"]["time_fee_effective"]
        final_price_details_dict["time_fee_message"] = response[
            "data"]["cartMeta"]["time_fee_message"]
        final_price_details_dict["special_fee"] = response[
            "data"]["cartMeta"]["special_fee_effective"]
        final_price_details_dict["special_fee_message"] = response[
            "data"]["cartMeta"]["special_fee_message"]

        final_price_details_dict["delivery_charges"] = response[
            "data"]["cartMeta"]["delivery_charges"]
        final_price_details_dict["total_packing_charges"] = response[
            "data"]["cartMeta"]["total_packing_charges"]
        final_price_details_dict["discount_total"] = response[
            "data"]["cartMeta"]["discount_total"]
        if "discount_message" in response[
            "data"]["cartMeta"]:
            final_price_details_dict["discount_message"] = response[
                "data"]["cartMeta"]["discount_message"]
        else:
            final_price_details_dict["discount_message"] = ""
        final_price_details_dict["total_tax"] = response[
            "data"]["cartMeta"]["total_tax"]
        final_price_details_dict["menu_item_price"] = response[
            "data"]["cartMeta"]["item_total"]

        final_price_details_dict["grand_total"] = response[
            "data"]["cartMeta"]["order_total"]
        final_price_details_dict["del_time"] = response[
            "data"]["cartMeta"]["sla_time"]
        final_price_details_dict["del_time_min"] = response[
            "data"]["cartMeta"]["sla_range_min"]
        final_price_details_dict["del_time_max"] = response[
            "data"]["cartMeta"]["sla_range_max"]

        final_price_details_dict["restaurant_location"] = [response["data"]["cartMeta"][
            "restaurant_details"]["lat"], response["data"]["cartMeta"]["restaurant_details"]["lng"]]
        final_price_details_dict["restaurant_phone_number"] = response[
            "data"]["cartMeta"]["restaurant_details"]["phone_no"]
        final_price_details_dict["restaurant_address"] = response[
            "data"]["cartMeta"]["restaurant_details"]["address"]
    else:
        print("$$$$")
        print(json.dumps(payload))
        print(json.dumps(response))
        print("$$$$")
    return final_price_details_dict


def main():
    restaurant_menu_list = get_dish_results_from_swiggy(
        19.2307, 72.8567, "pav bhaji")["opened"]
    print(json.dumps(parse_required_details_from_item(restaurant_menu_list)))

if __name__ == '__main__':
    main()
