const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const MARKETING_TEXTS = {
    'en': {
        frame1_text: `<span class="highlight">800+</span> <br>MILITARY ASSETS`,
        frame2_text: `REAL-TIME <br><span class="highlight">CONFLICT</span> TRACKING`,
        frame3_text: `DEEP <br><span class="highlight">TECHNICAL</span> DOSSIERS`,
        frame4_text: `IMMERSIVE <br><span class="highlight">3D & AR</span> VIEW`,
        frame5_text: `<span class="highlight">LOCALIZED</span> <br>INTELLIGENCE`
    },
    'tr': {
        frame1_text: `<span class="highlight">800+</span> <br>ASKERİ ARAÇ`,
        frame2_text: `GERÇEK ZAMANLI <br><span class="highlight">ÇATIŞMA</span> TAKİBİ`,
        frame3_text: `DERİNLEMESİNE <br><span class="highlight">TEKNİK</span> DOSYALAR`,
        frame4_text: `SÜRÜKLEYİCİ <br><span class="highlight">3D VE AR</span> GÖRÜNÜMÜ`,
        frame5_text: `<span class="highlight">YERELLEŞTİRİLMİŞ</span> <br>İSTİHBARAT`
    },
    'ru': {
        frame1_text: `<span class="highlight">800+</span> <br>БОЕВЫХ ЕДИНИЦ`,
        frame2_text: `ОТСЛЕЖИВАНИЕ ОНЛАЙН <br><span class="highlight">КОНФЛИКТОВ</span>`,
        frame3_text: `ГЛУБОКИЕ <br><span class="highlight">ТЕХНИЧЕСКИЕ</span> ДАННЫЕ`,
        frame4_text: `ПОГРУЖЕНИЕ <br><span class="highlight">В 3D И AR</span>`,
        frame5_text: `<span class="highlight">ЛОКАЛИЗОВАННАЯ</span> <br>РАЗВЕДКА`
    },
    'zh': {
        frame1_text: `<span class="highlight">800+</span> <br>军事资产`,
        frame2_text: `实时 <br><span class="highlight">冲突</span> 追踪`,
        frame3_text: `深度 <br><span class="highlight">技术</span> 档案`,
        frame4_text: `沉浸式 <br><span class="highlight">3D和AR</span> 视图`,
        frame5_text: `<span class="highlight">本地化</span> <br>情报`
    },
    'ar': {
        frame1_text: `<div dir="rtl"><span class="highlight">+800</span> <br>معدة عسكرية</div>`,
        frame2_text: `<div dir="rtl">تتبع <br><span class="highlight">الصراعات</span> بالوقت الفعلي</div>`,
        frame3_text: `<div dir="rtl">ملفات <br><span class="highlight">فنية</span> متعمقة</div>`,
        frame4_text: `<div dir="rtl">عرض <br><span class="highlight">ثلاثي الأبعاد والواقع المعزز</span></div>`,
        frame5_text: `<div dir="rtl">استخبارات <br><span class="highlight">مترجمة</span></div>`
    }
};

(async () => {
    console.log("🚀 Starting Google Play (1080x1920) Automation Engine...\n");

    const htmlPath = path.join(__dirname, 'marketing_screenshots_template.html');
    const outputDir = path.join(__dirname, 'app_store_screenshots');
    const rawDir = path.join(__dirname, 'raw_screenshots');

    // Gerekli klasorlerin varligin kontrolu
    if (!fs.existsSync(rawDir)) {
        console.error("❌ HATA: 'raw_screenshots' klasoru bulunamadi!");
        console.error("Lutfen projeye 'raw_screenshots' dizini acip icine sirasiyla 1.png, 2.png, 3.png, 4.png, 5.png koyun.");
        process.exit(1);
    }

    // Uygulama screenshotlari koyulmus mu kontrolu
    const requiredImages = ['1.png', '2.png', '3.png', '4.png', '5.png'];
    const missingImages = requiredImages.filter(img => !fs.existsSync(path.join(rawDir, img)));

    if (missingImages.length > 0) {
        console.warn(`⚠️ UYARI: Su resimler raw_screenshots klasorunde eksik: ${missingImages.join(', ')}`);
        console.warn(`Eklemeyi unuttuysaniz bos uyarisiyla cikti alinacaktir.\n`);
    } else {
        console.log(`✅ 5 adet Ham Ekran Goruntusu (1.png-5.png) dogrulandi.\n`);
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const languages = Object.keys(MARKETING_TEXTS);
    console.log(`🌍 Hedeflenen Diller: ${languages.join(', ').toUpperCase()}`);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'], // Resimlerin local diskten problemsiz yuklenmesi icin web security disable edildi
        defaultViewport: null
    });

    const page = await browser.newPage();
    // DeviceScaleFactor 1 tutuyoruz cunku HTML tasarimini birebir 1080x1920 Fixed olculerde sekillendirdik.
    // CSS'teki gercek piksel olcusu ile donusturulecek, boylece Play Store'a cuk diye oturacak.
    await page.setViewport({ width: 6000, height: 2500, deviceScaleFactor: 1 });

    const fileUrl = `file://${htmlPath.replace(/\\/g, '/')}`;
    await page.goto(fileUrl, { waitUntil: 'load' }); // local file yuklemelerini beklemek icin load yapiyoruz

    for (const lang of languages) {
        console.log(`\n📸 İşleniyor: [${lang.toUpperCase()}] klasoru...`);

        const langOutDir = path.join(outputDir, lang);
        if (!fs.existsSync(langOutDir)) {
            fs.mkdirSync(langOutDir, { recursive: true });
        }

        const texts = MARKETING_TEXTS[lang];

        await page.evaluate((translation) => {
            // Ekrandaki kucultme (scale) efektini kaldir ki tam zemin 1080x1920 goruntu alinsin
            document.body.style.transform = 'none';
            
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translation[key]) {
                    el.innerHTML = translation[key];
                }
            });
        }, texts);

        // Render icin milisaniye bekleme sureci
        await new Promise(r => setTimeout(r, 600));

        const frames = await page.$$('.screenshot-container');
        for (let i = 0; i < frames.length; i++) {
            const frameHnd = frames[i];
            const screenshotPath = path.join(langOutDir, `google_play_screenshot_${i + 1}.png`);

            // Elemani tam 1080x1920 boyutlarinda CSS ile dizayn ettigimiz icin screenshot birebir o olcuyu alacaktir
            await frameHnd.screenshot({
                path: screenshotPath,
                omitBackground: false
            });
            console.log(`  └─ Olusturuldu: ${lang}/google_play_screenshot_${i + 1}.png`);
        }
    }

    await browser.close();
    console.log('\n✅ MUHTESEM GOREV TAMAM: Toplam 25 gorsel "app_store_screenshots" icine dizildi!');
})();
