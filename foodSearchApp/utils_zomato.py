import re
import json
import logging
import requests
import time
from operator import itemgetter

def get_basic_auth_cookies_zomato():
    url = "https://www.zomato.com/mumbai/dwaraka-borivali-west/order"

    querystring = {"zpwa": "true"}

    headers = {
    'User-Agent': "PostmanRuntime/7.20.1",
    'Accept': "*/*",
    'Cache-Control': "no-cache",
    'Postman-Token': "f21024d6-63ed-4b82-8fc7-4990e9791a0c,0cdba6c3-0103-40e7-8f77-f9ae5038a1ba",
    'Host': "www.zomato.com",
    'Accept-Encoding': "gzip, deflate",
    'Cookie': "fbcity=3; zl=en; fbtrack=a3947d5834d8a4bbbb251bf448bd4511; gsc1=0; _abck=57B873AA4F8B1D13A4B122BAF9A5B91E~-1~YAAQMDXZF7OVw3luAQAA1NbBHgNlUr9jyaYaZ2Kl2yDqONE30BqH6sscO1s420Z0u76Bs+BP4ueGSkCQE67iUInBs9j4y71v1mRvNFC2KpY2RFfdwBbGq6JomSF0uNIJKIaW90YPdr5XqGOh61PPnPo01eULqdmPluiGx/7LEwroBlFAOpN0pE17vsHnSYqkmD0kLB7NIG43XN/C6I24pL+W4R03j80DCRdgT/J332oTbFZXb3DTPxJesdiRmpAUOorICiykk+BslnAxWvGaGVnBKbDFmvCQagdwKord30p1RfR0Jl945zpalgU2HjpeKrSKsveXkCE=~-1~1-EhRtKaQfTi-10000-100-3000-1||~-1",
    'Connection': "keep-alive",
    'cache-control': "no-cache"
    }

    response = requests.request(
        "GET", url, headers=headers, params=querystring)
    csrf_token = ""
    cookies_value = ""

    for cookie in response.cookies:
        cookies_value = cookies_value + cookie.name + "=" + cookie.value + ";"
        if cookie.name == "csrf":
            csrf_token = cookie.value

    return csrf_token, cookies_value


def get_res_list_based_on_zone_query(del_subzone_id, user_query):

    url = "https://www.zomato.com/webapi/handlers/Search/index.php"

    querystring = {"type": "restaurant-search", "query": "pav%20bhaji",
                   "delivery_subzone": "3391", "zpwa": "true"}

    headers = {
    'User-Agent': "PostmanRuntime/7.20.1",
    'Accept': "*/*",
    'Cache-Control': "no-cache",
    'Postman-Token': "f21024d6-63ed-4b82-8fc7-4990e9791a0c,0cdba6c3-0103-40e7-8f77-f9ae5038a1ba",
    'Host': "www.zomato.com",
    'Accept-Encoding': "gzip, deflate",
    'Cookie': "fbcity=3; zl=en; fbtrack=a3947d5834d8a4bbbb251bf448bd4511; gsc1=0; _abck=57B873AA4F8B1D13A4B122BAF9A5B91E~-1~YAAQMDXZF7OVw3luAQAA1NbBHgNlUr9jyaYaZ2Kl2yDqONE30BqH6sscO1s420Z0u76Bs+BP4ueGSkCQE67iUInBs9j4y71v1mRvNFC2KpY2RFfdwBbGq6JomSF0uNIJKIaW90YPdr5XqGOh61PPnPo01eULqdmPluiGx/7LEwroBlFAOpN0pE17vsHnSYqkmD0kLB7NIG43XN/C6I24pL+W4R03j80DCRdgT/J332oTbFZXb3DTPxJesdiRmpAUOorICiykk+BslnAxWvGaGVnBKbDFmvCQagdwKord30p1RfR0Jl945zpalgU2HjpeKrSKsveXkCE=~-1~1-EhRtKaQfTi-10000-100-3000-1||~-1",
    'Connection': "keep-alive",
    'cache-control': "no-cache"
    }

    response = requests.request(
        "GET", url, headers=headers, params=querystring)

    response = json.loads(response.text)
    res_info_list = []
    if len(response["results"]) > 0:
        for res_info in response["results"]:

            is_open_now = res_info["basic_info"]["is_open_now"]
            is_closed_flag = res_info["basic_info"]["is_closed_flag"]

            if (is_closed_flag) and (not is_open_now):
                continue
            res_id = res_info["basic_info"]["res_id"]
            res_name = res_info["basic_info"]["name"]
            res_rating = ""
            if "display" in res_info["basic_info"]["rating"]:
                res_rating = res_info["basic_info"]["rating"]["display"]
            res_location = []
            if "lat" in res_info["basic_info"]["geolocation_data"]:
                res_location = [res_info["basic_info"]["geolocation_data"][
                    "lat"], res_info["basic_info"]["geolocation_data"]["long"]]
            del_time = ""
            if "average_delivery_time_text" in res_info["order"]:
                del_time = res_info["order"]["average_delivery_time_text"]
            res_address = res_info["basic_info"]["restaurant_address"]
            phone_string = ""
            if "phone_string" in res_info["basic_info"]["phoneData"]:
                phone_string += str(res_info["basic_info"]
                                    ["phoneData"]["phone_string"]) + " "
            if "mobile_string" in res_info["basic_info"]["phoneData"]:
                phone_string += str(res_info["basic_info"]
                                    ["phoneData"]["mobile_string"])
            res_phone = phone_string
            res_url = "https://www.zomato.com/mumbai/"
            if "ORDER" in res_info["basic_info"]["urls"]:
                res_url = res_info["basic_info"]["urls"]["ORDER"]
            res_info_list.append({
                "restaurant_id": res_id,
                "restaurant_name": res_name,
                "restaurant_address": res_address,
                "res_location": res_location,
                "del_time": del_time,
                "res_url":res_url,
                "item_img_url":"",
                "restaurant_phone_number": res_phone,
                "restaurant_rating": res_rating,
                "restaurant_subzone": del_subzone_id
            })

    # print(json.dumps(res_info_list))
    return res_info_list


def get_zomato_menu_list(csrf_token, cookies_value, res_info_list,user_query):

    url = "https://www.zomato.com/php/o2_handler.php"
    querystring = {"zpwa": "true"}
    headers = {
        'referer': "https://www.zomato.com/",
        'sec-fetch-mode': "cors",
        'sec-fetch-site': "same-origin",
        'User-Agent': "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36",
        'Cookie': str(cookies_value),
        'Accept': "*/*",
        'Cache-Control': "no-cache",
        'Host': "www.zomato.com",
        'Accept-Encoding': "gzip, deflate",
        'Content-Length': "416",
        'Connection': "keep-alive",
        'cache-control': "no-cache"
    }
    total_menu_item_list =[]
    query_keywords = user_query.lower().split(' ')
    for res_info in res_info_list:
        payload = {'res_id':res_info["restaurant_id"],'csrfToken':csrf_token,'case':'getdata'}
        response = requests.request(
            "POST", url, data=payload, headers=headers, params=querystring)
        #print(response.text)
        # break

        response = json.loads(response.text)
        try:
            for menu_info in response["menus"]:
                menu_name = menu_info["menu"]["name"]
                if (menu_name == "Bestsellers") or (menu_name =="Restaurant's Recommendations"):
                    continue
                for menu_category in menu_info["menu"]["categories"]:
                    for menu_items in menu_category["category"]["items"]:
                        if menu_items["item"]["visible"]==1:
                            menu_item_name = menu_items["item"]["name"]
                            menu_item_price = menu_items["item"]["price"]
                            menu_item_id = menu_items["item"]["id"]
                            menu_item_detail = {
                            "order[dishes][0][item_metadata]":menu_items["item"]["item_metadata"],
                            "order[dishes][0][type]":menu_items["item"]["item_type"],
                            "order[dishes][0][comment]":"",
                            "order[dishes][0][item_id]":menu_items["item"]["id"],
                            "order[dishes][0][item_name]":menu_items["item"]["name"],
                            "order[dishes][0][mrp_item]": menu_items["item"]["mrp_item"],
                            "order[dishes][0][quantity]": 1,
                            "order[dishes][0][tax_inclusive]": menu_items["item"]["tax_inclusive"],
                            "order[dishes][0][unit_cost]":menu_items["item"]["price"],
                            "order[dishes][0][total_cost]":menu_items["item"]["price"],
                            "order[dishes][0][is_bogo_active]": menu_items["item"]["is_bogo_active"],
                            "order[dishes][0][bogoItemsCount]": 0,
                            }
                            item_add_flag =True
                            item_name_keywords = menu_item_name.lower().split(' ')
                            if len(list(set(item_name_keywords) & set(query_keywords))) ==0:
                                continue
                            no_word_match = len(list(set(item_name_keywords) & set(query_keywords)))
                            base_menu_item_detail = {**res_info,
                            "menu_item_name" : menu_item_name,
                            "menu_item_price" : menu_item_price,
                            "menu_item_id":menu_item_id,
                            "no_word_match": no_word_match
                            }
                            if "groups" in menu_items["item"]:
                                for group in menu_items["item"]["groups"]:
                                    group = group["group"]
                                    if group["min"] == 0:
                                        continue
                                    temp_menu_item_detail = menu_item_detail.copy()
                                    for grp_itm in group["items"]:
                                        base_menu_item_detail = {**res_info,
                                        "menu_item_name" : menu_item_name + " ("+ grp_itm["item"]["name"] +" )",
                                        "menu_item_price" : grp_itm["item"]["price"],
                                        "menu_item_id":menu_item_id,
                                        "no_word_match": no_word_match
                                        }
                                        temp_menu_item_detail = {**temp_menu_item_detail,
                                        "order[dishes][0][groups][0][id]": group["id"],
                                        "order[dishes][0][groups][0][name]":group["name"],
                                        "order[dishes][0][groups][0][label]":group["label"],
                                        "order[dishes][0][groups][0][min]": group["min"],
                                        "order[dishes][0][groups][0][max]": group["max"],
                                        "order[dishes][0][groups][0][parent_menu_id]": group["parent_menu_id"],
                                        "order[dishes][0][groups][0][parent_visiblity]": group["parent_visiblity"],
                                        "order[dishes][0][groups][0][hasFocus]": group["hasFocus"],
                                        "order[dishes][0][groups][0][items][0][item_metadata]":grp_itm["item"]["item_metadata"],
                                        "order[dishes][0][groups][0][items][0][type]": grp_itm["item"]["item_type"],
                                        "order[dishes][0][groups][0][items][0][comment]":"" ,
                                        "order[dishes][0][groups][0][items][0][item_id]": grp_itm["item"]["id"],
                                        "order[dishes][0][groups][0][items][0][item_name]":grp_itm["item"]["name"],
                                        "order[dishes][0][groups][0][items][0][mrp_item]": menu_items["item"]["mrp_item"],
                                        "order[dishes][0][groups][0][items][0][quantity]": 1,
                                        "order[dishes][0][groups][0][items][0][tax_inclusive]": grp_itm["item"]["tax_inclusive"],
                                        "order[dishes][0][groups][0][items][0][unit_cost]":grp_itm["item"]["price"],
                                        "order[dishes][0][groups][0][items][0][total_cost]":grp_itm["item"]["price"],
                                        "order[dishes][0][groups][0][show_customisation]":grp_itm["item"]["show_customisation"]}
                                        item_add_flag = False
                                        total_menu_item_list.append({"base_detail":base_menu_item_detail,
                                            "order_detail":temp_menu_item_detail})
                            else:
                                item_add_flag = False
                                total_menu_item_list.append({"base_detail":base_menu_item_detail,
                                            "order_detail":menu_item_detail})

                            if item_add_flag:
                                total_menu_item_list.append({"base_detail":base_menu_item_detail,
                                            "order_detail":menu_item_detail})



        except Exception as e:
            print(e)
            pass
    top_100_item_list =  sorted(total_menu_item_list, key=lambda k: (-k['base_detail']['no_word_match'], k['base_detail']['menu_item_price']))[:100]

    return top_100_item_list

def get_final_price_detail_for_zomato(csrf_token, cookies_value, top_100_item_list):

    url = "https://www.zomato.com/php/o2_handler.php"

    querystring = {"zpwa":"true"}

    headers = {
        'referer': "https://www.zomato.com/",
        'sec-fetch-mode': "cors",
        'sec-fetch-site': "same-origin",
        'User-Agent': "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36",
        'Cookie': str(cookies_value),
        'Accept': "*/*",
        'Cache-Control': "no-cache",
        'Host': "www.zomato.com",
        'Accept-Encoding': "gzip, deflate",
        'Content-Length': "5332",
        'Connection': "keep-alive",
        'cache-control': "no-cache"
        }
    final_price_details_list = []
    for order_info in top_100_item_list:
        payload = {**order_info["order_detail"],
        "res_id":order_info["base_detail"]["restaurant_id"],
        "payment_method_id":0,
        "user_id": 73131303,
        "address_id": 194722759,
        "payment_method_type":"",
        "card_bin":"",
        "case":"calculatecart",
        "csrfToken":str(csrf_token),
        }
        response = requests.request("POST", url, data=payload, headers=headers, params=querystring)

        response  = json.loads(response.text)

        if response["status"] == "success":
            total_price = ""
            charges_detail_dict={}
            for charges_detail in response["order"]["items"]:
                charge_name = charges_detail["item"]["itemName"]
                charge_price = charges_detail["item"]["totalCost"]
                charges_detail_dict[charge_name.lower()] = charge_price
                if charge_name.lower() == "grand total":
                    total_price = charge_price
            final_price_details_list.append({
                **order_info["base_detail"],
                "total_price":total_price,
                "charges_detail_dict":charges_detail_dict,
                "vendor":"zomato"
                })
    return final_price_details_list

def get_dish_results_from_zomato(lat, lng, user_query):

    url = "https://www.zomato.com/webapi/handlers/Search/index.php"

    querystring = {
        "type": "delivery-area",
        "lat": str(lat),
        "long": str(lng),
        "zpwa": "true"
    }

    headers = {
    'User-Agent': "PostmanRuntime/7.20.1",
    'Accept': "*/*",
    'Cache-Control': "no-cache",
    'Postman-Token': "f21024d6-63ed-4b82-8fc7-4990e9791a0c,0cdba6c3-0103-40e7-8f77-f9ae5038a1ba",
    'Host': "www.zomato.com",
    'Accept-Encoding': "gzip, deflate",
    'Cookie': "fbcity=3; zl=en; fbtrack=a3947d5834d8a4bbbb251bf448bd4511; gsc1=0; _abck=57B873AA4F8B1D13A4B122BAF9A5B91E~-1~YAAQMDXZF7OVw3luAQAA1NbBHgNlUr9jyaYaZ2Kl2yDqONE30BqH6sscO1s420Z0u76Bs+BP4ueGSkCQE67iUInBs9j4y71v1mRvNFC2KpY2RFfdwBbGq6JomSF0uNIJKIaW90YPdr5XqGOh61PPnPo01eULqdmPluiGx/7LEwroBlFAOpN0pE17vsHnSYqkmD0kLB7NIG43XN/C6I24pL+W4R03j80DCRdgT/J332oTbFZXb3DTPxJesdiRmpAUOorICiykk+BslnAxWvGaGVnBKbDFmvCQagdwKord30p1RfR0Jl945zpalgU2HjpeKrSKsveXkCE=~-1~1-EhRtKaQfTi-10000-100-3000-1||~-1",
    'Connection': "keep-alive",
    'cache-control': "no-cache"
    }

    response = requests.request(
        "GET", url, headers=headers, params=querystring)

    response = json.loads(response.text)

    final_price_details_list =[]

    if len(response["results"]) > 0:
        del_subzone_id = response["results"][0]["delivery_subzone_id"]
        res_info_list = get_res_list_based_on_zone_query(
            del_subzone_id, user_query)
        csrf_token, cookies_value = get_basic_auth_cookies_zomato()
        print(csrf_token,cookies_value)
        top_100_item_list =  get_zomato_menu_list(csrf_token, cookies_value, res_info_list,user_query)
    return top_100_item_list


def main():
    top_100_item_list = get_dish_results_from_zomato(19.2307, 72.8567, "pav bhaji")

    csrf_token, cookies_value = get_basic_auth_cookies_zomato()
    final_price_details_list = get_final_price_detail_for_zomato(csrf_token, cookies_value, top_100_item_list)

    print(json.dumps(final_price_details_list))

if __name__ == '__main__':
    main()
