"use client";

import { useState, useCallback } from 'react';
import { scoreApi } from '../api';
import type { StudentScore, CreateScoreDto } from '../api/types';

/**
 * 점수 저장 훅
 */
export function useSaveScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedScore, setSavedScore] = useState<StudentScore | null>(null);

  const save = useCallback(async (data: CreateScoreDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scoreApi.create(data);
      setSavedScore(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '점수 저장에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { save, loading, error, savedScore };
}

/**
 * 학생 점수 목록 조회 훅
 */
export function useStudentScores(studentId: number | null) {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const data = await scoreApi.getByStudent(id);
      setScores(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '점수 목록을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // studentId가 변경되면 자동 조회
  // useEffect(() => {
  //   if (studentId) {
  //     fetch(studentId);
  //   }
  // }, [studentId]);

  return { scores, loading, error, fetch };
}

/**
 * 특정 점수 조회 훅
 */
export function useScore(studentId: number | null, mockExamId: number | null) {
  const [score, setScore] = useState<StudentScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (sId: number, mId: number) => {
    try {
      setLoading(true);
      const data = await scoreApi.getOne(sId, mId);
      setScore(data);
      setError(null);
      return data;
    } catch (err) {
      // 점수가 없는 경우는 에러로 처리하지 않음
      setScore(null);
      setError(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { score, loading, error, fetch };
}

/**
 * 점수 수정 훅
 */
export function useUpdateScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: number, data: Partial<CreateScoreDto>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scoreApi.update(id, data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '점수 수정에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

/**
 * 점수 삭제 훅
 */
export function useDeleteScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await scoreApi.delete(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '점수 삭제에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { remove, loading, error };
}








