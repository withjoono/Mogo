/**
 * 점수 API
 */
import api from './client';
import type {
  StudentScore,
  CreateScoreDto,
  ScoreConversionStandard,
  ScoreConversionRaw,
} from './types';

export const scoreApi = {
  /**
   * 점수 저장
   */
  create: (data: CreateScoreDto) =>
    api.post<StudentScore>('/api/scores', data),

  /**
   * 학생의 모든 점수 조회
   */
  getByStudent: (studentId: number) =>
    api.get<StudentScore[]>(`/api/scores/student/${studentId}`),

  /**
   * 학생의 최근 점수 조회
   */
  getLatestByStudent: (studentId: number) =>
    api.get<StudentScore>(`/api/scores/student/${studentId}/latest`),

  /**
   * 특정 학생의 특정 모의고사 점수 조회
   */
  getOne: (studentId: number, mockExamId: number) =>
    api.get<StudentScore>(`/api/scores/student/${studentId}/exam/${mockExamId}`),

  /**
   * 점수 ID로 조회
   */
  getById: (id: number) =>
    api.get<StudentScore>(`/api/scores/${id}`),

  /**
   * 점수 수정
   */
  update: (id: number, data: Partial<CreateScoreDto>) =>
    api.put<StudentScore>(`/api/scores/${id}`, data),

  /**
   * 점수 삭제
   */
  delete: (id: number) =>
    api.delete<void>(`/api/scores/${id}`),

  /**
   * 표준점수 변환표 조회
   */
  getStandardConversion: (mockExamId: number, subject: string) =>
    api.get<ScoreConversionStandard[]>(`/api/scores/conversion/standard/${mockExamId}`, { subject }),

  /**
   * 원점수 변환표 조회
   */
  getRawConversion: (mockExamId: number, subject: string, subjectType?: string) =>
    api.get<ScoreConversionRaw[]>(`/api/scores/conversion/raw/${mockExamId}`, {
      subject,
      subjectType,
    }),
};

export default scoreApi;








