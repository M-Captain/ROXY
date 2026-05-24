
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import PropertyGrid from '@/components/PropertyGrid';
import HowItWorks from '@/components/HowItWorks';
import Partners from '@/components/Partners';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';


const Index = () => {
  return (
    <div className="min-h-screen bg-dark-bg font-inter">
      <Navigation />
      <HeroSection />
      <PropertyGrid />
      <HowItWorks />
      <Partners />
      <FAQ />
      <Footer />

    </div>
  );
};

export default Index;
