import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, Film, Clapperboard, MicOff as MicVocal } from 'lucide-react';
    import { useToast } from "@/components/ui/use-toast";

    const HomePage = () => {
      const { toast } = useToast();

      const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2
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

      const services = [
          { icon: Film, title: "2D Animation", description: "Classic and modern 2D animations that tell your story beautifully." },
          { icon: Clapperboard, title: "Motion Graphics", description: "Engaging motion graphics for logos, intros, and marketing content." },
          { icon: MicVocal, title: "Voice-over Integration", description: "Professional voice-overs perfectly synced with your animations." },
      ];

      const handleViewPortfolioClick = (e) => {
        e.preventDefault();
        toast({
            title: "Coming Soon!",
            description: "Our full portfolio is being polished. Check back soon for amazing works!",
        });
      };

      return (
        <>
          <Helmet>
            <title>Animate Me Productions - Home</title>
            <meta name="description" content="Welcome to Animate Me Productions. We create stunning animations that bring your imagination to life." />
          </Helmet>
          <div className="overflow-x-hidden">
            <section className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center text-center text-white bg-gray-900 py-20 px-4">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-yellow-600/30 opacity-50 z-0"></div>
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-40 animate-blob"></div>
                    <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-400 rounded-full mix-blend-screen filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-pink-500 rounded-full mix-blend-screen filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
                </div>
               <motion.div 
                 className="relative z-10"
                 variants={containerVariants}
                 initial="hidden"
                 animate="visible"
               >
                 <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-400">
                    Animate Me Productions
                 </motion.h1>
                 <motion.p variants={itemVariants} className="mt-4 text-xl md:text-2xl font-nunito text-gray-200">
                   Where Imagination Comes to Life
                 </motion.p>
                 <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4 flex-wrap">
                   <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                     <Link to="/portfolio" onClick={handleViewPortfolioClick}>
                       View Portfolio <ArrowRight className="ml-2 h-5 w-5" />
                     </Link>
                   </Button>
                   <Button asChild size="lg" variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                     <Link to="/get-a-quote">Get a Quote</Link>
                   </Button>
                 </motion.div>
               </motion.div>
            </section>

            <section className="py-20 bg-gray-800">
                <div className="container mx-auto px-4">
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Our Core Services</h2>
                        <p className="mt-4 text-lg text-gray-400">We offer a wide range of animation services to fit your needs.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700/50 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-600/20 text-purple-400 mb-6">
                                    <service.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                                <p className="text-gray-400">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Button asChild size="lg" variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-transparent">
                            <Link to="/services">
                                Explore All Services <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
          </div>
        </>
      );
    };

    export default HomePage;