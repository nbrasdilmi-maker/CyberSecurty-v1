import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import PageTransition from "@/components/layout/PageTransition";
import FloatingBell from "@/components/ui/FloatingBell";
import AnimationsProvider from "@/components/providers/AnimationsProvider";
import UserActivityTracker from "@/components/layout/UserActivityTracker";
import EffectsManager from "@/components/effects/EffectsManager";
import DashboardBackground from "@/components/effects/DashboardBackground";
import NavigationProgress from "@/components/ui/NavigationProgress";
import MatrixRain from "@/components/effects/MatrixRain";
import PageGuardProvider from "@/components/ui/PageGuardProvider";
export const metadata: Metadata = {
  title: "سحابة الأمن السيبراني - جامعة ذمار",
  description:
    "بيئة تعليمية تفاعلية متكاملة لطلاب ومعلمي كلية الأمن السيبراني - جامعة ذمار",
  keywords: "أمن سيبراني, جامعة ذمار, تعليم, تكاليف, مكتبة علمية",
  authors: [{ name: "محمد إبراهيم الديلمي" }, { name: "أحمد الهيدمة" }],
  openGraph: {
    title: "سحابة الأمن السيبراني",
    description: "بيئة تعليمية تفاعلية لطلاب الأمن السيبراني",
    type: "website",
    locale: "ar_YE",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#010204] text-[#e6edf3] antialiased font-[Cairo]">
        <NavigationProgress />
        <DashboardBackground />
        <div className="fixed inset-0 opacity-25 pointer-events-none">
          <MatrixRain />
        </div>
        <EffectsManager />

        <div className="relative z-10">
          <ToastProvider>
            <AnimationsProvider>
              <UserActivityTracker />
              <PageGuardProvider>
                <PageTransition>{children}</PageTransition>
              </PageGuardProvider>
              <FloatingBell />
            </AnimationsProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
