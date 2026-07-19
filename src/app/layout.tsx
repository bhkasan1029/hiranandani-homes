import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/layout/SessionProvider";
import DisclaimerPopup from "@/components/layout/DisclaimerPopup";
import WarmDB from "@/components/WarmDB";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Explicit viewport so in-app browsers (WhatsApp, Instagram) and notched
// devices render at the correct scale, edge to edge
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "HiranandaniProperties — Real Estate Advisors",
    template: "%s | HiranandaniProperties",
  },
  description:
    "Discover exceptional homes in Hiranandani Estate, Thane. Zero brokerage — browse listings and connect directly with verified owners for free.",
  keywords: [
    "Hiranandani Estate",
    "Hiranandani properties",
    "Thane real estate",
    "flats for rent Thane",
    "flats for sale Thane",
    "luxury homes Thane",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.hiranandaniproperties.in",
    siteName: "HiranandaniProperties",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session on server so SessionProvider hydrates instantly —
  // no loading flash, no stale state when navigating between route groups
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-41296L6STP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-41296L6STP');
          `}
        </Script>
        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xotembw6ob");
          `}
        </Script>
        <SessionProvider session={session}>
          <WarmDB />
          <DisclaimerPopup />
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
