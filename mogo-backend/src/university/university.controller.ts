import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UniversityService } from './university.service';
import { FilterUniversityDto } from './dto/filter-university.dto';

@ApiTags('대학')
@Controller('api/universities')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) { }

  @Get()
  @ApiOperation({ summary: '대학 목록 조회' })
  async findAll() {
    const data = await this.universityService.findAll();
    return { success: true, data };
  }

  @Get('search')
  @ApiOperation({ summary: '대학명 검색 (자동완성)' })
  @ApiQuery({ name: 'q', required: true, description: '검색어' })
  async searchUniversities(@Query('q') query: string) {
    const data = await this.universityService.searchUniversities(query);
    return { success: true, data };
  }

  @Get('departments/search')
  @ApiOperation({ summary: '모집단위/계열 검색' })
  @ApiQuery({ name: 'q', required: true, description: '검색어 (예: 의대, 컴퓨터)' })
  async searchDepartments(@Query('q') query: string) {
    const data = await this.universityService.searchDepartments(query);
    return { success: true, data };
  }

  @Get('filter')
  @ApiOperation({ summary: '대학 필터링 (지역/계열)' })
  @ApiQuery({ name: 'region', required: false, description: '지역 (서울, 경기 등)' })
  @ApiQuery({ name: 'category', required: false, description: '계열 (자연, 인문 등)' })
  async filter(@Query() filterDto: FilterUniversityDto) {
    const data = await this.universityService.filter(filterDto);
    return { success: true, data };
  }

  @Get('regions')
  @ApiOperation({ summary: '지역 목록 조회' })
  async getRegions() {
    const data = await this.universityService.getRegions();
    return { success: true, data };
  }

  @Get('categories')
  @ApiOperation({ summary: '계열 목록 조회' })
  async getCategories() {
    const data = await this.universityService.getCategories();
    return { success: true, data };
  }

  @Get('departments/:departmentId')
  @ApiOperation({ summary: '학과 상세 조회' })
  async getDepartment(@Param('departmentId', ParseIntPipe) departmentId: number) {
    const data = await this.universityService.getDepartment(departmentId);
    return { success: true, data };
  }

  @Get('departments/:departmentId/cutoffs')
  @ApiOperation({ summary: '학과 입결 데이터 조회' })
  @ApiQuery({ name: 'mockExamId', required: false, type: Number })
  async getAdmissionCutoffs(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Query('mockExamId') mockExamId?: number,
  ) {
    const data = await this.universityService.getAdmissionCutoffs(
      departmentId,
      mockExamId ? Number(mockExamId) : undefined,
    );
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: '대학 상세 조회' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.universityService.findById(id);
    return { success: true, data };
  }

  @Get(':id/departments')
  @ApiOperation({ summary: '대학별 학과 목록 조회' })
  async getDepartmentsByUniversity(@Param('id', ParseIntPipe) id: number) {
    const data = await this.universityService.getDepartmentsByUniversityId(id);
    return { success: true, data };
  }
}
