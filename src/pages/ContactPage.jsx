import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { useToast } from "@/components/ui/use-toast";
    import { Send, Mail, Phone } from 'lucide-react';

    const ContactPage = () => {
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        toast({
          title: "🚀 Message Sent!",
          description: "Just kidding! This form isn't connected yet, but we'll implement it soon!",
        });
      };

      const handleDirectContactClick = (e, type) => {
        e.preventDefault();
        toast({
            title: `🚧 ${type} Not Ready!`,
            description: "This feature isn't implemented yet, but you can request it next!",
        });
      };

      return (
        <>
          <Helmet>
            <title>Contact Us - Animate Me Productions</title>
            <meta name="description" content="Get in touch with Animate Me Productions to discuss your next animation project. We're excited to hear from you!" />
          </Helmet>
          <div className="bg-gray-800 py-16 sm:py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-400">Let's Create Together</h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">Have a question or a project in mind? Drop us a line!</p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                  className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700/50"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input type="text" id="name" name="name" required className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input type="email" id="email" name="email" required className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                      <textarea id="message" name="message" rows="4" required className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 transition"></textarea>
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                      Send Message <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                  className="space-y-8"
                >
                  <div className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700/50">
                    <h2 className="text-2xl font-bold text-white mb-4">Direct Contact</h2>
                    <div className="space-y-4">
                        <a href="mailto:hello@animateme.in" onClick={(e) => handleDirectContactClick(e, 'Email')} className="flex items-center space-x-4 group">
                          <div className="bg-purple-500/20 p-3 rounded-full"><Mail className="text-purple-400"/></div>
                          <div>
                              <p className="font-semibold text-white group-hover:text-yellow-400 transition">Email</p>
                              <p className="text-gray-400">hello@animateme.in</p>
                          </div>
                        </a>
                        <a href="tel:+911234567890" onClick={(e) => handleDirectContactClick(e, 'Phone')} className="flex items-center space-x-4 group">
                           <div className="bg-purple-500/20 p-3 rounded-full"><Phone className="text-purple-400"/></div>
                           <div>
                              <p className="font-semibold text-white group-hover:text-yellow-400 transition">Phone</p>
                              <p className="text-gray-400">+91 123 456 7890</p>
                           </div>
                        </a>
                    </div>
                  </div>
                  <div className="bg-gray-900 h-64 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-center p-4">
                        <p className="text-gray-400">
                          Google Maps will be embedded here soon. <br/>
                          This feature is not implemented yet.
                        </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </>
      );
    };

    export default ContactPage;