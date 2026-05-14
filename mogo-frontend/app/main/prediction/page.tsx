"use client";

import { ExploreJungsiStepperProvider } from "@/components/prediction/context/explore-jungsi-provider";
import { JungsiSteps } from "@/components/prediction/jungsi-steps";

export default function PredictionPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <ExploreJungsiStepperProvider>
            <JungsiSteps />
          </ExploreJungsiStepperProvider>
        </div>
      </div>
    </div>
  );
}

