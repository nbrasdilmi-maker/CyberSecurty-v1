import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType
} from "docx";
import * as fs from "fs";
import * as path from "path";

const OUT = path.join(import.meta.dirname, "..", "NOTIFICATIONS_ICONS_AUDIT_REPORT.docx");

const C = {
    primary: "1a237e", secondary: "c62828", accent: "283593",
    text: "37474f", muted: "546e7a", green: "2e7d32", orange: "e65100",
    cyan: "00838f",
};

function spacer(h = 120) { return new Paragraph({ spacing: { before: h }, children: [] }); }
function h1(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.RIGHT, spacing: { before: 400 }, children: [new TextRun({ text: t, bold: true, size: 32, color: C.primary, font: "Traditional Arabic" })] }); }
function h2(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_2, alignment: AlignmentType.RIGHT, spacing: { before: 300 }, children: [new TextRun({ text: t, bold: true, size: 28, color: C.accent, font: "Traditional Arabic" })] }); }
function h3(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_3, alignment: AlignmentType.RIGHT, spacing: { before: 200 }, children: [new TextRun({ text: t, bold: true, size: 24, color: C.text, font: "Traditional Arabic" })] }); }
function p(t: string) { return new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 60 }, children: [new TextRun({ text: t, size: 20, font: "Traditional Arabic" })] }); }
function b(t: string) { return new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 60 }, indent: { right: 300 }, children: [new TextRun({ text: `• ${t}`, size: 20, font: "Traditional Arabic" })] }); }
function n(t: string) { return new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 60 }, children: [new TextRun({ text: t, size: 20, font: "Traditional Arabic" })] }); }
function label(t: string, s: string) {
    const color = s === "حرجة" ? C.secondary : s === "عالية" ? C.orange : s === "متوسطة" ? "#f57f17" : C.muted;
    return new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 60 }, indent: { right: 300 }, children: [
        new TextRun({ text: `• [${s}] `, bold: true, size: 20, color, font: "Traditional Arabic" }),
        new TextRun({ text: t, size: 20, font: "Traditional Arabic" }),
    ] });
}
function code(t: string) {
    return new Paragraph({
        alignment: AlignmentType.RIGHT, spacing: { before: 40 }, indent: { right: 500 },
        children: [new TextRun({ text: t, size: 18, color: C.cyan, font: "Consolas", italics: true })],
    });
}

function makeTable(headers: string[], rows: string[][]): Table {
    const h = (t: string) => new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, size: 18, color: "ffffff" })] })],
        shading: { fill: C.accent },
    });
    const r = (cells: string[]) => cells.map(c => new TableCell({
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: c, size: 17, font: "Traditional Arabic" })] })],
    }));
    return new Table({
        rows: [
            new TableRow({ children: headers.map(h), tableHeader: true }),
            ...rows.map(row => new TableRow({ children: r(row) })),
        ],
    });
}

function doc() {
    return new Document({
        title: "تقرير تدقيق نظام الإشعارات والأيقونات",
        styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
        sections: [
            // Cover
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    spacer(3600),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تقرير تدقيق شامل", bold: true, size: 48, color: C.primary, font: "Traditional Arabic" })] }),
                    spacer(200),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "نظام الإشعارات وأيقونات الموقع", bold: true, size: 36, color: C.secondary, font: "Traditional Arabic" })] }),
                    spacer(400),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Notification System & Site Icons Audit Report", size: 24, color: C.muted, italics: true })] }),
                    spacer(600),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "سحابة الأمن السيبراني — جامعة ذمار", size: 22, font: "Traditional Arabic" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تاريخ التدقيق: 14 يونيو 2026", size: 20, font: "Traditional Arabic" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "إصدار التقرير: v1.0", size: 20, font: "Traditional Arabic" })] }),
                ],
            },

            // ========== PART 1: NOTIFICATIONS ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الأول: نظام الإشعارات"),
                    spacer(200),

                    h2("1.1 نظرة عامة على البنية الحالية"),
                    spacer(100),
                    p("نظام الإشعارات في الموقع يعمل عبر 4 طبقات مترابطة:"),
                    spacer(60),
                    b("الطبقة 1 — واجهة المستخدم (FloatingBell): مكون React طرف العميل يعرض أيقونة الجرس ونافذة الإشعارات المنبثقة"),
                    b("الطبقة 2 — Supabase Realtime (WebSocket): اتصال مباشر ثنائي الاتجاه لاستقبال الإشعارات الحية بدون تحديث الصفحة"),
                    b("الطبقة 3 — REST API: مساران (list, mark-read) للتواصل مع قاعدة البيانات"),
                    b("الطبقة 4 — Push Service Worker: إشعارات المتصفح حتى عندما يكون الموقع مغلقاً"),
                    spacer(200),

                    h2("1.2 مكونات النظام بالتفصيل"),
                    spacer(100),

                    h3("1.2.1 FloatingBell — مكون الجرس (642 سطراً)"),
                    spacer(60),
                    p("الملف: src/components/ui/FloatingBell.tsx"),
                    b("الاعتماد: React + Framer Motion + Supabase Realtime + CSRF Token"),
                    b("آلية العمل: عند تحميل المكون، يتحقق من وجود userId في store → إذا موجود، يجلب الإشعارات من /api/notifications/list كل 30 ثانية + يستقبل تحديثات حية عبر Supabase Realtime"),
                    b("المشاكل:"),
                    label("استخدام مكونة 642 سطراً — كبيرة جداً ومعقدة. يصعب صيانتها", "متوسطة"),
                    label("تحميل الإشعارات يحدث حتى لو كان المستخدم غير مسجل دخول (يفشل بهدوء — لا مشكلة أمنية لكنه إهدار للموارد)", "منخفضة"),
                    label("كل الإشعارات تُحمل في الذاكرة (10 إشعارات) — لا يوجد pagination ديناميكي عند التمرير", "منخفضة"),
                    label("لا يوجد limit على عدد الإشعارات غير المقروءة في عداد الجرس", "منخفضة"),
                    spacer(100),

                    h3("1.2.2 Supabase Realtime — الاتصال الحي (WebSocket)"),
                    spacer(60),
                    p("الملفات: src/hooks/useSupabaseRealtime.ts, src/lib/supabaseRealtime.ts (611 سطراً), src/lib/realtimeDiagnostics.ts (1611 سطراً)"),
                    b("الاعتماد: Supabase JS Client + WebSocket + Broadcast Channel"),
                    b("آلية العمل: الـ hook ينشئ اتصال WebSocket بقناة Supabase خاصة بالمستخدم. أي حدث INSERT في جدول notifications يتم بثه فوراً لجميع المستخدمين المستمعين للقناة. المكون يستقبل الحدث ويضيف الإشعار للقائمة مباشرة بدون انتظار تحديث API."),
                    b("المشاكل:"),
                    label("ملف realtimeDiagnostics.ts طوله 1611 سطراً — This is a code smell and maintenance nightmare", "عالية"),
                    label("يتم تحميل مكتبة supabase-js كاملة (مع كل تبعياتها) عند أول اتصال — يؤثر على حجم الحزمة", "متوسطة"),
                    label("إذا فشل اتصال Supabase، النظام لا يتحول للـ fallback (API polling) بل يتوقف عن العمل", "متوسطة"),
                    label("لا يوجد retry mechanism ذكي — يستخدم setTimeout عادي", "منخفضة"),
                    spacer(100),

                    h3("1.2.3 REST API — نقاط النهاية"),
                    spacer(60),
                    p("المسارات: /api/notifications/list (GET), /api/notifications/mark-read (POST)"),
                    b("الاعتماد: JWT Token من الكوكيز + Prisma ORM"),
                    b("آلية العمل: API يتحقق من صحة الـ JWT token → يستخرج userId → يستعلم من قاعدة البيانات عن الإشعارات الخاصة بهذا المستخدم"),
                    b("المشاكل:"),
                    label("لا يوجد تحديد معدل (rate limiting) على نقاط API", "متوسطة"),
                    label("لا يوجد CSRF check صريح — يعتمد على csrfFetch من طرف العميل فقط", "متوسطة"),
                    label("خطأ: mark-read يستخدم `markRead` في الكود ولكن الخدمة الفعلية اسم الدالة مختلفة", "عالية"),
                    spacer(100),

                    h3("1.2.4 Push Notifications — إشعارات المتصفح"),
                    spacer(60),
                    p("الملفات: src/lib/pushClient.ts, public/push-sw.js"),
                    b("الاعتماد: Service Worker + PushManager API + VAPID Keys"),
                    b("المشاكل الحرجة:"),
                    label("المسار في push-sw.js: icon: /icons/icon-192x192.png — الملف الفعلي اسمه android-chrome-192x192.png, هذا المسار غير موجود!", "حرجة"),
                    label("المسار في push-sw.js: badge: /icons/icon-96x96.png — هذا الملف غير موجود أصلاً!", "حرجة"),
                    spacer(100),

                    h2("1.3 مشاكل أمنية في نظام الإشعارات"),
                    spacer(60),
                    label("تسريب بيانات: WebSocket يبث بيانات الإشعارات لجميع المستمعين — إذا تم اختراق قناة المستخدم، المهاجم يرى كل الإشعارات", "عالية"),
                    label("لا يوجد توقيع على إشعارات Supabase — أي شخص لديه مفتاح anon key يستطيع إرسال إشعارات مزيفة", "متوسطة"),
                    label("الإشعارات تُحمل قبل التحقق من المصادقة (طلب API يفشل لكن الـ WebSocket لا يزال متصلاً)", "متوسطة"),
                    spacer(200),

                    h2("1.4 خطة الإصلاح — نظام الإشعارات"),
                    spacer(100),
                    h3("المرحلة 1 — فورية (حرجة):"),
                    b("إصلاح مسارات الأيقونات في push-sw.js (icon و badge) — تغيير المسار إلى /icons/android-chrome-192x192.png"),
                    b("إنشاء أيقونة 96×96 لوضعه كـ badge للمتصفح"),
                    spacer(60),
                    h3("المرحلة 2 — عالية:"),
                    b("إضافة rate limiting للإشعارات API"),
                    b("تقسيم FloatingBell إلى مكونات أصغر (Header, List, Item, Badge)"),
                    b("إعادة هيكلة realtimeDiagnostics.ts — تقليصه إلى أقل من 300 سطر"),
                    spacer(60),
                    h3("المرحلة 3 — متوسطة:"),
                    b("إضافة fallback: إذا فشل WebSocket → استخدم polling"),
                    b("إضافة CSRF check في API side"),
                    b("إضافة lazy load للـ supabase-js (dynamic import)"),
                    spacer(60),
                    h3("المرحلة 4 — تحسينات:"),
                    b("إضافة pagination ديناميكي لنافذة الإشعارات"),
                    b("إضافة تصنيف الإشعارات (غير مقروءة / الكل)"),
                    b("إضافة indicator لحالة الاتصال (متصل/غير متصل)"),

                    spacer(400),
                    h1("الجزء الثاني: أيقونات الموقع"),
                    spacer(200),

                    h2("2.1 الأيقونات الموجودة حالياً"),
                    spacer(100),
                    makeTable(
                        ["اسم الملف", "المسار", "الحجم", "الحالة"],
                        [
                            ["favicon.ico", "public/icons/favicon.ico", "15.4 KB", "موجود"],
                            ["favicon-16x16.png", "public/icons/favicon-16x16.png", "978 B", "موجود"],
                            ["favicon-32x32.png", "public/icons/favicon-32x32.png", "3 KB", "موجود"],
                            ["apple-touch-icon.png", "public/icons/apple-touch-icon.png", "71 KB", "موجود"],
                            ["android-chrome-192x192.png", "public/icons/android-chrome-192x192.png", "79 KB", "موجود"],
                            ["android-chrome-512x512.png", "public/icons/android-chrome-512x512.png", "527 KB", "موجود"],
                        ]
                    ),
                    spacer(200),

                    h2("2.2 الأيقونات المستخدمة في الكود vs الموجودة فعلياً"),
                    spacer(100),

                    h3("2.2.1 manifest.json (public/manifest.json)"),
                    code('"icons": [{ "src": "/icons/android-chrome-192x192.png" }, { "src": "/icons/android-chrome-512x512.png" }]'),
                    b("الملف المطلوب: /icons/android-chrome-192x192.png ✅ موجود"),
                    b("الملف المطلوب: /icons/android-chrome-512x512.png ✅ موجود"),
                    spacer(60),

                    h3("2.2.2 layout.tsx (src/app/layout.tsx)"),
                    code("icons: { icon: [{ url: '/icons/favicon.ico' }, { url: '/icons/favicon-16x16.png' }, { url: '/icons/favicon-32x32.png' }], apple: '/icons/apple-touch-icon.png' }"),
                    b("favicon.ico ✅ موجود — لكن حجمه 15KB كبير جداً لأيقونة favicon (المفروض < 2KB)"),
                    b("favicon-16x16.png ✅ موجود"),
                    b("favicon-32x32.png ✅ موجود"),
                    b("apple-touch-icon.png ✅ موجود"),
                    spacer(60),

                    h3("2.2.3 push-sw.js (public/push-sw.js) — أخطاء حرجة"),
                    code("icon: data.icon || '/icons/icon-192x192.png'"),
                    code("badge: data.badge || '/icons/icon-96x96.png'"),
                    spacer(60),
                    label("مسار icon = /icons/icon-192x192.png — هذا الملف غير موجود! الموجود هو android-chrome-192x192.png", "حرجة"),
                    label("مسار badge = /icons/icon-96x96.png — هذا الملف غير موجود من الأساس!", "حرجة"),
                    spacer(200),

                    h2("2.3 الأيقونات الناقصة"),
                    spacer(100),
                    makeTable(
                        ["الأيقونة الناقصة", "الاستخدام", "المقاس", "المكان المطلوب", "تم الاسم به"],
                        [
                            ["icon-192x192.png", "أيقونة Push Notification في Service Worker", "192×192", "public/icons/", "icon-192x192.png"],
                            ["icon-96x96.png", "Badge Push Notification (شعار صغير)", "96×96", "public/icons/", "icon-96x96.png"],
                            ["og-image.png", "صورة المشاركة (Open Graph / Social Media)", "1200×630", "public/", "og-image.png"],
                            ["favicon.svg", "أيقونة متصفح متجهة (SVG) — يدعم الـ dark mode", "any", "public/", "favicon.svg"],
                            ["safari-pinned-tab.svg", "أيقونة Safari pinned tab", "any", "public/", "safari-pinned-tab.svg"],
                        ]
                    ),
                    spacer(200),

                    h2("2.4 الحجم والمقاسات الموصى بها"),
                    spacer(100),
                    p("لأفضل أداء وتوافق مع جميع الأجهزة:"),
                    b("favicon.ico — 32×32 px — أقل من 2KB (حالياً 15KB — كبير جداً)"),
                    b("favicon-16x16.png — 16×16 px — 0.5-1KB ✅"),
                    b("favicon-32x32.png — 32×32 px — 1-2KB ✅"),
                    b("icon-192x192.png — 192×192 px — 20-50KB (Push Notification main icon)"),
                    b("icon-96x96.png — 96×96 px — 5-15KB (Push Notification badge)"),
                    b("android-chrome-512x512.png — 512×512 px — 50-200KB (حالياً 527KB — كبير يمكن تصغيره)"),
                    b("apple-touch-icon.png — 180×180 px — 10-30KB (حالياً 71KB — يمكن تصغيره)"),
                    b("og-image.png — 1200×630 px — 100-200KB (لمشاركة الموقع في واتساب, تويتر, تلغرام)"),
                    spacer(200),

                    h2("2.5 الفرق بين ما هو مطلوب وما هو موجود"),
                    spacer(100),
                    makeTable(
                        ["المسار في الكود", "الملف المطلوب", "الملف الموجود", "الخلل"],
                        [
                            ["/icons/icon-192x192.png", "icon-192x192.png", "android-chrome-192x192.png", "اسم الملف مختلف — سيظهر خطأ 404"],
                            ["/icons/icon-96x96.png", "icon-96x96.png", "— (غير موجود)", "الملف غير موجود — bad request 404"],
                            ["/icons/favicon.ico", "favicon.ico", "favicon.ico ✅", "موجود لكن حجمه كبير"],
                            ["/icons/apple-touch-icon.png", "apple-touch-icon.png", "apple-touch-icon.png ✅", "موجود لكن حجمه كبير"],
                            ["—", "og-image.png", "غير موجود", "لا توجد صورة لمشاركات التواصل الاجتماعي"],
                            ["—", "favicon.svg", "غير موجود", "عدم دعم الـ dark mode للمتصفحات الحديثة"],
                        ]
                    ),
                    spacer(200),

                    h2("2.6 خطة الإصلاح — أيقونات الموقع"),
                    spacer(100),
                    h3("المرحلة 1 — فورية: إصلاح المسارات في push-sw.js:"),
                    code('icon: data.icon || "/icons/android-chrome-192x192.png"'),
                    code('badge: data.badge || "/favicon-32x32.png"  // استخدام الموجود مؤقتاً'),
                    spacer(60),
                    h3("المرحلة 2 — إنشاء الأيقونات الناقصة:"),
                    b("إنشاء icon-192x192.png: نسخة من الأيقونة الحالية باسم icon-192x192.png في public/icons/"),
                    b("إنشاء icon-96x96.png: نسخة مصغرة في public/icons/"),
                    b("إنشاء og-image.png: 1200×630 في public/"),
                    spacer(60),
                    h3("المرحلة 3 — تحسين الجودة:"),
                    b("تصغير favicon.ico من 15KB إلى <2KB باستخدام TinyPNG أو ImageOptim"),
                    b("تصغير android-chrome-512x512.png من 527KB إلى <200KB"),
                    b("تصغير apple-touch-icon.png من 71KB إلى <30KB"),
                    spacer(60),
                    h3("المرحلة 4 — دعم المتصفحات الحديثة:"),
                    b("إنشاء favicon.svg في public/"),
                    b("إضافة safari-pinned-tab.svg في public/"),
                    b("إضافة og-image.png وتحسين الـ Open Graph في layout.tsx"),
                    spacer(200),

                    h2("2.7 مكان الأيقونات في المشروع"),
                    spacer(100),
                    p("جميع أيقونات الموقع توضع في المجلد التالي:"),
                    code("public/icons/"),
                    spacer(60),
                    p("أما الأيقونات الخاصة بالمشاركة والتعريف العام توضع في:"),
                    code("public/"),
                    spacer(60),
                    makeTable(
                        ["الملف", "المجلد", "نظام التسمية"],
                        [
                            ["favicon.ico", "public/icons", "اسم ثابت لا يتغير"],
                            ["android-chrome-192x192.png", "public/icons", "يتبع معيار Google PWA"],
                            ["apple-touch-icon.png", "public/icons", "يتبع معيار Apple"],
                            ["icon-96x96.png (جديد)", "public/icons", "يتبع معيار push notification"],
                            ["og-image.png (جديد)", "public/", "معيار Open Graph"],
                        ]
                    ),
                    spacer(200),

                    h2("2.8 كيف ستعمل الأيقونات بعد الإصلاح"),
                    spacer(100),
                    b("Safari / iOS: apple-touch-icon.png يظهر عند إضافة الموقع للشاشة الرئيسية"),
                    b("Android / Chrome: android-chrome-192x192.png + 512x512.png يظهران عند تثبيت الموقع كـ PWA"),
                    b("Push Notification: icon-192x192.png يظهر كصورة الإشعار المنبثق + icon-96x96.png كـ badge صغير"),
                    b("Tab المتصفح: favicon.ico + favicon.svg يظهران في tab + bookmarks"),
                    b("WhatsApp / Telegram / Twitter: og-image.png يظهر عند مشاركة رابط الموقع"),
                    b("Dark Mode: favicon.svg يتكيف مع خلفية المتصفح (داكن/فاتح)"),

                    spacer(400),
                    h1("الخلاصة النهائية"),
                    spacer(100),
                    makeTable(
                        ["المحور", "الدرجة الحالية", "الدرجة المتوقعة بعد الإصلاح"],
                        [
                            ["نظام الإشعارات (Notifications)", "65/100", "90/100"],
                            ["أيقونات الموقع (Icons)", "50/100", "95/100"],
                        ]
                    ),
                    spacer(100),
                    b("إجمالي المشاكل المكتشفة: 14 مشكلة (2 حرجة - 5 عالية - 4 متوسطة - 3 منخفضة)"),
                    b("المشاكل الحرجة: مسارات أيقونات خاطئة في Service Worker — تسبب 404 في Push Notifications"),
                    b("المشاكل العالية: ملف realtimeDiagnostics ضخم جداً (1611 سطر), عدم وجود rate limiting, أخطاء توقيع Supabase"),
                    b("خطة الإصلاح: 4 مراحل — فورية → عالية → متوسطة → تحسينات"),
                    b("مدة التنفيذ التقديرية: 3-4 أيام عمل"),

                    spacer(200),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "— نهاية التقرير —", bold: true, size: 22, color: C.primary, font: "Traditional Arabic" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "سحابة الأمن السيبراني © 2026", size: 18, color: C.muted })] }),
                ],
            },
        ],
    });
}

async function main() {
    console.log("جاري إنشاء التقرير...");
    const buffer = await Packer.toBuffer(doc());
    fs.writeFileSync(OUT, buffer);
    console.log(`✅ ${OUT}`);
}
main().catch(console.error);
