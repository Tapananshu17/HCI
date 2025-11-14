from rest_framework import serializers
from .models import (
    CustomUser, Assessment, TestResponse, 
    Question, QuestionAnswer, ChatMessage, 
    AssessmentResults, SavedProgress
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'name', 'grade', 'age', 
                  'email', 'phone', 'preferred_language', 
                  'is_setup_complete', 'created_at']
        read_only_fields = ['id', 'created_at']

class AssessmentSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Assessment
        fields = ['id', 'assessment_number', 'status', 'started_at', 
                  'completed_at', 'current_test_type', 'current_test_index', 
                  'completion_percentage', 'is_analyzed']
    
    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'test_type', 'question_number', 
                  'question_text_en', 'question_text_hi', 
                  'question_text_te', 'question_text_ta', 
                  'question_text_bn', 'question_text_gu', 
                  'question_type']

class QuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAnswer
        fields = ['id', 'question', 'answer_value', 'answer_index', 'answered_at']

class TestResponseSerializer(serializers.ModelSerializer):
    answers = QuestionAnswerSerializer(many=True, read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = TestResponse
        fields = ['id', 'test_type', 'started_at', 'submitted_at', 
                  'is_completed', 'current_question_index', 
                  'total_questions', 'answers', 'progress_percentage']
    
    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_text', 'sender', 'message_number', 
                  'created_at', 'language', 'is_results_chat']

class AssessmentResultsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResults
        fields = ['id', 'aptitude_score', 'values_score', 'personal_score', 
                  'recommended_streams', 'strengths', 'career_paths', 
                  'generated_at', 'last_viewed_at']

class SavedProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedProgress
        fields = ['saved_answers', 'last_saved_at', 'resume_from_question']
