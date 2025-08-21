import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const PrivacyPolicy = () => {
  const { settings, isInitialized } = useAppSettings();
  
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  const privacyPolicyContent = settings.content?.privacy_policy || {};

  return (
    <>
      <Helmet>
        <title>{privacyPolicyContent.title || 'Privacy Policy'} - {settings.global?.siteName || 'Animate Me'}</title>
        <meta name="description" content="Read our privacy policy." />
      </Helmet>
      
      <div className="bg-slate-50">
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-extrabold"
            >
              {privacyPolicyContent.title || 'Privacy Policy'}
            </motion.h1>
          </div>
        </motion.section>

        <section className="py-16 md:py-24">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div 
              className="prose prose-lg prose-purple max-w-none text-gray-700 bg-white p-8 rounded-lg shadow-lg"
              dangerouslySetInnerHTML={{ __html: privacyPolicyContent.content || '<p>Content is being updated. Please check back soon.</p>' }}
            />
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicy;