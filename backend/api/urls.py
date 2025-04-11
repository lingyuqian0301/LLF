from django.urls import path
from . import views

urlpatterns = [
    # Core Chat & Analysis Endpoints
    path('ask-gemini/', views.ask_gemini, name='ask_gemini'),
    path('analyze/', views.analyze, name='analyze'),
    
    # Data Insights Endpoints
    path('sales-trends/', views.sales_trends, name='sales_trends'),
    path('top-products/', views.top_products, name='top_products'),
    path('delivery-metrics/', views.delivery_metrics, name='delivery_metrics'),
    
    # Merchant-specific Endpoints
    path('merchant/<str:merchant_id>/performance/', views.merchant_performance, name='merchant_performance'),
    
    # Data Export Endpoints
    path('export/sales-report/', views.export_sales_report, name='export_sales_report'),
]