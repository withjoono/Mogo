import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "3월 모의고사로 수능 정시 예측 | MogoMogo",
  description:
    "3월 모의 표점 → 수능 예측 표점 변환. 3년 실증 데이터 기반 ±2.4점 오차 이내 예측. 정시앱 200+ 대학 합격 시뮬레이션 연계.",
  keywords: ["3월 모의고사", "수능 예측", "정시", "표준점수 변환", "수능 표점"],
  openGraph: {
    title: "3월 모의고사 → 수능 정시 예측 | MogoMogo",
    description:
      "3월 모의 표점으로 수능 결과를 예측하세요. 3년 실증 데이터 기반 ±2.4점 오차 이내 정확도.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "MogoMogo 3월 수능 예측" }],
    type: "website",
  },
}

export default function PromoMarchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
