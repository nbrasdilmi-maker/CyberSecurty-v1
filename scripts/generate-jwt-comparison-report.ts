const docx = require("docx");
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType, convertInchesToTwip, PageBreak, ShadingType } = docx;

// ======================== DATA ========================

const currentSystem = {
  name: "نظام JWT المخصص (Custom)",
  tech: "مكتبة jose (JavaScript Object Signing and Encryption) — معيار مفتوح",
  signing: "HS256 (HMAC-SHA256) — مفتاح متماثل (symmetric)",
  keyLen: "256-bit (32 بايت / 64 حرف hex)",
  accessExp: "15 دقيقة",
  refreshExp: "7 أيام",
  storage: "HTTP-only Cookies + SameSite=Strict + Secure",
  csrf: "نعم — Double-submit cookie pattern في middleware",
  rotation: "نعم — Token Families مع atomic rotation + كشف إعادة الاستخدام (reuse detection)",
  revoke: "عبر tokenVersion (إلغاء جماعي) / إلغاء فردي عبر عائلة التوكن",
  mfa: "مخصص — TOTP + WebAuthn + استرداد",
  social: "لا يوجد",
  dbChecks: "نعم — التحقق من وجود المستخدم وحالته في قاعدة البيانات",
  files: "50+ ملف (auth.ts, middleware.ts, 25+ API routes, Services, Store)",
  complexity: "عالية — صيانة مزدوجة (نظام قديم للجلسات + نظام جديد Token Families)",
  authLib: "مكتبة jose + Prisma + PostgreSQL",
  verification: "يدوي — jwtVerify مع ACCESS_SECRET (لا يحدد algorithm)",
  typeCheck: "لا يوجد — لا يتحقق من claim type (access/refresh)",
};

const supabaseSystem = {
  name: "نظام Supabase Auth (مدمج)",
  tech: "Supabase Auth + @supabase/ssr + @supabase/supabase-js",
  signing: "RS256 (RSA) — مفتاح غير متماثل (asymmetric) أو HS256 (مشترك)",
  keyLen: "2048-bit RSA أو 256-bit HMAC",
  accessExp: "1 ساعة (قابل للتخصيص بين 5 دقائق - 1 ساعة)",
  refreshExp: "غير محدد (لا ينتهي أبداً، لكن يمكن استخدامه مرة واحدة)",
  storage: "يتحكم بها العميل (localStorage افتراضياً — يمكن تخزينها في cookies عبر @supabase/ssr)",
  csrf: "مدمج (عبر PKCE flow)",
  rotation: "نعم — مدمج مع كشف إعادة الاستخدام (reuse interval 10s)",
  revoke: "نعم — عبر إلغاء الجلسة بالكامل أو تسجيل الخروج",
  mfa: "مدمج — TOTP + SMS + Recovery Codes (خطة مدفوعة للميزات المتقدمة)",
  social: "مدمج — Google, GitHub, Microsoft, Apple + أي OAuth2/OIDC مخصص",
  dbChecks: "لا حاجة — Supabase يدير حالة المستخدم، لكن يمكنك الربط مع auth.users عبر FK",
  files: "~5-10 ملفات (supabase client, middleware, لوغين، إعدادات)",
  complexity: "منخفضة — كل شيء مدمج وجاهز",
  authLib: "@supabase/supabase-js + @supabase/ssr",
  verification: "تلقائي — عبر JWKS endpoint مع RS256 (public key verification)",
  typeCheck: "مدمج — JWT يحتوي role, sub, session_id, iss, exp بشكل تلقائي",
};

const comparisonTable = [
  { feature: "خوارزمية التوقيع", current: "HS256 (متماثل)", supabase: "RS256 (غير متماثل) ✅", advantage: "Supabase — لا يحتاج مشاركة Secret مع كل مخدم" },
  { feature: "مدة صلاحية Access Token", current: "15 دقيقة ⚡", supabase: "1 ساعة (قابل للتخصيص)", advantage: "حالي — أقصر = أكثر أمناً لكن يزيد تحميل التحديث" },
  { feature: "مدة صلاحية Refresh Token", current: "7 أيام", supabase: "غير محدود (يستخدم مرة واحدة)", advantage: "Supabase — أكثر مرونة للمستخدمين النشطين" },
  { feature: "تخزين التوكن", current: "HTTP-only Cookies 🛡️", supabase: "localStorage (افتراضي) ⚠️", advantage: "حالي — أكثر أمناً ضد XSS" },
  { feature: "حماية CSRF", current: "مخصصة (Double-submit) ✅", supabase: "PKCE flow مدمج ✅", advantage: "متقاربان" },
  { feature: "تدوير Refresh Token", current: "مخصص مع كشف إعادة الاستخدام", supabase: "مدمج مع reuse interval 10s ✅", advantage: "Supabase — أثبت جدارته في الإنتاج" },
  { feature: "كشف إعادة استخدام التوكن", current: "مخصص ✅", supabase: "مدمج ✅", advantage: "متقاربان" },
  { feature: "المصادقة الثنائية (MFA)", current: "مخصص (TOTP + WebAuthn)", supabase: "مدمج (TOTP + SMS + Recovery) ✅", advantage: "Supabase — أقل تكلفة صيانة" },
  { feature: "تسجيل الدخول الاجتماعي", current: "❌ غير موجود", supabase: "✅ مدمج (Google, GitHub, Apple, إلخ)", advantage: "Supabase — إضافة سهلة" },
  { feature: "التحقق من المستخدم (DB check)", current: "✅ نعم — مع Prisma", supabase: "❌ لا حاجة (لكن يمكنك الربط)", advantage: "حالي — يمنع المستخدمين المحظورين على الفور" },
  { feature: "إلغاء التوكن في لحظته", current: "عبر tokenVersion (جماعي)", supabase: "عبر session_id (فردي وجماعي) ✅", advantage: "Supabase — إلغاء دقيق لكل جلسة" },
  { feature: "عدد الملفات المتأثرة", current: "50+ ملف ❌", supabase: "5-10 ملفات ✅", advantage: "Supabase — صيانة أسهل بكثير" },
  { feature: "التكامل مع Next.js SSR", current: "يدوي (دعم موجود)", supabase: "@supabase/ssr رسمي ✅", advantage: "Supabase — مكتبة رسمية من Supabase" },
  { feature: "التكامل مع RLS", current: "❌ لا يستخدم RLS", supabase: "✅ مدمج بالكامل مع RLS", advantage: "Supabase — أمان على مستوى الصف" },
  { feature: "التسعير", current: "مجاني (بدون تكلفة إضافية)", supabase: "حسب MAU (مجاني حتى 50,000 مستخدم شهرياً)", advantage: "حالي — لا توجد تكلفة إضافية" },
  { feature: "التخصيص", current: "مفتوح بالكامل ✅", supabase: "محدود بإمكانيات Supabase ⚠️", advantage: "حالي — تحكم كامل في كل شيء" },
];

const affectedFiles = [
  { file: "src/lib/auth.ts", change: "إزالة كاملة — كل دوال JWT و Token rotation", risk: "عالي" },
  { file: "src/middleware.ts", change: "إعادة كتابة — استخدام verifySession من @supabase/ssr بدلاً من jwtVerify اليدوي", risk: "عالي" },
  { file: "src/app/api/auth/login/route.ts", change: "إعادة كتابة — استخدام supabase.auth.signInWithPassword()", risk: "عالي" },
  { file: "src/app/api/auth/refresh/route.ts", change: "إزالة — يصبح غير ضروري (يديره supabase تلقائياً)", risk: "متوسط" },
  { file: "src/app/api/auth/logout/route.ts", change: "إعادة كتابة — استخدام supabase.auth.signOut()", risk: "منخفض" },
  { file: "src/app/api/auth/me/route.ts", change: "إعادة كتابة — استخدام getUser() بدلاً من jwtVerify", risk: "متوسط" },
  { file: "src/app/api/auth/verify-session/route.ts", change: "إعادة كتابة كاملة أو إزالة", risk: "متوسط" },
  { file: "src/app/api/auth/2fa/*", change: "إزالة كاملة — استخدام Supabase MFA", risk: "عالي" },
  { file: "src/app/api/auth/activate/route.ts", change: "إعادة كتابة — تسجيل المستخدم عبر Supabase Admin API", risk: "عالي" },
  { file: "src/app/api/auth/reset-password/route.ts", change: "إعادة كتابة — استخدام supabase.auth.resetPasswordForEmail()", risk: "متوسط" },
  { file: "src/app/api/auth/forgot-password/route.ts", change: "إعادة كتابة", risk: "متوسط" },
  { file: "25+ API route files (admin, settings, etc.)", change: "تعديل — إزالة ACCESS_SECRET المكرر، استخدام getUser() بدلاً من jwtVerify", risk: "مرتفع" },
  { file: "src/services/auth/AuthService.ts", change: "إزالة كاملة", risk: "عالي" },
  { file: "src/services/auth/SessionService.ts", change: "إزالة كاملة", risk: "عالي" },
  { file: "src/services/auth/TwoFactorService.ts", change: "إزالة كاملة — استخدام Supabase MFA", risk: "عالي" },
  { file: "src/services/auth/PasswordService.ts", change: "إعادة كتابة — استخدام Admin API", risk: "متوسط" },
  { file: "src/services/auth/WebAuthnService.ts", change: "إزالة — غير مدعوم في Supabase حالياً", risk: "عالي" },
  { file: "src/services/tig/BotService.ts", change: "تعديل — تحديث آلية المصادقة مع Supabase", risk: "متوسط" },
  { file: "src/services/tig/TigService.ts", change: "تعديل", risk: "متوسط" },
  { file: "src/store/authStore.ts", change: "إعادة كتابة — استخدام supabase.auth.onAuthStateChange()", risk: "عالي" },
  { file: "src/lib/ratelimit.ts", change: "إزالة بعض limiters (refresh rate limit)", risk: "منخفض" },
  { file: "prisma/schema.prisma", change: "تعديل — إزالة حقل passwordHash من User, إضافة FK إلى auth.users.id", risk: "متوسط" },
  { file: ".env", change: "إزالة JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (استبدال بـ SUPABASE_SERVICE_ROLE_KEY)", risk: "منخفض" },
  { file: "قاعدة البيانات", change: "ترحيل المستخدمين من users إلى auth.users. نقل user.id إلى auth.users.id.", risk: "حرج (Critical)" },
];

const riskAssessment = [
  { category: "احتمالية كسر النظام", level: "عالية جداً (70-85%)", desc: "نظام المصادقة هو العمود الفقري للموقع. أي خطأ في الترحيل يمنع جميع المستخدمين من تسجيل الدخول." },
  { category: "ترحيل المستخدمين", level: "حرج", desc: "يوجد مستخدمون حقيقيون في قاعدة البيانات. ترحيلهم من users (custom) إلى auth.users (Supabase) يتطلب تعيين كلمات مرور جديدة أو استخدام Admin API لتجنب إعادة التعيين." },
  { category: "فقدان WebAuthn", level: "متوسط", desc: "Supabase MFA لا يدعم WebAuthn حالياً (يدعم TOTP + SMS فقط). مستخدمو البصمة سيخسرون هذه الميزة." },
  { category: "فقدان ربط Telegram", level: "متوسط", desc: "ربط Telegram يعتمد على معرف المستخدم الحالي (UUID). ترحيل المعرفات قد يكسر الروابط الحالية." },
  { category: "توقف الخدمة", level: "أسابيع (2-4)", desc: "التعديلات تشمل 30+ ملفاً. التطوير والاختبار سيستغرق أسبوعين على الأقل. النشر يتزامن مع إعادة تسجيل دخول جميع المستخدمين." },
  { category: "أمان التخزين", level: "تراجع", desc: "الانتقال من HTTP-only Cookies إلى localStorage (الافتراضي في Supabase) يقلل الأمان ضد XSS. يمكن معالجته باستخدام @supabase/ssr." },
];

const featureDependencies = {
  telegram: { title: "ربط Telegram (تسجيل الدخول عبر البوت)", depends: "على معرف المستخدم (userId) في جدول telegram_bindings", impact: "متوسط — يحتاج ترحيل المعرفات" },
  tokenVersion: { title: "الإلغاء الجماعي للجلسات (tokenVersion)", depends: "على حقل tokenVersion في جدول users", impact: "متوسط — Supabase يستخدم session_id بدلاً من tokenVersion" },
  verifySession: { title: "التحقق من الجلسة من قاعدة البيانات", depends: "على Prisma والتحقق من حالة المستخدم", impact: "منخفض — يمكن محاكاته عبر auth.users" },
  recoveryCodes: { title: "رموز الاسترداد (Recovery Codes)", depends: "على جدول recovery_codes المخصص", impact: "متوسط — Supabase يدعم recovery codes لكن قد تحتاج ترحيل" },
  bindingInitiate: { title: "ربط الحساب عبر كود (binding/initiate)", depends: "على JWT لتحديد المستخدم الحالي", impact: "منخفض — نفس المبدأ مع Supabase JWT" },
  auditLog: { title: "سجل التدقيق (auditLog)", depends: "على userId الحالي", impact: "منخفض — لا يتأثر" },
};

const supabaseSdk = [
  { name: "@supabase/supabase-js", purpose: "المكتبة الأساسية للاتصال بـ Supabase (Auth, Database, Storage)" },
  { name: "@supabase/ssr", purpose: "للتكامل مع Next.js SSR (App Router) — تخزين التوكن في cookies" },
  { name: "@supabase/auth-helpers-nextjs", purpose: "إصدار أقدم من @supabase/ssr (قديم)" },
];

// ======================== BUILD DOCUMENT ========================

function titlePage() {
  return [
    new Paragraph({ spacing: { before: 2000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "تقرير مقارنة أنظمة المصادقة (JWT)", size: 44, bold: true, font: "Cairo" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [new TextRun({ text: "النظام الحالي (مخصص) مقابل Supabase Auth", size: 28, bold: true, color: "2563EB", font: "Cairo" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [new TextRun({ text: `تاريخ التقرير: ${new Date().toLocaleDateString("ar-YE")}`, size: 20, color: "6B7280", font: "Cairo" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
      children: [new TextRun({ text: "مشروع: سحابة الأمن السيبراني — CyberSecurty v1.1", size: 22, bold: true, font: "Cairo" })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 600 },
      children: [new TextRun({ text: "إخلاء مسؤولية: هذا التقرير تحليلي فقط. لا ينبغي اتخاذ قرار الترحيل دون اختبار شامل في بيئة منفصلة.", size: 16, color: "DC2626", font: "Cairo" })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function sectionH1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 500, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2563EB" } },
    children: [new TextRun({ text, size: 30, bold: true, font: "Cairo" })],
  });
}

function sectionH2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, size: 24, bold: true, font: "Cairo" })],
  });
}

function sectionH3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, size: 20, bold: true, font: "Cairo" })],
  });
}

function t(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 18, font: "Cairo", ...opts })],
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 50 },
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 18, font: "Cairo", ...opts })],
  });
}

function makeTable(headers, rows, colWidths) {
  return new Table({
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          width: { size: colWidths[i], type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: "1E3A5F" },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, size: 16, bold: true, font: "Cairo", color: "FFFFFF" })] })],
        })),
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => new TableCell({
          width: { size: colWidths[ci], type: WidthType.PERCENTAGE },
          shading: ri % 2 === 1 ? { type: ShadingType.SOLID, color: "F0F4F8" } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 15, font: "Cairo", color: "1F2937" })] })],
        })),
      })),
    ],
  });
}

// ======================== CHILDREN ========================
const children = [];
children.push(...titlePage());

// 1. Introduction
children.push(sectionH1("مقدمة"));
children.push(t("يهدف هذا التقرير إلى مقارنة نظام المصادقة الحالي في مشروع سحابة الأمن السيبراني (القائم على JWT مخصص باستخدام مكتبة jose) مع نظام Supabase Auth المدمج في قاعدة البيانات السحابية. الهدف هو تقديم تحليل موضوعي يساعد في اتخاذ قرار بشأن الترحيل أو البقاء على الوضع الحالي."));
children.push(t("يشرح التقرير:"));
children.push(bullet("كيف يعمل Supabase Auth — JWT وإدارة الجلسات"));
children.push(bullet("مقارنة تفصيلية بين النظامين في 16 معياراً"));
children.push(bullet("الملفات المتأثرة في حال الترحيل"));
children.push(bullet("تحليل المخاطر (Risk Assessment)"));
children.push(bullet("التوصية النهائية"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// 2. What is Supabase Auth JWT
children.push(sectionH1("ما هو JWT في Supabase Auth؟"));
children.push(t("Supabase Auth هو نظام مصادقة متكامل مبني داخل قاعدة البيانات السحابية (PostgreSQL). يقوم بإصدار JWTs تلقائياً لكل مستخدم مسجل الدخول، ويدير دورة حياة الجلسة بالكامل."));

children.push(sectionH2("بنية JWT في Supabase"));
children.push(t("كل JWT يصدره Supabase Auth يتكون من ثلاثة أجزاء:"));

children.push(sectionH3("1. Header (الرأس)"));
children.push(t('{ "typ": "JWT", "alg": "RS256", "kid": "<معرف المفتاح>" }'));
children.push(t("يحدد نوع التوكن، خوارزمية التوقيع، ومعرف المفتاح المستخدم للتحقق."));

children.push(sectionH3("2. Payload (الحمولة)"));
children.push(t('{ "iss": "https://<project>.supabase.co/auth/v1", "sub": "<معرف المستخدم>", "role": "authenticated", "session_id": "<معرف الجلسة>", "email": "...", "exp": 12345678 }'));
children.push(t("يحتوي على:"));
children.push(bullet("iss — الجهة المصدرة (Issuer)"));
children.push(bullet("sub — معرف المستخدم الفريد (Subject)"));
children.push(bullet("role — دور PostgreSQL لـ RLS (authenticated/anonymous)"));
children.push(bullet("session_id — معرف الجلسة الفريد (لإلغاء الجلسات الفردية)"));
children.push(bullet("email / phone — معلومات المستخدم"));
children.push(bullet("exp + iat + aud — تواريخ الصلاحية والإصدار"));

children.push(sectionH3("3. Signature (التوقيع)"));
children.push(t("يتم توقيع JWT بمفتاح خاص (RS256) أو مشترك (HS256). يوفر Supabase نقطة نهاية JWKS للتحقق من التوقيع: https://<project>.supabase.co/auth/v1/.well-known/jwks.json"));

children.push(sectionH2("كيف تدير Supabase الجلسات؟"));
children.push(t("عند تسجيل دخول المستخدم:"));
children.push(bullet("1. ينشئ Supabase جلسة جديدة في جدول auth.sessions (داخل قاعدة البيانات)"));
children.push(bullet("2. يصدر Access Token (JWT) — قصير المدة (1 ساعة افتراضياً)"));
children.push(bullet("3. يصدر Refresh Token — طويل المدة (لا ينتهي لكن يستخدم مرة واحدة)"));
children.push(bullet("4. الـ Access Token يُستخدم للمصادقة على الطلبات"));
children.push(bullet("5. الـ Refresh Token يُستخدم للحصول على Access Token جديد (تدوير تلقائي)"));
children.push(bullet("6. عند التسجيل الخروج، تُحذف الجلسة من auth.sessions"));

children.push(t(""));
children.push(t("ميزات إضافية:"));
children.push(bullet("كشف إعادة استخدام Refresh Token (reuse detection مع interval 10 ثوانٍ)"));
children.push(bullet("إلغاء جلسة فردية عبر session_id"));
children.push(bullet("تقييد عدد الجلسات لكل مستخدم (Pro Plans)"));
children.push(bullet("انتهاء الجلسة بعد وقت محدد (Time-box) أو عدم نشاط (Inactivity)"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// 3. Comparison Table
children.push(sectionH1("مقارنة تفصيلية بين النظامين"));

const compRows = comparisonTable.map(r => [
  r.feature,
  r.current,
  r.supabase,
  r.advantage,
]);
children.push(makeTable(
  ["المعيار", "النظام الحالي (مخصص)", "Supabase Auth", "الأفضلية"],
  compRows,
  [22, 28, 28, 22]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// 4. Affected Files
children.push(sectionH1("الملفات المتأثرة في حال الترحيل"));
children.push(t("لنقل النظام إلى Supabase Auth، يجب تعديل أو إزالة أو إعادة كتابة الملفات التالية. تم ترتيبها حسب خطورة التغيير:"));

const affectedRows = affectedFiles.map(f => [f.file, f.change, f.risk]);
children.push(makeTable(
  ["الملف", "التغيير المطلوب", "مستوى الخطر"],
  affectedRows,
  [35, 45, 20]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// 5. Risk Assessment
children.push(sectionH1("تحليل المخاطر (Risk Assessment)"));

const riskRows = riskAssessment.map(r => [r.category, r.level, r.desc]);
children.push(makeTable(
  ["الفئة", "المستوى", "الشرح"],
  riskRows,
  [20, 15, 65]
));

children.push(t(""));
children.push(sectionH2("الميزات التي قد تتأثر"));

const depRows = Object.values(featureDependencies).map(d => [d.title, d.depends, d.impact]);
children.push(makeTable(
  ["الميزة", "الاعتماد", "التأثير"],
  depRows,
  [30, 40, 30]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// 6. Which is better?
children.push(sectionH1("الأفضلية: أيهما أفضل؟"));
children.push(t("لا توجد إجابة مطلقة. الإجابة تعتمد على احتياجات المشروع:"));

children.push(sectionH2("متى يكون Supabase Auth أفضل؟"));
children.push(bullet("✅ تريد تقليل كود المصادقة بشكل كبير (من 50+ ملف إلى 5-10)"));
children.push(bullet("✅ تريد تسجيل دخول اجتماعي (Google, GitHub, Apple) بدون تعقيد"));
children.push(bullet("✅ تريد RLS (Row Level Security) على مستوى قاعدة البيانات"));
children.push(bullet("✅ تريد الاستفادة من التحديثات الأمنية المستمرة من Supabase"));
children.push(bullet("✅ تبدأ مشروعاً جديداً (ليس لديك مستخدمين حقيقيين بعد)"));
children.push(bullet("✅ لا تحتاج WebAuthn (مكتبة خارجية قد تكون مطلوبة)"));

children.push(t(""));
children.push(sectionH2("متى يكون النظام الحالي (المخصص) أفضل؟"));
children.push(bullet("✅ لديك مستخدمين حقيقيين (ترحيلهم سيكون معقداً ومحفوفاً بالمخاطر)"));
children.push(bullet("✅ تحتاج WebAuthn (بصمة/Windows Hello) — Supabase لا يدعمها رسمياً"));
children.push(bullet("✅ تحتاج تحكماً كاملاً في خوارزمية التوقيع ونوع التوكن"));
children.push(bullet("✅ لديك نظام Token Families يعمل بشكل موثوق حالياً"));
children.push(bullet("✅ لا تريد تحمل تكلفة MAU مع زيادة عدد المستخدمين"));
children.push(bullet("✅ تفضل HTTP-only Cookies على localStorage (أكثر أمناً)"));

children.push(t(""));
children.push(sectionH2("الجدول المقارن النهائي"));

const decisionTable = [
  { criteria: "الأمان (XSS)", custom: "🟢 HTTP-only Cookies", supabase: "🟡 localStorage (قابل للتحسين بـ @supabase/ssr)" },
  { criteria: "الأمان (CSRF)", custom: "🟢 Double-submit", supabase: "🟢 PKCE flow" },
  { criteria: "كلفة الصيانة", custom: "🔴 عالية (50+ ملف)", supabase: "🟢 منخفضة (5-10 ملفات)" },
  { criteria: "التحكم الكامل", custom: "🟢 تحكم كامل", supabase: "🟡 مقيد بـ Supabase API" },
  { criteria: "التكامل مع Next.js", custom: "🟡 يدوي", supabase: "🟢 @supabase/ssr" },
  { criteria: "تسجيل الدخول الاجتماعي", custom: "🔴 غير موجود", supabase: "🟢 مدمج" },
  { criteria: "المصادقة الثنائية", custom: "🟢 مخصص + WebAuthn", supabase: "🟡 TOTP فقط (بدون WebAuthn)" },
  { criteria: "إلغاء التوكن الفردي", custom: "🟡 عبر tokenVersion (جماعي)", supabase: "🟢 عبر session_id (فردي)" },
  { criteria: "سرعة التطوير (لمشروع جديد)", custom: "🔴 بطيء (يبني من الصفر)", supabase: "🟢 سريع (جاهز)" },
  { criteria: "ترحيل المستخدمين الحاليين", custom: "🟢 لا حاجة لترحيل", supabase: "🔴 معقد وخطير" },
  { criteria: "التسعير", custom: "🟢 مجاني تماماً", supabase: "🟡 مجاني حتى 50k MAU" },
];

const decisionRows = decisionTable.map(d => [d.criteria, d.custom, d.supabase]);
children.push(makeTable(
  ["المعيار", "النظام الحالي", "Supabase Auth"],
  decisionRows,
  [30, 35, 35]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// 7. Recommendation
children.push(sectionH1("التوصية النهائية"));
children.push(t("بناءً على التحليل أعلاه، التوصية هي:", { bold: true }));

children.push(sectionH2("للمدى القصير (الآن — الأشهر الثلاثة القادمة):"));
children.push(bullet("🔵 ابق على النظام الحالي.", { bold: true }));
children.push(bullet("النظام الحالي يعمل بشكل موثوق، HTTP-only Cookies أكثر أمناً، ولديك مستخدمون حقيقيون لا يمكن تعريضهم لخطر الترحيل."));
children.push(bullet("ركز بدلاً من ذلك على إصلاح الثغرات الحالية في JWT:"));
children.push(bullet("إضافة algorithms: ['HS256'] إلى كل jwtVerify (25+ ملف) —  ساعة واحدة"));
children.push(bullet("إضافة التحقق من type: 'access' و type: 'refresh' —  ساعتان"));
children.push(bullet("إعادة هيكلة ACCESS_SECRET إلى مصدر واحد بدلاً من 25+ نسخة —  3 ساعات"));
children.push(bullet("إضافة jti إلى Access Tokens للإلغاء الفردي —  4 ساعات"));

children.push(t(""));
children.push(sectionH2("للمدى البعيد (6-12 شهراً):"));
children.push(bullet("🟢 ادرس ترحيل النظام إلى Supabase Auth عند إعادة بناء المشروع من الصفر (v2.0)."));
children.push(bullet("في الإصدار الجديد، لن يكون لديك مستخدمون حقيقيون بعد، وسيكون التكامل مع Supabase أسهل."));
children.push(bullet("يمكنك الاستفادة من RLS، تسجيل الدخول الاجتماعي، وإدارة الجلسات المدمجة."));
children.push(bullet("استخدم @supabase/ssr فوراً للتغلب على مشكلة localStorage."));

children.push(t(""));
children.push(sectionH2("سيناريو الترحيل (إذا أصررت):"));
children.push(t("إذا قررت الترحيل الآن، اتبع الخطوات التالية بالترتيب:", { bold: true }));
children.push(bullet("1. أنشئ بيئة منفصلة (staging) مع نسخة طبق الأصل من قاعدة البيانات"));
children.push(bullet("2. ثبّت @supabase/supabase-js و @supabase/ssr"));
children.push(bullet("3. اربط Supabase Auth مع قاعدة البيانات (تهيئة Auth في Supabase Dashboard)"));
children.push(bullet("4. قم بترحيل المستخدمين من جدول users إلى auth.users (استخدم Admin API)"));
children.push(bullet("5. انقل الروابط (telegram_bindings، إلخ) إلى المعرفات الجديدة"));
children.push(bullet("6. أعد كتابة middleware.ts لاستخدام Supabase بدلاً من jwtVerify اليدوي"));
children.push(bullet("7. أعد كتابة API routes (25+ ملف) لاستخدام getUser()"));
children.push(bullet("8. اختبر كل شيء بدقة — خاصة تسجيل الدخول، التوكن، الـ MFA، وربط Telegram"));
children.push(bullet("9. انشر واطلب من جميع المستخدمين تسجيل الدخول مرة أخرى"));

children.push(t(""));
children.push(t("⏱️ الوقت التقديري للترحيل الكامل: 2-4 أسابيع لمطور واحد.", { bold: true, color: "DC2626" }));
children.push(t("⚠️ خطر توقف الخدمة أثناء الترحيل: مرتفع جداً — يُنصح بوجود خطة تراجع (Rollback Plan).", { color: "EA580C" }));

// Build
const doc = new Document({
  title: "تقرير مقارنة أنظمة المصادقة - سحابة الأمن السيبراني",
  description: "مقارنة النظام الحالي (JWT مخصص) مع Supabase Auth",
  styles: {
    default: {
      document: {
        run: { font: "Cairo", size: 18 },
        paragraph: { alignment: AlignmentType.RIGHT },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), right: convertInchesToTwip(1), left: convertInchesToTwip(1) },
        direction: "right-to-left",
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "JWT_AUTH_COMPARISON_REPORT.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Report saved to: ${outPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
