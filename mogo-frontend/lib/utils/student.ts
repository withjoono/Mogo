/**
 * 학생 ID 관리 유틸리티
 * 임시 학생 ID를 localStorage에 저장하여 관리
 * 향후 인증 시스템 도입 시 교체 예정
 */

const STUDENT_ID_KEY = 'gb_examinfo_student_id';

/**
 * 현재 학생 ID 조회
 * localStorage에 없으면 새 ID 생성
 */
export function getStudentId(): number {
  if (typeof window === 'undefined') {
    return 1; // SSR 환경에서는 기본값 반환
  }

  const stored = localStorage.getItem(STUDENT_ID_KEY);
  if (stored) {
    return Number(stored);
  }

  // 새 ID 생성 (기본 테스트 학생 ID)
  const newId = 1;
  localStorage.setItem(STUDENT_ID_KEY, String(newId));
  return newId;
}

/**
 * 학생 ID 설정
 */
export function setStudentId(id: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STUDENT_ID_KEY, String(id));
}

/**
 * 학생 ID 초기화 (로그아웃 시 사용)
 */
export function clearStudentId(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STUDENT_ID_KEY);
}

/**
 * 학생 ID 존재 여부 확인
 */
export function hasStudentId(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(STUDENT_ID_KEY) !== null;
}
