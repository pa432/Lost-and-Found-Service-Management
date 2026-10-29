import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, PackageSearch, Sparkles } from "lucide-react";
import api from "../api/client";
import ItemCard from "../components/ItemCard";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

interface Item {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  location: string | null;
  imageUrl: string | null;
  date: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/items", { params });
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-xs font-semibold text-indigo-600 shadow-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Powered by AI matching
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Find what you <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">lost</span>
              <br />Reunite what you <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">found</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-xl mx-auto">
              Report lost items, search found ones, and let our AI find matches automatically.
            </p>

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-soft border border-slate-100"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for an item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">All items</option>
                <option value="LOST">Lost</option>
                <option value="FOUND">Found</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                Report lost item
              </Link>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                Report found item
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Items grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">
              {statusFilter === "LOST" ? "Lost items" : statusFilter === "FOUND" ? "Found items" : "Recent items"}
            </h2>
            {!loading && (
              <span className="text-sm text-slate-400">({items.length})</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No items found"
            description="Be the first to report a lost or found item in your area."
            action={
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all"
              >
                Report an item
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}