import { Controller, Get, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import * as jwt from 'jsonwebtoken';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  // @UseGuards(AuthGuard('jwt')) 
  getProfile(@Req() req) {
    const authHeader = (req.headers as any).authorization;
    if (!authHeader) return { status: 'Error', message: 'No Authorization header' };

    const token = authHeader.replace('Bearer ', '');
    // Debugging Secret
    const secret = process.env.AUTH_SECRET;
    if (!secret) return { status: 'Error', message: 'AUTH_SECRET not loaded from .env' };

    const secretBuffer = Buffer.from(secret, 'base64');

    try {
      // Manual Verification
      const decoded = jwt.verify(token, secretBuffer, { algorithms: ['HS512'] });
      return {
        success: true,
        user: decoded,
        debug: {
          secretPrefix: secret.substring(0, 5),
          algorithm: 'HS512'
        }
      };
    } catch (e) {
      // Return error details instead of 401
      return {
        success: false,
        error: e.message,
        debug: {
          secretPrefix: secret.substring(0, 5),
          tokenLength: token.length,
          receivedTokenPart: token.substring(0, 10) + '...'
        }
      };
    }
  }

  /**
   * SSO 코드 교환 (Backend Token Exchange)
   * Hub에서 받은 SSO 코드를 Hub Backend에 검증하고 토큰을 받아옵니다.
   * Susi의 /auth/sso/exchange와 동일한 패턴
   */
  @Post('auth/sso/exchange')
  async exchangeSsoCode(@Body() body: { code: string }) {
    const { code } = body;

    if (!code) {
      throw new HttpException('SSO 코드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }

    const hubBaseUrl = process.env.HUB_BASE_URL || 'http://localhost:4000';

    try {
      console.log('[SSO] Hub Backend에 코드 검증 요청:', code.substring(0, 20) + '...');

      // Hub Backend에 코드 검증 요청
      const response = await fetch(`${hubBaseUrl}/auth/sso/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          serviceId: 'examhub', // ExamHub 서비스 식별자
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('[SSO] Hub 코드 검증 실패:', result);
        throw new HttpException(
          result.message || 'SSO 코드가 유효하지 않거나 만료되었습니다.',
          HttpStatus.UNAUTHORIZED
        );
      }

      const tokenData = result.data || result;
      console.log('[SSO] Hub에서 토큰 받음 성공');

      return {
        success: true,
        data: {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          tokenExpiry: tokenData.tokenExpiry,
        },
      };
    } catch (error) {
      console.error('[SSO] 코드 교환 에러:', error.message);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'SSO 인증 처리 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
