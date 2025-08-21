import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { getIconComponent } from '@/lib/iconHelper.jsx';

const Footer = () => {
  const { settings } = useAppSettings();
  
  const contact = settings.content?.contact || {};
  const globalSettings = settings.global || {};
  const socialLinks = contact.social_links || {};
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Contact', path: '/contact' },
  ];
  
  const legalLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Disclaimer', path: '/disclaimer' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
  ];

  const services = (settings.services || []).slice(0, 4).map(s => s.name);

  return (
    <footer className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Link to="/" className="flex items-center space-x-2">
              {globalSettings.logo ? (
                  <img src={globalSettings.logo} alt="App Logo" className="h-8 w-auto bg-white p-1 rounded" />
              ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
              )}
              <span className="text-xl font-bold">{globalSettings.site_name}</span>
            </Link>
            <p className="text-purple-200">
              {globalSettings.footer_description || 'Bringing your ideas to life with stunning animations.'}
            </p>
            <div className="flex space-x-4">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-purple-200 hover:text-yellow-400 transition-colors">
                  {getIconComponent(platform, "w-7 h-7")}
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <span className="text-lg font-semibold text-yellow-400">Quick Links</span>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-purple-200 hover:text-yellow-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <span className="text-lg font-semibold text-yellow-400">Legal</span>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-purple-200 hover:text-yellow-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <span className="text-lg font-semibold text-yellow-400">Contact Info</span>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <span className="text-purple-200">{contact.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <span className="text-purple-200">{contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span className="text-purple-200">{contact.address}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-purple-800 mt-8 pt-8 text-center">
          <p className="text-purple-200">
            © {currentYear} {globalSettings.site_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;