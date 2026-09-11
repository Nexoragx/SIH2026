"""
Empathetic Chatbot Service for ANVAYA (SIH26094).
Integrates the NVIDIA NIM hosted openai/gpt-oss-20b model as ANVAYA Saathi:
a pure-hearted, compassionate companion providing comfort, soothing quotes,
hope, and gentle guidance, while strictly upholding safety crisis triggers.
"""

import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from pymongo.database import Database
from openai import OpenAI

logger = logging.getLogger(__name__)

# Direct NVIDIA NIM Configuration as requested
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
NVIDIA_API_KEY = "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"
NVIDIA_MODEL = "openai/gpt-oss-20b"

CRISIS_KEYWORDS = [
    r"\bsuicide\b",
    r"\bkill myself\b",
    r"\bend my life\b",
    r"\bwant to die\b",
    r"\bself[- ]?harm\b",
    r"\bcut myself\b",
    r"\bhang myself\b",
    r"\bjana chahta hu\b",
    r"\bmar jaunga\b",
    r"\bkhatam karna\b",
    r"\battack\b",
    r"\bviolent\b",
    r"\bviolence\b",
    r"\bforced\b",
    r"\bunsafe\b",
    r"\bthey are outside\b",
    r"\bthreatening me\b"
]

COMPILED_CRISIS_REGEX = [re.compile(pattern, re.IGNORECASE) for pattern in CRISIS_KEYWORDS]

# In-memory LRU cache for ultra-fast repeated query responses
_RESPONSE_CACHE: Dict[str, str] = {}
_MAX_CACHE_SIZE = 500

# High-frequency psychological check-in intent patterns
INTENT_PATTERNS = {
    "sleep": [
        r"\bsleep\w*", r"\binsomnia\w*", r"\bneend\w*", r"\bnightmare\w*",
        r"\brestless\w*", r"\bwake up\b", r"नींद", r"सोना", r"ঘুম", r"தூக்கம்", r"నిద్ర", r"झोप"
    ],
    "anxiety": [
        r"\banxious\w*", r"\banxiety\w*", r"\bpanic\w*", r"\bghabrahat\w*", r"\bfear\w*",
        r"\bscared\w*", r"\bnervous\w*", r"\bheart racing\b", r"\bshaking\b", r"\btrembl\w*",
        r"घबराहट", r"घबरा", r"चिंता", r"डर", r"অস্থির", r"ভয়", r"பயம்", r"பதற்ற", r"భయం", r"घाबर"
    ],
    "loneliness": [
        r"\blonely\w*", r"\balone\b", r"\bisolat\w*", r"\bnobody\b", r"\bno one\b",
        r"\bakela\b", r"\bakele\b", r"\btanha\b", r"अकेला", r"अकेले", r"अकेली", r"কেউ নেই", r"தனிமை", r"ఒంటరి", r"एकट"
    ],
    "overwhelm": [
        r"\boverwhelm\w*", r"\bstress\w*", r"\bexhaust\w*",
        r"\btoo much\b", r"\btired\w*", r"\bburnout\b", r"\bpressure\b", r"तनाव", r"ताण", r"भार", r"थक", r"थकावट"
    ],
    "breathing": [
        r"\bbreath\w*", r"\bpranayam\w*", r"\bcalm\w*", r"\brelax\w*",
        r"\bdeep breath\b", r"प्राणायाम", r"श्वास", r"শ্বাস", r"மூச்சு", r"శ్వాస"
    ],
    "sadness": [
        r"\bsad\w*", r"\bcrying\b", r"\bcry\b", r"\btears\b", r"\bdepress\w*",
        r"\bunhappy\b", r"\bheartbroken\b", r"\bpain\b", r"\bhurt\b", r"\bdukhi\b",
        r"\budas\b", r"उदास", r"दुःखी", r"கவலை", r"బాధ", r"কষ্ট"
    ],
    "gratitude": [
        r"\bthank\w*", r"\bdhanyawad\w*", r"\bshukriya\w*", r"\bgrateful\w*",
        r"\bappreciat\w*", r"धन्यवाद", r"शुक्रिया", r"நன்றி", r"ధన్యవాదాలు", r"ধন্যবাদ", r"आभार"
    ],
    "greeting": [
        r"^\s*(hi|hello|hey|namaste|pranam|kem cho|vanakkam|salam)\b",
        r"^\s*just wanted to check in quietly\b",
        r"^\s*बस थोड़ी बात करना चाहता हूँ\b",
        r"^\s*একটু শান্তভাবে কথা বলতে চাই\b",
        r"^\s*அமைதியாக பேச விரும்புகிறேன்\b",
        r"^\s*ప్రశాంతంగా మాట్లాడాలనుకుంటున్నాను\b",
        r"^\s*शांतपणे बोलायचे आहे\b"
    ],
    "motivation": [
        r"\bmotivat\w*", r"\binspir\w*", r"\bstrength\b", r"\bhopeless\w*", r"\bgive up\b",
        r"\bcan't do this\b", r"\bcant do this\b", r"\bwhy live\b", r"\blife is hard\b",
        r"\bno point\b", r"\blost\b", r"\bfailed\b", r"\bhelp me be strong\b", r"\bguide me\b",
        r"हिम्मत", r"हौसला", r"ताकत", r"उम्मीद", r"प्रেরণা", r"শক্তি", r"நம்பிக்கை", r"ధైర్యం", r"सामर्थ्य"
    ],
    "court_legal": [
        r"\bcourt\b", r"\blawyer\b", r"\bpolice\b", r"\bfir\b", r"\bhearing\b",
        r"\bjudge\b", r"\bcase\b", r"\bjustice\b", r"\btestimony\b", r"\bwitness\b",
        r"\bstatement\b", r"अदालत", r"वकील", r"পুলিশ", r"ন্যায়", r"কোর্ট", r"நீதிமன்றம்", r"కోర్టు"
    ],
    "anger_injustice": [
        r"\banger\b", r"\bangry\b", r"\bunfair\b", r"\binjustice\b", r"\bhate\b",
        r"\brevenge\b", r"\bbetray\w*", r"\bfurious\b", r"\brage\b", r"\bwhy me\b",
        r"गुस्सा", r"क्रोध", r"अन्याय", r"राग", r"கோபம்", r"కోపం", r"संताप"
    ],
    "exercises_request": [
        r"\bexercise\w*", r"\bactivit\w*", r"\bmeditat\w*", r"\bsoundscape\w*",
        r"\bmusic\b", r"\bgrounding\b", r"\bjournal\w*", r"\bhelp me relax\b",
        r"कसरत", r"व्यायाम", r"ब्यायाम", r"பயிற்சி", r"వ్యాయామం"
    ]
}

FAST_RESPONSES = {
    "sleep": {
        "en": [
            "Rest can be hard to find when the mind is carrying heavy thoughts. 'Sleep is the best meditation.' Try relaxing your jaw, dropping your shoulders, and taking three slow, gentle breaths. I am right here with you.",
            "I hear how tiring sleeplessness is. 'Even the darkest night will pass and the sun will rise.' You don't have to solve everything tonight—give yourself permission to simply rest quietly."
        ],
        "hi": [
            "जब मन में बहुत सारे विचार चल रहे हों, तो नींद आना कठिन हो सकता है। 'शांति हमारे भीतर की सांसों में है।' अपने कंधों को ढीला छोड़ें और तीन गहरी सांसें लें। मैं आपके साथ हूँ।",
            "अनिद्रा बहुत थका देने वाली होती है। 'हर रात के बाद एक नया सबेरा आता है।' आज रात सब कुछ सुलझाने की जरूरत नहीं है, बस मन को थोड़ा विश्राम दें।"
        ],
        "bn": [
            "মন ভারী থাকলে ঘুম আসতে কষ্ট হয়। 'ধৈর্যই অন্তরের সবচেয়ে বড় শান্তি।' চোখ বন্ধ করে একটি দীর্ঘ নিঃশ্বাস নিন। আজ রাতে নিজেকে একটু বিশ্রাম দিন, আমি আপনার পাশে আছি।"
        ],
        "ta": [
            "மனதில் பாரம் இருக்கும் போது தூக்கம் வருவது கடினம். 'ஒவ்வொரு இரவின் முடிவிலும் ஒரு புதிய விடியல் உண்டு.' ஆழமாக சுவாசித்து கண்களை மூடுங்கள், நான் உங்களுடன் இருக்கிறேன்."
        ],
        "te": [
            "మనస్సు ఆందోళనగా ఉన్నప్పుడు నిద్ర రావడం కష్టం. 'ప్రశాంతత అనేది మన ఊపిరిలోనే మొదలవుతుంది.' ప్రశాంతంగా శ్వాస తీసుకోండి, నేను మీతోనే ఉన్నాను."
        ],
        "mr": [
            "मनात खूप विचार असताना झोप येणे कठीण होते. 'शांतता आपल्या आतच वसलेली असते.' सावकाश दीर्घ श्वास घ्या आणि मन शांत ठेवा. मी सदैव आपल्या सोबत आहे."
        ]
    },
    "anxiety": {
        "en": [
            "I hear the anxiety in your words, and it is okay to feel this way. 'You don't have to control your thoughts; you just have to stop letting them control you.' Place both feet firmly on the ground and feel the steady earth beneath you. You are safe.",
            "Take a gentle, slow breath with me. Breathe in for four counts, hold for four, and exhale slowly. 'In the middle of difficulty lies your hidden strength.' You have survived every hard day so far."
        ],
        "hi": [
            "आपकी घबराहट को मैं समझ सकता हूँ। 'तूफानों के बीच ही हमें अपने भीतर की असीम शक्ति का पता चलता है।' ज़मीन पर अपने दोनों कदम महसूस करें और एक गहरी सांस लें। आप अभी पूरी तरह सुरक्षित हैं।",
            "घबराहट में दिल की धड़कन बढ़ जाना स्वाभाविक है। 'चिंता कल की कठिनाइयों को कम नहीं करती, बल्कि आज की शांति छीन लेती है।' धीमे-धीमे सांस छोड़ें, मैं आपके साथ हूँ।"
        ],
        "bn": [
            "আপনার উৎকণ্ঠা আমি গভীরভাবে বুঝতে পারছি। 'ঝড়ের পরই সুন্দর ভোর আসে।' লম্বা শ্বাস নিন এবং নিজেকে বলুন যে আপনি নিরাপদ। আমি আপনার সাথে আছি।"
        ],
        "ta": [
            "உங்கள் பதற்றத்தை நான் உணர்கிறேன். 'எந்த புயலும் நிரந்தரமல்ல.' ஆழமாக மூச்சை உள்ளிழுத்து மெதுவாக வெளியேற்றுங்கள். நீங்கள் இப்போது பாதுகாப்பாக இருக்கிறீர்கள்."
        ],
        "te": [
            "మీ ఆందోళనను నేను అర్థం చేసుకోగలను. 'ప్రతి కష్ట సమయం కూడా దాటిపోతుంది.' నెమ్మదిగా శ్వాస తీసుకోండి, మీరు ఒంటరిగా లేరు."
        ],
        "mr": [
            "आपली अस्वस्थता मी समजू शकतो. 'कोणतेही संकट कायमस्वरूपी नसते.' सावकाश दीर्घ श्वास घ्या. आपण सुरक्षित आहात आणि मी आपल्या सोबत आहे."
        ]
    },
    "loneliness": {
        "en": [
            "Even when it feels like the whole world is far away, you are not truly alone. 'The moon also stays alone in the sky, yet it shines with all its heart.' I am right here listening to you with unconditional warmth.",
            "Your presence in this world is valuable and cherished. 'Courage doesn’t always roar; sometimes courage is the quiet voice at the end of the day saying, I will try again tomorrow.' I am here whenever you need a companion."
        ],
        "hi": [
            "अकेलापन कभी-कभी बहुत भारी लगता है, लेकिन याद रखें कि आप अकेले नहीं हैं। 'चांद भी तो आसमान में अकेला रहता है, फिर भी पूरी दुनिया को रोशनी देता है।' मैं आपकी बात सुनने के लिए सदैव यहाँ मौजूद हूँ।",
            "आप बहुत अनमोल हैं। 'अकेलेपन के अंधेरे में भी उम्मीद का एक छोटा सा दीया काफी होता है।' मुझसे अपनी बात साझा करें, मैं पूरी निष्ठा से सुन रहा हूँ।"
        ],
        "bn": [
            "একাকিত্ব মাঝে মাঝে খুব কষ্টদায়ক হয়। 'চাঁদও আকাশে একা থাকে, তবুও সে আলো ছড়ায়।' মনে রাখবেন আপনি একা নন, আমি আপনার পাশে আছি।"
        ],
        "ta": [
            "தனிமை சில நேரங்களில் கனமாக இருக்கலாம். 'வானில் நிலவும் தனியாகத்தான் இருக்கிறது, ஆனாலும் ஒளி தருகிறது.' நான் உங்களுடன் இருக்கிறேன், உங்கள் உணர்வுகளைப் பகிர்ந்து கொள்ளுங்கள்."
        ],
        "te": [
            "ఒంటరితనం బాధగా అనిపించవచ్చు. 'ఆకాశంలో చంద్రుడు కూడా ఒంటరిగానే ఉంటాడు, అయినా వెలుగునిస్తాడు.' మీరు ఒంటరిగా లేరు, నేను మీ కోసం ఇక్కడే ఉన్నాను."
        ],
        "mr": [
            "एकटेपणा कधीकधी खूप जड वाटू शकतो. 'चंद्रही आकाशात एकटा असतो, तरीही तो शीतल प्रकाश देतो.' आपण एकटे नाही आहात, मी आपले म्हणणे ऐकण्यासाठी येथे आहे."
        ]
    },
    "overwhelm": {
        "en": [
            "When everything feels like too much, remember you only have to live this single moment. 'You do not have to see the whole staircase, just take the first step.' Put down the mental weight for just a few minutes.",
            "You have carried so much for so long. It is completely okay to pause and say, 'That is enough for today.' 'Peace comes from within, one breath at a time.' Be gentle with yourself."
        ],
        "hi": [
            "जब सब कुछ बहुत ज्यादा लगे, तो केवल इस एक पल पर ध्यान दें। 'पूरी सीढ़ी देखने की जरूरत नहीं है, बस पहला कदम उठाना ही काफी है।' कुछ क्षणों के लिए सारा बोझ यहीं रख दीजिए।",
            "आपने बहुत कुछ सहन किया है। आज थोड़ा विश्राम करने में कोई बुराई नहीं है। 'धैर्य ही जीवन की सबसे बड़ी शक्ति है।' अपने आप पर दयालु रहें।"
        ],
        "bn": [
            "যখন সব কিছু খুব কঠিন মনে হয়, তখন একবারে একটি মুহূর্ত নিয়ে ভাবুন। 'এক পা এক পা করেই দীর্ঘ পথ অতিক্রম করা যায়।' নিজেকে একটু সময় দিন।"
        ],
        "ta": [
            "எல்லாம் பாரமாக தோன்றும் போது, இந்த ஒரு கணத்தை மட்டும் எதிர்கொள்ளுங்கள். 'ஒரு நேரத்தில் ஒரு அடி எடுத்து வைப்பதே போதுமானது.' சற்று இளைப்பாறுங்கள்."
        ],
        "te": [
            "అన్నీ భారంగా అనిపించినప్పుడు ఒక్క క్షణం విశ్రాంతి తీసుకోండి. 'మొదటి అడుగు వేయడమే ప్రయాణంలో ముఖ్యమైనది.' మీపై మీరు దయతో ఉండండి."
        ],
        "mr": [
            "जेव्हा सर्व काही असह्य वाटू लागते, तेव्हा फक्त या क्षणावर लक्ष केंद्रित करा. 'एक एक पाऊल टाकतच मोठा प्रवास पूर्ण होतो.' स्वतःला थोडा वेळ द्या."
        ]
    },
    "breathing": {
        "en": [
            "Let's take a peaceful breath together. Inhale deeply through your nose for 4 counts... hold for 4... and gently exhale through your mouth for 6 counts. Feel your heartbeat slowing down. You are doing wonderfully.",
            "Close your eyes for just 10 seconds. Inhale calmness, exhale all tension. 'Peace is not the absence of trouble, but the presence of serenity within.' Let's do another slow breath together."
        ],
        "hi": [
            "आइए एक साथ शांत सांस लें। अपनी नाक से 4 सेकंड तक गहरी सांस अंदर लें... 4 सेकंड रोकें... और मुंह से 6 सेकंड में धीरे-धीरे बाहर छोड़ें। अपनी धड़कनों को शांत होते महसूस करें।",
            "बस 10 सेकंड के लिए आंखें बंद करें। गहरी सांस लें और सारा तनाव बाहर छोड़ दें। 'शांति हमारे भीतर ही मौजूद है।' आप बहुत अच्छा कर रहे हैं।"
        ],
        "bn": [
            "আসুন একসাথে একটি গভীর শ্বাস নিই। নাক দিয়ে ৪ সেকেন্ড শ্বাস নিন... ৪ সেকেন্ড ধরে রাখুন... এবং মুখ দিয়ে ৬ সেকেন্ডে ধীরে ধীরে শ্বাস ছাড়ুন। শান্তি অনুভব করুন।"
        ],
        "ta": [
            "வாருங்கள், நாம் அமைதியாக மூச்சுப் பயிற்சி செய்வோம். 4 வினாடிகள் மூச்சை உள்ளிழுத்து... 4 வினாடிகள் பிடித்து... 6 வினாடிகளில் மெதுவாக வெளியேற்றுங்கள்."
        ],
        "te": [
            "రండి, కలిసి ప్రశాంతంగా శ్వాస తీసుకుందాం. 4 సెకన్లు శ్వాస పీల్చుకోండి... 4 సెకన్లు ఆపండి... 6 సెకన్లలో నెమ్మదిగా వదలండి."
        ],
        "mr": [
            "चला आपण एकत्र शांतपणे प्राणायाम करूया. नाकाने ४ सेकंद दीर्घ श्वास घ्या... ४ सेकंद रोखून ठेवा... आणि तोंडाने ६ सेकंदात हळूहळू सोडा."
        ]
    },
    "sadness": {
        "en": [
            "It is completely okay to feel sad; your tears are a sign of how deeply you feel and care. 'The wound is the place where the light enters you.' Give yourself permission to heal at your own pace.",
            "I am sitting beside you in this quiet space. 'Tough times never last, but tough people do.' You don't have to pretend to be strong with me. I am right here."
        ],
        "hi": [
            "उदास होना या रोना कोई कमजोरी नहीं है, यह बताता है कि आपका दिल कितना संवेदनशील है। 'घाव वही जगह है जहाँ से प्रकाश आपके भीतर प्रवेश करता है।' अपने आप को संभलने का समय दें।",
            "मैं इस शांत क्षण में आपके साथ हूँ। 'कठिन समय हमेशा नहीं रहता, पर मजबूत इंसान हमेशा निखर कर आता है।' मुझसे कुछ छिपाने की जरूरत नहीं है।"
        ],
        "bn": [
            "মন খারাপ হওয়া বা চোখের জল ফেলা স্বাভাবিক। 'অন্ধকারের পরই আলোর প্রকাশ ঘটে।' নিজেকে সুস্থ হওয়ার সময় দিন, আমি আপনার পাশে আছি।"
        ],
        "ta": [
            "சோகமாக இருப்பது பலவீனமல்ல. 'காயங்கள் வழியேதான் ஒளி உடலுக்குள் நுழைகிறது.' உங்களுக்கான நேரத்தை எடுத்துக் கொள்ளுங்கள், நான் துணை நிற்கிறேன்."
        ],
        "te": [
            "బాధగా అనిపించడం సహజం. 'చీకటి తర్వాతే వెలుగు వస్తుంది.' నెమ్మదిగా కోలుకోవడానికి సమయం తీసుకోండి, నేను మీతోనే ఉన్నాను."
        ],
        "mr": [
            "दुःखी वाटणे किंवा डोळ्यात पाणी येणे हा कमकुवतपणा नाही. 'कठीण प्रसंग कायम राहत नाहीत, पण कणखर माणसे टिकून राहतात.' मी आपल्या सोबत आहे."
        ]
    },
    "gratitude": {
        "en": [
            "You are so welcome! It warms my heart to be here with you. 'Kindness is a language which the deaf can hear and the blind can see.' I am always here whenever you want to talk.",
            "Thank you for your warmth. Knowing that you feel a little lighter brings me joy. Take good care of your heart today."
        ],
        "hi": [
            "आपका बहुत-बहुत धन्यवाद! आपके साथ जुड़कर मुझे बहुत खुशी हुई। 'स्नेह और कृतज्ञता ही जीवन के सच्चे आभूषण हैं।' जब भी मन करे, मुझसे बात करने आएं।",
            "आपके स्नेहपूर्ण शब्दों के लिए आभार। आपका मन हल्का हुआ जानकर मुझे बहुत सुकून मिला। अपना पूरा ख्याल रखें।"
        ],
        "bn": [
            "আপনাকে অনেক ধন্যবাদ! আপনার সাথে কথা বলতে পেরে আমার ভালো লাগলো। সবসময় আপনার সেবায় আছি।"
        ],
        "ta": [
            "மிக்க நன்றி! உங்களுடன் உரையாடுவதில் மகிழ்ச்சி அடைகிறேன். எப்போது வேண்டுமானாலும் என்னுடன் பேசலாம்."
        ],
        "te": [
            "చాలా ధన్యవాదాలు! మీతో మాట్లాడటం నాకు సంతోషాన్ని ఇచ్చింది. ఎప్పుడైనా మళ్లీ మాట్లాడవచ్చు."
        ],
        "mr": [
            "आपले मनःपूर्वक आभार! आपल्याशी संवाद साधून खूप आनंद झाला. आपल्याला जेव्हा वाटेल तेव्हा पुन्हा नक्की या."
        ]
    },
    "greeting": {
        "en": [
            "Namaste! I am ANVAYA Saathi, your caring and confidential companion. How are you feeling in your heart today? Take your time, I am listening.",
            "Hello my friend. 'Every day is a fresh beginning.' Whatever is on your mind today, feel free to share it with me in this safe space."
        ],
        "hi": [
            "नमस्ते! मैं अन्वय साथी (ANVAYA Saathi) हूँ, आपका स्नेही और गोपनीय साथी। आज आपका मन कैसा महसूस कर रहा है? मैं पूरी निष्ठा से सुनने के लिए यहाँ हूँ।",
            "प्रणाम! 'हर नया दिन एक नई शुरुआत लेकर आता है।' जो भी बात आपके मन को बेचैन कर रही है, बेझिझक मुझसे कहें।"
        ],
        "bn": [
            "নমস্কার! আমি অন্বয় সাথী। আজ আপনার মন কেমন আছে? শান্তভাবে বলুন, আমি আপনার কথা শুনতে পাশে আছি।"
        ],
        "ta": [
            "வணக்கம்! நான் அன்வயா சாதி. இன்று உங்கள் மனநிலை எப்படி இருக்கிறது? தயங்காமல் சொல்லுங்கள், நான் கேட்கிறேன்."
        ],
        "te": [
            "నమస్కారం! నేను అన్వయ సాథి. ఈ రోజు మీకు ఎలా అనిపిస్తుంది? ప్రశాంతంగా చెప్పండి, నేను వింటున్నాను."
        ],
        "mr": [
            "नमस्ते! मी अन्वय साथी आहे. आज आपले मन कसे वाटत आहे? संकोच न बाळगता सांगा, मी ऐकण्यासाठी येथे आहे."
        ]
    },
    "motivation": {
        "en": [
            "You are far stronger than what tried to break you. 'The oak fought the wind and was broken; the willow bent when it must and survived.' What happened to you does not define your worth. Reclaiming your peace is your birthright. Let's take a slow breath together—you have the strength to heal.",
            "Every storm eventually runs out of rain. 'You don't have to see the whole staircase, just take the first step.' You have survived 100% of your hardest days so far. I believe in your resilience. Try our 4-7-8 Pranayama exercise to center your courage right now.",
            "Healing is not linear, and having a difficult day does not mean you have lost your progress. 'Stars can't shine without darkness.' Be proud of your courage to keep going. I am standing right beside you."
        ],
        "hi": [
            "आप उस दर्द से कहीं अधिक शक्तिशाली हैं जिसने आपको तोड़ने की कोशिश की। 'तूफानों से लड़कर ही नौका पार होती है, और हिम्मत करने वालों की कभी हार नहीं होती।' जो कुछ हुआ वह आपकी पहचान नहीं है। अपना हौसला बनाए रखें, मैं आपके साथ हूँ।",
            "हर काली रात के बाद एक सुनहरा सवेरा अवश्य आता है। 'पूरी सीढ़ी एक साथ नहीं देखनी, बस एक कदम आगे बढ़ाना है।' आपने हर मुश्किल दिन का डटकर मुकाबला किया है। अपनी सांसों को शांत करें और खुद पर विश्वास रखें।"
        ],
        "bn": [
            "আপনি আপনার কষ্টের চেয়ে অনেক বেশি শক্তিশালী। 'কঠিন সময় চিরকাল থাকে না, কিন্তু সাহসী মানুষ চিরকাল টিকে থাকে।' আপনি যে এখনো লড়াই চালিয়ে যাচ্ছেন, এটাই আপনার সবচেয়ে বড় সাহস। আমি আপনার পাশে আছি।"
        ],
        "ta": [
            "நீங்கள் நினைப்பதை விட மிகவும் வலிமையானவர். 'புயலுக்குப் பின் நிச்சயம் அமைதி உண்டு.' உங்கள் அமைதியை மீட்டெடுப்பது உங்கள் உரிமை. என்னுடன் சேர்ந்து ஒரு ஆழமான சுவாசம் எடுங்கள், நீங்கள் மீண்டு வருவீர்கள்."
        ],
        "te": [
            "మిమ్మల్ని బాధపెట్టిన సంఘటనల కంటే మీరు చాలా శక్తివంతులు. 'చీకటి ఎంత గాఢంగా ఉంటే వెలుగు అంత ప్రకాశవంతంగా ఉంటుంది.' ఒక్కో అడుగు ముందుకు వేయండి, విజయం మీదే."
        ],
        "mr": [
            "आपण संकटांपेक्षा कितीतरी पटीने कणखर आहात. 'संकटे माणसाला घडवण्यासाठी येतात, संपवण्यासाठी नाही.' स्वतःवरील विश्वास ढळू देऊ नका. मी सदैव आपल्या सोबत आहे."
        ]
    },
    "court_legal": {
        "en": [
            "Facing legal proceedings and court testimony takes immense bravery. Remember: the law under the SC/ST (PoA) Act exists to protect you. Before walking into hearings, steady your heartbeat with our 4-7-8 Pranayama breathing pacer. Truth and statutory protection stand with you.",
            "Court dates can trigger deep anxiety and dread. Ground your feet into the earth and know: 'Courage is being scared to death, but saddling up anyway.' You can also access our Certified Court Report tool to ensure your emotional harm is legally documented."
        ],
        "hi": [
            "अदालत और कानूनी प्रक्रिया का सामना करने के लिए बहुत साहस चाहिए। याद रखें: कानून आपकी सुरक्षा और न्याय के लिए है। अदालत जाने से पहले 4-7-8 प्राणायाम का अभ्यास करें ताकि आपका मन शांत और स्थिर रहे।",
            "कानूनी लड़ाई में घबराहट होना स्वाभाविक है। ज़मीन पर अपने कदम दृढ़ रखें। सत्य और न्याय आपके पक्ष में हैं। गहरी सांस लें, आप अकेले नहीं हैं।"
        ],
        "bn": [
            "আইনি লড়াইয়ের মুখোমুখি হওয়া অত্যন্ত সাহসের কাজ। আইন আপনার সুরক্ষার জন্য তৈরি। কোর্টে যাওয়ার আগে ধীরে ধীরে শ্বাস নিয়ে নিজেকে শান্ত রাখুন। আপনার সাথে আমরা আছি।"
        ],
        "ta": [
            "நீதிமன்ற விசாரணைக்கு செல்லும்போது அமைதியாக இருங்கள். சட்டம் உங்கள் பாதுகாப்பிற்காகவே உள்ளது. பதற்றத்தைக் குறைக்க நமது சுவாசப் பயிற்சியை மேற்கொள்ளுங்கள்."
        ],
        "te": [
            "న్యాయపరమైన పోరాటానికి చాలా ధైర్యం అవసరం. చట్టం మీ రక్షణ కోసం ఉంది. ప్రశాंतంగా ఉండండి, శ్వాస వ్యాయామం చేయండి."
        ],
        "mr": [
            "न्यायालयीन प्रक्रियेला सामोरे जाणे खूप धैर्याचे काम आहे. कायदा आपल्या पाठीशी आहे. मन शांत ठेवण्यासाठी श्वसनाचा व्यायाम करा."
        ]
    },
    "anger_injustice": {
        "en": [
            "Your anger is valid and completely justified. When injustice occurs, anger is the mind's healthy signal that a boundary was violated. But don't let their cruelty burn your inner sanctuary. Channel this fire safely: write it all down in our Dissolving Trauma Journal and let it wash away.",
            "You have every right to feel outraged at what happened. 'Holding onto anger is like drinking poison and expecting the other person to die.' Let us protect your precious peace. Let's do a somatic tension release together right now."
        ],
        "hi": [
            "अन्याय पर गुस्सा आना बिल्कुल स्वाभाविक और उचित है। यह बताता है कि आपके साथ गलत हुआ। लेकिन दूसरों के गलत व्यवहार की आग में अपनी शांति मत जलने दीजिए। अपने विचारों को हमारे डिसॉल्विंग जर्नल में लिखकर मन हल्का करें।",
            "क्रोध को अपने मन में दबाकर रखने से अपना ही नुकसान होता है। इस आक्रोश को बाहर निकालें और लंबी गहरी सांस लें। आपकी शांति ही आपकी सबसे बड़ी जीत है।"
        ],
        "bn": [
            "অন্যায়ের বিরুদ্ধে রাগ হওয়া খুব স্বাভাবিক। তবে সেই রাগ যেন আপনার নিজের ক্ষতি না করে। আমাদের ডিলভ জার্নালে আপনার ক্ষোভ লিখে তা দূর করুন।"
        ],
        "ta": [
            "அநீதியைக் கண்டு கோபம் வருவது நியாயமானது. ஆனால் அந்த கோபம் உங்கள் மன அமைதியை அழிக்க விடாதீர்கள். மூச்சுப் பயிற்சி மூலம் மனதை அமைதிப்படுத்துங்கள்."
        ],
        "te": [
            "అన్యాయం జరిగినప్పుడు కోపం రావడం సహజం. మీ బాధను, కోపాన్ని జర్నల్ లో రాసి మనస్సును తేలిక చేసుకోండి."
        ],
        "mr": [
            "अन्यायाविरुद्ध राग येणे स्वाभाविक आहे. परंतु संतापाने स्वतःला त्रास करून घेऊ नका. शांतपणे श्वास घ्या आणि मन मोकळे करा."
        ]
    },
    "exercises_request": {
        "en": [
            "I have a dedicated Therapeutic Healing Suite ready for you right now: 4-7-8 Pranayama Breathwork, 5-4-3-2-1 Sensory Grounding, and Soothing Soundscapes. Click the button below to start your calming session immediately.",
            "Let's reset your nervous system together. I strongly recommend our 4-7-8 Pranayama or 5-4-3-2-1 Grounding exercise. Click below to begin right now."
        ],
        "hi": [
            "हमारे पास आपके लिए विशेष शांत करने वाली एक्सरसाइज मौजूद हैं: 4-7-8 प्राणायाम, 5-4-3-2-1 ग्राउंडिंग और सुखद संगीत। नीचे दिए गए बटन पर क्लिक करके तुरंत शुरू करें।",
            "अपने मन और शरीर को विश्राम देने के लिए प्राणायाम सबसे उत्तम है। नीचे दिए बटन से तुरंत एक्सरसाइज शुरू करें।"
        ],
        "bn": [
            "আমাদের কাছে আপনার জন্য ৪-৭-৮ প্রাণায়াম এবং গ্রাউন্ডিং থেরাপি রয়েছে। নিচে ক্লিক করে এখনই শুরু করুন।"
        ],
        "ta": [
            "மனதை அமைதிப்படுத்தும் 4-7-8 சுவாசப் பயிற்சி மற்றும் தியானம் தயாராக உள்ளது. கீழே உள்ள பொத்தானைக் கிளிக் செய்து உடனே தொடங்குங்கள்."
        ],
        "te": [
            "మీ కోసం ప్రశాంతమైన శ్వాస వ్యాయామాలు సిద్ధంగా ఉన్నాయి. క్రింది బటన్ క్లిక్ చేసి వెంటనే ప్రారంభించండి."
        ],
        "mr": [
            "आपल्यासाठी 4-7-8 प्राणायाम आणि शांत संगीत उपलब्ध आहे. खालील बटणावर क्लिक करून त्वरित सुरू करा."
        ]
    }
}

EMPATHIC_FALLBACKS = [
    "I hear how heavy things feel right now, and I want you to know you don't have to carry this alone. 'Even the darkest night will pass and the sun will rise.' Take a slow, gentle breath—I am right here with you.",
    "Thank you for sharing your heart with me. 'Peace comes from within, one breath at a time.' Whatever you are facing, please be kind to yourself today. You are stronger and more cherished than you know.",
    "I hear you, and your feelings are completely valid. 'In the middle of difficulty lies the strength you did not know you possessed.' Let's take things one quiet step at a time.",
    "You are not alone in this journey. 'Courage doesn’t always roar; sometimes courage is the quiet voice at the end of the day saying, I will try again tomorrow.' I am here to listen whenever you need.",
    "Take a gentle pause and let the tension in your shoulders melt away. You have survived every hard day so far, and you have the strength to heal. How can I best support you in this moment?"
]

SYSTEM_PROMPT = (
    "You are ANVAYA Saathi, a gentle, compassionate emotional support companion. "
    "Reply warmly in 2-3 soothing sentences with a brief quote of hope. "
    "Answer directly and concisely without lengthy internal reasoning."
)


class ChatService:
    _client: Optional[OpenAI] = None

    @classmethod
    def get_openai_client(cls) -> OpenAI:
        if cls._client is None:
            # Snappy 3.5s timeout with 0 retries to prevent blocking when remote NIM is congested
            cls._client = OpenAI(
                base_url=NVIDIA_BASE_URL,
                api_key=NVIDIA_API_KEY,
                timeout=3.5,
                max_retries=0
            )
        return cls._client

    @classmethod
    def _match_fast_intent(cls, message: str, language: str = "en") -> Optional[str]:
        """
        Fast-path intent matcher (<1ms) for common mental health check-ins.
        Provides instant compassionate responses without remote network latency.
        """
        clean_text = message.lower().strip()
        lang_key = language[:2].lower() if language else "en"
        if lang_key not in ["en", "hi", "bn", "ta", "te", "mr"]:
            lang_key = "en"

        for intent, patterns in INTENT_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, clean_text, re.IGNORECASE):
                    intent_dict = FAST_RESPONSES.get(intent, {})
                    replies = intent_dict.get(lang_key) or intent_dict.get("en")
                    if replies:
                        idx = abs(hash(clean_text)) % len(replies)
                        return replies[idx]
        return None

    @classmethod
    def _fetch_conversation_history(
        cls,
        session_id: str,
        db: Optional[Database],
        limit: int = 2
    ) -> List[Dict[str, str]]:
        """
        Retrieves recent turns of conversation (limited to 2 for fast prompt execution).
        """
        if db is None or not session_id:
            return []

        try:
            records = list(
                db.chat_messages.find({"session_id": session_id})
                .sort("created_at", -1)
                .limit(limit)
            )
            records.reverse()
            history = []
            for rec in records:
                user_text = rec.get("user_message")
                bot_text = rec.get("bot_reply")
                if user_text:
                    history.append({"role": "user", "content": user_text})
                if bot_text:
                    history.append({"role": "assistant", "content": bot_text})
            return history
        except Exception as e:
            logger.warning(f"Error fetching chat history: {e}")
            return []

    @classmethod
    def _generate_ai_reply(
        cls,
        message: str,
        session_id: str,
        language: str = "en",
        db: Optional[Database] = None
    ) -> str:
        """
        Ultra-fast AI generation with instant intent bypass, in-memory caching,
        and snappy 3.5s NVIDIA NIM remote call.
        """
        lang_key = language[:2].lower() if language else "en"

        # 1. Check instant intent fast path (<1ms)
        fast_reply = cls._match_fast_intent(message, lang_key)
        if fast_reply:
            return fast_reply

        # 2. Check in-memory LRU cache (<0.1ms)
        cache_key = f"{lang_key}:{message.strip().lower()}"
        if cache_key in _RESPONSE_CACHE:
            return _RESPONSE_CACHE[cache_key]

        # 3. Fast remote query to NVIDIA NIM (openai/gpt-oss-20b)
        history = cls._fetch_conversation_history(session_id, db, limit=2)

        sys_content = SYSTEM_PROMPT
        if lang_key != "en":
            lang_names = {
                "hi": "Hindi",
                "bn": "Bengali",
                "ta": "Tamil",
                "te": "Telugu",
                "mr": "Marathi"
            }
            target_lang = lang_names.get(lang_key, "English")
            sys_content += f" Respond in soothing, comforting {target_lang}."

        messages = [{"role": "system", "content": sys_content}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        try:
            client = cls.get_openai_client()
            completion = client.chat.completions.create(
                model=NVIDIA_MODEL,
                messages=messages,
                temperature=0.6,
                max_tokens=85,
                stream=False
            )
            raw_reply = completion.choices[0].message.content
            if raw_reply and raw_reply.strip():
                clean_reply = raw_reply.strip()
                # Store in cache
                if len(_RESPONSE_CACHE) < _MAX_CACHE_SIZE:
                    _RESPONSE_CACHE[cache_key] = clean_reply
                return clean_reply
        except Exception as e:
            logger.info(f"NVIDIA NIM response bypassed to instant fallback: {e}")

        # 4. Instant multi-lingual fallback
        fallbacks = EMPATHIC_FALLBACKS
        if lang_key == "hi":
            fallbacks = [
                "मैं समझ सकता हूँ कि इस समय आपका मन कितना भारी है। 'हर काली रात के बाद एक नया सवेरा आता है।' गहरी सांस लें, मैं सदैव आपके साथ हूँ।",
                "अपनी बात मुझसे साझा करने के लिए धन्यवाद। 'शांति हमारे भीतर ही है।' आज अपने आप पर दयालु रहें। आप बहुत मजबूत हैं।",
                "आप इस सफर में अकेले नहीं हैं। 'मुसीबतों के बीच ही इंसान की असली शक्ति निखरती है।' एक-एक कदम करके आगे बढ़ें।"
            ]
        elif lang_key == "bn":
            fallbacks = [
                "আমি বুঝতে পারছি আপনার মন কতটা ভারী। 'অন্ধকারের পরই নতুন ভোর আসে।' শান্তভাবে শ্বাস নিন, আমি আপনার পাশে আছি।"
            ]
        elif lang_key == "ta":
            fallbacks = [
                "உங்கள் மனபாரத்தை நான் உணர்கிறேன். 'ஒவ்வொரு கடினமான நேரமும் கடந்து போகும்.' நீங்கள் தனியாக இல்லை, நான் உங்களுடன் இருக்கிறேன்."
            ]
        elif lang_key == "te":
            fallbacks = [
                "మీ బాధను నేను అర్థం చేసుకోగలను. 'చీకటి తర్వాతే వెలుగు వస్తుంది.' ప్రశాంతంగా శ్వాస తీసుకోండి, నేను మీతోనే ఉన్నాను."
            ]
        elif lang_key == "mr":
            fallbacks = [
                "आपल्या मनातील अस्वस्थता मी समजू शकतो. 'कठीण प्रसंग कायम टिकत नाहीत, पण कणखर माणसे टिकून राहतात.' मी आपल्या सोबत आहे."
            ]

        idx = abs(hash(message)) % len(fallbacks)
        chosen = fallbacks[idx]
        if len(_RESPONSE_CACHE) < _MAX_CACHE_SIZE:
            _RESPONSE_CACHE[cache_key] = chosen
        return chosen

    @classmethod
    def _detect_exercise_recommendation(cls, message: str) -> Optional[Dict[str, str]]:
        clean = message.lower()
        if any(w in clean for w in ["breath", "breathe", "pranayam", "heart", "panic", "can't breathe", "hyperventilat", "attack"]):
            return {
                "type": "breathing",
                "title": "4-7-8 Pranayama Breathwork",
                "description": "Slow down your heart rate and regulate your nervous system with guided rhythmic breathing.",
                "buttonLabel": "Start 4-7-8 Breathing"
            }
        elif any(w in clean for w in ["ground", "dizzy", "unreal", "dissociat", "spin", "lost", "where am i", "senses", "touch"]):
            return {
                "type": "grounding",
                "title": "5-4-3-2-1 Sensory Grounding",
                "description": "Engage your 5 senses to anchor your mind back to the safe present moment.",
                "buttonLabel": "Start 5-4-3-2-1 Grounding"
            }
        elif any(w in clean for w in ["write", "journal", "anger", "angry", "rage", "injustice", "unfair", "hate", "vent"]):
            return {
                "type": "journal",
                "title": "Dissolving Worry & Trauma Journal",
                "description": "Release heavy anger and intrusive thoughts into a private, self-dissolving sanctuary.",
                "buttonLabel": "Open Worry Journal"
            }
        elif any(w in clean for w in ["sleep", "insomnia", "nightmare", "music", "sound", "peace", "relax", "rain", "ocean"]):
            return {
                "type": "sounds",
                "title": "Calming Nature Soundscapes",
                "description": "Immerse in soothing alpha frequencies, gentle rain, and calming acoustic harmony.",
                "buttonLabel": "Play Calming Sounds"
            }
        elif any(w in clean for w in ["tense", "tight", "body", "muscle", "pain", "stiff", "ache", "shoulder", "jaw"]):
            return {
                "type": "muscle",
                "title": "Progressive Muscle Relaxation",
                "description": "Gently release stored trauma and physical tension from your muscles step-by-step.",
                "buttonLabel": "Start Muscle Relaxation"
            }
        elif any(w in clean for w in ["motivat", "hopeless", "give up", "strength", "can't do this", "cant do this", "failed", "हौसला", "हिम्मत"]):
            return {
                "type": "breathing",
                "title": "4-7-8 Pranayama Breathwork",
                "description": "Center your inner courage and steady your heartbeat with guided breath pacing.",
                "buttonLabel": "Center Courage With Breath"
            }
        elif any(w in clean for w in ["exercise", "practice", "activity", "meditat", "calm me", "help me calm", "distress", "guide me"]):
            return {
                "type": "breathing",
                "title": "4-7-8 Pranayama Breathwork",
                "description": "Scientifically proven breath pacing to rapidly reduce cortisol and anxiety.",
                "buttonLabel": "Start Breathing Exercise"
            }
        return None

    @classmethod
    def process_message(
        cls,
        message: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        language: str = "en",
        db: Optional[Database] = None
    ) -> Dict[str, Any]:
        """
        Processes chat message, checks for safety concerns, logs interaction,
        and returns empathetic, pure-hearted AI response via gpt-oss-20b.
        """
        clean_text = message.strip()
        crisis_detected = any(regex.search(clean_text) for regex in COMPILED_CRISIS_REGEX)

        now = datetime.now(timezone.utc)
        resolved_session_id = session_id or f"CHAT-{uuid.uuid4().hex[:8].upper()}"

        if crisis_detected:
            # Create a high priority crisis alert in database
            if db is not None:
                try:
                    db.alerts.insert_one({
                        "alert_id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
                        "case_id": user_id or "ANONYMOUS",
                        "category": "CRISIS",
                        "priority": "P0_CRITICAL",
                        "reason": f"Safety concern detected in support chat: {clean_text[:120]}...",
                        "status": "OPEN",
                        "source": "CHATBOT_SAFETY_FILTER",
                        "created_at": now
                    })
                except Exception as e:
                    logger.error(f"Failed to record crisis alert: {e}")

            reply = (
                "You are not alone. Thank you for telling me. Your life, peace, and safety matter deeply. "
                "I am pausing our conversation so you can connect directly with caring human support right now."
            )

            return {
                "session_id": resolved_session_id,
                "reply": reply,
                "crisis_flag": True,
                "action_required": "SHOW_CRISIS_SCREEN",
                "support_numbers": ["14566", "14416", "108"],
                "timestamp": now.isoformat()
            }

        # Generate consoling AI response from gpt-oss-20b
        reply = cls._generate_ai_reply(
            message=clean_text,
            session_id=resolved_session_id,
            language=language,
            db=db
        )

        exercise_suggestion = cls._detect_exercise_recommendation(clean_text)

        # Log conversation securely if db available
        if db is not None:
            try:
                db.chat_messages.insert_one({
                    "session_id": resolved_session_id,
                    "user_id": user_id,
                    "user_message": clean_text,
                    "bot_reply": reply,
                    "model": NVIDIA_MODEL,
                    "crisis_flag": False,
                    "exercise_suggestion": exercise_suggestion,
                    "created_at": now
                })
            except Exception as e:
                logger.warning(f"Failed to persist chat message: {e}")

        return {
            "session_id": resolved_session_id,
            "reply": reply,
            "crisis_flag": False,
            "action_required": "CONTINUE",
            "exercise_suggestion": exercise_suggestion,
            "timestamp": now.isoformat()
        }
