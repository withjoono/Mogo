import { IRegion } from "@/types/region.type";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

interface StepperContextProps {
  step: number;
  formData: FormData;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (key: keyof FormData, data: FormData[keyof FormData]) => void;
  resetStep: () => void;
  isLastStep: boolean;
  isDemo: boolean;
}

interface FormData {
  step1SelectedItems: {
    universityName: string;
    region: string;
  }[];
  step1SelectedIds: number[];
  step2SelectedIds: number[];
  step3SelectedIds: number[];
  step4SelectedIds: number[];
  region: IRegion[];
  selectedGeneralFieldName: string;
  admissionType: string;
}

const ExploreJungsiStepperContext = createContext<
  StepperContextProps | undefined
>(undefined);

const ExploreJungsiStepperProvider: React.FC<{
  children: ReactNode;
  admissionType: string;
  isDemo?: boolean;
}> = ({ children, admissionType, isDemo = false }) => {
  const LAST_STEP = 5; // finish 포함

  const initialData: FormData = useMemo(
    () => ({
      step1SelectedItems: [],
      step1SelectedIds: [],
      step2SelectedIds: [],
      step3SelectedIds: [],
      step4SelectedIds: [],
      region: [],
      selectedGeneralFieldName: "전체",
      admissionType,
    }),
    [admissionType],
  );

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialData);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const nextStep = useCallback(() => {
    setStep((prevStep) => {
      const newStep = prevStep < LAST_STEP ? prevStep + 1 : prevStep;
      if (newStep !== prevStep) {
        scrollToTop();
      }
      return newStep;
    });
  }, [scrollToTop]);

  const prevStep = useCallback(() => {
    setStep((prevStep) => {
      const newStep = prevStep > 1 ? prevStep - 1 : prevStep;
      if (newStep !== prevStep) {
        scrollToTop();
      }
      return newStep;
    });
  }, [scrollToTop]);

  const resetStep = useCallback(() => {
    setStep(1);
    setFormData(initialData);
    scrollToTop();
  }, [scrollToTop, initialData]);

  const updateFormData = useCallback((key: keyof FormData, data: FormData[keyof FormData]) => {
    setFormData((prevData) => {
      // 데이터 유효성 검사
      if (key === "region" && !Array.isArray(data)) {
        console.error("Region must be an array");
        return prevData;
      }

      return { ...prevData, [key]: data };
    });
  }, []);

  const isLastStep = useMemo(() => step === LAST_STEP, [step]);

  const value = useMemo(
    () => ({
      step,
      formData,
      nextStep,
      prevStep,
      updateFormData,
      resetStep,
      isLastStep,
      isDemo,
    }),
    [step, formData, nextStep, prevStep, updateFormData, resetStep, isLastStep, isDemo],
  );

  return (
    <ExploreJungsiStepperContext.Provider value={value}>
      {children}
    </ExploreJungsiStepperContext.Provider>
  );
};

const useExploreJungsiStepper = (): StepperContextProps => {
  const context = useContext(ExploreJungsiStepperContext);
  if (!context) {
    throw new Error(
      "useExploreJungsiStepper must be used within a ExploreJungsiStepperProvider",
    );
  }
  return context;
};

export { ExploreJungsiStepperProvider, useExploreJungsiStepper };
