import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"), {
  ssr: false,
});

const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), {
  ssr: false,
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
