import { useState, useEffect } from "react";
import { JUNGSI_APIS } from "./apis";
import {
  IRegularAdmission,
  IRegularAdmissionDetail,
  ISavedScore,
  IPreviousResultsResponse,
} from "./interfaces";

export const useGetRegularAdmissions = (params: { year: number; admission_type: string }) => {
  const [data, setData] = useState<IRegularAdmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    JUNGSI_APIS.fetchRegularAPI(params).then((res) => {
      setData(res || []);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [params.year, params.admission_type]);

  return { data, isLoading };
};

export const useGetRegularAdmissionDetail = (params: { admissionId: number }) => {
  const [data, setData] = useState<IRegularAdmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.admissionId) {
      setIsLoading(false);
      return;
    }
    JUNGSI_APIS.fetchRegularDetailAPI({ id: params.admissionId }).then(res => {
      setData(res);
      setIsLoading(false);
    });
  }, [params.admissionId]);

  return { data, isLoading };
};

export const useGetInterestRegularAdmissions = (admissionType: string) => {
  return { data: [], isLoading: false };
};

export const useGetRegularCombinations = () => {
  return { data: [], isLoading: false };
};

export const useGetRegularCombination = (id: number) => {
  return { data: null, isLoading: false };
};

export const useGetCalculatedScores = () => {
  const [data, setData] = useState<ISavedScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    JUNGSI_APIS.fetchSavedScoresAPI().then(res => {
      setData(res || []);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
};

export const useGetCalculatedScoreByUniversity = (universityId: number) => {
  return { data: null, isLoading: false };
};

export const useCalculateScores = () => {
  return {
    mutate: () => {
      JUNGSI_APIS.calculateScoresAPI().catch(console.error);
    },
    isPending: false,
  };
};

export const useDeleteCalculatedScores = () => {
  return {
    mutate: () => {}
  };
};

export const useAddInterestRegularAdmission = () => {
  return { mutate: () => {} };
};

export const useRemoveInterestRegularAdmission = () => {
  return { mutate: () => {} };
};

export const useGetPreviousResults = (admissionId: number) => {
  const [data, setData] = useState<IPreviousResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!admissionId) return;
    JUNGSI_APIS.fetchPreviousResultsAPI(admissionId).then(res => {
      setData(res);
      setIsLoading(false);
    });
  }, [admissionId]);

  return { data, isLoading };
};
