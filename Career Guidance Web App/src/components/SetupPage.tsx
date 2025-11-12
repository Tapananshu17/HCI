import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LanguageSelector } from './LanguageSelector';
import type { Page, UserProfile, Language } from '../App';

interface SetupPageProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  navigateTo: (page: Page) => void;
  onSetupComplete: () => void;
}

const translations = {
  en: {
    welcome: 'Welcome to PathFinder',
    subtitle: 'Your Career Guidance Companion',
    description: 'Let\'s get started by collecting some basic information',
    nameLabel: 'Name',
    namePlaceholder: 'your name',
    gradeLabel: 'Grade/Class',
    gradePlaceholder: 'e.g. 10',
    ageLabel: 'Age',
    agePlaceholder: 'Enter your age',
    consentLabel: 'I consent to sharing my information for career guidance purposes',
    language: 'Language',
    getStarted: 'Get Started',
    required: 'This field is required',
    consentRequired: 'Please consent to continue',
    note: 'Note: Your information will only be used to provide personalized career guidance and will be kept confidential.'
  },
  hi: {
    welcome: 'पाथफाइंडर में आपका स्वागत है',
    subtitle: 'आपका करियर मार्गदर्शन साथी',
    description: 'आइए कुछ बुनियादी जानकारी एकत्र करके शुरुआत करें',
    nameLabel: 'पूरा नाम',
    namePlaceholder: 'अपना पूरा नाम दर्ज करें',
    gradeLabel: 'कक्षा',
    gradePlaceholder: 'उदा., 10वीं',
    ageLabel: 'उम्र',
    agePlaceholder: 'अपनी उम्र दर्ज करें',
    consentLabel: 'मैं करियर मार्गदर्शन उद्देश्यों के लिए अपनी जानकारी साझा करने के लिए सहमत हूं',
    language: 'भाषा',
    getStarted: 'शुरू करें',
    required: 'यह फ़ील्ड आवश्यक है',
    consentRequired: 'जारी रखने के लिए कृपया सहमति दें',
    note: 'नोट: आपकी जानकारी का उपयोग केवल व्यक्तिगत करियर मार्गदर्शन प्रदान करने के लिए किया ��ाएगा और इसे गोपनीय रखा जाएगा।'
  },
  te: {
    welcome: 'పాత్‌ఫైండర్‌కు స్వాగతం',
    subtitle: 'మీ కెరీర్ మార్గదర్శక సహచరుడు',
    description: 'కొన్ని ప్రాథమిక సమాచారాన్ని సేకరించడం ద్వారా ప్రారంభిద్దాం',
    nameLabel: 'పూర్తి పేరు',
    namePlaceholder: 'మీ పూర్తి పేరును నమోదు చేయండి',
    gradeLabel: 'తరగతి',
    gradePlaceholder: 'ఉదా., 10వ తరగతి',
    ageLabel: 'వయస్సు',
    agePlaceholder: 'మీ వయస్సును నమోదు చేయండి',
    consentLabel: 'కెరీర్ మార్గదర్శకత్వ ప్రయోజనాల కోసం నా సమాచారాన్ని పంచుకోవడానికి నేను అంగీకరిస్తున్నాను',
    language: 'భాష',
    getStarted: 'ప్రారంభించండి',
    required: 'ఈ ఫీల్డ్ తప్పనిసరి',
    consentRequired: 'కొనసాగించడానికి దయచేసి సమ్మతించండి',
    note: 'గమనిక: మీ సమాచారం వ్యక్తిగత కెరీర్ మార్గదర్శకత్వాన్ని అందించడానికి మాత్రమే ఉపయోగించబడుతుంది మరియు గోప్యంగా ఉంచబడుతుంది.'
  },
  ta: {
    welcome: 'PathFinder க்கு வரவேற்கிறோம்',
    subtitle: 'உங்கள் தொழில் வழிகாட்டி துணை',
    description: 'சில அடிப்படை தகவல்களைச் சேகரித்து தொடங்குவோம்',
    nameLabel: 'முழு பெயர்',
    namePlaceholder: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    gradeLabel: 'வகுப்பு',
    gradePlaceholder: 'எ.கா., 10வது',
    ageLabel: 'வயது',
    agePlaceholder: 'உங்கள் வயதை உள்ளிடவும்',
    consentLabel: 'தொழில் வழிகாட்டுதல் நோக்கங்களுக்காக எனது தகவலைப் பகிர்ந்து கொள்ள ஒப்புக்கொள்கிறேன்',
    language: 'மொழி',
    getStarted: 'தொடங்கவும்',
    required: 'இந்த புலம் அவசியம்',
    consentRequired: 'தொடர தயவுசெய்து ஒப்புக்கொள்ளவும்',
    note: 'குறிப்பு: உங்கள் தகவல் தனிப்பயனாக்கப்பட்ட தொழில் வழிகாட்டுதலை வழங்க மட்டுமே பயன்படுத்தப்படும் மற்றும் ரகசியமாக வைக்கப்படும்.'
  },
  bn: {
    welcome: 'PathFinder এ স্বাগতম',
    subtitle: 'আপনার ক্যারিয়ার গাইডেন্স সঙ্গী',
    description: 'চলুন কিছু মৌলিক তথ্য সংগ্রহ করে শুরু করি',
    nameLabel: 'পুরো নাম',
    namePlaceholder: 'আপনার পুরো নাম লিখুন',
    gradeLabel: 'শ্রেণী',
    gradePlaceholder: 'যেমন, দশম',
    ageLabel: 'বয়স',
    agePlaceholder: 'আপনার বয়স লিখুন',
    consentLabel: 'আমি ক্যারিয়ার গাইডেন্স উদ্দেশ্যে আমার তথ্য শেয়ার করতে সম্মত',
    language: 'ভাষা',
    getStarted: 'শুরু করুন',
    required: 'এই ক্ষেত্রটি আবশ্যক',
    consentRequired: 'অগ্রসর হতে অনুগ্রহ করে সম্মতি দিন',
    note: 'নোট: আপনার তথ্য শুধুমাত্র ব্যক্তিগতকৃত ক্যারিয়ার গাইডেন্স প্রদানের জন্য ব্যবহৃত হবে এবং গোপনীয় রাখা হবে।'
  },
  gu: {
    welcome: 'PathFinder માં આપનું સ્વાગત છે',
    subtitle: 'તમારો કારકિર્દી માર્ગદર્શન સાથી',
    description: 'ચાલો કેટલીક મૂળભૂત માહિતી એકત્રિત કરીને શરૂઆત કરીએ',
    nameLabel: 'પૂરું નામ',
    namePlaceholder: 'તમારું પૂરું નામ દાખલ કરો',
    gradeLabel: 'ધોરણ',
    gradePlaceholder: 'ઉદા., 10મું',
    ageLabel: 'ઉંમર',
    agePlaceholder: 'તમારી ઉંમર દાખલ કરો',
    consentLabel: 'હું કારકિર્દી માર્ગદર્શન હેતુઓ માટે મારી માહિતી શેર કરવા માટે સંમતિ આપું છું',
    language: 'ભાષા',
    getStarted: 'શરૂઆત કરો',
    required: 'આ ફીલ્ડ જરૂરી છે',
    consentRequired: 'કૃપા કરીને ચાલુ રાખવા માટે સંમતિ આપો',
    note: 'નોંધ: તમારી માહિતીનો ઉપયોગ ફક્ત વ્યક્તિગત કારકિર્દી માર્ગદર્શન પ્રદાન કરવા માટે કરવામાં આવશે અને ગોપનીય રાખવામાં આવશે.'
  }
};

export function SetupPage({ userProfile, setUserProfile, navigateTo, onSetupComplete }: SetupPageProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('10th');
  const [age, setAge] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const lang = userProfile.language;
  const t = translations[lang];

  const handleLanguageChange = (newLanguage: Language) => {
    setUserProfile({ ...userProfile, language: newLanguage });
    // Immediately save language preference to localStorage so it persists across all screens
    localStorage.setItem('pathfinder_user_language', newLanguage);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = t.required;
    }

    if (!grade.trim()) {
      newErrors.grade = t.required;
    }

    if (!age.trim()) {
      newErrors.age = t.required;
    }

    if (!consent) {
      newErrors.consent = t.consentRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Update user profile
      const updatedProfile: UserProfile = {
        ...userProfile,
        name: name.trim(),
        class: grade.trim()
      };
      setUserProfile(updatedProfile);

      // Store setup completion in localStorage along with user data
      localStorage.setItem('pathfinder_setup_complete', 'true');
      localStorage.setItem('pathfinder_user_name', name.trim());
      localStorage.setItem('pathfinder_user_grade', grade.trim());
      localStorage.setItem('pathfinder_user_age', age.trim());
      localStorage.setItem('pathfinder_user_language', userProfile.language);

      // Mark setup as complete
      onSetupComplete();
      
      // Navigate to home
      navigateTo('home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-full">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t.welcome}
          </CardTitle>
          <CardDescription className="text-base">
            {t.subtitle}
          </CardDescription>
          <p className="text-sm text-muted-foreground pt-2">
            {t.description}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Selector */}
            <div className="space-y-2">
              <Label>{t.language}</Label>
              <LanguageSelector
                language={userProfile.language}
                onLanguageChange={handleLanguageChange}
              />
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.nameLabel} *</Label>
              <Input
                id="name"
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Grade Field */}
            <div className="space-y-2">
              <Label htmlFor="grade">{t.gradeLabel} *</Label>
              <Input
                id="grade"
                type="text"
                placeholder={t.gradePlaceholder}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={errors.grade ? 'border-red-500' : ''}
              />
              {errors.grade && (
                <p className="text-sm text-red-500">{errors.grade}</p>
              )}
            </div>

            {/* Age Field */}
            <div className="space-y-2">
              <Label htmlFor="age">{t.ageLabel} *</Label>
              <Input
                id="age"
                type="number"
                placeholder={t.agePlaceholder}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={errors.age ? 'border-red-500' : ''}
                min="10"
                max="25"
              />
              {errors.age && (
                <p className="text-sm text-red-500">{errors.age}</p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  className={errors.consent ? 'border-red-500' : ''}
                />
                <Label 
                  htmlFor="consent" 
                  className="text-sm leading-tight cursor-pointer"
                >
                  {t.consentLabel}
                </Label>
              </div>
              {errors.consent && (
                <p className="text-sm text-red-500">{errors.consent}</p>
              )}
            </div>

            {/* Privacy Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                {t.note}
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {t.getStarted}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
