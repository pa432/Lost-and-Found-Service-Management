import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-blue-600">
                    🔍 Lost & Found
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/report" className="text-gray-700 hover:text-blue-600">
                                Report Item
                            </Link>
                            <Link to="/my-items" className="text-gray-700 hover:text-blue-600">
                                My Items
                            </Link>
                            <span className="text-sm text-gray-500">Hi, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-700 hover:text-blue-600">
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}