"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Security mismatch: Passwords do not align.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terminal Error: System unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-12">
        <div className="space-y-4">
          <h1 className="font-display font-black text-6xl uppercase tracking-tighter leading-none">
            CREATE<br />OPERATIVE
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Initialize new archival identity</p>
        </div>

        {success ? (
          <div className="space-y-8 animate-reveal">
            <div className="p-8 bg-black text-white border-2 border-black flex flex-col items-center gap-6 text-center">
              <CheckCircle2 size={48} className="text-white" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-2">Access Granted</h3>
                <p className="text-[9px] uppercase tracking-widest opacity-60">Redirecting to login portal...</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-reveal">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-500 text-red-500 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-shake">
                <ShieldAlert size={16} /> {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[9px] font-black uppercase tracking-widest text-black/40 group-focus-within:text-black transition-colors">Codename (Full Name)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-transparent border-b-2 border-black/10 focus:border-black py-4 text-sm font-bold placeholder:opacity-20 transition-all outline-none uppercase"
                    placeholder="WES ANDERSON"
                  />
                  <User size={16} className="absolute right-0 top-4 opacity-20" />
                </div>
              </div>

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

              <div className="space-y-2 group">
                <label className="text-[9px] font-black uppercase tracking-widest text-black/40 group-focus-within:text-black transition-colors">Confirm Key</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
              className="w-full h-20 bg-black text-white flex items-center justify-center gap-4 font-black uppercase tracking-[0.4em] text-xs hover:bg-neutral-800 transition-all disabled:opacity-50 group shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Initialize Identity <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
              )}
            </button>
          </form>
        )}

        <div className="pt-12 border-t-2 border-black/5 flex flex-col gap-4 text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-black/40">Already archived?</p>
          <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] hover:italic transition-all">
            Authorized Entry ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
