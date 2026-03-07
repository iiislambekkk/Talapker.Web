import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import {NextIntlClientProvider} from "next-intl";
import ToasterProvider from "@/components/ToasterProvider";
import Head from "next/head";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/img/logo.svg" />
          <meta name="theme-color" content="#0d6efd" />
      </Head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
          <NextIntlClientProvider>
            <Providers>
                {children}
            </Providers>
          </NextIntlClientProvider>
      </body>
    </html>
  )
}
