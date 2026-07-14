import Navbar from "@/components/layout/Navbar";
import TopNavbar from "@/components/layout/TopNavbar";
import Footer from "@/components/layout/Footer";
import OfferBar from "@/components/layout/OfferBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-white" suppressHydrationWarning>
      {/* Content */}
      <div className="flex flex-col min-h-screen" suppressHydrationWarning>
        <OfferBar />
        <TopNavbar />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
