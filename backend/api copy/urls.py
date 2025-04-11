from django.urls import path
from . import views

urlpatterns = [
    path('ask-gemini/', views.ask_gemini, name='ask_gemini'),
]