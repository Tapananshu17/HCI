from rest_framework import serializers
from .models import CustomUser, Assessment, TestResponse, ChatMessage


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'name', 'grade', 'age', 
                  'email', 'phone', 'is_setup_complete', 'created_at']
        read_only_fields = ['id', 'created_at']


class TestResponseSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = TestResponse
        fields = ['id', 'test_type', 'responses', 'started_at', 
                  'submitted_at', 'is_completed', 'current_question_index', 
                  'total_questions', 'last_saved_at', 'progress_percentage']
        read_only_fields = ['started_at', 'last_saved_at']
    
    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()


class AssessmentSerializer(serializers.ModelSerializer):
    test_responses = TestResponseSerializer(many=True, read_only=True)
    is_fully_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Assessment
        fields = ['id', 'assessment_number', 'status', 'started_at', 
                  'completed_at', 'test_responses', 'is_fully_completed']
        read_only_fields = ['started_at', 'completed_at']
    
    def get_is_fully_completed(self, obj):
        return obj.is_fully_completed()


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_text', 'sender', 'created_at', 'is_results_chat']
        read_only_fields = ['created_at']
