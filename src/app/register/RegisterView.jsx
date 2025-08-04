"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterView() {
  const { user, isLoading, register, loadUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [btnIsLoading, setBtnIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnIsLoading(true);

    if (!email) {
      toast.error("Please enter email");
      setBtnIsLoading(false);
      return;
    }

    if (!password) {
      toast.error("Please enter password");
      setBtnIsLoading(false);
      return;
    }

    try {
      await register(email, password);
      await loadUser();
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setBtnIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-950 p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <Link href="/" className="flex justify-center mb-4">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt="Logo"
                width={80}
                height={80}
                className="rounded-full shadow-lg"
              />
            )}
          </Link>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
            Create your account
          </h2>
          <p className="text-sm text-gray-400 mt-1">Start your journey with us</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={btnIsLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {btnIsLoading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-400 hover:underline">
            Already have an account? <span className="underline">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
