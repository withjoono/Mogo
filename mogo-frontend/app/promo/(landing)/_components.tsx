import Link from "next/link";
import { ArrowRight, CheckCircle2, LucideIcon } from "lucide-react";

/** ===== 공통 promo 컴포넌트 =====
 *  Phase 1 레퍼런스. 위성앱 promo 페이지 모두 동일 패턴으로 복제할 예정.
 */

export function PromoHero({
  badge,
  title,
  highlight,
  body,
  primaryHref = "/main",
  primaryLabel = "시작하기",
  secondaryHref,
  secondaryLabel,
  Icon,
}: {
  badge?: string;
  title: string;
  highlight?: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  Icon?: LucideIcon;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-background to-background">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-12 sm:py-24">
        {badge && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
            {badge}
          </div>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {title}
          {highlight && <span className="text-primary"> {highlight}</span>}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{body}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center rounded-xl border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              {secondaryLabel || "더 알아보기"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function PromoSection({
  title,
  subtitle,
  children,
  tone = "default",
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <section
      className={
        tone === "muted"
          ? "bg-secondary/30 px-6 py-16 sm:px-12 sm:py-20"
          : "px-6 py-16 sm:px-12 sm:py-20"
      }
    >
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="text-center">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        <div className={title || subtitle ? "mt-12" : ""}>{children}</div>
      </div>
    </section>
  );
}

export function FeatureGrid({
  items,
  columns = 3,
}: {
  items: { icon: LucideIcon; title: string; body: string }[];
  columns?: 2 | 3;
}) {
  const cols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid gap-4 ${cols}`}>
      {items.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.title} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StepList({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4 rounded-2xl border bg-card p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            {i + 1}
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((r) => (
        <li
          key={r}
          className="flex items-start gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-foreground"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <span>{r}</span>
        </li>
      ))}
    </ul>
  );
}

export function FinalCTA({
  title,
  body,
  Icon,
  primaryHref = "/main",
  primaryLabel = "시작하기",
}: {
  title: string;
  body: string;
  Icon: LucideIcon;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-12 sm:py-20">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground">{body}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
