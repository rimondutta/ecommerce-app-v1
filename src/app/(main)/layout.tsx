import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TopBar from "@/components/layout/TopBar";

/**
 * (main) layout — wraps all public-facing pages with the
 * global TopBar, Navbar and Footer. Pages under this group should NOT
 * render these themselves.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative bg-[#0a0a0a]">
      <TopBar />
      <Header />
      <main className="flex-1 flex flex-col relative pt-[100px] md:pt-[108px]">{children}</main>
      <Footer />
    </div>
  );
}
