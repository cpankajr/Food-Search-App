from django.conf.urls import url
from . import views
urlpatterns = [
    url(r'^$', views.foodSearchAppHomePage),
    url(r'^home/', views.foodSearchAppHomePage),
    url(r'^search-results/', views.foodSearchAppResultsPage),
    url(r'^get-food-list/', views.GetFoodList),
    url(r'^disclaimer/$', views.foodSearchAppDisclaimerPage),
    url(r'^term-of-use/$', views.foodSearchAppTermPage),
]
