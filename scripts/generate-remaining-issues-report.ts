const docx = require("docx");
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType, convertInchesToTwip, PageBreak } = docx;

// ======================== DATA ========================

const vulns = [
  {
    id: "VULN-01", severity: "HIGH", group: "Next.js (14 ثغرة)",
    desc: "14 ثغرة في Next.js 14.2.35 (7 عالية + 4 متوسطة + 3 منخفضة). أخطرها: SSRF عبر WebSocket (CVSS 8.6), DoS عبر Server Components (3 ثغرات), Authorization bypass عبر i18n, XSS عبر CSP nonces و beforeInteractive scripts, Cache Poisoning في RSC, HTTP request smuggling.",
    impact: "يسمح للمهاجم بتنفيذ طلبات إلى خوادم داخلية (SSRF)، تعطيل المخدم (DoS)، تجاوز صلاحيات الصفحات، سرقة بيانات، خداع ذاكرة التخزين المؤقت",
    chain: "cyber-security-cloud ← next@14.2.35 (مباشر)",
    fix: "ترقية Next.js إلى v16.2.9. هذا يصلح كل الـ 14 ثغرة بالإضافة لترقية postcss المضمن.",
    afterFix: "جميع الثغرات تختفي. postcss يترقى أيضاً. الموقع يصبح محمياً ضد SSRF, DoS, XSS, Cache Poisoning, Request Smuggling.",
    dependsAfter: "ترقية @sentry/nextjs للإصدار المتوافق مع v16. استبدال next-pwa بـ @serwist/next.js. اختبار شامل لجميع الصفحات والـ API routes."
  },
  {
    id: "VULN-02", severity: "HIGH", group: "serialize-javascript RCE",
    desc: "ثغرة RCE (Remote Code Execution) في serialize-javascript@4.0.0 عبر سلسلة: next-pwa → workbox-webpack-plugin → workbox-build → rollup-plugin-terser → serialize-javascript. CVSS 8.1.",
    impact: "تنفيذ أوامر ضارة على المخدم أثناء البناء (build time). المهاجم يمكنه حقن كود JavaScript عبر RegExp pattern.",
    chain: "cyber-security-cloud ← next-pwa@5.6.0 ← workbox-webpack-plugin@6.6.0 ← workbox-build@6.6.0 ← rollup-plugin-terser@7.0.2 ← serialize-javascript@4.0.0",
    fix: "استبدال next-pwa@5.6.0 بـ @serwist/next.js (البديل الحديث الذي يستخدم @rollup/plugin-terser بدلاً من rollup-plugin-terser القديم).",
    afterFix: "5 ثغرات عالية تختفي (serialize-javascript, rollup-plugin-terser, workbox-build, workbox-webpack-plugin, next-pwa). PWA يستمر في العمل بمكتبة حديثة.",
    dependsAfter: "تعديل next.config.mjs لإزالة next-pwa وإضافة @serwist. تعديل ملفات PWA/push-sw.js. اختبار الـ Service Worker."
  },
  {
    id: "VULN-03", severity: "HIGH", group: "xlsx (بدون fix)",
    desc: "مكتبة xlsx@0.18.5 بها ثغرتان عاليتان: Prototype Pollution (تلوث Object.prototype يمكن أن يؤدي XSS) و ReDoS (استهلاك CPU لا نهائي عبر ملف Excel ضار). لا يوجد fix متاح — المكتبة ماتت (غير نشطة).",
    impact: "رفع ملف Excel ضار من قبل طالب/معلم يمكنه تلويث prototype أو تعطيل المخدم.",
    chain: "cyber-security-cloud ← xlsx@0.18.5 (مباشر) — مستخدم فقط في GradeService.ts (ملف واحد)",
    fix: "استبدال xlsx بـ exceljs (مكتبة نشطة، بدون ثغرات، دعم أفضل لـ Excel الحديث). إعادة كتابة extractTextFromExcel() في GradeService.ts.",
    afterFix: "ثغرات Prototype Pollution و ReDoS تختفي. دعم أفضل لصيغ Excel. API مختلف لكن الوظيفة واحدة.",
    dependsAfter: "تعديل GradeService.ts. اختبار رفع ملفات Excel في صفحة teacher/grades."
  },
  {
    id: "VULN-04", severity: "MODERATE", group: "uuid في imagekit",
    desc: "uuid@<11.1.1 المضمن داخل imagekit@6.0.0 به ثغرة Missing buffer bounds check في دوال v3/v5/v6. CVSS 7.5.",
    impact: "منخفضة — المشروع لا يستخدم دوال uuid v3/v5/v6 مباشرة. uuid@14.x في package.json سليم.",
    chain: "cyber-security-cloud ← imagekit@6.0.0 ← uuid@<11.1.1 (داخل node_modules/imagekit)",
    fix: "انتظار تحديث imagekit لإصدار uuid أحدث. أو استخدام overrides في package.json: \"overrides\": { \"uuid\": \"^11.1.1\" }",
    afterFix: "uuid المضمن يترقى إلى >=11.1.1. بدون تغيير في وظائف رفع الملفات.",
    dependsAfter: "تعديل package.json. اختبار رفع الملفات عبر ImageKit."
  }
];

const eslintWarnings = [
  { count: "~40", rule: "@typescript-eslint/no-unused-vars", desc: "متغيرات ومكتبات مستوردة لكن غير مستخدمة. بعضها خطير مثل وظائف مرتبطة بـ UI و Chat لا تعمل.",
    files: ["admin/activated-accounts/page.tsx", "admin/audit-log/page.tsx", "admin/bot-control/page.tsx", "admin/generation/management/page.tsx", "admin/generation/page.tsx", "admin/page.tsx", "admin/security-radar/page.tsx", "chat/page.tsx", "login/page.tsx", "notifications/page.tsx", "teacher/page.tsx", "library/page.tsx", "+25 ملفاً آخر"],
    fix: "حذف المتغيرات غير المستخدمة. للمتغيرات المربوطة بـ UI (مثل toggleSelect) التأكد من أنها تستخدم فعلاً في JSX." },
  { count: "~25", rule: "react-hooks/exhaustive-deps", desc: "useEffect/useCallback تنقصها تبعيات (dependencies). يسبب stale closures — جلب بيانات قديمة، عدم استجابة للتغييرات.",
    files: ["admin/promotions/page.tsx", "admin/audit-log/page.tsx", "chat/page.tsx", "teacher/page.tsx", "student/page.tsx", "library/page.tsx", "notifications/page.tsx", "components/ui/FloatingBell.tsx", "hooks/useApi.ts", "hooks/useUploadModal.ts", "+15 ملفاً آخر"],
    fix: "إضافة التبعيات المفقودة لكل useEffect/useCallback. استخدم useRef للقيم التي لا تريد إعادة تشغيل التأثير عند تغيرها." },
  { count: "2", rule: "@next/next/no-img-element", desc: "استخدام <img> بدلاً من <Image> من next/image — يفقد تحسين الصور (lazy loading, WebP تلقائي, responsive sizes).",
    files: ["components/library/ContentCard.tsx:139", "components/settings/TwoFATab.tsx:371"],
    fix: "استبدال <img> بـ <Image> من next/image مع إضافة width/height أو fill." }
];

const securityIssues = [
  {
    id: "SEC-01", severity: "HIGH",
    title: "بعض API endpoints تفتقر التحقق الكافي من الصلاحية (Authorization)",
    desc: "بعض routes تعتمد فقط على JWT صحيح وليس على دور المستخدم. مثل /api/settings/* يسمح لأي مستخدم مسجل. /api/promotion/request يسمح للـ MANAGEMENT بالترقية لكن ليس للـ TEACHER.",
    files: ["src/app/api/settings/*", "src/app/api/promotion/*", "مسارات API أخرى"],
    fix: "إضافة التحقق من getEffectiveRole() أو payload.role في كل route حساس. توحيد نمط التحقق بإنشاء middleware مشترك."
  },
  {
    id: "SEC-02", severity: "MEDIUM",
    title: "بعض POST/PUT/DELETE endpoints تفتقر Rate Limiting",
    desc: "13 rate limiter موجودة للمسارات الحرجة (login, 2FA, password reset). لكن مسارات مثل /api/bind/initiate, /api/bind/unbind, /api/settings/change-email-request, /api/assignments/* ليس عليها حماية.",
    files: ["src/app/api/tig/bind/initiate/route.ts", "src/app/api/tig/bind/unbind/route.ts", "src/app/api/settings/change-email-request/route.ts", "src/app/api/assignments/*"],
    fix: "إضافة rate limiter لكل مسار باستخدام @upstash/ratelimit الموجود فعلاً في المشروع."
  },
  {
    id: "SEC-03", severity: "MEDIUM",
    title: "بعض API endpoints تفتقر التحقق من صحة الإدخال (Input Validation)",
    desc: "بعض الـ routes لا تستخدم Zod أو أي validator. مثل settings/change-password, assignments/delete, chat/send (جزئي).",
    files: ["src/app/api/settings/change-password/route.ts", "src/app/api/assignments/delete/route.ts", "src/app/api/chat/send/route.ts"],
    fix: "إضافة Zod schemas لكل route لا يتحقق من الإدخال. المشروع يستخدم Zod بالفعل في معظم الأماكن."
  },
  {
    id: "SEC-04", severity: "LOW",
    title: "Sentry DSN فارغ — تتبع الأخطاء عن بعد لا يعمل",
    desc: "Sentry مهيأ في المشروع (@sentry/nextjs) لكن DSN في .env فارغ. لا تصل تقارير أخطاء من الإنتاج.",
    files: [".env", "sentry.client.config.ts", "sentry.server.config.ts"],
    fix: "إنشاء حساب Sentry مجاني، الحصول على DSN، إضافته إلى Vercel Environment Variables."
  }
];

const dbIssues = [
  {
    id: "DB-01", severity: "MEDIUM",
    title: "فهارس (Indexes) مفقودة على علاقات قاعدة البيانات",
    desc: "بعض الحقول المستخدمة بكثرة في WHERE و ORDER BY ليس لها index: notification.userId, auditLog.userId, auditLog.createdAt, pushSubscription.userId, upload_permissions.userId, session.userId.",
    fix: "إضافة @@index في Prisma schema على userId في Notification, AuditLog, PushSubscription, UploadPermission. إضافة index على createdAt في AuditLog.",
    sql: `CREATE INDEX IF NOT EXISTS idx_notification_userId ON "notification"("userId");
CREATE INDEX IF NOT EXISTS idx_auditLog_userId ON "auditLog"("userId");
CREATE INDEX IF NOT EXISTS idx_auditLog_createdAt ON "auditLog"("createdAt");
CREATE INDEX IF NOT EXISTS idx_pushSubscription_userId ON "pushSubscription"("userId");
CREATE INDEX IF NOT EXISTS idx_upload_permissions_userId ON "upload_permissions"("userId");`
  },
  {
    id: "DB-02", severity: "LOW",
    title: "BindingStatus enum لا يزال بحاجة تأكيد",
    desc: "تم إنشاء BindingStatus enum في PostgreSQL يدوياً. يجب التأكد من أنه موجود لكل البيئات وأن Prisma schema يعكس ذلك.",
    fix: "تشغيل prisma db pull لسحب enum إلى Prisma schema. أو إضافة enum يدوياً في schema.prisma."
  }
];

const configIssues = [
  {
    id: "CFG-01", severity: "LOW",
    title: "eslint.ignoreDuringBuilds: true",
    desc: "حالياً lint معطل أثناء البناء. تم إصلاح كل الأخطاء (21 error → 0). يمكن الآن إزالة هذا الإعداد.",
    fix: "حذف eslint.ignoreDuringBuilds من next.config.mjs أو تغييره إلى false."
  },
  {
    id: "CFG-02", severity: "LOW",
    title: "NEXT_PUBLIC_APP_URL به أسطر جديدة (trailing newlines)",
    desc: "متغير NEXT_PUBLIC_APP_URL في Vercel قد يحتوي newline في نهايته بسبب PowerShell piping.",
    fix: "تحديث متغير البيئة في Vercel Dashboard والتأكد من عدم وجود newlines."
  },
  {
    id: "CFG-03", severity: "LOW",
    title: "ملف tmp_check_type.sql موجود في المستودع",
    desc: "ملف تجريبي tmp_check_type.sql تم رفعه مع commit سابق. يجب حذفه وإضافته إلى .gitignore.",
    fix: "git rm tmp_check_type.sql وإضافته إلى .gitignore."
  }
];

const performanceIssues = [
  {
    id: "PERF-01", severity: "MEDIUM",
    title: "تحميل Three.js في bundle حتى في الصفحات الداخلية",
    desc: "رغم إصلاح منطق المسارات (الآن الكرة تظهر فقط في الصفحات العامة)، Three.js library لا يزال يُحمل كـ chunk في bundle. dynamic import يمنع تحميله إلا عند الحاجة.",
    status: "مُعالَج — dynamic() مع ssr:false يضمن تحميل Three.js فقط في الصفحات العامة."
  },
  {
    id: "PERF-02", severity: "LOW",
    title: "صورة الخلفية 1.5MB قبل التحسين",
    desc: "تم تحويل PNG إلى WebP (1.5MB → 64KB). تحسين بنسبة 96%.",
    status: "مُعالَج — WebP 64KB + البارالاكس بالماوس."
  },
  {
    id: "PERF-03", severity: "LOW",
    title: "عدة إعادة تخطيط (Layout Shifts) أثناء التنقل",
    desc: "تم إزالة y/scale من PageTransition (0.5s → 0.15s opacity only). تم إضافة شريط تقدم NavigationProgress.",
    status: "مُعالَج"
  }
];

const missingFeatures = [
  {
    id: "FEAT-01", severity: "LOW",
    title: "لا يوجد Health Check endpoint",
    desc: "لا يوجد route للتحقق من صحة المخدم (/api/health). لا يمكن لأنظمة المراقبة (UptimeRobot, BetterUptime) التحقق من أن الموقع يعمل.",
    fix: "إنشاء /api/health route يعيد { status: 'ok', timestamp }."
  },
  {
    id: "FEAT-02", severity: "LOW",
    title: "تغطية اختبارات شبه معدومة (Test Coverage ~0%)",
    desc: "يوجد اختبار واحد فقط (usePagination.test.ts). لا اختبارات API, Services, Components.",
    fix: "إضافة اختبارات تدريجياً: أولاً Auth services، ثم API routes، ثم Components."
  },
  {
    id: "FEAT-03", severity: "LOW",
    title: "console.error في بعض الأماكن بدلاً من logger",
    desc: "بعض الملفات تستخدم console.error() بدلاً من logger.error() مثل webhook/route.ts.",
    fix: "استبدال console.error بـ logger.error في الملفات المتبقية."
  }
];

// ======================== BUILD DOCUMENT ========================

const sectionSpacing = { spacing: { before: 400, after: 200 } };

function titlePage() {
  return [
    new Paragraph({ spacing: { before: 2500 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "سحابة الأمن السيبراني - تقرير الثغرات والمشاكل المتبقية", size: 44, bold: true, font: "Cairo" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [new TextRun({ text: "CyberSecurty v1.1", size: 32, bold: true, color: "2563EB", font: "Cairo" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [new TextRun({ text: `تاريخ التقرير: ${new Date().toLocaleDateString("ar-YE")}`, size: 22, color: "6B7280", font: "Cairo" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
      children: [new TextRun({ text: "المرحلة: ما بعد الإصلاحات الأولية", size: 20, color: "9CA3AF", font: "Cairo" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
      children: [new TextRun({ text: "تم إصلاح: 21 ESLint error, eslint-config-next v16, ScanLine, منطق المسارات, خلفية الصفحات الداخلية", size: 18, color: "22C55E", font: "Cairo" })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function sectionHeading(text, level = 1) {
  const sizes = { 1: 30, 2: 24, 3: 20 };
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: level === 1 ? 500 : 350, after: 200 },
    children: [new TextRun({ text, size: sizes[level] || 24, bold: true, font: "Cairo" })],
  });
}

function normalText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    alignment: opts.alignment,
    children: [new TextRun({ text, size: 18, font: "Cairo", ...opts })],
  });
}

function bulletItem(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 60 },
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 18, font: "Cairo", ...opts })],
  });
}

function severityTag(severity) {
  const colors = { HIGH: "DC2626", MEDIUM: "CA8A04", LOW: "6B7280" };
  return new TextRun({ text: `[${severity}]`, size: 16, bold: true, color: colors[severity] || "6B7280", font: "Cairo" });
}

function vulnSection(v) {
  const items = [];
  items.push(new Paragraph({
    spacing: { before: 280, after: 80 },
    children: [severityTag(v.severity), new TextRun({ text: `  ${v.id} — ${v.group}`, size: 20, bold: true, font: "Cairo" })],
  }));
  items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `الوصف: ${v.desc}`, size: 18, font: "Cairo" })] }));
  items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `التأثير: ${v.impact}`, size: 18, font: "Cairo" })] }));
  items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `سلسلة الاعتماديات: ${v.chain}`, size: 18, font: "Cairo" })] }));
  items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `طريقة الإصلاح: `, size: 18, bold: true, font: "Cairo", color: "059669" }), new TextRun({ text: v.fix, size: 18, font: "Cairo" })] }));
  items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `بعد الإصلاح: ${v.afterFix}`, size: 18, font: "Cairo" })] }));
  items.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `يعتمد على: ${v.dependsAfter}`, size: 18, font: "Cairo" })] }));
  items.push(new Paragraph({ children: [new TextRun({ text: "─".repeat(50), size: 14, color: "D1D5DB" })] }));
  return items;
}

function issueSection(issue, withBorder = true) {
  const items = [];
  items.push(new Paragraph({
    spacing: { before: 250, after: 80 },
    children: [severityTag(issue.severity), new TextRun({ text: `  ${issue.id} — ${issue.title}`, size: 20, bold: true, font: "Cairo" })],
  }));
  if (issue.desc) items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `الوصف: ${issue.desc}`, size: 18, font: "Cairo" })] }));
  if (issue.files) items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `الملفات المتأثرة: ${issue.files.join(", ")}`, size: 18, font: "Cairo" })] }));
  if (issue.fix) items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `طريقة الإصلاح: `, size: 18, bold: true, font: "Cairo", color: "059669" }), new TextRun({ text: issue.fix, size: 18, font: "Cairo" })] }));
  if (issue.sql) items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `SQL: ${issue.sql}`, size: 18, font: "Cairo" })] }));
  if (issue.status) items.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `الحالة: ${issue.status}`, size: 18, font: "Cairo" })] }));
  if (withBorder) items.push(new Paragraph({ children: [new TextRun({ text: "─".repeat(50), size: 14, color: "D1D5DB" })] }));
  return items;
}

// ======================== CHILDREN ========================
const children = [];
children.push(...titlePage());

// Executive Summary
children.push(sectionHeading("ملخص تنفيذي", 1));
children.push(normalText("بعد تنفيذ الإصلاحات الأولية (ESLint errors, eslint-config-next, ScanLine, منطق المسارات, خلفية الصفحات الداخلية)، لا يزال الموقع يحتاج إصلاحات إضافية:"));

const summaryTable = new Table({
  rows: [
    new TableRow({ tableHeader: true, children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "الفئة", bold: true, size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })], width: { size: 25, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "العدد", bold: true, size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })], width: { size: 15, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "أعلى خطورة", bold: true, size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })], width: { size: 25, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "وقت الإصلاح التقديري", bold: true, size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })], width: { size: 35, type: WidthType.PERCENTAGE } }),
    ]}),
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ثغرات npm", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "10", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [severityTag("HIGH"), new TextRun({ text: " 7 عالية", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3-7 أيام", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
    ]}),
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "تحذيرات ESLint", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "~68", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "متوسطة", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3-5 أيام", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
    ]}),
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ثغرات أمنية (API)", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "4", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "عالية", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2-4 أيام", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
    ]}),
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "قاعدة البيانات", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "متوسطة", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1 يوم", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
    ]}),
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "الإعدادات (Config)", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "منخفضة", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "نصف يوم", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
    ]}),
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ميزات مفقودة", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "منخفضة", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2-4 أيام", size: 18, font: "Cairo" })], alignment: AlignmentType.CENTER })] }),
    ]}),
  ],
});
children.push(summaryTable);
children.push(new Paragraph({ children: [new PageBreak()] }));

// Section 1: npm Vulnerabilities
children.push(sectionHeading("أولاً: ثغرات npm المتبقية (10)", 1));
children.push(normalText(`بعد الترقيات السابقة (eslint-config-next v16, imagekit@latest): 10 ثغرات متبقية — 7 عالية, 3 متوسطة.`));
for (const v of vulns) children.push(...vulnSection(v));
children.push(new Paragraph({ children: [new PageBreak()] }));

// Section 2: ESLint Warnings
children.push(sectionHeading("ثانياً: تحذيرات ESLint (~68)", 1));
children.push(normalText(`تم إصلاح كل الأخطاء (21 → 0). التالي هي تحذيرات فقط (لا تمنع الـ build) لكنها تخفي مشاكل حقيقية:`));
for (const w of eslintWarnings) {
  children.push(new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: `⚠ ${w.rule} (${w.count} تحذير)`, size: 20, bold: true, font: "Cairo" })],
  }));
  children.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: w.desc, size: 18, font: "Cairo" })] }));
  if (w.files) children.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `نماذج من الملفات: ${w.files.slice(0, 6).join("، ")}…`, size: 18, font: "Cairo" })] }));
  children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `الإصلاح: ${w.fix}`, size: 18, font: "Cairo" })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: "─".repeat(50), size: 14, color: "D1D5DB" })] }));
}
children.push(new Paragraph({ children: [new PageBreak()] }));

// Section 3: Security Issues
children.push(sectionHeading("ثالثاً: ثغرات أمنية في API", 1));
for (const s of securityIssues) children.push(...issueSection(s));

// Section 4: Database
children.push(sectionHeading("رابعاً: مشاكل قاعدة البيانات", 1));
for (const d of dbIssues) children.push(...issueSection(d));
children.push(new Paragraph({ children: [new PageBreak()] }));

// Section 5: Config Issues
children.push(sectionHeading("خامساً: مشاكل الإعدادات (Configuration)", 1));
for (const c of configIssues) children.push(...issueSection(c));

// Section 6: Performance
children.push(sectionHeading("سادساً: تحسينات الأداء", 1));
for (const p of performanceIssues) children.push(...issueSection(p, false));
children.push(new Paragraph({ children: [new PageBreak()] }));

// Section 7: Missing Features
children.push(sectionHeading("سابعاً: ميزات مفقودة", 1));
for (const f of missingFeatures) children.push(...issueSection(f));

// Build document
const doc = new Document({
  title: "تقرير الثغرات والمشاكل المتبقية - سحابة الأمن السيبراني",
  description: "تحليل الثغرات والمشاكل المتبقية بعد الإصلاحات الأولية",
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
  const outPath = "REMAINING_ISSUES_REPORT.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Report saved to: ${outPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
