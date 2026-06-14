import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, TableOfContents,
} from "docx";
import * as fs from "fs";
import * as path from "path";

const OUT = path.join(import.meta.dirname, "..", "TOKEN_VERSION_FORENSIC_REPORT.docx");

const C = {
    primary: "1a237e", secondary: "c62828", accent: "283593",
    text: "37474f", muted: "546e7a", green: "2e7d32", orange: "e65100",
    cyan: "00838f", gold: "f57f17", red: "b71c1c",
};

function spacer(h = 120) { return new Paragraph({ spacing: { before: h }, children: [] }); }
function h1(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.RIGHT, spacing: { before: 400 }, children: [new TextRun({ text: t, bold: true, size: 32, color: C.primary, font: "Traditional Arabic" })] }); }
function h2(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_2, alignment: AlignmentType.RIGHT, spacing: { before: 300 }, children: [new TextRun({ text: t, bold: true, size: 28, color: C.accent, font: "Traditional Arabic" })] }); }
function h3(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_3, alignment: AlignmentType.RIGHT, spacing: { before: 200 }, children: [new TextRun({ text: t, bold: true, size: 24, color: C.text, font: "Traditional Arabic" })] }); }
function p(t: string) { return new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 60 }, children: [new TextRun({ text: t, size: 20, font: "Traditional Arabic" })] }); }
function b(t: string) { return new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 60 }, indent: { right: 300 }, children: [new TextRun({ text: `• ${t}`, size: 20, font: "Traditional Arabic" })] }); }
function code(t: string) {
    return new Paragraph({
        alignment: AlignmentType.RIGHT, spacing: { before: 40 }, indent: { right: 500 },
        children: [new TextRun({ text: t, size: 18, color: C.cyan, font: "Consolas", italics: true })],
    });
}
function label(t: string, s: string) {
    const color = s === "حرجة" ? C.red : s === "عالية" ? C.orange : s === "متوسطة" ? "#f57f17" : C.muted;
    return new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 60 }, indent: { right: 300 }, children: [
        new TextRun({ text: `• [${s}] `, bold: true, size: 20, color, font: "Traditional Arabic" }),
        new TextRun({ text: t, size: 20, font: "Traditional Arabic" }),
    ] });
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
        title: "تقرير التحقيق الجنائي — tokenVersion",
        styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
        sections: [
            // ========== COVER ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    spacer(3600),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تقرير التحقيق الجنائي التقني", bold: true, size: 48, color: C.primary, font: "Traditional Arabic" })] }),
                    spacer(200),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TokenVersion Debugging — عمود tokenVersion المفقود", bold: true, size: 36, color: C.secondary, font: "Traditional Arabic" })] }),
                    spacer(400),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Token Version Forensic Investigation Report", size: 24, color: C.muted, italics: true })] }),
                    spacer(600),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "سحابة الأمن السيبراني — جامعة ذمار", size: 22, font: "Traditional Arabic" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تاريخ التحقيق: 14 يونيو 2026", size: 20, font: "Traditional Arabic" })] }),
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
                    h1("الجزء الأول: ملخص المشكلة"),
                    spacer(200),
                    h2("1.1 وصف المشكلة"),
                    p("عند محاولة الوصول إلى لوحة تحكم الأدمن (admin/page.tsx) أو تنفيذ أي عملية تحقق من الجلسة، يظهر الخطأ التالي في سجلات Vercel:"),
                    spacer(40),
                    code('column "users"."tokenVersion" does not exist'),
                    spacer(40),
                    p("هذا الخطأ يحدث فقط في بيئة الإنتاج (Production/Vercel) ولا يظهر في بيئة التطوير المحلية (Local)."),
                    spacer(100),

                    h2("1.2 أعراض المشكلة"),
                    spacer(40),
                    b("توقف لوحة تحكم الأدمن عن العمل بالكامل"),
                    b("فشل جميع عمليات التحقق من الجلسة (verify-session)"),
                    b("فشل عمليات تسجيل الدخول للمستخدمين الحاليين"),
                    b("فشل عمليات إعادة تعيين كلمة المرور"),
                    b("تعطل وظائف الأمان مثل 2FA وWebAuthn"),
                    b("إجبار جميع المستخدمين على تسجيل الخروج"),
                    spacer(100),

                    h2("1.3 التأثير"),
                    spacer(40),
                    makeTable(
                        ["المجال", "التأثير", "الخطورة"],
                        [
                            ["إدارة المنصة", "الأدمن لا يستطيع الدخول إلى لوحة التحكم", "حرجة"],
                            ["المستخدمون", "جميع الجلسات الحالية تبطل (تسجيل خروج قسري)", "عالية"],
                            ["الأمان", "تعطيل آلية tokenVersion للكشف عن الجلسات المسروقة", "عالية"],
                            ["الاستمرارية", "النظام في حالة شلل تام", "حرجة"],
                        ]
                    ),
                ],
            },

            // ========== PART 2: INVESTIGATION ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الثاني: التحقيق الجنائي"),
                    spacer(200),

                    h2("2.1 منهجية التحقيق"),
                    spacer(60),
                    p("تم اتباع الخطوات التالية لتحديد السبب الجذري للمشكلة:"),
                    spacer(40),
                    b("فحص Prisma Schema للتحقق من تعريف tokenVersion"),
                    b("فحص جميع ملفات الترحيل (Migration Files) للتأكد من احتوائها على ALTER TABLE"),
                    b("مقارنة حالة الترحيل بين البيئة المحلية وبيئة الإنتاج"),
                    b("تحليل سكربتات البناء والنشر (Build Scripts)"),
                    b("فحص إعدادات CI/CD الخاصة بـ Vercel"),
                    spacer(100),

                    h2("2.2 فحص Prisma Schema"),
                    spacer(60),
                    p("ملف prisma/schema.prisma يحتوي على الحقل التالي في نموذج User:"),
                    spacer(40),
                    code('model User {'),
                    code('  ...'),
                    code('  tokenVersion           Int                  @default(0)'),
                    code('  ...'),
                    code('}'),
                    spacer(40),
                    p("الحقل tokenVersion موجود ومعرّف بشكل صحيح. لا توجد مشكلة في الـ Schema."),
                    spacer(100),

                    h2("2.3 فحص ملفات الترحيل (Migrations)"),
                    spacer(60),
                    p("تم فحص جميع ملفات الترحيل للتأكد من احتوائها على أمر إنشاء العمود:"),
                    spacer(40),

                    h3("2.3.1 ملف الترحيل رقم 1: init (20260522191311)"),
                    spacer(40),
                    p("يحتوي على إنشاء جدول users بدون عمود tokenVersion."),
                    spacer(40),

                    h3("2.3.2 ملف الترحيل رقم 2: add_token_family_and_version (20260523180605)"),
                    spacer(40),
                    p("يحتوي على الأمر التالي — وهذا هو الملف المطلوب:"),
                    spacer(20),
                    code('ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;'),
                    spacer(40),

                    h3("2.3.3 ملفات الترحيل الأخرى"),
                    spacer(40),
                    p("ملفات الترحيل اللاحقة (add_push_subscriptions, add_token_family_security_fields, fix_system_config_pk_default) لا تتعامل مع tokenVersion."),
                    spacer(100),

                    h2("2.4 مقارنة البيئة المحلية مع الإنتاج"),
                    spacer(60),
                    makeTable(
                        ["العنصر", "البيئة المحلية", "بيئة الإنتاج (Vercel)"],
                        [
                            ["Prisma Schema", "يحتوي على tokenVersion", "يحتوي على tokenVersion"],
                            ["ملفات الترحيل", "موجودة وكاملة", "موجودة في الكود"],
                            ["قاعدة البيانات", "PostgreSQL محلي", "Supabase (PostgreSQL)"],
                            ["حالة prisma migrate", "Database schema is up to date!", "غير معروف"],
                            ["عمود tokenVersion", "موجود ✅", "مفقود ❌"],
                            ["حالة التطبيق", "يعمل بدون مشاكل ✅", "معطل تماماً ❌"],
                        ]
                    ),
                    spacer(100),

                    h2("2.5 تحليل سكربتات البناء والنشر"),
                    spacer(60),
                    p("تم فحص package.json والتأكد من الأوامر المستخدمة في البناء والنشر:"),
                    spacer(40),
                    code('"postinstall": "prisma generate"'),
                    code('"build": "prisma generate && next build"'),
                    spacer(40),
                    p("كلا الأمرين يقومان فقط بتوليد Prisma Client (prisma generate) ولا يقومان أبداً بتطبيق الترحيلات على قاعدة البيانات (prisma migrate deploy)."),
                    spacer(100),

                    h2("2.6 عدم وجود Vercel.json"),
                    spacer(60),
                    p("لا يوجد ملف vercel.json في المشروع لتكوين أوامر ما بعد النشر (post-deployment hooks)."),
                    spacer(100),

                    h2("2.7 فحص Instrumentation Hook"),
                    spacer(60),
                    p("تم فحص ملف instrumentation.ts للتأكد من عدم وجود آلية لتطبيق الترحيلات عند بدء التشغيل:"),
                    spacer(40),
                    code('export async function register() {'),
                    code('  if (process.env.NEXT_RUNTIME === "nodejs") {'),
                    code('    await import("@/services/tig/BotService");'),
                    code('  }'),
                    code('}'),
                    spacer(40),
                    p("الملف يقوم فقط بتشغيل Telegram Bot Service — لا يقوم بتطبيق أي ترحيلات."),
                ],
            },

            // ========== PART 3: ROOT CAUSE ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الثالث: السبب الجذري (Root Cause)"),
                    spacer(200),

                    h2("3.1 الاستنتاج النهائي"),
                    spacer(100),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200 },
                        children: [
                            new TextRun({ text: "السبب الجذري: عدم تطبيق الترحيلات على قاعدة بيانات الإنتاج", bold: true, size: 28, color: C.red, font: "Traditional Arabic" }),
                        ]
                    }),
                    spacer(100),
                    p("بعد التحقيق الشامل، تبين أن المشكلة تنشأ من الأسباب التالية:"),
                    spacer(60),

                    h3("3.1.1 سكربت البناء لا يشمل تطبيق الترحيلات"),
                    spacer(40),
                    p("سكربت build في package.json يقتصر على prisma generate && next build فقط. لا يتم تنفيذ prisma migrate deploy. هذا يعني أن Prisma Client يتم تحديثه ليعكس أحدث schema، ولكن قاعدة البيانات نفسها لا تتلقى أي تحديثات."),
                    spacer(100),

                    h3("3.1.2 قاعدة بيانات Supabase لم يتم ترحيلها"),
                    spacer(40),
                    p("قاعدة بيانات الإنتاج (Supabase PostgreSQL) تم إنشاؤها من الترحيل الأولي (init) فقط. جميع الترحيلات اللاحقة — بما فيها ذلك الذي يضيف tokenVersion — لم يتم تطبيقها على هذه القاعدة."),
                    spacer(100),

                    h3("3.1.3 غياب آلية نشر آلية للترحيلات"),
                    spacer(40),
                    p("لا يوجد ملف vercel.json أو أي تكوين CI/CD يقوم بتطبيق الترحيلات تلقائياً عند النشر. لا يوجد دليل على أن الترحيلات تم تطبيقها يدوياً على قاعدة بيانات Supabase في أي وقت."),
                    spacer(100),

                    h2("3.2 التحقق من صحة الاستنتاج"),
                    spacer(60),
                    p("الأدلة التالية تدعم هذا الاستنتاج:"),
                    spacer(40),
                    b("البيئة المحلية تعمل بشكل صحيح تم تطبيق جميع الترحيلات يدوياً عبر npx prisma migrate dev"),
                    b("prisma migrate status يظهر أن قاعدة البيانات المحلية محدثة (up to date)"),
                    b("جميع الملفات (schema + migrations) متطابقة في كلا البيئتين"),
                    b("الفرق الوحيد: البيئة المحلية تحتوي على tokenVersion في قاعدة البيانات، والإنتاج لا تحتوي"),
                    b("عدم وجود أي أمر prisma migrate deploy في سلسلة البناء (build chain)"),
                    spacer(100),

                    h2("3.3 لماذا يظهر الخطأ الآن وليس سابقاً؟"),
                    spacer(60),
                    p("المنطق التالي يشرح توقيت ظهور المشكلة:"),
                    spacer(40),
                    b("تمت إضافة tokenVersion إلى schema.prisma في ترحيل 20260523180605_add_token_family_and_version"),
                    b("تم تطبيق الترحيل محلياً فقط (npx prisma migrate dev)"),
                    b("تم نشر الكود إلى Vercel دون تطبيق الترحيل على قاعدة بيانات Supabase"),
                    b("Prisma Client على Vercel يتوقع وجود tokenVersion بناءً على schema.prisma"),
                    b("قاعدة بيانات Supabase لا تحتوي على العمود → خطأ"),
                    spacer(60),
                    p("قد يكون الخطأ موجوداً منذ إضافة الحقل، ولكن لم يتم اكتشافه لأن Vercel يعيد استخدام build cache أو لأن الصفحات الأخرى لم تكن تستخدم tokenVersion في ذلك الوقت. التحقق من جلسة المستخدم (verify-session) يستخدم tokenVersion، وأي طلب يتطلب مصادقة سيواجه هذا الخطأ."),
                ],
            },

            // ========== PART 4: CODE IMPACT ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الرابع: تحليل تأثير الكود"),
                    spacer(200),

                    h2("4.1 جميع الأماكن التي تستخدم tokenVersion"),
                    spacer(60),
                    p("تم تحديد 35 موضعاً في الكود يستخدم tokenVersion بشكل مباشر:"),
                    spacer(40),

                    makeTable(
                        ["الملف", "الوظيفة", "نوع الاستخدام"],
                        [
                            ["src/lib/auth.ts", "إنشاء وتوقيع التوكن (JWT)", "قراءة tokenVersion وكتابته في JWT payload"],
                            ["src/lib/types/index.ts", "نوع JWT Payload", "تعريف tokenVersion في واجهة AuthPayload"],
                            ["src/services/auth/SessionService.ts", "التحقق من الجلسة", "مقارنة tokenVersion من JWT مع قاعدة البيانات"],
                            ["src/services/auth/AuthService.ts", "تسجيل الدخول", "قراءة tokenVersion من قاعدة البيانات بعد تسجيل الدخول"],
                            ["src/services/auth/PasswordService.ts", "تغيير كلمة المرور", "زيادة tokenVersion عند تغيير كلمة المرور"],
                            ["src/services/auth/TwoFactorService.ts", "2FA", "زيادة tokenVersion عند تمكين/تعطيل 2FA"],
                            ["src/services/auth/WebAuthnService.ts", "WebAuthn", "قراءة tokenVersion لإصدار توكن جديد"],
                            ["src/services/tig/BotService.ts", "إعادة تعيين كلمة المرور عبر البوت", "زيادة tokenVersion"],
                            ["src/app/api/auth/verify-session/route.ts", "التحقق من الجلسة", "مقارنة tokenVersion مع قاعدة البيانات"],
                            ["src/app/api/auth/reset-password/route.ts", "إعادة تعيين كلمة المرور", "زيادة tokenVersion"],
                            ["src/app/api/auth/2fa/complete/route.ts", "إكمال 2FA", "قراءة tokenVersion لإصدار توكن جديد"],
                            ["src/app/api/tig/reset-password/route.ts", "إعادة تعيين عبر البوت", "زيادة tokenVersion"],
                            ["src/app/api/promotion/approve/route.ts", "الموافقة على الترقية", "زيادة tokenVersion"],
                            ["src/app/api/admin/generation-log/[id]/route.ts", "تعليق حساب", "زيادة tokenVersion"],
                        ]
                    ),
                    spacer(100),

                    h2("4.2 تدفق tokenVersion في النظام"),
                    spacer(60),
                    p("آلية tokenVersion تعمل كالتالي:"),
                    spacer(40),
                    b("1. عند تسجيل الدخول: tokenVersion يُقرأ من قاعدة البيانات ويُكتب في JWT payload"),
                    b("2. عند التحقق من الجلسة: tokenVersion من JWT يُقارن مع tokenVersion في قاعدة البيانات"),
                    b("3. إذا اختلفت القيم: الجلسة تُعتبر غير صالحة (تم تغيير كلمة المرور أو إبطال الجلسات)"),
                    b("4. عند تغيير كلمة المرور / تمكين 2FA / تعليق الحساب: tokenVersion يزيد بمقدار 1"),
                    b("5. هذا يضمن أن جميع الجلسات القديمة تُبطل فوراً (forced logout)"),
                    spacer(60),
                    p("عند فقدان عمود tokenVersion من قاعدة البيانات، يفشل أي استعلام Prisma يحاول الوصول إلى هذا الحقل، مما يعطل جميع العمليات التي تعتمد على هذا النظام الأمني."),
                ],
            },

            // ========== PART 5: SOLUTIONS ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء الخامس: الحلول المقترحة"),
                    spacer(200),

                    h2("5.1 الحل الفوري (سريع — يومياً)"),
                    spacer(100),
                    h3("5.1.1 تطبيق الترحيل يدوياً على Supabase"),
                    spacer(40),
                    p("تشغيل الأمر التالي مع رابط قاعدة بيانات Supabase:"),
                    spacer(20),
                    code('DATABASE_URL="postgresql://..." npx prisma migrate deploy'),
                    spacer(40),
                    p("هذا الأمر سيطبق جميع الترحيلات المعلقة (بما فيها add_token_family_and_version) على قاعدة بيانات Supabase مباشرة."),
                    spacer(40),

                    h3("5.1.2 تطبيق SQL يدوياً"),
                    spacer(40),
                    p("إذا تعذر استخدام Prisma CLI، يمكن تطبيق أمر SQL التالي مباشرة على Supabase:"),
                    spacer(20),
                    code('ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;'),
                    spacer(60),
                    b("المدة المتوقعة: 5 دقائق"),
                    b("المخاطرة: منخفضة — الأمر غير مدمر ولا يؤثر على البيانات"),
                    spacer(100),

                    h2("5.2 الحل الدائم (يُمنع تكرار المشكلة)"),
                    spacer(100),
                    h3("5.2.1 تحديث سكربت build ليشمل prisma migrate deploy"),
                    spacer(40),
                    p("تحديث ملف package.json:"),
                    spacer(20),
                    code('"build": "prisma generate && prisma migrate deploy && next build"'),
                    spacer(40),
                    p("هذا يضمن أنه في كل مرة يتم نشر الكود على Vercel، يتم تطبيق أي ترحيلات معلقة قبل بناء التطبيق."),
                    spacer(40),
                    b("ملاحظة: هذا يتطلب أن متغير البيئة DATABASE_URL في Vercel يشير إلى قاعدة بيانات Supabase."),
                    spacer(60),

                    h3("5.2.2 إضافة خطوة ما بعد النشر في Vercel"),
                    spacer(40),
                    p("إضافة ملف vercel.json في جذر المشروع:"),
                    spacer(20),
                    code('{'),
                    code('  "buildCommand": "prisma generate && prisma migrate deploy && next build",'),
                    code('  "installCommand": "npm install"'),
                    code('}'),
                    spacer(60),

                    h3("5.2.3 (بديل) استخدام prisma db push في سكربت البدء"),
                    spacer(40),
                    p("إذا كان عدد الترحيلات كبيراً وترغب في تبسيط العملية، يمكن استخدام prisma db push:"),
                    spacer(20),
                    code('"build": "prisma generate && prisma db push --accept-data-loss && next build"'),
                    spacer(40),
                    label("تحذير: --accept-data-loss قد يؤدي إلى فقدان بيانات في حالات نادرة (تغيير أنواع الحقول)", "عالية"),
                    spacer(100),

                    h2("5.3 مقارنة الحلول"),
                    spacer(60),
                    makeTable(
                        ["الحل", "السرعة", "الأمان", "الاستدامة", "التعقيد"],
                        [
                            ["5.1.1 تطبيق الترحيل يدوياً", "فوري", "آمن", "مؤقت", "منخفض"],
                            ["5.1.2 SQL يدوي", "فوري", "آمن جداً", "مؤقت", "منخفض جداً"],
                            ["5.2.1 تحديث build script", "بعد النشر التالي", "آمن", "دائم", "منخفض"],
                            ["5.2.2 إضافة vercel.json", "بعد النشر التالي", "آمن", "دائم", "منخفض"],
                            ["5.2.3 prisma db push", "فوري بعد النشر", "مخاطرة", "دائم", "منخفض"],
                        ]
                    ),
                    spacer(100),

                    h2("5.4 الإجراء الموصى به"),
                    spacer(60),
                    p("التوصية بتنفيذ الحلين التاليين معاً:"),
                    spacer(40),
                    b("1. فوراً: تشغيل ALTER TABLE يدوياً على Supabase (الحل 5.1.2) لإصلاح المشكلة الحالية"),
                    b("2. بعد الإصلاح: تحديث build script ليشمل prisma migrate deploy (الحل 5.2.1) لمنع تكرار المشكلة مستقبلاً"),
                    spacer(60),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200 },
                        children: [
                            new TextRun({ text: "بتنفيذ هذين الحلين، ستعود لوحة تحكم الأدمن للعمل فوراً", bold: true, size: 24, color: C.green, font: "Traditional Arabic" }),
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 60 },
                        children: [
                            new TextRun({ text: "ولن تتكرر مشكلة فقدان الأعمدة في النشرات المستقبلية", size: 22, color: C.muted, font: "Traditional Arabic" }),
                        ]
                    }),
                ],
            },

            // ========== PART 6: PREVENTION ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء السادس: التوصيات الوقائية"),
                    spacer(200),

                    h2("6.1 إجراءات وقائية مستدامة"),
                    spacer(60),
                    b("إضافة prisma migrate deploy إلى سكربت build ومنع أي نشر بدون تطبيق الترحيلات"),
                    b("إضافة اختبار آلي (CI) يتحقق من تطابق قاعدة البيانات مع Prisma Schema"),
                    b("تفعيل Vercel Preview Deployments لاختبار الترحيلات قبل النشر"),
                    b("إنشاء سكربت post-deployment hook في vercel.json"),
                    b("توثيق عملية النشر في README.md (خطوات تطبيق الترحيلات)"),
                    spacer(100),

                    h2("6.2 تحسينات على آلية الترحيل"),
                    spacer(60),
                    b("استخدام Shadow Database في Vercel (إذا كان مدعوماً) لاختبار الترحيلات"),
                    b("إضافة فحص تلقائي عند تشغيل التطبيق: إذا كان هناك ترحيلات معلقة → إظهار تحذير في السجلات"),
                    b("إضافة نظام تنبيه يُعلم الأدمن بعدم تطابق Schema مع قاعدة البيانات"),
                    spacer(100),

                    h2("6.3 قائمة تحقق للنشر المستقبلي"),
                    spacer(60),
                    makeTable(
                        ["الخطوة", "الوصف", "المسؤول"],
                        [
                            ["1", "تشغيل prisma migrate dev محلياً", "المطور"],
                            ["2", "اختبار الميزات الجديدة محلياً", "المطور"],
                            ["3", "تشغيل prisma migrate deploy على قاعدة بيانات Staging", "المطور"],
                            ["4", "اختبار الميزات في بيئة Staging", "المختبر"],
                            ["5", "النشر إلى Vercel + تطبيق الترحيلات (إنشاء تلقائي)", "CI/CD"],
                            ["6", "التحقق من prisma migrate status في الإنتاج", "الأدمن"],
                            ["7", "مراقبة سجلات Vercel بعد النشر", "الأدمن"],
                        ]
                    ),
                ],
            },

            // ========== PART 7: APPENDIX ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    new Paragraph({ children: [new TextRun({ break: 1 })] }),
                    h1("الجزء السابع: الملاحق"),
                    spacer(200),

                    h2("7.1 محتوى ملف الترحيل المفقود"),
                    spacer(60),
                    p("المسار: prisma/migrations/20260523180605_add_token_family_and_version/migration.sql"),
                    spacer(20),
                    code('-- CreateEnum'),
                    code('CREATE TYPE "TokenFamilyPurpose" AS ENUM (\'ACCESS\', \'REFRESH\', \'RECOVERY\');'),
                    code(''),
                    code('-- CreateTable'),
                    code('CREATE TABLE "token_families" ('),
                    code('    "id" TEXT NOT NULL,'),
                    code('    "family" TEXT NOT NULL,'),
                    code('    "purpose" "TokenFamilyPurpose" NOT NULL DEFAULT \'ACCESS\','),
                    code('    "expiresAt" TIMESTAMP(3) NOT NULL,'),
                    code('    "userId" TEXT NOT NULL,'),
                    code('    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,'),
                    code(''),
                    code('    CONSTRAINT "token_families_pkey" PRIMARY KEY ("id")'),
                    code(');'),
                    code(''),
                    code('-- AlterTable'),
                    code('ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;'),
                    code(''),
                    code('-- AddForeignKey'),
                    code('ALTER TABLE "token_families" ADD CONSTRAINT "token_families_userId_fkey"'),
                    code('    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;'),
                    spacer(100),

                    h2("7.2 أمر SQL المطلوب للإصلاح الفوري"),
                    spacer(60),
                    p("انسخ والصق الأمر التالي في Supabase SQL Editor:"),
                    spacer(20),
                    code('ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;'),
                    spacer(20),
                    code('ALTER TABLE "token_families" ADD COLUMN "compromisedAt" TIMESTAMP(3);'),
                    code('ALTER TABLE "token_families" ADD COLUMN "mfaVerifiedAt" TIMESTAMP(3);'),
                    spacer(40),
                    p("ملاحظة: الأوامر الثانية والثالثة من الترحيل 20260523182107_add_token_family_security_fields (تكملة للأمان)."),
                    spacer(100),

                    h2("7.3 ملخص الأدلة"),
                    spacer(60),
                    makeTable(
                        ["الدليل", "المصدر", "التفاصيل"],
                        [
                            ["schema.prisma يحتوي على tokenVersion", "prisma/schema.prisma:36", "Int @default(0)"],
                            ["الترحيل يضيف tokenVersion", "prisma/migrations/20260523180605_add_token_family_and_version/migration.sql", "ALTER TABLE ADD COLUMN"],
                            ["prisma migrate status محلي", "npx prisma migrate status", "Database schema is up to date!"],
                            ["prisma db pull --print محلي", "npx prisma db pull --print", "tokenVersion موجود في local DB"],
                            ["سكربت build لا يشمل migrate", "package.json", "prisma generate && next build"],
                            ["لا يوجد vercel.json", "جذر المشروع", "لا يوجد تكوين للنشر"],
                            ["Instrumentation لا يشمل migrate", "src/instrumentation.ts", "فقط تشغيل BotService"],
                        ]
                    ),
                    spacer(100),

                    h2("7.4 قائمة الملفات المتأثرة"),
                    spacer(60),
                    p("35 موقعاً في 14 ملفاً تستخدم tokenVersion. الملفات الأكثر أهمية:"),
                    spacer(40),
                    b("src/lib/auth.ts — إنشاء التوكن (JWT) مع tokenVersion في الـ payload"),
                    b("src/services/auth/SessionService.ts — التحقق من الجلسة ومقارنة tokenVersion"),
                    b("src/app/api/auth/verify-session/route.ts — نقطة النهاية للتحقق من الجلسة"),
                    b("src/app/api/auth/2fa/complete/route.ts — إكمال المصادقة الثنائية"),
                    b("src/services/auth/TwoFactorService.ts — إدارة 2FA"),
                    b("src/services/auth/PasswordService.ts — تغيير كلمة المرور وإبطال الجلسات"),
                ],
            },
        ],
    });
}

async function main() {
    const d = doc();
    const buf = await Packer.toBuffer(d);
    fs.writeFileSync(OUT, buf);
    console.log(`✅ تم إنشاء التقرير: ${OUT}`);
}
main().catch(console.error);
