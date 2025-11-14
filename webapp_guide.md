---

PATHFINDER DJANGO WEB APPLICATION ARCHITECTURE

---

1. DJANGO MODELS (models.py)

1.1 User Model
Class: `CustomUser` (extends Django's AbstractUser)
Fields:
`id` - AutoField (Primary Key)
`username` - CharField (inherited, unique)
`email` - EmailField (optional, for notifications)
`phone` - CharField (max_length=15, optional)
`name` - CharField (max_length=100, student's full name)
`grade` - CharField (max_length=20, e.g., "10th")
`age` - IntegerField (optional)
`preferred_language` - CharField (max_length=2, choices=['en', 'hi', 'te', 'ta', 'bn', 'gu'], default='en')
`is_setup_complete` - BooleanField (default=False)
`created_at` - DateTimeField (auto_now_add=True)
`updated_at` - DateTimeField (auto_now=True)
`last_login` - DateTimeField (auto, inherited)

Meta:
ordering = ['-created_at']
indexes on username, email, preferred_language

Methods:
`get_full_name()` - returns name
`get_progress_percentage()` - calculates overall assessment completion
`get_latest_assessment()` - returns most recent assessment

---

1.2 Assessment Model
Class: `Assessment`
Fields:
`id` - AutoField (Primary Key)
`user` - ForeignKey(CustomUser, on_delete=CASCADE, related_name='assessments')
`assessment_number` - IntegerField (auto-incremented per user)
`status` - CharField(max_length=20, choices=['in_progress', 'completed', 'abandoned'], default='in_progress')
`started_at` - DateTimeField (auto_now_add=True)
`completed_at` - DateTimeField (null=True, blank=True)
`last_accessed_at` - DateTimeField (auto_now=True)
`current_test_type` - CharField(max_length=20, choices=['aptitude', 'values', 'personal'], null=True)
`current_test_index` - IntegerField (default=0, tracks which test in sequence)
`total_tests` - IntegerField (default=3)
`is_analyzed` - BooleanField (default=False)

Meta:
ordering = ['-started_at']
unique_together = ['user', 'assessment_number']
indexes on user, status, completed_at

Methods:
`get_completion_percentage()` - calculates % complete
`mark_as_completed()` - sets status and completion timestamp
`get_all_responses()` - returns all test responses
`generate_results()` - triggers analysis algorithm

---

1.3 TestResponse Model
Class: `TestResponse`
Fields:
`id` - AutoField (Primary Key)
`assessment` - ForeignKey(Assessment, on_delete=CASCADE, related_name='test_responses')
`test_type` - CharField(max_length=20, choices=['aptitude', 'values', 'personal'])
`started_at` - DateTimeField (auto_now_add=True)
`submitted_at` - DateTimeField (null=True, blank=True)
`is_completed` - BooleanField (default=False)
`current_question_index` - IntegerField (default=0)
`total_questions` - IntegerField (default varies by test type)

Meta:
ordering = ['assessment', 'test_type']
unique_together = ['assessment', 'test_type']
indexes on assessment, test_type

Methods:
`get_progress_percentage()` - based on answered questions
`get_all_answers()` - returns all QuestionAnswer objects
`is_test_complete()` - checks if all questions answered

---

1.4 Question Model
Class: `Question`
Fields:
`id` - AutoField (Primary Key)
`test_type` - CharField(max_length=20, choices=['aptitude', 'values', 'personal'])
`question_number` - IntegerField (1-15 for aptitude, etc.)
`question_text_en` - TextField
`question_text_hi` - TextField
`question_text_te` - TextField
`question_text_ta` - TextField
`question_text_bn` - TextField
`question_text_gu` - TextField
`question_type` - CharField(max_length=20, choices=['mcq', 'rating', 'text'], default='rating')
`is_active` - BooleanField (default=True)
`created_at` - DateTimeField (auto_now_add=True)

Meta:
ordering = ['test_type', 'question_number']
unique_together = ['test_type', 'question_number']
indexes on test_type, is_active

Methods:
`get_question_text(language)` - returns question in specified language
`get_options(language)` - returns answer options in specified language

---

1.5 QuestionAnswer Model
Class: `QuestionAnswer`
Fields:
`id` - AutoField (Primary Key)
`test_response` - ForeignKey(TestResponse, on_delete=CASCADE, related_name='answers')
`question` - ForeignKey(Question, on_delete=PROTECT)
`answer_value` - CharField(max_length=500, stores selected option or text)
`answer_index` - IntegerField (0-4 for rating scale, null for text)
`answered_at` - DateTimeField (auto_now=True)

Meta:
ordering = ['test_response', 'question']
unique_together = ['test_response', 'question']
indexes on test_response, question

Methods:
`get_score()` - converts answer to numeric score for analysis

---

1.6 ChatMessage Model
Class: `ChatMessage`
Fields:
`id` - AutoField (Primary Key)
`user` - ForeignKey(CustomUser, on_delete=CASCADE, related_name='chat_messages')
`assessment` - ForeignKey(Assessment, on_delete=SET_NULL, null=True, blank=True, related_name='chat_messages')
`message_text` - TextField
`sender` - CharField(max_length=10, choices=['user', 'bot'])
`message_number` - IntegerField (auto-incremented per user session)
`created_at` - DateTimeField (auto_now_add=True)
`language` - CharField(max_length=2, choices=['en', 'hi', 'te', 'ta', 'bn', 'gu'])
`is_results_chat` - BooleanField (default=False, indicates post-assessment chat)

Meta:
ordering = ['user', 'created_at']
indexes on user, assessment, created_at, sender

Methods:
`get_bot_response()` - generates contextual bot response

---

1.7 AssessmentResults Model
Class: `AssessmentResults`
Fields:
`id` - AutoField (Primary Key)
`assessment` - OneToOneField(Assessment, on_delete=CASCADE, related_name='results')
`aptitude_score` - JSONField (stores scores by category: analytical, technical, creative, etc.)
`values_score` - JSONField (stores values assessment results)
`personal_score` - JSONField (stores personality trait scores)
`recommended_streams` - JSONField (array of recommended streams with scores)
`strengths` - JSONField (array of identified strengths)
`career_paths` - JSONField (array of suggested career paths)
`generated_at` - DateTimeField (auto_now_add=True)
`last_viewed_at` - DateTimeField (null=True, blank=True)

Meta:
ordering = ['-generated_at']
indexes on assessment

Methods:
`get_top_stream()` - returns highest recommended stream
`generate_summary(language)` - creates localized summary
`get_detailed_report(language)` - full report in specified language

---

1.8 SavedProgress Model
Class: `SavedProgress`
Fields:
`id` - AutoField (Primary Key)
`test_response` - OneToOneField(TestResponse, on_delete=CASCADE, related_name='saved_progress')
`saved_answers` - JSONField (dictionary of question_id: answer_value)
`last_saved_at` - DateTimeField (auto_now=True)
`resume_from_question` - IntegerField (default=0)

Meta:
indexes on test_response

Methods:
`can_resume()` - checks if progress is resumable
`get_completion_percentage()` - calculates saved progress

---

2. DJANGO VIEWS & URL ROUTES

2.1 Authentication Views

SetupView (Class-Based View - CreateView)
URL: `/setup/` or `/register/`
Template: Uses React component `SetupPage.tsx`
Methods:
`GET`: Renders setup page
`POST`: Creates new user account with initial profile data
Data Handling:
Validates username uniqueness
Creates CustomUser with profile data
Sets `is_setup_complete = True`
Creates session with user_id
Returns success JSON or renders home page
Authentication: AllowAny (unauthenticated)

LoginView (Django auth LoginView)
URL: `/login/`
Template: Custom React login form (to be created)
Methods:
`GET`: Renders login page
`POST`: Authenticates user credentials
Data Handling:
Validates credentials
Creates session
Redirects to `/home/`
Authentication: AllowAny

LogoutView (Django auth LogoutView)
URL: `/logout/`
Methods:
`POST`: Destroys session, redirects to setup
Authentication: LoginRequired

---

2.2 Main Application Views

HomeView (TemplateView)
URL: `/home/` or `/`
Template: `HomePage.tsx`
Methods:
`GET`: Renders home page with user context
Context Data:
`user_profile`: User object serialized to JSON
`saved_assessment`: Current in-progress assessment (if any)
`completed_assessments`: List of completed assessments
`completion_stats`: Overall progress statistics
Authentication: LoginRequired

ChatbotView (TemplateView with AJAX endpoints)
URL: `/chatbot/`
Template: `ChatbotPage.tsx`
Methods:
`GET`: Renders chatbot interface
Context Data:
`user_profile`: User object
`show_results`: Boolean flag (from query param)
`message_history`: Previous chat messages (limited to last session)
`message_count`: Count of messages in current session
Authentication: LoginRequired

ChatbotAPIView (APIView for AJAX)
URL: `/api/chatbot/message/`
Methods:
`POST`: Receives user message, generates bot response
Request Data:
`message`: User's message text
`language`: Current language preference
`assessment_id`: Optional, for context
Response Data:
`bot_message`: Generated response
`message_count`: Updated count
`limit_reached`: Boolean (true if 5 messages sent)
Authentication: LoginRequired

---

2.3 Assessment Views

TestSelectionView (TemplateView)
URL: `/assessment/select/` or `/test-selection/`
Template: `TestSelectionPage.tsx` (if you have one) or redirects to start
Methods:
`GET`: Shows test selection/information
`POST`: Creates new Assessment and redirects to first test
Context Data:
`user_profile`: User object
`test_types`: List of available tests with descriptions
Authentication: LoginRequired

TestFormView (TemplateView)
URL: `/assessment/test/<str:test_type>/`
Template: `TestFormPage.tsx`
Methods:
`GET`: Renders test form with questions
Context Data:
`user_profile`: User object
`test_type`: 'aptitude', 'values', or 'personal'
`questions`: List of questions for this test (all languages)
`current_test_index`: Position in test flow
`total_tests`: Total number of tests
`saved_answers`: Previously saved answers (if resuming)
Authentication: LoginRequired

SaveTestProgressAPIView (APIView)
URL: `/api/assessment/save/`
Methods:
`POST`: Saves current test progress
Request Data:
`test_response_id`: ID of TestResponse
`answers`: Dictionary of question_id: answer_value
`current_question_index`: Current position
Response Data:
`success`: Boolean
`saved_at`: Timestamp
Authentication: LoginRequired

SubmitTestAPIView (APIView)
URL: `/api/assessment/submit/`
Methods:
`POST`: Submits completed test, moves to next or processing
Request Data:
`test_response_id`: ID of TestResponse
`answers`: Complete dictionary of all answers
Response Data:
`success`: Boolean
`next_test_type`: Next test to take (or null if all complete)
`redirect_url`: URL to navigate to
Logic:
Saves all QuestionAnswer objects
Marks TestResponse as completed
If all tests done, creates AssessmentResults and redirects to processing
Otherwise, creates next TestResponse and returns next test URL
Authentication: LoginRequired

---

2.4 Processing & Results Views

ProcessingView (TemplateView)
URL: `/assessment/processing/<int:assessment_id>/`
Template: `ProcessingPage.tsx`
Methods:
`GET`: Renders processing animation page
Context Data:
`user_profile`: User object
`assessment_id`: Current assessment being processed
`processing_stages`: Localized stage descriptions
Background Task: Triggers async analysis task
Authentication: LoginRequired

ProcessingStatusAPIView (APIView)
URL: `/api/assessment/processing-status/<int:assessment_id>/`
Methods:
`GET`: Returns current processing status
Response Data:
`status`: 'processing', 'completed', 'error'
`current_stage`: Integer (1-5)
`redirect_url`: URL when complete
Authentication: LoginRequired

ResultsRedirectView (RedirectView)
URL: `/assessment/results/<int:assessment_id>/`
Methods:
`GET`: Redirects to chatbot with results flag
Redirect: `/chatbot/?show_results=true&assessment_id=<id>`
Authentication: LoginRequired

---

2.5 History & Profile Views

AssessmentHistoryView (TemplateView)
URL: `/assessment/history/` or `/previous-assessments/`
Template: `AssessmentHistoryPage.tsx`
Methods:
`GET`: Shows list of completed assessments
Context Data:
`user_profile`: User object
`completed_assessments`: QuerySet of completed Assessment objects with results
Authentication: LoginRequired

AssessmentResponsesView (TemplateView)
URL: `/assessment/responses/<int:assessment_id>/`
Template: `AssessmentResponsesPage.tsx`
Methods:
`GET`: Shows detailed responses for a specific assessment
Context Data:
`user_profile`: User object
`assessment`: Assessment object
`test_responses`: All TestResponse objects with answers
`results_summary`: Summary of results
Authentication: LoginRequired (must own assessment)

SettingsView (TemplateView with form handling)
URL: `/settings/`
Template: `SettingsPage.tsx`
Methods:
`GET`: Renders settings page
`POST`: Updates user profile
Context Data:
`user_profile`: User object
Form Fields: name, grade, age, email, phone, password, language
Authentication: LoginRequired

UpdateProfileAPIView (APIView)
URL: `/api/profile/update/`
Methods:
`POST`: Updates user profile fields
Request Data:
Fields to update (partial allowed)
Response Data:
`success`: Boolean
`updated_profile`: Serialized user data
Authentication: LoginRequired

DeleteAccountAPIView (APIView)
URL: `/api/profile/delete/`
Methods:
`DELETE`: Permanently deletes user account
Response Data:
`success`: Boolean
`redirect_url`: Setup page URL
Authentication: LoginRequired

---

3. URL CONFIGURATION (urls.py)

```
urlpatterns = [
    # Authentication
    path('setup/', SetupView.as_view(), name='setup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Main pages
    path('', HomeView.as_view(), name='home'),
    path('home/', HomeView.as_view(), name='home_alt'),
    path('chatbot/', ChatbotView.as_view(), name='chatbot'),
    path('settings/', SettingsView.as_view(), name='settings'),
    
    # Assessment flow
    path('assessment/start/', TestSelectionView.as_view(), name='start_assessment'),
    path('assessment/test/<str:test_type>/', TestFormView.as_view(), name='test_form'),
    path('assessment/processing/<int:assessment_id>/', ProcessingView.as_view(), name='processing'),
    path('assessment/results/<int:assessment_id>/', ResultsRedirectView.as_view(), name='results'),
    
    # History
    path('assessment/history/', AssessmentHistoryView.as_view(), name='assessment_history'),
    path('assessment/responses/<int:assessment_id>/', AssessmentResponsesView.as_view(), name='assessment_responses'),
    
    # API endpoints
    path('api/chatbot/message/', ChatbotAPIView.as_view(), name='api_chatbot'),
    path('api/assessment/save/', SaveTestProgressAPIView.as_view(), name='api_save_progress'),
    path('api/assessment/submit/', SubmitTestAPIView.as_view(), name='api_submit_test'),
    path('api/assessment/processing-status/<int:assessment_id>/', ProcessingStatusAPIView.as_view(), name='api_processing_status'),
    path('api/profile/update/', UpdateProfileAPIView.as_view(), name='api_update_profile'),
    path('api/profile/delete/', DeleteAccountAPIView.as_view(), name='api_delete_account'),
    path('api/language/update/', UpdateLanguageAPIView.as_view(), name='api_update_language'),
]
```

---

5. ADDITIONAL DJANGO COMPONENTS NEEDED

5.1 Serializers (serializers.py)
Using Django REST Framework serializers:

UserProfileSerializer - Serializes CustomUser for frontend
AssessmentSerializer - Serializes Assessment objects
TestResponseSerializer - Serializes TestResponse with nested answers
QuestionSerializer - Serializes questions with all translations
ChatMessageSerializer - Serializes chat messages
AssessmentResultsSerializer - Serializes results with recommendations

5.2 Custom Middleware

LanguagePreferenceMiddleware
Checks user's `preferred_language` from database
Sets Django's language for the session
Ensures consistent language across all pages

AssessmentSessionMiddleware
Tracks current active assessment in session
Prevents multiple simultaneous assessments
Handles assessment timeout/expiry

5.3 Management Commands

load_questions.py
Command: `python manage.py load_questions`
Loads all predefined questions into database
Populates Question model with multilingual content

generate_test_data.py
Command: `python manage.py generate_test_data`
Creates sample users and assessments for testing

5.4 Signals (signals.py)

post_save signal on Assessment
When status changes to 'completed', triggers result generation
Sends notification (if email provided)

post_save signal on CustomUser
When created, initializes default preferences
Creates welcome chat message from bot

5.5 Utility Functions (utils.py)

generate_bot_response(message, language, context)
Analyzes user message
Returns appropriate bot response in specified language
Uses keyword matching and context awareness

calculate_assessment_scores(assessment_id)
Processes all test responses
Calculates scores for each category
Generates stream recommendations
Creates AssessmentResults object

get_career_recommendations(scores_dict, language)
Takes calculated scores
Returns personalized career paths
Localized to specified language

5.6 Settings Configuration (settings.py)

Additional Settings:
```python
Language settings
LANGUAGES = [
    ('en', 'English'),
    ('hi', 'Hindi'),
    ('te', 'Telugu'),
    ('ta', 'Tamil'),
    ('bn', 'Bengali'),
    ('gu', 'Gujarati'),
]
LANGUAGE_CODE = 'en'
USE_I18N = True
USE_L10N = True

Session settings
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = True

Assessment settings
ASSESSMENT_TIMEOUT_DAYS = 30

Static and media files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'frontend/build/static']
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

5.7 Admin Configuration (admin.py)

Register all models with customized admin interfaces:
CustomUserAdmin - User management with filters
AssessmentAdmin - View assessments with inline test responses
QuestionAdmin - Manage questions with multilingual fields
ChatMessageAdmin - View chat histories
AssessmentResultsAdmin - View generated results

---

6. FRONTEND-BACKEND INTEGRATION

6.1 React Build Process
Use Webpack/Vite to bundle .tsx files
Output separate bundles for each page component
Place bundles in `static/js/` directory
Django serves these as static files

6.2 State Management
Server-Side Rendering (SSR) of Initial State:
Django views pass initial data via `window.INITIAL_STATE`
React components read this on mount
Example:
  ```javascript
  const initialState = window.INITIAL_STATE || {};
  const [userProfile, setUserProfile] = useState(initialState.user_profile);
  ```

Client-Side State Updates:
User interactions make AJAX calls to Django API endpoints
React updates local state
For navigation, use browser history or Django redirects

6.3 API Communication
All .tsx components use `fetch()` or `axios` for API calls
Include CSRF token from Django in all POST requests
Django returns JSON responses
Frontend handles loading states and errors

6.4 Language Persistence
When user changes language in LanguageSelector:
React calls `/api/language/update/` endpoint
Django updates `preferred_language` in database
Django sets session language
Page reloads or state updates with new language

---

7. DATABASE SCHEMA RELATIONSHIPS

Relationships Summary:
```
CustomUser
├── 1:Many → Assessment
│   ├── 1:Many → TestResponse
│   │   └── 1:Many → QuestionAnswer (links to Question)
│   ├── 1:1 → AssessmentResults
│   └── 1:Many → ChatMessage
└── 1:Many → ChatMessage

Question
└── 1:Many → QuestionAnswer

TestResponse
└── 1:1 → SavedProgress
```

---

8. WORKFLOW EXAMPLE: COMPLETING AN ASSESSMENT

User clicks "Start Assessment" on HomePage
Frontend: Button onClick calls `startAssessmentFlow()`
Backend: POST to `/assessment/start/` creates Assessment object
Backend: Creates first TestResponse (aptitude)
Backend: Redirects to `/assessment/test/aptitude/`

User completes aptitude test
Frontend: TestFormPage.tsx renders with questions
Frontend: User selects answers, state managed in React
Frontend: Clicks "Save Progress" → POST to `/api/assessment/save/`
Backend: Saves answers in SavedProgress
Frontend: Clicks "Submit" → POST to `/api/assessment/submit/`
Backend: Creates QuestionAnswer objects, marks TestResponse complete
Backend: Creates next TestResponse (values), returns redirect URL
Frontend: Navigates to `/assessment/test/values/`

User completes all three tests
Backend: On final submit, sets Assessment status='completed'
Backend: Redirects to `/assessment/processing/<id>/`
Frontend: ProcessingPage.tsx shows animated stages
Frontend: Polls `/api/assessment/processing-status/<id>/` every 2 seconds
Backend: Async task runs `calculate_assessment_scores()`
Backend: Creates AssessmentResults with recommendations
Backend: Returns status='completed' with redirect URL
Frontend: Navigates to `/chatbot/?show_results=true&assessment_id=<id>`

User views results in chatbot
Frontend: ChatbotPage.tsx shows results message
User can ask up to 5 questions
Each message POSTs to `/api/chatbot/message/`
Backend generates contextual responses using assessment results

---

9. SECURITY CONSIDERATIONS

Authentication: All views except setup/login require LoginRequired
Authorization: Users can only access their own assessments (check in views)
CSRF Protection: All POST requests include CSRF token
SQL Injection: Use Django ORM (parameterized queries)
XSS Protection: Django templates auto-escape, React sanitizes input
Session Security: HTTPS only, secure cookies, session timeout
Password Security: Django's PBKDF2 hashing
Rate Limiting: Implement for chatbot API to prevent abuse
Data Privacy: No PII collection beyond what's necessary, GDPR compliance

---

10. TESTING STRATEGY

Unit Tests: Test models, serializers, utility functions
Integration Tests: Test API endpoints with DRF test client
Frontend Tests: Jest tests for React components
E2E Tests: Selenium/Playwright for full user workflows
Load Tests: Test assessment processing with multiple simultaneous users

---

11. DEPLOYMENT CONSIDERATIONS

Static Files: Collectstatic for React bundles, serve via Nginx/CloudFront
Database: PostgreSQL for production (supports JSON fields efficiently)
Task Queue: Celery + Redis for async assessment processing
Caching: Redis cache for frequently accessed data (questions, translations)
Logging: Comprehensive logging for debugging and analytics
Monitoring: Track user progress, completion rates, popular career paths
Backup: Regular database backups, especially assessment results


## 3. DJANGO VIEWS (CONVERTED TO API VIEWS)

### 3.1 Authentication API Views

**SetupAPIView**
- URL: `/api/auth/setup/`
- Method: POST only
- Request Body:
  ```json
  {
    "username": "string",
    "password": "string",
    "name": "string",
    "grade": "string",
    "age": integer,
    "preferred_language": "en|hi|te|ta|bn|gu"
  }
  ```
- Response:
  ```json
  {
    "user": {
      "id": integer,
      "username": "string",
      "name": "string",
      "grade": "string",
      "preferred_language": "string"
    },
    "access": "jwt_token",
    "refresh": "refresh_token"
  }
  ```
- Authentication: AllowAny

**LoginAPIView**
- URL: `/api/auth/login/`
- Method: POST only
- Request Body:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- Response:
  ```json
  {
    "user": { /* user data */ },
    "access": "jwt_token",
    "refresh": "refresh_token"
  }
  ```
- Authentication: AllowAny

**LogoutAPIView**
- URL: `/api/auth/logout/`
- Method: POST
- Request Body:
  ```json
  {
    "refresh": "refresh_token"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- Authentication: IsAuthenticated

**TokenRefreshAPIView** (Built-in DRF)
- URL: `/api/auth/token/refresh/`
- Method: POST
- Request Body:
  ```json
  {
    "refresh": "refresh_token"
  }
  ```
- Response:
  ```json
  {
    "access": "new_jwt_token"
  }
  ```

---

### 3.2 Main Application API Views

**HomeAPIView**
- URL: `/api/home/`
- Method: GET
- Response:
  ```json
  {
    "user_profile": { /* user data */ },
    "saved_assessment": { /* current assessment or null */ },
    "completed_assessments": [ /* array of assessments */ ],
    "completion_stats": {
      "total_assessments": integer,
      "completed_percentage": float
    }
  }
  ```
- Authentication: IsAuthenticated

**ChatbotMessageAPIView**
- URL: `/api/chatbot/message/`
- Method: POST
- Request Body:
  ```json
  {
    "message": "string",
    "language": "en|hi|te|ta|bn|gu",
    "assessment_id": integer (optional)
  }
  ```
- Response:
  ```json
  {
    "bot_message": "string",
    "message_count": integer,
    "limit_reached": boolean
  }
  ```
- Authentication: IsAuthenticated

**ChatHistoryAPIView**
- URL: `/api/chatbot/history/`
- Method: GET
- Query Params: `?assessment_id=<id>` (optional)
- Response:
  ```json
  {
    "messages": [
      {
        "id": integer,
        "message_text": "string",
        "sender": "user|bot",
        "created_at": "datetime"
      }
    ]
  }
  ```
- Authentication: IsAuthenticated

---

### 3.3 Assessment API Views

**StartAssessmentAPIView**
- URL: `/api/assessment/start/`
- Method: POST
- Response:
  ```json
  {
    "assessment_id": integer,
    "first_test_type": "aptitude",
    "redirect_url": "/assessment/test/aptitude/"
  }
  ```
- Authentication: IsAuthenticated

**GetTestQuestionsAPIView**
- URL: `/api/assessment/test/<str:test_type>/`
- Method: GET
- Response:
  ```json
  {
    "test_type": "aptitude|values|personal",
    "questions": [
      {
        "id": integer,
        "question_number": integer,
        "question_text_en": "string",
        "question_text_hi": "string",
        /* ... other languages */,
        "question_type": "mcq|rating|text"
      }
    ],
    "current_test_index": integer,
    "total_tests": integer,
    "test_response_id": integer,
    "saved_answers": { /* if resuming */ }
  }
  ```
- Authentication: IsAuthenticated

**SaveTestProgressAPIView**
- URL: `/api/assessment/save/`
- Method: POST
- Request Body:
  ```json
  {
    "test_response_id": integer,
    "answers": {
      "question_id": "answer_value"
    },
    "current_question_index": integer
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "saved_at": "datetime"
  }
  ```
- Authentication: IsAuthenticated

**SubmitTestAPIView**
- URL: `/api/assessment/submit/`
- Method: POST
- Request Body:
  ```json
  {
    "test_response_id": integer,
    "answers": {
      "question_id": "answer_value"
    }
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "next_test_type": "values|personal|null",
    "redirect_url": "/assessment/test/values/" or "/assessment/processing/<id>/"
  }
  ```
- Authentication: IsAuthenticated

---

### 3.4 Processing & Results API Views

**ProcessingStatusAPIView**
- URL: `/api/assessment/processing-status/<int:assessment_id>/`
- Method: GET
- Response:
  ```json
  {
    "status": "processing|completed|error",
    "current_stage": integer (1-5),
    "redirect_url": "string or null"
  }
  ```
- Authentication: IsAuthenticated

**GetResultsAPIView**
- URL: `/api/assessment/results/<int:assessment_id>/`
- Method: GET
- Response:
  ```json
  {
    "assessment_id": integer,
    "results": {
      "aptitude_score": { /* scores by category */ },
      "values_score": { /* values results */ },
      "personal_score": { /* personality traits */ },
      "recommended_streams": [ /* array with scores */ ],
      "strengths": [ /* array of strengths */ ],
      "career_paths": [ /* array of careers */ ]
    },
    "generated_at": "datetime"
  }
  ```
- Authentication: IsAuthenticated (must own assessment)

---

### 3.5 History & Profile API Views

**AssessmentHistoryAPIView**
- URL: `/api/assessment/history/`
- Method: GET
- Response:
  ```json
  {
    "completed_assessments": [
      {
        "id": integer,
        "assessment_number": integer,
        "completed_at": "datetime",
        "top_stream": "string",
        "has_results": boolean
      }
    ]
  }
  ```
- Authentication: IsAuthenticated

**AssessmentResponsesAPIView**
- URL: `/api/assessment/responses/<int:assessment_id>/`
- Method: GET
- Response:
  ```json
  {
    "assessment": { /* assessment data */ },
    "test_responses": [
      {
        "test_type": "string",
        "answers": [
          {
            "question": "string",
            "answer": "string"
          }
        ]
      }
    ],
    "results_summary": { /* summary data */ }
  }
  ```
- Authentication: IsAuthenticated

**UpdateProfileAPIView**
- URL: `/api/profile/update/`
- Method: PATCH
- Request Body: (partial updates allowed)
  ```json
  {
    "name": "string",
    "grade": "string",
    "age": integer,
    "email": "string",
    "phone": "string",
    "preferred_language": "string"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "user": { /* updated user data */ }
  }
  ```
- Authentication: IsAuthenticated

**DeleteAccountAPIView**
- URL: `/api/profile/delete/`
- Method: DELETE
- Response:
  ```json
  {
    "success": true,
    "message": "Account deleted successfully"
  }
  ```
- Authentication: IsAuthenticated

**UpdateLanguageAPIView**
- URL: `/api/profile/language/`
- Method: PATCH
- Request Body:
  ```json
  {
    "language": "en|hi|te|ta|bn|gu"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "language": "string"
  }
  ```
- Authentication: IsAuthenticated

---

## 4. URL CONFIGURATION (urls.py)

```python
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
```

---

## 5. REMOVED SECTIONS

### 5.1 Django Templates - **ENTIRE SECTION DELETED**
No more `templates/` folder needed. React handles all UI.

### 5.2 Custom Middleware - **REMOVED**
- ~~LanguagePreferenceMiddleware~~ - Language handled in API responses
- ~~AssessmentSessionMiddleware~~ - State managed by frontend

---

## 6. SERIALIZERS (serializers.py)

```python
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
```

---

## 7. FRONTEND-BACKEND INTEGRATION

### 7.1 React API Client Setup

**Create `src/services/api.ts`:**
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Create `src/services/authService.ts`:**
```typescript
import apiClient from './api';

export const authService = {
  setup: async (userData: any) => {
    const response = await apiClient.post('/auth/setup/', userData);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return user;
  },
  
  login: async (credentials: any) => {
    const response = await apiClient.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return user;
  },
  
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    await apiClient.post('/auth/logout/', { refresh });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
```

**Create `src/services/assessmentService.ts`:**
```typescript
import apiClient from './api';

export const assessmentService = {
  getHome: () => apiClient.get('/home/'),
  
  startAssessment: () => apiClient.post('/assessment/start/'),
  
  getTestQuestions: (testType: string) => 
    apiClient.get(`/assessment/test/${testType}/`),
  
  saveProgress: (data: any) => 
    apiClient.post('/assessment/save/', data),
  
  submitTest: (data: any) => 
    apiClient.post('/assessment/submit/', data),
  
  getProcessingStatus: (assessmentId: number) => 
    apiClient.get(`/assessment/processing-status/${assessmentId}/`),
  
  getResults: (assessmentId: number) => 
    apiClient.get(`/assessment/results/${assessmentId}/`),
  
  getHistory: () => apiClient.get('/assessment/history/'),
  
  getResponses: (assessmentId: number) => 
    apiClient.get(`/assessment/responses/${assessmentId}/`),
};
```

### 7.2 Component Integration Example

```typescript
// HomePage.tsx
import { useEffect, useState } from 'react';
import { assessmentService } from '../services/assessmentService';

export default function HomePage() {
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await assessmentService.getHome();
        setHomeData(response.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {homeData?.user_profile?.name}</h1>
      {/* Rest of your component */}
    </div>
  );
}
```

---

## 8. WHAT STAYS THE SAME

✅ **Section 5.3** - Management Commands (no changes)
✅ **Section 5.4** - Signals (no changes)
✅ **Section 5.5** - Utility Functions (no changes)
✅ **Section 5.7** - Admin Configuration (no changes)
✅ **Section 7** - Database Relationships (no changes)
✅ **Section 9** - Security Considerations (mostly same, add JWT security)
✅ **Section 10** - Testing Strategy (no changes)
✅ **Section 11** - Deployment (slight changes for separate deployments)

---

## 9. RUNNING THE APPLICATION

### Backend (Terminal 1):
```bash
cd backend
python manage.py runserver
# Runs on http://localhost:8000
```

### Frontend (Terminal 2):
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

## 10. ENVIRONMENT VARIABLES

**Backend (.env):**
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:8000/api
```

---
