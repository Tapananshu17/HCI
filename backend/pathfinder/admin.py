from django.contrib import admin
from .models import CustomUser, Assessment, TestResponse, ChatMessage

admin.site.register(CustomUser)
admin.site.register(Assessment)
admin.site.register(TestResponse)
admin.site.register(ChatMessage)


