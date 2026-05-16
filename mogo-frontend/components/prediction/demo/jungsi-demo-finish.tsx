import { Button } from "@/components/ui/button";
import { Link } from "next/link";
import { useExploreJungsiStepper } from "./context/explore-jungsi-provider";
import { CheckCircle, Gift, Star, TrendingUp } from "lucide-react";

export const JungsiDemoFinish = () => {
  const { resetStep } = useExploreJungsiStepper();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        {/* 완료 아이콘 */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-teal-100 p-4">
            <CheckCircle className="h-16 w-16 text-teal-600" />
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          무료 체험이 완료되었습니다!
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          T Skool의 대학별 유불리 기능을 체험해주셔서 감사합니다.
        </p>

        {/* 체험 결과 요약 */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            체험에서 확인한 내용
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-teal-600" />
              <p className="font-medium text-gray-900">유불리 분석</p>
              <p className="text-sm text-gray-600">상위 3개 대학</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <Star className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
              <p className="font-medium text-gray-900">위험도 확인</p>
              <p className="text-sm text-gray-600">합격 가능성 분석</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <Gift className="mx-auto mb-2 h-8 w-8 text-purple-500" />
              <p className="font-medium text-gray-900">환산점수</p>
              <p className="text-sm text-gray-600">대학별 내 점수</p>
            </div>
          </div>
        </div>

        {/* 정식 서비스 안내 */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-8 text-white">
          <h2 className="mb-4 text-2xl font-bold">
            정식 서비스에서는 더 많은 기능을!
          </h2>
          <ul className="mb-6 space-y-3 text-left">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>모든 대학의 유불리 분석 (가/나/다/군외)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>관심대학 저장 및 비교</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>모의지원 시뮬레이션</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>입결 분석 리포트</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>수시/정시 통합 지원 전략</span>
            </li>
          </ul>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-teal-600 shadow-lg transition-all hover:bg-gray-100"
          >
            이용권 구매하기
          </Link>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button onClick={resetStep} variant="outline" size="lg">
            다시 체험하기
          </Button>
          <Link href="/jungsi">
            <Button variant="outline" size="lg">
              정시 홈으로
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
              이용권 구매
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
