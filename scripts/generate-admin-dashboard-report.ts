import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, TableOfContents,
} from "docx";
import * as fs from "fs";
import * as path from "path";

const OUT = path.join(import.meta.dirname, "..", "ADMIN_DASHBOARD_ANALYSIS_REPORT.docx");

const C = {
    primary: "1a237e", secondary: "c62828", accent: "283593",
    text: "37474f", muted: "546e7a", green: "2e7d32", orange: "e65100",
    cyan: "00838f", gold: "f57f17",
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

function sectionBox(...children: (Paragraph | Table)[]) { return children; }

function doc() {
    return new Document({
        title: "تقرير تحليل لوحة تحكم الأدمن وخطة التطوير",
        styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
        sections: [
            // ========== COVER ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    spacer(3600),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تقرير تحليل شامل", bold: true, size: 48, color: C.primary, font: "Traditional Arabic" })] }),
                    spacer(200),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "لوحة تحكم الأدمن - سحابة الأمن السيبراني", bold: true, size: 36, color: C.secondary, font: "Traditional Arabic" })] }),
                    spacer(400),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Admin Dashboard Analysis & Development Plan", size: 24, color: C.muted, italics: true })] }),
                    spacer(600),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "سحابة الأمن السيبراني — جامعة ذمار", size: 22, font: "Traditional Arabic" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تاريخ التحليل: 14 يونيو 2026", size: 20, font: "Traditional Arabic" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "إصدار التقرير: v1.0", size: 20, font: "Traditional Arabic" })] }),
                ],
            },

            // ========== TABLE OF CONTENTS ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    spacer(600),
                    h1("فهرس المحتويات"),
                    spacer(200),
                    new TableOfContents("فهرس المحتويات"),
                ],
            },

            // ========== PART 1: OVERVIEW ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الأول: نظرة عامة على لوحة تحكم الأدمن"),
                    spacer(200),

                    h2("1.1 وصف النظام"),
                    p("لوحة تحكم الأدمن (Admin Dashboard) هي المركز الرئيسي لإدارة منصة سحابة الأمن السيبراني. توفر للمشرفين (Administrators) وصولاً كاملاً لجميع وظائف النظام بما في ذلك إدارة المستخدمين، إنشاء الحسابات، مراقبة النظام، إدارة المحتوى، والتحكم في الإعدادات."),
                    spacer(100),

                    h2("1.2 الموقع والمسار"),
                    code("المسار: /admin/page.tsx"),
                    code("إجمالي عدد سطور الكود: 544 سطراً"),
                    code("نوع المكوّن: Client Component (use client)"),
                    spacer(100),

                    h2("1.3 المكتبات والاعتماديات المستخدمة"),
                    makeTable(
                        ["المكتبة", "الاستخدام"],
                        [
                            ["React (useState, useEffect, useCallback)", "إدارة الحالة ودورة حياة المكوّن"],
                            ["Next.js (useRouter)", "التنقل بين الصفحات"],
                            ["Framer Motion (motion)", "الرسوم المتحركة والانتقالات"],
                            ["@/components/layout/Header", "الشريط العلوي الثابت"],
                            ["@/components/layout/Footer", "التذييل السفلي"],
                            ["@/components/layout/Sidebar", "القائمة الجانبية"],
                            ["@/components/ui/Toast", "نظام الإشعارات المنبثقة (Toast)"],
                            ["@/components/layout/PageTransition", "تأثيرات الانتقال بين الصفحات"],
                            ["@/store/authStore", "حالة المصادقة (Zustand)"],
                        ]
                    ),
                    spacer(200),

                    h2("1.4 نقاط النهاية API المستخدمة"),
                    makeTable(
                        ["الـ API", "الطريقة", "البيانات المسترجعة"],
                        [
                            ["/api/admin/users", "GET", "قائمة المستخدمين مع التصفية والترقيد"],
                            ["/api/server/stats", "GET", "إحصائيات السيرفر (المستخدمين، التكاليف، المحتوى، المواد)"],
                        ]
                    ),
                    spacer(200),

                    h2("1.5 هيكل الصفحة"),
                    p("تتكون لوحة تحكم الأدمن من 3 أقسام رئيسية:"),
                    spacer(60),
                    b("القسم 1 - الهيدر الترحيبي: صورة المستخدم + اسمه + عبارة 'الأدمن - تحكم كامل' + زر تسجيل الخروج"),
                    b("القسم 2 - بطاقات الإحصائيات: 7 بطاقات رأسية تعرض إحصائيات النظام الأساسية"),
                    b("القسم 3 - الاختصارات السريعة: 8 أزرار للوصول السريع إلى صفحات الإدارة المختلفة"),
                    spacer(200),

                    h2("1.6 إحصائيات الكود"),
                    makeTable(
                        ["المقياس", "القيمة"],
                        [
                            ["إجمالي سطور الكود", "544 سطراً"],
                            ["عدد imports", "11"],
                            ["عدد المكوّنات الداخلية", "مكوّن واحد (LogoutIcon SVG + AdminDashboard)"],
                            ["عدد الـ States", "3 (stats, loading)"],
                            ["عدد الـ Effects", "1 (useEffect لتحميل البيانات)"],
                            ["عدد الـ API Calls", "2 (متوازيان)"],
                            ["عدد بطاقات الإحصائيات", "7"],
                            ["عدد أزرار الاختصارات", "8"],
                        ]
                    ),
                ],
            },

            // ========== PART 2: FEATURES ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الثاني: تحليل الميزات والخصائص"),
                    spacer(200),

                    h2("2.1 الميزات الحالية"),
                    spacer(100),

                    h3("2.1.1 بطاقات الإحصائيات (Stat Cards)"),
                    spacer(60),
                    p("تعرض 7 بطاقات إحصائية في تنسيق عمودي (vertical list) مع أيقونات وألوان مختلفة:"),
                    spacer(40),
                    makeTable(
                        ["البطاقة", "الأيقونة", "اللون", "مصدر البيانات"],
                        [
                            ["إجمالي المستخدمين", "👥", "#00e5ff", "/api/admin/users"],
                            ["الحسابات المفعلة", "✅", "#2ea043", "/api/admin/users (filtered)"],
                            ["الحسابات المعلقة", "⏳", "#ffca28", "/api/admin/users (filtered)"],
                            ["إجمالي التكاليف", "📤", "#bf5af2", "/api/server/stats"],
                            ["التكاليف المقيمة", "📝", "#39ff14", "/api/server/stats"],
                            ["محتوى المكتبة", "📚", "#ff6b6b", "/api/server/stats"],
                            ["المواد الدراسية", "📘", "#ffca28", "/api/server/stats"],
                        ]
                    ),
                    spacer(60),
                    p("كل بطاقة تحتوي على:"),
                    b("أيقونة جانبية مع توهج متحرك (pulsing glow)"),
                    b("عنوان البطاقة بلون رمادي (#8b949e)"),
                    b("القيمة الرقمية بخط عريض بلون البطاقة"),
                    b("شريط توهج جانبي (gradient glow bar)"),
                    b("تأثير hover يضيء الحدود ويرفع البطاقة"),
                    spacer(100),

                    h3("2.1.2 الاختصارات السريعة (Quick Shortcuts)"),
                    spacer(60),
                    p("8 أزرار اختصارات سريعة بتصميم شبكي متجاوب (auto-fit grid):"),
                    spacer(40),
                    makeTable(
                        ["الاختصار", "الرابط", "الأيقونة", "اللون"],
                        [
                            ["إدارة التوليد", "/admin/generation", "🏗️", "#00e5ff"],
                            ["الحسابات المفعلة", "/admin/activated-accounts", "📋", "#2ea043"],
                            ["سجل العمليات", "/admin/audit-log", "📜", "#ffca28"],
                            ["رادار الأمان", "/admin/security-radar", "🛡️", "#f85149"],
                            ["الفصول الدراسية", "/admin/semester", "📅", "#bf5af2"],
                            ["استخدام الخادم", "/admin/server-usage", "💻", "#39ff14"],
                            ["الترفيعات", "/admin/promotions", "🏆", "#ffca28"],
                            ["ترقية المستخدمين", "/admin/upgrade", "⬆️", "#ff6b6b"],
                        ]
                    ),
                    spacer(60),
                    p("كل زر اختصار يتميز بـ:"),
                    b("أيقونة كبيرة في الأعلى (1.8rem)"),
                    b("نص بلون متناسق مع الأيقونة"),
                    b("تأثير hover يرفع الزر للأعلى مع إضافة ظل"),
                    b("تأثير ضغط (whileTap)"),
                    spacer(100),

                    h3("2.1.3 الهيدر الترحيبي"),
                    spacer(60),
                    p("يحتوي الهيدر على:"),
                    b("أفاتار المستخدم مع توهج أحمر نابض (pulsing red glow) — لون خاص بالأدمن"),
                    b("النص: '👑 مرحباً، {userName}' باللون الأحمر (#ff3131)"),
                    b("النص الفرعي: 'الأدمن - تحكم كامل' باللون الرمادي"),
                    b("زر تسجيل الخروج بتصميم أحمر شفاف"),
                    spacer(100),

                    h3("2.1.4 حالة التحميل (Loading State)"),
                    spacer(60),
                    p("أثناء تحميل البيانات، تظهر 7 بطاقات Skeleton بتصميم بسيط (مستطيلات رمادية متحركة). هذا يمنع flickering ويحسن تجربة المستخدم."),
                    spacer(100),

                    h3("2.1.5 معالجة الأخطاء (Error Handling)"),
                    spacer(60),
                    p("في حال فشل تحميل البيانات، يتم تجاهل الخطأ بصمت (catch block فارغ). لا تظهر رسالة خطأ للمستخدم."),
                    label("هذه نقطة ضعف — يجب إظهار رسالة خطأ وإعادة المحاولة", "عالية"),
                    spacer(200),

                    h2("2.2 الميزات المفقودة (Gap Analysis)"),
                    spacer(60),
                    label("لا توجد مخططات بيانية (Charts/Graphs) — إحصائيات نصية فقط", "عالية"),
                    label("لا توجد رسوم متحركة للعدادات (Animated Counters)", "متوسطة"),
                    label("لا توجد خاصية تحديث تلقائي (Auto-refresh)", "متوسطة"),
                    label("لا توجد تصفية زمنية (Date Range Filter)", "متوسطة"),
                    label("لا توجد إشعارات حية (Real-time Updates) على الداشبورد", "متوسطة"),
                    label("لا توجد خاصية تصدير التقارير (Export Reports)", "عالية"),
                    label("لا توجد بطاقات تحذيرية للمشكلات الحرجة في النظام", "عالية"),
                    label("لا توجد خاصية بحث عام (Global Search)", "متوسطة"),
                    label("بطاقة '/admin/upgrade' تؤدي إلى صفحة غير موجودة (404)", "حرجة"),
                    label("معالجة الأخطاء ضعيفة — الكاتش بلوك فارغ بدون تغذية راجعة", "عالية"),
                    label("لا توجد خاصية Dark/Light mode رغم أن النظام يستخدم الثيم الداكن فقط", "منخفضة"),
                    label("لا يوجد نظام Widgets قابل للتخصيص", "متوسطة"),
                    label("لا توجد خاصية نظام متعدد اللغات (i18n)", "منخفضة"),
                    label("التصميم ليس متجاوباً بالكامل مع الشاشات الصغيرة جداً", "متوسطة"),
                ],
            },

            // ========== PART 3: DETAILED PAGE ANALYSIS ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الثالث: تحليل صفحات الإدارة الفرعية"),
                    spacer(200),

                    h2("3.1 قائمة جميع صفحات الإدارة"),
                    spacer(100),
                    makeTable(
                        ["الصفحة", "المسار", "عدد السطور", "التعقيد", "حالة الصيانة"],
                        [
                            ["الرئيسية (Dashboard)", "/admin", "544", "🟢 منخفض", "نشط"],
                            ["الترفيعات", "/admin/promotions", "1331", "🔴 مرتفع", "نشط"],
                            ["التوليد - المواد", "/admin/generation/subjects", "995", "🟡 متوسط", "نشط"],
                            ["التوليد - الطلاب", "/admin/generation/students", "932", "🟡 متوسط", "نشط"],
                            ["استخدام السيرفر", "/admin/server-usage", "931", "🟡 متوسط", "نشط"],
                            ["التوليد - الإدارة", "/admin/generation/management", "924", "🟡 متوسط", "نشط"],
                            ["الحارس الأمني", "/admin/security-radar/guardian", "872", "🟡 متوسط", "نشط"],
                            ["المحطة الأمنية", "/admin/security-radar/terminal", "854", "🟡 متوسط", "نشط"],
                            ["الحسابات المفعلة", "/admin/activated-accounts", "856", "🟡 متوسط", "نشط"],
                            ["سجل العمليات", "/admin/audit-log", "672", "🟡 متوسط", "نشط"],
                            ["رادار الأمان", "/admin/security-radar", "666", "🟡 متوسط", "نشط"],
                            ["ترقية المستويات", "/admin/semester/promote", "692", "🟡 متوسط", "نشط"],
                            ["إدارة الترم", "/admin/semester/manage", "567", "🟢 منخفض", "نشط"],
                            ["التحكم بالبوت", "/admin/bot-control", "373", "🟢 منخفض", "نشط"],
                            ["الترم الدراسي", "/admin/semester", "419", "🟢 منخفض", "نشط"],
                            ["كنترول المنصة", "/admin/page-control", "480", "🟢 منخفض", "جديد"],
                            ["التوليد", "/admin/generation", "288", "🟢 منخفض", "نشط"],
                            ["ترقية المستخدمين", "/admin/upgrade", "—", "🔴 معطل", "الصفحة غير موجودة"],
                        ]
                    ),
                    spacer(100),
                    p("إجمالي عدد سطور الكود في جميع صفحات الإدارة: ~12,800 سطر (باستثناء API routes والخدمات)"),
                    spacer(200),

                    h2("3.2 تحليل كل صفحة"),
                    spacer(100),

                    h3("3.2.1 /admin/promotions — الترفيعات (1331 سطراً)"),
                    p("أكبر صفحة في نظام الإدارة. تتيح للأدمن البحث عن المستخدمين، منح/سحب صلاحيات النشر، منح/سحب رتب الإدارة، وإدارة طلبات الترقية."),
                    b("API Calls: GET /api/admin/users, GET /api/promotion/list, POST /api/admin/upgrade, POST /api/promotion/approve"),
                    b("الميزات: بحث متقدم بتصفية المستوى والدور والاسم، modals متعددة (صلاحيات + تأكيد)، عرض جماعي لطلبات الترقية مع تحديد متعدد (batch select)"),
                    label("يحتاج لتقسيم إلى مكونات أصغر لتقليل التعقيد", "عالية"),
                    spacer(100),

                    h3("3.2.2 /admin/server-usage — استخدام السيرفر (931 سطراً)"),
                    p("تصفح وإدارة ملفات السيرفر المخزنة في ImageKit. يعرض الملفات منظمة حسب المستوى الدراسي والمجلدات الفرعية."),
                    b("API Calls: GET /api/server/usage/folders, DELETE /api/server/usage/files"),
                    b("الميزات: تنقل في المجلدات (Drill-down)، عرض الجدول والبطاقات، تأكيد الحذف، فتح وتحميل الملفات"),
                    label("يعتمد على ImageKit API — أداء جيد. لكن يمكن إضافة رفع ملفات مباشرة", "متوسطة"),
                    spacer(100),

                    h3("3.2.3 /admin/activated-accounts — الحسابات المفعلة (856 سطراً)"),
                    p("عرض الحسابات التي تم توليدها وتفعيلها يدوياً. يدعم التبديل بين عرض الطلاب وعرض المواد."),
                    b("API Calls: GET /api/admin/generation-log, GET /api/admin/users, POST /api/auth/activate"),
                    b("الميزات: تبويبين (Users / Subjects)، تصفية بالمستوى، بحث، تفعيل يدوي مع إدخال كود التفعيل"),
                    spacer(100),

                    h3("3.2.4 /admin/security-radar — رادار الأمان (666 سطراً)"),
                    p("لوحة مراقبة أمنية تعرض 6 بطاقات (أخطاء، تحذيرات، اختراقات، ثغرات، هجمات، حظر). تدعم التحديث التلقائي كل 30 ثانية."),
                    b("API Calls: GET /api/security/stats, GET /api/security/logs"),
                    b("الميزات: 6 بطاقات تفاعلية قابلة للنقر لعرض التفاصيل، تحديث تلقائي + Supabase Realtime، ربط بصفحتي المحطة الأمنية والحارس الأمني"),
                    spacer(100),

                    h3("3.2.5 /admin/audit-log — سجل العمليات (672 سطراً)"),
                    p("سجل تدقيق كامل لجميع أحداث النظام مع الترقيد والتصفية."),
                    b("API Calls: GET /api/admin/audit-log"),
                    b("الميزات: ترقيد Pagination، تحديث يدوي، 4 بطاقات إحصائية، عرض للكمبيوتر (جدول) وللجوال (بطاقات)، ألوان حسب الخطورة"),
                    spacer(100),

                    h3("3.2.6 /admin/bot-control — التحكم بالبوت (373 سطراً)"),
                    p("إدارة ربط Telegram مع النظام، إعادة تعيين كلمة المرور عبر البوت، وإنشاء أكواد استعادة."),
                    b("API Calls: 5 endpoints مختلفين (stats, lookup, reset-password, reset-session, generate-code)"),
                    b("الميزات: إحصائيات الربط، بحث عن المستخدم، إرسال رابط إعادة تعيين، إعادة تشغيل البوت، إنشاء كود استعادة مع تصدير TXT"),
                    spacer(100),

                    h3("3.2.7 /admin/page-control — كنترول المنصة (480 سطراً، جديد)"),
                    p("التحكم في تفعيل وإيقاف صفحات النظام أثناء الصيانة. تم إنشاؤها في التحديث الأخير."),
                    b("API Calls: GET + POST /api/admin/page-control"),
                    b("الميزات: جدول يعرض 11 صفحة، toggle switch، رسائل صيانة مخصصة، التوثيق في سجل التدقيق"),
                ],
            },

            // ========== PART 4: TECHNICAL ANALYSIS ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الرابع: التحليل التقني"),
                    spacer(200),

                    h2("4.1 الهندسة المعمارية"),
                    spacer(60),
                    p("لوحة تحكم الأدمن تتبع نفس نمط باقي صفحات المشروع:"),
                    b("Client Component مع 'use client' في الأعلى"),
                    b("هيكل ثابت: Header → Sidebar → PageTransition → main → Footer"),
                    b("البيانات تُجلب عبر useEffect مع useCallback للاستقرار"),
                    b("Zustand store (authStore) لإدارة حالة المستخدم"),
                    b("تصميم داكن مع glass morphism (rgba + backdrop-filter + border-radius)"),
                    b("جميع التنسيقات CSS-in-JS (inline styles) — لا يوجد Tailwind أو CSS modules"),
                    spacer(100),

                    h2("4.2 الأداء (Performance)"),
                    spacer(60),
                    b("نقاط القوة:"),
                    label("استخدام Promise.all لتحميل البيانات بشكل متوازٍ", "إيجابي"),
                    label("استخدام useCallback لمنع إعادة إنشاء الدوال", "إيجابي"),
                    label("Framer Motion للرسوم المتحركة (GPU-accelerated)", "إيجابي"),
                    label("Skeleton loading يمنع layout shift", "إيجابي"),
                    spacer(40),
                    b("نقاط الضعف:"),
                    label("لا يوجد Memoization (React.memo, useMemo) للمكونات الداخلية", "متوسطة"),
                    label("لا يوجد تفريغ للبيانات عند unmount (abort controller)", "منخفضة"),
                    label("البيانات تُحمل مرة واحدة فقط — بدون تحديث تلقائي", "متوسطة"),
                    label("حجم Bundle في صفحة الأدمن: 6.43 kB (First Load JS: 139 kB)", "مقبول"),
                    spacer(100),

                    h2("4.3 الأمان (Security)"),
                    spacer(60),
                    b("نقاط القوة:"),
                    label("API routes محمية بـ JWT + CSRF", "إيجابي"),
                    label("الـ middleware يمنع غير الأدمن من الوصول إلى /admin/*", "إيجابي"),
                    label("AdminService.getUsers يحدد البيانات حسب الدور (ADMIN vs MANAGEMENT)", "إيجابي"),
                    spacer(40),
                    b("نقاط الضعف:"),
                    label("لا يوجد Rate Limiting على API calls من الداشبورد", "متوسطة"),
                    label("لا يوجد Logging للدخول إلى صفحة الأدمن", "منخفضة"),
                    spacer(100),

                    h2("4.4 تجربة المستخدم (UX)"),
                    spacer(60),
                    b("نقاط القوة:"),
                    label("تصميم داكن جذاب يناسب طبيعة المشروع (Cybersecurity)", "إيجابي"),
                    label("Framer Motion يضيف سلاسة في التفاعل", "إيجابي"),
                    label("Skeleton loading أثناء تحميل البيانات", "إيجابي"),
                    spacer(40),
                    b("نقاط الضعف:"),
                    label("البطاقات الإحصائية عمودية — تحتاج مساحة رأسية كبيرة", "عالية"),
                    label("لا توجد مخططات بيانية — إحصائيات نصية فقط", "عالية"),
                    label("لا توجد رسوم متحركة للعدادات (0 إلى القيمة)", "متوسطة"),
                    label("الاختصارات السريعة مكررة مع القائمة الجانبية", "متوسطة"),
                    label("شاشة 404 لرابط '/admin/upgrade'", "حرجة"),
                    label("لا توجد إحصائيات وقت حقيقي (Real-time)", "متوسطة"),
                    label("زر تسجيل الخروج مكرر (موجود في Sidebar)", "منخفضة"),
                    spacer(100),

                    h2("4.5 التوافقية (Responsive Design)"),
                    spacer(60),
                    b("الشاشات الكبيرة (Desktop > 1024px): يعمل بشكل جيد"),
                    b("الشاشات المتوسطة (Tablet 768-1024px): مقبول — استخدام auto-fit grid"),
                    b("الشاشات الصغيرة (Mobile < 768px):"),
                    label("البطاقات الإحصائية تصبح ضيقة جداً", "متوسطة"),
                    label("الاختصارات تصبح صف واحد بعمودين", "متوسطة"),
                    label("النصوص قد تفيض في الشاشات الصغيرة جداً", "منخفضة"),
                ],
            },

            // ========== PART 5: SCORING ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الخامس: تقييم الجودة"),
                    spacer(200),

                    h2("5.1 جدول التقييم"),
                    spacer(100),
                    makeTable(
                        ["المجال", "الدرجة", "الملاحظات"],
                        [
                            ["واجهة المستخدم (UI)", "65/100", "تصميم جيد لكنه تقليدي، يفتقر للعصرية"],
                            ["تجربة المستخدم (UX)", "55/100", "بطاقات عمودية تستهلك مساحة، لا مخططات"],
                            ["الأداء (Performance)", "70/100", "جيد لكن بدون تحسينات متقدمة"],
                            ["الأمان (Security)", "85/100", "JWT + CSRF + Middleware — ممتاز"],
                            ["التوافقية (Responsive)", "50/100", "ضعيف على الشاشات الصغيرة"],
                            ["الصيانة (Maintainability)", "60/100", "544 سطراً في ملف واحد — يمكن قصّها"],
                            ["الاكتمال (Completeness)", "60/100", "صفحة /admin/upgrade غير موجودة"],
                            ["الابتكار (Innovation)", "40/100", "لا توجد ميزات متقدمة أو ذكاء اصطناعي"],
                        ]
                    ),
                    spacer(100),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200 },
                        children: [
                            new TextRun({ text: "الدرجة الإجمالية: 60/100", bold: true, size: 28, color: C.gold, font: "Traditional Arabic" }),
                        ]
                    }),
                    spacer(200),

                    h2("5.2 عدد المشاكل المكتشفة"),
                    spacer(60),
                    makeTable(
                        ["الخطورة", "العدد", "الوصف"],
                        [
                            ["حرجة", "1", "صفحة /admin/upgrade تؤدي إلى 404"],
                            ["عالية", "5", "لا مخططات، لا تصدير، معالجة أخطاء ضعيفة، بطاقات عمودية، لا تقارير"],
                            ["متوسطة", "8", "لا تحديث تلقائي، لا Real-time، لا بحث عام، لا Memoization، تصميم متجاوب ضعيف، إلخ"],
                            ["منخفضة", "3", "لا i18n، زر تسجيل خروج مكرر، لا Abort Controller"],
                        ]
                    ),
                    spacer(60),
                    b("إجمالي المشاكل: 17 مشكلة"),
                ],
            },

            // ========== PART 6: DEVELOPMENT PLAN ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء السادس: خطة التطوير — نحو لوحة تحكم احترافية وفخمة"),
                    spacer(200),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 100 },
                        children: [
                            new TextRun({ text: "الرؤية: تحويل لوحة تحكم الأدمن إلى منصة إدارة متكاملة", bold: true, size: 26, color: C.accent, font: "Traditional Arabic" }),
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 60 },
                        children: [
                            new TextRun({ text: "تعكس هيبة المنصة وتوفر تجربة استخدام عالمية المستوى", size: 22, color: C.muted, font: "Traditional Arabic" }),
                        ]
                    }),
                    spacer(200),

                    h2("6.1 فلسفة التصميم الجديد"),
                    spacer(60),
                    p("سيتم إعادة تصميم لوحة تحكم الأدمن بالكامل وفق المبادئ التالية:"),
                    spacer(40),
                    b("الاحترافية (Professional): تصميم أنيق ونظيف يليق بمنصة حكومية تعليمية"),
                    b("الوظائفية (Functional): كل عنصر له غرض واضح — لا زخرفة بدون فائدة"),
                    b("السرعة (Performance): تحميل فوري مع lazy loading للعناصر الثقيلة"),
                    b("التجاوب (Responsive): تعمل بشكل مثالي على جميع الشاشات"),
                    b("المراقبة (Monitoring): معرفة حالة النظام في لمحة بصر واحدة"),
                    b("الأتمتة (Automation): تقليل النقرات المتكررة — المهام الروتينية بنقرة واحدة"),
                    spacer(200),

                    h2("6.2 الهيكل الجديد للوحة التحكم"),
                    spacer(100),

                    h3("6.2.1 التخطيط العام"),
                    spacer(60),
                    p("ستتكون لوحة التحكم الجديدة من 5 مناطق رئيسية:"),
                    spacer(40),

                    makeTable(
                        ["المنطقة", "المحتوى", "الأولوية"],
                        [
                            ["1. شريط الحالة العلوي (Status Bar)", "تاريخ اليوم، الوقت، حالة السيرفر، اتصال البوت، عدد المستخدمين النشطين", "عالية"],
                            ["2. بطاقات الأداء الرئيسية (KPI Cards)", "7-9 بطاقة بتصميم شبكي 3×3 مع عدادات متحركة", "عالية"],
                            ["3. المخططات البيانية (Charts Section)", "4 مخططات تفاعلية (Line, Bar, Pie, Donut)", "عالية"],
                            ["4. النشاطات الأخيرة (Recent Activity)", "آخر 10 عمليات في النظام + آخر المستخدمين المسجلين", "متوسطة"],
                            ["5. الاختصارات الذكية (Smart Shortcuts)", "أزرار سريعة مع إحصائيات مصغرة", "متوسطة"],
                        ]
                    ),
                    spacer(200),

                    h2("6.3 الميزات الجديدة بالتفصيل"),
                    spacer(100),

                    h3("6.3.1 🇦 شريط الحالة العلوي (Status Bar)"),
                    spacer(60),
                    p("شريط علوي جديد مختلف عن Header الحالي. يعرض معلومات حية عن حالة المنصة:"),
                    b("🟢 حالة السيرفر: متصل / منقطع مع مؤشر زمن الاستجابة (Ping)"),
                    b("🤖 حالة البوت: متصل / منقطع مع آخر اتصال"),
                    b("👥 المستخدمون النشطون الآن (Online Users) — عبر Supabase Presence"),
                    b("🕒 التاريخ والوقت المباشر بتصميم أنيق (Digital Clock)"),
                    b("📊 استخدام السيرفر: CPU, RAM, Storage — نسب مئوية مع أشرطة تقدم"),
                    spacer(100),

                    h3("6.3.2 🇧 بطاقات KPI مع عدادات متحركة (Animated Counters)"),
                    spacer(60),
                    p("استبدال البطاقات العمودية الحالية بشبكة 3×3 من البطاقات المصممة:"),
                    spacer(40),
                    makeTable(
                        ["البطاقة", "الأيقونة", "البيانات", "نوع الرسم"],
                        [
                            ["إجمالي المستخدمين", "👥", "العدد الإجمالي", "عداد متحرك + شريط تقدم"],
                            ["الحسابات المفعلة", "✅", "العدد + نسبة التفعيل", "عداد + دائرة نسبة مئوية"],
                            ["الحسابات المعلقة", "⏳", "العدد", "عداد + مؤشر تحذير إن زاد"],
                            ["إجمالي التكاليف", "📤", "العدد الإجمالي", "عداد متحرك"],
                            ["التكاليف المقيمة", "📝", "العدد + نسبة التقييم", "عداد + شريط تقدم"],
                            ["محتوى المكتبة", "📚", "العدد", "عداد متحرك"],
                            ["المواد الدراسية", "📘", "العدد", "عداد + توزيع لكل مستوى"],
                            ["عمليات اليوم", "📊", "العدد", "عداد + رسم شرارة (Sparkline)"],
                            ["إشعارات اليوم", "🔔", "العدد", "عداد + أيقونة نابضة"],
                        ]
                    ),
                    spacer(60),
                    p("كل بطاقة ستحتوي على:"),
                    b("أيقونة SVG مخصصة (بدلاً من emojis) مع تدرج لوني (gradient)"),
                    b("عداد متحرك من 0 إلى القيمة النهائية خلال 1.5 ثانية"),
                    b("بطاقة خلفية (Mini Sparkline Chart) تظهر الاتجاه"),
                    b("تأثير Hover متقدم مع رفع البطاقة وتحسين الإضاءة"),
                    spacer(100),

                    h3("6.3.3 🇩 المخططات البيانية التفاعلية (Interactive Charts)"),
                    spacer(60),
                    p("إضافة 4 مخططات بيانية باستخدام مكتبة Recharts (موجودة فعلاً في الـ package.json):"),
                    spacer(40),
                    makeTable(
                        ["المخطط", "النوع", "البيانات", "الغرض"],
                        [
                            ["مستخدمين خلال الأسبوع", "Line Chart (مساحة)", "تسجيلات الدخول اليومية", "مراقبة نشاط المستخدمين"],
                            ["توزيع المستخدمين حسب الدور", "Pie Chart (دائري)", "ADMIN/MANAGEMENT/TEACHER/STUDENT", "فهم تركيبة المستخدمين"],
                            ["التكاليف حسب المستوى", "Bar Chart (أعمدة)", "كل مستوى + عدد التكاليف", "مقارنة العبء الدراسي"],
                            ["نمو المحتوى", "Area Chart (مساحة متراكمة)", "تراكم المحتوى عبر الزمن", "قياس نمو المكتبة"],
                        ]
                    ),
                    spacer(60),
                    p("خصائص المخططات:"),
                    b("تفاعلية: hover يعرض التفاصيل، click يفتح التقرير المفصل"),
                    b("متحركة: ظهور تدريجي للبيانات عند تحميل الصفحة"),
                    b("مستجيبة: تتكيف مع حجم الشاشة"),
                    b("ثيم داكن: ألوان متناسقة مع الثيم العام للمنصة"),
                    spacer(100),

                    h3("6.3.4 🇪 النشاطات الأخيرة (Recent Activity Timeline)"),
                    spacer(60),
                    p("عرض زمني (Timeline) لآخر 10 أحداث في النظام:"),
                    b("كل حدث: أيقونة + عنوان + وصف + وقت + مستخدم"),
                    b("ألوان حسب نوع الحدث (إضافة ✅ / حذف ❌ / تعديل ✏️ / تسجيل دخول 🔑)"),
                    b("زر 'عرض الكل' يفتح صفحة سجل العمليات"),
                    b("تحديث تلقائي كل 10 ثواني عبر Supabase Realtime"),
                    spacer(100),

                    h3("6.3.5 🇫 الاختصارات الذكية (Smart Shortcuts)"),
                    spacer(60),
                    p("تحسين الاختصارات الحالية بإضافة:"),
                    b("إحصائيات مصغرة أسفل كل اختصار (عدد الحسابات المعلقة، عدد طلبات الترقية، إلخ)"),
                    b("شارات (Badges) للأقسام التي تحتاج انتباه (طلبات معلقة، أخطاء)"),
                    b("تجميع الاختصارات في فئات: إدارة المستخدمين، النظام، المحتوى، الأمان"),
                    b("إضافة اختصارات جديدة (/admin/page-control, /admin/bot-control)"),
                    spacer(100),

                    h3("6.3.6 🇬 نظام Widgets القابل للتخصيص"),
                    spacer(60),
                    p("ميزة متقدمة تسمح للأدمن بتخصيص لوحة التحكم حسب احتياجاته:"),
                    b("سحب وإفلات (Drag & Drop) لترتيب البطاقات"),
                    b("إظهار/إخفاء البطاقات حسب الحاجة"),
                    b("حفظ التخصيص في الـ localStorage أو API"),
                    b("3 تخطيطات مختلفة: افتراضي / موسع / مضغوط"),
                    spacer(100),

                    h3("6.3.7 🇭 التنبيهات الذكية (Smart Alerts)"),
                    spacer(60),
                    p("نظام تنبيهات مدمج في لوحة التحكم:"),
                    b("بطاقة تحذيرية إذا كان هناك مشاكل في النظام (ارتفاع الأخطاء، هجمات أمنية)"),
                    b("إشعارات فورية عند تسجيل مستخدمين جدد أو طلبات ترقية"),
                    b("عداد للطلبات المعلقة (Pending) في شريط الحالة العلوي"),
                ],
            },

            // ========== PART 7: IMPLEMENTATION PLAN ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء السابع: خطة التنفيذ"),
                    spacer(200),

                    h2("7.1 مراحل التنفيذ"),
                    spacer(100),

                    makeTable(
                        ["المرحلة", "المدة", "المهام", "التأثير"],
                        [
                            ["1. الأساسيات", "يومان", "إصلاح رابط /admin/upgrade، تحسين الـ Error Handling، إضافة Auto-refresh", "إصلاح 404 + تحسين المتانة"],
                            ["2. البطاقات الجديدة", "3 أيام", "إعادة تصميم بطاقات KPI مع عدادات متحركة + Sparkline Charts", "تحسين UX بشكل كبير"],
                            ["3. المخططات", "3 أيام", "إضافة 4 مخططات تفاعلية (Recharts) مع بيانات حية", "تحليل بصري متقدم"],
                            ["4. شريط الحالة", "يومان", "إضافة Status Bar مع معلومات حية عن النظام", "مراقبة فورية"],
                            ["5. النشاطات + التنبيهات", "يومان", "Timeline النشاطات الأخيرة + نظام التنبيهات الذكية", "وعي بالموقف"],
                            ["6. الاختصارات الذكية", "يوم واحد", "تطوير الاختصارات مع إحصائيات + Badges", "وصول أسرع"],
                            ["7. التجاوب + التحسين", "يومان", "تحسين التوافقية مع الجوال + تحسين الأداء", "تجربة موحدة"],
                            ["8. الاختبار + النشر", "يوم واحد", "اختبار شامل، مراجعة أمنية، نشر", "استقرار"],
                        ]
                    ),
                    spacer(100),
                    b("المدة التقديرية الإجمالية: 16 يوم عمل"),
                    spacer(200),

                    h2("7.2 التقنيات المقترحة"),
                    spacer(100),

                    makeTable(
                        ["التقنية", "الاستخدام", "الموجود حالياً"],
                        [
                            ["Recharts", "المخططات البيانية التفاعلية", "غير مستخدم (لكنه موجود في package.json)"],
                            ["Framer Motion", "الرسوم المتحركة للعدادات والبطاقات", "مستخدم حالياً"],
                            ["Supabase Realtime", "التحديثات الحية والتواجد", "مستخدم في أجزاء أخرى"],
                            ["Zustand", "إدارة حالة واجهة الأدمن", "مستخدم حالياً"],
                            ["next/dynamic", "Lazy loading للمكونات الثقيلة", "غير مستخدم في الداشبورد"],
                            ["React.memo + useMemo", "تحسين الأداء ومنع إعادة التصيير", "غير مستخدم في الداشبورد"],
                            ["CSS Modules / Tailwind", "تنسيق منظم بدلاً من inline styles", "Inline styles فقط"],
                            ["next-pwa", "دعم PWA للتحميل السريع", "مستخدم في المشروع"],
                        ]
                    ),
                    spacer(200),

                    h2("7.3 هيكل الملفات الجديد المقترح"),
                    spacer(100),
                    code("src/app/admin/page.tsx                       # لوحة التحكم الرئيسية (مختصرة ~200 سطر)"),
                    code("src/components/admin/AdminStatusBar.tsx       # شريط الحالة العلوي"),
                    code("src/components/admin/KpiCard.tsx              # بطاقة KPI قابلة لإعادة الاستخدام"),
                    code("src/components/admin/KpiGrid.tsx              # شبكة بطاقات KPI"),
                    code("src/components/admin/AnimatedCounter.tsx      # عداد متحرك (موجود في Landing)"),
                    code("src/components/admin/ChartsSection.tsx        # قسم المخططات البيانية"),
                    code("src/components/admin/RecentActivity.tsx       # النشاطات الأخيرة"),
                    code("src/components/admin/SmartAlerts.tsx          # التنبيهات الذكية"),
                    code("src/components/admin/SmartShortcuts.tsx       # الاختصارات الذكية"),
                    code("src/components/admin/WidgetGrid.tsx           # نظام Widgets القابل للتخصيص"),
                    code("src/hooks/useAdminStats.ts                    # Hook لجلب إحصائيات الأدمن"),
                    code("src/services/academic/AdminDashboardService.ts # خدمة الخلفية للداشبورد"),
                    spacer(100),
                    p("هذا التقسيم يقلل حجم ملف الصفحة الرئيسية من 544 سطراً إلى ~200 سطر، ويسهل الصيانة والتطوير المستقبلي."),
                    spacer(200),

                    h2("7.4 الميزانية التقديرية"),
                    spacer(100),
                    makeTable(
                        ["العنصر", "الوقت", "التكلفة التقديرية"],
                        [
                            ["تحليل وتخطيط", "يوم واحد", "مجاني (موجود)"],
                            ["تطوير المرحلة 1-2", "5 أيام", "2,500 - 4,000 ر.ي"],
                            ["تطوير المرحلة 3-4", "5 أيام", "2,500 - 4,000 ر.ي"],
                            ["تطوير المرحلة 5-6", "3 أيام", "1,500 - 2,500 ر.ي"],
                            ["تطوير المرحلة 7-8", "3 أيام", "1,500 - 2,500 ر.ي"],
                            ["الاختبار والنشر", "يوم واحد", "500 - 1,000 ر.ي"],
                            ["المجموع الكلي", "16 يوم عمل", "8,500 - 14,000 ر.ي"],
                        ]
                    ),
                    spacer(200),

                    h2("7.5 المخاطر والتخفيف"),
                    spacer(100),
                    makeTable(
                        ["الخطر", "الاحتمال", "التأثير", "خطة التخفيف"],
                        [
                            ["كسر الوظائف الحالية أثناء التطوير", "منخفض", "عالي", "التطوير في مكونات منفصلة + اختبارات"],
                            ["تأخر في التوصيل", "متوسط", "متوسط", "مراحل مستقلة — كل مرحلة تعمل وحدها"],
                            ["مشاكل في أداء المخططات", "منخفض", "متوسط", "Lazy loading + استخدام Recharts المحسّن"],
                            ["عدم توافق مع المتصفحات القديمة", "منخفض", "منخفض", "اختبار على 3 متصفحات على الأقل"],
                            ["تغيير في متطلبات API", "متوسط", "عالي", "واجهة Service Layer تفصل UI عن API"],
                        ]
                    ),
                    spacer(200),

                    h2("7.6 كيف ستبدو لوحة التحكم بعد التطوير"),
                    spacer(100),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 60 },
                        children: [
                            new TextRun({ text: "التجربة البصرية الجديدة:", bold: true, size: 22, color: C.accent, font: "Traditional Arabic" }),
                        ]
                    }),
                    spacer(40),
                    b("شريط علوي أنيق (Status Bar) يعرض حالة المنصة في الوقت الفعلي — مثل لوحات تحكم Google Cloud و Vercel"),
                    b("9 بطاقات KPI مصممة بتصميم Glassmorphism الفاخر مع أيقونات SVG مخصصة وعدادات متحركة"),
                    b("4 مخططات بيانية تفاعلية تظهر في منتصف الصفحة — تعطي صورة كاملة عن صحة المنصة"),
                    b("جدول زمني (Timeline) للنشاطات الأخيرة في الجانب الأيمن — مثل لوحة تحكم GitHub"),
                    b("أزرار اختصارات ذكية مع إحصائيات حية وشارات (Badges) للتنبيهات المهمة"),
                    b("نظام تنبيهات ذكي يظهر بطاقات تحذيرية ملونة عند وجود مشكلة"),
                    spacer(60),
                    p("بدلاً من التمرير الطويل الحالي (scrolling)، سيتم تنظيم المحتوى في:"),
                    b("الصف العلوي: 3 بطاقات رئيسية (المستخدمين، النشطاء، المعلقون)"),
                    b("الصف الأوسط: 6 بطاقات ثانوية في شبكة 3×2"),
                    b("القسم السفلي الأيمن: مخططين بيانيين"),
                    b("القسم السفلي الأيسر: النشاطات الأخيرة"),

                    spacer(400),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "— نهاية التقرير —", bold: true, size: 22, color: C.primary, font: "Traditional Arabic" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "سحابة الأمن السيبراني © 2026", size: 18, color: C.muted })] }),
                ],
            },
        ],
    });
}

async function main() {
    console.log("جاري إنشاء تقرير التحليل الشامل...");
    const buffer = await Packer.toBuffer(doc());
    fs.writeFileSync(OUT, buffer);
    console.log(`✅ ${OUT}`);
}
main().catch(console.error);
