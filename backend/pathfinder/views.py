from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import CustomUser, Assessment, TestResponse, ChatMessage
from .serializers import UserSerializer, AssessmentSerializer, TestResponseSerializer, ChatMessageSerializer
#from .utils import generate_bot_response

class SetupAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        name = request.data.get('name')
        grade = request.data.get('grade')
        age = request.data.get('age')
        # Validate required fields
        if not all([username, password, name, grade]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user = CustomUser.objects.create_user(
            username=username, password=password, name=name, grade=grade, age=age, is_setup_complete=True)
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)
        return Response({
            'user': user_serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        user_serializer = UserSerializer(user)
        return Response({
            'user': user_serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'success': True, 'message': 'Logged out successfully'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class HomeAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        user_serializer = UserSerializer(user)
        saved_assessment = Assessment.objects.filter(user=user, status='in_progress').first()
        saved_assessment_data = AssessmentSerializer(saved_assessment).data if saved_assessment else None
        completed_assessments = Assessment.objects.filter(user=user, status='completed')
        completed_serializer = AssessmentSerializer(completed_assessments, many=True)
        total_assessments = Assessment.objects.filter(user=user).count()
        completed_count = completed_assessments.count()
        completion_percentage = (completed_count / total_assessments * 100) if total_assessments > 0 else 0
        return Response({
            'user_profile': user_serializer.data,
            'saved_assessment': saved_assessment_data,
            'completed_assessments': completed_serializer.data,
            'completion_stats': {
                'total_assessments': total_assessments,
                'completed_percentage': round(completion_percentage, 2)
            }
        })

class ChatbotMessageAPIView(APIView):
    """Send message to chatbot and get response"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        message_text = request.data.get('message')
        assessment_id = request.data.get('assessment_id')
        
        if not message_text:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get assessment context if provided
        assessment = None
        if assessment_id:
            assessment = Assessment.objects.filter(
                id=assessment_id, 
                user=user
            ).first()
        
        # Save user message
        user_message = ChatMessage.objects.create(
            user=user,
            assessment=assessment,
            message_text=message_text,
            sender='user',
            is_results_chat=bool(assessment_id)
        )
        
        # Generate bot response
        # bot_response_text = generate_bot_response(
        #     message=message_text,
        #     language='en',
        #     context={'assessment': assessment, 'user': user}
        # )
        
        # Save bot message
        bot_message = ChatMessage.objects.create(
            user=user,
            assessment=assessment,
            message_text=bot_response_text,
            sender='bot',
            is_results_chat=bool(assessment_id)
        )
        
        return Response({
            'bot_message': bot_response_text
        })


class ChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        assessment_id = request.query_params.get('assessment_id')
        messages = ChatMessage.objects.filter(user=user)
        if assessment_id:
            messages = messages.filter(assessment_id=assessment_id)
        messages = messages.order_by('created_at')[:50]
        serializer = ChatMessageSerializer(messages, many=True)
        return Response({'messages': serializer.data})

class StartAssessmentAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        existing_assessment = Assessment.objects.filter(user=user, status='in_progress').first()
        if existing_assessment:
            first_test_type = existing_assessment.test_responses.order_by('test_type').first().test_type
            return Response({
                'assessment_id': existing_assessment.id,
                'first_test_type': first_test_type,
                'redirect_url': f'/assessment/test/{first_test_type}/'
            })
        assessment_number = Assessment.objects.filter(user=user).count() + 1
        assessment = Assessment.objects.create(
            user=user, assessment_number=assessment_number, status='in_progress'
        )
        TestResponse.objects.create(
            assessment=assessment,
            test_type='aptitude',
            total_questions=request.data.get('aptitude_total_questions', 0)
        )
        return Response({
            'assessment_id': assessment.id,
            'first_test_type': 'aptitude',
            'redirect_url': '/assessment/test/aptitude/'
        }, status=status.HTTP_201_CREATED)

class GetTestResponseAPIView(APIView):
    """Get user's answers and progress for a specific test section."""
    permission_classes = [IsAuthenticated]
    def get(self, request, assessment_id, test_type):
        user = request.user
        if test_type not in ['aptitude', 'values', 'personal']:
            return Response({'error': 'Invalid test type'}, status=status.HTTP_400_BAD_REQUEST)
        assessment = get_object_or_404(Assessment, id=assessment_id, user=user)
        test_response, _ = TestResponse.objects.get_or_create(
            assessment=assessment, test_type=test_type)
        serializer = TestResponseSerializer(test_response)
        return Response(serializer.data)

class SaveTestProgressAPIView(APIView):
    """Save test progress (auto-save)"""
    permission_classes = [IsAuthenticated]
    def post(self, request):
        test_response_id = request.data.get('test_response_id')
        answers = request.data.get('answers', {})
        current_question_index = request.data.get('current_question_index', 0)
        if not test_response_id:
            return Response({'error': 'test_response_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        test_response = get_object_or_404(
            TestResponse, id=test_response_id, assessment__user=request.user)
        test_response.responses = answers
        test_response.current_question_index = current_question_index
        test_response.last_saved_at = timezone.now()
        test_response.save()
        return Response({'success': True, 'saved_at': test_response.last_saved_at})

class SubmitTestAPIView(APIView):
    """Submit completed test and move to next test"""
    permission_classes = [IsAuthenticated]
    def post(self, request):
        test_response_id = request.data.get('test_response_id')
        answers = request.data.get('answers', {})
        if not test_response_id or not answers:
            return Response({'error': 'test_response_id and answers are required'}, status=status.HTTP_400_BAD_REQUEST)
        test_response = get_object_or_404(TestResponse, id=test_response_id, assessment__user=request.user)
        test_response.responses = answers
        test_response.is_completed = True
        test_response.submitted_at = timezone.now()
        test_response.save()
        assessment = test_response.assessment
        test_order = ['aptitude', 'values', 'personal']
        current_index = test_order.index(test_response.test_type)
        if current_index < 2:
            next_test_type = test_order[current_index + 1]
            TestResponse.objects.get_or_create(
                assessment=assessment, test_type=next_test_type,
                defaults={'total_questions': request.data.get('total_questions', 0)}
            )
            return Response({'success': True, 'next_test_type': next_test_type, 'redirect_url': f'/assessment/test/{next_test_type}/'})
        else:
            assessment.mark_as_completed()
            return Response({'success': True, 'next_test_type': None, 'redirect_url': f'/assessment/processing/{assessment.id}/'})

class AssessmentHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        assessments = Assessment.objects.filter(user=user, status='completed').order_by('-completed_at')
        assessments_data = AssessmentSerializer(assessments, many=True).data
        return Response({'completed_assessments': assessments_data})

class AssessmentResponsesAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, assessment_id):
        assessment = get_object_or_404(Assessment, id=assessment_id, user=request.user)
        test_responses = TestResponse.objects.filter(assessment=assessment, is_completed=True)
        responses_data = []
        for test_response in test_responses:
            responses_data.append({
                'test_type': test_response.test_type,
                'answers': test_response.responses
            })
        return Response({
            'assessment': AssessmentSerializer(assessment).data,
            'test_responses': responses_data
        })

class UpdateProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request):
        user = request.user
        allowed_fields = ['name', 'grade', 'age', 'email', 'phone']
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        user_serializer = UserSerializer(user)
        return Response({'success': True, 'user': user_serializer.data})

class DeleteAccountAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'success': True, 'message': 'Account deleted successfully'})
