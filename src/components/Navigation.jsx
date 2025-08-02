"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Home, User } from "lucide-react"; // Optional: lucide icons for better UX
import {useAuth} from './auth-provider'
export default function Navigation() {
  const { user,logout } = useAuth()
  const router = useRouter();

  const handleLogout = () => {
    logout()
    router.push("/");
  };

  return (
    <nav className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center rounded-2xl shadow-lg mb-6">
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors"
        >
          <Home size={18} />
          <span className="text-sm font-medium">Home</span>
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
      >
        <LogOut size={16} />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </nav>
  );
}
