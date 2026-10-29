import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, HandHeart } from "lucide-react";
import api from "../api/client";
import ItemCard from "../components/ItemCard";
import Skeleton from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

type Tab = "reports" | "claims";

interface Claim {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  item: { id: string; title: string; status: string; imageUrl: string | null };
}

export default function MyItems() {
  const [tab, setTab] = useState<Tab>("reports");
  const [items, setItems] = useState<any[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [itemsRes, claimsRes] = await Promise.all([
          api.get("/items/user/mine"),
          api.get("/claims/mine"),
        ]);
        setItems(itemsRes.data.items);
        setClaims(claimsRes.data.claims);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">My Activity</h1>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setTab("reports")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all -mb-px ${
            tab === "reports"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Package className="w-4 h-4" />
          My Reports ({items.length})
        </button>
        <button
          onClick={() => setTab("claims")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all -mb-px ${
            tab === "claims"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <HandHeart className="w-4 h-4" />
          My Claims ({claims.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="p-5 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : tab === "reports" ? (
        items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No reports yet"
            description="When you report a lost or found item, it will appear here."
            action={
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
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
        )
      ) : claims.length === 0 ? (
        <EmptyState
          icon={HandHeart}
          title="No claims yet"
          description="When you claim a found item, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <Link
              key={claim.id}
              to={`/items/${claim.item.id}`}
              className="card p-5 hover:shadow-lg transition-all block"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h3 className="font-bold text-slate-800">{claim.item.title}</h3>
                  <p className="text-xs text-slate-400">
                    Submitted {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  color={
                    claim.status === "APPROVED"
                      ? "green"
                      : claim.status === "REJECTED"
                      ? "red"
                      : "amber"
                  }
                >
                  {claim.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{claim.message}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}