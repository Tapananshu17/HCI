import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { SetupPage } from './components/SetupPage';
import { HomePage } from './components/HomePage';
import { ChatbotPage } from './components/ChatbotPage';
import { TestFormPage } from './components/TestFormPage';
import { ProcessingPage } from './components/ProcessingPage';
import { AssessmentHistoryPage } from './components/AssessmentHistoryPage';
import { AssessmentResponsesPage } from './components/AssessmentResponsesPage';
import { SettingsPage } from './components/SettingsPage';

export type Page = 'setup' | 'home' | 'chatbot' | 'test-selection' | 'test-form' | 'processing' | 'results' | 'assessment-history' | 'assessment-responses' | 'settings';
export type TestType = 'aptitude' | 'values' | 'personal';
export type Language = 'en' | 'hi' | 'te' | 'ta' | 'bn' | 'gu';

export interface CompletedAssessment {
  id: number;
  completedAt: Date;
  tests: TestType[];
}

export interface SavedAssessment {
  testType: TestType;
  progress: number;
  answers: { [key: number]: string };
  currentQuestionIndex: number;
}

export interface UserProfile {
  name: string;
  class: string;
  age?: string;
  language: Language;
  email?: string;
  phone?: string;
  password?: string;
}

function App() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('setup');
  const [testFlow, setTestFlow] = useState<TestType[]>(['aptitude', 'values', 'personal']);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [savedAssessment, setSavedAssessment] = useState<SavedAssessment | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '<Student name>',
    class: '10th',
    language: 'en'
  });

  // Check if setup is complete on mount
  useEffect(() => {
    const isSetupComplete = localStorage.getItem('pathfinder_setup_complete') === 'true';
    
    if (isSetupComplete) {
      // Load user data from localStorage
      const savedName = localStorage.getItem('pathfinder_user_name');
      const savedGrade = localStorage.getItem('pathfinder_user_grade');
      const savedAge = localStorage.getItem('pathfinder_user_age');
      const savedLanguage = localStorage.getItem('pathfinder_user_language') as Language;

      setUserProfile({
        ...userProfile,
        name: savedName || '<Student name>',
        class: savedGrade || '10th',
        age: savedAge || undefined,
        language: savedLanguage || 'en'
      });

      setSetupComplete(true);
      setCurrentPage('home');
    }
  }, []);

  const currentTest = testFlow[currentTestIndex];

  const navigateTo = (page: Page, displayResults?: boolean, assessmentId?: number) => {
    if (displayResults !== undefined) {
      setShowResults(displayResults);
    } else {
      setShowResults(false);
    }
    if (assessmentId !== undefined) {
      setSelectedAssessmentId(assessmentId);
    }
    setCurrentPage(page);
  };

  const startAssessmentFlow = () => {
    setCurrentTestIndex(0);
    navigateTo('test-form');
  };

  const handleLogout = () => {
    // Clear setup completion from localStorage
    localStorage.removeItem('pathfinder_setup_complete');
    
    // Reset state
    setSetupComplete(false);
    setCurrentPage('setup');
    setCurrentTestIndex(0);
    setSavedAssessment(null);
    setShowResults(false);
    setSelectedAssessmentId(null);
  };

  const completeTest = (testType: TestType) => {
    // Move to next test or processing
    if (currentTestIndex < testFlow.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
    } else {
      // All tests completed, create completed assessment
      const newAssessment: CompletedAssessment = {
        id: Date.now(),
        completedAt: new Date(),
        tests: testFlow
      };
      setCompletedAssessments([...completedAssessments, newAssessment]);
      setSelectedAssessmentId(newAssessment.id);
      navigateTo('processing');
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {currentPage === 'setup' && (
          <SetupPage 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            navigateTo={navigateTo}
            onSetupComplete={() => setSetupComplete(true)}
          />
        )}
        {currentPage === 'home' && (
        <HomePage 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          navigateTo={navigateTo}
          savedAssessment={savedAssessment}
          completedAssessments={completedAssessments}
          startAssessmentFlow={startAssessmentFlow}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'assessment-history' && (
        <AssessmentHistoryPage 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          completedAssessments={completedAssessments}
          navigateTo={navigateTo}
        />
      )}
      {currentPage === 'assessment-responses' && selectedAssessmentId && (
        <AssessmentResponsesPage 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          navigateTo={navigateTo}
          assessmentId={selectedAssessmentId}
        />
      )}
      {currentPage === 'chatbot' && (
        <ChatbotPage 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          navigateTo={navigateTo}
          showResults={showResults}
        />
      )}
      {currentPage === 'test-form' && (
        <TestFormPage 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          testType={currentTest}
          navigateTo={navigateTo}
          savedAssessment={savedAssessment}
          setSavedAssessment={setSavedAssessment}
          completeTest={completeTest}
          currentTestIndex={currentTestIndex}
          totalTests={testFlow.length}
        />
      )}
      {currentPage === 'processing' && (
        <ProcessingPage 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          navigateTo={navigateTo}
          selectedTest={testFlow[testFlow.length - 1]}
        />
      )}
      {currentPage === 'settings' && (
        <SettingsPage 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          navigateTo={navigateTo}
        />
      )}
      </div>
    </>
  );
}

export default App;
