/**
 * 정시 페이지 색상 규칙
 * Primary Color: Purple (Grape) #00e5e8
 */

export const jungsi = {
  primary: "#00e5e8",      // 메인 색상
  primaryDark: "#00b8bb",  // 호버/다크
  primaryLight: "#e0fffe", // 밝은 배경
  primaryVeryLight: "#f0fffe", // 매우 밝은 배경
  bg: "from-[#00e5e8] to-[#00b8bb]", // 그라디언트
  text: "text-[#00e5e8]",
  border: "border-[#d4a5d3]",
  hover: "hover:bg-[#00b8bb]",
  ring: "ring-[#00e5e8]",
} as const;

/**
 * Tailwind 클래스 매핑
 * 
 * | 용도        | 색상                              | 클래스                           |
 * |-------------|-----------------------------------|----------------------------------|
 * | Primary     | #00e5e8                           | bg-grape-500                     |
 * | Gradient    | from-#00e5e8 to-#00b8bb           | bg-gradient-to-r from-grape-500  |
 * | Light BG    | #e0fffe                           | bg-grape-100                     |
 * | Very Light  | #f0fffe                           | bg-grape-50                      |
 * | Border      | #d4a5d3                           | border-grape-200                 |
 * | Dark Text   | #00b8bb                           | text-grape-700                   |
 * | Hover       | #00b8bb                           | hover:bg-grape-600               |
 * | Accent Text | #e0fffe (on dark bg)              | text-grape-100                   |
 */

// CSS 클래스 상수
export const grapeColors = {
  // 배경
  bgPrimary: "bg-[#00e5e8]",
  bgHover: "hover:bg-[#00b8bb]",
  bgLight: "bg-[#e0fffe]",
  bgVeryLight: "bg-[#f0fffe]",
  bgGradient: "bg-gradient-to-r from-[#00e5e8] to-[#00b8bb]",
  
  // 텍스트
  textPrimary: "text-[#00e5e8]",
  textDark: "text-[#00b8bb]",
  textLight: "text-[#e0fffe]",
  
  // 테두리
  borderPrimary: "border-[#00e5e8]",
  borderLight: "border-[#d4a5d3]",
  
  // 링
  ringPrimary: "ring-[#00e5e8]",
  
  // 포커스
  focusRing: "focus:ring-[#00e5e8]",
  focusBorder: "focus:border-[#00e5e8]",
  
  // 조합 클래스
  button: "bg-[#00e5e8] hover:bg-[#00b8bb] text-white",
  buttonOutline: "border-[#00e5e8] text-[#00e5e8] hover:bg-[#f0fffe]",
  badge: "bg-[#e0fffe] text-[#00e5e8]",
  link: "text-[#00e5e8] hover:text-[#00b8bb]",
} as const;

// 색상 값
export const grapeColorValues = {
  500: "#00e5e8", // primary
  600: "#6a1969", // hover darker
  700: "#00b8bb", // dark
  100: "#e0fffe", // light bg
  50: "#f0fffe",  // very light
  200: "#d4a5d3", // border
} as const;








