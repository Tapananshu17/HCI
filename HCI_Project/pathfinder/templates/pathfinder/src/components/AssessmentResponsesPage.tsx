import { ArrowLeft, ClipboardList, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LanguageSelector } from './LanguageSelector';
import type { Page, UserProfile, Language } from '../App';

interface AssessmentResponsesPageProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  navigateTo: (page: Page) => void;
  assessmentId: number;
}

const translations = {
  en: {
    title: 'Assessment Responses',
    subtitle: 'Review your selected options',
    backToHistory: 'Back to History',
    aptitudeTest: 'Aptitude Test',
    valuesTest: 'Values & Motivation Test',
    personalTest: 'Personal Information',
    noData: 'Options selected will appear here',
    noDataDesc: 'Your assessment responses are not available in demo mode'
  },
  hi: {
    title: 'मूल्यांकन प्रतिक्रियाएं',
    subtitle: 'अपने चयनित विकल्पों की समीक्षा करें',
    backToHistory: 'इतिहास पर वापस जाएं',
    aptitudeTest: 'योग्यता परीक्षा',
    valuesTest: 'मूल्य और प्रेरणा परीक्षा',
    personalTest: 'व्यक्तिगत जानकारी',
    noData: 'चयनित विकल्प यहां दिखाई देंगे',
    noDataDesc: 'डेमो मोड में आपकी मूल्यांकन प्रतिक्रियाएं उपलब्ध नहीं हैं'
  },
  te: {
    title: 'అసెస్‌మెంట్ ప్రతిస్పందనలు',
    subtitle: 'మీరు ఎంచుకున్న ఎంపికలను సమీక్షించండి',
    backToHistory: 'చరిత్రకు తిరిగి వెళ్ళు',
    aptitudeTest: 'ఆప్టిట్యూడ్ పరీక్ష',
    valuesTest: 'విలువలు మరియు ప్రేరణ పరీక్ష',
    personalTest: 'వ్యక్తిగత సమాచారం',
    noData: 'ఎంచుకున్న ఎంపికలు ఇక్కడ కనిపిస్తాయి',
    noDataDesc: 'డెమో మోడ్‌లో మీ అసెస్‌మెంట్ ప్రతిస్పందనలు అందుబాటులో లేవు'
  },
  ta: {
    title: 'மதிப்பீட்டு பதில்கள்',
    subtitle: 'தேர்ந்தெடுத்த விருப்பங்களை மதிப்பாய்வு செய்யவும்',
    backToHistory: 'வரலாற்றுக்குத் திரும்பு',
    aptitudeTest: 'திறன் தேர்வு',
    valuesTest: 'மதிப்புகள் மற்றும் உந்துதல் தேர்வு',
    personalTest: 'தனிப்பட்ட தகவல்',
    noData: 'தேர்ந்தெடுத்த விருப்பங்கள் இங்கே தோன்றும்',
    noDataDesc: 'டெமோ பயன்முறையில் உங்கள் மதிப்பீட்டு பதில்கள் கிடைக்கவில்லை'
  },
  bn: {
    title: 'মূল্যায়ন প্রতিক্রিয়া',
    subtitle: 'আপনার নির্বাচিত বিকল্পগুলি পর্যালোচনা করুন',
    backToHistory: 'ইতিহাসে ফিরে যান',
    aptitudeTest: 'যোগ্যতা পরীক্ষা',
    valuesTest: 'মূল্যবোধ এবং প্রেরণা পরীক্ষা',
    personalTest: 'ব্যক্তিগত তথ্য',
    noData: 'নির্বাচিত বিকল্পগুলি এখানে প্রদর্শিত হবে',
    noDataDesc: 'ডেমো মোডে আপনার মূল্যায়ন প্রতিক্রিয়া উপলব্ধ নেই'
  },
  gu: {
    title: 'મૂલ્યાંકન પ્રતિસાદ',
    subtitle: 'તમારા પસંદ કરેલ વિકલ્પોની સમીક્ષા કરો',
    backToHistory: 'ઇતિહાસ પર પાછા જાઓ',
    aptitudeTest: 'યોગ્યતા પરીક્ષા',
    valuesTest: 'મૂલ્યો અને પ્રેરણા પરીક્ષા',
    personalTest: 'વ્યક્તિગત માહિતી',
    noData: 'પસંદ કરેલા વિકલ્પો અહીં દેખાશે',
    noDataDesc: 'ડેમો મોડમાં તમારા મૂલ્યાંકન પ્રતિસાદ ઉપલબ્ધ નથી'
  }
};

export function AssessmentResponsesPage({ 
  userProfile, 
  setUserProfile, 
  navigateTo,
  assessmentId 
}: AssessmentResponsesPageProps) {
  const t = translations[userProfile.language];

  const handleLanguageChange = (lang: Language) => {
    setUserProfile({ ...userProfile, language: lang });
  };

  // In a real app, this would fetch the actual responses for the assessmentId
  const testSections = [
    { id: 'aptitude', title: t.aptitudeTest, icon: ClipboardList },
    { id: 'values', title: t.valuesTest, icon: ClipboardList },
    { id: 'personal', title: t.personalTest, icon: ClipboardList }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateTo('assessment-history')}
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
        <div className="space-y-6">
          {testSections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-lg">
                    <section.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-900 mb-2">{t.noData}</p>
                  <p className="text-gray-600 text-sm">{t.noDataDesc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
