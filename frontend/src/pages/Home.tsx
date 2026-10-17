import { useEffect, useState } from "react";
import api from "../api/client";
import ItemCard from "../components/ItemCard";

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
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Browse Items</h1>

            <form onSubmit={handleSearch} className="mb-6 flex gap-3 flex-wrap">
                <input
                    type="text"
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">All</option>
                    <option value="LOST">Lost</option>
                    <option value="FOUND">Found</option>
                </select>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Search
                </button>
            </form>

            {loading ? (
                <p className="text-center text-gray-500 py-12">Loading...</p>
            ) : items.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    <p className="text-5xl mb-3">🔍</p>
                    <p>No items found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}