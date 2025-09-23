import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "./components/nav";
import Footer from "./components/footer";
import { ThemeProvider } from "./components/theme-switch";
import { metaData, socialLinks } from "./lib/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(metaData.baseUrl),
  title: {
    default: metaData.title,
    template: `%s | ${metaData.title}`,
  },
  description: metaData.description,
  keywords: metaData.keywords,
  authors: [{ name: metaData.name }],
  creator: metaData.name,
  publisher: metaData.name,
  openGraph: {
    images: metaData.ogImage,
    title: metaData.title,
    description: metaData.description,
    url: `${metaData.baseUrl}/`,
    siteName: metaData.name,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: metaData.name,
    card: "summary_large_image",
    description: metaData.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: `${metaData.baseUrl}/`,
    languages: {
      'en-US': `${metaData.baseUrl}/`,
    },
  },
  verification: {
    google: "1bFabmv0mIT8iqY_r65DgCkjNKkKYwNXRmLiUI4c7P8",
  },
  other: {
    'google-site-verification': '1bFabmv0mIT8iqY_r65DgCkjNKkKYwNXRmLiUI4c7P8',
  },
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Csipor Antal",
    "jobTitle": "PLC Programmer & Web Developer",
    "description": "Personal portfolio of Csipor Antal — PLC programmer and web developer based in Romania.",
    "url": metaData.baseUrl,
    "image": `${metaData.baseUrl}${metaData.ogImage}`,
    "sameAs": [
      socialLinks.github
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mureș",
      "addressCountry": "Romania"
    },
    "worksFor": {
      "@type": "Organization",
      "name": "Aages S.A."
    },
    "knowsAbout": [
      "PLC Programming",
      "Industrial Automation", 
      "Web Development",
      "React",
      "Next.js",
      "Control Systems"
    ]
  };

  return (
      <html
          lang="en"
          className={`${inter.className}`}
          suppressHydrationWarning
      >
      <head>
        <link
            rel="alternate"
            type="application/rss+xml"
            href="/rss.xml"
            title="RSS Feed"
        />
        <link
            rel="alternate"
            type="application/atom+xml"
            href="/atom.xml"
            title="Atom Feed"
        />
        <link
            rel="alternate"
            type="application/feed+json"
            href="/feed.json"
            title="JSON Feed"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress browser extension runtime errors
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('Extension context invalidated')) {
                  e.preventDefault();
                  return false;
                }
              });
              
              // Suppress unhandled promise rejections from extensions
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && typeof e.reason === 'object' && e.reason.message) {
                  if (e.reason.message.includes('Extension context invalidated') ||
                      e.reason.message.includes('message port closed') ||
                      e.reason.message.includes('runtime.lastError')) {
                    e.preventDefault();
                    return false;
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen transition-colors duration-300">
      <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
      >
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-200 via-indigo-100 to-purple-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 text-slate-800 dark:text-white transition-colors duration-300">
          {/* Navigation */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20 transition-all duration-300" id="navbar">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <Navbar />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full overflow-visible">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <Footer />
            </div>
          </footer>
        </div>

      </ThemeProvider>
      </body>
      </html>
  );
}