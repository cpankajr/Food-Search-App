from django.contrib import admin
from django.contrib.auth.models import Group
from django.utils.safestring import mark_safe
from django.urls import reverse

from foodSearchApp.models import *

admin.site.register(FoodSearchData)