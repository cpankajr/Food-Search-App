# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2019-12-28 21:14
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('foodSearchApp', '0002_auto_20191229_0148'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='foodsearchdata',
            name='detailed_data',
        ),
    ]
