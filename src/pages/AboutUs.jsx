import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const AboutUs = () => {
  const { settings, isInitialized } = useAppSettings();
  
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  const aboutContent = settings.content?.about || {};

  return (
    <>
      <Helmet>
        <title>{aboutContent.title || 'About Us'} - {settings.global?.site_name || 'Animate Me'}</title>
        <meta name="description" content={aboutContent.subtitle || 'Learn more about our company.'} />
      </Helmet>
      
      <div className="bg-slate-50">
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative py-20 md:py-32 bg-gradient-to-r from-purple-700 to-yellow-400 text-white"
        >
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-extrabold"
            >
              {aboutContent.title || 'About Us'}
            </motion.h1>
            <motion.p 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-4 text-xl md:text-2xl text-purple-100"
            >
              {aboutContent.subtitle || 'The creative minds behind the magic.'}
            </motion.p>
          </div>
        </motion.section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-1">
              <motion.div 
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-12 lg:mb-0"
              >
                <div 
                  className="prose prose-lg prose-purple max-w-none text-gray-700" 
                  dangerouslySetInnerHTML={{ __html: aboutContent.content || '<p>Content is being updated. Please check back soon.</p>' }}
                />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;
