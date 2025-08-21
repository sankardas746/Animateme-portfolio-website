import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';
import { ArrowRight, Star, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { getIconComponent } from '@/lib/iconHelper.jsx';

const Services = () => {
  const { toast } = useToast();
  const { settings, isInitialized } = useAppSettings();
  const [services, setServices] = useState([]);
  const [pageContent, setPageContent] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(isInitialized){
      setServices(settings.services || []);
      setPageContent(settings.content?.services || {});
      setLoading(false);
    }
  }, [isInitialized, settings.services, settings.content?.services]);

  const { 
    title = 'Our Services', 
    subtitle = 'Crafting Visual Stories That Captivate', 
    process_title: processTitle = 'Our Animation Process', 
    process_steps: processSteps = [], 
    cta_title: ctaTitle = 'Ready to Start Your Project?', 
    cta_subtitle: ctaSubtitle = 'Let\'s turn your vision into a stunning reality', 
    cta_button: ctaButton = 'Get a Free Quote' 
  } = pageContent || {};
  
  const currency = settings.content?.contact?.currency || '$';

  const handleViewSample = (service) => {
    if (service.details_content || service.video_url || (service.features && service.features.length > 0)) {
      setSelectedService(service);
    } else {
      toast({
        title: "🚧 Sample Not Available",
        description: "A detailed sample for this service has not been added yet.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} - {settings.global?.siteName || 'Animate Me'}</title>
        <meta name="description" content={subtitle} />
      </Helmet>

      <div>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white">
                {title}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-gradient-to-br from-purple-50 to-yellow-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        {getIconComponent(service.icon, "w-8 h-8")}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h3>
                      {service.price_per_second > 0 && (
                        <div className="mb-3 inline-flex items-center bg-yellow-200 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {currency}{service.price_per_second} / second
                        </div>
                      )}
                      <p className="text-gray-600 mb-4 line-clamp-4">{service.description}</p>
                    </div>
                  </div>
                  
                  {service.image && (
                    <div className="my-4 rounded-lg overflow-hidden shadow-lg">
                       <img src={service.image} alt={service.name} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  <div className="mt-auto pt-6 flex space-x-3">
                    <Button 
                      onClick={() => handleViewSample(service)}
                      variant="outline" 
                      className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                    >
                      View Full Sample
                    </Button>
                    <Link to="/quote">
                      <Button className="bg-gradient-to-r from-purple-600 to-yellow-400 hover:from-purple-700 hover:to-yellow-500">
                        Get Quote
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        {processSteps && processSteps.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-purple-50 to-yellow-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                  {processTitle}
                </h2>
              </motion.div>

              <div className="relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-purple-200 -translate-y-1/2"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {processSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="text-center relative bg-white p-6 rounded-xl shadow-lg"
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                {ctaTitle}
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {ctaSubtitle}
              </p>
              <Link to="/quote">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  {ctaButton}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedService(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                  <h3 className="text-2xl font-bold">{selectedService.name}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedService(null)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto space-y-8">
                  {selectedService.image && (
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <img src={selectedService.image} alt={selectedService.name} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {selectedService.details_content && (
                    <div className="prose lg:prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: selectedService.details_content }} />
                  )}

                  {selectedService.features && selectedService.features.length > 0 && (
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-4">Features</h4>
                      <ul className="space-y-2">
                        {selectedService.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-gray-700">
                            <Star className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedService.video_url && (
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-4">Sample Video</h4>
                      <div className="relative pt-[56.25%] rounded-lg overflow-hidden shadow-lg bg-black">
                        <ReactPlayer
                          url={selectedService.video_url}
                          width="100%"
                          height="100%"
                          controls
                          className="absolute top-0 left-0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Services;