import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, WidthType, BorderStyle,
    PageBreak, Header, Footer, PageNumber, TabStopPosition, TabStopType
} from "docx";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_PATH = path.join(import.meta.dirname, "..", "MASTER_PROJECT_AUDIT_REPORT_AR.docx");

function createReport(): Document {
    return new Document({
        title: "تقرير التدقيق الشامل للمشروع",
        description: "مشروع سحابة الأمن السيبراني - تقرير التدقيق والإصلاح",
        styles: {
            default: {
                document: {
                    run: {
                        font: "Times New Roman",
                        size: 24,
                    },
                },
            },
        },
        sections: [
            // =============== COVER PAGE ===============
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                    },
                },
                children: [
                    new Paragraph({ spacing: { before: 4800 }, children: [] }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "تقرير التدقيق الشامل للمشروع",
                                bold: true,
                                size: 48,
                                color: "1a237e",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    new Paragraph({ spacing: { before: 600 }, children: [] }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Master Project Audit & Remediation Report",
                                size: 28,
                                color: "546e7a",
                                italics: true,
                            }),
                        ],
                    }),
                    new Paragraph({ spacing: { before: 1200 }, children: [] }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "سحابة الأمن السيبراني",
                                bold: true,
                                size: 36,
                                color: "c62828",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "CyberSecurity Cloud",
                                size: 24,
                                color: "78909c",
                            }),
                        ],
                    }),
                    new Paragraph({ spacing: { before: 1200 }, children: [] }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "تاريخ الفحص: 14 يونيو 2026",
                                size: 22,
                                color: "37474f",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "إصدار التقرير: v1.0",
                                size: 22,
                                color: "37474f",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "نوع الفحص: تدقيق شامل - Enterprise Level Audit",
                                size: 22,
                                color: "37474f",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                ],
            },

            // =============== EXECUTIVE SUMMARY ===============
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                    },
                },
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: "الملخص التنفيذي",
                                bold: true,
                                size: 32,
                                color: "1a237e",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: "تم إجراء تدقيق شامل وعميق (Enterprise Audit) على مشروع سحابة الأمن السيبراني وفق أحدث المعايير العالمية: OWASP Top 10, OWASP ASVS, CWE, SANS Top 25, و MITRE ATT&CK. شمل التدقيق تحليل البنية المعمارية، جودة الكود، الأمان السيبراني، الأداء، قاعدة البيانات، واجهات المستخدم، والبنية التحتية.",
                                size: 22,
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    new Paragraph({ spacing: { before: 400 }, children: [] }),

                    // Scoring table
                    new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: "التقييم العام للمشروع",
                                bold: true,
                                size: 26,
                                color: "283593",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    createScoreTable(),
                    new Paragraph({ spacing: { before: 400 }, children: [] }),

                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: "النتيجة الإجمالية: 47/100 — يحتاج المشروع إلى إصلاحات جوهرية قبل الإطلاق الإنتاجي.",
                                bold: true,
                                size: 24,
                                color: "c62828",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    new Paragraph({ spacing: { before: 400 }, children: [] }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: "إجمالي الثغرات والمشاكل المكتشفة: 69",
                                bold: true,
                                size: 22,
                                color: "37474f",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    ...createSummaryBullets(),
                ],
            },

            // =============== STATISTICS ===============
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                    },
                },
                children: [
                    ...createStatsSection(),
                ],
            },

            // =============== FINDINGS ===============
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                    },
                },
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: "سجل الثغرات والمشاكل البرمجية",
                                bold: true,
                                size: 32,
                                color: "1a237e",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    ...createAllFindings(),
                ],
            },

            // =============== REMEDIATION PLAN ===============
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                    },
                },
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: "خطة الإصلاح المرحلية",
                                bold: true,
                                size: 32,
                                color: "1a237e",
                                font: "Traditional Arabic",
                            }),
                        ],
                    }),
                    ...createRemediationPlan(),
                ],
            },
        ],
    });
}

function createScoreTable(): Table {
    const header = (text: string) =>
        new TableCell({
            children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text, bold: true, size: 20, color: "ffffff" })]
            })],
            shading: { fill: "1a237e" },
        });
    const row = (label: string, score: number) => [
        new TableCell({
            children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: label, size: 20, font: "Traditional Arabic" })]
            })],
        }),
        new TableCell({
            children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${score}/100`, bold: true, size: 20,
                    color: score < 50 ? "c62828" : score < 70 ? "f57f17" : "2e7d32" })]
            })],
        }),
    ];

    return new Table({
        rows: [
            new TableRow({
                children: [header("المحور"), header("الدرجة")],
                tableHeader: true,
            }),
            new TableRow({ children: row("الأمان (Security)", 35) }),
            new TableRow({ children: row("الأداء (Performance)", 55) }),
            new TableRow({ children: row("جودة الكود (Code Quality)", 50) }),
            new TableRow({ children: row("قابلية الصيانة (Maintainability)", 45) }),
            new TableRow({ children: row("قابلية التوسع (Scalability)", 40) }),
            new TableRow({ children: row("الاستقرار (Stability)", 50) }),
            new TableRow({ children: row("واجهة المستخدم (UX)", 60) }),
            new TableRow({ children: row("قاعدة البيانات (Database)", 55) }),
            new TableRow({ children: row("البنية التحتية (DevOps)", 30) }),
        ],
    });
}

function createSummaryBullets(): Paragraph[] {
    const items = [
        { text: "6 ثغرات حرجة (Critical) — تتطلب تدخلاً فورياً", color: "c62828" },
        { text: "14 ثغرة عالية الخطورة (High)", color: "e65100" },
        { text: "20 مشكلة متوسطة (Medium)", color: "f57f17" },
        { text: "18 مشكلة منخفضة (Low)", color: "546e7a" },
        { text: "11 معلومات وتحسينات (Info)", color: "37474f" },
    ];
    return items.map(item =>
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100 },
            children: [
                new TextRun({ text: `• ${item.text}`, size: 20, color: item.color, font: "Traditional Arabic" }),
            ],
        })
    );
}

function createStatsSection(): Paragraph[] {
    return [
        new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({
                text: "إحصائيات المشروع",
                bold: true, size: 32, color: "1a237e", font: "Traditional Arabic",
            })],
        }),
        ...([
            ["عدد الملفات الكلي", "274 ملف"],
            ["عدد الأسطر البرمجية", "93,068 سطر"],
            ["ملفات المصدر (.ts/.tsx)", "233 ملف"],
            ["عدد واجهات API", "88 مسار"],
            ["عدد الصفحات", "38 صفحة"],
            ["عدد المكونات", "28 مكون"],
            ["عدد الخدمات", "13 خدمة"],
            ["عدد نماذج قاعدة البيانات", "22 نموذج"],
            ["عدد الخدمات الخارجية", "15 خدمة"],
            ["عدد حزم npm", "63 حزمة رئيسية"],
            ["التقنيات المستخدمة", "Next.js 14, TypeScript, Prisma, PostgreSQL, Redis, Supabase"],
            ["المكتبات الرئيسية", "Grammy, JWT/Jose, Zod, Bcrypt, Winston, ioredis, Three.js, Framer Motion"],
        ]).map(([k, v]) =>
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 80 },
                children: [
                    new TextRun({ text: `${k}: `, bold: true, size: 20, font: "Traditional Arabic" }),
                    new TextRun({ text: v, size: 20, color: "37474f", font: "Traditional Arabic" }),
                ],
            })
        ),
    ];
}

function createAllFindings(): Paragraph[] {
    const result: Paragraph[] = [];
    const findings = [
        // CRITICAL
        { num: "C-01", severity: "حرجة", title: "جميع الأسرار في ملف .env مكشوفة في مستودع git",
            file: ".env", lines: "1-73", impact: "كامل النظام",
            desc: "ملف .env يحتوي على 26+ سراً (بما في ذلك كلمة مرور قاعدة البيانات, مفاتيح JWT, مفتاح تشفير, توكن Redis, مفاتيح Supabase و ImageKit و Brevo و Telegram). هذه الأسرار موجودة في مستودع git." },
        { num: "C-02", severity: "حرجة", title: "مفاتيح JWT ثابتة وقابلة للتخمين",
            file: ".env", lines: "34-35", impact: "المصادقة بالكامل",
            desc: "مفاتيح JWT_ACCESS_SECRET و JWT_REFRESH_SECRET ثابتة في .env. أي مهاجم يحصل عليها يستطيع تزوير توكن JHT بأي صلاحية (بما فيها ADMIN)." },
        { num: "C-03", severity: "حرجة", title: "مفتاح Supabase Service Role مكشوف",
            file: ".env", lines: "67", impact: "قاعدة البيانات بالكامل",
            desc: "SUPABASE_SERVICE_ROLE_KEY يتيح وصولاً كاملاً غير مقيد إلى جميع بيانات Supabase متجاوزاً RLS." },
        { num: "C-04", severity: "حرجة", title: "تصدير رموز التفعيل بنص واضح للإداريين",
            file: "src/app/api/admin/generation-log/export/route.ts", lines: "64-88", impact: "إنشاء حسابات غير مصرح بها",
            desc: "نقطة API generation-log/export تصدر رموز التفعيل بنصها الكامل. مستخدمين MANAGEMENT يمكنهم تصدير رموز كل المستويات." },
        { num: "C-05", severity: "حرجة", title: "سياسة كلمة المرور ضعيفة (6 أحرف)",
            file: "src/services/auth/PasswordService.ts", lines: "21", impact: "اختراق الحسابات",
            desc: "PasswordService يسمح بكلمة مرور بطول 6 أحرف فقط بينما صفحة التفعيل تتطلب 8. عدم تناسق يسمح للمستخدمين بتعيين كلمة مرور أضعف." },
        { num: "C-06", severity: "حرجة", title: "OTP يُرسل بنص واضح في رد البوت",
            file: "src/services/tig/BotService.ts", lines: "103, 163-164", impact: "اعتراض رموز OTP",
            desc: "OTP يُرسل في نفس محادثة التيليجرام ويُخزن في سجل الدردشة. إذا تم اختراق حساب التيليجرام يمكن للمهاجم قراءة OTP." },

        // HIGH
        { num: "H-01", severity: "عالية", title: "حالة تسابق في تدوير التوكن",
            file: "src/lib/auth.ts", lines: "146-205", impact: "اختراق الجلسات",
            desc: "وظيفة rotateRefreshToken تستخدم updateMany للكشف عن إعادة استخدام التوكن. طلبان متوازيان يمكن أن يتسببا في تجاوز الكشف." },
        { num: "H-02", severity: "عالية", title: "لا حماية CSRF على logout و refresh",
            file: "src/middleware.ts", lines: "43-61", impact: "قطع الجلسة قسراً",
            desc: "نقاط /api/auth/logout و /api/auth/refresh معفاة من CSRF. مهاجم يمكنه إجبار المستخدم على تسجيل الخروج." },
        { num: "H-03", severity: "عالية", title: "سر Webhook ضعيف وقابل للتخمين",
            file: ".env", lines: "71", impact: "تزوير تحديثات البوت",
            desc: "TIG_WEBHOOK_SECRET='cyber_secret_2026' سر ضعيف يمكن تخمينه بسهولة." },
        { num: "H-04", severity: "عالية", title: "SSRF محتمل عبر JDoodle",
            file: "src/app/api/code-editor/run/route.ts", lines: "38", impact: "تنفيذ أوامر عن بعد",
            desc: "نقطة API تنفيذ الكود ترسل كود المستخدم إلى JDoodle. لا يوجد مهلة زمنية أو تحديد لحجم الكود." },
        { num: "H-05", severity: "عالية", title: "بيانات JDoodle مكشوفة",
            file: ".env", lines: "63-64", impact: "استغلال مالي",
            desc: "JDOODLE_CLIENT_ID و JDOODLE_CLIENT_SECRET مكشوفة في .env. يمكن لأي شخص استخدامها." },
        { num: "H-06", severity: "عالية", title: "توليد رموز النسخ الاحتياطي برقم عشوائي منحاز",
            file: "src/lib/twofa.ts", lines: "31-44", impact: "رموز نسخ احتياطي أضعف",
            desc: "استخدام modulo 10 على bytes عشوائية يسبب انحيازاً إحصائياً في توزيع الأرقام." },
        { num: "H-07", severity: "عالية", title: "ملفات .env كاملة في git — انتهاك للبوابة",
            file: ".gitignore / .env", lines: "جميعها", impact: "تسريب جميع الأسرار",
            desc: "ملف .env يبدو أنه غير مستبعد من git (أو كان في السابق), مما يعني أن جميع الأسرار قد تكون في تاريخ git." },

        // MEDIUM - abbreviated
        { num: "M-01", severity: "متوسطة", title: "التحقق من tokenVersion اختياري",
            file: "src/app/api/auth/verify-session/route.ts", lines: "29", impact: "", desc: "" },
        { num: "M-02", severity: "متوسطة", title: "لا تنقية لرسائل الشات (ثغرة XSS مخزنة)",
            file: "src/app/api/chat/send/route.ts", lines: "-", impact: "", desc: "" },
        { num: "M-03", severity: "متوسطة", title: "تحديد المعدل يفشل عندما يكون Redis معطلاً (Fail-Open)",
            file: "src/services/auth/SessionService.ts", lines: "30-33", impact: "", desc: "" },
        { num: "M-04", severity: "متوسطة", title: "لا تحديد معدل لرفع الملفات",
            file: "src/app/api/library/upload/route.ts", lines: "-", impact: "", desc: "" },
        { num: "M-05", severity: "متوسطة", title: "لا حماية من brute-force على تفعيل الحساب",
            file: "src/app/api/auth/activate/validate/route.ts", lines: "-", impact: "", desc: "" },
        { num: "M-06", severity: "متوسطة", title: "مستخدمي MANAGEMENT يمكنهم رؤية سجلات المستويات الأخرى",
            file: "src/app/api/admin/generation-log/route.ts", lines: "28-34", impact: "", desc: "" },
        { num: "M-07", severity: "متوسطة", title: "ثغرة Path Traversal في رفع الملفات",
            file: "src/app/api/library/upload/route.ts", lines: "186-192", impact: "", desc: "" },
        { num: "M-08", severity: "متوسطة", title: "ضعف التحقق من البريد الإلكتروني في التفعيل",
            file: "src/app/api/auth/activate/route.ts", lines: "13", impact: "", desc: "" },
        { num: "M-09", severity: "متوسطة", title: "كود الربط يُكشف في استجابة API",
            file: "src/app/api/tig/bind/initiate/route.ts", lines: "13", impact: "", desc: "" },
        { num: "M-10", severity: "متوسطة", title: "توليد OTP ضعيف مع تحقق غير ذري",
            file: "src/services/tig/TigService.ts", lines: "217, 232-262", impact: "", desc: "" },
    ];

    for (const f of findings) {
        result.push(new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [
                new TextRun({ text: `${f.num}`, bold: true, size: 22, color: "1a237e", font: "Traditional Arabic" }),
                new TextRun({ text: ` [${f.severity}]`, bold: true, size: 22,
                    color: f.severity === "حرجة" ? "c62828" : f.severity === "عالية" ? "e65100" : "f57f17",
                    font: "Traditional Arabic" }),
                new TextRun({ text: `  ${f.title}`, bold: true, size: 22, font: "Traditional Arabic" }),
            ],
        }));
        if (f.desc) {
            result.push(new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 60 },
                children: [
                    new TextRun({ text: `الملف: ${f.file}`, size: 20, color: "37474f", font: "Traditional Arabic" }),
                    f.lines ? new TextRun({ text: ` | الأسطر: ${f.lines}`, size: 20, color: "37474f" }) : new TextRun({ text: "", size: 20 }),
                ],
            }));
            result.push(new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 60 },
                children: [
                    new TextRun({ text: `الوصف: ${f.desc}`, size: 20, font: "Traditional Arabic" }),
                ],
            }));
        }
        result.push(new Paragraph({ children: [new TextRun({ text: "─".repeat(60), size: 16, color: "bdbdbd" })] }));
    }

    return result;
}

function createRemediationPlan(): Paragraph[] {
    const phases = [
        { phase: "المرحلة 1 — الإصلاحات الحرجة (فورية)", items: [
            "تدوير جميع الأسرار في .env (تغيير كلمات المرور، المفاتيح، التوكنات)",
            "تنظيف تاريخ git من الأسرار باستخدام BFG Repo-Cleaner",
            "إصلاح سياسة كلمة المرور (8 أحرف حد أدنى) في PasswordService",
            "إيقاف إرسال OTP في ردود البوت — عرضه في الموقع فقط",
            "إضافة تحديد معدل (rate limiting) لتفعيل الحساب ورفع الملفات",
            "إصلاح صلاحيات MANAGEMENT في سجلات التوليد",
        ]},
        { phase: "المرحلة 2 — الإصلاحات عالية الخطورة (أسبوع 1)", items: [
            "إضافة حماية CSRF لنقاط logout و refresh",
            "إصلاح حالة التسابق (race condition) في تدوير التوكن",
            "إضافة مهلة زمنية وتحديد حجم للكود المنفذ عبر JDoodle",
            "إصلاح انحياز modulo في توليد رموز النسخ الاحتياطي",
            "تدوير سر Webhook إلى قيمة عشوائية قوية",
            "إصلاح httpOnly: false لكوكيز CSRF",
        ]},
        { phase: "المرحلة 3 — إصلاحات البرمجيات (أسبوع 2)", items: [
            "إضافة تنقية لرسائل الشات (DOMPurify) لمنع XSS",
            "إصلاح fail-open في تحديد المعدل (Redis down)",
            "إضافة التحقق من YouTube URL في رفع المكتبة",
            "إصلاح path traversal في أسماء الملفات المرفوعة",
            "إضافة rate limiting إلى validate activation route",
            "إصلاح عدم تناسق التحقق من tokenVersion",
        ]},
        { phase: "المرحلة 4 — الأخطاء المتوسطة (أسبوع 2-3)", items: [
            "إزالة الكود الميت والمتغيرات غير المستخدمة",
            "توحيد دالة hashToken في ملف واحد",
            "إضافة @@index على parentGenerationId",
            "تحويل Assignment.status إلى enum",
            "تحويل WebAuthnChallenge.purpose إلى enum",
            "إصلاح رسائل الخطأ المشوشة في PasswordService",
        ]},
        { phase: "المرحلة 5 — تحسين الأداء (أسبوع 3)", items: [
            "تحسين cache القنوات في supabaseRealtime (TTL-based eviction)",
            "إضافة React.memo و useMemo للمكونات الثقيلة",
            "تصحيح hydrate المكرر في useAuth",
            "تحسين توليد معرف الترابط (correlation ID) في middleware",
            "ترحيل الحسابات الثقيلة مثل Three.js إلى dynamic import",
        ]},
        { phase: "المرحلة 6 — تحسين البنية (أسبوع 3-4)", items: [
            "إعادة هيكلة الخدمات إلى نمط Dependency Injection",
            "فصل ملفات API الكبيرة إلى وحدات أصغر",
            "إزالة static methods واستبدالها بوظائف عادية مع حقن التبعيات",
            "إضافة تغطية اختبارية للخدمات الأساسية (Auth, TIG, Session)",
            "توثيق واجهات API باستخدام OpenAPI/Swagger",
        ]},
        { phase: "المرحلة 7 — تحسين DevOps والأمان (أسبوع 4)", items: [
            "إعداد Dockerfile و docker-compose.yml",
            "إضافة CI/CD pipeline (GitHub Actions)",
            "إعداد مراقبة (monitoring) باستخدام Sentry",
            "إعداد أنظمة النسخ الاحتياطي لقاعدة البيانات",
            "إعداد Vercel secrets وإزالة .env من البيئات",
            "إضافة CSP صارم وهيدرات أمان إضافية",
        ]},
    ];

    const result: Paragraph[] = [];
    for (const phase of phases) {
        result.push(new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [new TextRun({
                text: phase.phase, bold: true, size: 26, color: "283593", font: "Traditional Arabic",
            })],
        }));
        for (const item of phase.items) {
            result.push(new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 80 },
                children: [
                    new TextRun({ text: `• ${item}`, size: 20, font: "Traditional Arabic" }),
                ],
            }));
        }
    }
    return result;
}

async function main() {
    console.log("جاري إنشاء التقرير...");
    const doc = createReport();
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(OUTPUT_PATH, buffer);
    console.log(`✅ تم إنشاء التقرير بنجاح: ${OUTPUT_PATH}`);
}

main().catch(console.error);
