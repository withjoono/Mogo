import Link from "next/link";
import {
  ArrowRight,
  PencilLine,
  CheckCheck,
  NotebookPen,
  Activity,
  GraduationCap,
  Target,
  Network,
  Home,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/promo", label: "홈", icon: Home, exact: true },
  { href: "/promo/input", label: "정답 입력", icon: PencilLine },
  { href: "/promo/auto-grade", label: "자동 채점", icon: CheckCheck },
  { href: "/promo/wrong-notes", label: "오답 노트", icon: NotebookPen },
  { href: "/promo/weakness", label: "약점 분석", icon: Activity },
  { href: "/promo/predict", label: "정시 예측", icon: GraduationCap },
  { href: "/promo/target", label: "목표 대학", icon: Target },
  { href: "/promo/ecosystem", label: "생태계 연동", icon: Network },
];

export default function PromoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="min-h-screen bg-background"
      style={
        {
          // Override --primary to MogoMogo cyan brand color for the entire promo subtree.
          // All bg-primary / text-primary / text-primary-foreground utilities below inherit this.
          ["--primary" as string]: "#00b8bb",
          ["--primary-foreground" as string]: "#ffffff",
          ["--ring" as string]: "#00b8bb",
        } as React.CSSProperties
      }
    >
      {/* ===== TOP NAV ===== */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/promo" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              M
            </div>
            <span className="text-base font-semibold text-foreground">모고앱</span>
          </Link>
          <Link
            href="/main"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            시작하기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* feature tabs */}
        <nav className="border-t bg-card/50">
          <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
            <ul className="flex min-w-max items-center gap-1 py-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {children}

      <footer className="border-t bg-card py-8 text-center text-xs text-muted-foreground">
        © 거북스쿨 · MogoMogo ·{" "}
        <a
          href="https://www.tskool.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          tskool.kr
        </a>
      </footer>
    </div>
  );
}
