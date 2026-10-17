import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

interface Match {
    id: string;
    title: string;
    description: string;
    status: string;
    similarity: number;
    user: { name: string };
}

export default function ItemDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [item, setItem] = useState<any>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchLoading, setMatchLoading] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/items/${id}`);
                setItem(res.data.item);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

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

    if (loading) return <p className="text-center py-12">Loading...</p>;
    if (!item) return <p className="text-center py-12">Item not found.</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
                ← Back to browse
            </Link>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {item.imageUrl && (
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full max-h-96 object-cover"
                    />
                )}

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span
                            className={`text-sm font-semibold px-3 py-1 rounded ${item.status === "LOST"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                                }`}
                        >
                            {item.status}
                        </span>
                        {item.category && (
                            <span className="text-sm text-gray-500">{item.category}</span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold mb-3">{item.title}</h1>
                    <p className="text-gray-700 mb-4 whitespace-pre-line">{item.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-4">
                        {item.location && (
                            <div>
                                <span className="font-medium">Location:</span> {item.location}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(item.date).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="font-medium">Reported by:</span> {item.user?.name}
                        </div>
                    </div>

                    {user && (
                        <button
                            onClick={findMatches}
                            disabled={matchLoading}
                            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                            {matchLoading ? "Searching..." : "🤖 Find AI Matches"}
                        </button>
                    )}
                </div>
            </div>

            {matches.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Potential Matches</h2>
                    <div className="space-y-3">
                        {matches.map((match) => (
                            <Link
                                key={match.id}
                                to={`/items/${match.id}`}
                                className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md border"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{match.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{match.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Reported by {match.user.name}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded whitespace-nowrap">
                                        {(match.similarity * 100).toFixed(0)}% match
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}