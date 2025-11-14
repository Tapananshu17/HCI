from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import MaxValueValidator, MinValueValidator

class CustomUser(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    name = models.CharField(max_length=100)
    grade = models.CharField(max_length=20)
    age = models.IntegerField(blank=True, null=True)

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('te', 'Telugu'),
        ('ta', 'Tamil'),
        ('bn', 'Bengali'),
        ('gu', 'Gujarati'),
    ]
    preferred_language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default='en'
    )

    is_setup_complete = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['preferred_language']),
        ]

    def get_full_name(self):
        return self.name

    def get_progress_percentage(self):
        total = self.assessments.count()
        completed = self.assessments.filter(status='completed').count()
        return (completed / total * 100) if total > 0 else 0

    def get_latest_assessment(self):
        return self.assessments.order_by('-started_at').first()


class Assessment(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]

    TEST_TYPE_CHOICES = [
        ('aptitude', 'Aptitude'),
        ('values', 'Values'),
        ('personal', 'Personal'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='assessments')
    assessment_number = models.IntegerField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)

    current_test_type = models.CharField(max_length=20, choices=TEST_TYPE_CHOICES, null=True, blank=True)
    current_test_index = models.IntegerField(default=0)
    total_tests = models.IntegerField(default=3)

    is_analyzed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-started_at']
        unique_together = ('user', 'assessment_number')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['completed_at']),
        ]

    def get_completion_percentage(self):
        completed = self.test_responses.filter(is_completed=True).count()
        return int((completed / self.total_tests) * 100)

    def mark_as_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

    def get_all_responses(self):
        return self.test_responses.all()

    def generate_results(self):
        # Placeholder: integrate real logic later
        self.is_analyzed = True
        self.save()



class TestResponse(models.Model):
    TEST_TYPE_CHOICES = [
        ('aptitude', 'Aptitude'),
        ('values', 'Values'),
        ('personal', 'Personal'),
    ]

    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='test_responses')
    test_type = models.CharField(max_length=20, choices=TEST_TYPE_CHOICES)

    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    current_question_index = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)

    class Meta:
        ordering = ['assessment', 'test_type']
        unique_together = ('assessment', 'test_type')
        indexes = [
            models.Index(fields=['assessment']),
            models.Index(fields=['test_type']),
        ]

    def get_progress_percentage(self):
        return int((self.current_question_index / self.total_questions) * 100) if self.total_questions else 0

    def get_all_answers(self):
        return self.answers.all()

    def is_test_complete(self):
        return self.is_completed



class Question(models.Model):
    TEST_TYPE_CHOICES = [
        ('aptitude', 'Aptitude'),
        ('values', 'Values'),
        ('personal', 'Personal'),
    ]

    QUESTION_TYPE_CHOICES = [
        ('mcq', 'MCQ'),
        ('rating', 'Rating'),
        ('text', 'Text'),
    ]

    test_type = models.CharField(max_length=20, choices=TEST_TYPE_CHOICES)
    question_number = models.IntegerField()

    question_text_en = models.TextField()
    question_text_hi = models.TextField()
    question_text_te = models.TextField()
    question_text_ta = models.TextField()
    question_text_bn = models.TextField()
    question_text_gu = models.TextField()

    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='rating')
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['test_type', 'question_number']
        unique_together = ('test_type', 'question_number')
        indexes = [
            models.Index(fields=['test_type']),
            models.Index(fields=['is_active']),
        ]

    def get_question_text(self, language):
        return getattr(self, f"question_text_{language}", self.question_text_en)

    def get_options(self, language):
        # Placeholder for MCQ/Rating options in multiple languages
        return []


class QuestionAnswer(models.Model):
    test_response = models.ForeignKey(TestResponse, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.PROTECT)

    answer_value = models.CharField(max_length=500)
    answer_index = models.IntegerField(null=True, blank=True)

    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['test_response', 'question']
        unique_together = ('test_response', 'question')
        indexes = [
            models.Index(fields=['test_response']),
            models.Index(fields=['question']),
        ]

    def get_score(self):
        if self.answer_index is not None:
            return int(self.answer_index)
        return 0



class ChatMessage(models.Model):
    SENDER_CHOICES = [
        ('user', 'User'),
        ('bot', 'Bot'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_messages')
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_messages'
    )

    message_text = models.TextField()
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message_number = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    LANGUAGE_CHOICES = CustomUser.LANGUAGE_CHOICES
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)

    is_results_chat = models.BooleanField(default=False)

    class Meta:
        ordering = ['user', 'created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['assessment']),
            models.Index(fields=['created_at']),
            models.Index(fields=['sender']),
        ]

    def get_bot_response(self):
        return "Response not implemented yet."


class AssessmentResults(models.Model):
    assessment = models.OneToOneField(Assessment, on_delete=models.CASCADE, related_name='results')

    aptitude_score = models.JSONField(default=dict)
    values_score = models.JSONField(default=dict)
    personal_score = models.JSONField(default=dict)

    recommended_streams = models.JSONField(default=list)
    strengths = models.JSONField(default=list)
    career_paths = models.JSONField(default=list)

    generated_at = models.DateTimeField(auto_now_add=True)
    last_viewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['assessment']),
        ]

    def get_top_stream(self):
        if not self.recommended_streams:
            return None
        return max(self.recommended_streams, key=lambda x: x.get("score", 0))

    def generate_summary(self, language='en'):
        return {"summary": "Summary generation not implemented"}

    def get_detailed_report(self, language='en'):
        return {"report": "Detailed report not implemented"}


class SavedProgress(models.Model):
    test_response = models.OneToOneField(TestResponse, on_delete=models.CASCADE, related_name='saved_progress')

    saved_answers = models.JSONField(default=dict)
    last_saved_at = models.DateTimeField(auto_now=True)

    resume_from_question = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['test_response']),
        ]

    def can_resume(self):
        return self.resume_from_question > 0

    def get_completion_percentage(self):
        total = self.test_response.total_questions
        answered = len(self.saved_answers)
        return int((answered / total) * 100) if total else 0

