from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from assistant.views import (
    SellerProfileViewSet, ProductViewSet, OrderViewSet,
    SalesAnalyticsViewSet, AnomalyViewSet
)

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'seller', SellerProfileViewSet, basename='seller')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'analytics', SalesAnalyticsViewSet, basename='analytics')
router.register(r'anomalies', AnomalyViewSet, basename='anomaly')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # API endpoints
    path('api-auth/', include('rest_framework.urls')),  # DRF browsable API auth
] 