"use client";

/**
 * 공유 푸터 컴포넌트 (Shared Footer)
 *
 * 모든 앱에서 동일하게 사용하는 푸터입니다.
 * - 프레임워크 독립적: <a> 태그만 사용 (TanStack, Next.js 모두 호환)
 * - 이미지: /logo.png, /icons/youtube.png, /icons/naver-cafe.png 을 각 앱의 public/ 폴더에 넣어주세요.
 * - 정책 링크: Hub 본사이트 절대 URL 사용
 *
 * 수정 시 모든 앱에 동일하게 반영해주세요.
 * 앱 목록: Hub, ExamHub, Jungsi (MySanggibu, Grinalda 등 추가 시 동일 적용)
 */

const HUB_URL = "https://www.tskool.kr";

export const Footer = () => {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900/50 py-6 sm:py-8">
      <div className="mx-auto w-full max-w-screen-lg px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr_auto] sm:gap-10">
          {/* Column 1: Logo + Company Name */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <img
              className="h-auto w-16 sm:w-20 rounded-xl"
              src="/logo.png"
              alt="거북스쿨 로고"
            />
            <span className="text-base sm:text-lg font-semibold text-foreground">
              (주)거북스쿨
            </span>
          </div>

          {/* Column 2: Business Details + Policy Links */}
          <div className="flex flex-col gap-3 text-center">
            <div className="flex flex-col gap-1 text-xs text-foreground/70 sm:text-sm">
              <span>사업체명 (주)거북스쿨 | 대표 강준호</span>
              <span>사업자등록번호 772-87-02782 | 연락처 042-484-3356</span>
              <span>서울시 성북구 화랑로 211 성북구 기술창업센터 105호</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium pt-1">
              <a
                href={`${HUB_URL}/explain/service`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                이용약관
              </a>
              <a
                href={`${HUB_URL}/explain/refund`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                환불규정
              </a>
              <a
                href={`${HUB_URL}/explain/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline"
              >
                개인정보처리방침
              </a>
            </div>
          </div>

          {/* Column 3: Social Media */}
          <div className="flex flex-col items-center sm:items-end gap-3">
            <div className="flex items-center gap-4">
              <a
                href="https://www.youtube.com/@turtleschool_official"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <img
                  className="h-10 w-10 rounded-lg"
                  src="/icons/youtube.png"
                  alt="YouTube"
                />
              </a>
              <a
                href="https://cafe.naver.com/turtlecorp"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <img
                  className="h-10 w-10 rounded-lg"
                  src="/icons/naver-cafe.png"
                  alt="네이버 카페"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-foreground/10 pt-2 text-center text-xs text-foreground/50">
          © {new Date().getFullYear()} (주)거북스쿨. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
