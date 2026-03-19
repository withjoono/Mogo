'use client';

/**
 * T Skool 로그인 버튼 컴포넌트
 * Hub 로그인 페이지로 리디렉트
 */

import { redirectToHubLogin, redirectToHubRegister } from '@/lib/auth/hub-login';
import { Button } from '@/components/ui/button';

interface LoginButtonProps {
  returnPath?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function LoginButton({
  returnPath = '/',
  variant = 'default',
  size = 'default',
  className,
}: LoginButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => redirectToHubLogin(returnPath)}
    >
      T Skool 계정으로 로그인
    </Button>
  );
}

export function RegisterButton({
  returnPath = '/',
  variant = 'outline',
  size = 'default',
  className,
}: LoginButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => redirectToHubRegister(returnPath)}
    >
      회원가입
    </Button>
  );
}
