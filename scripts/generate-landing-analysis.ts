import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, PageBreak
} from "docx";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_PATH = path.join(import.meta.dirname, "..", "LANDING_PAGE_ANALYSIS_AR.docx");

const COLORS = {
    primary: "1a237e",
    secondary: "c62828",
    accent: "283593",
    text: "37474f",
    light: "546e7a",
    green: "2e7d32",
    orange: "e65100",
    cyan: "00838f",
    bg: "e8eaf6",
};

function doc(): Document {
    return new Document({
        title: "تحليل وتطوير الواجهة التعريفية للموقع",
        description: "تقرير تحليل الواجهة التعريفية لموقع سحابة الأمن السيبراني",
        styles: {
            default: {
                document: {
                    run: { font: "Times New Roman", size: 24 },
                },
            },
        },
        sections: [
            coverSection(),
            ...analysisSections(),
            ...redesignPlanSections(),
            ...comparisonSection(),
            ...conclusionSection(),
        ],
    });
}

// ===================== COVER =====================
function coverSection() {
    return {
        properties: {
            page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
        },
        children: [
            spacer(4800),
            centerText("تقرير تحليل وتطوير الواجهة التعريفية", 48, true, COLORS.primary, "Traditional Arabic"),
            spacer(400),
            centerText("Landing Page Analysis & Development Plan", 26, true, COLORS.light, undefined, true),
            spacer(800),
            centerText("سحابة الأمن السيبراني", 36, true, COLORS.secondary, "Traditional Arabic"),
            centerText("CyberSecurity Cloud", 22, false, COLORS.light),
            spacer(400),
            line(),
            spacer(200),
            centerText("نطاق المشروع: $1,000 - $5,000", 22, false, COLORS.text, "Traditional Arabic"),
            centerText("تاريخ التحليل: 14 يونيو 2026", 22, false, COLORS.text, "Traditional Arabic"),
            centerText("إصدار التقرير: v1.0", 22, false, COLORS.text, "Traditional Arabic"),
        ],
    };
}

// ===================== ANALYSIS SECTIONS =====================
function analysisSections() {
    return [
        {
            properties: {
                page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
            },
            children: [
                heading1("قسم أول: تحليل الواجهة التعريفية الحالية"),
                spacer(200),
                heading2("1.1 هيكل الصفحات التعريفية"),
                bullet("الصفحة الرئيسية (/) — شاشة تحميل سريعة تعيد التوجيه فوراً"),
                bullet("صفحة التعريف (Onboarding) — 12 شريحة تعريفية متتالية"),
                bullet("صفحة تسجيل الدخول (Login) — تحتوي على الكرة الأرضية ثلاثية الأبعاد"),
                spacer(100),
                heading2("1.2 المكونات البصرية الحالية"),
                bullet("MatrixRain — تأثير أمطار المصفوفة الرقمية (Canvas)"),
                bullet("NeonParticles — جسيمات نيون عائمة (Canvas)"),
                bullet("ScanLine — خط مسح راداري متحرك"),
                bullet("Quantum Grid — شبكة خلفية كمومية (CSS)"),
                bullet("CyberGlobe — كرة أرضية ثلاثية الأبعاد (Three.js) — موجودة فقط في splash screen"),
                bullet("OnboardingScene — كرة أرضية ثلاثية الأبعاد (Three.js) — تظهر في Onboarding و Login"),
                spacer(100),
                heading2("1.3 تدفق المستخدم الحالي"),
                numbered("المستخدم يدخل الموقع → (/) صفحة سريعة مع رسالة جاري التحميل"),
                numbered("إذا لم يشاهد التعريف → تحويل إلى (/onboarding)" ),
                numbered("إذا شاهد التعريف من قبل → تحويل مباشر إلى (/login)"),
                numbered("في صفحة Onboarding: 12 شريحة تنقل يدوي ← أو نقر على التالي"),
                numbered("بعد انتهاء التعريف → تحويل إلى (/login) مع تعيين onboardingSeen=true"),
                spacer(200),

                heading2("1.4 المشاكل الأساسية في التصميم الحالي"),
                spacer(100),


                heading3("أ. مشاكل الصفحة الرئيسية (Splash Page)"),
                problem("لا توجد هوية بصرية للمشروع — مجرد نص 'جاري التحميل...'", "عالية"),
                problem("التأثيرات (MatrixRain, CyberGlobe, NeonParticles) تظهر كلها معاً بدون تنسيق يخلق فوضى بصرية", "متوسطة"),
                problem("لا يوجد شعار أو لوجو للمشروع", "عالية"),
                problem("مدة الظهور قصيرة جداً (لحظة ثم إعادة توجيه) — لا فائدة من الصفحة", "متوسطة"),
                problem("الخلفية السوداء والنيون فقط — تفتقد للعمق البصري", "متوسطة"),
                spacer(100),

                heading3("ب. مشاكل صفحة Onboarding"),
                problem("عدد الشرائح 12 — طويل جداً، المستخدم سيمل قبل الوصول للنهاية", "عالية"),
                problem("الأيقونات都是用 Emoji — تبدو غير احترافية لمنصة أمان", "عالية"),
                problem("لا توجد صور أو رسوم توضيحية لكل دور — مجرد نصوص طويلة", "متوسطة"),
                problem("الكرة الأرضية ثلاثية الأبعاد مخفية بنسبة opacity 25% — غير مرئية تقريباً", "منخفضة"),
                problem("الانتقال بين الشرائح بسيط (تتلاشى وتظهر) بدون تفاعل", "متوسطة"),
                problem("الوصف لكل شريحة طويل ونصي — لا يوجد عناصر مرئية جذابة", "متوسطة"),
                problem("لا توجد رسوم متحركة للدخول أو خلفيات متغيرة بين الشرائح", "منخفضة"),
                problem("النصوص الطويلة تصعب قراءتها على الجوال", "منخفضة"),
                problem("لا توجد إحصائيات أو أرقام تعرض تأثير المنصة", "متوسطة"),
                problem("زر 'تخطي' موجود ولكن لا يوجد زر 'الرجوع' للصفحة الرئيسية", "منخفضة"),
                spacer(100),

                heading3("ج. مشاكل صفحة تسجيل الدخول"),
                problem("الكرة الأرضية (OnboardingScene) ثابتة — لا يمكن التفاعل معها", "منخفضة"),
                problem("نموذج تسجيل الدخول بسيط بدون هوية بصرية قوية", "متوسطة"),
                problem("التباين بين تأثيرات الخلفية ونموذج الدخول ضعيف", "منخفضة"),
                spacer(200),

                heading2("1.5 تحليل المنافسين والمقارنة"),
                spacer(100),
                comparisonTable(),
                spacer(200),

                heading2("1.6 خلاصة التحليل"),
                bullet("الدرجة الحالية للواجهة التعريفية: 45/100"),
                bullet("نقاط القوة: التأثيرات الخلفية (Matrix, Particles) تعمل بكفاءة، الـ 3D Globe جيد ولكن غير مستغل"),
                bullet("نقاط الضعف: لا هوية بصرية واضحة، لا شعار، شرائح كثيرة، استخدام emoji، لا تفاعل"),
                bullet("التوصية: إعادة تصميم كاملة للواجهة التعريفية لتتناسب مع قيمة المشروع ($1,000-$5,000)"),
            ],
        },
    ];
}

// ===================== REDESIGN PLAN =====================
function redesignPlanSections() {
    return [
        {
            properties: {
                page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
            },
            children: [
                new Paragraph({ children: [new TextRun({ break: 1 })] }),
                heading1("قسم ثانٍ: خطة التطوير الاحترافية"),
                spacer(200),

                heading2("2.1 الرؤية الجديدة للواجهة"),
                bullet("واجهة تعريفية بتجربة سينمائية immersive تجمع بين الـ 3D والتفاعل والرسوم المتحركة"),
                bullet("هوية بصرية قوية تعكس الأمان السيبراني: ألوان داكنة مع لمسات نيون + شبكات + جزيئات"),
                bullet("شعار متحرك (Animated Logo) للمشروع"),
                bullet("انتقالات سلسة (Smooth Scroll / Page Transitions)"),
                spacer(200),

                heading2("2.2 الهيكل الجديد المقترح"),
                spacer(100),

                heading3("بدلاً من Onboarding → Landing Page احترافية من صفحة واحدة (Single Page)"),
                spacer(100),

                ...sectionBox("القسم 1 — Hero الرئيسي", [
                    "شاشة كاملة Full-Screen مع خلفية متحركة (3D Globe + Particles)",
                    "شعار المشروع متحرك (SVG Animation مع Neon Glow)",
                    "عنوان رئيسي: 'سحابة الأمن السيبراني' + جملة تعريفية",
                    "زرين: 'تسجيل الدخول' + 'المزيد عن المنصة'",
                    "تأثير Parallax على الخلفية عند التمرير",
                ]),
                spacer(100),

                ...sectionBox("القسم 2 — إحصائيات سريعة (Stats Counter)", [
                    "4 أرقام متحركة بعدد المستخدمين - المواد - التكاليف - المعلمين",
                    "عداد متحرك من 0 إلى الرقم النهائي عند الوصول للقسم",
                    "أيقونات احترافية (SVG) بدلاً من Emoji",
                ]),
                spacer(100),

                ...sectionBox("القسم 3 — الأدوار (Roles Section)", [
                    "بطاقات تفاعلية (4 أدوار) مع أيقونات SVG مخصصة لكل دور",
                    "عند التمرير على البطاقة: ينعكس الضوء ويتغير اللون + يتوسع",
                    "وصف مختصر جداً (سطرين) لكل دور",
                    "خلفية متغيرة حسب الدور المختار (تأثير ديناميكي)",
                ]),
                spacer(100),

                ...sectionBox("القسم 4 — المميزات (Features Grid)", [
                    "شبكة 3×3 من المميزات الرئيسية (التفعيل، الاستعادة، الأمان، المكتبة...)",
                    "كل ميزة: أيقونة + عنوان + وصف سطر واحد",
                    "تأثير Fade-in عند التمرير (Intersection Observer)",
                    "ألوان متدرجة لكل بطاقة (Gradient Cards)",
                ]),
                spacer(100),

                ...sectionBox("القسم 5 — الأمان (Security Showcase)", [
                    "تصور بصري لطبقات الأمان (قفل متحرك، درع، تشفير)",
                    "شريط تقدم أو رادار يوضح مستوى الحماية",
                    "ذكر التقنيات: Argon2id, CSRF, 2FA, XSS Protection",
                ]),
                spacer(100),

                ...sectionBox("القسم 6 — Call to Action (الختام)", [
                    "رسالة تحفيزية + زر 'ابدأ الآن' يوجه لتسجيل الدخول",
                    "تأثير جسيمات يزيد كثافة عند هذا القسم",
                    "روابط التواصل: فيسبوك, تلغرام, إيميل الدعم",
                ]),
                spacer(200),

                heading2("2.3 مكتبات وأدوات جديدة مقترحة"),
                spacer(100),
                toolsTable(),
                spacer(200),

                heading2("2.4 خطة التنفيذ المرحلية"),
                spacer(100),
                phaseTable(),
                spacer(200),

                heading2("2.5 الميزانية المقترحة"),
                spacer(100),
                budgetTable(),
                spacer(200),

                heading2("2.6 تحسينات إضافية (اختيارية)"),
                bullet("دمج PWA مع شاشة Splash مخصصة (manifest.json + service worker)"),
                bullet("إضافة دعم Dark/Light Mode للواجهة التعريفية"),
                bullet("تأثير Typing Effect على العنوان الرئيسي"),
                bullet("دمج لقطات فيديو توضيحية قصيرة (أقل من 30 ثانية)"),
                bullet("إضافة دعم الترجمة (Arabic/English) للواجهة التعريفية"),
                bullet("تحسين الـ SEO للصفحة التعريفية (Meta tags, Open Graph)"),
            ],
        },
    ];
}

// ===================== COMPARISON =====================
function comparisonSection() {
    return [
        {
            properties: {
                page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
            },
            children: [
                new Paragraph({ children: [new TextRun({ break: 1 })] }),
                heading1("قسم ثالث: جدول المقارنة — قبل وبعد"),
                spacer(200),
                comparisonTable2(),
            ],
        },
    ];
}

// ===================== CONCLUSION =====================
function conclusionSection() {
    return [
        {
            properties: {
                page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
            },
            children: [
                new Paragraph({ children: [new TextRun({ break: 1 })] }),
                heading1("الخلاصة والتوصيات النهائية"),
                spacer(200),
                bullet("الواجهة التعريفية الحالية لا ترقى لمستوى مشروع قيمته $1,000-$5,000"),
                bullet("التقييم الحالي: 45/100 — يحتاج إعادة تصميم شاملة"),
                bullet("البديل المقترح: Landing Page من صفحة واحدة بدلاً من 12 شريحة منفصلة"),
                bullet("الميزانية المقدرة للتطوير: $800-$1,500 (ضمن نطاق المشروع)"),
                bullet("مدة التنفيذ: 5-7 أيام عمل"),
                bullet("الأثر المتوقع: رفع احترافية الموقع من 45% إلى 90%+"),
                spacer(200),
                line(),
                spacer(100),
                centerText("— نهاية التقرير —", 22, true, COLORS.primary, "Traditional Arabic"),
                centerText("CyberSecurity Cloud © 2026", 18, true, COLORS.light),
            ],
        },
    ];
}

// ===================== HELPER FUNCTIONS =====================
function spacer(twips: number): Paragraph {
    return new Paragraph({ spacing: { before: twips }, children: [] });
}

function centerText(text: string, size: number, bold: boolean, color: string, font?: string, italics?: boolean): Paragraph {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [new TextRun({ text, bold, size, color, font: font || "Traditional Arabic", italics })],
    });
}

function line(): Paragraph {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "─".repeat(50), size: 20, color: "bdbdbd" })],
    });
}

function heading1(text: string): Paragraph {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.RIGHT,
        spacing: { before: 400 },
        children: [new TextRun({ text, bold: true, size: 32, color: COLORS.primary, font: "Traditional Arabic" })],
    });
}

function heading2(text: string): Paragraph {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.RIGHT,
        spacing: { before: 300 },
        children: [new TextRun({ text, bold: true, size: 28, color: COLORS.accent, font: "Traditional Arabic" })],
    });
}

function heading3(text: string): Paragraph {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200 },
        children: [new TextRun({ text, bold: true, size: 24, color: COLORS.text, font: "Traditional Arabic" })],
    });
}

function bullet(text: string): Paragraph {
    return new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60 },
        children: [new TextRun({ text: `• ${text}`, size: 20, font: "Traditional Arabic" })],
    });
}

function numbered(text: string): Paragraph {
    return new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60 },
        children: [new TextRun({ text: `${text}`, size: 20, font: "Traditional Arabic" })],
    });
}

function problem(text: string, severity: string): Paragraph {
    const s = severity === "عالية" ? COLORS.secondary : severity === "متوسطة" ? COLORS.orange : COLORS.light;
    return new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 80 },
        indent: { right: 400 },
        children: [
            new TextRun({ text: `• [${severity}] `, bold: true, size: 20, color: s, font: "Traditional Arabic" }),
            new TextRun({ text, size: 20, font: "Traditional Arabic" }),
        ],
    });
}

function sectionBox(title: string, items: string[]): Paragraph[] {
    const result: Paragraph[] = [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 120 },

            children: [new TextRun({ text: title, bold: true, size: 22, color: COLORS.cyan, font: "Traditional Arabic" })],
        }),
    ];
    for (const item of items) {
        result.push(new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 40 },
            indent: { right: 400 },
            children: [new TextRun({ text: `◦ ${item}`, size: 20, font: "Traditional Arabic" })],
        }));
    }
    return result;
}

function comparisonTable(): Table {
    const h = (t: string) => new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, size: 20, color: "ffffff" })] })],
        shading: { fill: COLORS.accent },
    });
    const r = (a: string, b: string) => [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: a, size: 18, font: "Traditional Arabic" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: b, size: 18, font: "Traditional Arabic" })] })] }),
    ];
    return new Table({
        rows: [
            new TableRow({ children: [h("العنصر"), h("الوضع الحالي")], tableHeader: true }),
            new TableRow({ children: r("عدد الشرائح", "12 شريحة — طويل جداً") }),
            new TableRow({ children: r("الأيقونات", "Emoji — غير احترافي") }),
            new TableRow({ children: r("التفاعل", "لا يوجد — مجرد Carousel") }),
            new TableRow({ children: r("الشعار", "لا يوجد") }),
            new TableRow({ children: r("الـ 3D", "مخفي بنسبة 25%") }),
            new TableRow({ children: r("الإحصائيات", "لا توجد") }),
            new TableRow({ children: r("التجاوب مع الجوال", "ضعيف — نصوص طويلة") }),
            new TableRow({ children: r("الهوية البصرية", "غير واضحة — مجرد ألوان نيون") }),
        ],
    });
}

function comparisonTable2(): Table {
    const h = (t: string) => new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, size: 20, color: "ffffff" })] })],
        shading: { fill: COLORS.accent },
    });
    const r = (a: string, b: string, c: string) => [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: a, size: 18, font: "Traditional Arabic" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: b, size: 18, font: "Traditional Arabic" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: c, size: 18, font: "Traditional Arabic" })] })] }),
    ];
    return new Table({
        rows: [
            new TableRow({ children: [h("العنصر"), h("قبل التطوير"), h("بعد التطوير")], tableHeader: true }),
            new TableRow({ children: r("الصفحة الرئيسية", "شاشة تحميل فقط", "Full-Screen Hero متحرك") }),
            new TableRow({ children: r("التعريف", "12 شريحة Carousel", "Landing Page من صفحة واحدة") }),
            new TableRow({ children: r("الأيقونات", "Emoji", "SVG Animations") }),
            new TableRow({ children: r("الكرة الأرضية", "مخفية 25%", "خلفية تفاعلية Full-Screen") }),
            new TableRow({ children: r("الشعار", "غير موجود", "Animated Logo مع Neon Glow") }),
            new TableRow({ children: r("الإحصائيات", "لا توجد", "4 Counters متحركة") }),
            new TableRow({ children: r("الأدوار", "نصوص فقط", "بطاقات تفاعلية") }),
            new TableRow({ children: r("المميزات", "قائمة نصية", "شبكة 3×3 مع Fade-in") }),
            new TableRow({ children: r("التقييم", "45/100", "90/100+") }),
            new TableRow({ children: r("التكلفة", "ضمن المشروع", "$800-$1,500 إضافي") }),
        ],
    });
}

function toolsTable(): Table {
    const h = (t: string) => new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, size: 20, color: "ffffff" })] })],
        shading: { fill: COLORS.accent },
    });
    const r = (a: string, b: string, c: string) => [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: a, size: 18, font: "Traditional Arabic" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: b, size: 18, font: "Traditional Arabic" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: c, size: 18, font: "Traditional Arabic" })] })] }),
    ];
    return new Table({
        rows: [
            new TableRow({ children: [h("المكتبة"), h("الوظيفة"), h("البديل الحالي")], tableHeader: true }),
            new TableRow({ children: r("Framer Motion", "رسوم متحركة متقدمة", "موجود — لكن غير مستغل") }),
            new TableRow({ children: r("Three.js / React Three Fiber", "خلفيات 3D تفاعلية", "موجود — يحتاج تطوير") }),
            new TableRow({ children: r("GSAP (ScrollTrigger)", "تحريك عند التمرير", "غير موجود") }),
            new TableRow({ children: r("LottieFiles", "رسوم SVG متحركة", "غير موجود") }),
            new TableRow({ children: r("Intersection Observer", "كشف التمرير", "غير موجود") }),
            new TableRow({ children: r("React Icons / Lucide", "أيقونات احترافية", "Emoji — ضعيف") }),
            new TableRow({ children: r("Sharp / BlurHash", "تحسين الصور", "غير موجود") }),
            new TableRow({ children: r("next-themes", "دعم Dark/Light", "غير موجود") }),
        ],
    });
}

function phaseTable(): Table {
    const h = (t: string) => new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, size: 20, color: "ffffff" })] })],
        shading: { fill: COLORS.accent },
    });
    const r = (a: string, b: string, c: string) => [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: a, size: 18, font: "Traditional Arabic" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: b, size: 18, font: "Traditional Arabic" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: c, size: 18, font: "Traditional Arabic" })] })] }),
    ];
    return new Table({
        rows: [
            new TableRow({ children: [h("المرحلة"), h("المدة"), h("المهام")], tableHeader: true }),
            new TableRow({ children: r("1 — التخطيط", "يوم", "تحديد الهيكل البصري، الألوان، الشعار، المحتوى") }),
            new TableRow({ children: r("2 — الهيكل الأساسي", "يومان", "إنشاء Hero + Sections + Navigation") }),
            new TableRow({ children: r("3 — التأثيرات", "يومان", "3D Globe + Particles + Scroll Animations") }),
            new TableRow({ children: r("4 — التفاعل", "يوم", "البطاقات المتحركة + Counters + Transitions") }),
            new TableRow({ children: r("5 — اللمسات النهائية", "نصف يوم", "تحسين الأداء + اختبار الجوال + SEO") }),
        ],
    });
}

function budgetTable(): Table {
    const h = (t: string) => new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, size: 20, color: "ffffff" })] })],
        shading: { fill: COLORS.accent },
    });
    const r = (a: string, b: string) => [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: a, size: 18, font: "Traditional Arabic" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: b, size: 18, font: "Traditional Arabic" })] })] }),
    ];
    return new Table({
        rows: [
            new TableRow({ children: [h("البند"), h("التكلفة التقديرية")], tableHeader: true }),
            new TableRow({ children: r("تصميم الهوية البصرية والشعار", "$200 - $350") }),
            new TableRow({ children: r("تطوير Hero + 3D Globe تفاعلي", "$200 - $400") }),
            new TableRow({ children: r("تطوير الأقسام (Roles, Features, Stats)", "$200 - $350") }),
            new TableRow({ children: r("الرسوم المتحركة والانتقالات", "$100 - $200") }),
            new TableRow({ children: r("تحسين الأداء والجوال والSEO", "$100 - $200") }),
            new TableRow({ children: r("المجموع الكلي", "$800 - $1,500", ), }),
        ],
    });
}

async function main() {
    console.log("جاري إنشاء تقرير تحليل الواجهة التعريفية...");
    const document = doc();
    const buffer = await Packer.toBuffer(document);
    fs.writeFileSync(OUTPUT_PATH, buffer);
    console.log(`✅ تم إنشاء التقرير: ${OUTPUT_PATH}`);
}

main().catch(console.error);
