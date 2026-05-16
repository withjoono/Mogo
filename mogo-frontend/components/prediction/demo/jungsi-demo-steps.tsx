import { JungsiStep2 } from "../components/step-2/step-2";
import { JungsiStep3 } from "../components/step-3/step-3";
import { Step } from "../components/stepper";
import { Link } from "next/link";
import { useExploreJungsiStepper } from "./context/explore-jungsi-provider";
import { JungsiStep4Demo } from "./jungsi-step4-demo";
import { JungsiStep1v3 } from "../components/step-1-v3/step-1";
import { JungsiDemoFinish } from "./jungsi-demo-finish";

export const JungsiDemoSteps = () => {
  const { step, formData } = useExploreJungsiStepper();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <JungsiStep1v3 />;
      case 2:
        return <JungsiStep2 />;
      case 3:
        return <JungsiStep3 />;
      case 4:
        return <JungsiStep4Demo />;
      case 5:
        return <JungsiDemoFinish />;
      default:
        return null;
    }
  };

  const stepLabels = [
    {
      step: 1,
      text: "대학별 탐색",
    },
    {
      step: 2,
      text: "학과별 탐색",
    },
    {
      step: 3,
      text: "위험도 확인",
    },
    {
      step: 4,
      text: "대학별 유불리",
    },
  ];

  return (
    <>
      {/* 데모 배너 */}
      <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-500 px-3 py-1 text-sm font-semibold text-white">
              무료 체험
            </span>
            <p className="text-sm text-teal-800">
              대학별 유불리 기능을 체험해보세요! 상위 3개 대학까지 무료로 확인 가능합니다.
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            전체 서비스 이용하기
          </Link>
        </div>
      </div>

      <div>
        <p className="text-center text-sm">다른 모집군을 찾으시나요?</p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/jungsi/a"
            className="flex items-center justify-center pb-2 text-blue-500"
          >
            <p className="text-center text-sm">가군</p>
          </Link>
          <Link
            href="/jungsi/b"
            className="flex items-center justify-center pb-2 text-blue-500"
          >
            <p className="text-center text-sm">나군</p>
          </Link>
          <Link
            href="/jungsi/c"
            className="flex items-center justify-center pb-2 text-blue-500"
          >
            <p className="text-center text-sm">다군</p>
          </Link>
        </div>
      </div>
      <p className="pb-2 text-center text-2xl font-semibold md:text-3xl">
        정시 전형 탐색 하기 ({formData.admissionType}군)
      </p>
      <p className="pb-8 text-center text-sm text-foreground/70">
        대학별 계산식에 따른 내 점수를 한눈에 확인하고 어느 대학이 유리한지
        탐색해보세요.
      </p>
      <div className="flex w-full flex-wrap items-center justify-center gap-y-2 pb-8 md:gap-2">
        {stepLabels.map((label) => {
          return (
            <Step
              key={label.step}
              id={label.step}
              text={label.text}
              isLast={label.step === stepLabels.length}
            />
          );
        })}
      </div>
      {renderStep()}
    </>
  );
};
