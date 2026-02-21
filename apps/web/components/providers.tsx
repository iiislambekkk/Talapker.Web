"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import {SessionProvider} from "next-auth/react";
import {QueryClientProvider} from "@tanstack/react-query";
import {getQueryClient} from "@/lib/tanstackQuery/getQueryClient";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import ToasterProvider from "@/components/ToasterProvider";


export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                {children}
            </SessionProvider>
        </QueryClientProvider>

        <ToasterProvider  />
    </NextThemesProvider>
  )
}
