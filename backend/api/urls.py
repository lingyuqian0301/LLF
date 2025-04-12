from django.urls import path
from . import views

urlpatterns = [
    path('ask-gemini/', views.ask_gemini),
    path('merchant/<str:merchant_id>/top-selling-items/', views.top_selling_items_view),
    path('merchant/<str:merchant_id>/least-selling-items/', views.least_selling_items_view),
    path('merchant/<str:merchant_id>/popular-order-hours/', views.popular_hours_view),
    path('merchant/<str:merchant_id>/popular-order-days/', views.popular_days_view),
    path('merchant/<str:merchant_id>/average-basket-size/', views.average_basket_size_view),
    path('merchant/<str:merchant_id>/average-order-value/', views.average_order_value_view),
    path('merchant/<str:merchant_id>/average-delivery-time/', views.average_delivery_time_view),
    # enhanced_keyword_recommendations
    path('merchant/<str:merchant_id>/enhanced-keyword-recommendations/', views.enhanced_keyword_recommendations_view),
]
