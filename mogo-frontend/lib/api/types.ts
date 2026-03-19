/**
 * API 타입 정의
 */

// === 모의고사 ===
export interface MockExam {
  id: number;
  code: string;
  name: string;
  grade?: string;
  year?: number;
  month?: number;
  type?: string;
  createdAt: string;
}

export interface SearchMockExamParams {
  year?: number;
  grade?: string;
  month?: number;
}

export interface MockExamExistsResponse {
  exists: boolean;
  mockExam: MockExam | null;
}

// === 교과/과목 (hub 공유 테이블) ===
export interface KyokwaSubject {
  id: string;
  kyokwa: string;
  kyokwaCode: string;
  classification: string;
  classificationCode: number;
  subjectName: string;
  subjectCode: number;
  evaluationMethod: string | null;
}

// === 점수 ===
export interface StudentScore {
  id: number;
  studentId: number;
  mockExamId: number;

  // 국어
  koreanSelection?: string;
  koreanRaw?: number;
  koreanStandard?: number;
  koreanPercentile?: number;
  koreanGrade?: number;

  // 영어
  englishRaw?: number;
  englishGrade?: number;

  // 수학
  mathSelection?: string;
  mathRaw?: number;
  mathStandard?: number;
  mathPercentile?: number;
  mathGrade?: number;

  // 탐구1
  inquiry1Selection?: string;
  inquiry1Raw?: number;
  inquiry1Standard?: number;
  inquiry1Percentile?: number;
  inquiry1Grade?: number;

  // 탐구2
  inquiry2Selection?: string;
  inquiry2Raw?: number;
  inquiry2Standard?: number;
  inquiry2Percentile?: number;
  inquiry2Grade?: number;

  // 한국사
  historyRaw?: number;
  historyGrade?: number;

  // 제2외국어
  foreignSelection?: string;
  foreignRaw?: number;
  foreignGrade?: number;

  // 합산
  totalStandardSum?: number;
  totalPercentileSum?: number;
  topCumulativeStd?: number;
  topCumulativeRaw?: number;

  createdAt: string;
  updatedAt: string;

  // Relations
  mockExam?: MockExam;
}

export interface CreateScoreDto {
  studentId: number;
  mockExamId: number;

  // 국어
  koreanSelection?: string;
  koreanRaw?: number;
  koreanStandard?: number;
  koreanPercentile?: number;
  koreanGrade?: number;

  // 영어
  englishRaw?: number;
  englishGrade?: number;

  // 수학
  mathSelection?: string;
  mathRaw?: number;
  mathStandard?: number;
  mathPercentile?: number;
  mathGrade?: number;

  // 탐구1
  inquiry1Selection?: string;
  inquiry1Raw?: number;
  inquiry1Standard?: number;
  inquiry1Percentile?: number;
  inquiry1Grade?: number;

  // 탐구2
  inquiry2Selection?: string;
  inquiry2Raw?: number;
  inquiry2Standard?: number;
  inquiry2Percentile?: number;
  inquiry2Grade?: number;

  // 한국사
  historyRaw?: number;
  historyGrade?: number;

  // 제2외국어
  foreignSelection?: string;
  foreignRaw?: number;
  foreignGrade?: number;
}

// === 대학 ===
export interface University {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  region?: string;
  totalScore?: number;
  conversionRate?: number;
  status: string;
  departments?: Department[];
}

export interface Department {
  id: number;
  code: string;
  universityId: number;
  departmentCode?: string;
  name: string;
  admissionType?: string;
  admissionGroup?: string;
  category?: string;
  subCategory?: string;
  quota?: number;
  selectionMethod?: string;

  // 반영비율
  koreanRatio?: string;
  mathRatio?: string;
  englishRatio?: string;
  inquiryRatio?: string;
  historyRatio?: string;
  foreignRatio?: string;

  // 영어 등급별 점수
  englishGrade1?: number;
  englishGrade2?: number;
  englishGrade3?: number;
  englishGrade4?: number;
  englishGrade5?: number;
  englishGrade6?: number;
  englishGrade7?: number;
  englishGrade8?: number;
  englishGrade9?: number;

  status: string;
  university?: University;
  admissionCutoffs?: AdmissionCutoff[];
}

export interface AdmissionCutoff {
  id: number;
  departmentId: number;
  mockExamId?: number;
  year?: number;
  scoreType?: string;

  firstCutScore?: number;
  firstCutPercentile?: number;
  finalCutScore?: number;
  finalCutPercentile?: number;

  competitionRate?: number;
  additionalRate?: number;

  mockExam?: MockExam;
}

export interface FilterUniversityParams {
  region?: string;
  category?: string;
}

// === 점수 변환 ===
export interface ScoreConversionStandard {
  id: number;
  mockExamId: number;
  subject: string;
  standardScore: number;
  percentile?: number;
  grade?: number;
  cumulativePct?: number;
}

export interface ScoreConversionRaw {
  id: number;
  mockExamId: number;
  subject: string;
  subjectType?: string;
  commonScore?: number;
  selectionScore?: number;
  standardScore?: number;
}

// === 채점 ===
export interface AnswerItem {
  questionNumber: number;
  answer: number;
}

export interface GradeAnswersRequest {
  mockExamId: number;
  subject: string;
  subjectDetail?: string;
  answers: AnswerItem[];
}

export interface GradeResultItem {
  questionNumber: number;
  studentAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  score: number;
  earnedScore: number;
  difficulty?: string;
  correctRate?: number;
}

export interface GradeResult {
  mockExamId: number;
  subject: string;
  subjectDetail?: string;
  totalQuestions: number;
  correctCount: number;
  totalScore: number;
  earnedScore: number;
  results: GradeResultItem[];
}

export interface CorrectAnswer {
  questionNumber: number;
  answer: number;
  score: number;
  difficulty?: string;
  correctRate?: number;
}
