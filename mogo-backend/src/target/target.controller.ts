import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TargetService } from './target.service';
import {
  CreateTargetDto,
  UpdateTargetDto,
} from './dto/target-request.dto';
import {
  TargetListResponseDto,
  TargetUniversityDto,
  TargetComparisonResponseDto,
} from './dto/target-response.dto';

@ApiTags('목표 대학')
@Controller('api/targets')
export class TargetController {
  constructor(private readonly targetService: TargetService) { }

  @Get(':studentId')
  @ApiOperation({ summary: '목표 대학 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '목표 대학 목록',
    type: TargetListResponseDto,
  })
  async findByStudent(@Param('studentId') studentId: string) {
    const data = await this.targetService.findByStudent(studentId);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: '목표 대학 추가' })
  @ApiResponse({
    status: 201,
    description: '추가된 목표 대학',
    type: TargetUniversityDto,
  })
  async create(@Body() createDto: CreateTargetDto) {
    const data = await this.targetService.create(createDto);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: '목표 대학 수정' })
  @ApiResponse({
    status: 200,
    description: '수정된 목표 대학',
    type: TargetUniversityDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTargetDto,
  ) {
    const data = await this.targetService.update(id, updateDto);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: '목표 대학 삭제' })
  @ApiResponse({ status: 200, description: '삭제 완료' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.targetService.remove(id);
    return { success: true, message: '목표 대학이 삭제되었습니다.' };
  }

  @Get(':studentId/comparison')
  @ApiOperation({ summary: '목표 대학 비교 분석 - 내 성적 vs 입결' })
  @ApiQuery({ name: 'startYear', required: false, type: Number, description: '시작 연도' })
  @ApiQuery({ name: 'endYear', required: false, type: Number, description: '종료 연도' })
  @ApiQuery({ name: 'targetId', required: false, type: Number, description: '특정 목표만 조회' })
  @ApiResponse({
    status: 200,
    description: '목표 대학 비교 분석 결과',
    type: TargetComparisonResponseDto,
  })
  async getComparison(
    @Param('studentId') studentId: string,
    @Query('startYear') startYear?: string,
    @Query('endYear') endYear?: string,
    @Query('targetId') targetId?: string,
  ) {
    const params = {
      startYear: startYear ? parseInt(startYear, 10) : undefined,
      endYear: endYear ? parseInt(endYear, 10) : undefined,
      targetId: targetId ? parseInt(targetId, 10) : undefined,
    };
    const data = await this.targetService.getComparison(studentId, params);
    return { success: true, data };
  }
}
