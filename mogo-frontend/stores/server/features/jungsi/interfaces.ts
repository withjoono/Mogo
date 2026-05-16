export interface IRegularAdmission {
  id: number;
  year: number;
  admissionName: string;
  admissionType: string; // 가,나,다 군
  generalFieldName: string; // 계열명 (의치한약수)
  recruitmentNumber: number; // 정원
  selectionMethod: string | null; // 선발 방식
  detailedFields: string | null; // 상세계열 (전기•전자•컴퓨터•통신)
  recruitmentName: string | null; // 모집단위명 (한국어문학과)
  csatRatio: string | null; // 수능 비율
  schoolRecordRatio: string | null; // 학생부 비율
  interviewRatio: string | null; // 면접 비율
  otherRatio: string | null; // 기타 비율
  scoreCalculationCode: string | null; // 점수환산식 코드 (SC001~SC488)
  csatElements: string | null; // 수능요소 (백+백)
  csatCombination: string | null; // 수능조합 (수탐(2)+국영中택1)
  csatRequired: string | null; // 수능필수 (수탐(2))
  csatOptional: string | null; // 수능선택 (국영中택1)
  totalScore: number | null; // 전형 총점
  researchSubjectCount: number | null; // 탐구과목수
  koreanReflectionScore: string | null; // 국어배점 (float)
  mathReflectionScore: string | null; // 수학배점 (float)
  researchReflectionScore: string | null; // 탐구배점 (float)
  englishReflectionScore: string | null; // 영어배점 (float)
  koreanHistoryReflectionScore: string | null; // 한국사배점 (float)
  secondForeignLanguageReflectionScore: string | null; // 제2외국어배점 (float)
  englishGradeCriteria: number | null;
  historyGradeCriteria: number | null;
  minCut: string | null; // 최초컷 (float)
  minCutPercent: string | null; // 최초누백 float
  maxCut: string | null; // 추합컷 (float)
  maxCutPercent: string | null; // 추합누백 float
  riskPlus5: string | null; // 위험도 +5 (float)
  riskPlus4: string | null; // 위험도 +4 (float)
  riskPlus3: string | null; // 위험도 +3 (float)
  riskPlus2: string | null; // 위험도 +2 (float)
  riskPlus1: string | null; // 위험도 +1 (float)
  riskMinus1: string | null; // 위험도 -1 (float)
  riskMinus2: string | null; // 위험도 -2 (float)
  riskMinus3: string | null; // 위험도 -3 (float)
  riskMinus4: string | null; // 위험도 -4 (float)
  riskMinus5: string | null; // 위험도 -5 (float)
  initialCumulativePercentile: string | null; // 최초누백 (float)
  additionalCumulativePercentile: string | null; // 추합누백 (float)
  koreanElectiveSubject: string | null; // 국어선택과목
  mathElectiveSubject: string | null; // 수학_선택과목
  mathProbabilityStatisticsAdditionalPoints: string | null; // 수학_확률과통계가산점
  mathCalculusAdditionalPoints: string | null; // 수학_미적분가산점
  mathGeometryAdditionalPoints: string | null; // 수학_기하가산점
  researchType: string | null; // 탐구_유형
  researchSocialAdditionalPoints: string | null; // 탐구_사회가산점
  researchScienceAdditionalPoints: string | null; // 탐구_과학가산점
  mathResearchSelection: string | null; // 수탐선택
  englishApplicationCriteria: string | null; // 영어_적용기준
  englishGrade1Score: string | null; // 영어 1등급점수
  englishGrade2Score: string | null; // 영어 2등급점수
  englishGrade3Score: string | null; // 영어 3등급점수
  englishGrade4Score: string | null; // 영어 4등급점수
  englishGrade5Score: string | null; // 영어 5등급점수
  englishGrade6Score: string | null; // 영어 6등급점수
  englishGrade7Score: string | null; // 영어 7등급점수
  englishGrade8Score: string | null; // 영어 8등급점수
  englishGrade9Score: string | null; // 영어 9등급점수
  englishMinimumCriteria: string | null; // 영어 최저기준
  koreanHistoryApplicationCriteria: string | null; // 한국사_적용기준
  koreanHistoryGrade1Score: string | null; // 한국사 1등급점수
  koreanHistoryGrade2Score: string | null; // 한국사 2등급점수
  koreanHistoryGrade3Score: string | null; // 한국사 3등급점수
  koreanHistoryGrade4Score: string | null; // 한국사 4등급점수
  koreanHistoryGrade5Score: string | null; // 한국사 5등급점수
  koreanHistoryGrade6Score: string | null; // 한국사 6등급점수
  koreanHistoryGrade7Score: string | null; // 한국사 7등급점수
  koreanHistoryGrade8Score: string | null; // 한국사 8등급점수
  koreanHistoryGrade9Score: string | null; // 한국사 9등급점수
  koreanHistoryMinimumCriteria: string | null; // 한국사 최저기준
  university: {
    establishmentType: string;
    id: number;
    name: string;
    region: string;
    code: string;
  };
}

export interface IRegularAdmissionDetail extends IRegularAdmission {
  previousResults: {
    id: number;
    year: number;
    minCut: string | null; // float - 최초합컷
    maxCut: string | null; // float - 추합컷
    competitionRatio: string | null; // float - 경쟁률
    percent: string | null; // float - 최초누백
    recruitmentNumber: number | null; // 모집인원(최종)
    // 새로 추가된 필드들
    additionalAcceptanceRank: number | null; // 충원합격순위
    convertedScoreTotal: string | null; // 환산점수총점
    convertedScore50Cut: string | null; // 환산점수 50%컷
    convertedScore70Cut: string | null; // 환산점수 70%컷
    percentile50Cut: string | null; // 백분위 50%컷
    percentile70Cut: string | null; // 백분위 70%컷
  }[];
}

export interface IRegularCombination {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  regularAdmissions: IRegularAdmission[];
}

// ============================================
// 정시 환산점수 조회 API 타입
// ============================================

/**
 * 저장된 환산점수 조회 응답 타입
 */
export interface ISavedScore {
  id: number;
  universityId: number;
  universityName: string;
  scoreCalculationCode: string; // 점수환산식 코드 (SC001~SC488)
  major: string;
  convertedScore: number;
  standardScoreSum: number;
  optimalScore?: number;      // 동점수 평균 (백엔드에서 계산)
  scoreDifference?: number;   // 유불리 (음수면 유리, 양수면 불리)
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 환산점수 삭제 응답 타입
 */
export interface IDeleteScoresResponse {
  deleted: boolean;
}

// ============================================
// 정시 입결분석 API 타입
// ============================================

/**
 * 연도별 입결 데이터
 */
export interface IPreviousResultItem {
  id: number;
  year: number;
  recruitmentNumber: number | null;      // 모집인원(최종)
  competitionRatio: string | null;       // 경쟁률 (소수점 2자리)
  additionalAcceptanceRank: number | null; // 충원합격순위
  convertedScoreTotal: string | null;    // 환산점수 총점
  convertedScore50Cut: string | null;    // 환산점수 50%컷
  convertedScore70Cut: string | null;    // 환산점수 70%컷
  percentile50Cut: string | null;        // 백분위 50%컷
  percentile70Cut: string | null;        // 백분위 70%컷
}

/**
 * 정시 입결분석 API 응답 타입
 * GET /jungsi/admissions/:admissionId/previous-results
 */
export interface IPreviousResultsResponse {
  admissionId: number;
  universityName: string;
  recruitmentName: string;
  previousResults: IPreviousResultItem[];
}
