import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // PostgreSQL 연결 풀 생성 (search_path로 hub 스키마 포함 - 다른 앱 TypeORM과 동일 방식)
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({
      connectionString,
      options: '-c search_path=mogo,hub',
    });
    const adapter = new PrismaPg(pool, { schema: 'mogo' });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    // 개발/테스트 환경에서 모든 테이블 초기화 (외래키 순서 고려)
    // 삭제 순서: 외래키 참조가 있는 테이블부터 삭제

    await this.studentTarget.deleteMany();
    await this.studentScore.deleteMany();
    await this.examQuestion.deleteMany();
    await this.admissionCutoff.deleteMany();
    await this.scoreConversion2015.deleteMany();
    await this.scoreConversionRaw2015.deleteMany();
    await this.scoreConversion2022.deleteMany();
    await this.scoreConversionRaw2022.deleteMany();
    await this.cumulativeTopPct2015.deleteMany();
    await this.department.deleteMany();
    await this.university.deleteMany();
    await this.subjectChapter.deleteMany();
    await this.mockExam.deleteMany();

    await this.member.deleteMany();
  }
}
