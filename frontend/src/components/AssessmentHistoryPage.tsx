import { ArrowLeft, ClipboardList, MessageCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { LanguageSelector } from './LanguageSelector';
import type { Page, UserProfile, CompletedAssessment, Language } from '../App';

interface AssessmentHistoryPageProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  completedAssessments: CompletedAssessment[];
  navigateTo: (page: Page, displayResults?: boolean, assessmentId?: number) => void;
}

const translations = {
  en: {
    title: 'Assessment History',
    subtitle: 'View your completed assessments',
    noAssessments: 'No assessments completed yet',
    assessment: 'Assessment',
    completedOn: 'Completed on',
    viewResponses: 'View Responses',
    viewChatHistory: 'Chat History',
    at: 'at'
  },
  hi: {
    title: 'मूल्यांकन इतिहास',
    subtitle: 'अपने पूर्ण मूल्यांकन देखें',
    noAssessments: 'अभी तक कोई मूल्यांकन पूर्ण नहीं',
    assessment: 'मूल्यांकन',
    completedOn: 'पूर्ण किया',
    viewResponses: 'प्रतिक्रियाएं देखें',
    viewChatHistory: 'चैट इतिहास',
    at: 'को'
  },
  te: {
    title: 'అసెస్‌మెంట్ చరిత్ర',
    subtitle: 'మీ పూర్తి అసెస్‌మెంట్లు చూడండి',
    noAssessments: 'ఇంకా అసెస్‌మెంట్లు పూర్తి కాలేదు',
    assessment: 'అసెస్‌మెంట్',
    completedOn: 'పూర్తి అయ్యింది',
    viewResponses: 'ప్రతిస్పందనలు చూడండి',
    viewChatHistory: 'చాట్ చరిత్ర',
    at: 'న'
  },
  ta: {
    title: 'மதிப்பீடு வரலாறு',
    subtitle: 'முடிந்த மதிப்பீடுகளைப் பார்க்கவும்',
    noAssessments: 'இன்னும் மதிப்பீடுகள் முடிக்கப்படவில்லை',
    assessment: 'மதிப்பீடு',
    completedOn: 'முடிக்கப்பட்டது',
    viewResponses: 'பதில்களைப் பார்க்கவும்',
    viewChatHistory: 'அரட்டை வரலாறு',
    at: 'அன்று'
  },
  bn: {
    title: 'মূল্যায়ন ইতিহাস',
    subtitle: 'আপনার সম্পূর্ণ মূল্যায়ন দেখুন',
    noAssessments: 'এখনও কোন মূল্যায়ন সম্পূর্ণ হয়নি',
    assessment: 'মূল্যায়ন',
    completedOn: 'সম্পূর্ণ হয়েছে',
    viewResponses: 'প্রতিক্রিয়া দেখুন',
    viewChatHistory: 'চ্যাট ইতিহাস',
    at: 'এ'
  },
  gu: {
    title: 'મૂલ્યાંકન ઇતિહાસ',
    subtitle: 'તમારા પૂર્ણ મૂલ્યાંકનો જુઓ',
    noAssessments: 'હજી સુધી કોઈ મૂલ્યાંકન પૂર્ણ થયું નથી',
    assessment: 'મૂલ્યાંકન',
    completedOn: 'પૂર્ણ થયું',
    viewResponses: 'પ્રતિસાદ જુઓ',
    viewChatHistory: 'ચેટ ઇતિહાસ',
    at: 'ના'
  }
};

export function AssessmentHistoryPage({ userProfile, setUserProfile, completedAssessments, navigateTo }: AssessmentHistoryPageProps) {
  const t = translations[userProfile.language];

  const handleLanguageChange = (lang: Language) => {
    setUserProfile({ ...userProfile, language: lang });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(userProfile.language === 'en' ? 'en-US' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(userProfile.language === 'en' ? 'en-US' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateTo('home')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-gray-900">{t.title}</h2>
              <p className="text-gray-600 text-sm">{t.subtitle}</p>
            </div>
            <LanguageSelector 
              language={userProfile.language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {completedAssessments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ClipboardList className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">{t.noAssessments}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedAssessments.map((assessment, index) => (
              <Card 
                key={assessment.id}
                className="border-2 hover:border-blue-300 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-xl">
                        <ClipboardList className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900">
                          {t.assessment} #{completedAssessments.length - index}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {t.completedOn} {formatDate(assessment.completedAt)} {t.at} {formatTime(assessment.completedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => navigateTo('assessment-responses', false, assessment.id)}
                        variant="outline"
                        className="gap-2 w-full sm:w-auto"
                      >
                        <FileText className="h-4 w-4" />
                        {t.viewResponses}
                      </Button>
                      <Button
                        onClick={() => navigateTo('chatbot', true, assessment.id)}
                        className="gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {t.viewChatHistory}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
