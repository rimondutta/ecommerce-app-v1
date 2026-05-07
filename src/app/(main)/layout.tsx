import CartoonNavbar from "@/components/layout/CartoonNavbar";
import CartoonFooter from "@/components/layout/CartoonFooter";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative bg-paper">
      <CartoonNavbar />
      <main className="flex-1 flex flex-col relative pt-24 md:pt-32">{children}</main>
      <CartoonFooter />
    </div>
  );
}
