from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class CustomUser(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    name = models.CharField(max_length=100)
    grade = models.CharField(max_length=20)
    age = models.IntegerField(blank=True, null=True)
    is_setup_complete = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
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

    class Meta:
        ordering = ['-started_at']
        unique_together = ('user', 'assessment_number')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['completed_at']),
        ]

    def mark_as_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

    def get_all_responses(self):
        return self.test_responses.all()
    
    def is_fully_completed(self):
        return self.test_responses.filter(is_completed=True).count() == 3
    
    def get_chat_history(self):
        """Returns all chat messages for this assessment, ordered by creation time."""
        return self.chat_messages.order_by('created_at').all()


class TestResponse(models.Model):
    TEST_TYPE_CHOICES = [
        ('aptitude', 'Aptitude'),
        ('values', 'Values'),
        ('personal', 'Personal'),
    ]
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='test_responses')
    test_type = models.CharField(max_length=20, choices=TEST_TYPE_CHOICES)
    
    responses = models.JSONField(default=dict)  # {question_id: answer_value}, questions live in frontend
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    current_question_index = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    last_saved_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['assessment', 'test_type']
        unique_together = ('assessment', 'test_type')
        indexes = [
            models.Index(fields=['assessment']),
            models.Index(fields=['test_type']),
        ]

    def get_progress_percentage(self):
        return int((self.current_question_index / self.total_questions) * 100) if self.total_questions else 0

    def is_test_complete(self):
        return self.is_completed

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
    created_at = models.DateTimeField(auto_now_add=True)
    is_results_chat = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['assessment', 'created_at']),
            models.Index(fields=['sender']),
        ]
