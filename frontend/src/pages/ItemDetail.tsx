import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User as UserIcon,
  Sparkles,
  HandHeart,
  Check,
  X,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import ItemMap from "../components/ItemMap";
import ClaimModal from "../components/ClaimModal";
import { useToast } from "../components/ui/Toast";

interface Match {
  id: string;
  title: string;
  description: string;
  status: string;
  similarity: number;
  user: { name: string };
}

interface Claim {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  claimant: { name: string; email: string };
}

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [item, setItem] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const isOwner = user && item && item.user?.id === user.id;

  const loadAll = async () => {
    try {
      const itemRes = await api.get(`/items/${id}`);
      setItem(itemRes.data.item);

      if (user) {
        try {
          const claimsRes = await api.get(`/items/${id}/claims`);
          setClaims(claimsRes.data.claims);
        } catch {
          // Non-owner or unauthenticated — silently ignore
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id, user]);

  const findMatches = async () => {
    setMatchLoading(true);
    try {
      const res = await api.get(`/items/${id}/matches`);
      setMatches(res.data.matches);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchLoading(false);
    }
  };

  const updateClaimStatus = async (claimId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.patch(`/claims/${claimId}`, { status });
      showToast(`Claim ${status.toLowerCase()}`);
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to update claim", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (!item) return <p className="text-center py-12">Item not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to browse
      </Link>

      <div className="card overflow-hidden">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full max-h-[420px] object-cover"
          />
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge color={item.status === "LOST" ? "red" : item.status === "FOUND" ? "green" : "slate"}>
              ● {item.status}
            </Badge>
            {item.category && <Badge color="slate">{item.category}</Badge>}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {item.title}
          </h1>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-6">
            {item.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-slate-100">
            {item.location && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </div>
                <p className="text-sm font-medium text-slate-700">{item.location}</p>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" /> Date
              </div>
              <p className="text-sm font-medium text-slate-700">
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <UserIcon className="w-3.5 h-3.5" /> Reported by
              </div>
              <p className="text-sm font-medium text-slate-700">{item.user?.name}</p>
            </div>
          </div>

          {item.latitude && item.longitude && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                📍 Location on map
              </h3>
              <ItemMap
                latitude={item.latitude}
                longitude={item.longitude}
                title={item.title}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {user && (
              <Button onClick={findMatches} loading={matchLoading} variant="secondary">
                <Sparkles className="w-4 h-4" />
                {matchLoading ? "Searching..." : "Find AI Matches"}
              </Button>
            )}

            {user && item.status === "FOUND" && !isOwner && (
              <Button onClick={() => setShowClaimModal(true)}>
                <HandHeart className="w-4 h-4" />
                Claim this item
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Claims panel — only visible to the item owner */}
      {isOwner && claims.length > 0 && (
        <div className="mt-8 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Claims on this item ({claims.length})
          </h2>
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="card p-5">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-slate-800">{claim.claimant.name}</p>
                    <p className="text-xs text-slate-400">{claim.claimant.email}</p>
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
                <p className="text-sm text-slate-600 mb-4 whitespace-pre-line">
                  {claim.message}
                </p>
                {claim.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateClaimStatus(claim.id, "APPROVED")}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateClaimStatus(claim.id, "REJECTED")}
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-8 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Potential matches
          </h2>
          <div className="space-y-3">
            {matches.map((match) => (
              <Link
                key={match.id}
                to={`/items/${match.id}`}
                className="block card p-5 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 mb-1">{match.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                      {match.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      Reported by {match.user.name}
                    </p>
                  </div>
                  <Badge color="purple">
                    {Math.round(match.similarity * 100)}% match
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showClaimModal && (
        <ClaimModal
          itemId={id!}
          itemTitle={item.title}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => loadAll()}
        />
      )}
    </div>
  );
}