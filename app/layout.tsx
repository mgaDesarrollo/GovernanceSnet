import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import { ThemeProvider } from "@/components/theme-provider"
import localFont from 'next/font/local'

const sofiaPro = localFont({
  src: [
    {
      path: '../public/fonts/sofia-pro/sofia-pro-ultra-light-az.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/sofia-pro/sofia-pro-ultra-light-italic-az.otf',
      weight: '100',
      style: 'italic',
    },

    {
      path: '../public/fonts/sofia-pro/sofia-pro-extra-light-az.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/sofia-pro/sofia-pro-extra-light-italic-az.otf',
      weight: '200',
      style: 'italic',
    },

    {
      path: '../public/fonts/sofia-pro/sofia-pro-light-az.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/sofia-pro/sofia-pro-light-italic-az.otf',
      weight: '300',
      style: 'italic',
    },

    {
      path: '../public/fonts/sofia-pro/sofia-pro-regular-az.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/sofia-pro/sofia-pro-regular-italic-az.otf',
      weight: '400',
      style: 'italic',
    },

    {
      path: '../public/fonts/sofia-pro/sofia-pro-medium-az.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/sofia-pro/sofia-pro-medium-italic-az.otf',
      weight: '500',
      style: 'italic',
    },

    {
      path: '../public/fonts/sofia-pro/sofia-pro-semi-bold-az.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/sofia-pro/sofia-pro-semi-bold-italic-az.otf',
      weight: '600',
      style: 'italic',
    },

    {
      path: '../public/fonts/sofia-pro/sofia-pro-bold-az.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/sofia-pro/sofia-pro-bold-italic-az.otf',
      weight: '700',
      style: 'italic',
    },

    {
      path: '../public/fonts/sofia-pro/sofia-pro-black-az.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../public/fonts/sofia-pro/sofia-pro-black-italic-az.otf',
      weight: '900',
      style: 'italic',
    },
  ],
})
export const metadata: Metadata = {
  title: "SingularityNET Governance Dashboard",
  description: "Governance & Consensus Dashboard for SNET Ambassadors",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={sofiaPro.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
