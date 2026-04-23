"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldAlert } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid credentials. Access denied.");
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("Terminal Error: Authentication service unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-12">
      <div className="space-y-4">
        <h1 className="font-display font-black text-6xl uppercase tracking-tighter leading-none">
          SECURE<br />ACCESS
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Enter credentials to unlock archive</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-500 text-red-500 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-shake">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-[9px] font-black uppercase tracking-widest text-black/40 group-focus-within:text-black transition-colors">Identification (Email)</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-4 text-sm font-bold placeholder:opacity-20 transition-all outline-none"
                placeholder="ALPHA@SECURE.COM"
              />
              <Mail size={16} className="absolute right-0 top-4 opacity-20" />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[9px] font-black uppercase tracking-widest text-black/40 group-focus-within:text-black transition-colors">Security Key (Password)</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-4 text-sm font-bold placeholder:opacity-20 transition-all outline-none"
                placeholder="••••••••"
              />
              <Lock size={16} className="absolute right-0 top-4 opacity-20" />
            </div>
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full h-20 bg-black text-white flex items-center justify-center gap-4 font-black uppercase tracking-[0.4em] text-xs hover:bg-neutral-800 transition-all disabled:opacity-50 group"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Establish Connection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
          )}
        </button>
      </form>

      <div className="pt-12 border-t-2 border-black/5 flex flex-col gap-4 text-center">
        <p className="text-[9px] font-bold uppercase tracking-widest text-black/40">New operative?</p>
        <Link href="/register" className="text-[10px] font-black uppercase tracking-[0.2em] hover:italic transition-all">
          Request Archival Access ↗
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
