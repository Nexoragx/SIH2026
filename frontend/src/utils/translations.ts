export interface TranslationItem {
  name: string;
  nativeName: string;
  appTitle: string;
  appSubtitle: string;
  helplineText: string;
  sosButton: string;
  startCheckin: string;
  takesTime: string;
  selectLanguage: string;
  whoIsThisFor: string;
  forMyself: string;
  forMyselfSub: string;
  forSomeoneElse: string;
  forSomeoneElseSub: string;
  basicDetails: string;
  enterName: string;
  enterPhone: string;
  selectState: string;
  selectDistrict: string;
  caseType: string;
  caseOptions: { [key: string]: string };
  next: string;
  back: string;
  skip: string;
  submit: string;
  listenQuestion: string;
  voiceCheckinPrompt: string;
  recordVoice: string;
  recording: string;
  stopRecord: string;
  analyzingVoice: string;
  crisisTitle: string;
  crisisSub: string;
  crisisCallNow: string;
  counsellorReachingOut: string;
  resultGreeting: string;
  resultBody: string;
  talkToCounsellor: string;
  breathingExercise: string;
  hopeWall: string;
  dailyAffirmation: string;
  // Dashboard & Navigation Additions
  navCare: string;
  navDirectory: string;
  navAnalytics: string;
  navExecutive: string;
  navOversight: string;
  navTelepsychiatry: string;
  navNgo: string;
  navDownload: string;
  navSignIn: string;
  navRegister: string;
  navAdmin: string;
  navLogout: string;
  navNotifications: string;
  navAccessibility: string;
  navHighContrast: string;
  navTextScale: string;
  // Dashboard Subtabs
  tabOverview: string;
  tabExercises: string;
  tabDistressScale: string;
  tabHopeWall: string;
  // Dashboard Content
  howFeeling: string;
  assignedObserver: string;
  doctorDirectory: string;
  messageObserver: string;
  wellbeingStatus: string;
  nextCheckin: string;
  wellbeingTrajectory: string;
  immediateSupport: string;
  aiCompanion: string;
  telemanas: string;
  emergencyAmbulance: string;
  // Landing Page
  ministryBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  createAccountCta: string;
  signInCta: string;
  anonymousCheckinCta: string;
  rolePortalsTitle: string;
  encryptedStorageBadge: string;
  confidentialityBadge: string;
  emergencyProtocolBadge: string;
  questions: {
    [qId: number]: {
      title: string;
      options: { [optId: string]: string };
    };
  };
}

export interface TranslationDictionary {
  [langCode: string]: TranslationItem;
}

export const translations: TranslationDictionary = {
  en: {
    name: 'English',
    nativeName: 'English',
    appTitle: 'ANVAYA • अन्वय',
    appSubtitle: 'Empathetic AI Mental Health & Distress Monitoring Platform | MoSJE',
    helplineText: 'National Atrocity Helpline: 14566 (24x7 Toll-Free)',
    sosButton: 'Immediate SOS',
    startCheckin: 'Begin Gentle Check-in',
    takesTime: 'Takes ~2 minutes • Soft, tap-friendly tiles',
    selectLanguage: 'Choose Your Preferred Language',
    whoIsThisFor: 'Who are you checking in for today?',
    forMyself: 'I need support for myself',
    forMyselfSub: 'A safe, tranquil space to understand how you feel',
    forSomeoneElse: 'Reporting for someone else',
    forSomeoneElseSub: 'Family member, witness or community caregiver',
    basicDetails: 'Identity & Context Setup',
    enterName: 'Your Name or Alias (Optional)',
    enterPhone: 'Mobile Number (for care updates)',
    selectState: 'Select State',
    selectDistrict: 'Select District',
    caseType: 'Case Context (SC/ST PoA Act & Relief)',
    caseOptions: {
      caste_violence: 'Caste-based Atrocity / Violence',
      grievous_hurt: 'Physical Trauma & Medical Strain',
      arson: 'Property Damage / Arson Loss',
      sexual_violence: 'Gender-based / Sexual Trauma',
      witness_intimidation: 'Witness Intimidation & Fear',
      compensation_delay: 'Compensation / Relief Fund Delay',
      other: 'Other Legal / Social Hardship',
    },
    next: 'Continue',
    back: 'Back',
    skip: 'Skip question',
    submit: 'Complete Check-in',
    listenQuestion: 'Listen to Question',
    voiceCheckinPrompt: 'Optional 20-second voice check-in: Share how you feel in your own words.',
    recordVoice: 'Record Voice Reflection',
    recording: 'Listening gently... (Speak freely)',
    stopRecord: 'Finish Speaking',
    analyzingVoice: 'AI Analyzing Tone & Vocal Balance...',
    crisisTitle: 'You are safe. We are right beside you.',
    crisisSub: 'Our certified health observers and crisis counselors are reaching out immediately. Take a deep breath — help is active.',
    crisisCallNow: 'Direct Helpline Call (14566)',
    counsellorReachingOut: 'A district healthcare nodal officer will connect with you right away.',
    resultGreeting: 'You took a meaningful step forward today.',
    resultBody: 'Your emotional health has been recorded with strict privacy. Based on your inputs, personalized care, relaxation tools, and relief channels are coordinated for you.',
    talkToCounsellor: 'Connect with Counsellor',
    breathingExercise: 'Try 60-Second Calming Breath',
    hopeWall: 'Community Survivor Hope Wall',
    dailyAffirmation: '“You are stronger than the difficult moments you are facing. Dignity, justice, and support stand with you.”',
    navCare: 'Care & Wellbeing',
    navDirectory: 'Helplines & Directory',
    navAnalytics: 'National Analytics',
    navExecutive: 'Executive Panel',
    navOversight: 'District Oversight',
    navTelepsychiatry: 'Telepsychiatry Station',
    navNgo: 'NGO Field Ops',
    navDownload: 'Download App',
    navSignIn: 'Sign In',
    navRegister: 'Register',
    navAdmin: 'Admin',
    navLogout: 'Sign Out',
    navNotifications: 'Notifications & Daily Quotes',
    navAccessibility: 'Accessibility Options',
    navHighContrast: 'High Contrast Mode',
    navTextScale: 'Text Size',
    tabOverview: 'Overview',
    tabExercises: 'Guided Exercises',
    tabDistressScale: 'Distress Scale',
    tabHopeWall: 'Hope Wall',
    howFeeling: 'How are you feeling today?',
    assignedObserver: 'Assigned Health Observer',
    doctorDirectory: 'Doctors Directory',
    messageObserver: 'Message Observer',
    wellbeingStatus: 'Wellbeing Status',
    nextCheckin: 'Next Check-in',
    wellbeingTrajectory: 'Wellbeing Trajectory',
    immediateSupport: 'Immediate Support Channels',
    aiCompanion: 'AI Saathi Companion',
    telemanas: 'Tele-MANAS Care',
    emergencyAmbulance: 'Emergency 112 & 108',
    ministryBadge: 'ANVAYA (अन्वय) • MoSJE Government of India Safety Net',
    heroHeadline: 'AI-Powered Dynamic Mental Health Monitoring & Distress Prediction',
    heroSubheadline: 'A confidential, multi-modal psychological safeguarding platform for survivors of atrocities under the SC/ST (PoA) Act.',
    createAccountCta: 'Create Account (Register)',
    signInCta: 'Sign In to Portal',
    anonymousCheckinCta: 'Try Anonymous Check-in',
    rolePortalsTitle: 'SIH Evaluation 1-Click Role Portals',
    encryptedStorageBadge: 'MongoDB Encrypted Storage',
    confidentialityBadge: '100% Confidential & Secure',
    emergencyProtocolBadge: 'Integrated 108 Ambulance Protocol',
    questions: {
      1: {
        title: 'How do you look and feel today?',
        options: {
          a: 'I feel okay',
          b: 'A little down',
          c: 'Sad most of time',
          d: 'Very sad, heavy inside',
        },
      },
      2: {
        title: 'How has your mood been lately?',
        options: {
          a: 'Normal ups and downs',
          b: 'Low but gets better',
          c: 'Heavy sadness that stays',
          d: 'Constant pain, no relief',
        },
      },
      3: {
        title: 'How restless or anxious do you feel inside?',
        options: {
          a: 'Calm and at peace',
          b: 'A little on edge',
          c: 'Tense or panicky often',
          d: 'Constant fear & dread',
        },
      },
      4: {
        title: 'How have you been sleeping at night?',
        options: {
          a: 'Sleeping peacefully',
          b: 'Bit hard to sleep',
          c: 'Wake up 2+ times',
          d: 'Barely 2–3 hours total',
        },
      },
      5: {
        title: 'How is your appetite for meals?',
        options: {
          a: 'Eating normal meals',
          b: 'Eating a little less',
          c: 'No real appetite',
          d: 'Need to force food down',
        },
      },
      6: {
        title: 'Can you focus on daily thoughts & tasks?',
        options: {
          a: 'Concentrating well',
          b: 'Sometimes lose focus',
          c: 'Hard to follow talks',
          d: 'Cannot focus at all',
        },
      },
      7: {
        title: 'How much energy do you have today?',
        options: {
          a: 'Normal energy',
          b: 'Takes effort to start',
          c: 'Hard to do basic work',
          d: 'Cannot do anything alone',
        },
      },
      8: {
        title: 'Do you feel connected to people around you?',
        options: {
          a: 'Yes, I care and feel',
          b: 'Less interested lately',
          c: 'Feel distant & detached',
          d: 'Feel numb to everything',
        },
      },
      9: {
        title: 'What kinds of thoughts come to your mind?',
        options: {
          a: 'Mostly hopeful & calm',
          b: 'Sometimes feel down',
          c: 'Often blame myself',
          d: 'Feel hopeless & helpless',
        },
      },
      10: {
        title: 'How do you feel about the future right now?',
        options: {
          a: 'I look forward to life',
          b: 'Life feels tiring',
          c: 'Sometimes wish it would end',
          d: 'I need urgent crisis help',
        },
      },
      11: {
        title: 'Have you felt threatened or unsafe recently?',
        options: {
          a: 'No, I feel safe',
          b: 'Yes, in my thoughts',
          c: 'Yes, felt uneasy outside',
          d: 'Yes, threatened by someone',
        },
      },
      12: {
        title: 'Do you feel safe where you are currently living?',
        options: {
          a: 'Yes, completely safe',
          b: 'Mostly safe at home',
          c: 'Sometimes feel watched',
          d: 'No, living in fear',
        },
      },
    },
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    appTitle: 'अन्वय • ANVAYA',
    appSubtitle: 'अत्याचार पीड़ितों के लिए एआई-सहानुभूति मानसिक स्वास्थ्य व सुरक्षा प्रणाली | MoSJE',
    helplineText: 'राष्ट्रीय अत्याचार हेल्पलाइन: 14566 (24x7 निःशुल्क)',
    sosButton: 'आपातकालीन SOS',
    startCheckin: 'जांच शुरू करें',
    takesTime: 'लगभग 2 मिनट • सहज और आरामदायक टाइल्स',
    selectLanguage: 'अपनी पसंदीदा भाषा चुनें',
    whoIsThisFor: 'आज आप किसके लिए जानकारी दे रहे हैं?',
    forMyself: 'मैं अपने लिए सहायता चाहता/चाहती हूँ',
    forMyselfSub: 'गोपनीय, सौम्य और शांत मनोस्थिति जांच',
    forSomeoneElse: 'मैं किसी अन्य परिजन के लिए रिपोर्ट कर रहा हूँ',
    forSomeoneElseSub: 'परिवार के सदस्य, गवाह या सहायक',
    basicDetails: 'पहचान और संदर्भ',
    enterName: 'आपका नाम या उपनाम (वैकल्पिक)',
    enterPhone: 'मोबाइल नंबर (सुरक्षा और देखभाल हेतु)',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला चुनें',
    caseType: 'मामले का संदर्भ (SC/ST अत्याचार निवारण अधिनियम)',
    caseOptions: {
      caste_violence: 'जातिगत हिंसा / प्रताड़ना',
      grievous_hurt: 'शारीरिक चोट / चिकित्सीय तनाव',
      arson: 'संपत्ति का नुकसान / आगजनी',
      sexual_violence: 'यौन उत्पीड़न / आघात',
      witness_intimidation: 'गवाह को धमकी या भय',
      compensation_delay: 'मुआवजा / पुनर्वास में देरी',
      other: 'अन्य कानूनी या सामाजिक तनाव',
    },
    next: 'आगे बढ़ें',
    back: 'पीछे',
    skip: 'छोड़ें',
    submit: 'पूर्ण करें',
    listenQuestion: 'प्रश्न सुनकर समझें (आवाज़)',
    voiceCheckinPrompt: 'वैकल्पिक 20 सेकंड की आवाज़: अपने शब्दों में बताएं कि आप कैसा महसूस कर रहे हैं।',
    recordVoice: 'आवाज़ रिकॉर्ड करें',
    recording: 'सुन रहे हैं... (स्वाभाविक रूप से बोलें)',
    stopRecord: 'रिकॉर्डिंग समाप्त',
    analyzingVoice: 'एआई आवाज़ और तनाव का विश्लेषण कर रहा है...',
    crisisTitle: 'आप सुरक्षित हैं। हम आपके साथ खड़े हैं।',
    crisisSub: 'हमारे स्वास्थ्य पर्यवेक्षक और परामर्शदाता आपसे तुरंत संपर्क कर रहे हैं। गहरी सांस लें — सहायता उपलब्ध है।',
    crisisCallNow: 'हेल्पलाइन पर सीधे कॉल करें (14566)',
    counsellorReachingOut: 'आपके जिले के प्रमाणित अधिकारी आपसे तुरंत संपर्क करेंगे।',
    resultGreeting: 'आज आपने एक साहसी और महत्वपूर्ण कदम उठाया है।',
    resultBody: 'आपकी मनोस्थिति सुरक्षित रूप से दर्ज कर ली गई है। आपकी स्थिति के अनुसार आवश्यक परामर्श और सहायता समन्वयित की जा रही है।',
    talkToCounsellor: 'परामर्शदाता से बात करें',
    breathingExercise: '60-सेकंड शांत श्वास व्यायाम',
    hopeWall: 'साथियों के प्रेरणादायी संदेश',
    dailyAffirmation: '“आप अपनी वर्तमान परिस्थितियों से कहीं अधिक मजबूत हैं। न्याय और सहायता आपके साथ है।”',
    navCare: 'देखभाल एवं स्वास्थ्य',
    navDirectory: 'हेल्पलाइन व निर्देशिका',
    navAnalytics: 'राष्ट्रीय विश्लेषण',
    navExecutive: 'प्रशासनिक पैनल',
    navOversight: 'जिला निगरानी',
    navTelepsychiatry: 'टेली-मनोचिकित्सा',
    navNgo: 'एनजीओ कार्यक्षेत्र',
    navDownload: 'ऐप डाउनलोड करें',
    navSignIn: 'लॉग इन करें',
    navRegister: 'पंजीकरण करें',
    navAdmin: 'एडमिन',
    navLogout: 'लॉग आउट',
    navNotifications: 'सूचनाएं व प्रेरणादायी विचार',
    navAccessibility: 'पहुंच विकल्प (Accessibility)',
    navHighContrast: 'हाई कंट्रास्ट मोड',
    navTextScale: 'अक्षर का आकार',
    tabOverview: 'अवलोकन',
    tabExercises: 'मार्गदर्शित व्यायाम',
    tabDistressScale: 'तनाव मापक',
    tabHopeWall: 'आशा की दीवार',
    howFeeling: 'आज आप कैसा महसूस कर रहे हैं?',
    assignedObserver: 'नियुक्त स्वास्थ्य पर्यवेक्षक',
    doctorDirectory: 'चिकित्सक निर्देशिका',
    messageObserver: 'पर्यवेक्षक को संदेश भेजें',
    wellbeingStatus: 'स्वास्थ्य स्थिति',
    nextCheckin: 'अगली जांच',
    wellbeingTrajectory: 'मानसिक स्वास्थ्य प्रक्षेपवक्र',
    immediateSupport: 'तत्काल सहायता चैनल',
    aiCompanion: 'एआई साथी परामर्श',
    telemanas: 'टेली-मानस सहायता',
    emergencyAmbulance: 'आपातकालीन 112 व 108',
    ministryBadge: 'अन्वय (ANVAYA) • भारत सरकार MoSJE सुरक्षा तंत्र',
    heroHeadline: 'एआई-संचालित गतिशील मानसिक स्वास्थ्य निगरानी व तनाव पूर्वानुमान',
    heroSubheadline: 'SC/ST (अत्याचार निवारण) अधिनियम के अंतर्गत पीड़ितों के लिए गोपनीय एवं बहुआयामी मनोवैज्ञानिक सुरक्षा मंच।',
    createAccountCta: 'खाता बनाएं (पंजीकरण)',
    signInCta: 'पोर्टल में लॉग इन करें',
    anonymousCheckinCta: 'गुमनाम जांच आज़माएं',
    rolePortalsTitle: 'SIH मूल्यांकन 1-क्लिक रोल पोर्टल',
    encryptedStorageBadge: 'मोंगोडीबी एन्क्रिप्टेड सुरक्षा',
    confidentialityBadge: '100% गोपनीय व सुरक्षित',
    emergencyProtocolBadge: '108 आपातकालीन एम्बुलेंस प्रोटोकॉल',
    questions: {
      1: {
        title: 'आज आप कैसा महसूस कर रहे हैं?',
        options: {
          a: 'मैं ठीक महसूस कर रहा हूँ',
          b: 'थोड़ा उदास हूँ',
          c: 'अधिकांश समय उदास',
          d: 'बहुत अधिक उदासी और भारीपन',
        },
      },
      2: {
        title: 'हाल ही में आपका मन कैसा रहा है?',
        options: {
          a: 'सामान्य उतार-चढ़ाव',
          b: 'कभी-कभी मन उदास',
          c: 'लगातार भारीपन',
          d: 'लगातार दर्द, कोई राहत नहीं',
        },
      },
      3: {
        title: 'अंदर से कितनी घबराहट या बेचैनी महसूस होती है?',
        options: {
          a: 'शांत और सामान्य',
          b: 'थोड़ी बेचैनी या तनाव',
          c: 'अक्सर डर या घबराहट',
          d: 'अत्यधिक भय और चिंता',
        },
      },
      4: {
        title: 'रात में आपकी नींद कैसी आ रही है?',
        options: {
          a: 'अच्छी और पूरी नींद',
          b: 'सोने में थोड़ी कठिनाई',
          c: 'रात में बार-बार आँख खुलती है',
          d: 'केवल 2–3 घंटे की नींद',
        },
      },
      5: {
        title: 'खाने-पीने की भूख कैसी है?',
        options: {
          a: 'सामान्य भूख लग रही है',
          b: 'पहले से थोड़ा कम खाना',
          c: 'बिल्कुल भूख नहीं लगती',
          d: 'जबरदस्ती खाना पड़ता है',
        },
      },
      6: {
        title: 'क्या आप दैनिक कार्यों पर ध्यान केंद्रित कर पा रहे हैं?',
        options: {
          a: 'हाँ, ध्यान ठीक लग रहा है',
          b: 'कभी-कभी ध्यान भटकता है',
          c: 'बातों को समझना मुश्किल',
          d: 'बिल्कुल ध्यान नहीं लगता',
        },
      },
      7: {
        title: 'आज आपके शरीर में कितनी ऊर्जा है?',
        options: {
          a: 'सामान्य ऊर्जा है',
          b: 'काम शुरू करने में थोड़ी सुस्ती',
          c: 'छोटे-छोटे काम भी भारी लगते हैं',
          d: 'बिना मदद के कुछ नहीं हो पाता',
        },
      },
      8: {
        title: 'आस-पास के लोगों से आपका जुड़ाव कैसा महसूस होता है?',
        options: {
          a: 'हाँ, आत्मीयता महसूस होती है',
          b: 'पहले से कम रुचि',
          c: 'सभी से दूरी और अकेलापन',
          d: 'पूरी तरह सुन्न, कोई भावना नहीं',
        },
      },
      9: {
        title: 'मन में बार-बार किस तरह के विचार आते हैं?',
        options: {
          a: 'सकारात्मक और शांत विचार',
          b: 'कभी-कभी असफलता का अहसास',
          c: 'अक्सर खुद को दोषी मानना',
          d: 'पूर्णतः निराश और बेबस',
        },
      },
      10: {
        title: 'भविष्य को लेकर आप कैसा महसूस करते हैं?',
        options: {
          a: 'जीवन में आगे बढ़ने की आशा है',
          b: 'जीवन थकाऊ सा लगता है',
          c: 'कभी-कभी लगता है सब खत्म हो जाए',
          d: 'मुझे तुरंत आपातकालीन मदद चाहिए',
        },
      },
      11: {
        title: 'क्या हाल ही में आपको कोई धमकी या असुरक्षा महसूस हुई है?',
        options: {
          a: 'नहीं, मैं सुरक्षित हूँ',
          b: 'हाँ, मेरे विचारों में डर है',
          c: 'हाँ, बाहर असहज महसूस हुआ',
          d: 'हाँ, किसी ने सीधे धमकी दी है',
        },
      },
      12: {
        title: 'जहाँ आप अभी रह रहे हैं, क्या वह जगह सुरक्षित है?',
        options: {
          a: 'हाँ, पूरी तरह सुरक्षित',
          b: 'घर पर अधिकांशतः सुरक्षित',
          c: 'कभी-कभी निगरानी जैसा डर',
          d: 'नहीं, लगातार भय में जी रहे हैं',
        },
      },
    },
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    appTitle: 'অন্বয় • ANVAYA',
    appSubtitle: 'অত্যাচারিতদের জন্য এআই মানসিক স্বাস্থ্য ও সুরক্ষা প্ল্যাটফর্ম | MoSJE',
    helplineText: 'জাতীয় হেল্পলাইন: 14566 (24x7 টোল-ফ্রি)',
    sosButton: 'জরুরি SOS',
    startCheckin: 'যাচাই শুরু করুন',
    takesTime: 'মাত্র ২ মিনিট সময় লাগবে',
    selectLanguage: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
    whoIsThisFor: 'আজ কার জন্য তথ্য দিচ্ছেন?',
    forMyself: 'আমি নিজের জন্য সাহায্য চাই',
    forMyselfSub: 'একটি নিরাপদ, শান্ত ও বন্ধুত্বপূর্ণ মূল্যায়ন',
    forSomeoneElse: 'আমি অন্য কারও জন্য রিপোর্ট করছি',
    forSomeoneElseSub: 'পরিবারের সদস্য বা প্রত্যক্ষদর্শী',
    basicDetails: 'মৌলিক বিবরণ',
    enterName: 'আপনার নাম (ঐচ্ছিক)',
    enterPhone: 'মোবাইল নম্বর',
    selectState: 'রাজ্য নির্বাচন করুন',
    selectDistrict: 'জেলা নির্বাচন করুন',
    caseType: 'ঘটনার ধরন (SC/ST PoA Act)',
    caseOptions: {
      caste_violence: 'জাতিগত সহিংসতা / অত্যাচার',
      grievous_hurt: 'শারীরিক আঘাত ও মানসিক চাপ',
      arson: 'সম্পত্তির ক্ষতি / অগ্নিসংযোগ',
      sexual_violence: 'যৌন নিপীড়ন / ট্রমা',
      witness_intimidation: 'সাক্ষীকে হুমকি ও ভয় দেখানো',
      compensation_delay: 'ক্ষতিপূরণ পেতে বিলম্ব',
      other: 'অন্যান্য আইনি বা সামাজিক চাপ',
    },
    next: 'পরবর্তী',
    back: 'পূর্ববর্তী',
    skip: 'এড়িয়ে যান',
    submit: 'সম্পূর্ণ করুন',
    listenQuestion: 'প্রশ্নটি শুনুন',
    voiceCheckinPrompt: 'ঐচ্ছিক ২০ সেকেন্ডের কণ্ঠস্বর: কেমন অনুভব করছেন তা বলুন।',
    recordVoice: 'কণ্ঠ রেকর্ড করুন',
    recording: 'শুনছি... (স্বাচ্ছন্দ্যে বলুন)',
    stopRecord: 'রেকর্ডিং শেষ',
    analyzingVoice: 'AI স্বর ও মানসিক চাপ বিশ্লেষণ করছে...',
    crisisTitle: 'আপনি নিরাপদ আছেন। আমরা আপনার পাশে আছি।',
    crisisSub: 'কাউন্সিলররা খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন। গভীর শ্বাস নিন — সাহায্য সক্রিয় আছে।',
    crisisCallNow: 'সরাসরি কল করুন (14566)',
    counsellorReachingOut: 'জেলার স্বাস্থ্য আধিকারিক দ্রুত আপনার সাথে যোগাযোগ করবেন।',
    resultGreeting: 'আজ আপনি একটি সাহসী পদক্ষেপ নিয়েছেন।',
    resultBody: 'আপনার তথ্য সম্পূর্ণ গোপনে সংরক্ষণ করা হয়েছে। প্রয়োজনীয় সকল সহায়তা প্রদান করা হবে।',
    talkToCounsellor: 'কাউন্সিলরের সাথে কথা বলুন',
    breathingExercise: 'শ্বাসপ্রশ্বাসের ব্যায়াম',
    hopeWall: 'অনুপ্রেরণামূলক বার্তা',
    dailyAffirmation: '“আপনি যেকোনো পরিস্থিতির চেয়ে শক্তিশালী। ন্যায়বিচার আপনার পক্ষে রয়েছে।”',
    navCare: 'যত্ন ও সুস্থতা',
    navDirectory: 'হেল্পলাইন ও ডিরেক্টরি',
    navAnalytics: 'জাতীয় অ্যানালিটিক্স',
    navExecutive: 'প্রশাসনিক প্যানেল',
    navOversight: 'জেলা পর্যবেক্ষণ',
    navTelepsychiatry: 'টেলিসাইকিয়াট্রি স্টেশন',
    navNgo: 'এনজিও কার্যক্রম',
    navDownload: 'অ্যাপ ডাউনলোড',
    navSignIn: 'লগ ইন',
    navRegister: 'নিবন্ধন',
    navAdmin: 'অ্যাডমিন',
    navLogout: 'লগ আউট',
    navNotifications: 'বিজ্ঞপ্তি ও উক্তি',
    navAccessibility: 'অ্যাক্সেসিবিলিটি বিকল্প',
    navHighContrast: 'উচ্চ বৈসাদৃশ্য মোড',
    navTextScale: 'ফন্টের আকার',
    tabOverview: 'সারসংক্ষেপ',
    tabExercises: 'নির্দেশিত ব্যায়াম',
    tabDistressScale: 'কষ্ট পরিমাপক',
    tabHopeWall: 'আশার প্রাচীর',
    howFeeling: 'আজ আপনার কেমন লাগছে?',
    assignedObserver: 'দায়িত্বপ্রাপ্ত স্বাস্থ্য পর্যবেক্ষক',
    doctorDirectory: 'চিকিৎসক ডিরেক্টরি',
    messageObserver: 'পর্যবেক্ষককে বার্তা পাঠান',
    wellbeingStatus: 'মানসিক সুস্থতার স্থিতি',
    nextCheckin: 'পরবর্তী চেক-ইন',
    wellbeingTrajectory: 'সুস্থতার গতিপ্রকৃতি',
    immediateSupport: 'জরুরি সহায়তা চ্যানেল',
    aiCompanion: 'এআই সাথি পরামর্শক',
    telemanas: 'টেলি-মানস কেয়ার',
    emergencyAmbulance: 'জরুরি ১১২ ও ১০৮',
    ministryBadge: 'ANVAYA (অন্বয়) • ভারত সরকার MoSJE নিরাপত্তা নেটওয়ার্ক',
    heroHeadline: 'এআই-চালিত গতিশীল মানসিক স্বাস্থ্য পর্যবেক্ষণ ও চাপ পূর্বাভাস',
    heroSubheadline: 'SC/ST (PoA) আইনের অধীন নিপীড়িতদের জন্য গোপনীয় ও বহু-মাত্রিক মানসিক সুরক্ষা ব্যবস্থা।',
    createAccountCta: 'অ্যাকাউন্ট তৈরি করুন (নিবন্ধন)',
    signInCta: 'পোর্টাল সাইন ইন',
    anonymousCheckinCta: 'বেনামী চেক-ইন চেষ্টা করুন',
    rolePortalsTitle: 'SIH মূল্যায়ন ১-ক্লিক রোল পোর্টাল',
    encryptedStorageBadge: 'MongoDB এনক্রিপ্ট করা সুরক্ষা',
    confidentialityBadge: '১০০% গোপনীয় ও সুরক্ষিত',
    emergencyProtocolBadge: '১০৮ জরুরি অ্যাম্বুলেন্স প্রোটোকল',
    questions: {
      1: {
        title: 'আজ আপনার কেমন লাগছে?',
        options: {
          a: 'আমি ঠিক আছি',
          b: 'মন একটু খারাপ',
          c: 'বেশিরভাগ সময় মন খারাপ',
          d: 'অত্যন্ত দুঃখ ও ভারী অনুভূতি',
        },
      },
      2: {
        title: 'সম্প্রতি আপনার মেজাজ কেমন থাকছে?',
        options: {
          a: 'স্বাভাবিক ওঠা-নামা',
          b: 'মাঝে মাঝে খারাপ',
          c: 'সবসময় মন ভারী থাকে',
          d: 'অসহ্য মানসিক কষ্ট',
        },
      },
      3: {
        title: 'ভেতর থেকে কতটা ভয় বা অস্থিরতা কাজ করছে?',
        options: {
          a: 'শান্ত ও স্বাভাবিক',
          b: 'হালকা অস্বস্তি',
          c: 'ঘন ঘন ভয় ও আতঙ্ক',
          d: 'চরম ভয় ও উদ্বেগ',
        },
      },
      4: {
        title: 'রাতে কেমন ঘুম হচ্ছে?',
        options: {
          a: 'শান্তিপূর্ণ ঘুম',
          b: 'ঘুমাতে একটু সমস্যা',
          c: 'রাতে বারবার ঘুম ভাঙে',
          d: 'সারারাত মাত্র ২–৩ ঘণ্টা ঘুম',
        },
      },
      5: {
        title: 'খাবারের প্রতি আপনার ক্ষুধা কেমন?',
        options: {
          a: 'স্বাভাবিক ক্ষুধা লাগছে',
          b: 'আগের চেয়ে কম খাওয়া',
          c: 'একেবারেই ক্ষুধা নেই',
          d: 'জোর করে খেতে হয়',
        },
      },
      6: {
        title: 'দৈনন্দিন কাজে মনসংযোগ করতে পারছেন কি?',
        options: {
          a: 'হ্যাঁ, মন বসছে',
          b: 'মাঝে মাঝে মনোযোগ হারায়',
          c: 'কথা বুঝতে কষ্ট হয়',
          d: 'একদম মনোযোগ নেই',
        },
      },
      7: {
        title: 'আজ আপনার শরীরে কেমন শক্তি পাচ্ছেন?',
        options: {
          a: 'স্বাভাবিক শক্তি আছে',
          b: 'কাজ শুরু করতে ক্লান্তি',
          c: 'ছোটখাটো কাজও কঠিন লাগে',
          d: 'সাহায্য ছাড়া কিছু করা অসম্ভব',
        },
      },
      8: {
        title: 'আশেপাশের মানুষের সাথে সম্পর্ক কেমন অনুভব করছেন?',
        options: {
          a: 'আন্তরিকতা অনুভব করি',
          b: 'আগ্রহ কমে গেছে',
          c: 'সবার থেকে দূরত্ব বজায় রাখি',
          d: 'সম্পূর্ণ অসাড় অনুভূতি',
        },
      },
      9: {
        title: 'মনে কি ধরণের চিন্তা বেশি আসে?',
        options: {
          a: 'ইতিবাচক ও শান্ত চিন্তা',
          b: 'কখনও কখনও ব্যর্থতা',
          c: 'নিজেকে দোষী মনে হওয়া',
          d: 'সম্পূর্ণ আশাহীন ও অসহায়',
        },
      },
      10: {
        title: 'ভবিষ্যত সম্পর্কে আপনার কেমন অনুভূতি হচ্ছে?',
        options: {
          a: 'সামনে এগিয়ে যাওয়ার আশা আছে',
          b: 'জীবন ক্লান্তিকর লাগে',
          c: 'কখনও মনে হয় সব শেষ হয়ে যাক',
          d: 'আমার অবিলম্বে জরুরি সাহায্য প্রয়োজন',
        },
      },
      11: {
        title: 'সম্প্রতি আপনি কি কোনো হুমকি বা অনিরাপত্তা বোধ করেছেন?',
        options: {
          a: 'না, আমি নিরাপদ আছি',
          b: 'হ্যাঁ, চিন্তায় ভয় আছে',
          c: 'হ্যাঁ, বাইরে অস্বস্তি হয়েছে',
          d: 'হ্যাঁ, সরাসরি হুমকি পেয়েছি',
        },
      },
      12: {
        title: 'বর্তমানে যেখানে আছেন, সেখানে কি নিরাপদ বোধ করছেন?',
        options: {
          a: 'হ্যাঁ, সম্পূর্ণ নিরাপদ',
          b: 'বাড়িতে প্রায়ই নিরাপদ',
          c: 'মাঝে মাঝে নজরদারির ভয় হয়',
          d: 'না, সার্বক্ষণিক ভয়ে থাকি',
        },
      },
    },
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    appTitle: 'அன்வயா • ANVAYA',
    appSubtitle: 'பாதிக்கப்பட்டவர்களுக்கான மனநல பாதுகாப்பு தளம் | MoSJE',
    helplineText: 'தேசிய உதவி எண்: 14566 (24x7 கட்டணமில்லா எண்)',
    sosButton: 'அவசர SOS',
    startCheckin: 'பதிவை தொடங்கவும்',
    takesTime: 'சுமார் 2 நிமிடங்கள்',
    selectLanguage: 'மொழியை தேர்ந்தெடுக்கவும்',
    whoIsThisFor: 'யாருக்காக பதிவு செய்கிறீர்கள்?',
    forMyself: 'எனக்கு உதவி தேவைப்படுகிறது',
    forMyselfSub: 'பாதுகாப்பான மனநிலை மதிப்பீடு',
    forSomeoneElse: 'மற்றொருவருக்காக பதிவு செய்கிறேன்',
    forSomeoneElseSub: 'குடும்ப உறுப்பினர் அல்லது சாட்சி',
    basicDetails: 'அடிப்படை விவரங்கள்',
    enterName: 'உங்கள் பெயர் (விருப்பத்திற்குரியது)',
    enterPhone: 'மொபைல் எண்',
    selectState: 'மாநிலம்',
    selectDistrict: 'மாவட்டம்',
    caseType: 'வழக்கின் வகை',
    caseOptions: {
      caste_violence: 'ஜாதி அடிப்படையிலான வன்முறை',
      grievous_hurt: 'உடல் காயம் மற்றும் மன உளைச்சல்',
      arson: 'சொத்து சேதம் / தீ வைப்பு',
      sexual_violence: 'பாலியல் வன்முறை / அதிர்ச்சி',
      witness_intimidation: 'சாட்சிகளை மிரட்டுதல்',
      compensation_delay: 'இழப்பீடு பெறுவதில் தாமதம்',
      other: 'பிற சட்ட அல்லது சமூக சிக்கல்கள்',
    },
    next: 'அடுத்து',
    back: 'பின்செல்',
    skip: 'தவிர்',
    submit: 'முடிக்கவும்',
    listenQuestion: 'கேள்வியை கேளுங்கள்',
    voiceCheckinPrompt: 'குரல் பதிவு: உங்கள் உணர்வுகளை குரலில் பகிருங்கள்.',
    recordVoice: 'குரல் பதிவு செய்க',
    recording: 'கேட்கிறோம்...',
    stopRecord: 'முடிந்தது',
    analyzingVoice: 'AI குரலை ஆய்வு செய்கிறது...',
    crisisTitle: 'நீங்கள் பாதுகாப்பாக உள்ளீர்கள்.',
    crisisSub: 'ஆலோசகர்கள் விரைவில் தொடர்புகொள்வார்கள்.',
    crisisCallNow: 'நேரடி அழைப்பு (14566)',
    counsellorReachingOut: 'மாவட்ட அதிகாரி உங்களை தொடர்புகொள்வார்.',
    resultGreeting: 'இன்று ஒரு முக்கியமான அடியை எடுத்து வைத்துள்ளீர்கள்.',
    resultBody: 'உங்கள் விவரங்கள் ரகசியமாக வைக்கப்பட்டுள்ளன.',
    talkToCounsellor: 'ஆலோசகருடன் பேசுங்கள்',
    breathingExercise: 'சுவாசப் பயிற்சி',
    hopeWall: 'நம்பிக்கை பகிர்வு',
    dailyAffirmation: '“நீங்கள் எந்த சூழ்நிலையையும் விட வலிமையானவர். நீதி உங்கள் பக்கம் உள்ளது.”',
    navCare: 'பராமரிப்பு & நல்வாழ்வு',
    navDirectory: 'உதவி எண்கள் & முகவரி',
    navAnalytics: 'தேசிய பகுப்பாய்வு',
    navExecutive: 'நிர்வாகக் குழு',
    navOversight: 'மாவட்டக் கண்காணிப்பு',
    navTelepsychiatry: 'தொலை மனநல மையம்',
    navNgo: 'என்.ஜி.ஓ தளம்',
    navDownload: 'செயலியைப் பதிவிறக்குக',
    navSignIn: 'உள்நுழைக',
    navRegister: 'பதிவு செய்க',
    navAdmin: 'நிர்வாகி',
    navLogout: 'வெளியேறுக',
    navNotifications: 'அறிவிப்புகள் & பொன்மொழிகள்',
    navAccessibility: 'அணுகல்தன்மை விருப்பங்கள்',
    navHighContrast: 'உயர் மாறுபாடு முறை',
    navTextScale: 'எழுத்து அளவு',
    tabOverview: 'கண்ணோட்டம்',
    tabExercises: 'வழிகாட்டப்பட்ட பயிற்சிகள்',
    tabDistressScale: 'மன உளைச்சல் அளவு',
    tabHopeWall: 'நம்பிக்கைச் சுவர்',
    howFeeling: 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
    assignedObserver: 'ஒதுக்கப்பட்ட சுகாதார கண்காணிப்பாளர்',
    doctorDirectory: 'மருத்துவர் அடைவு',
    messageObserver: 'கண்காணிப்பாளருக்கு செய்தி அனுப்புக',
    wellbeingStatus: 'நல்வாழ்வு நிலை',
    nextCheckin: 'அடுத்த சோதனை',
    wellbeingTrajectory: 'நல்வாழ்வுப் பாதை',
    immediateSupport: 'உடனடி ஆதரவு வழிகள்',
    aiCompanion: 'AI சாதி துணை',
    telemanas: 'டெலி-மானாஸ் ஆதரவு',
    emergencyAmbulance: 'அவசரம் 112 & 108',
    ministryBadge: 'ANVAYA (அன்வயா) • இந்திய அரசு MoSJE பாதுகாப்பு வலை',
    heroHeadline: 'AI-இயங்கும் மனநல கண்காணிப்பு மற்றும் மன உளைச்சல் கணிப்பு',
    heroSubheadline: 'SC/ST வன்கொடுமை தடுப்புச் சட்டத்தின் கீழ் பாதிக்கப்பட்டோருக்கான ரகசிய பாதுகாப்பு தளம்.',
    createAccountCta: 'கணக்கை உருவாக்கு (பதிவு)',
    signInCta: 'உள்நுழைக',
    anonymousCheckinCta: 'பெயரற்ற சோதனை முயற்சி',
    rolePortalsTitle: 'SIH மதிப்பீடு 1-கிளிக் தளங்கள்',
    encryptedStorageBadge: 'MongoDB குறியாக்கப்பட்ட பாதுகாப்பு',
    confidentialityBadge: '100% ரகசியமானது மற்றும் பாதுகாப்பானது',
    emergencyProtocolBadge: '108 அவசர ஆம்புலன்ஸ் திட்டம்',
    questions: {
      1: {
        title: 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
        options: {
          a: 'நன்றாக உணர்கிறேன்',
          b: 'சற்று சோர்வாக உள்ளது',
          c: 'பெரும்பாலான நேரம் சோகம்',
          d: 'மிகவும் அதிக சோகம் & பாரம்',
        },
      },
      2: {
        title: 'சமீபத்தில் உங்கள் மனநிலை எவ்வாறு உள்ளது?',
        options: {
          a: 'சாதாரண ஏற்ற இறக்கங்கள்',
          b: 'சற்று சோர்வு',
          c: 'தொடர்ந்து சோகம்',
          d: 'தொடர் வலி, நிம்மதி இல்லை',
        },
      },
      3: {
        title: 'மனதில் எவ்வளவு பயம் அல்லது பதற்றம் உள்ளது?',
        options: {
          a: 'அமைதியாக உள்ளேன்',
          b: 'சற்று நடுக்கம்',
          c: 'அடிக்கடி பயம்',
          d: 'அதிக பயம் & நடுக்கம்',
        },
      },
      4: {
        title: 'இரவில் தூக்கம் எப்படி இருக்கிறது?',
        options: {
          a: 'நல்ல தூக்கம்',
          b: 'தூங்குவதில் சிரமம்',
          c: 'இரவில் விழிப்பு',
          d: '2-3 மணிநேரம் மட்டுமே தூக்கம்',
        },
      },
      5: {
        title: 'உணவு மற்றும் பசி எவ்வாறு உள்ளது?',
        options: {
          a: 'வழக்கமான பசி',
          b: 'சற்று குறைவான உணவு',
          c: 'பசி இல்லை',
          d: 'கட்டாயப்படுத்தி உண்கிறேன்',
        },
      },
      6: {
        title: 'வேலைகளில் கவனம் செலுத்த முடிகிறதா?',
        options: {
          a: 'நன்றாக கவனம் செலுத்துகிறேன்',
          b: 'சில நேரங்களில் கவனம் சிதறுகிறது',
          c: 'கவனம் செலுத்துவது கடினம்',
          d: 'கவனமே செலுத்த முடியவில்லை',
        },
      },
      7: {
        title: 'இன்று உங்கள் உடலில் எவ்வளவு ஆற்றல் உள்ளது?',
        options: {
          a: 'சாதாரண ஆற்றல்',
          b: 'வேலையைத் தொடங்க சோர்வு',
          c: 'சின்ன வேலையும் சுமை',
          d: 'உதவியின்றி எதுவும் செய்ய முடியாது',
        },
      },
      8: {
        title: 'மற்றவர்களுடன் தொடர்பு எவ்வாறு உள்ளது?',
        options: {
          a: 'அன்பாக உணர்கிறேன்',
          b: 'ஆர்வம் குறைந்துள்ளது',
          c: 'விலகி இருக்க தோன்றுகிறது',
          d: 'எந்த உணர்வும் இல்லை',
        },
      },
      9: {
        title: 'மனதில் எத்தகைய எண்ணங்கள் வருகின்றன?',
        options: {
          a: 'நம்பிக்கையான எண்ணங்கள்',
          b: 'சில நேரங்களில் விரக்தி',
          c: 'சுய பழிசுமத்தல்',
          d: 'முழு நம்பிக்கையின்மை',
        },
      },
      10: {
        title: 'எதிர்காலத்தை பற்றி என்ன உணர்கிறீர்கள்?',
        options: {
          a: 'முன்னேற ஆசை உண்டு',
          b: 'வாழ்க்கை சலிப்பாக உள்ளது',
          c: 'வாழ விருப்பமில்லை',
          d: 'அவசர உதவி தேவை',
        },
      },
      11: {
        title: 'சமீபத்தில் உங்களுக்கு அச்சுறுத்தல் எதுவும் ஏற்பட்டதா?',
        options: {
          a: 'இல்லை, பாதுகாப்பாக உள்ளேன்',
          b: 'ஆம், மனதில் பயம் உள்ளது',
          c: 'ஆம், வெளியில் அமைதியின்மை',
          d: 'ஆம், நேரடியாக மிரட்டல் வந்தது',
        },
      },
      12: {
        title: 'தற்போது வாழும் இடம் பாதுகாப்பாக உள்ளதா?',
        options: {
          a: 'ஆம், முழு பாதுகாப்பு',
          b: 'வீட்டில் பெரும்பாலும் பாதுகாப்பு',
          c: 'சில நேரங்களில் கண்காணிப்பு பயம்',
          d: 'இல்லை, பெரும் பயத்தில் வாழ்கிறேன்',
        },
      },
    },
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    appTitle: 'అన్వయ • ANVAYA',
    appSubtitle: 'బాధితుల కోసం ఏఐ మానసిక ఆరోగ్య వేదిక | MoSJE',
    helplineText: 'జాతీయ హెల్ప్‌లైన్: 14566 (24x7 టోల్-ఫ్రీ)',
    sosButton: 'అత్యవసర SOS',
    startCheckin: 'తనిఖీ ప్రారంభించండి',
    takesTime: 'సుమారు 2 నిమిషాలు',
    selectLanguage: 'భాషను ఎంచుకోండి',
    whoIsThisFor: 'ఎవరి కోసం సమాచారం ఇస్తున్నారు?',
    forMyself: 'నాకు సహాయం కావాలి',
    forMyselfSub: 'రహస్య మరియు ప్రశాంతమైన మానసిక తనిఖీ',
    forSomeoneElse: 'వేరొకరి కోసం నమోదు చేస్తున్నాను',
    forSomeoneElseSub: 'కుటుంబ సభ్యుడు లేదా సాక్షి',
    basicDetails: 'ప్రాథమిక వివరాలు',
    enterName: 'పేరు (ఐచ్ఛికం)',
    enterPhone: 'మొబైల్ సంఖ్య',
    selectState: 'రాష్ట్రం',
    selectDistrict: 'జిల్లా',
    caseType: 'కేసు రకం',
    caseOptions: {
      caste_violence: 'కులాధారిత హింస / వేధింపులు',
      grievous_hurt: 'శారీరక గాయం మరియు మానసిక ఒత్తిడి',
      arson: 'ఆస్తి నష్టం / దహనం',
      sexual_violence: 'లైంగిక వేధింపులు / గాయం',
      witness_intimidation: 'సాక్షుల బెదిరింపులు',
      compensation_delay: 'పరిహారంలో జాప్యం',
      other: 'ఇతర న్యాయ లేదా సామాజిక ఇబ్బందులు',
    },
    next: 'తరువాత',
    back: 'వెనుకకు',
    skip: 'వదిలివేయండి',
    submit: 'పూర్తి చేయండి',
    listenQuestion: 'ప్రశ్న వినండి',
    voiceCheckinPrompt: 'వాయిస్ రికార్డ్: మీ భావాలను వాయిస్ ద్వారా చెప్పండి.',
    recordVoice: 'వాయిస్ రికార్డ్ చేయండి',
    recording: 'వింటున్నాము...',
    stopRecord: 'పూర్తయింది',
    analyzingVoice: 'AI విశ్లేషిస్తోంది...',
    crisisTitle: 'మీరు సురక్షితంగా ఉన్నారు. మేము తోడుగా ఉన్నాము.',
    crisisSub: 'సలహాదారులు త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు.',
    crisisCallNow: 'నేరుగా కాల్ చేయండి (14566)',
    counsellorReachingOut: 'జిల్లా అధికారి వెంటనే సంప్రదిస్తారు.',
    resultGreeting: 'ఈ రోజు మీరు మంచి నిర్ణయం తీసుకున్నారు.',
    resultBody: 'సమాచారం పూర్తిగా రహస్యంగా ఉంచబడుతుంది.',
    talkToCounsellor: 'సలహాదారుతో మాట్లాడండి',
    breathingExercise: 'శ్వాస వ్యాయామం',
    hopeWall: 'స్ఫూర్తిదాయక సందేశాలు',
    dailyAffirmation: '“మీరు పరిస్థితి కంటే చాలా బలవంతులు. న్యాయం మీ వైపే ఉంది.”',
    navCare: 'రక్షణ & సంక్షేమం',
    navDirectory: 'హెల్ప్‌లైన్లు & డైరెక్టరీ',
    navAnalytics: 'జాతీయ విశ్లేషణలు',
    navExecutive: 'ఎగ్జిక్యూటివ్ ప్యానెల్',
    navOversight: 'జిల్లా పర్యవేక్షణ',
    navTelepsychiatry: 'టెలిసైకియాట్రీ కేంద్రం',
    navNgo: 'ఎన్జీవో ఫీల్డ్ వర్క్',
    navDownload: 'యాప్ డౌన్‌లోడ్',
    navSignIn: 'లాగిన్',
    navRegister: 'రిజిస్టర్',
    navAdmin: 'అడ్మిన్',
    navLogout: 'లాగ్ అవుట్',
    navNotifications: 'నోటిఫికేషన్లు & సూక్తులు',
    navAccessibility: 'యాక్సెసిబిలిటీ ఎంపికలు',
    navHighContrast: 'హై కాంట్రాస్ట్ మోడ్',
    navTextScale: 'అక్షర పరిమాణం',
    tabOverview: 'సమీక్ష',
    tabExercises: 'గైడెడ్ వ్యాయామాలు',
    tabDistressScale: 'ఒత్తిడి స్కేల్',
    tabHopeWall: 'ఆశా గోడ',
    howFeeling: 'ఈ రోజు మీరు ఎలా ఉన్నారు?',
    assignedObserver: 'కేటాయించిన ఆరోగ్య పర్యవేక్షకుడు',
    doctorDirectory: 'వైద్యుల డైరెక్టరీ',
    messageObserver: 'పర్యవేక్షకుడికి సందేశం పంపండి',
    wellbeingStatus: 'ఆరోగ్య స్థితి',
    nextCheckin: 'తదుపరి చెక్-ఇన్',
    wellbeingTrajectory: 'మానసిక ఆరోగ్య పథం',
    immediateSupport: 'తక్షణ సహాయ మార్గాలు',
    aiCompanion: 'AI సాథీ సహాయకుడు',
    telemanas: 'టెలి-మానస్ సంరక్షణ',
    emergencyAmbulance: 'అత్యవసరం 112 & 108',
    ministryBadge: 'ANVAYA (అన్వయ) • భారత ప్రభుత్వం MoSJE రక్షణ నెట్‌వర్క్',
    heroHeadline: 'AI-ఆధారిత డైనమిక్ మానసిక ఆరోగ్య పర్యవేక్షణ & ఒత్తిడి అంచనా',
    heroSubheadline: 'SC/ST దౌర్జన్యాల నిరోధక చట్టం కింద బాధితుల కోసం రహస్యమైన మానసిక భద్రతా వేదిక.',
    createAccountCta: 'ఖాతా సృష్టించండి (రిజిస్టర్)',
    signInCta: 'పోర్టల్ లాగిన్',
    anonymousCheckinCta: 'అజ్ఞాత తనిఖీని ప్రయత్నించండి',
    rolePortalsTitle: 'SIH మూల్యాంకనం 1-క్లిక్ రోల్ పోర్టల్స్',
    encryptedStorageBadge: 'MongoDB ఎన్‌క్రిప్టెడ్ భద్రత',
    confidentialityBadge: '100% రహస్యం మరియు సురక్షితం',
    emergencyProtocolBadge: '108 అత్యవసర అంబులెన్స్ ప్రోటోకాల్',
    questions: {
      1: {
        title: 'ఈ రోజు మీరు ఎలా భావిస్తున్నారు?',
        options: {
          a: 'బాగానే ఉన్నాను',
          b: 'కొద్దిగా బాధగా ఉంది',
          c: 'ఎక్కువ సమయం విచారం',
          d: 'తీవ్రమైన బాధ & భారంగా ఉంది',
        },
      },
      2: {
        title: 'ఇటీవల మీ మనసు ఎలా ఉంది?',
        options: {
          a: 'సాధారణ హెచ్చుతగ్గులు',
          b: 'కొద్దిగా నిరుత్సాహం',
          c: 'ఎల్లప్పుడూ బాధ',
          d: 'నిరంతర వేదన, ఉపశమనం లేదు',
        },
      },
      3: {
        title: 'మనసులో ఎంత భయం లేదా ఆందోళన ఉంది?',
        options: {
          a: 'ప్రశాంతంగా ఉన్నాను',
          b: 'కొద్దిగా ఆందోళన',
          c: 'తరచుగా భయం',
          d: 'తీవ్రమైన భయం & వణుకు',
        },
      },
      4: {
        title: 'రాత్రి నిద్ర ఎలా పడుతోంది?',
        options: {
          a: 'మంచి నిద్ర',
          b: 'నిద్ర పట్టడం కష్టం',
          c: 'రాత్రి మెలకువలు',
          d: 'కేవలం 2-3 గంటలు మాత్రమే',
        },
      },
      5: {
        title: 'ఆహారం మరియు ఆకలి ఎలా ఉంది?',
        options: {
          a: 'సాధారణ ఆకలి',
          b: 'కొద్దిగా తక్కువ',
          c: 'అస్సలు ఆకలి లేదు',
          d: 'బలవంతంగా తింటున్నాను',
        },
      },
      6: {
        title: 'పనులపై దృష్టి కేంద్రీకరించగలుగుతున్నారా?',
        options: {
          a: 'బాగానే దృష్టి ఉంది',
          b: 'కొన్నిసార్లు దృష్టి తప్పుతుంది',
          c: 'దృష్టి పెట్టడం కష్టం',
          d: 'అస్సలు దృష్టి పెట్టలేకపోతున్నాను',
        },
      },
      7: {
        title: 'ఈ రోజు మీలో ఎంత శక్తి ఉంది?',
        options: {
          a: 'సాధారణ శక్తి',
          b: 'పని ప్రారంభించడం కష్టం',
          c: 'చిన్న పనులు కూడా భారం',
          d: 'సహాయం లేకుండా ఏమీ చేయలేను',
        },
      },
      8: {
        title: 'చుట్టూ ఉన్నవారితో అనుబంధం ఎలా ఉంది?',
        options: {
          a: 'ఆప్యాయత ఉంది',
          b: 'ఆసక్తి తగ్గింది',
          c: 'దూరంగా ఉండాలనిపిస్తుంది',
          d: 'ఏ భావనలూ లేవు',
        },
      },
      9: {
        title: 'మనస్సులో ఎటువంటి ఆలోచనలు వస్తున్నాయి?',
        options: {
          a: 'ఆశావాద ఆలోచనలు',
          b: 'కొన్నిసార్లు నిరాశ',
          c: 'స్వీయ నింద',
          d: 'పూర్తి నిస్సహాయత',
        },
      },
      10: {
        title: 'భవిష్యత్తు గురించి మీరు ఎలా భావిస్తున్నారు?',
        options: {
          a: 'ముందుకు సాగాలని ఉంది',
          b: 'జీవితం అలసటగా ఉంది',
          c: 'బతకాలనిపించడం లేదు',
          d: 'అత్యవసర సహాయం కావాలి',
        },
      },
      11: {
        title: 'ఇటీవల మీకు ఎవరైనా బెదిరింపులు లేదా అభద్రత కలిగించారా?',
        options: {
          a: 'లేదు, నేను సురక్షితంగా ఉన్నాను',
          b: 'అవును, ఆలోచనల్లో భయం ఉంది',
          c: 'అవును, బయట అశాంతిగా ఉంది',
          d: 'అవును, నేరుగా బెదిరించారు',
        },
      },
      12: {
        title: 'ప్రస్తుతం మీరు నివసిస్తున్న ప్రదేశం సురక్షితమేనా?',
        options: {
          a: 'అవును, పూర్తిగా సురక్షితం',
          b: 'ఇంట్లో చాలావరకు సురక్షితం',
          c: 'కొన్నిసార్లు నిఘా భయం ఉంది',
          d: 'లేదు, తీవ్ర భయంతో జీవిస్తున్నాము',
        },
      },
    },
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    appTitle: 'अन्वय • ANVAYA',
    appSubtitle: 'अत्याचार पीडितांसाठी एआई मानसिक आरोग्य व सुरक्षा प्रणाली | MoSJE',
    helplineText: 'राष्ट्रीय हेल्पलाइन: 14566 (24x7 टोल-फ्री)',
    sosButton: 'तातडीचे SOS',
    startCheckin: 'तपासणी सुरू करा',
    takesTime: 'केवळ 2 मिनिटे',
    selectLanguage: 'भाषा निवडा',
    whoIsThisFor: 'कोणासाठी नोंद करत आहात?',
    forMyself: 'मला स्वतःसाठी मदत हवी आहे',
    forMyselfSub: 'गोपनीय आणि शांत मनःस्थिती तपासणी',
    forSomeoneElse: 'मी दुसऱ्या व्यक्तीसाठी नोंदवत आहे',
    forSomeoneElseSub: 'कुटुंबातील सदस्य किंवा साक्षीदार',
    basicDetails: 'मूलभूत तपशील',
    enterName: 'नाव (ऐच्छिक)',
    enterPhone: 'मोबाईल क्रमांक',
    selectState: 'राज्य निवडा',
    selectDistrict: 'जिल्हा निवडा',
    caseType: 'प्रकरणाचा प्रकार',
    caseOptions: {
      caste_violence: 'जातीय अत्याचार / हिंसाचार',
      grievous_hurt: 'शारीरिक दुखापत / आघात',
      arson: 'मालमत्तेचे नुकसान / जाळपोळ',
      sexual_violence: 'लैंगिक छळ / अत्याचार',
      witness_intimidation: 'साक्षीदाराला धमकी किंवा भीती',
      compensation_delay: 'भरपाई / पुनर्वसनात विलंब',
      other: 'इतर कायदेशीर किंवा सामाजिक ताण',
    },
    next: 'पुढे चला',
    back: 'मागे',
    skip: 'वगळा',
    submit: 'पूर्ण करा',
    listenQuestion: 'प्रश्न ऐका',
    voiceCheckinPrompt: 'आवाज नोंदवा: तुम्हाला कसे वाटते ते सांगा.',
    recordVoice: 'आवाज नोंदवा',
    recording: 'ऐकत आहोत...',
    stopRecord: 'पूर्ण',
    analyzingVoice: 'AI विश्लेषण करत आहे...',
    crisisTitle: 'तुम्ही सुरक्षित आहात. आम्ही सोबत आहोत.',
    crisisSub: 'समुपदेशक तुमच्याशी लगेच संपर्क साधतील.',
    crisisCallNow: 'थेट कॉल करा (14566)',
    counsellorReachingOut: 'जिल्ह्यातील समुपदेशक लवकरच संपर्क करतील.',
    resultGreeting: 'आज तुम्ही मोठे धैर्य दाखवले आहे.',
    resultBody: 'माहिती सुरक्षित ठेवली आहे. आवश्यक ती सर्व मदत पुरवली जाईल.',
    talkToCounsellor: 'समुपदेशकाशी बोला',
    breathingExercise: 'श्वसन व्यायाम',
    hopeWall: 'प्रेरणादायी संदेश',
    dailyAffirmation: '“तुम्ही परिस्थितीपेक्षा अधिक सक्षम आहात. न्याय तुमच्या बाजूने आहे.”',
    navCare: 'काळजी व आरोग्य',
    navDirectory: 'हेल्पलाइन व निर्देशिका',
    navAnalytics: 'राष्ट्रीय विश्लेषण',
    navExecutive: 'प्रशासकीय पॅनेल',
    navOversight: 'जिल्हा देखरेख',
    navTelepsychiatry: 'टेलिसायकियाट्री स्टेशन',
    navNgo: 'एनजीओ कार्यक्षेत्र',
    navDownload: 'ॲप डाउनलोड करा',
    navSignIn: 'लॉग इन',
    navRegister: 'नोंदणी करा',
    navAdmin: 'ॲडमिन',
    navLogout: 'लॉग आउट',
    navNotifications: 'सूचना व विचार',
    navAccessibility: 'ॲक्सेसीबीलिटी पर्याय',
    navHighContrast: 'हाय कॉन्ट्रास्ट मोड',
    navTextScale: 'फॉन्ट आकार',
    tabOverview: 'आढावा',
    tabExercises: 'मार्गदर्शित व्यायाम',
    tabDistressScale: 'तणाव मापक',
    tabHopeWall: 'आशेची भिंत',
    howFeeling: 'आज तुम्हाला कसे वाटत आहे?',
    assignedObserver: 'नियुक्त आरोग्य निरीक्षक',
    doctorDirectory: 'डॉक्टर निर्देशिका',
    messageObserver: 'निरीक्षकाला संदेश पाठवा',
    wellbeingStatus: 'आरोग्य स्थिती',
    nextCheckin: 'पुढील तपासणी',
    wellbeingTrajectory: 'मानसिक आरोग्याचा आलेख',
    immediateSupport: 'तातडीचे सहाय्य मार्ग',
    aiCompanion: 'एआय साथी समुपदेशक',
    telemanas: 'टेलि-मानस केअर',
    emergencyAmbulance: 'तातडीचे ११२ व १०८',
    ministryBadge: 'अन्वय (ANVAYA) • भारत सरकार MoSJE सुरक्षा नेटवर्क',
    heroHeadline: 'एआय-आधारित मानसिक आरोग्य देखरेख व तणाव अंदाज',
    heroSubheadline: 'SC/ST (अत्याचार प्रतिबंधक) कायद्यांतर्गत पीडितांसाठी गोपनीय व बहु-आयामी मानसिक सुरक्षा व्यवस्था.',
    createAccountCta: 'खाते तयार करा (नोंदणी)',
    signInCta: 'पोर्टल लॉगिन',
    anonymousCheckinCta: 'अनामिक तपासणी करा',
    rolePortalsTitle: 'SIH मूल्यांकन 1-क्लिक रोल पोर्टल्स',
    encryptedStorageBadge: 'MongoDB एनक्रिप्टेड सुरक्षा',
    confidentialityBadge: '१००% गोपनीय व सुरक्षित',
    emergencyProtocolBadge: '१०८ आपत्कालीन रुग्णवाहिका प्रोटोकॉल',
    questions: {
      1: {
        title: 'आज तुम्हाला कसे वाटत आहे?',
        options: {
          a: 'मी ठीक आहे',
          b: 'थोडे उदास',
          c: 'बहुतांश वेळ दुःख',
          d: 'खूप जास्त उदासी आणि जडपणा',
        },
      },
      2: {
        title: 'नुकताच तुमचा मूड कसा राहिला आहे?',
        options: {
          a: 'सामान्य चढ-उतार',
          b: 'कधीकधी उदास',
          c: 'सतत दुःख',
          d: 'सतत वेदना, आराम नाही',
        },
      },
      3: {
        title: 'आतल्या आत किती भीती वाटते?',
        options: {
          a: 'शांत आणि सामान्य',
          b: 'थोडी अस्वस्थता',
          c: 'वारंवार भीती',
          d: 'तीव्र भीती आणि थरकाप',
        },
      },
      4: {
        title: 'रात्री झोप कशी येत आहे?',
        options: {
          a: 'शांत आणि पूर्ण झोप',
          b: 'झोपायला वेळ लागतो',
          c: 'रात्री वारंवार जाग',
          d: 'फक्त 2-3 तास झोप',
        },
      },
      5: {
        title: 'जेवणाची भूक कशी आहे?',
        options: {
          a: 'सामान्य भूक',
          b: 'आधीपेक्षा कमी खाणे',
          c: 'अजिबात भूक नाही',
          d: 'जबरदस्तीने खावे लागते',
        },
      },
      6: {
        title: 'कामांवर लक्ष केंद्रित करू शकता का?',
        options: {
          a: 'होय, लक्ष व्यवस्थित आहे',
          b: 'कधीकधी लक्ष विचलित',
          c: 'लक्ष देणे कठीण',
          d: 'अजिबात लक्ष लागत नाही',
        },
      },
      7: {
        title: 'आज तुमच्यात किती ऊर्जा आहे?',
        options: {
          a: 'सामान्य ऊर्जा',
          b: 'काम सुरू करायला कष्ट',
          c: 'साधे काम करणेही कठीण',
          d: 'मदतीशिवाय काहीच अशक्य',
        },
      },
      8: {
        title: 'आसपासच्या लोकांशी कसे वाटते?',
        options: {
          a: 'आपुलकी वाटते',
          b: 'आवड कमी झाली आहे',
          c: 'सर्वांपासून दूर राहावेसे वाटते',
          d: 'काहीच भावना उरल्या नाहीत',
        },
      },
      9: {
        title: 'मनात कसे विचार येत आहेत?',
        options: {
          a: 'आशावादी विचार',
          b: 'कधीकधी निराशा',
          c: 'स्वतःला दोषी समजणे',
          d: 'पूर्णपणे हताश व असहाय्य',
        },
      },
      10: {
        title: 'भविष्याबद्दल तुम्हाला काय वाटते?',
        options: {
          a: 'मला पुढे जायचे आहे',
          b: 'जीवन थकवणारे वाटते',
          c: 'जगण्याची इच्छा नसते',
          d: 'तातडीची मदत हवी आहे',
        },
      },
      11: {
        title: 'नुकतीच तुम्हाला कोणती धमकी किंवा असुरक्षितता जाणवली का?',
        options: {
          a: 'नाही, मी सुरक्षित आहे',
          b: 'होय, मनात भीती वाटते',
          c: 'होय, बाहेर अस्वस्थ वाटले',
          d: 'होय, प्रत्यक्ष धमकी मिळाली',
        },
      },
      12: {
        title: 'सध्या जिथे राहता, ती जागा सुरक्षित वाटते का?',
        options: {
          a: 'होय, पूर्णपणे सुरक्षित',
          b: 'घरी बऱ्यापैकी सुरक्षित',
          c: 'कधीकधी भीती वाटते',
          d: 'नाही, सतत दहशतीत राहतो',
        },
      },
    },
  },
};

export const getTranslation = (langCode: string): TranslationItem => {
  return translations[langCode] || translations.en;
};

