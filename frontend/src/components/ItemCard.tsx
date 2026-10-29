import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import Badge from "./ui/Badge";

interface Item {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  location: string | null;
  imageUrl: string | null;
  date: string;
  user?: { name: string };
}

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="group card overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 flex items-center justify-center">
            <span className="text-5xl opacity-40">📦</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge color={item.status === "LOST" ? "red" : "green"}>
            {item.status === "LOST" ? "● Lost" : "● Found"}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {item.title}
          </h3>
          {item.category && <Badge color="slate">{item.category}</Badge>}
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 min-h-[2.5rem]">
          {item.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
          {item.location && (
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {item.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </Link>
  );
}