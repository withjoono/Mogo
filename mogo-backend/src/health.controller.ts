import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'mogo-backend',
    };
  }

  @Get('/')
  @ApiOperation({ summary: 'Root endpoint' })
  root() {
    return {
      name: 'Mogo Backend API',
      version: '1.0.0',
      status: 'running',
    };
  }
}
