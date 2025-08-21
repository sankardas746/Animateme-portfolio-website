import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Link } from 'react-router-dom';
    import { Film, Clapperboard, Video, MicOff as MicVocal, BookOpen, PenTool, Tv, Presentation, ArrowRight } from 'lucide-react';
    import { useToast } from "@/components/ui/use-toast";

    const services = [
      { icon: Film, title: '2D Animation', description: 'Bring characters and stories to life with classic and modern 2D animation techniques.' },
      { icon: Clapperboard, title: 'Motion Graphics', description: 'Dynamic visuals for logos, titles, and promotional content that capture attention.' },
      { icon: Video, title: 'Explainer Videos', description: 'Simplify complex ideas into engaging and easy-to-understand animated videos.' },
      { icon: Tv, title: 'YouTube Animation', description: 'Custom animations tailored for YouTube content creators to boost engagement.' },
      { icon: PenTool, title: 'Storyboarding', description: 'Visualize your narrative with detailed storyboards before production begins.' },
      { icon: MicVocal, title: 'Voice-over Integration', description: 'Professional voice acting and seamless audio integration for your projects.' },
      { icon: BookOpen, title: 'Children’s Animated Stories', description: 'Create enchanting and educational animated stories for young audiences.' },
      { icon: Presentation, title: 'Product Demo Videos', description: 'Showcase your product’s features and benefits with a compelling animated demo.' },
    ];
    
    const ServicesPage = () => {
      const { toast } = useToast();

      const handleThumbnailClick = (e) => {
          e.preventDefault();
          toast({
              title: "Portfolio Coming Soon!",
              description: "We're preparing our showcase. You'll be able to see samples here shortly!",
          });
      };
    
      return (
        <>
          <Helmet>
            <title>Our Services - Animate Me Productions</title>
            <meta name="description" content="Explore the wide range of animation services offered by Animate Me Productions, from 2D animation to product demos." />
          </Helmet>
          <div className="bg-gray-800 py-16 sm:py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-400">Our Creative Services</h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">We turn brilliant ideas into stunning animated realities. Explore our offerings to find the perfect fit for your project.</p>
              </motion.div>
    
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-gray-900 rounded-xl p-6 flex flex-col items-center text-center border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="mb-4 text-purple-400 group-hover:text-yellow-400 transition-colors">
                      <service.icon size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                    <p className="text-gray-400 flex-grow mb-4">{service.description}</p>
                    <a href="#" onClick={handleThumbnailClick} className="w-full">
                       <div className="aspect-video bg-gray-700 rounded-md flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                            <span className="text-sm text-gray-400">View Sample</span>
                       </div>
                    </a>
                  </motion.div>
                ))}
              </div>
    
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-20 text-center bg-gray-900/50 p-8 rounded-2xl border border-purple-500/30"
              >
                <h2 className="text-3xl font-bold text-white">Have a Project in Mind?</h2>
                <p className="mt-4 text-gray-300">Let's discuss how we can bring your vision to life.</p>
                <Button asChild size="lg" className="mt-6 bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition-transform transform hover:scale-105">
                  <Link to="/get-a-quote">
                    Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </>
      );
    };
    
    export default ServicesPage;