"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CartoonButton from "@/components/ui/CartoonButton";
import CartoonInput from "@/components/ui/CartoonInput";

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
      setError("SECURITY MISMATCH: KEYS DO NOT ALIGN");
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
        throw new Error(data.message || "INITIALIZATION FAILED");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "SYSTEM ERROR: ARCHIVE UNREACHABLE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-crosshatch" />
      </div>

      <div className="w-full max-w-lg space-y-12 relative z-10">
        <div className="space-y-6">
          <div className="inline-block px-4 py-2 bg-ink text-paper border-2 border-ink rotate-[2deg]">
            <span className="font-bebas text-2xl tracking-[0.2em] uppercase">
              IDENTITY PROTOCOL
            </span>
          </div>
          <h1 className="font-bangers text-7xl md:text-8xl text-ink uppercase leading-none tracking-tight">
            INITIALIZE <br />
            <span className="text-secondary drop-shadow-[4px_4px_0px_#000]">OPERATIVE</span>
          </h1>
          <p className="font-comic font-bold italic text-xl text-ink/60 max-w-sm leading-tight">
            Create your profile in the global archives.
          </p>
        </div>

        {success ? (
          <div className="p-16 border-4 border-ink bg-white cartoon-shadow-lg text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none" />
            <div className="font-bangers text-8xl text-ink animate-bounce relative z-10">✓</div>
            <div className="space-y-2 relative z-10">
               <h3 className="font-bangers text-4xl text-ink uppercase tracking-tight">IDENTITY ESTABLISHED</h3>
               <p className="font-comic font-bold italic text-secondary text-xl">Redirecting to auth portal...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10 p-10 bg-white border-4 border-ink cartoon-shadow-lg relative">
            <div className="absolute inset-0 bg-halftone opacity-5 pointer-events-none" />

            {error && (
              <div className="p-5 bg-ink text-paper border-3 border-ink font-bangers text-2xl uppercase tracking-tight">
                !! {error} !!
              </div>
            )}

            <div className="space-y-8 relative z-10">
              <CartoonInput
                label="CODENAME (FULL NAME)"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="BRUCE WAYNE"
                required
              />

              <CartoonInput
                label="IDENTIFICATION (EMAIL)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ALPHA@SECURE.HQ"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CartoonInput
                  label="SECURITY KEY"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <CartoonInput
                  label="CONFIRM KEY"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <CartoonButton 
              size="lg" 
              className="w-full" 
              disabled={loading}
              type="submit"
            >
              {loading ? "INITIALIZING..." : "ESTABLISH IDENTITY"}
            </CartoonButton>
          </form>
        )}

        <div className="pt-10 border-t-4 border-ink/10 flex flex-col items-center gap-6">
          <p className="font-bebas text-2xl text-ink/40 tracking-widest">
            ALREADY IN THE ARCHIVES?
          </p>
          <Link href="/login" className="font-bangers text-3xl text-ink hover:text-secondary transition-colors uppercase tracking-tight underline decoration-4 underline-offset-8">
            AUTHORIZED ENTRY →
          </Link>
        </div>
      </div>
    </div>
  );
}
