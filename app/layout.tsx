import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "DayLog", template: "%s · DayLog" },
  description: "A private personal dashboard for everyday life.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster
          duration={1500}
          closeButton={false}
          richColors
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border-white/60 !bg-card/95 !font-sans !text-foreground !shadow-[0_16px_40px_rgba(62,48,91,0.14)] !backdrop-blur-xl dark:!border-white/10",
            },
          }}
        />
      </body>
    </html>
  );
}
