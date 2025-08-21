import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings, isInitialized } = useAppSettings();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', text: 'Home' },
    { to: '/services', text: 'Services' },
    { to: '/portfolio', text: 'Portfolio' },
    { to: '/testimonials', text: 'Testimonials' },
    { to: '/case-studies', text: 'Case Studies' },
    { to: '/blog', text: 'Blog' },
    { to: '/contact', text: 'Contact' },
  ];

  const siteName = settings.global?.site_name || 'Animate Me';
  const logoUrl = settings.global?.logo;

  const NavLinksComponent = ({ isMobile }) => (
    <>
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={isMobile ? toggleMenu : undefined}
          className={({ isActive }) =>
            `px-3 py-2 rounded-md transition-colors duration-300 ${
              isActive ? 'text-purple-600' : 'text-gray-800 hover:text-purple-600'
            }`
          }
        >
          {link.text}
        </NavLink>
      ))}
    </>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'
      } border-b border-gray-200`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
            ) : (
              <Film className="h-8 w-8 text-purple-500" />
            )}
            <span className="gradient-text">{siteName}</span>
          </Link>
          <div className="hidden lg:flex items-center space-x-4 font-semibold">
            <nav className="flex items-center space-x-1">
              <NavLinksComponent />
            </nav>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-yellow-400 hover:from-purple-700 hover:to-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
              <Link to="/quote">Get a Quote</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
              <a href="https://animio.shop" target="_blank" rel="noopener noreferrer">E-Store</a>
            </Button>
          </div>
          <div className="lg:hidden">
            <button onClick={toggleMenu} className="text-gray-800 focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95"
          >
            <nav className="flex flex-col items-center space-y-4 py-4 font-semibold text-gray-800">
              <NavLinksComponent isMobile={true} />
              <Button asChild className="bg-gradient-to-r from-purple-600 to-yellow-400 hover:from-purple-700 hover:to-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                <Link to="/quote" onClick={toggleMenu}>Get a Quote</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                <a href="https://animio.shop" target="_blank" rel="noopener noreferrer" onClick={toggleMenu}>E-Store</a>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;