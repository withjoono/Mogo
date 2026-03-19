/**
 * 모의고사 API
 */
import api from './client';
import type {
  MockExam,
  SearchMockExamParams,
  MockExamExistsResponse,
  KyokwaSubject,
} from './types';

export const mockExamApi = {
  /**
   * 모의고사 목록 조회
   */
  getAll: () => api.get<MockExam[]>('/api/mock-exams'),

  /**
   * 모의고사 검색 (연도/학년/월)
   */
  search: (params: SearchMockExamParams) =>
    api.get<MockExam[]>('/api/mock-exams/search', params as Record<string, string | number | boolean | undefined>),

  /**
   * 모의고사 존재 여부 확인
   */
  checkExists: (year: number, grade: string, month: number) =>
    api.get<MockExamExistsResponse>('/api/mock-exams/check', { year, grade, month }),

  /**
   * 모의고사 코드로 조회
   */
  getByCode: (code: string) =>
    api.get<MockExam>(`/api/mock-exams/code/${code}`),

  /**
   * 모의고사 ID로 조회
   */
  getById: (id: number) =>
    api.get<MockExam>(`/api/mock-exams/${id}`),

  /**
   * 교과/과목 목록 조회 (hub 공유 테이블)
   */
  getKyokwaSubjects: (curriculum?: '2015' | '2022') =>
    api.get<KyokwaSubject[]>('/api/mock-exams/kyokwa-subjects', { curriculum }),
};

export default mockExamApi;








