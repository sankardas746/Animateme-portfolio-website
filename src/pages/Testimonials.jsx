import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion,AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const Testimonials = () => {
  const { settings, isInitialized } = useAppSettings();
  const [allTestimonials, setAllTestimonials] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [pageContent, setPageContent] = useState({});
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (isInitialized) {
      const sortedTestimonials = [...(settings.testimonials || [])].sort((a, b) => (b.id > a.id ? 1 : -1));
      
      setAllTestimonials(sortedTestimonials);
      setFeaturedTestimonials(sortedTestimonials.slice(0, 3));
      
      setPageContent(settings.content?.testimonials || {});
      setStats(settings.content?.testimonials?.stats || []);
      setLoading(false);
    }
  }, [isInitialized, settings.testimonials, settings.content?.testimonials]);

  const nextSlide = useCallback(() => {
    if (featuredTestimonials.length > 1) {
      setCurrentSlide((prev) => (prev === featuredTestimonials.length - 1 ? 0 : prev + 1));
    }
  }, [featuredTestimonials.length]);

  const prevSlide = () => {
    if (featuredTestimonials.length > 1) {
      setCurrentSlide((prev) => (prev === 0 ? featuredTestimonials.length - 1 : prev - 1));
    }
  };

  useEffect(() => {
    if (featuredTestimonials.length > 1) {
      const slideInterval = setInterval(nextSlide, 5000);
      return () => clearInterval(slideInterval);
    }
  }, [featuredTestimonials.length, nextSlide]);

  const {
    title = "What Our Clients Say",
    subtitle = "Every project is a partnership, and we're proud of the relationships we've built.",
    cta_title = "Ready to Join Our Happy Clients?",
    cta_subtitle = "Let's create something amazing together and add your success story to our collection.",
    cta_button = "Start Your Project Today"
  } = pageContent;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const slideVariants = {
    enter: {
      x: 1000,
      opacity: 0
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: {
      zIndex: 0,
      x: -1000,
      opacity: 0
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
        <section className="py-20 text-center bg-gradient-to-r from-purple-600 to-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              {title}
            </motion.h1>
            <motion.p
              className="text-lg text-white/90 max-w-3xl mx-auto"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          </div>
        </section>

        {featuredTestimonials.length > 0 && (
          <section className="py-12 bg-white overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative h-96 flex items-center justify-center">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentSlide}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute w-full h-full flex flex-col justify-center bg-gradient-to-br from-purple-100 to-yellow-100 p-6 md:p-8 rounded-3xl shadow-2xl text-center"
                >
                  <img 
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                    alt={`Avatar of ${featuredTestimonials[currentSlide].author}`}
                    src={featuredTestimonials[currentSlide].avatar || `https://i.pravatar.cc/150?u=${featuredTestimonials[currentSlide].author}`}
                  />
                  <div className="flex justify-center items-center mb-3">
                    {Array.from({ length: featuredTestimonials[currentSlide].rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg md:text-xl text-gray-700 italic mb-4 max-w-2xl mx-auto">"{featuredTestimonials[currentSlide].quote}"</p>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{featuredTestimonials[currentSlide].author}</p>
                    <p className="text-md text-gray-600">{featuredTestimonials[currentSlide].company}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {featuredTestimonials.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute top-1/2 left-0 md:-left-12 transform -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 shadow-md transition z-10">
                    <ChevronLeft className="w-6 h-6 text-purple-600" />
                  </button>
                  <button onClick={nextSlide} className="absolute top-1/2 right-0 md:-right-12 transform -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 shadow-md transition z-10">
                    <ChevronRight className="w-6 h-6 text-purple-600" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {featuredTestimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-purple-600 scale-125' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {allTestimonials.length > 0 && (
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 gradient-text">More Kind Words</h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {allTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id || index}
                    className="bg-white p-8 rounded-2xl shadow-lg flex flex-col"
                    variants={fadeIn}
                  >
                    <div className="flex-grow">
                      <div className="flex items-center mb-4">
                        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                    </div>
                    <div className="flex items-center">
                      <img 
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        alt={`Avatar of ${testimonial.author}`}
                        src={testimonial.avatar || `https://i.pravatar.cc/150?u=${testimonial.author}`}
                      />
                      <div>
                        <p className="font-bold text-gray-900">{testimonial.author}</p>
                        <p className="text-sm text-gray-600">{testimonial.company}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {stats.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {stats.map((stat, index) => (
                  <motion.div key={index} variants={fadeIn}>
                    <p className="text-5xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-lg text-gray-600 mt-2">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-4">{cta_title}</motion.h2>
              <motion.p variants={fadeIn} transition={{delay: 0.2}} className="text-lg text-purple-100 max-w-2xl mx-auto mb-8">{cta_subtitle}</motion.p>
              <motion.div variants={fadeIn} transition={{delay: 0.4}}>
                <Link to="/contact">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                    {cta_button}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Testimonials;