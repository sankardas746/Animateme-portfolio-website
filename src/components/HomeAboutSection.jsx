import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Building, Users, Award } from 'lucide-react';
import ReactPlayer from 'react-player/youtube';

const iconMap = {
  building: Building,
  users: Users,
  award: Award,
};

const HomeAboutSection = () => {
  const { settings } = useAppSettings();
  const { homeAboutSection, homeAboutTabs } = settings;
  const [selectedTab, setSelectedTab] = useState(null);

  if (!homeAboutSection || !homeAboutTabs) {
    return null;
  }

  const { welcome_text, title, short_description, long_description, video_url } = homeAboutSection;

  return (
    <>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-purple-600 font-semibold uppercase tracking-wider">{welcome_text}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-4 gradient-text">{title}</h2>
              <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 mb-6 rounded-r-lg">
                <p className="text-lg font-medium text-gray-700">{short_description}</p>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{long_description}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-video rounded-lg overflow-hidden shadow-2xl"
            >
              <ReactPlayer
                url={video_url}
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
                controls
                light={true}
              />
            </motion.div>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }}
          >
            {homeAboutTabs.map((tab, index) => {
              const Icon = iconMap[tab.icon] || Building;
              return (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{tab.title}</h3>
                  <p className="text-gray-600 mb-6 flex-grow">{tab.short_info}</p>
                  <Button
                    onClick={() => setSelectedTab(tab)}
                    className="bg-gradient-to-r from-purple-600 to-yellow-400 text-white mt-auto"
                  >
                    Read More
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selectedTab && (
          <Dialog open={!!selectedTab} onOpenChange={() => setSelectedTab(null)}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedTab.title}</DialogTitle>
                <DialogDescription>
                  {selectedTab.short_info}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 prose max-w-none overflow-y-auto flex-grow" dangerouslySetInnerHTML={{ __html: selectedTab.full_content }} />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeAboutSection;