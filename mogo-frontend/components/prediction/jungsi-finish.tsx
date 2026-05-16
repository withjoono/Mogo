import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useExploreJungsiStepper } from "./context/explore-jungsi-provider";

export const JungsiFinish = () => {
  const { prevStep, resetStep, formData } = useExploreJungsiStepper();

  return (
    <div className="flex w-full flex-col items-center justify-center px-2 pb-10 pt-20">
      <p className="text-2xl font-semibold">이제 정시서비스로 가보세요! 🚀</p>
      <p className="mt-4 max-w-md text-center text-base text-muted-foreground">
        모고모고의 빠른 대학 예측(\ud45c준점수 합산)을 확인했으시나요.<br />
        더 정확한 <strong>환산점수 기반 합격선 예측</strong>과
        <strong> 대학별 기충웙 입결 데이터</strong>는
        정시 유료 서비스에서 확인할 수 있습니다.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="https://jungsi.geobukschool.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
        >
          기존 정시 서비스에서 자세히 분석하기 🎓
        </Link>
        <p className="text-xs text-muted-foreground">환산점수 계산, 대학별 유불리 시뮬레이션 제공</p>
      </div>

      <div className="flex items-center justify-center gap-4 py-12">
        <Button type="button" variant="outline" onClick={prevStep}>
          이전 단계
        </Button>
        <Button type="button" onClick={resetStep}>
          처음부터 다시하기
        </Button>
      </div>
    </div>
  );
};
