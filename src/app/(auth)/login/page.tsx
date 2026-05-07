"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CartoonButton from "@/components/ui/CartoonButton";
import CartoonInput from "@/components/ui/CartoonInput";

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
        setError("AUTHENTICATION FAILED: INVALID INTEL");
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("SYSTEM ERROR: UNABLE TO REACH THE ARCHIVE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-12 relative z-10">
      <div className="space-y-6">
        <div className="inline-block px-4 py-2 bg-ink text-paper border-2 border-ink rotate-[-2deg]">
          <span className="font-bebas text-2xl tracking-[0.2em] uppercase">
            SECURE ACCESS
          </span>
        </div>
        <h1 className="font-bangers text-7xl md:text-8xl text-ink uppercase leading-none tracking-tight">
          ESTABLISH <br />
          <span className="text-secondary drop-shadow-[4px_4px_0px_#000]">CONNECTION</span>
        </h1>
        <p className="font-comic font-bold italic text-xl text-ink/60 max-w-sm leading-tight">
          Verify your credentials to access the classified drops.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 p-10 bg-white border-4 border-ink cartoon-shadow-lg relative">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-halftone opacity-5 pointer-events-none" />

        {error && (
          <div className="p-5 bg-ink text-paper border-3 border-ink font-bangers text-2xl uppercase tracking-tight animate-bounce">
            !! {error} !!
          </div>
        )}

        <div className="space-y-8 relative z-10">
          <CartoonInput
            label="OPERATIVE ID"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="AGENT@INKANDTHREAD.COM"
            required
          />

          <CartoonInput
            label="SECURITY KEY"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <CartoonButton 
          size="lg" 
          className="w-full" 
          disabled={loading}
          type="submit"
        >
          {loading ? "CONNECTING..." : "INITIALIZE LOGIN"}
        </CartoonButton>
      </form>

      <div className="pt-10 border-t-4 border-ink/10 flex flex-col items-center gap-6">
        <p className="font-bebas text-2xl text-ink/40 tracking-widest">
          NO IDENTITY IN ARCHIVES?
        </p>
        <Link href="/register" className="font-bangers text-3xl text-ink hover:text-secondary transition-colors uppercase tracking-tight underline decoration-4 underline-offset-8">
          INITIALIZE NEW OPERATIVE →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-crosshatch" />
      </div>
      
      {/* Decorative Doodles */}
      <div className="absolute top-20 left-20 text-9xl text-ink/5 rotate-12">★</div>
      <div className="absolute bottom-20 right-20 text-9xl text-ink/5 -rotate-12">✸</div>

      <Suspense fallback={<div className="font-bangers text-4xl text-ink animate-pulse uppercase">LOADING ENCRYPTION...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
