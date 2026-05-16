import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

/**
 * 컨트롤러에서 raw `Authorization: Bearer <jwt>` 헤더를 그대로 추출.
 * Hub로 user JWT를 forward하는 용도. 토큰을 decode/검증하지 않음
 * (JwtAuthGuard가 이미 검증한 상태로 진입한다고 가정).
 */
export const AuthHeader = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const header = req.headers?.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Authorization header missing');
    }
    return header;
  },
);
