import Navbar from "@/components/layout/Navbar";
import TopNavbar from "@/components/layout/TopNavbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#000000" }} className="relative min-h-screen w-full">
      {/* Grid background overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(to right, #4f4f4f2e 1px, transparent 1px), linear-gradient(to bottom, #8080800a 1px, transparent 1px)",
          backgroundSize: "14px 24px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <TopNavbar />
        <Navbar />
        <main className="flex-1 flex flex-col relative">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
