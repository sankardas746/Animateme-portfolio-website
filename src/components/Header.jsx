import React, { useState } from 'react';
    import { NavLink, Link } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Film, Menu, X } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const NavLinks = () => (
      <>
        <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-300 ${isActive ? 'text-yellow-400' : 'hover:text-yellow-400'}`}>Home</NavLink>
        <NavLink to="/services" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-300 ${isActive ? 'text-yellow-400' : 'hover:text-yellow-400'}`}>Services</NavLink>
        <NavLink to="/portfolio" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-300 ${isActive ? 'text-yellow-400' : 'hover:text-yellow-400'}`}>Portfolio</NavLink>
        <NavLink to="/contact" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-300 ${isActive ? 'text-yellow-400' : 'hover:text-yellow-400'}`}>Contact</NavLink>
      </>
    );

    const Header = () => {
      const [isOpen, setIsOpen] = useState(false);

      const toggleMenu = () => setIsOpen(!isOpen);

      return (
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-white">
                <Film className="h-8 w-8 text-purple-500" />
                <span>AnimateMe</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-2 font-semibold">
                <NavLinks />
              </nav>
              <div className="hidden md:flex items-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                  <Link to="/get-a-quote">Get a Quote</Link>
                </Button>
              </div>
              <div className="md:hidden">
                <button onClick={toggleMenu} className="text-white focus:outline-none">
                  {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden bg-gray-900/95"
              >
                <nav className="flex flex-col items-center space-y-4 py-4 font-semibold">
                  <NavLinks />
                   <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                    <Link to="/get-a-quote">Get a Quote</Link>
                  </Button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      );
    };

    export default Header;