"use client";

import { useState, useEffect, useCallback } from 'react';
import { universityApi } from '../api';
import type { University, Department, FilterUniversityParams } from '../api/types';

/**
 * 대학 목록 조회 훅
 */
export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        const data = await universityApi.getAll();
        setUniversities(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '대학 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  return { universities, loading, error };
}

/**
 * 대학 필터링 훅
 */
export function useFilteredUniversities(initialParams?: FilterUniversityParams) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FilterUniversityParams>(initialParams || {});

  const filter = useCallback(async (filterParams: FilterUniversityParams) => {
    try {
      setLoading(true);
      const data = await universityApi.filter(filterParams);
      setUniversities(data);
      setError(null);
      setParams(filterParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : '필터링에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    filter(params);
  }, []);

  return { universities, loading, error, filter, params };
}

/**
 * 지역/계열 목록 조회 훅
 */
export function useUniversityOptions() {
  const [regions, setRegions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const [regionsData, categoriesData] = await Promise.all([
          universityApi.getRegions(),
          universityApi.getCategories(),
        ]);
        setRegions(regionsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '옵션을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { regions, categories, loading, error };
}

/**
 * 대학 상세 조회 훅
 */
export function useUniversity(id: number | null) {
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (universityId: number) => {
    try {
      setLoading(true);
      const data = await universityApi.getById(universityId);
      setUniversity(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '대학 정보를 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetch(id);
    }
  }, [id]);

  return { university, loading, error, fetch };
}

/**
 * 학과 상세 조회 훅
 */
export function useDepartment(id: number | null) {
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (departmentId: number) => {
    try {
      setLoading(true);
      const data = await universityApi.getDepartment(departmentId);
      setDepartment(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '학과 정보를 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetch(id);
    }
  }, [id]);

  return { department, loading, error, fetch };
}








