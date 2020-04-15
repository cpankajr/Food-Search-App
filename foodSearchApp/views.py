from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication   # noqa F401

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.conf import settings
from django.utils.encoding import smart_str

from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, HttpResponse, \
    HttpResponseRedirect
from django.contrib.auth.hashers import make_password
from django.views.decorators.clickjacking import xframe_options_exempt

import json
import datetime
import xlrd
import logging
import time
import uuid
import sys
import threading

from foodSearchApp.models import *
from foodSearchApp.utils import *

logger = logging.getLogger(__name__)

class CsrfExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return


def foodSearchAppHomePage(request):
    return render(request, 'foodSearchApp/home.html')

def foodSearchAppDisclaimerPage(request):
    return render(request, 'foodSearchApp/disclaimer.html')

def foodSearchAppTermPage(request):
    return render(request, 'foodSearchApp/term-of-use.html')

def foodSearchAppResultsPage(request):
    if True:
        unique_search_id = request.COOKIES.get('unique_search_id')
        latitude = request.COOKIES.get('user_latitude')
        longitude = request.COOKIES.get('user_longitude')
        final_food_detail_data = []
        page_no = 0
        user_query =  ""
        if (unique_search_id is not None) and (latitude is not None):
            try:
                user_query = FoodSearchData.objects.get(
                    unique_search_id=unique_search_id).user_query
            except:
                pass
            while len(final_food_detail_data)<6:
                page_no +=1
                food_detail_data, page_no, no_result_flag = get_food_detail_data(latitude, longitude, unique_search_id, page_no)
                if (no_result_flag):
                    break
                final_food_detail_data += food_detail_data

        # print(unique_search_id)
        print(final_food_detail_data)
        return render(request, 'foodSearchApp/results.html',{
            "food_detail_data": final_food_detail_data,
            "page_no": page_no,
            "user_query": user_query
            })
    else:
        return HttpResponseRedirect("/login")

class GetFoodListAPI(APIView):

    authentication_classes = (
        CsrfExemptSessionAuthentication, BasicAuthentication)

    def post(self, request, *args, **kwargs):

        response = {}
        response['status'] = 500
        try:

            data = request.data
            print(1234)
            user_query = data['user_query'].lower()

            latitude = float(data['latitude'])

            longitude = float(data['longitude'])

            page_no = int(data['page_no'])

            unique_search_id = data['unique_search_id']

            food_search_data, page_no, unique_search_id = get_food_search_data(
                unique_search_id, page_no, FoodSearchData, latitude, longitude, user_query)

            food_detail_data, page_no,no_result_flag = get_food_detail_data(latitude, longitude, unique_search_id, page_no)

            response['unique_search_id'] = unique_search_id
            response['page_no'] = page_no
            response['food_detail_data'] = food_detail_data
            response['no_result_flag'] = no_result_flag
            response['status'] = 200

        except Exception as e:  # noqa: F841
            exc_type, exc_obj, exc_tb = sys.exc_info()
            logger.error("GetFoodListAPI: %s at %s", e, str(exc_tb.tb_lineno))

        return Response(data=response)

GetFoodList = GetFoodListAPI.as_view()
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
