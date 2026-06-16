const docx = require("docx");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageBreak, TableOfContents, LevelFormat, TabStopPosition, TabStopType,
  convertInchesToTwip, Numbering, Footer, Header, ImageRun
} = docx;

// =============== DATA ===============

const findings = {
  critical: [
    {
      id: "SEC-01",
      title: "13 ثغرة أمنية في الاعتماديات (Dependencies)",
      desc: "فحص npm audit كشف 13 ثغرة: 10 عالية (High) و 3 متوسطة (Moderate). أخطرها: RCE في serialize-javascript، XSS في Next.js، Command Injection في glob، Prototype Pollution في xlsx، DoS في Next.js Image Optimization.",
      impact: "عالية جداً - بعض الثغرات تسمح بتنفيذ أوامر عن بعد (RCE) واختراق للمخدم.",
      current: "الاعتماديات غير محدثة. Next.js 14.2.35 يحتوي 12 ثغرة معروفة.",
      dependsOn: "npm, package.json",
      fix: "ترقية Next.js إلى v15 (أو v14.x الأحدث)، ترقية imagekit، استبدال xlsx بمكتبة بديلة (مثل exceljs)، ترقية glob, postcss, serialize-javascript, uuid.",
      afterFix: "عدد الثغرات ينخفض إلى 0 (أو 1-2 بدون fix متاح). الموقع يصبح آمناً ضد الهجمات المعروفة.",
      afterDepends: "npm update/upgrade, اختبار شامل بعد الترقية"
    },
    {
      id: "SEC-02",
      title: "ملف .env يحتوي مفاتيح إنتاج حقيقية ومكشوفة",
      desc: "ملف .env في البيئة المحلية يحتوي على مفاتيح حقيقية لـ: Supabase (service_role key), ImageKit Private Key, Brevo SMTP/API, JWT Secrets (64 حرف), Encryption Key, Telegram Bot Token, Upstash Redis Token, JDoodle Client Secret.",
      impact: "كارثية - أي شخص لديه وصول إلى البيئة المحلية يملك كل مفاتيح الموقع.",
      current: "المفاتيح مخزنة بنص واضح في .env",
      dependsOn: "ملف .env, system environment",
      fix: "استخدام dotenv-expand أو vault (مثل Infisical) للمفاتيح الحساسة. تدوير (rotate) كل المفاتيح فوراً. إزالة المفاتيح الحقيقية من .env المحلي واستبدالها بقيم وهمية.",
      afterFix: "البيئة المحلية تستخدم مفاتيح وهمية. المفاتيح الحقيقية فقط على Vercel.",
      afterDepends: "تحديث متغيرات Vercel Environment، اختبار الربط بعد تدوير المفاتيح"
    },
    {
      id: "SEC-03",
      title: "كلمة مرور الأدمن مشفرة بنص واضح في create-admin.mjs",
      desc: "ملف scripts/create-admin.mjs يحتوي كلمة المرور `Tarifa.store.777.nb` بنص واضح.",
      impact: "عالية - الملف موجود في المستودع وأي شخص يطلعه يملك كلمة مرور الأدمن.",
      current: "الكلمة مخزنة hardcoded في الملف.",
      dependsOn: "scripts/create-admin.mjs",
      fix: "إزالة الملف من المستودع (git rm). تغيير كلمة مرور الأدمن فوراً. استخدام متغيرات بيئة أو سؤال تفاعلي.",
      afterFix: "لا يوجد كلمات مرور في الكود المصدري.",
      afterDepends: "تغيير كلمة مرور الأدمن يدوياً"
    }
  ],
  high: [
    {
      id: "BUILD-01",
      title: "10 أخطاء ESLint تمنع الـ build النظيف",
      desc: "توجد 10 أخطاء ESLint (وليس تحذيرات): 3 أخطاء prefer-const في activate/route.ts، 3 أخطاء no-unescaped-entities في صفحات الإدارة، 2 خطأ no-unused-expressions في generation/students و generation/subjects، خطأ no-unused-expressions في promotions/page.tsx.",
      impact: "الأخطاء تمنع مرور الـ lint بنجاح. حاليًا تم تعطيل lint أثناء البناء (ignoreDuringBuilds: true).",
      current: "eslint.ignoreDuringBuilds: true في next.config.mjs - يتم تخطي lint أثناء النشر.",
      dependsOn: "next.config.mjs, ESLint config",
      fix: "إصلاح الـ 10 أخطاء (معظمها بسيط: تغيير let→const، هروب علامات التنصيص في JSX).",
      afterFix: "يمكن تفعيل eslint.ignoreDuringBuilds: false لضمان جودة الكود.",
      afterDepends: "تعديل الملفات المذكورة"
    },
    {
      id: "BUILD-02",
      title: "أكثر من 100 تحذير ESLint (unused vars, missing deps)",
      desc: "توجد أكثر من 100 تحذير ESLint، معظمها unused variables ومفقودات useEffect/useCallback dependencies. بعضها خطير مثل useCallback بدون كل التبعيات يؤدي لجلب بيانات قديمة.",
      impact: "متوسطة-عالية - التحذيرات تخفي مشاكل حقيقية. missing useEffect deps يؤدي لـ stale closures وجلب بيانات خاطئة.",
      current: "التحذيرات موجودة ومتجاهلة.",
      dependsOn: "ملفات tsx/ts في src/",
      fix: "على مراحل: clean up unused variables باستخدام ESLint --fix. إصلاح missing deps حسب أولوية المكون (المستخدم أولاً).",
      afterFix: "كود أنظف وأدق وأقل عرضة للأخطاء.",
      afterDepends: "مراجعة يدوية لكل ملف"
    },
    {
      id: "AUTH-01",
      title: "بعض API endpoints تفتقر التحقق من الصلاحية (Authorization)",
      desc: "بعض مسارات API لا تتحقق من دور المستخدم بشكل كافٍ. مثلاً: /api/settings/* تعتمد فقط على JWT صحيح وليس على دور محدد. /api/promotion/request يسمح للـ MANAGEMENT بالترقية لكن ليس للـ TEACHER.",
      impact: "متوسطة - قد يسمح لمستخدم بصلاحيات أقل بالوصول لوظائف غير مسموحة له.",
      current: "كل route يتحقق من JWT لكن ليس كلها تتحقق من role بشكل دقيق.",
      dependsOn: "JWT middleware, route handlers",
      fix: "إضافة التحقق من getEffectiveRole() أو payload.role في كل route حساس. توحيد نمط التحقق.",
      afterFix: "ضمان وصول كل مستخدم فقط للصلاحيات الممنوحة له.",
      afterDepends: "مراجعة كل route"
    },
    {
      id: "CSRF-01",
      title: "مسارات API غير محمية بـ CSRF (تصل من متصفح المستخدم فقط)",
      desc: "بعض POST/PUT/DELETE endpoints ليست في csrfExemptPaths ولكنها قد تحتاج حماية إضافية. حالياً الـ UI تستخدم csrfFetch() لذلك تعمل بشكل صحيح. لكن بعض الـ endpoints مثل /api/tig/bind/initiate, /api/tig/bind/unbind تستقبل طلبات من البوت مباشرة.",
      impact: "منخفضة حالياً لأن الـ UI تستخدم csrfFetch(). لكن أي كود JavaScript خارجي يرسل طلب POST لهذه المسارات سيفشل بـ 403.",
      current: "الـ middleware تطبق CSRF على كل طلبات POST/PUT/DELETE ما لم تكن في exemptPaths.",
      dependsOn: "middleware.ts, csrfExemptPaths array",
      fix: "إضافة المسارات المطلوبة إلى csrfExemptPaths. حالياً الوضع الحالي آمن.",
      afterFix: "شفافية أكبر في توزيع CSRF exemptions.",
      afterDepends: "تعديل middleware.ts"
    },
    {
      id: "RACE-01",
      title: "ثغرة سباق (Race Condition) محتملة في BotService",
      desc: "رغم إصلاح race condition السابق، لا يزال هناك سيناريو: auto-init في السطر الأخير من BotService.ts لا يُنتظر (ليس فيه await). لو جاء Webhook قبل اكتمال init() قد ينتهي بمشكلة. لكن _initPromise يحمي من هذا الآن.",
      impact: "منخفضة بعد الإصلاح الأخير.",
      current: "محمي بـ _initPromise + _initialized flag.",
      dependsOn: "خادم Vercel Serverless (عدة instances)",
      fix: "مراقبة السجلات للتأكد من عدم تكرار المشكلة. إضافة retry mechanism إذا فشل init().",
      afterFix: "صفر مشاكل توافقية.",
      afterDepends: "اختبار تحت الضغط"
    },
    {
      id: "DB-01",
      title: "فهرس (Index) مفقود على بعض علاقات قاعدة البيانات",
      desc: "بعض الحقول المستخدمة بكثرة في WHERE و ORDER BY ليس لها index: notification.userId, auditLog.userId, auditLog.createdAt, pushSubscription.userId, upload_permissions.userId, session.userId.",
      impact: "متوسطة - مع زيادة عدد المستخدمين ستبطأ الاستعلامات.",
      current: "الـ PKs مفهرسة تلقائياً. الحقول العلائقية الأخرى ليس لها index.",
      dependsOn: "Prisma schema, PostgreSQL",
      fix: "إضافة @@index في Prisma schema على userId في Notification, AuditLog, PushSubscription, UploadPermission. إضافة index على createdAt في AuditLog.",
      afterFix: "تسريع استعلامات البحث والتصفية بنسبة 10x-100x مع البيانات الكبيرة.",
      afterDepends: "إنشاء index يدوي (prisma db push أو SQL)"
    }
  ],
  medium: [
    {
      id: "ENV-01",
      title: "Sentry DSN فارغ - لا يعمل تتبع الأخطاء عن بعد",
      desc: "Sentry DSN في .env فارغ. المشروع يستخدم @sentry/nextjs لكنه لن يرسل أي تقارير أخطاء.",
      impact: "متوسطة - لا توجد رؤية عن أخطاء الإنتاج.",
      current: "Sentry مهيأ لكن غير نشط.",
      dependsOn: "sentry.client.config.ts, .env",
      fix: "إنشاء حساب Sentry (مجاني)، الحصول على DSN، إضافته إلى Vercel env.",
      afterFix: "تقارير أخطاء فورية مع stack traces كاملة.",
      afterDepends: "تسجيل Sentry"
    },
    {
      id: "SEC-04",
      title: "استخدام مكتبة xlsx بثغرة Prototype Pollution لا يوجد لها fix",
      desc: "مكتبة xlsx تعاني من ثغرة Prototype Pollution و ReDoS ولا يوجد fix متاح (ماتت المكتبة).",
      impact: "عالية لكن محدودة - Prototype Pollution قد تؤدي لـ XSS أو تعديل سلوك التطبيق.",
      current: "المشروع يستخدم xlsx لقراءة/كتابة ملفات Excel (لرفع الدرجات).",
      dependsOn: "package.json, GradeService, API routes",
      fix: "استبدال xlsx بمكتبة exceljs أو excel4node مفتوحة المصدر ونشطة.",
      afterFix: "بدون ثغرات معروفة. دعم أفضل لصيغ Excel الحديثة.",
      afterDepends: "إعادة كتابة دوال Reading/Writing Excel"
    },
    {
      id: "CONFIG-01",
      title: "next-pwa يستخدم Workbox قديم بسلسلة إمداد ضعيفة",
      desc: "مكتبة next-pwa تعتمد على workbox-webpack-plugin → workbox-build → rollup-plugin-terser → serialize-javascript (RCE vulnerability).",
      impact: "عالية نظرياً لكن تحتاج ظروف معينة للاستغلال.",
      current: "PWA يعمل بشكل طبيعي لكن بمكتبات قديمة.",
      dependsOn: "package.json, next.config.mjs",
      fix: "استبدال next-pwa بـ @serwist/next.js (البديل الحديث الذي يعمل مع Next.js 14+).",
      afterFix: "PWA محدث بدون ثغرات. دعم أفضل لـ Next.js الحديث.",
      afterDepends: "تعديل next.config.mjs، تثبيت @serwist"
    },
    {
      id: "VALIDATION-01",
      title: "بعض API endpoints تفتقر التحقق من صحة الإدخال (Input Validation)",
      desc: "بعض الـ routes لا تستخدم Zod أو أي validator. مثل: settings/change-password, assignments/delete, chat/send (جزئي).",
      impact: "متوسطة - قد يسمح بإدخال بيانات خاطئة تسبب 500 Internal Server Error.",
      current: "أغلب الـ routes تستخدم Zod لكن بعضها لا.",
      dependsOn: "Zod library, route handlers",
      fix: "إضافة Zod schemas لكل route لا يتحقق من الإدخال.",
      afterFix: "رسائل خطأ واضحة، منع إدخال بيانات خاطئة.",
      afterDepends: "مراجعة كل route"
    },
    {
      id: "RATE-01",
      title: "بعض API endpoints تفتقر تحديد معدل (Rate Limiting)",
      desc: "بعض الـ endpoints لا يوجد عليها rate limit: /api/bind/initiate, /api/bind/unbind, /api/settings/change-email-request, /api/assignments/*.",
      impact: "متوسطة - قد تسمح بهجمات Brute Force أو إغراق (flooding).",
      current: "13 rate limiters موجودة للمسارات الحرجة (login, 2FA, password reset).",
      dependsOn: "src/lib/ratelimit.ts, Redis",
      fix: "إضافة rate limiters للمسارات المتبقية باستخدام @upstash/ratelimit.",
      afterFix: "كل endpoints محمية من Brute Force و DoS.",
      afterDepends: "تعديل كل route"
    },
    {
      id: "IMAGEKIT-01",
      title: "مفتاح ImageKit الخاص مكشوف في البيئة المحلية",
      desc: "IMAGEKIT_PRIVATE_KEY موجود في .env المحلي ويسمح بإدارة كل ملفات التخزين السحابي.",
      impact: "عالية - أي شخص يملك المفتاح يستطيع حذف/رفع/تعديل كل ملفات الموقع.",
      current: "المفتاح موجود بنص واضح.",
      dependsOn: "ImageKit service",
      fix: "تدوير مفتاح ImageKit الخاص. إزالة المفتاح الحقيقي من .env المحلي.",
      afterFix: "مفتاح ImageKit الخاص آمن على Vercel فقط.",
      afterDepends: "تحديث ImageKit Dashboard"
    }
  ],
  low: [
    {
      id: "MONITOR-01",
      title: "عدم وجود مراقبة (Health Check / Monitoring)",
      desc: "لا يوجد نقطة فحص صحة (health check) عامة. لا يوجد مراقبة uptime أو تنبيهات عند توقف الخدمة.",
      dependsOn: "Vercel, Monitoring service",
      fix: "إضافة /api/health route، استخدام UptimeRobot أو BetterUptime للمراقبة.",
      afterFix: "تنبيه فوري عند توقف الخدمة."
    },
    {
      id: "LOGGING-01",
      title: "console.error المستخدمة في بعض الأماكن بدلاً من logger",
      desc: "بعض الملفات تستخدم console.error() بدلاً من logger.error() مثل webhook/route.ts.",
      dependsOn: "logger (Winston)",
      fix: "استبدال console.error بـ logger.error في الملفات المتبقية.",
      afterFix: "سجلات موحدة مع timestamps ومستويات severity."
    },
    {
      id: "TEST-01",
      title: "تغطية اختبارات ضعيفة جداً (Test Coverage ~0%)",
      desc: "يوجد فقط test واحد (usePagination). لا يوجد اختبارات API ولا اختبارات Services ولا اختبارات Components.",
      dependsOn: "Vitest, Testing Library",
      fix: "إضافة اختبارات تدريجياً: أولاً خدمات Auth، ثم API routes، ثم Components.",
      afterFix: "ضمان عدم كسر الوظائف عند التعديل."
    },
    {
      id: "BUILD-03",
      title: "Dynamic server usage logs في الـ build (ليست مشكلة فعلية)",
      desc: "يظهر 15+ سطراً من Dynamic server usage errors أثناء الـ build. هذه رسائل Next.js الإخبارية وليست أخطاء.",
      dependsOn: "Next.js App Router",
      fix: "لا تحتاج إصلاح - هي رسائل إعلامية.",
      afterFix: "N/A"
    }
  ]
};

const phases = [
  {
    title: "المرحلة الأولى: الإصلاحات الحرجة (Critical)",
    duration: "يوم - 3 أيام",
    items: [
      { id: "SEC-01", task: "ترقية الاعتماديات: Next.js, imagekit, xlsx, glob, serialize-javascript" },
      { id: "SEC-02", task: "تدوير كل المفاتيح وإزالتها من .env المحلي - تحديث Vercel Environment" },
      { id: "SEC-03", task: "إزالة create-admin.mjs وتغيير كلمة مرور الأدمن" },
      { id: "IMAGEKIT-01", task: "تدوير مفتاح ImageKit الخاص" }
    ],
    testing: "اختبار تسجيل الدخول، رفع الملفات، الربط مع Telegram، إرسال الإيميلات"
  },
  {
    title: "المرحلة الثانية: إصلاحات عالية الأولوية (High)",
    duration: "3 - 7 أيام",
    items: [
      { id: "BUILD-01", task: "إصلاح 10 أخطاء ESLint" },
      { id: "BUILD-02", task: "تنظيف unused variables و missing deps تدريجياً" },
      { id: "SEC-04", task: "استبدال xlsx بـ exceljs" },
      { id: "CONFIG-01", task: "استبدال next-pwa بـ @serwist" },
      { id: "DB-01", task: "إضافة الفهارس المفقودة في قاعدة البيانات" },
      { id: "CSRF-01", task: "مراجعة csrfExemptPaths" },
      { id: "RATE-01", task: "إضافة rate limiters للمسارات المتبقية" },
      { id: "VALIDATION-01", task: "إضافة Zod validation للمسارات الناقصة" }
    ],
    testing: "اختبار شامل لكل الوظائف: API endpoints، PWA، Excel تحميل، سرعة الاستعلامات"
  },
  {
    title: "المرحلة الثالثة: تحسينات متوسطة (Medium)",
    duration: "3 - 5 أيام",
    items: [
      { id: "ENV-01", task: "تفعيل Sentry" },
      { id: "AUTH-01", task: "مراجعة صلاحيات جميع routes" },
      { id: "RACE-01", task: "مراقبة واختبار BotService تحت الضغط" },
      { id: "MONITOR-01", task: "إضافة Health Check + مراقبة" },
      { id: "LOGGING-01", task: "توحيد نظام logging" },
      { id: "TEST-01", task: "كتابة اختبارات للخدمات الأساسية" }
    ],
    testing: "اختبارات آلية (vitest)، اختبار تحت الضغط"
  }
];

// =============== DOCUMENT BUILDING ===============

const sectionSpacing = { spacing: { before: 400, after: 200 } };
const headingSpacing = { spacing: { before: 300, after: 200 } };

function titlePage() {
  return [
    new Paragraph({ spacing: { before: 3000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "تقرير فحص المشروع", size: 48, bold: true, font: "Cairo" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "CyberSecurty v1.1", size: 36, bold: true, color: "2563EB", font: "Cairo" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({ text: "تحليل الثغرات والمشاكل والأخطاء مع خطة إصلاح متكاملة", size: 24, color: "6B7280", font: "Cairo" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 },
      children: [
        new TextRun({ text: `تاريخ التقرير: ${new Date().toLocaleDateString("ar-YE")}`, size: 20, color: "9CA3AF", font: "Cairo" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "البيئة: محلية (Local) — تم الفحص على Windows + PowerShell", size: 20, color: "9CA3AF", font: "Cairo" }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: "", size: 0 })] }),
  ];
}

function sectionHeading(text, level = 1) {
  const sizes = { 1: 32, 2: 26, 3: 22 };
  const headingMap = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };
  return new Paragraph({
    heading: headingMap[level] || HeadingLevel.HEADING_2,
    spacing: { before: level === 1 ? 600 : 400, after: 200 },
    children: [
      new TextRun({ text, size: sizes[level] || 24, bold: true, font: "Cairo" }),
    ],
  });
}

function normalText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100, ...opts.spacing },
    alignment: opts.alignment,
    children: [
      new TextRun({ text, size: 20, font: "Cairo", ...opts }),
    ],
  });
}

function bulletItem(text, bold = false, opts = {}) {
  return new Paragraph({
    spacing: { after: 60 },
    bullet: { level: 0 },
    children: [
      new TextRun({ text, size: 20, font: "Cairo", bold, ...opts }),
    ],
  });
}

function severityTag(severity) {
  const colors = { critical: "DC2626", high: "EA580C", medium: "CA8A04", low: "6B7280" };
  return new TextRun({
    text: `[${severity.toUpperCase()}]`,
    size: 18,
    bold: true,
    color: colors[severity] || "6B7280",
    font: "Cairo",
  });
}

function findingSection(finding, severity) {
  const items = [];
  
  // Title with severity
  items.push(new Paragraph({
    spacing: { before: 300, after: 100 },
    children: [
      severityTag(severity),
      new TextRun({ text: `  ${finding.id} - ${finding.title}`, size: 22, bold: true, font: "Cairo" }),
    ],
  }));
  
  // Description
  if (finding.desc) {
    items.push(new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: `الوصف: ${finding.desc}`, size: 20, font: "Cairo" })],
    }));
  }
  
  // Impact
  if (finding.impact) {
    items.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "التأثير: ", size: 20, bold: true, font: "Cairo" }),
        new TextRun({ text: finding.impact, size: 20, font: "Cairo" }),
      ],
    }));
  }
  
  // Current
  if (finding.current) {
    items.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "الوضع الحالي: ", size: 20, bold: true, font: "Cairo" }),
        new TextRun({ text: finding.current, size: 20, font: "Cairo" }),
      ],
    }));
  }
  
  // Depends On
  if (finding.dependsOn) {
    items.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "يعتمد على: ", size: 20, bold: true, font: "Cairo" }),
        new TextRun({ text: finding.dependsOn, size: 20, font: "Cairo" }),
      ],
    }));
  }
  
  // Fix
  if (finding.fix) {
    items.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "طريقة الإصلاح: ", size: 20, bold: true, font: "Cairo", color: "059669" }),
        new TextRun({ text: finding.fix, size: 20, font: "Cairo" }),
      ],
    }));
  }
  
  // After Fix
  if (finding.afterFix) {
    items.push(new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "بعد الإصلاح: ", size: 20, bold: true, font: "Cairo", color: "2563EB" }),
        new TextRun({ text: finding.afterFix, size: 20, font: "Cairo" }),
      ],
    }));
  }
  
  // After Depends
  if (finding.afterDepends) {
    items.push(new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "يعتمد بعد الإصلاح على: ", size: 20, bold: true, font: "Cairo" }),
        new TextRun({ text: finding.afterDepends, size: 20, font: "Cairo" }),
      ],
    }));
  }
  
  items.push(new Paragraph({
    spacing: { before: 100 },
    children: [new TextRun({ text: "─".repeat(60), size: 16, color: "D1D5DB" })],
  }));
  
  return items;
}

function phaseSection(phase) {
  const items = [];
  
  items.push(new Paragraph({
    spacing: { before: 400, after: 100 },
    children: [
      new TextRun({ text: phase.title, size: 24, bold: true, font: "Cairo" }),
    ],
  }));
  
  items.push(new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `المدة المتوقعة: ${phase.duration}`, size: 20, font: "Cairo", color: "6B7280" }),
    ],
  }));
  
  items.push(new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: "المهام:", size: 20, bold: true, font: "Cairo" }),
    ],
  }));
  
  for (const item of phase.items) {
    items.push(new Paragraph({
      spacing: { after: 60 },
      bullet: { level: 0 },
      children: [
        new TextRun({ text: `${item.id}: `, size: 20, bold: true, color: "DC2626", font: "Cairo" }),
        new TextRun({ text: item.task, size: 20, font: "Cairo" }),
      ],
    }));
  }
  
  items.push(new Paragraph({
    spacing: { before: 100, after: 200 },
    children: [
      new TextRun({ text: `اختبارات: ${phase.testing}`, size: 20, color: "6B7280", font: "Cairo" }),
    ],
  }));
  
  items.push(new Paragraph({
    children: [new TextRun({ text: "═".repeat(60), size: 16, color: "9CA3AF" })],
  }));
  
  return items;
}

// =============== BUILD THE DOCUMENT ===============

const children = [];

// Title page
children.push(...titlePage());
children.push(new Paragraph({ children: [new PageBreak()] }));

// Table of Contents
children.push(sectionHeading("فهرس المحتويات", 1));
children.push(normalText("(في Microsoft Word: اضغط على جدول المحتويات بزر الفأرة الأيمن ← تحديث الحقل)"));
children.push(new Paragraph({ children: [new PageBreak()] }));

// Executive Summary
children.push(sectionHeading("ملخص تنفيذي", 1));
children.push(normalText("تم إجراء فحص شامل لمشروع CyberSecurty v1.1 على البيئة المحلية. شمل الفحص:"));

const summaryItems = [
  "فحص أمني للاعتماديات (npm audit) - 13 ثغرة",
  "فحص ESLint - 10 أخطاء + 100+ تحذير",
  "فحص الثغرات الأمنية (مفاتيح مكشوفة، صلاحيات، CSRF، XSS)",
  "فحص قاعدة البيانات (فهارس، علاقات)",
  "فحص المشاكل المنطقية (Race conditions، Error handling)",
  "فحص الإعدادات والتهيئة (Middleware، CSRF، البيئة)"
];
for (const item of summaryItems) {
  children.push(bulletItem(item));
}

children.push(normalText(""));
children.push(normalText(`إجمالي المشاكل: ${Object.values(findings).flat().length} مشكلة`));

const LEVEL_DESCRIPTIONS = {
  critical: "يؤثر على أمن الموقع بشكل مباشر",
  high: "يؤثر على الأداء أو الأمان لكن ليس بشكل مباشر",
  medium: "تحسينات وجودة الكود",
  low: "إضافات وتحسينات غير حرجة",
};

// Summary table
const severityCounts = {};
for (const [sev, arr] of Object.entries(findings)) {
  severityCounts[sev] = arr.length;
}

const summaryTable = new Table({
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "المستوى", bold: true, size: 20, font: "Cairo" })] })], width: { size: 33, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "العدد", bold: true, size: 20, font: "Cairo" })] })], width: { size: 33, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "الوصف", bold: true, size: 20, font: "Cairo" })] })], width: { size: 34, type: WidthType.PERCENTAGE } }),
      ],
    }),
    ...Object.entries(severityCounts).map(([sev, count]) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [severityTag(sev)] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(count), size: 20, font: "Cairo" })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: LEVEL_DESCRIPTIONS[sev] || "", size: 20, font: "Cairo" })] })] }),
        ],
      })
    ),
  ],
});
children.push(summaryTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// Full Findings
children.push(sectionHeading("نتائج الفحص التفصيلية", 1));

// Critical
children.push(sectionHeading("أولاً: مشاكل حرجة (Critical)", 2));
for (const f of findings.critical) {
  children.push(...findingSection(f, "critical"));
}

// High
children.push(sectionHeading("ثانياً: مشاكل عالية الأولوية (High)", 2));
for (const f of findings.high) {
  children.push(...findingSection(f, "high"));
}

// Medium
children.push(sectionHeading("ثالثاً: مشاكل متوسطة (Medium)", 2));
for (const f of findings.medium) {
  children.push(...findingSection(f, "medium"));
}

// Low
children.push(sectionHeading("رابعاً: مشاكل منخفضة (Low)", 2));
for (const f of findings.low) {
  children.push(...findingSection(f, "low"));
}

children.push(new Paragraph({ children: [new PageBreak()] }));

// Remediation Plan
children.push(sectionHeading("خطة الإصلاح على مراحل", 1));
children.push(normalText("الخطة مصممة للتنفيذ على البيئة المحلية أولاً، ثم الاختبار، ثم الرفع إلى المستودع والنشر."));

for (const phase of phases) {
  children.push(...phaseSection(phase));
}

children.push(new Paragraph({ children: [new PageBreak()] }));

// Summary of key files
children.push(sectionHeading("ملخص الملفات المتأثرة", 1));
children.push(normalText("الملفات التي تحتاج تعديل للإصلاحات:"));

const allFiles = [
  { file: "package.json", issues: "ترقية الاعتماديات (Next.js, xlsx, glob, serialize-javascript, next-pwa)", phase: 1 },
  { file: "next.config.mjs", issues: "إزالة eslint.ignoreDuringBuilds بعد إصلاح الأخطاء، استبدال next-pwa بـ @serwist", phase: 1 },
  { file: ".env", issues: "إزالة المفاتيح الحقيقية واستخدام وهمية", phase: 1 },
  { file: "scripts/create-admin.mjs", issues: "إزالة الملف من المستودع", phase: 1 },
  { file: "src/middleware.ts", issues: "مراجعة csrfExemptPaths", phase: 2 },
  { file: "prisma/schema.prisma", issues: "إضافة @@index على حقول userId و createdAt", phase: 2 },
  { file: "src/lib/ratelimit.ts", issues: "إضافة rate limiters جديدة", phase: 2 },
  { file: "src/services/academic/GradeService.ts", issues: "استبدال xlsx بـ exceljs", phase: 2 },
  { file: "src/sentry.*.config.ts", issues: "تفعيل Sentry", phase: 3 },
  { file: "20+ صفحات tsx", issues: "إصلاح ESLint errors + warnings", phase: 2 },
];

const fileTableRows = [
  new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "الملف", bold: true, size: 18, font: "Cairo" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "المشكلة", bold: true, size: 18, font: "Cairo" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "المرحلة", bold: true, size: 18, font: "Cairo" })] })] }),
    ],
  }),
  ...allFiles.map(f =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f.file, size: 18, font: "Cairo" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f.issues, size: 18, font: "Cairo" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(f.phase), size: 18, font: "Cairo" })] })] }),
      ],
    })
  ),
];

children.push(new Table({ rows: fileTableRows }));

// Generate DOCX
const doc = new Document({
  title: "تقرير فحص مشروع CyberSecurty",
  description: "تحليل الثغرات والمشاكل والأخطاء مع خطة إصلاح متكاملة",
  styles: {
    default: {
      document: {
        run: { font: "Cairo", size: 20 },
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
  const outPath = "AUDIT_REPORT_AR.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Report saved to: ${outPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
