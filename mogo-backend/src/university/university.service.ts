import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterUniversityDto } from './dto/filter-university.dto';

@Injectable()
export class UniversityService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return this.prisma.university.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: number) {
    const university = await this.prisma.university.findUnique({
      where: { id },
      include: { departments: { orderBy: { name: 'asc' } } },
    });
    if (!university) throw new NotFoundException(`대학 ID ${id}를 찾을 수 없습니다.`);
    return university;
  }

  async filter(filterDto: FilterUniversityDto) {
    const { region, category } = filterDto;
    const universityWhere: any = {};
    if (region && region !== '전체') universityWhere.region = region;
    const departmentWhere: any = {};
    if (category && category !== '전체') departmentWhere.category = category;
    const universities = await this.prisma.university.findMany({
      where: universityWhere,
      include: { departments: { where: departmentWhere, orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    return universities.filter((u) => u.departments.length > 0);
  }

  async getRegions() {
    const regions = await this.prisma.university.findMany({
      distinct: ['region'],
      select: { region: true },
      where: { region: { not: null } },
      orderBy: { region: 'asc' },
    });
    return ['전체', ...regions.map((r) => r.region).filter(Boolean)];
  }

  async getCategories() {
    const categories = await this.prisma.department.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { category: { not: null } },
      orderBy: { category: 'asc' },
    });
    return ['전체', ...categories.map((c) => c.category).filter(Boolean)];
  }

  async getDepartment(departmentId: number) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: { university: true, admissionCutoffs: { orderBy: { year: 'desc' }, take: 3 } },
    });
    if (!department) throw new NotFoundException(`학과 ID ${departmentId}를 찾을 수 없습니다.`);
    return department;
  }

  async getAdmissionCutoffs(departmentId: number, mockExamId?: number) {
    const where: any = { departmentId };
    if (mockExamId) where.mockExamId = mockExamId;
    return this.prisma.admissionCutoff.findMany({
      where,
      include: { mockExam: true },
      orderBy: { year: 'desc' },
    });
  }

  async getPredictionData(filters: FilterUniversityDto, studentScore: any) {
    const universities = await this.filter(filters);
    return universities.map((university) => ({
      university: { id: university.id, name: university.name, region: university.region },
      departments: university.departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        category: dept.category,
        admissionGroup: dept.admissionGroup,
        myScore: this.convertTo1000(studentScore, dept, university),
      })),
    }));
  }

  private convertTo1000(score: any, department: any, university: any): number {
    if (!university.conversionRate) return 0;
    let totalScore = 0;
    if (score.totalStandardSum) totalScore = score.totalStandardSum;
    return Math.round(totalScore * Number(university.conversionRate) * 100) / 100;
  }

  /**
   * 대학명 검색 (hub.susi_jonghap_recruitment 기반)
   */
  async searchUniversities(query: string) {
    if (!query || query.trim().length === 0) return [];
    const q = `%${query.trim()}%`;
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT MIN(id) as id, university_code as code, MIN(university_name) as name, MIN(region_major) as region
       FROM hub.susi_jonghap_recruitment
       WHERE university_name ILIKE $1
       GROUP BY university_code
       ORDER BY MIN(university_name)
       LIMIT 20`,
      q,
    );
    return rows.map((r) => ({
      id: Number(r.id),
      code: r.code as string,
      name: r.name as string,
      region: r.region as string,
    }));
  }

  /**
   * 특정 대학의 학과(모집단위) 목록 조회 (hub.susi_jonghap_recruitment 기반)
   */
  async getDepartmentsByUniversityId(universityId: number) {
    // Get the university_code from the hub table using the row id
    const univRows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT university_code, MIN(university_name) as name, MIN(region_major) as region
       FROM hub.susi_jonghap_recruitment
       WHERE id = $1
       GROUP BY university_code`,
      universityId,
    );

    if (univRows.length === 0) {
      throw new NotFoundException(`대학 ID ${universityId}를 찾을 수 없습니다.`);
    }

    const { university_code, name, region } = univRows[0];

    const depts = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, ida_id as code, recruitment_unit as name,
              major_field as category, minor_field as "subCategory",
              admission_type as "admissionType", recruitment_count as quota
       FROM hub.susi_jonghap_recruitment
       WHERE university_code = $1
       ORDER BY recruitment_unit`,
      university_code,
    );

    return {
      university: { id: universityId, name, region },
      departments: depts.map((d) => ({
        id: Number(d.id),
        code: d.code as string,
        name: d.name as string,
        category: (d.category as string) || null,
        subCategory: (d.subCategory as string) || null,
        admissionType: (d.admissionType as string) || null,
        quota: d.quota ? Number(d.quota) : null,
      })),
    };
  }

  /**
   * 학과명/계열 검색 (hub.susi_jonghap_recruitment 기반)
   */
  async searchDepartments(query: string) {
    if (!query || query.trim().length === 0) return [];
    const q = `%${query.trim()}%`;
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT MIN(r.id) as id, MIN(r.ida_id) as code, r.recruitment_unit as name,
              MIN(r.major_field) as category, MIN(r.minor_field) as "subCategory",
              MIN(r.admission_type) as "admissionType", MIN(r.recruitment_count) as quota,
              r.university_name, r.university_code, MIN(r.region_major) as region
       FROM hub.susi_jonghap_recruitment r
       WHERE r.recruitment_unit ILIKE $1
          OR r.major_field ILIKE $1
          OR r.minor_field ILIKE $1
       GROUP BY r.university_code, r.university_name, r.recruitment_unit
       ORDER BY r.university_name, r.recruitment_unit
       LIMIT 100`,
      q,
    );

    return rows.map((r) => ({
      id: Number(r.id),
      code: r.code as string,
      name: r.name as string,
      category: (r.category as string) || null,
      subCategory: (r.subCategory as string) || null,
      admissionType: (r.admissionType as string) || null,
      quota: r.quota ? Number(r.quota) : null,
      university: {
        id: Number(r.id),
        name: r.university_name as string,
        region: r.region as string,
      },
    }));
  }
}
