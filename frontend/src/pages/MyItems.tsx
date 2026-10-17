import { useEffect, useState } from "react";
import api from "../api/client";
import ItemCard from "../components/ItemCard";

export default function MyItems() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get("/items/user/mine");
                setItems(res.data.items);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Reports</h1>
            {loading ? (
                <p className="text-center text-gray-500 py-12">Loading...</p>
            ) : items.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                    You haven't reported any items yet.
                </p>
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