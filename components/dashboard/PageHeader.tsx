import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, meta, actions }: PageHeaderProps) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,247,241,0.82))] px-4 py-4 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.32)] sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mt-3 text-[24px] font-semibold leading-tight text-neutral-950 sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-[15px]">
            {description}
          </p>
          {meta ? <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? <div className="flex w-full shrink-0 flex-wrap items-center gap-2 lg:w-auto lg:justify-end">{actions}</div> : null}
      </div>
    </div>
  );
}
