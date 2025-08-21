import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { ArrowRight, Film, Users, Zap, Award, BookOpen, Play } from 'lucide-react';
import { Helmet } from 'react-helmet';
import AutoCarousel from '@/components/AutoCarousel';
import AnimatedText from '@/components/AnimatedText';
import AnimatedCounter from '@/components/AnimatedCounter';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const Home = () => {
  const { settings, isInitialized } = useAppSettings();

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    let videoId;
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else {
      return null;
    }
    return videoId;
  };

  const getThumbnailUrl = (item, defaultImage) => {
    if (item.image) return item.image;
    const videoId = getYoutubeVideoId(item.video_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return defaultImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
  };

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }
  
  const { global, content, services, portfolioItems, testimonials, caseStudies, homeHeroSlides, homeStats } = settings;
  const testimonialsContent = content?.testimonials || {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const siteName = global?.site_name || 'Animate Me';
  const defaultTagline1 = 'Bringing Your';
  const defaultTagline2 = 'Ideas to Life';
  
  const renderServiceItem = (service, index) => (
    <motion.div
      key={index}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
      variants={itemVariants}
    >
      <div className="relative">
        <img alt={service.name} className="w-full h-48 object-cover" src={getThumbnailUrl(service, "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=800&q=80")} />
      </div>
      <div className="p-8 text-left flex-grow flex flex-col">
        <div className="text-purple-600 mb-4">
          {
            {
              "2D Animation": <Film className="w-12 h-12" />,
              "3D Animation": <Zap className="w-12 h-12" />,
              "VFX": <Users className="w-12 h-12" />,
            }[service.name] || <Award className="w-12 h-12" />
          }
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4 flex-grow line-clamp-4">{service.description}</p>
        <Button asChild variant="link" className="text-purple-600 hover:text-yellow-500 p-0 self-start mt-auto">
          <Link to="/services">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </motion.div>
  );

  const renderPortfolioItem = (item, index) => (
    <motion.div key={index} className="group relative overflow-hidden rounded-lg shadow-lg h-full" variants={itemVariants}>
       <img alt={item.title} className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" src={getThumbnailUrl(item, "https://images.unsplash.com/photo-1652086939922-9582b3367e61?w=800&q=80")} />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center p-4">
        <div className="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
          <h3 className="text-xl font-bold">{item.title}</h3>
          <p className="text-sm">{item.category}</p>
          <Button asChild variant="secondary" className="mt-4 bg-white/90 text-purple-700 hover:bg-white">
            <Link to="/portfolio">View Project</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderCaseStudyItem = (study, index) => (
    <motion.div
      key={index}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 flex flex-col h-full"
      variants={itemVariants}
    >
      <img alt={study.title} className="w-full h-48 object-cover" src={getThumbnailUrl(study, "https://images.unsplash.com/photo-1619944650391-f8581687d8c7?w=800&q=80")} />
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm text-purple-600 font-semibold mb-2">{study.client}</p>
        <h3 className="text-xl font-bold text-gray-800 mb-3 flex-grow">{study.title}</h3>
        <Button asChild variant="link" className="text-purple-600 hover:text-yellow-500 p-0 font-semibold self-start mt-auto">
          <Link to="/case-studies">Read Case Study <BookOpen className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </motion.div>
  );

  return (
    <>
      <Helmet>
          <title>{`${siteName} | Home`}</title>
          <meta name="description" content={`${defaultTagline1} ${defaultTagline2}`} />
      </Helmet>
      <div className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative text-center h-[60vh] md:h-[80vh] text-white">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={0}
            loop={true}
            autoplay={{ delay: 10000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={true}
            className="h-full"
          >
            {(homeHeroSlides.length > 0 ? homeHeroSlides : [{id: 'default', tagline1: defaultTagline1, tagline2: defaultTagline2, subtitle: "We craft stunning 2D & 3D animations that captivate, engage, and convert.", cta_text: "Get a Quote", cta_link: "/quote", background_image: ''}]).map((slide) => (
              <SwiperSlide key={slide.id}>
                {({ isActive }) => (
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ 
                      backgroundImage: slide.background_image 
                        ? `url(${slide.background_image})` 
                        : 'linear-gradient(to bottom right, #8B5CF6, #FBBF24, #6D28D9)' 
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-4 h-full flex flex-col justify-center items-center pt-16"> {/* Added pt-16 here */}
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                          <AnimatedText el="span" text={isActive ? (slide.tagline1 || '') : ''} className="block" />
                          <AnimatedText el="span" text={isActive ? (slide.tagline2 || '') : ''} className="block text-yellow-300" />
                      </h1>
                      <motion.p 
                          className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-purple-100"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.div 
                          className="mt-10"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                      >
                        <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-yellow-300 hover:text-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                          <Link to={slide.cta_link || '/quote'}>{slide.cta_text || 'Get a Quote'} <ArrowRight className="ml-2 h-5 w-5" /></Link>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Our Services Section */}
        <motion.section 
          className="py-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800" variants={itemVariants}>Our Services</motion.h2>
            <motion.p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-center" variants={itemVariants}>
              From concept to final render, we offer a complete suite of animation services.
            </motion.p>
            <div className="mt-12">
               <AutoCarousel items={(services || [])} renderItem={renderServiceItem} />
            </div>
             <motion.div className="mt-12 text-center" variants={itemVariants}>
              <Button asChild size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300">
                <Link to="/services">View All Services</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Featured Work Section */}
        <motion.section 
          className="py-10 bg-gray-50"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800" variants={itemVariants}>Featured Work</motion.h2>
            <motion.p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-center" variants={itemVariants}>
              A glimpse into the worlds we've created.
            </motion.p>
            <div className="mt-12">
              <AutoCarousel items={(portfolioItems || []).slice(0, 6)} renderItem={renderPortfolioItem} />
            </div>
            <motion.div className="mt-12 text-center" variants={itemVariants}>
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-yellow-400 text-white">
                <Link to="/portfolio">Explore Our Portfolio</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
        
        {/* Stats Section */}
        <motion.section 
          className="py-16 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {(homeStats || []).map((stat, index) => (
                <motion.div key={stat.id || index} className="p-4" variants={itemVariants}>
                  <AnimatedCounter value={stat.value} />
                  <p className="text-sm text-gray-500 uppercase tracking-wider mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Case Studies Section */}
        <motion.section
          className="py-20 bg-gray-50"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800" variants={itemVariants}>
              Our Case Studies
            </motion.h2>
            <motion.p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-center" variants={itemVariants}>
              Discover the stories behind our successful projects.
            </motion.p>
            <div className="mt-12">
              <AutoCarousel items={(caseStudies || []).slice(0, 6)} renderItem={renderCaseStudyItem} />
            </div>
            <motion.div className="mt-12 text-center" variants={itemVariants}>
              <Button asChild size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300">
                <Link to="/case-studies">View All Case Studies</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          className="py-20 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h2 className="text-3xl md:text-4xl font-bold text-gray-800" variants={itemVariants}>{testimonialsContent.title || 'Testimonials'}</motion.h2>
            <motion.p className="mt-4 text-lg text-gray-600" variants={itemVariants}>
              {testimonialsContent.subtitle || 'We are proud to have collaborated with amazing clients.'}
            </motion.p>
            <div className="mt-12 relative">
            {(testimonials || []).slice(0, 1).map((testimonial, index) => (
              <motion.div key={index} className="bg-gray-50 rounded-xl shadow-lg p-8 md:p-12" variants={itemVariants}>
                <img alt={testimonial.author} className="w-20 h-20 rounded-full mx-auto -mt-20 border-4 border-white shadow-md object-cover" src={testimonial.avatar || "https://images.unsplash.com/photo-1625581652944-2f297562baa5?w=800&q=80"} />
                <blockquote className="mt-6 text-xl italic text-gray-700">
                  "{testimonial.quote}"
                </blockquote>
                <p className="mt-6 font-semibold text-gray-800">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.company}</p>
              </motion.div>
            ))}
            </div>
            <motion.div className="mt-8" variants={itemVariants}>
              <Button asChild variant="link" className="text-purple-600 hover:text-yellow-500">
                <Link to="/testimonials">Read More Testimonials</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

      </div>
    </>
  );
};

export default Home;