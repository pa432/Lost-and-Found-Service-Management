import { Link } from "react-router-dom";

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
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition border overflow-hidden"
        >
            {item.imageUrl ? (
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                />
            ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-4xl">
                    📦
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${item.status === "LOST"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                            }`}
                    >
                        {item.status}
                    </span>
                    {item.category && (
                        <span className="text-xs text-gray-500">{item.category}</span>
                    )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                {item.location && (
                    <p className="text-xs text-gray-500 mt-2">📍 {item.location}</p>
                )}
            </div>
        </Link>
    );
}