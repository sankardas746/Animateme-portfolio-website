import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from '@/components/ui/helmet';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Portfolio from '@/pages/Portfolio';
import Testimonials from '@/pages/Testimonials';
import CaseStudies from '@/pages/CaseStudies';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Admin from '@/pages/Admin';
import QuoteCalculator from '@/pages/QuoteCalculator';
import AboutUs from '@/pages/AboutUs';
import Disclaimer from '@/pages/Disclaimer';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Checkout from '@/pages/Checkout';
import UpdatePassword from '@/pages/UpdatePassword';
import CreateAdmin from '@/pages/CreateAdmin';
import { AppSettingsProvider, useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AppContent = () => {
  const { settings, isInitialized } = useAppSettings();
  const { loading } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  useEffect(() => {
    if (isInitialized && settings.global?.favicon) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.global.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings.global?.favicon, isInitialized]);

  if (loading || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  const siteTitle = settings.global?.site_name || 'Animate Me Productions';

  return (
    <>
      <Helmet>
        <title>{siteTitle}</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
        <Navbar />
        <main className={isAdminPage ? "pt-20" : ""}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout/:productId" element={<Checkout />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:postId" element={<BlogPost />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/quote" element={<QuoteCalculator />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </>
  );
};

function App() {
  return (
    <AppSettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </AppSettingsProvider>
  );
}

export default App;
