from django.urls import path
from .views import *

urlpatterns = [
    # Authentication endpoints
    path('auth/setup/', SetupAPIView.as_view(), name='setup'),
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('auth/logout/', LogoutAPIView.as_view(), name='logout'),
    
    # Home/Dashboard
    path('home/', HomeAPIView.as_view(), name='home'),
    
    # Chatbot endpoints
    path('chatbot/message/', ChatbotMessageAPIView.as_view(), name='chatbot-message'),
    path('chatbot/history/', ChatHistoryAPIView.as_view(), name='chatbot-history'),
    
    # Assessment endpoints
    path('assessment/start/', StartAssessmentAPIView.as_view(), name='start-assessment'),
    path('assessment/<int:assessment_id>/test/<str:test_type>/', GetTestResponseAPIView.as_view(), name='get-test'),
    path('assessment/save-progress/', SaveTestProgressAPIView.as_view(), name='save-progress'),
    path('assessment/submit-test/', SubmitTestAPIView.as_view(), name='submit-test'),
    
    # History and profile endpoints
    path('assessment/history/', AssessmentHistoryAPIView.as_view(), name='assessment-history'),
    path('assessment/<int:assessment_id>/responses/', AssessmentResponsesAPIView.as_view(), name='assessment-responses'),
    path('profile/update/', UpdateProfileAPIView.as_view(), name='update-profile'),
    path('profile/delete/', DeleteAccountAPIView.as_view(), name='delete-account'),
]
