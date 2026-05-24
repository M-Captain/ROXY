import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import WalletContextProvider from "./components/WalletProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Swap from "./pages/Swap";
import Navigation from "./components/Navigation";
import PropertyListings from "./pages/PropertyListings";
import PropertyDetails from "./pages/PropertyDetails";
import UserDashboard from "./pages/UserDashboard";
import CreateListing from "./pages/CreatingList";
import HowItWorksPage from "./pages/HowItWorksPage";
import PropertyValuationTest from "./pages/PropertyValuationTest";
import ContractTest from "./components/ContractTest";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletContextProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/swap" element={<Swap />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/properties" element={<PropertyListings />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/test" element={<ContractTest />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          {/* <Route path="/valuation-test" element={<PropertyValuationTest />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </WalletContextProvider>
  </QueryClientProvider>
);

export default App;
