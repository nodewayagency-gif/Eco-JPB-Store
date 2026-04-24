import Navbar from "@/components/store/Navbar";
import HeroSection from "@/components/store/HeroSection";
import ProductGrid from "@/components/store/ProductGrid";
import Footer from "@/components/store/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
