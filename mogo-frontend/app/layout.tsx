import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import "@/styles/design-system/index.css"
import "@/styles/globals.css"
import { SSOListener } from "@/components/auth/sso-listener"

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
})

export const metadata: Metadata = {
  title: "MogoMogo - 내가 푸는 단 한 문제도 이제 버리지 않도록!",
  description: "모의고사 정답을 입력하면 자동채점, 성적분석, 취약점분석, 오답노트, 대학예측까지! | MogoMogo by T스쿨",
  icons: {
    icon: "/images/mascot.png",
    apple: "/images/mascot.png",
  },
  openGraph: {
    title: "MogoMogo - 내가 푸는 단 한 문제도 이제 버리지 않도록!",
    description: "모의고사 정답을 입력하면 자동채점, 성적분석, 취약점분석, 오답노트, 대학예측까지!",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "MogoMogo 거북쌤" }],
    siteName: "MogoMogo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MogoMogo - 내가 푸는 단 한 문제도 이제 버리지 않도록!",
    description: "모의고사 정답을 입력하면 자동채점, 성적분석, 취약점분석, 오답노트, 대학예측까지!",
    images: ["/images/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" data-app="mogo" suppressHydrationWarning>
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        <SSOListener />
        {children}
      </body>
    </html>
  )
}








