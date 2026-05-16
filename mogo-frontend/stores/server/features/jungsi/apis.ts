import {
  IRegularAdmission,
  IRegularAdmissionDetail,
  IRegularCombination,
  ISavedScore,
  IDeleteScoresResponse,
  IPreviousResultsResponse,
} from "./interfaces";

const API_BASE = '/api';

export const JUNGSI_APIS = {
  fetchRegularAPI: async ({ year, admission_type }: any): Promise<IRegularAdmission[]> => {
    const res = await fetch(`${API_BASE}/explore/regular?year=${year}&admission_type=${admission_type}`);
    const data = await res.json();
    return data.items || [];
  },
  fetchInterestRegularAPI: async (memberId: string, admissionType: string) => [],
  fetchRegularCombinationsAPI: async (memberId: string) => [],
  createRegularCombinationAPI: async () => null,
  updateRegularCombinationAPI: async () => null,
  deleteRegularCombinationAPI: async () => true,
  fetchRegularDetailAPI: async ({ id }: any): Promise<IRegularAdmissionDetail | null> => {
    const res = await fetch(`${API_BASE}/explore/regular/${id}`);
    const json = await res.json();
    return json.success ? json.data : null;
  },
  fetchSavedScoresAPI: async (): Promise<ISavedScore[]> => {
    const res = await fetch(`${API_BASE}/jungsi/scores`);
    const json = await res.json();
    return json.success ? (json.data || []) : [];
  },
  fetchScoreByUniversityAPI: async () => null,
  deleteScoresAPI: async () => ({ deleted: true }),
  calculateScoresAPI: async () => ({ calculated: 1, saved: 1 }),
  fetchPreviousResultsAPI: async (id: number): Promise<IPreviousResultsResponse | null> => null,
};
