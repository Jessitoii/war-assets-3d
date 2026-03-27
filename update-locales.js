const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'mobile', 'locales');

const translations = {
  ar: {
    "data_disclaimer_title": "دقة البيانات",
    "data_disclaimer_text": "يتم جمع البيانات الموجودة في هذا التطبيق من مصادر ويب عامة مختلفة. لذلك، قد لا تكون المعلومات دقيقة تمامًا، وقد تكون بعض البيانات المحددة التي تبحث عنها مفقودة."
  },
  de: {
    "data_disclaimer_title": "Datengenauigkeit",
    "data_disclaimer_text": "Die Daten in dieser Anwendung werden aus verschiedenen öffentlichen Webquellen gesammelt. Daher sind die Informationen möglicherweise nicht ganz genau und bestimmte, von Ihnen gesuchte Daten fehlen möglicherweise."
  },
  el: {
    "data_disclaimer_title": "Ακρίβεια Δεδομένων",
    "data_disclaimer_text": "Τα δεδομένα σε αυτήν την εφαρμογή συλλέγονται από διάφορες δημόσιες πηγές ιστού. Ως εκ τούτου, οι πληροφορίες μπορεί να μην είναι απολύτως ακριβείς και ορισμένα συγκεκριμένα δεδομένα που αναζητάτε ενδέχεται να λείπουν."
  },
  es: {
    "data_disclaimer_title": "Precisión de los datos",
    "data_disclaimer_text": "Los datos de esta aplicación se recopilan de diversas fuentes web públicas. Por lo tanto, la información puede no ser completamente precisa y ciertos datos específicos que busca podrían faltar."
  },
  fa: {
    "data_disclaimer_title": "دقت داده‌ها",
    "data_disclaimer_text": "داده‌های موجود در این برنامه از منابع وب عمومی مختلف جمع‌آوری شده است. بنابراین، ممکن است اطلاعات کاملاً دقیق نباشد و برخی از داده‌های خاصی که به دنبال آنها هستید وجود نداشته باشد."
  },
  fr: {
    "data_disclaimer_title": "Précision des données",
    "data_disclaimer_text": "Les données de cette application sont recueillies à partir de diverses sources web publiques. Par conséquent, les informations peuvent ne pas être complètement exactes et certaines données spécifiques que vous recherchez pourraient manquer."
  },
  he: {
    "data_disclaimer_title": "דיוק הנתונים",
    "data_disclaimer_text": "הנתונים ביישום זה נאספים ממקורות אינטרנט ציבוריים שונים. לכן, ייתכן שהמידע לא יהיה מדויק לחלוטין, וייתכן שחסרים נתונים ספציפיים מסוימים שאתה מחפש."
  },
  hi: {
    "data_disclaimer_title": "डेटा की सटीकता",
    "data_disclaimer_text": "इस एप्लिकेशन में डेटा विभिन्न सार्वजनिक वेब स्रोतों से एकत्र किया जाता है। इसलिए, जानकारी पूरी तरह से सटीक नहीं हो सकती है, और आपके द्वारा खोजा जा रहा कुछ विशिष्ट डेटा गायब हो सकता है।"
  },
  it: {
    "data_disclaimer_title": "Accuratezza dei dati",
    "data_disclaimer_text": "I dati in questa applicazione sono raccolti da varie fonti web pubbliche. Pertanto, le informazioni potrebbero non essere completamente accurate e alcuni specifici dati che stai cercando potrebbero mancare."
  },
  ja: {
    "data_disclaimer_title": "データの正確性",
    "data_disclaimer_text": "このアプリケーションのデータは様々な公開ウェブソースから収集されています。そのため、情報が完全に正確ではない場合があり、お探しの特定のデータが欠落している可能性があります。"
  },
  ko: {
    "data_disclaimer_title": "데이터 정확성",
    "data_disclaimer_text": "이 애플리케이션의 데이터는 다양한 공개 웹 소스에서 수집되었습니다. 따라서 정보가 완전히 정확하지 않을 수 있으며 찾고 있는 특정 데이터가 누락되었을 수도 있습니다."
  },
  nl: {
    "data_disclaimer_title": "Gegevensnauwkeurigheid",
    "data_disclaimer_text": "De gegevens in deze applicatie worden verzameld uit verschillende openbare webbronnen. Daarom is de informatie mogelijk niet helemaal accuraat en ontbreken er mogelijk specifieke gegevens die u zoekt."
  },
  pl: {
    "data_disclaimer_title": "Dokładność Danych",
    "data_disclaimer_text": "Dane w tej aplikacji są gromadzone z różnych publicznych źródeł internetowych. W związku z tym informacje te mogą nie być całkowicie dokładne, a pewnych konkretnych danych, których szukasz, może brakować."
  },
  pt: {
    "data_disclaimer_title": "Precisão dos Dados",
    "data_disclaimer_text": "Os dados neste aplicativo são recolhidos de várias fontes públicas da web. Portanto, as informações podem não ser totalmente precisas e certos dados específicos que procura podem estar em falta."
  },
  ru: {
    "data_disclaimer_title": "Точность данных",
    "data_disclaimer_text": "Данные в этом приложении собираются из различных общедоступных веб-источников. Поэтому информация может быть не совсем точной, а некоторые конкретные данные, которые вы ищете, могут отсутствовать."
  },
  sv: {
    "data_disclaimer_title": "Datanoggrannhet",
    "data_disclaimer_text": "Data i denna applikation samlas in från olika offentliga webbkällor. Därför kanske informationen inte är helt korrekt, och vissa specifika data du letar efter kan saknas."
  },
  uk: {
    "data_disclaimer_title": "Точність даних",
    "data_disclaimer_text": "Дані в цьому додатку збираються з різних загальнодоступних веб-джерел. Тому інформація може бути не зовсім точною, а деякі конкретні дані, які ви шукаєте, можуть бути відсутніми."
  },
  vi: {
    "data_disclaimer_title": "Độ chính xác của dữ liệu",
    "data_disclaimer_text": "Dữ liệu trong ứng dụng này được thu thập từ nhiều nguồn web công cộng khác nhau. Do đó, thôngquan có thể không hoàn toàn chính xác và một số dữ liệu cụ thể mà bạn đang tìm kiếm có thể bị thiếu."
  },
  zh: {
    "data_disclaimer_title": "数据准确性",
    "data_disclaimer_text": "本应用中的数据来自各种公开的网络来源。因此，信息可能不完全准确，并且您正在寻找的某些特定数据可能会缺失。"
  }
};

const updateLocales = () => {
    const files = fs.readdirSync(localesDir);
    
    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const langCode = file.replace('.json', '');
        
        if (langCode === 'en' || langCode === 'tr') continue;
        
        const filePath = path.join(localesDir, file);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(data);
            
            if (json.common && translations[langCode]) {
                json.common.data_disclaimer_title = translations[langCode].data_disclaimer_title;
                json.common.data_disclaimer_text = translations[langCode].data_disclaimer_text;
                
                fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
                console.log(`Updated ${file}`);
            } else if (!translations[langCode]) {
                console.log(`Missing translation for ${file}, appending english version`);
                json.common.data_disclaimer_title = "Data Accuracy";
                json.common.data_disclaimer_text = "The data in this application is gathered from various public web sources. Therefore, the information may not be completely accurate, and certain specific data you are looking for might be missing.";
                fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
            }
        } catch (err) {
            console.error(`Error processing ${file}:`, err.message);
        }
    }
};

updateLocales();
