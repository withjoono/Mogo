/**
 * 대학 API
 */
import api from './client';
import type {
  University,
  Department,
  AdmissionCutoff,
  FilterUniversityParams,
} from './types';

export const universityApi = {
  /**
   * 대학 목록 조회
   */
  getAll: () =>
    api.get<University[]>('/api/universities'),

  /**
   * 대학 필터링 (지역/계열)
   */
  filter: (params: FilterUniversityParams) =>
    api.get<University[]>('/api/universities/filter', params as Record<string, string | number | boolean | undefined>),

  /**
   * 지역 목록 조회
   */
  getRegions: () =>
    api.get<string[]>('/api/universities/regions'),

  /**
   * 계열 목록 조회
   */
  getCategories: () =>
    api.get<string[]>('/api/universities/categories'),

  /**
   * 대학 상세 조회
   */
  getById: (id: number) =>
    api.get<University>(`/api/universities/${id}`),

  /**
   * 학과 상세 조회
   */
  getDepartment: (departmentId: number) =>
    api.get<Department>(`/api/universities/departments/${departmentId}`),

  /**
   * 학과 입결 데이터 조회
   */
  getAdmissionCutoffs: (departmentId: number, mockExamId?: number) =>
    api.get<AdmissionCutoff[]>(`/api/universities/departments/${departmentId}/cutoffs`, {
      mockExamId,
    }),
};

export default universityApi;








