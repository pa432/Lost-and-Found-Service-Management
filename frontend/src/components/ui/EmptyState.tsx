import { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-4">
        <Icon className="w-10 h-10 text-indigo-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}