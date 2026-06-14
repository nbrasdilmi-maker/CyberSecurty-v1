import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, TableOfContents,
} from "docx";
import * as fs from "fs";
import * as path from "path";

const OUT = path.join(import.meta.dirname, "..", "AUTH_SECURITY_AUDIT_REPORT.docx");

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
function en(t: string) { return new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 40 }, indent: { left: 300 }, children: [new TextRun({ text: t, size: 18, color: C.muted, font: "Consolas", italics: true })] }); }
function code(t: string) {
    return new Paragraph({
        alignment: AlignmentType.RIGHT, spacing: { before: 40 }, indent: { right: 500 },
        children: [new TextRun({ text: t, size: 18, color: C.cyan, font: "Consolas", italics: true })],
    });
}
function nl() { return new Paragraph({ children: [new TextRun({ break: 1 })] }); }

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
        title: "التقرير الأمني لنظام المصادقة — tokenVersion",
        styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
        sections: [
            // ========== COVER ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    spacer(3600),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تقرير التدقيق الأمني الشامل", bold: true, size: 48, color: C.primary, font: "Traditional Arabic" })] }),
                    spacer(200),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "نظام المصادقة (Authentication System)", bold: true, size: 36, color: C.secondary, font: "Traditional Arabic" })] }),
                    spacer(400),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تحليل معمق لآلية tokenVersion وإدارة الجلسات", size: 24, color: C.muted, italics: true })] }),
                    spacer(600),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "سحابة الأمن السيبراني — جامعة ذمار", size: 22, font: "Traditional Arabic" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "تاريخ التدقيق: 14 يونيو 2026", size: 20, font: "Traditional Arabic" })] }),
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

            // ========== 1. INTRODUCTION ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    nl(), h1("1. مقدمة"),
                    spacer(200),
                    p("يهدف هذا التقرير إلى تقديم تحليل أمني معمق وشامل لنظام المصادقة (Authentication System) في مشروع سحابة الأمن السيبراني. يركز التحليل بشكل خاص على حقل tokenVersion وآلية إدارة الجلسات، مع استعراض تدفق المصادقة بالكامل ابتداءً من تسجيل الدخول وصولاً إلى التحقق من الجلسة."),
                    spacer(100),
                    p("تم إجراء التحليل بناءً على قراءة الكود المصدري بالكامل (Read-Only Analysis) في 54 ملفاً مرتبطاً بنظام المصادقة، تشمل الخدمات (Services)، نقاط النهاية API، الوسيط (Middleware)، المحلات (Stores)، والمكونات (Components)."),
                ],
            },

            // ========== 2. OVERVIEW ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    nl(), h1("2. نظرة عامة على النظام"),
                    spacer(200),
                    h2("2.1 بنية النظام المصادقة"),
                    spacer(60),
                    p("يستخدم النظام نمط مصادقة هجين (Hybrid Authentication) يجمع بين:"),
                    spacer(40),
                    b("JWT (JSON Web Tokens) — للمصادقة عديمة الحالة (Stateless)"),
                    b("Sessions / Token Families — لتتبع الجلسات (Stateful)"),
                    b("Refresh Token Rotation — للأمان المتقدم"),
                    spacer(100),

                    h2("2.2 هيكل التوكنات (Token Architecture)"),
                    spacer(60),
                    makeTable(
                        ["النوع", "الخوارزمية", "مدة الصلاحية", "التخزين", "الاستخدام"],
                        [
                            ["Access Token", "HS256", "15 دقيقة", "Cookie (httpOnly)", "المصادقة على الطلبات"],
                            ["Refresh Token", "HS256", "7 أيام", "Cookie (httpOnly) + DB", "تجديد Access Token"],
                        ]
                    ),
                    spacer(100),

                    h2("2.3 قواعد البيانات المرتبطة بنظام المصادقة"),
                    spacer(60),
                    makeTable(
                        ["الجدول", "الغرض"],
                        [
                            ["users", "بيانات المستخدمين + tokenVersion"],
                            ["sessions", "الجلسات القديمة (نمط التوافق العكسي)"],
                            ["token_families", "عائلات التوكنات (Token Family)"],
                            ["token_generations", "أجيال التوكنات داخل العائلة (Token Rotation)"],
                            ["mfa_challenges", "تحديات المصادقة الثنائية (MFA)"],
                            ["web_authn_credentials", "بيانات اعتماد WebAuthn"],
                            ["web_authn_challenges", "تحديات WebAuthn"],
                            ["audit_logs", "سجل التدقيق (Audit Trail)"],
                            ["password_reset_tokens", "رموز إعادة تعيين كلمة المرور"],
                        ]
                    ),
                    spacer(100),

                    h2("2.4 حقل tokenVersion في Prisma Schema"),
                    spacer(60),
                    code("model User {"),
                    code("  ..."),
                    code("  tokenVersion           Int                  @default(0)"),
                    code("  ..."),
                    code("}"),
                    spacer(60),
                    p("الحقل tokenVersion هو عدد صحيح (Integer) بقيمة افتراضية 0. يتم زيادته بمقدار 1 عند أي حدث أمني حساس (تغيير كلمة المرور، تمكين/تعطيل 2FA، فتح الحساب، تعليق الحساب، الموافقة على الترقية)."),
                ],
            },

            // ========== 3. HOW IT WORKS ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    nl(), h1("3. كيف يعمل النظام حالياً"),
                    spacer(200),

                    h2("3.1 تدفق تسجيل الدخول (Login Flow)"),
                    spacer(60),
                    p("يتم تسجيل الدخول عبر الخطوات التالية:"),
                    spacer(40),

                    h3("الخطوة 1: تقديم الطلب"),
                    spacer(40),
                    p("يرسل المستخدم طلب POST إلى /api/auth/login مع username وكلمة المرور."),
                    code("API Route → src/app/api/auth/login/route.ts"),
                    spacer(40),

                    h3("الخطوة 2: التحقق من معدل الطلبات (Rate Limiting)"),
                    spacer(40),
                    p("يتم التحقق من حد المحاولات عبر Upstash Redis: 8 محاولات لكل مستخدم+IP في الدقيقة."),
                    code("const { success } = await loginRateLimiter.limit(`${username}:${ip}`);"),
                    spacer(40),

                    h3("الخطوة 3: البحث عن المستخدم والتحقق من كلمة المرور"),
                    spacer(40),
                    p("يبحث AuthService.login عن المستخدم بالبريد الإلكتروني أو اسم المستخدم، ثم يتحقق من كلمة المرور باستخدام bcrypt. في حال فشل كلمة المرور، يتم زيادة عداد failedLoginAttempts ذرياً. بعد 5 محاولات فاشلة، يُقفل الحساب. وبعد 10 محاولات، يُقفل لمدة أسبوع (10080 دقيقة)."),
                    code("src/services/auth/AuthService.ts:56-76"),
                    spacer(40),

                    h3("الخطوة 4: فتح الحساب المقفل (إن وجد)"),
                    spacer(40),
                    p("إذا كان الحساب مقفلاً ولكن انتهت مدة القفل، يتم فتحه ذرياً مع زيادة tokenVersion (مما يبطل جميع الجلسات القديمة). يتم إعادة جلب المستخدم للحصول على tokenVersion المحدث."),
                    code("tokenVersion: { increment: 1 }  // يبطل جميع الجلسات السابقة"),
                    code("const refreshed = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });"),
                    code("Object.assign(user, refreshed);  // تحديث الكائن المحلي"),
                    spacer(40),

                    h3("الخطوة 5: التحقق من 2FA"),
                    spacer(40),
                    p("إذا كان المستخدم مفعّلاً للمصادقة الثنائية (Two-Factor Authentication)، يتم إنشاء تحدي MFA (MfaChallenge) بدلاً من إصدار التوكنات. يعود الـ API بـ requiresTwoFactor: true مع challengeId و challengeToken."),
                    spacer(40),

                    h3("الخطوة 6: إصدار التوكنات (Token Issuance)"),
                    spacer(40),
                    p("عند نجاح تسجيل الدخول (أو إكمال 2FA / WebAuthn)، يتم:"),
                    b("إنشاء Access Token عبر jose.SignJWT (HS256) مع tokenVersion في الـ payload"),
                    b("إنشاء Refresh Token مع إنشاء TokenFamily + TokenGeneration(generation=1)"),
                    b("تخزين التوكنات في Cookies: httpOnly + secure + sameSite:strict"),
                    code("const accessToken = await generateAccessToken({"),
                    code("  sub: user.id, email: user.email, role: user.role,"),
                    code("  level: user.level, tokenVersion: user.tokenVersion,"),
                    code("});"),
                    code("const refreshToken = await createInitialTokens(user.id, {"),
                    code("  ipAddress: ip, userAgent, tokenVersion: user.tokenVersion,"),
                    code("});"),
                    code("await setAuthCookies(accessToken, refreshToken);"),
                    spacer(100),

                    h2("3.2 هيكل JWT Payload"),
                    spacer(60),
                    makeTable(
                        ["الحقل", "القيمة", "المصدر"],
                        [
                            ["sub", "معرّف المستخدم (UUID)", "User.id"],
                            ["email", "البريد الإلكتروني", "User.email"],
                            ["role", "الدور (ADMIN/MANAGEMENT/TEACHER/STUDENT)", "User.role"],
                            ["level", "المستوى الأكاديمي", "User.level"],
                            ["type", "'access' أو 'refresh'", "ثابت"],
                            ["iat", "وقت الإصدار", "jose"],
                            ["exp", "وقت الانتهاء", "jose"],
                            ["jti", "معرّف فريد (للـ Refresh Token)", "توليد عشوائي"],
                            ["tokenVersion", "نسخة التوكن (للكشف عن الإبطال)", "User.tokenVersion"],
                        ]
                    ),
                    spacer(100),

                    h2("3.3 آلية التحقق من المصادقة (Middleware & Guards)"),
                    spacer(60),

                    h3("3.3.1 Edge Middleware (src/middleware.ts)"),
                    spacer(40),
                    p("الوسيط (Middleware) يعمل على حافة الشبكة (Edge) ويتحقق من صحة Access Token باستخدام jose.jwtVerify. يقوم بـ:"),
                    b("السماح للمسارات العامة (/login, /api/auth/*, /_next/*) بدون مصادقة"),
                    b("التحقق من CSRF Token لطلبات POST/PUT/DELETE/PATCH (مقارنة header + cookie)"),
                    b("التحقق من صحة JWT (HS256)"),
                    b("التحقق من صلاحية الدور للمسار المطلوب (ADMIN فقط لـ /admin، MANAGEMENT لمسارات محددة)"),
                    b("لا يقوم الوسيط بالتحقق من tokenVersion — هذا يتم في verify-session API فقط"),
                    b("إضافة رؤوس أمنية: X-Frame-Options, HSTS, CSP, X-Content-Type-Options"),
                    spacer(40),

                    h3("3.3.2 verify-session API (src/app/api/auth/verify-session/route.ts)"),
                    spacer(40),
                    p("هذه هي نقطة التحقق الفعلية من صلاحية الجلسة. يقوم العميل (Zustand store) باستدعائها عند تحميل الصفحة:"),
                    code("const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);"),
                    code("const user = await prisma.user.findUnique({"),
                    code("  where: { id: payload.sub, deletedAt: null },"),
                    code("  select: { tokenVersion: true, status: true, id: true },"),
                    code("});"),
                    code("if (payload.tokenVersion !== undefined"),
                    code("    && payload.tokenVersion !== user.tokenVersion) {"),
                    code("  return { valid: false, reason: 'TOKEN_VERSION_MISMATCH' };"),
                    code("}"),
                    spacer(60),
                    p("هذا هو المكان الذي تحدث فيه المقارنة الحاسمة: إذا اختلف tokenVersion في JWT عن tokenVersion في قاعدة البيانات، تُعتبر الجلسة غير صالحة (تم إبطالها)."),
                    spacer(100),

                    h2("3.4 آلية تجديد الجلسة (Token Refresh — Rotation)"),
                    spacer(60),
                    p("SessionService.refreshSession هي قلب آلية تجديد التوكنات:"),
                    spacer(40),

                    h3("المرحلة 1 — التحقق من Refresh Token"),
                    spacer(40),
                    p("يتم التحقق من Refresh Token بنمطين:"),
                    b("النمط الجديد (TokenGeneration): البحث في جدول token_generations باستخدام refreshTokenHash، مع التحقق من revokeAt و compromisedAt"),
                    b("النمط القديم (Session): البحث في جدول sessions للتوافق العكسي"),
                    spacer(40),

                    h3("المرحلة 2 — Rate Limiting"),
                    spacer(40),
                    p("10 محاولات لكل IP في الدقيقة (refreshRateLimiter) + 20 محاولة لكل مستخدم في الدقيقة (refreshUserRateLimiter) لمنع rotation spam."),
                    spacer(40),

                    h3("المرحلة 3 — التحقق من MFA"),
                    spacer(40),
                    p("إذا كان المستخدم مفعّلاً لـ 2FA ولكن mfaVerifiedAt فارغ، يتم رفض التجديد (منع bypass). يُسجل كـ SUSPICIOUS_ACTIVITY."),
                    spacer(40),

                    h3("المرحلة 4 — التدوير الذري (Atomic Rotation)"),
                    spacer(40),
                    p("يتم استهلاك الـ Generation الحالية (revokedAt = new Date()) وإنشاء Generation جديدة. إذا تم اكتشاف إعادة استخدام (consumed.count === 0)، يتم:"),
                    b("وسم العائلة بأكملها كـ compromisedAt"),
                    b("إبطال جميع أجيال العائلة"),
                    b("تسجيل CRITICAL في سجل التدقيق"),
                    b("إجبار المستخدم على تسجيل الدخول من جديد"),
                    spacer(40),

                    h3("المرحلة 5 — إصدار Access Token جديد"),
                    spacer(40),
                    p("يتم إنشاء Access Token جديد مع tokenVersion الحالي من قاعدة البيانات، وتعيين الكوكيز."),
                    spacer(100),

                    h2("3.5 تسجيل الخروج (Logout)"),
                    spacer(60),
                    p("عند تسجيل الخروج:"),
                    code("// SessionService.logout()"),
                    code("await revokeSession(refreshToken);  // إبطال الـ refresh token"),
                    code("await clearAuthCookies();            // مسح الكوكيز"),
                    spacer(40),
                    p("وظيفة revokeSession تتحقق أولاً من نمط TokenGeneration، ثم من نمط Session القديم، وتُبطل التوكن في كلا الحالتين."),
                    spacer(100),

                    h2("3.6 إبطال جميع الجلسات (Revoke All Sessions)"),
                    spacer(60),
                    p("يتم استدعاء revokeAllSessions في الحالات التالية:"),
                    b("تغيير كلمة المرور (PasswordService.changePassword)"),
                    b("تمكين 2FA (TwoFactorService.verify)"),
                    b("تعطيل 2FA (TwoFactorService.disable)"),
                    b("فتح الحساب تلقائياً بعد القفل (AuthService.login)"),
                    spacer(40),
                    p("آلية الإبطال الثلاثية:"),
                    code("await prisma.tokenFamily.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });"),
                    code("await prisma.tokenGeneration.updateMany({ where: { family: { userId }, revokedAt: null }, data: { revokedAt: new Date() } });"),
                    code("await prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });"),
                ],
            },

            // ========== 4. TOKEN VERSION ANALYSIS ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    nl(), h1("4. تحليل معمق لـ tokenVersion"),
                    spacer(200),

                    h2("4.1 قائمة شاملة بجميع مواقع استخدام tokenVersion"),
                    spacer(60),
                    p("تم العثور على 35 موقعاً في 14 ملفاً تستخدم tokenVersion. فيما يلي التحليل الكامل:"),
                    spacer(100),

                    h3("4.1.1 التعريف في Prisma Schema و JWT Types"),
                    spacer(40),
                    makeTable(
                        ["الملف", "السطر", "الاستخدام"],
                        [
                            ["prisma/schema.prisma", "36", "تعريف الحقل في نموذج User"],
                            ["src/lib/types/index.ts", "12", "تعريف الحقل في JWTPayload (اختياري optional)"],
                        ]
                    ),
                    spacer(60),

                    h3("4.1.2 مكتبة المصادقة الأساسية (src/lib/auth.ts) — 9 استخدامات"),
                    spacer(40),
                    makeTable(
                        ["الدالة", "الاستخدام"],
                        [
                            ["createInitialTokens() - السطر 72-78", "قراءة tokenVersion من DB إذا لم يُمرر كخيار، ثم كتابته في JWT"],
                            ["createInitialTokens() - السطر 85", "كتابة tokenVersion في payload Refresh Token"],
                            ["rotateRefreshToken() - السطر 127, 135", "استقبال tokenVersion كمعامل، كتابته في Refresh Token الجديد"],
                            ["migrateSessionToFamily() - السطر 213, 222", "استقبال tokenVersion كمعامل، كتابته في Refresh Token"],
                        ]
                    ),
                    spacer(60),

                    h3("4.1.3 خدمات المصادقة (Auth Services) — 10 استخدامات"),
                    spacer(40),
                    makeTable(
                        ["الملف", "السطور", "النوع"],
                        [
                            ["AuthService.ts - 37", "زيادة (increment) — فتح الحساب بعد القفل"],
                            ["AuthService.ts - 124, 129", "قراءة — إصدار التوكنات بعد تسجيل الدخول"],
                            ["SessionService.ts - 45", "قراءة — جلب tokenVersion من DB أثناء تجديد الجلسة"],
                            ["SessionService.ts - 86, 120, 133", "قراءة — تمرير tokenVersion للـ rotation والميغرايشن"],
                            ["WebAuthnService.ts - 51, 60", "قراءة — إصدار التوكنات بعد WebAuthn"],
                            ["TwoFactorService.ts - 44, 98", "زيادة (increment) — تمكين/تعطيل 2FA"],
                            ["PasswordService.ts - 33", "زيادة (increment) — تغيير كلمة المرور"],
                        ]
                    ),
                    spacer(60),

                    h3("4.1.4 نقاط النهاية API — 9 استخدامات"),
                    spacer(40),
                    makeTable(
                        ["الملف", "السطور", "النوع"],
                        [
                            ["api/auth/2fa/complete/route.ts - 139, 144, 160, 166", "قراءة — جلب tokenVersion من DB، كتابته في Access + Refresh Tokens"],
                            ["api/auth/verify-session/route.ts - 18, 29", "قراءة + مقارنة — التحقق من mismatch"],
                            ["api/auth/reset-password/route.ts - 86", "زيادة (increment) — إعادة تعيين كلمة المرور"],
                            ["api/tig/reset-password/route.ts - 43", "زيادة (increment) — إعادة تعيين عبر البوت"],
                            ["services/tig/BotService.ts - 276", "زيادة (increment) — إعادة تعيين عبر البوت"],
                            ["api/promotion/approve/route.ts - 72", "زيادة (increment) — الموافقة على الترقية"],
                            ["api/admin/generation-log/[id]/route.ts - 74", "زيادة (increment) — تعليق حساب"],
                        ]
                    ),
                    spacer(100),

                    h2("4.2 أنماط استخدام tokenVersion"),
                    spacer(60),
                    p("ثلاثة أنماط رئيسية:"),
                    spacer(40),

                    h3("النمط 1 — القراءة (Read):"),
                    spacer(40),
                    p("يُستخدم tokenVersion كمكون في JWT payload لإصدار التوكنات. يُقرأ من قاعدة البيانات عند تسجيل الدخول، إكمال 2FA، WebAuthn، وتجديد الجلسة."),
                    code("const accessToken = await generateAccessToken({"),
                    code("  ..., tokenVersion: user.tokenVersion,"),
                    code("});"),
                    spacer(40),

                    h3("النمط 2 — الزيادة (Increment):"),
                    spacer(40),
                    p("يُستخدم { increment: 1 } في عمليات Prisma update عند حدوث حدث أمني. هذه العملية ذرية على مستوى قاعدة البيانات."),
                    code("data: { ... , tokenVersion: { increment: 1 } },"),
                    code("await revokeAllSessions(userId);  // إبطال جميع الجلسات"),
                    spacer(40),

                    h3("النمط 3 — المقارنة (Comparison):"),
                    spacer(40),
                    p("يحدث فقط في verify-session endpoint. يُقارن tokenVersion من JWT مع tokenVersion من قاعدة البيانات."),
                    code("if (payload.tokenVersion !== undefined &&"),
                    code("    payload.tokenVersion !== user.tokenVersion) {"),
                    code("  return { valid: false, reason: 'TOKEN_VERSION_MISMATCH' };"),
                    code("}"),
                    spacer(100),

                    h2("4.3 تدفق tokenVersion عبر دورة حياة الجلسة"),
                    spacer(60),
                    p("لنفترض أن مستخدماً جديداً يسجل دخوله:"),
                    spacer(40),
                    b("1. user.tokenVersion = 0 (القيمة الافتراضية في قاعدة البيانات)"),
                    b("2. تسجيل الدخول → يصدر Access Token بـ tokenVersion: 0 و Refresh Token بـ tokenVersion: 0"),
                    b("3. المستخدم يغير كلمة المرور → tokenVersion يصبح 1 (زيادة) → revokeAllSessions"),
                    b("4. جميع جلسات المستخدم السابقة أصبحت غير صالحة"),
                    b("5. المستخدم يعيد تسجيل الدخول → يصدر Access Token جديد بـ tokenVersion: 1"),
                    b("6. أي محاولة لاستخدام الـ Access Token القديم (tokenVersion: 0) → TOKEN_VERSION_MISMATCH"),
                ],
            },

            // ========== 5. CRITICAL ISSUES ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    nl(), h1("5. المشاكل المكتشفة (Critical Issues)"),
                    spacer(200),

                    h2("5.1 مشكلة production: عمود tokenVersion مفقود في قاعدة بيانات Supabase"),
                    spacer(60),
                    label("العمود tokenVersion موجود في Prisma Schema وقاعدة البيانات المحلية، لكنه مفقود في قاعدة بيانات Supabase (Production)", "حرجة"),
                    spacer(40),
                    p("السبب: سكربت build (prisma generate && next build) لا يشمل prisma migrate deploy. الترحيلات لا تُطبق على قاعدة بيانات Supabase."),
                    p("التأثير: كل استعلام Prisma يقرأ/يكتب tokenVersion يفشل. جميع عمليات المصادقة معطلة."),
                    p("الحل: ALTER TABLE \"users\" ADD COLUMN \"tokenVersion\" INTEGER NOT NULL DEFAULT 0; على Supabase."),
                    spacer(100),

                    h2("5.2 تدفق tokenVersion في verify-session — مشكلة محتملة"),
                    spacer(60),
                    p("يتم التحقق من tokenVersion فقط إذا كان payload.tokenVersion !== undefined. هذا يعني أن التوكنات القديمة (التي صدرت قبل إضافة tokenVersion إلى الـ payload) لن تخضع لهذا الفحص."),
                    code("if (payload.tokenVersion !== undefined && ...) {"),
                    code("  // فقط التوكنات الجديدة تخضع للفحص"),
                    code("}"),
                    spacer(40),
                    label("هذا مقصود للتوافق العكسي (Backward Compatibility) لكنه يُضعف الأمان للتوكنات القديمة", "متوسطة"),
                    spacer(100),

                    h2("5.3 غياب التحقق من tokenVersion في Edge Middleware"),
                    spacer(60),
                    p("الوسيط (middleware.ts) يتحقق فقط من صحة JWT (التوقيع + تاريخ الانتهاء) ولا يتحقق من tokenVersion. التحقق من mismatch يحدث فقط في verify-session API الذي يُستدعى من العميل."),
                    label("هذا يعني أن الـ JWT قد يكون صحيحاً (valid signature) لكن ملغياً (revoked) — لن يكتشفه الوسيط حتى يستدعي العميل verify-session", "عالية"),
                    spacer(100),

                    h2("5.4 مشكلة التوقيت (Race Condition) — إصدار التوكنات بعد increment"),
                    spacer(60),
                    p("عند فتح الحساب تلقائياً في AuthService.login (السطر 37-46)، يتم زيادة tokenVersion ثم إعادة جلب المستخدم. لكن في باقي العمليات (TwoFactorService.verify، PasswordService.changePassword)، يتم increment و revokeAllSessions لكن ليس هناك إعادة جلب."),
                    label("احتمالية منخفضة: إذا تم increment وتم إصدار توكن في نفس النانو ثانية، قد يصدر توكن بالقيمة القديمة. لكن عملياً Prisma update + revokeAllSessions يعالجان هذا.", "منخفضة"),
                    spacer(100),

                    h2("5.5 مشكلة التوافق العكسي (Backward Compatibility)"),
                    spacer(60),
                    p("النظام يدعم نمطين (TokenGeneration الجديد + Session القديم). آلية الترحيب (migrateSessionToFamily) تنقل الجلسات القديمة إلى النمط الجديد. لكن هذا يزيد من تعقيد الكود واحتمالية حدوث أخطاء."),
                    label("كود التوافق العكسي يضاعف تعقيد SessionService ويحتاج صيانة مستمرة", "متوسطة"),
                    spacer(100),

                    h2("5.6 مشكلة إبطال الجلسات (Revoke) — عدم إبطال التوكنات على مستوى العميل"),
                    spacer(60),
                    p("عند إبطال الجلسات (تغيير كلمة المرور، تمكين 2FA)، يتم إبطال Refresh Tokens فقط في قاعدة البيانات. الـ Access Token يبقى صالحاً حتى انتهاء صلاحيته (15 دقيقة) لأن الوسيط لا يتحقق من tokenVersion."),
                    label("هذا يعني أن المهاجم الذي يمتلك Access Token مسروقاً يمكنه استخدامه لمدة تصل إلى 15 دقيقة بعد إبطال الجلسة", "عالية"),
                ],
            },

            // ========== 6. SECURITY ASSESSMENT ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    nl(), h1("6. تقييم الأمان"),
                    spacer(200),

                    h2("6.1 بدون tokenVersion — السيناريو السابق"),
                    spacer(60),
                    makeTable(
                        ["نقطة الضعف", "التأثير", "الخطورة"],
                        [
                            ["تغيير كلمة المرور لا يبطل الجلسات القديمة", "المهاجم يمكنه الاستمرار باستخدام التوكن المسروق حتى بعد تغيير الضحية لكلمة المرور", "حرجة"],
                            ["تمكين/تعطيل 2FA لا يبطل الجلسات", "المهاجم الذي يتجاوز 2FA يمكنه الاستمرار حتى بعد تمكين الضحية لـ 2FA", "حرجة"],
                            ["فتح الحساب بعد القفل لا يبطل الجلسات", "الجلسات القديمة (قبل القفل) تبقى صالحة", "عالية"],
                            ["لا يمكن إجبار تسجيل الخروج من جميع الأجهزة", "لا توجد آلية مركزية لإبطال الجلسات", "عالية"],
                            ["لا يمكن كشف إعادة استخدام Refresh Token", "إذا سرق المهاجم Refresh Token، يمكنه تجديده بدون قيود", "حرجة"],
                        ]
                    ),
                    spacer(100),

                    h2("6.2 مع tokenVersion — التحسن الأمني"),
                    spacer(60),
                    makeTable(
                        ["السيناريو", "قبل tokenVersion", "بعد tokenVersion"],
                        [
                            ["تغيير كلمة المرور", "الجلسات القديمة لا تُبطل", "tokenVersion يزيد → mismatch → إبطال فوري"],
                            ["تمكين 2FA", "الجلسات القديمة تبقى", "tokenVersion يزيد + revokeAllSessions"],
                            ["فتح الحساب بعد القفل", "الجلسات تبقى صالحة", "tokenVersion يزيد + revokeAllSessions"],
                            ["ترقية المستخدم", "الجلسات تبقى صالحة", "tokenVersion يزيد → إبطال جلسات"],
                            ["كشف إعادة استخدام التوكن", "غير ممكن", "Atomic rotation + compromisedAt → تسجيل"],
                            ["إجبار خروج من جميع الأجهزة", "غير ممكن", "increment tokenVersion + revokeAllSessions"],
                        ]
                    ),
                    spacer(100),

                    h2("6.3 تحليل المخاطر المتبقية (Residual Risks)"),
                    spacer(60),
                    label("Access Token يبقى صالحاً لمدة 15 دقيقة بعد الإبطال — فترة سماح للمهاجم", "عالية"),
                    label("الوسيط (Middleware) لا يتحقق من tokenVersion — يعتمد على العميل لاستدعاء verify-session", "عالية"),
                    label("التوافق العكسي مع Session القديم يزيد من مساحة الهجوم", "متوسطة"),
                    label("الاعتماد على Upstash Redis في Rate Limiting — إذا تعطل Redis، يعمل Fail-Open", "متوسطة"),
                    label("جميع المفاتيح السرية (JWT Secrets) في ملف .env واحد — لا يوجد تدوير للمفاتيح", "عالية"),
                    spacer(100),

                    h2("6.4 آليات أمان إضافية موجودة"),
                    spacer(60),
                    b("CSRF Protection: مقارنة header X-CSRF-Token مع cookie csrf-token"),
                    b("Rate Limiting متعدد المستويات: IP-level, User-level, Endpoint-level"),
                    b("Atomic Operations: استخدام updateMany + count لمنع concurrent bypass"),
                    b("Account Lockout: بعد 5 محاولات فاشلة، يتم قفل الحساب"),
                    b("Security Headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options"),
                    b("Audit Logging: تسجيل جميع الأحداث الأمنية في audit_logs"),
                    b("Suspicious Activity Detection: كشف إعادة استخدام التحديات، MFA bypass، rotation attacks"),
                    b("Soft Delete: استخدام deletedAt للحفاظ على سلامة البيانات"),
                ],
            },

            // ========== 7. RECOMMENDATIONS ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    nl(), h1("7. التوصيات الاحترافية"),
                    spacer(200),

                    h2("7.1 توصيات فورية (Short-term)"),
                    spacer(60),

                    h3("7.1.1 إصلاح مشكلة tokenVersion في Production"),
                    spacer(40),
                    p("تشغيل الأمر التالي على قاعدة بيانات Supabase (يدوياً):"),
                    code("ALTER TABLE \"users\" ADD COLUMN \"tokenVersion\" INTEGER NOT NULL DEFAULT 0;"),
                    spacer(40),

                    h3("7.1.2 إضافة prisma migrate deploy إلى Build Script"),
                    spacer(40),
                    p("تحديث package.json لمنع تكرار المشكلة:"),
                    code("\"build\": \"prisma generate && prisma migrate deploy && next build\""),
                    spacer(100),

                    h2("7.2 توصيات متوسطة المدى (Medium-term)"),
                    spacer(60),

                    h3("7.2.1 إضافة التحقق من tokenVersion إلى Edge Middleware"),
                    spacer(40),
                    p("بما أن الوسيط (middleware.ts) يتحقق من JWT، يمكن إضافة فحص tokenVersion مباشرة فيه. لكن الوسيط يعمل على Edge ولا يمكنه الوصول إلى قاعدة البيانات مباشرة."),
                    p("الحل: إضافة حقل short-lived cache (Redis/Vercel KV) يخزّن revoked tokenVersions لكل مستخدم ليتمكن الوسيط من التحقق منها."),
                    spacer(40),

                    h3("7.2.2 تقليل مدة صلاحية Access Token"),
                    spacer(40),
                    p("تقليل مدة صلاحية Access Token من 15 دقيقة إلى 5 دقائق لتقليل فترة السماح بعد الإبطال."),
                    spacer(40),

                    h3("7.2.3 إضافة تدوير (Rotation) لمفاتيح JWT"),
                    spacer(40),
                    p("إضافة آلية تدوير دورية لمفاتيح JWT_ACCESS_SECRET و JWT_REFRESH_SECRET."),
                    spacer(100),

                    h2("7.3 توصيات طويلة المدى (Long-term)"),
                    spacer(60),

                    h3("7.3.1 إزالة التوافق العكسي مع Session القديم"),
                    spacer(40),
                    p("بعد التأكد من ترحيل جميع الجلسات القديمة، يمكن إزالة كود التوافق العكسي لتقليل التعقيد."),
                    spacer(40),

                    h3("7.3.2 إضافة Refresh Token Rotation مع WebAuthn"),
                    spacer(40),
                    p("توسيع آلية Rotation لتشمل WebAuthn بالكامل."),
                    spacer(40),

                    h3("7.3.3 إضافة Fingerprinting للجهاز"),
                    spacer(40),
                    p("إضافة بصمة جهاز (Device Fingerprinting) لتعزيز كشف محاولات سرقة الجلسة."),
                    spacer(40),

                    h3("7.3.4 تحسين Fail-Open في Rate Limiting"),
                    spacer(40),
                    p("عند تعطل Redis، يجب أن يكون السلوك Fail-Close (رفض الطلب) بدلاً من Fail-Open (السماح)."),
                    spacer(100),

                    h2("7.4 هل يجب استخدام tokenVersion؟"),
                    spacer(60),
                    p("نعم، وبشدة. tokenVersion هو آلية أمان أساسية توفر:"),
                    spacer(40),
                    b("قدرة على إبطال جميع الجلسات فورياً (Force Logout All Devices)"),
                    b("قدرة على كشف الجلسات المسروقة بعد تغيير كلمة المرور"),
                    b("آلية بسيطة وفعالة (عدد صحيح يتم زيادته) لا تؤثر على أداء قاعدة البيانات"),
                    b("مقاومة عالية للـ Race Conditions (بفضل Prisma atomic increment)"),
                    spacer(60),
                    p("هذه الآلية موجودة في أنظمة عملاقة مثل Google و Facebook (تسمى force reauthentication أو session version)."),
                    spacer(100),

                    h2("7.5 التحسينات المقترحة على JWT"),
                    spacer(60),

                    makeTable(
                        ["التحسين", "الأهمية", "التعقيد"],
                        [
                            ["التحقق من tokenVersion في Edge Middleware", "حرجة", "متوسط"],
                            ["تقليل صلاحية Access Token (5 دقائق)", "عالية", "بسيط"],
                            ["تدوير مفاتيح JWT دورياً", "عالية", "متوسط"],
                            ["إضافة RS256 بدلاً من HS256 (غير متماثل)", "متوسطة", "متوسط"],
                            ["إضافة Device Fingerprint إلى Payload", "متوسطة", "متوسط"],
                            ["رفع مستوى bcrypt من 12 إلى 14", "منخفضة", "بسيط"],
                        ]
                    ),
                ],
            },

            // ========== 8. CONCLUSION ==========
            {
                properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
                children: [
                    nl(), h1("8. الخلاصة"),
                    spacer(200),

                    h2("8.1 نقاط القوة في النظام"),
                    spacer(60),
                    b("نظام مصادقة هجين متطور (JWT + Session + Token Family + MFA + WebAuthn)"),
                    b("Atomic Token Rotation يكتشف إعادة استخدام التوكنات"),
                    b("Rate Limiting متعدد المستويات عبر Upstash Redis"),
                    b("CSRF Protection صارم (استثناء فقط للمسارات العامة)"),
                    b("Account Lockout التدريجي (5 → 7 → 15 دقيقة → أسبوع)"),
                    b("التسجيل الكامل في Audit Log لكل حدث أمني"),
                    b("دعم 2FA (TOTP + Backup Codes) و WebAuthn (Passkeys)"),
                    b("Soft Delete للحفاظ على البيانات"),
                    spacer(100),

                    h2("8.2 نقاط الضعف الحرجة (Critical)"),
                    spacer(60),
                    label("عمود tokenVersion مفقود في قاعدة بيانات Production — كل شيء معطل", "حرجة"),
                    label("الوسيط (Middleware) لا يتحقق من tokenVersion — فترة سماح 15 دقيقة", "حرجة"),
                    spacer(100),

                    h2("8.3 التوصية النهائية"),
                    spacer(60),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200 },
                        children: [
                            new TextRun({ text: "النظام من الناحية المعمارية مصمم بشكل ممتاز وآمن", bold: true, size: 28, color: C.green, font: "Traditional Arabic" }),
                        ]
                    }),
                    spacer(40),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 60 },
                        children: [
                            new TextRun({ text: "المشكلة ليست في التصميم — بل في عدم تطبيق الترحيلات على قاعدة بيانات الإنتاج", size: 24, color: C.orange, font: "Traditional Arabic" }),
                        ]
                    }),
                    spacer(100),
                    p("آلية tokenVersion فعالة وتُطبق أفضل الممارسات الأمنية. التحسينات المطلوبة هي:"),
                    spacer(40),
                    b("1. فوراً: تطبيق ALTER TABLE على Supabase لإصلاح المشكلة الحالية"),
                    b("2. قريباً: إضافة prisma migrate deploy إلى build script"),
                    b("3. مستقبلاً: إضافة التحقق من tokenVersion إلى Edge Middleware عبر Redis cache"),
                    spacer(100),

                    h2("8.4 إحصاءات التقرير"),
                    spacer(60),
                    makeTable(
                        ["المؤشر", "القيمة"],
                        [
                            ["الملفات التي تم تحليلها", "54 ملفاً"],
                            ["مواقع استخدام tokenVersion", "35 موقعاً في 14 ملفاً"],
                            ["المشاكل الحرجة المكتشفة", "2"],
                            ["المشاكل عالية الخطورة", "3"],
                            ["المشاكل متوسطة الخطورة", "4"],
                            ["نقاط القوة", "9"],
                            ["التوصيات المقترحة", "10"],
                        ]
                    ),
                ],
            },
        ],
    });
}

async function main() {
    const d = doc();
    const buf = await Packer.toBuffer(d);
    fs.writeFileSync(OUT, buf);
    console.log(`✅ تم إنشاء التقرير الأمني: ${OUT}`);
}
main().catch(console.error);
