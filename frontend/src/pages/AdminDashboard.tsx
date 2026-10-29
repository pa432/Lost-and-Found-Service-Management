import { useEffect, useState } from "react";
import {
  Package,
  MapPin,
  HandHeart,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  X,
  Check,
} from "lucide-react";
import api from "../api/client";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";

interface Stats {
  totalItems: number;
  lostItems: number;
  foundItems: number;
  resolvedItems: number;
  pendingClaims: number;
  totalClaims: number;
  totalUsers: number;
  totalMatches: number;
}

interface Claim {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  item: { id: string; title: string; status: string };
  claimant: { id: string; name: string; email: string };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: { items: number; claims: number };
}

type Tab = "overview" | "claims" | "users";

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, c, u] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/claims"),
        api.get("/admin/users"),
      ]);
      setStats(s.data.stats);
      setClaims(c.data.claims);
      setUsers(u.data.users);
    } catch (err) {
      console.error(err);
      showToast("Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const updateClaim = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.patch(`/claims/${id}`, { status });
      showToast(`Claim ${status.toLowerCase()}`);
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed", "error");
    }
  };

  const toggleRole = async (u: User) => {
    const newRole = u.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role: newRole });
      showToast(`${u.name} is now ${newRole}`);
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed", "error");
    }
  };

  const statCards = stats
    ? [
        { label: "Total items", value: stats.totalItems, icon: Package, color: "indigo" as const },
        { label: "Lost", value: stats.lostItems, icon: MapPin, color: "red" as const },
        { label: "Found", value: stats.foundItems, icon: CheckCircle2, color: "green" as const },
        { label: "Resolved", value: stats.resolvedItems, icon: ShieldCheck, color: "slate" as const },
        { label: "AI-indexed", value: stats.totalMatches, icon: Sparkles, color: "purple" as const },
        { label: "Pending claims", value: stats.pendingClaims, icon: Clock, color: "amber" as const },
        { label: "Total claims", value: stats.totalClaims, icon: HandHeart, color: "indigo" as const },
        { label: "Users", value: stats.totalUsers, icon: Users, color: "indigo" as const },
      ]
    : [];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Platform overview and moderation</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {(["overview", "claims", "users"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 font-semibold text-sm border-b-2 capitalize transition-all -mb-px ${
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : tab === "overview" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[s.color]}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 card p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp className="w-4 h-4" />
              <span>
                {stats && stats.totalItems > 0
                  ? `${Math.round((stats.resolvedItems / stats.totalItems) * 100)}% of reported items have been reunited with their owners.`
                  : "No items reported yet."}
              </span>
            </div>
          </div>
        </div>
      ) : tab === "claims" ? (
        claims.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No claims yet.</p>
        ) : (
          <div className="space-y-3">
            {claims.map((c) => (
              <div key={c.id} className="card p-5">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-slate-800">{c.item.title}</p>
                    <p className="text-xs text-slate-400">
                      From {c.claimant.name} ({c.claimant.email}) ·{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    color={
                      c.status === "APPROVED"
                        ? "green"
                        : c.status === "REJECTED"
                        ? "red"
                        : "amber"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{c.message}</p>
                {c.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateClaim(c.id, "APPROVED")}>
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateClaim(c.id, "REJECTED")}
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Items</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Claims</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge color={u.role === "ADMIN" ? "indigo" : "slate"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u._count.items}</td>
                  <td className="px-4 py-3 text-slate-600">{u._count.claims}</td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== me?.id && (
                      <Button size="sm" variant="secondary" onClick={() => toggleRole(u)}>
                        {u.role === "ADMIN" ? "Demote" : "Promote"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}