import { Module } from '@nestjs/common';
import { MyClassController } from './my-class.controller';
import { MyClassService } from './my-class.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HubClientModule } from '../hub-client';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, HubClientModule, AuthModule],
  controllers: [MyClassController],
  providers: [MyClassService],
})
export class MyClassModule {}
