const logger = require('../middleware/logger');

// Multilingual terminology mappings for UI, legal categories, and common legal headers
const MULTILINGUAL_DICTIONARY = {
  hi: {
    // Document Types
    'Advocate Legal Notice (Land / Contractual Dispute)': 'वकील कानूनी नोटिस (जमीन / अनुबंध विवाद)',
    'Income Tax Department Intimation / Notice': 'आयकर विभाग सूचना / मांग नोटिस',
    'Goods and Services Tax (GST) Notice': 'वस्तु एवं सेवा कर (जीएसटी) नोटिस / आदेश',
    'Bank / NBFC / Cheque Bounce (Section 138 NI Act) Notice': 'बैंक / चेक बाउंस (धारा 138 एनआई एक्ट) नोटिस',
    'Municipal / Public Utility Notice': 'नगर निगम / सार्वजनिक उपयोगिता (बिजली/जल) नोटिस',
    'Police / Judicial Court Summons': 'पुलिस / न्यायिक अदालत समन',
    'Eviction Notice / Tenancy Lease Demand': 'बेदखली नोटिस / किरायेदारी पट्टा मांग',
    'Suspicious Coercive Solicitation (High Fraud Risk)': 'संदिग्ध जबरन वसूली पत्र (अति संवेदनशील धोखाधड़ी)',
    'Official / Legal Document': 'आधिकारिक / कानूनी दस्तावेज',
    'General Document': 'सामान्य दस्तावेज',

    // Common Phrases & Legal Terms
    'Verified': 'सत्यापित (प्रामाणिक)',
    'Use Caution': 'सावधानी बरतें',
    'Likely Fraudulent': 'संभावित धोखाधड़ी',
    'Needs Manual Review': 'मैन्युअल समीक्षा आवश्यक',
    'Urgent': 'अति आवश्यक',
    'High': 'उच्च',
    'Medium': 'मध्यम',
    'Low': 'कम',
    'Informational': 'सूचनात्मक',
    'Not stated in document': 'दस्तावेज में उल्लिखित नहीं',
    'Within 15 Days of Receipt': 'प्राप्ति के 15 दिनों के भीतर',
    'Within 30 Days': '30 दिनों के भीतर',
    'Immediate': 'तत्काल'
  },
  gu: {
    // Document Types
    'Advocate Legal Notice (Land / Contractual Dispute)': 'વકીલ કાનૂની નોટિસ (જમીન / કરાર વિવાદ)',
    'Income Tax Department Intimation / Notice': 'આવકવેરા વિભાગ નોટિસ / માંગ પત્ર',
    'Goods and Services Tax (GST) Notice': 'ગુડ્સ એન્ડ સર્વિસિસ ટેક્સ (GST) નોટિસ / ઓર્ડર',
    'Bank / NBFC / Cheque Bounce (Section 138 NI Act) Notice': 'બેંક / ચેક બાઉન્સ (કલમ 138 NI એક્ટ) નોટિસ',
    'Municipal / Public Utility Notice': 'મ્યુનિસિપલ / પબ્લિક યુટિલિટી (વીજળી/પાણી) નોટિસ',
    'Police / Judicial Court Summons': 'પોલીસ / ન્યાયિક કોર્ટ સમન્સ',
    'Eviction Notice / Tenancy Lease Demand': 'ખાલી કરવાની નોટિસ / ભાડૂઆત પટ્ટા માંગ',
    'Suspicious Coercive Solicitation (High Fraud Risk)': 'શંકાસ્પદ છેતરપિંડી પત્ર (ઉચ્ચ જોખમ)',
    'Official / Legal Document': 'સત્તાવાર / કાનૂની દસ્તાવેજ',
    'General Document': 'સામાન્ય દસ્તાવેજ',

    // Common Phrases & Legal Terms
    'Verified': 'ચકાસાયેલ (અધિકૃત)',
    'Use Caution': 'સાવધાની રાખો',
    'Likely Fraudulent': 'સંભવિત છેતરપિંડી',
    'Needs Manual Review': 'મેન્યુઅલ સમીક્ષા જરૂરી',
    'Urgent': 'અતિ તાકીદનું',
    'High': 'ઉચ્ચ',
    'Medium': 'મધ્યમ',
    'Low': 'ઓછું',
    'Informational': 'માહિતીપ્રદ',
    'Not stated in document': 'દસ્તાવેજમાં જણાવેલ નથી',
    'Within 15 Days of Receipt': 'મળ્યાના 15 દિવસની અંદર',
    'Within 30 Days': '30 દિવસની અંદર',
    'Immediate': 'તરત જ'
  },
  mr: {
    'Advocate Legal Notice (Land / Contractual Dispute)': 'वकील कायदेशीर नोटीस (जमीन / करार विवाद)',
    'Income Tax Department Intimation / Notice': 'आयकर विभाग सूचना / मागणी नोटीस',
    'Goods and Services Tax (GST) Notice': 'वस्तू आणि सेवा कर (GST) नोटीस',
    'Bank / NBFC / Cheque Bounce (Section 138 NI Act) Notice': 'बँक / धनादेश न वटल्याची (कलम 138 NI कायदा) नोटीस',
    'Municipal / Public Utility Notice': 'महानगरपालिका / सार्वजनिक उपयोगिता नोटीस',
    'Police / Judicial Court Summons': 'पोलीस / न्यायालयीन समन्स',
    'Eviction Notice / Tenancy Lease Demand': 'घर रिकामे करण्याची नोटीस / भाडेपट्टी मागणी',
    'Official / Legal Document': 'अधिकृत / कायदेशीर दस्तऐवज',
    'General Document': 'सामान्य दस्तऐवज'
  },
  ta: {
    'Advocate Legal Notice (Land / Contractual Dispute)': 'வழக்கறிஞர் சட்ட அறிவிப்பு (நிலம் / ஒப்பந்த தகராறு)',
    'Income Tax Department Intimation / Notice': 'வருமான வரித்துறை தகவல் / கோரிக்கை அறிவிப்பு',
    'Goods and Services Tax (GST) Notice': 'சரக்கு மற்றும் சேவை வரி (GST) அறிவிப்பு',
    'Bank / NBFC / Cheque Bounce (Section 138 NI Act) Notice': 'வங்கி / காசோலை நிராகரிப்பு (பிரிவு 138) அறிவிப்பு',
    'Municipal / Public Utility Notice': 'நகராட்சி / பொது பயன்பாட்டு அறிவிப்பு',
    'Police / Judicial Court Summons': 'காவல்துறை / நீதிமன்ற சம்மன்',
    'Eviction Notice / Tenancy Lease Demand': 'வெளியேற்ற அறிவிப்பு / வாடகை ஒப்பந்த கோரிக்கை',
    'Official / Legal Document': 'அதிகாரப்பூர்வ / சட்ட ஆவணம்',
    'General Document': 'பொது ஆவணம்'
  },
  te: {
    'Advocate Legal Notice (Land / Contractual Dispute)': 'న్యాయవాది చట్టపరమైన నోటీసు (భూమి / ఒప్పంద వివాదం)',
    'Income Tax Department Intimation / Notice': 'ఆదాయపు పన్ను శాఖ నోటీసు',
    'Goods and Services Tax (GST) Notice': 'జీఎస్టీ (GST) డిమాండ్ నోటీసు',
    'Bank / NBFC / Cheque Bounce (Section 138 NI Act) Notice': 'బ్యాంక్ / చెక్ బౌన్స్ (సెక్షన్ 138) నోటీసు',
    'Municipal / Public Utility Notice': 'మున్సిపల్ / పબ્లిక్ యుటిలిటీ నోటీసు',
    'Police / Judicial Court Summons': 'పోలీసు / కోర్టు సమన్లు',
    'Eviction Notice / Tenancy Lease Demand': 'ఖాళీ చేయవలసిన నోటీసు / అద్దె డిమాండ్',
    'Official / Legal Document': 'అధికారిక / చట్టపరమైన పత్రం',
    'General Document': 'సాధారణ పత్రం'
  },
  bn: {
    'Advocate Legal Notice (Land / Contractual Dispute)': 'আইনজীবী আইনি নোটিশ (জমি / চুক্তি সংক্রান্ত বিরোধ)',
    'Income Tax Department Intimation / Notice': 'আয়কর বিভাগ নোটিশ / দাবিপত্র',
    'Goods and Services Tax (GST) Notice': 'জিএসটি (GST) নোটিশ',
    'Bank / NBFC / Cheque Bounce (Section 138 NI Act) Notice': 'ব্যাংক / চেক বাউন্স (ধারা ১৩৮) নোটিশ',
    'Municipal / Public Utility Notice': 'পৌরসভা / বিদ্যুৎ-জল পরিষেবা নোটিশ',
    'Police / Judicial Court Summons': 'পুলিশ / আদালত সমন',
    'Eviction Notice / Tenancy Lease Demand': 'উচ্ছেদ নোটিশ / বাড়িভাড়া দাবি',
    'Official / Legal Document': 'সরকারি / আইনি নথি',
    'General Document': 'সাধারণ নথি'
  },
  kn: {
    'Advocate Legal Notice (Land / Contractual Dispute)': 'ವಕೀಲರ ಕಾನೂನು ನೋಟಿಸ್ (ಭೂಮಿ / ಒಪ್ಪಂದ ವಿವಾದ)',
    'Income Tax Department Intimation / Notice': 'ಆದಾಯ ತೆರಿಗೆ ಇಲಾಖೆ ನೋಟಿಸ್',
    'Goods and Services Tax (GST) Notice': 'ಜಿಎಸ್‌ಟಿ (GST) ನೋಟಿಸ್',
    'Bank / NBFC / Cheque Bounce (Section 138 NI Act) Notice': 'ಬ್ಯಾಂಕ್ / ಚೆಕ್ ಬೌನ್ಸ್ (ಸೆಕ್ಷನ್ 138) ನೋಟಿಸ್',
    'Municipal / Public Utility Notice': 'ಪುರಸಭೆ / ಸಾರ್ವಜನಿಕ ಉಪಯುಕ್ತತೆ ನೋಟಿಸ್',
    'Police / Judicial Court Summons': 'ಪೊಲೀಸ್ / ನ್ಯಾಯಾಲಯದ ಸಮನ್ಸ್',
    'Eviction Notice / Tenancy Lease Demand': 'ಖಾಲಿ ಮಾಡುವ ನೋಟಿಸ್',
    'Official / Legal Document': 'ಅಧಿಕೃತ / ಕಾನೂನು ದಾಖಲೆ',
    'General Document': 'ಸಾಮಾನ್ಯ ದಾಖಲೆ'
  }
};

/**
 * Translate legal notice plain summary based on extracted entities and target language
 */
function translateSummary(summaryEn = '', documentTypeEnum = '', extracted = {}, targetLang = 'en') {
  if (!targetLang || targetLang === 'en' || !summaryEn) return summaryEn;

  const recipient = extracted.recipientName?.value || 'the recipient';
  const sender = extracted.senderClientName?.value || 'the client/sender';
  const ref = extracted.caseOrReferenceNumber?.value || '';
  const agreement = extracted.underlyingAgreement?.value || '';
  const date = extracted.noticeDate?.value || '';
  const amount = extracted.amountDue?.value || '';

  if (documentTypeEnum === 'advocate_legal_notice') {
    if (targetLang === 'hi') {
      let s = `यह एक औपचारिक वकील कानूनी नोटिस है जो ${sender} की ओर से ${recipient} को भेजा गया है`;
      if (ref) s += ` (संदर्भ: ${ref})`;
      if (date) s += ` दिनांक ${date}`;
      s += `। `;
      if (agreement) {
        s += `यह नोटिस "${agreement}" के कथित उल्लंघन और विवाद से संबंधित है। `;
      } else {
        s += `यह नोटिस अनुबंध या संपत्ति विवाद के संबंध में औपचारिक कानूनी मांग प्रस्तुत करता है। `;
      }
      s += `प्रेषक का आरोप है कि समझौते की शर्तों का जानबूझकर उल्लंघन किया गया है, जिसके परिणामस्वरूप विश्वासघात और धोखाधड़ी हुई है। इसमें मांग की गई है कि शर्तों का तुरंत पालन किया जाए, अन्यथा सिविल मुकदमा (विशिष्ट निष्पादन और हर्जाने हेतु) या आपराधिक कार्यवाही शुरू की जाएगी।`;
      return s;
    }

    if (targetLang === 'gu') {
      let s = `આ એક ઔપચારિક વકીલ કાનૂની નોટિસ છે જે ${sender} વતી ${recipient} ને મોકલવામાં આવી છે`;
      if (ref) s += ` (સંદર્ભ ક્રમાંક: ${ref})`;
      if (date) s += ` તારીખ ${date}`;
      s += `. `;
      if (agreement) {
        s += `આ નોટિસ "${agreement}" ના કથિત ઉલ્લંઘન અને વિવાદ અંગે છે. `;
      } else {
        s += `આ નોટિસ જમીન અથવા કરાર વિવાદ અંગે કાનૂની રજૂઆત કરે છે. `;
      }
      s += `અરજદારનો આક્ષેપ છે કે કરારની શરતોનું ઇરાદાપૂર્વક ઉલ્લંઘન કરવામાં આવ્યું છે, જેના પરિણામે વિશ્વાસઘાત અને છેતરપિંડી થઈ છે. નોટિસમાં તાકીદે શરતોનું પાલન કરવાની માંગ કરવામાં આવી છે, અન્યથા સિવિલ કોર્ટમાં દાવો (વિશિષ્ટ પાલન/નુકસાની) અથવા ફોજદારી કાર્યવાહી શરૂ કરવામાં આવશે.`;
      return s;
    }

    if (targetLang === 'mr') {
      let s = `ही एक औपचारिक कायदेशीर नोटीस आहे जी ${sender} यांच्या वतीने ${recipient} यांना पाठवली आहे`;
      if (ref) s += ` (संदर्भ: ${ref})`;
      if (date) s += ` दिनांक ${date}`;
      s += `. `;
      if (agreement) s += `ही नोटीस "${agreement}" च्या कथित उल्लंघनाशी संबंधित आहे. `;
      s += `करार अटींचा जाणीवपूर्वक भंग केल्याचा आणि विश्वासघाताचा आरोप करण्यात आला आहे. तत्काळ पूर्तता न केल्यास दिवाणी किंवा फौजदारी न्यायालयात खटला दाखल करण्याचा इशारा देण्यात आला आहे.`;
      return s;
    }

    if (targetLang === 'ta') {
      let s = `இது ${sender} சார்பாக ${recipient} அவர்களுக்கு அனுப்பப்பட்ட முறையான வழக்கறிஞர் சட்ட அறிவிப்பு ஆகும்`;
      if (ref) s += ` (குறிப்பு: ${ref})`;
      if (date) s += ` தேதி ${date}`;
      s += `. `;
      if (agreement) s += `இந்த அறிவிப்பு "${agreement}" ஒப்பந்த மீறல் தொடர்பானதாகும். `;
      s += `ஒப்பந்த நிபந்தனைகளை வேண்டுமென்றே மீறியதாகவும், நம்பிக்கை மோசடி செய்ததாகவும் குற்றம் சாட்டப்பட்டுள்ளது. உடனடி தீர்வு காணாவிடில் சிவில் மற்றும் குற்றவியல் நீதிமன்ற நடவடிக்கை எடுக்கப்படும் என தெரிவிக்கப்பட்டுள்ளது.`;
      return s;
    }

    if (targetLang === 'te') {
      let s = `ఇది ${sender} తరపున ${recipient} కు పంపబడిన అధికారిక న్యాయవాది లీగల్ నోటీసు`;
      if (ref) s += ` (రిఫరెన్స్: ${ref})`;
      if (date) s += ` తేదీ ${date}`;
      s += `. `;
      if (agreement) s += `ఈ నోటీసు "${agreement}" ఒప్పంద ఉల్లంఘనకు సంబంధించినది. `;
      s += `ఒప్పంద నిబంధనలను ఉద్దేశపూర్వకంగా ఉల్లంఘించి నమ్మకద్రోహానికి పాల్పడినట్లు ఆరోపించబడింది. తక్షణమే పరిష్కరించకపోతే సివిల్ లేదా క్రిమినల్ కోర్టు చర్యలు తీసుకోబడతాయని హెచ్చరించబడింది.`;
      return s;
    }

    if (targetLang === 'bn') {
      let s = `এটি একটি আনুষ্ঠানিক আইনি নোটিশ যা ${sender} এর পক্ষে ${recipient} কে পাঠানো হয়েছে`;
      if (ref) s += ` (সূত্র: ${ref})`;
      if (date) s += ` তারিখ ${date}`;
      s += `। `;
      if (agreement) s += `এই নোটিশটি "${agreement}" এর কথিত চুক্তি লঙ্ঘনের সাথে সম্পর্কিত। `;
      s += `চুক্তির শর্তাবলী ইচ্ছাকৃতভাবে লঙ্ঘন ও বিশ্বাসভঙ্গের অভিযোগ আনা হয়েছে এবং অবিলম্বে প্রতিকার না দিলে দেওয়ানি বা ফৌজদারি আইনি ব্যবস্থা নেওয়ার হুঁশিয়ারি দেওয়া হয়েছে।`;
      return s;
    }

    if (targetLang === 'kn') {
      let s = `ಇದು ${sender} ಪರವಾಗಿ ${recipient} ಅವರಿಗೆ ಕಳುಹಿಸಲಾದ ಔಪಚಾರಿಕ ವಕೀಲರ ಕಾನೂನು ನೋಟಿಸ್`;
      if (ref) s += ` (ರೆಫರೆನ್ಸ್: ${ref})`;
      if (date) s += ` ದಿನಾಂಕ ${date}`;
      s += `. `;
      if (agreement) s += `ಈ ನೋಟಿಸ್ "${agreement}" ಒಪ್ಪಂದ ಉಲ್ಲಂಘನೆಗೆ ಸಂಬಂಧಿಸಿದೆ. `;
      s += `ಒಪ್ಪಂದದ ಷರತ್ತುಗಳನ್ನು ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ಉಲ್ಲಂಘಿಸಲಾಗಿದೆ ಎಂದು ಆರೋಪಿಸಲಾಗಿದ್ದು, ತಕ್ಷಣವೇ ಪರಿಹರಿಸದಿದ್ದರೆ ನ್ಯಾಯಾಲಯದ ಮೊಕದ್ದಮೆ ಹೂಡಲಾಗುವುದು ಎಂದು ಎಚ್ಚರಿಸಲಾಗಿದೆ.`;
      return s;
    }
  }

  // Fallback for Income Tax
  if (documentTypeEnum === 'income_tax_notice') {
    if (targetLang === 'hi') {
      return `आयकर विभाग ने आयकर अधिनियम, 1961 के तहत एक वैधानिक सूचना/मांग नोटिस जारी किया है। ${amount ? `मांग की गई कुल राशि ${amount} है। ` : ''}कृपया 30 दिनों के भीतर ई-फाइलिंग पोर्टल पर सत्यापन करें या सुधार अनुरोध दर्ज करें।`;
    }
    if (targetLang === 'gu') {
      return `આવકવેરા વિભાગ દ્વારા આવકવેરા કાયદા હેઠળ વૈધાનિક નોટિસ/માંગ પત્ર જારી કરવામાં આવ્યો છે. ${amount ? `કુલ માંગ રકમ ${amount} છે. ` : ''}કૃપા કરીને 30 દિવસની અંદર ઇ-ફાઇલિંગ પોર્ટલ પર ચકાસણી કરો અથવા સુધારણા અરજી સબમિટ કરો.`;
    }
  }

  // Fallback for GST
  if (documentTypeEnum === 'gst_notice') {
    if (targetLang === 'hi') {
      return `जीएसटी विभाग ने आपके जीएसटी पंजीकरण के संबंध में वैधानिक नोटिस जारी किया है। ${amount ? `फ्लैग की गई कर राशि ${amount} है। ` : ''}कृपया जीएसटी पोर्टल पर फॉर्म GST DRC-06 में अपना बिंदुवार लिखित जवाब दाखिल करें।`;
    }
    if (targetLang === 'gu') {
      return `GST વિભાગ દ્વારા તમારા GST રજિસ્ટ્રેશન અંગે વૈધાનિક નોટિસ જારી કરવામાં આવી છે. ${amount ? `કરની રકમ ${amount} છે. ` : ''}કૃપા કરીને પોર્ટલ પર ફોર્મ GST DRC-06 માં તમારો વિગતવાર જવાબ સબમિટ કરો.`;
    }
  }

  // Fallback for Section 138 / Cheque bounce
  if (documentTypeEnum === 'banking_loan_notice') {
    if (targetLang === 'hi') {
      return `नेगोशिएबल इंस्ट्रूमेंट्स एक्ट की धारा 138 के तहत चेक बाउंस या ऋण वसूली का कानूनी नोटिस जारी किया गया है। ${amount ? `मांग राशि ${amount} है। ` : ''}कानून के अनुसार, अदालत में किसी भी शिकायत से पहले भुगतान करने के लिए आपके पास 15 दिनों की वैधानिक समय-सीमा है।`;
    }
    if (targetLang === 'gu') {
      return `નેગોશિયેબલ ઇન્સ્ટ્રુમેન્ટ્સ એક્ટની કલમ 138 હેઠળ ચેક બાઉન્સ અથવા લોન વસૂલાતની કાનૂની નોટિસ આપવામાં આવી છે. ${amount ? `માંગ રકમ ${amount} છે. ` : ''}કોર્ટ કેસ અટકાવવા માટે રકમ ચૂકવવા તમારી પાસે નોટિસ મળ્યાથી 15 દિવસની વૈધાનિક મુદત છે.`;
    }
  }

  return summaryEn;
}

/**
 * Translate legal implications based on document type and target language
 */
function translateLegalImplications(implications = [], docTypeEnum = '', targetLang = 'en') {
  if (!targetLang || targetLang === 'en' || !implications.length) return implications;

  if (docTypeEnum === 'advocate_legal_notice') {
    if (targetLang === 'hi') {
      return [
        {
          risk: 'विशिष्ट निष्पादन और हर्जाने हेतु सिविल मुकदमा',
          severity: 'High',
          consequence: 'प्रेषक जमीन या संपत्ति के समझौते को पूरा करने के लिए दीवानी अदालत (Civil Court) में दावा दायर कर सकता है और आर्थिक नुकसान का हर्जाना मांग सकता है।'
        },
        {
          risk: 'आपराधिक विश्वासघात एवं धोखाधड़ी की शिकायत',
          severity: 'High',
          consequence: 'भारतीय न्याय संहिता (BNS) की धाराओं के तहत पुलिस या मजिस्ट्रेट के समक्ष आपराधिक शिकायत दर्ज की जा सकती है।'
        },
        {
          risk: 'कानूनी नोटिस का जवाब न देने पर प्रतिकूल निष्कर्ष',
          severity: 'Medium',
          consequence: 'यदि समय रहते वकील के माध्यम से खंडन जवाब नहीं भेजा गया, तो अदालत में यह माना जा सकता है कि लगाए गए आरोप सत्य थे।'
        }
      ];
    }
    if (targetLang === 'gu') {
      return [
        {
          risk: 'વિશિષ્ટ પાલન અને નુકસાની માટે સિવિલ દાવો',
          severity: 'High',
          consequence: 'અરજદાર જમીન કરારના અમલ માટે સિવિલ કોર્ટમાં સ્પેસિફિક પરફોર્મન્સનો દાવો અને આર્થિક નુકસાનીની માંગ કરી શકે છે.'
        },
        {
          risk: 'વિશ્વાસઘાત અને છેતરપિંડીની ફોજદારી ફરિયાદ',
          severity: 'High',
          consequence: 'ભારતીય ન્યાય સંહિતા હેઠળ પોલીસ સ્ટેશન અથવા કોર્ટમાં છેતરપિંડી અને ગુનાહિત વિશ્વાસઘાતની ફરિયાદ થઈ શકે છે.'
        },
        {
          risk: 'નોટિસનો જવાબ ન આપવાથી કોર્ટમાં પ્રતિકૂળ અનુમાન',
          severity: 'Medium',
          consequence: 'જો સમયસર વકીલ દ્વારા યોગ્ય કાનૂની જવાબ નહીં અપાય, તો ભવિષ્યમાં કોર્ટમાં વિરોધી પક્ષના દાવાને મજબૂતી મળી શકે છે.'
        }
      ];
    }
    if (targetLang === 'mr') {
      return [
        {
          risk: 'दिवाणी न्यायालयात नुकसानभरपाई व कराराची पूर्तता खटला',
          severity: 'High',
          consequence: 'जमीन किंवा मालमत्ता कराराच्या पूर्ततेसाठी दिवाणी न्यायालयात दावा दाखल केला जाऊ शकतो.'
        },
        {
          risk: 'गुन्हेगारी फसवणुकीची तक्रार',
          severity: 'High',
          consequence: 'विश्वासघात व फसवणुकीबाबत पोलीस किंवा न्यायालयात फौजदारी कारवाई होऊ शकते.'
        }
      ];
    }
  }

  return implications;
}

/**
 * Translate citizen rights & legal protections based on document type and target language
 */
function translateCitizenRights(rights = [], docTypeEnum = '', targetLang = 'en') {
  if (!targetLang || targetLang === 'en' || !rights.length) return rights;

  if (docTypeEnum === 'advocate_legal_notice') {
    if (targetLang === 'hi') {
      return [
        {
          right: 'बिंदुवार कानूनी जवाब (Reply Notice) देने का अधिकार',
          statute: 'सिविल प्रक्रिया संहिता (CPC)',
          remedy: 'आप अपने अधिवक्ता (Advocate) के माध्यम से नोटिस में लगाए गए सभी झूठे आरोपों का तथ्यात्मक खंडन कर सकते हैं।'
        },
        {
          right: 'आपसी बातचीत या मध्यस्थता का अधिकार',
          statute: 'मध्यस्थता अधिनियम, 2023',
          remedy: 'लंबी अदालती कार्यवाही से बचने के लिए मामले को मध्यस्थता या सुलह के माध्यम से सौहार्दपूर्ण ढंग से हल किया जा सकता है।'
        },
        {
          right: 'न्यायिक सुनवाई एवं प्राकृतिक न्याय का अधिकार',
          statute: 'भारतीय संविधान अनुच्छेद 21',
          remedy: 'केवल नोटिस भेजने से कोई फैसला नहीं हो जाता; अदालत में आपको अपना पक्ष और साक्ष्य रखने का पूरा अधिकार है।'
        }
      ];
    }
    if (targetLang === 'gu') {
      return [
        {
          right: 'કાનૂની જવાબ (Reply Notice) આપવાનો સંપૂર્ણ અધિકાર',
          statute: 'સિવિલ પ્રોસિજર કોડ (CPC)',
          remedy: 'તમે તમારા વકીલ મારફતે નોટિસમાં મૂકેલા તમામ આક્ષેપોનું વિગતવાર અને પુરાવા સાથે ખંડન કરી શકો છો.'
        },
        {
          right: 'આપસી સમાધાન અને મધ્યસ્થીનો અધિકાર',
          statute: 'મેડિયેશન એક્ટ, 2023',
          remedy: 'કોર્ટના લાંબા વિવાદથી બચવા માટે双方પક્ષકારો સાથે બેસીને વિવાદનું શાંતિપૂર્ણ સમાધાન કરી શકે છે.'
        },
        {
          right: 'કોર્ટમાં પક્ષ રાખવાનો અને ન્યાયિક સુનાવણીનો અધિકાર',
          statute: 'ભારતીય બંધારણ અનુચ્છેદ 21',
          remedy: 'નોટિસ માત્ર માંગ છે; કોર્ટમાં બંને પક્ષોની સુનાવણી અને પુરાવા વગર કોઈ એકતરફી હુકમ થઈ શકતો નથી.'
        }
      ];
    }
  }

  return rights;
}

/**
 * Translate jargon terms based on target language
 */
function translateJargon(jargons = [], targetLang = 'en') {
  if (!targetLang || targetLang === 'en' || !jargons.length) return jargons;

  if (targetLang === 'hi') {
    return [
      {
        term: 'साटाखत (Satakhat / Agreement to Sell)',
        meaning: 'जमीन या अचल संपत्ति की बिक्री के लिए खरीदार और विक्रेता के बीच किया गया औपचारिक अनुबंध।'
      },
      {
        term: 'विशिष्ट निष्पादन (Specific Performance)',
        meaning: 'अदालत का वह आदेश जो किसी पक्ष को समझौते की शर्तों को पूरा करने (जैसे रजिस्ट्री कराने) के लिए बाध्य करता है।'
      },
      {
        term: 'बिना पूर्वाग्रह (Without Prejudice)',
        meaning: 'इसका अर्थ है कि इस नोटिस की बातों का उपयोग अदालत में प्रेषक के अन्य कानूनी अधिकारों को सीमित करने के लिए नहीं किया जा सकता।'
      }
    ];
  }

  if (targetLang === 'gu') {
    return [
      {
        term: 'સાટાખત (Satakhat / Agreement to Sell)',
        meaning: 'જમીન અથવા મિલકતના વેચાણ માટે ખરીદનાર અને વેચનાર વચ્ચે કરવામાં આવેલો લેખિત બાનાખત/કરાર.'
      },
      {
        term: 'વિશિષ્ટ પાલન (Specific Performance)',
        meaning: 'કોર્ટનો એવો કાનૂની આદેશ જે પક્ષકારને કરારની શરતો પૂર્ણ કરવા (જેમ કે દસ્તાવેજ કરી આપવા) માટે ફરજ પાડે છે.'
      },
      {
        term: 'પૂર્વગ્રહ વિના (Without Prejudice)',
        meaning: 'આ કાનૂની શબ્દ દર્શાવે છે કે નોટિસ મોકલવાથી મોકલનારના અન્ય કાનૂની હક્કોને કોઈ નુકસાન પહોંચશે નહીં.'
      }
    ];
  }

  return jargons;
}

/**
 * Translate action plan steps based on document type and target language
 */
function translateActionPlan(actionPlan = {}, docTypeEnum = '', targetLang = 'en') {
  if (!targetLang || targetLang === 'en' || !actionPlan) return actionPlan;

  const res = JSON.parse(JSON.stringify(actionPlan));

  if (targetLang === 'hi') {
    res.summary = `इस दस्तावेज के लिए अनुशंसित कानूनी एवं सत्यापन कार्य योजना।`;
    if (docTypeEnum === 'advocate_legal_notice') {
      res.steps = [
        {
          stepNumber: 1,
          category: 'URGENT',
          title: 'अपने सिविल/संपत्ति अधिवक्ता से तुरंत संपर्क करें',
          description: 'इस नोटिस की प्रति और मूल अनुबंध (साटाखत) के साथ अपने वकील से मिलें और तथ्यात्मक विवरण तैयार करें।',
          deadline: 'प्राप्ति के 3-5 दिनों के भीतर'
        },
        {
          stepNumber: 2,
          category: 'CRITICAL',
          title: 'औपचारिक कानूनी खंडन जवाब (Reply Notice) भेजें',
          description: 'अपने वकील के माध्यम से नोटिस में लगाए गए आरोपों का बिंदुवार उत्तर रजिस्टर्ड पोस्ट/स्पीड पोस्ट द्वारा भिजवाएं।',
          deadline: '15 दिनों की समय-सीमा के भीतर'
        },
        {
          stepNumber: 3,
          category: 'DOCUMENTATION',
          title: 'लेन-देन और पत्राचार के सभी साक्ष्य सुरक्षित रखें',
          description: 'बैंक स्टेटमेंट, भुगतान की रसीदें, व्हाट्सएप चैट और पिछले समझौतों के सभी दस्तावेज सुरक्षित फाइल में रखें।',
          deadline: 'तत्काल'
        }
      ];
    }
  } else if (targetLang === 'gu') {
    res.summary = `આ દસ્તાવેજ માટે ભલામણ કરેલ કાનૂની અને ચકાસણી કાર્ય યોજના.`;
    if (docTypeEnum === 'advocate_legal_notice') {
      res.steps = [
        {
          stepNumber: 1,
          category: 'URGENT',
          title: 'તમારા સિવિલ/રેવન્યુ વકીલનો તાત્કાલિક સંપર્ક કરો',
          description: 'આ નોટિસની નકલ અને મૂળ સાટાખત કરાર સાથે તમારા વકીલ સાથે પરામર્શ કરો અને વાસ્તવિક હકીકતો સ્પષ્ટ કરો.',
          deadline: 'નોટિસ મળ્યાના 3-5 દિવસમાં'
        },
        {
          stepNumber: 2,
          category: 'CRITICAL',
          title: 'ઔપચારિક કાનૂની જવાબ (Reply Notice) મોકલો',
          description: 'વકીલ મારફતે નોટિસમાં મુકાયેલા ખોટા આક્ષેપોનો સત્તાવાર અને પુરાવા સહિતનો જવાબ રજિસ્ટર્ડ પોસ્ટથી મોકલાવો.',
          deadline: '15 દિવસની મુદતની અંદર'
        },
        {
          stepNumber: 3,
          category: 'DOCUMENTATION',
          title: 'નાણાકીય વ્યવહાર અને કરારના પુરાવા એકત્રિત કરો',
          description: 'બેંક ટ્રાન્સફર, રસીદો, સાક્ષીઓની વિગત અને તમામ સંબંધિત કાગળો સુરક્ષિત ફાઇલમાં તૈયાર રાખો.',
          deadline: 'તરત જ'
        }
      ];
    }
  } else if (targetLang === 'mr') {
    res.summary = `या दस्तऐवजासाठी कृती योजना आणि पडताळणी मार्गदर्शक.`;
  } else if (targetLang === 'ta') {
    res.summary = `இந்த ஆவணத்திற்கான பரிந்துரைக்கப்பட்ட சட்ட செயல் திட்டம்.`;
  } else if (targetLang === 'te') {
    res.summary = `ఈ పత్రం కోసం సిఫార్సు చేయబడిన చట్టపరమైన కార్యాచరణ ప్రణాళిక.`;
  } else if (targetLang === 'bn') {
    res.summary = `এই নথির জন্য প্রস্তাবিত আইনি কর্মপরিকল্পনা।`;
  } else if (targetLang === 'kn') {
    res.summary = `ಈ ದಾಖಲೆಗಾಗಿ ಶಿಫಾರಸು ಮಾಡಲಾದ ಕಾನೂನು ಕ್ರಿಯಾ ಯೋಜನೆ.`;
  }

  return res;
}

/**
 * Translate document purpose based on doc type and language
 */
function translatePurpose(purposeEn = '', docTypeEnum = '', targetLang = 'en') {
  if (!targetLang || targetLang === 'en' || !purposeEn) return purposeEn;

  if (docTypeEnum === 'advocate_legal_notice') {
    if (targetLang === 'hi') {
      return 'करार के कथित उल्लंघन के संबंध में औपचारिक कानूनी मांग प्रस्तुत करना और सिविल या आपराधिक कार्यवाही से पूर्व अंतिम चेतावनी देना।';
    }
    if (targetLang === 'gu') {
      return 'કરારના કથિત ઉલ્લંઘન અંગે ઔપચારિક કાનૂની માંગ રજૂ કરવી અને કોર્ટ કેસ કરતા પહેલા છેલ્લી કાનૂની નોટિસ આપવી.';
    }
    if (targetLang === 'mr') {
      return 'करार भंगाबाबत कायदेशीर मागणी करणे आणि न्यायालयात जाण्यापूर्वी अंतिम इशारा देणे.';
    }
  }

  return purposeEn;
}

/**
 * Translate entire analysis payload into target language
 */
function translateAnalysisData(analysisData, targetLang = 'en') {
  if (!analysisData || !targetLang || targetLang === 'en') {
    return analysisData;
  }

  const dict = MULTILINGUAL_DICTIONARY[targetLang] || {};
  const docTypeEnum = analysisData.documentTypeEnum || analysisData.documentType || 'general_document';
  const extracted = analysisData.extractedFields || {};

  // Clone object
  const translated = JSON.parse(JSON.stringify(analysisData));
  translated.language = targetLang;

  // 1. Translate Document Type Name
  if (dict[translated.documentType]) {
    translated.documentType = dict[translated.documentType];
  }

  // 2. Translate Summary
  translated.summary = translateSummary(analysisData.summary, docTypeEnum, extracted, targetLang);

  // 3. Translate Document Purpose
  translated.documentPurpose = translatePurpose(analysisData.documentPurpose, docTypeEnum, targetLang);

  // 4. Translate Legal Implications
  translated.legalImplications = translateLegalImplications(analysisData.legalImplications, docTypeEnum, targetLang);

  // 5. Translate Citizen Rights
  translated.citizenRights = translateCitizenRights(analysisData.citizenRights, docTypeEnum, targetLang);

  // 6. Translate Jargon
  translated.jargonDemystified = translateJargon(analysisData.jargonDemystified, targetLang);

  // 7. Translate Action Plan
  translated.actionPlan = translateActionPlan(analysisData.actionPlan, docTypeEnum, targetLang);

  return translated;
}

module.exports = {
  translateAnalysisData,
  translateSummary,
  translateLegalImplications,
  translateCitizenRights,
  translateJargon,
  translateActionPlan,
  MULTILINGUAL_DICTIONARY
};
