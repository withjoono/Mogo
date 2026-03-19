'use client';

/**
 * 개발용 임시 로그인 컴포넌트
 * SSO 개발 전까지 임시로 사용
 */

import { useState, useEffect } from 'react';
import { getStudentId, setStudentId, clearStudentId, hasStudentId } from '@/lib/utils/student';

export function DevLoginBanner() {
  const [studentId, setLocalStudentId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // 클라이언트에서만 실행
    const id = hasStudentId() ? getStudentId() : null;
    setLocalStudentId(id);
  }, []);

  const handleLogin = () => {
    const newId = inputValue ? Number(inputValue) : getStudentId();
    setStudentId(newId);
    setLocalStudentId(newId);
    setIsEditing(false);
    setInputValue('');
  };

  const handleLogout = () => {
    clearStudentId();
    setLocalStudentId(null);
  };

  const handleQuickLogin = () => {
    // 개발용 기본 학생 ID로 빠른 로그인
    const devStudentId = 1;
    setStudentId(devStudentId);
    setLocalStudentId(devStudentId);
  };

  // 프로덕션 환경에서는 표시하지 않음
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-yellow-800 font-medium text-sm">🔧 개발 모드</span>
          {studentId ? (
            <span className="text-yellow-700 text-sm">
              로그인됨: <strong>학생 ID {studentId}</strong>
            </span>
          ) : (
            <span className="text-yellow-700 text-sm">로그인 필요</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!studentId ? (
            <>
              <button
                onClick={handleQuickLogin}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                빠른 로그인 (ID: 1)
              </button>
              {isEditing ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="학생 ID"
                    className="w-24 px-2 py-1 border border-yellow-400 rounded text-sm"
                  />
                  <button
                    onClick={handleLogin}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-sm"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  ID 직접 입력
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                ID 변경
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 현재 로그인된 학생 ID를 반환하는 훅
 */
export function useDevAuth() {
  const [studentId, setLocalStudentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = hasStudentId() ? getStudentId() : null;
    setLocalStudentId(id);
    setIsLoading(false);
  }, []);

  return {
    studentId,
    isLoggedIn: studentId !== null,
    isLoading,
  };
}
