"""
URL configuration for webapp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from pathfinder.views import (
    # Auth
    SetupAPIView, LoginAPIView, LogoutAPIView,
    # Main
    HomeAPIView, ChatbotMessageAPIView, ChatHistoryAPIView,
    # Assessment
    StartAssessmentAPIView, GetTestQuestionsAPIView,
    SaveTestProgressAPIView, SubmitTestAPIView,
    ProcessingStatusAPIView, GetResultsAPIView,
    # History & Profile
    AssessmentHistoryAPIView, AssessmentResponsesAPIView,
    UpdateProfileAPIView, DeleteAccountAPIView, UpdateLanguageAPIView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/setup/', SetupAPIView.as_view(), name='api_setup'),
    path('api/auth/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/auth/logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Main application endpoints
    path('api/home/', HomeAPIView.as_view(), name='api_home'),
    path('api/chatbot/message/', ChatbotMessageAPIView.as_view(), name='api_chatbot_message'),
    path('api/chatbot/history/', ChatHistoryAPIView.as_view(), name='api_chatbot_history'),
    
    # Assessment endpoints
    path('api/assessment/start/', StartAssessmentAPIView.as_view(), name='api_start_assessment'),
    path('api/assessment/test/<str:test_type>/', GetTestQuestionsAPIView.as_view(), name='api_test_questions'),
    path('api/assessment/save/', SaveTestProgressAPIView.as_view(), name='api_save_progress'),
    path('api/assessment/submit/', SubmitTestAPIView.as_view(), name='api_submit_test'),
    path('api/assessment/processing-status/<int:assessment_id>/', ProcessingStatusAPIView.as_view(), name='api_processing_status'),
    path('api/assessment/results/<int:assessment_id>/', GetResultsAPIView.as_view(), name='api_results'),
    
    # History & Profile endpoints
    path('api/assessment/history/', AssessmentHistoryAPIView.as_view(), name='api_history'),
    path('api/assessment/responses/<int:assessment_id>/', AssessmentResponsesAPIView.as_view(), name='api_responses'),
    path('api/profile/update/', UpdateProfileAPIView.as_view(), name='api_update_profile'),
    path('api/profile/delete/', DeleteAccountAPIView.as_view(), name='api_delete_account'),
    path('api/profile/language/', UpdateLanguageAPIView.as_view(), name='api_update_language'),
]
