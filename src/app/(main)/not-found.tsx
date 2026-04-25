import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-8xl font-black tracking-tighter uppercase italic opacity-20">404</h1>
        <h2 className="text-2xl font-bold uppercase tracking-widest">Page Not Found</h2>
        <p className="text-black/70 text-sm leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Explore our latest collections to find what you need.
        </p>
        <div className="pt-4">
          <Link
            href="/products"
            className="inline-block px-12 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
