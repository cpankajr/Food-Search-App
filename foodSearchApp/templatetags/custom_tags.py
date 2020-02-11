from django import template
import re
register = template.Library()


@register.filter
def get_numric_value(string):
    try:
        return re.findall(r'\d+', string)[0]
    except Exception as e:
        return string


@register.filter
def get_img_src(vendor):
    
    if vendor == "swiggy":
        return "/files/images/swiggy.jpg"
    if vendor == "zomato":
        return "/files/images/zomato.png"
    if vendor == "u_eats":
        return "/files/images/uber_eats.png"


@register.filter
def get_total_price(food_detail_dict):
    vendor = food_detail_dict["vendor"]
    total_price = "NaN"

    if (vendor == "swiggy"):
        total_price = food_detail_dict['grand_total']

    if (vendor == "zomato"):
        total_price = str(food_detail_dict['total_price'])+"*"

    if (vendor == "u_eats"):
        total_price = food_detail_dict['grand_total']

    return total_price

@register.filter
def get_rating(rating_strg):
    try:
        return float(rating_strg)
    except Exception as e:
        return "NEW"

@register.filter
def get_rating_percentage(rating_strg):
    try:
        return (float(rating_strg)/float(5))*100
    except Exception as e:
        return 0

@register.filter
def truncatesmart(value, limit=80):
    try:
        limit = int(limit)
    except ValueError:
        return value

    if len(value) <= limit:
        return value

    value = value[:limit]

    words = value.split(' ')[:-1]

    return ' '.join(words) + '...'

@register.filter
def get_price_bifurcation(food_detail_dict):
    vendor = food_detail_dict["vendor"]
    total_price = ""

    if (vendor == "swiggy"):
        total_price = '<p><span>'
        total_price += "Item Price"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["menu_item_price"])
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Delivery Charges"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["delivery_charges"])
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Packaging Charges"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["total_packing_charges"])
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Tax"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["total_tax"])
        total_price += '</span></p>'
        
        total_price += '<p class="total-price-div"><span>'
        total_price += "Grand total"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["grand_total"])
        total_price += '</span></p>'

    if (vendor == "zomato"):
        charges_detail_dict = food_detail_dict["charges_detail_dict"]
        for key in charges_detail_dict:
            if key.lower() == "grand total":
                continue
            total_price += '</span></p>'
            total_price += '<p><span>'
            total_price += (key).title()
            total_price += '</span><span>'
            total_price += str(charges_detail_dict[key])
            total_price += '</span></p>'
        total_price += '<p class="total-price-div"><span>'
        total_price += "Grand total"
        total_price += '</span><span>'
        total_price += str(food_detail_dict['total_price'])
        total_price += '</span></p><p>*may have additional delivery charges</p>'

    if (vendor == "u_eats"):
        total_price = '<p><span>'
        total_price += "Item Price"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["menu_item_price"])
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Delivery Charges"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["delivery_charges"])
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Tax"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["total_tax"])
        total_price += '</span></p>'
        
        total_price += '<p class="total-price-div"><span>'
        total_price += "Grand total"
        total_price += '</span><span>'
        total_price += str(food_detail_dict["grand_total"])
        total_price += '</span></p>'
    return total_price


This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
This is line
