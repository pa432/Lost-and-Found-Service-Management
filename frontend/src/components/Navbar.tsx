import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, PlusCircle, LogOut, Package, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              Lost<span className="text-indigo-600">Finder</span>
            </span>
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Report
              </Link>
              <Link
                to="/my-items"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <Search className="w-4 h-4" /> My Items
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" /> Admin
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}