import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import '../../globals.css'
import { getServerSideURL } from '@/utilities/getURL'

function ChatWidget() {
  return (
    <>
      <style>{`
        #aru-widget-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 999999;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        #aru-widget-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        #aru-widget-portal {
          position: fixed;
          inset: 0;
          z-index: 999998;
          display: none;
          align-items: center;
          justify-content: center;
        }
        #aru-widget-portal.open {
          display: flex;
        }
        #aru-widget-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
        }
        #aru-widget-frame {
          position: relative;
          z-index: 1;
          width: 680px;
          height: 780px;
          border: none;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.4);
          opacity: 0;
          transform: scale(0.95) translateY(10px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        #aru-widget-portal.open #aru-widget-frame {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        @media (max-width: 520px) {
          #aru-widget-frame {
            width: 100%;
            height: 100%;
            border-radius: 0;
            transform: translateY(20px);
          }
          #aru-widget-portal.open #aru-widget-frame {
            transform: translateY(0);
          }
        }
      `}</style>

      <button id="aru-widget-btn" aria-label="Открыть чат">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <div id="aru-widget-portal">
        <div id="aru-widget-backdrop" />
        <iframe
          id="aru-widget-frame"
          src="http://localhost:3001/ru/widget-chat?theme=light&institutionId=019d0748-266b-7e14-b454-d1dda81aec1b&lang=ru"
          title="Чат с университетом"
        />
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var portal = document.getElementById('aru-widget-portal');
          var frame  = document.getElementById('aru-widget-frame');
          var btn    = document.getElementById('aru-widget-btn');
          var isOpen = false;

          function openWidget() {
            isOpen = true;
            portal.classList.add('open');
            document.body.style.overflow = 'hidden';
            try { frame.contentWindow.postMessage({ type: 'WIDGET_OPEN' }, '*'); } catch(e) {}
          }

          function closeWidget() {
            isOpen = false;
            portal.classList.remove('open');
            document.body.style.overflow = '';
          }

          btn.addEventListener('click', function() {
            isOpen ? closeWidget() : openWidget();
          });

          document.getElementById('aru-widget-backdrop').addEventListener('click', closeWidget);

          window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'WIDGET_CLOSE') closeWidget();
          });

          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) closeWidget();
          });
        })();
      `}} />
    </>
  )
}

export default async function RootLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { isEnabled } = await draftMode()
  const { locale } = await params

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable, "min-h-screen")} lang="en" suppressHydrationWarning>
    <head>
      <InitTheme />
      <link href="/favicon.ico" rel="icon" sizes="32x32" />
      <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap"
        rel="stylesheet"
      />
    </head>
    <body className={"min-h-screen"}>
    <Providers>
      <div className={"flex flex-col justify-between min-h-screen"}>
        <AdminBar adminBarProps={{ preview: isEnabled }} />
        <Header locale={locale} />
        <div className={""}>
          {children}
        </div>
        <Footer />
        <ChatWidget />
      </div>
    </Providers>
    </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
