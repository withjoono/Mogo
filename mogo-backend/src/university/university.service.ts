import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterUniversityDto } from './dto/filter-university.dto';

@Injectable()
export class UniversityService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 모든 대학 목록 조회
   */
  async findAll() {
    return this.prisma.university.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * 대학 ID로 조회
   */
  async findById(id: number) {
    const university = await this.prisma.university.findUnique({
      where: { id },
      include: {
        departments: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!university) {
      throw new NotFoundException(`대학 ID ${id}를 찾을 수 없습니다.`);
    }

    return university;
  }

  /**
   * 대학 필터링 (지역/계열)
   */
  async filter(filterDto: FilterUniversityDto) {
    const { region, category } = filterDto;

    // 대학 필터
    const universityWhere: any = {};
    if (region && region !== '전체') {
      universityWhere.region = region;
    }

    // 학과 필터 (계열)
    const departmentWhere: any = {};
    if (category && category !== '전체') {
      departmentWhere.category = category;
    }

    const universities = await this.prisma.university.findMany({
      where: universityWhere,
      include: {
        departments: {
          where: departmentWhere,
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // 학과가 있는 대학만 필터링
    return universities.filter((u) => u.departments.length > 0);
  }

  /**
   * 지역 목록 조회
   */
  async getRegions() {
    const regions = await this.prisma.university.findMany({
      distinct: ['region'],
      select: { region: true },
      where: { region: { not: null } },
      orderBy: { region: 'asc' },
    });

    return ['전체', ...regions.map((r) => r.region).filter(Boolean)];
  }

  /**
   * 계열 목록 조회
   */
  async getCategories() {
    const categories = await this.prisma.department.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { category: { not: null } },
      orderBy: { category: 'asc' },
    });

    return ['전체', ...categories.map((c) => c.category).filter(Boolean)];
  }

  /**
   * 학과 상세 조회
   */
  async getDepartment(departmentId: number) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        university: true,
        admissionCutoffs: {
          orderBy: { year: 'desc' },
          take: 3, // 최근 3년 입결
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`학과 ID ${departmentId}를 찾을 수 없습니다.`);
    }

    return department;
  }

  /**
   * 입결 데이터 조회
   */
  async getAdmissionCutoffs(departmentId: number, mockExamId?: number) {
    const where: any = { departmentId };
    if (mockExamId) where.mockExamId = mockExamId;

    return this.prisma.admissionCutoff.findMany({
      where,
      include: {
        mockExam: true,
      },
      orderBy: { year: 'desc' },
    });
  }

  /**
   * 대학 예측용 데이터 조회 (1000점 환산)
   */
  async getPredictionData(filters: FilterUniversityDto, studentScore: any) {
    const universities = await this.filter(filters);

    return universities.map((university) => {
      return {
        university: {
          id: university.id,
          name: university.name,
          region: university.region,
        },
        departments: university.departments.map((dept) => {
          // 1000점 환산 계산
          const convertedScore = this.convertTo1000(studentScore, dept, university);

          return {
            id: dept.id,
            name: dept.name,
            category: dept.category,
            admissionGroup: dept.admissionGroup,
            myScore: convertedScore,
            // 입결은 별도 조회 필요
          };
        }),
      };
    });
  }

  /**
   * 1000점 통일 환산
   */
  private convertTo1000(score: any, department: any, university: any): number {
    if (!university.conversionRate) {
      // 환산율이 없으면 기본 계산
      return 0;
    }

    // 대학별 환산식 적용 (간략화된 버전)
    // 실제로는 대학별 반영비율, 가산점 등을 적용해야 함
    let totalScore = 0;

    // 표준점수 합계 기준
    if (score.totalStandardSum) {
      totalScore = score.totalStandardSum;
    }

    // 환산율 적용
    return Math.round(totalScore * Number(university.conversionRate) * 100) / 100;
  }

  /**
   * 대학명 검색 (자동완성용)
   */
  async searchUniversities(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return this.prisma.university.findMany({
      where: {
        name: {
          contains: query.trim(),
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
        region: true,
      },
      orderBy: { name: 'asc' },
      take: 20,
    });
  }

  /**
   * 특정 대학의 학과(모집단위) 목록 조회
   */
  async getDepartmentsByUniversityId(universityId: number) {
    const university = await this.prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      throw new NotFoundException(`대학 ID ${universityId}를 찾을 수 없습니다.`);
    }

    const departments = await this.prisma.department.findMany({
      where: { universityId },
      select: {
        id: true,
        code: true,
        name: true,
        category: true,
        subCategory: true,
        admissionType: true,
        quota: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      university: {
        id: university.id,
        name: university.name,
        region: university.region,
      },
      departments,
    };
  }

  /**
   * 학과명/계열 검색 (모집단위 검색)
   */
  async searchDepartments(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const q = query.trim();

    // 학과명 또는 subCategory에 검색어가 포함된 모집단위 조회
    const departments = await this.prisma.department.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { subCategory: { contains: q } },
          { category: { contains: q } },
        ],
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
      orderBy: [
        { university: { name: 'asc' } },
        { name: 'asc' },
      ],
      take: 100,
    });

    return departments;
  }
}






