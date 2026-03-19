"use client";

import { useState, useEffect, useCallback } from 'react';
import { mockExamApi } from '../api';
import type { MockExam, SearchMockExamParams, KyokwaSubject } from '../api/types';

/**
 * 모의고사 목록 조회 훅
 */
export function useMockExams() {
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMockExams = async () => {
      try {
        setLoading(true);
        const data = await mockExamApi.getAll();
        setMockExams(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '모의고사 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMockExams();
  }, []);

  return { mockExams, loading, error };
}

/**
 * 모의고사 검색 훅
 */
export function useMockExamSearch(params: SearchMockExamParams) {
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchParams: SearchMockExamParams) => {
    if (!searchParams.year && !searchParams.grade && !searchParams.month) {
      return;
    }

    try {
      setLoading(true);
      const data = await mockExamApi.search(searchParams);
      setMockExams(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(params);
  }, [params.year, params.grade, params.month]);

  return { mockExams, loading, error, search };
}

/**
 * 모의고사 존재 여부 확인 훅
 */
export function useMockExamExists() {
  const [exists, setExists] = useState<boolean | null>(null);
  const [mockExam, setMockExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async (year: number, grade: string, month: number) => {
    try {
      setLoading(true);
      const data = await mockExamApi.checkExists(year, grade, month);
      setExists(data.exists);
      setMockExam(data.mockExam);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '확인에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { exists, mockExam, loading, error, check };
}

/**
 * 교과/과목 목록 조회 훅 (hub 공유 테이블)
 */
export function useKyokwaSubjects(curriculum?: '2015' | '2022') {
  const [subjects, setSubjects] = useState<KyokwaSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const data = await mockExamApi.getKyokwaSubjects(curriculum);
        setSubjects(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '교과/과목을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [curriculum]);

  return { subjects, loading, error };
}









