type Color = "red" | "green" | "indigo" | "amber" | "slate" | "purple";

const colors: Record<Color, string> = {
  red: "bg-red-50 text-red-700 ring-red-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

export default function Badge({
  children,
  color = "slate",
}: {
  children: React.ReactNode;
  color?: Color;
}) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${colors[color]}`}
    >
      {children}
    </span>
  );
}