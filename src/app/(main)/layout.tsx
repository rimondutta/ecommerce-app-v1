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
    <div className="flex flex-col min-h-screen relative">
      <div className="sticky top-0 z-[500] w-full">
        <TopBar />
        <Header />
      </div>
      <main className="flex-1 flex flex-col relative">{children}</main>
      <Footer />
    </div>
  );
}
