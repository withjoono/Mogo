/**
 * 정시 페이지 색상 규칙
 * Primary Color: Purple (Grape) #7b1e7a
 */

export const jungsi = {
  primary: "#7b1e7a",      // 메인 색상
  primaryDark: "#5a1559",  // 호버/다크
  primaryLight: "#f3e8f3", // 밝은 배경
  primaryVeryLight: "#faf5fa", // 매우 밝은 배경
  bg: "from-[#7b1e7a] to-[#5a1559]", // 그라디언트
  text: "text-[#7b1e7a]",
  border: "border-[#d4a5d3]",
  hover: "hover:bg-[#5a1559]",
  ring: "ring-[#7b1e7a]",
} as const;

/**
 * Tailwind 클래스 매핑
 * 
 * | 용도        | 색상                              | 클래스                           |
 * |-------------|-----------------------------------|----------------------------------|
 * | Primary     | #7b1e7a                           | bg-grape-500                     |
 * | Gradient    | from-#7b1e7a to-#5a1559           | bg-gradient-to-r from-grape-500  |
 * | Light BG    | #f3e8f3                           | bg-grape-100                     |
 * | Very Light  | #faf5fa                           | bg-grape-50                      |
 * | Border      | #d4a5d3                           | border-grape-200                 |
 * | Dark Text   | #5a1559                           | text-grape-700                   |
 * | Hover       | #5a1559                           | hover:bg-grape-600               |
 * | Accent Text | #f3e8f3 (on dark bg)              | text-grape-100                   |
 */

// CSS 클래스 상수
export const grapeColors = {
  // 배경
  bgPrimary: "bg-[#7b1e7a]",
  bgHover: "hover:bg-[#5a1559]",
  bgLight: "bg-[#f3e8f3]",
  bgVeryLight: "bg-[#faf5fa]",
  bgGradient: "bg-gradient-to-r from-[#7b1e7a] to-[#5a1559]",
  
  // 텍스트
  textPrimary: "text-[#7b1e7a]",
  textDark: "text-[#5a1559]",
  textLight: "text-[#f3e8f3]",
  
  // 테두리
  borderPrimary: "border-[#7b1e7a]",
  borderLight: "border-[#d4a5d3]",
  
  // 링
  ringPrimary: "ring-[#7b1e7a]",
  
  // 포커스
  focusRing: "focus:ring-[#7b1e7a]",
  focusBorder: "focus:border-[#7b1e7a]",
  
  // 조합 클래스
  button: "bg-[#7b1e7a] hover:bg-[#5a1559] text-white",
  buttonOutline: "border-[#7b1e7a] text-[#7b1e7a] hover:bg-[#faf5fa]",
  badge: "bg-[#f3e8f3] text-[#7b1e7a]",
  link: "text-[#7b1e7a] hover:text-[#5a1559]",
} as const;

// 색상 값
export const grapeColorValues = {
  500: "#7b1e7a", // primary
  600: "#6a1969", // hover darker
  700: "#5a1559", // dark
  100: "#f3e8f3", // light bg
  50: "#faf5fa",  // very light
  200: "#d4a5d3", // border
} as const;








