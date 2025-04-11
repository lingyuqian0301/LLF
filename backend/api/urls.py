from django.urls import path
from . import views

urlpatterns = [
    # Core Chat & Analysis Endpoints
    path('ask-gemini/', views.ask_gemini, name='ask_gemini'),
]