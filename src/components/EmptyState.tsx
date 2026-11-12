import type { LucideIcon } from "lucide-react";
import { iconLg } from "./icon";

/**
 * Shown in place of a list or data view that has nothing in it yet.
 * Says what will appear here and gives the one action that fills it.
 */
export default function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-ink/20 bg-canvas p-8">
      <span className="grid h-10 w-10 place-items-center rounded-md border border-line bg-surface text-navy">
        <Icon {...iconLg} />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}
