import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./css/globals.css";
import Navigation from "@/components/Navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { CleanUrlHandler } from '@/app/(client)/auth/components/CleanUrlHandler';

import { getItemsSaved } from "./(client)/properties/controller/properties-controller";
import { DataProvider } from "@/components/DataProvider";

// import { Open_Sans } from 'next/font/google';
import { Albert_Sans } from 'next/font/google';
import Footer from "@/components/Footer";

// Configuramos la fuente
// const openSans = Open_Sans({
//   subsets: ['latin'],
//   display: 'swap',
//   weight: ['400', '500', '700'],
// });
const albertSans = Albert_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RBE Real Estate | Find Your Dream Property",
  description: "Top Real Estate SaaS in Spain. Buy or sell properties in Portugal, France & UK. The best platform for private owners and professional agents. Find or List your home now!",
  keywords: [
    "Real Estate SaaS",
    "Property Search",
    "Multi-user Real Estate Platform",
    "Real Estate Listings",
    "Luxury Homes for Sale",
    "Property Management Software",
    "Real Estate Analytics",
    "Real Estate SaaS Europe",
    "For sale by owner Spain",
    "Property listings Portugal",
    "Real estate agents tools",
    "International property portal UK",
    "MLS listings France",
    "Sell property fast Spain",
    "Luxury real estate marketing",
    "Property management software for agents",
    "Investment properties Southern Europe"
  ],
  authors: [{ name: "RBE Team" }],
  // Configuración para que se vea bien al compartir en redes (LinkedIn, X, WhatsApp)
  openGraph: {
    title: "RBE Real Estate - Professional Property Search Platform",
    description: "Search your next home or manage your property portfolio with our advanced SaaS solution.",
    type: "website",
    locale: "en_US",
    url: "https://rbe.com",
    siteName: "RBE Real Estate",
  },
  // Configuración para robots de búsqueda
  robots: {
    index: true,
    follow: true,
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const itemsSaved = session ? await getItemsSaved() : [];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* MODO DARK/LIGHT -> script que evita el parpadeo blanco si localStorage tiene guardado el modo DARK precargándolo en el DOM */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const savedTheme = localStorage.getItem('theme');
              const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            })()
          `,
        }} />
      </head>
      <body className={`${albertSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DataProvider initialItemsSaved={itemsSaved}>
          <CleanUrlHandler /> {/* LIMPIAMOS LA URL UTILIZADA POR EL PROXI.TS QUE ASEGURA QUE NO QUEDE ABIERTA UNA SESION ANTERIOR EN EL NAVEGADOR */}
          <Navigation session={session} />
          {children}
          <Footer session={session} />
        </DataProvider>
      </body>
    </html>
  );
}
