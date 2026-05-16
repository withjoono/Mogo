import { JungsiStep2 } from "./step-2/step-2";
import { JungsiStep3 } from "./step-3/step-3";
import { Step } from "./stepper";
import { JungsiFinish } from "./jungsi-finish";
import { useExploreJungsiStepper } from "./context/explore-jungsi-provider";
import { JungsiStep1v3 } from "./step-1-v3/step-1";

export const JungsiSteps = () => {
  const { step } = useExploreJungsiStepper();

  // 모고모고 시스템에서는 환산점수 계산을 생략하고 단순 표점/등급 비교를 수행합니다.

  const renderStep = () => {
    switch (step) {
      case 1:
        return <JungsiStep1v3 />;
      case 2:
        return <JungsiStep2 />;
      case 3:
        return <JungsiStep3 />;
      case 4:
        return <JungsiFinish />;
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
      text: "배치 점수 비교",
    },
  ];

  return (
    <>
      <p className="pb-2 text-center text-2xl font-semibold md:text-3xl">
        모의고사 기반 대학예측 탐색
      </p>
      <p className="pb-8 text-center text-sm text-foreground/70">
        대학별 배치 표준점수와 내 점수를 한눈에 비교해보세요.
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
