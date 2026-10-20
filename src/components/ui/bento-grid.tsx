import React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[19rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-2xl transition duration-200 p-5 dark:bg-neutral-900/60 dark:border-white/[0.08] bg-white border border-neutral-200/80 justify-between flex flex-col space-y-4 backdrop-blur-sm",
        className,
      )}
    >
      {header}
      <div className="transition duration-200">
        <div className="mb-2 text-primary">{icon}</div>
        <div className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1.5 text-base tracking-tight">
          {title}
        </div>
        <div className="font-normal text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
}
