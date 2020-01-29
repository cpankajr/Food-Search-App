from django.db import models
from django.contrib import auth
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from django.conf import settings
from slugify import slugify

import sys
import json
import logging

class FoodSearchData(models.Model):

    unique_search_id = models.CharField(max_length=100)

    latitude = models.CharField(max_length=100)

    longitude = models.CharField(max_length=100)

    user_query = models.TextField(default="")

    item_data = models.TextField(default="[]")

    detailed_data = models.TextField(default="{}")

    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "FoodSearchData"
        verbose_name_plural = "FoodSearchDatas"

    def __str__(self):
        return self.unique_search_id
        