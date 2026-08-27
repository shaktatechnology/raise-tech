import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductsFAB from "@/components/layout/ProductsFAB";

export default function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ProductsFAB />
    </>
  );
}
