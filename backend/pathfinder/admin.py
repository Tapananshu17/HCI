from django.contrib import admin
from .models import (
    CustomUser,
    Assessment,
    TestResponse,
    Question,
    QuestionAnswer,
    ChatMessage,
    AssessmentResults,
    SavedProgress,
)

admin.site.register(CustomUser)
admin.site.register(Assessment)
admin.site.register(TestResponse)
admin.site.register(Question)
admin.site.register(QuestionAnswer)
admin.site.register(ChatMessage)
admin.site.register(AssessmentResults)
admin.site.register(SavedProgress)

