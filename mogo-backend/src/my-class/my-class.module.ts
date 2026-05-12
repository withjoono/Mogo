import { Module } from '@nestjs/common';
import { MyClassController } from './my-class.controller';
import { MyClassService } from './my-class.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MyClassController],
  providers: [MyClassService],
})
export class MyClassModule {}
