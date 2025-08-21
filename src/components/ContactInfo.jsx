import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const ContactInfo = () => {
  const { settings } = useAppSettings();
  const contact = settings.content?.contact || {};

  const handleWhatsApp = () => {
    if (!contact.phone) return;
    const message = encodeURIComponent("Hi! I'm interested in your animation services. Can we discuss my project?");
    window.open(`https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleEmailDirect = () => {
    if (!contact.email) return;
    const subject = encodeURIComponent("Animation Project Inquiry");
    const body = encodeURIComponent("Hi,\n\nI'm interested in your animation services. Please contact me to discuss my project.\n\nBest regards");
    window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold gradient-text mb-4">
          Get In Touch
        </h2>
        <p className="text-gray-600">
          Prefer to reach out directly? Use any of the methods below to connect with us.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-yellow-50 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Email Us</h3>
            <p className="text-gray-600 mb-2">{contact.email}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEmailDirect}
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            >
              Send Email
            </Button>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-yellow-50 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">WhatsApp</h3>
            <p className="text-gray-600 mb-2">{contact.phone}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsApp}
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              Chat on WhatsApp
            </Button>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-yellow-50 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-lg flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Call Us</h3>
            <p className="text-gray-600">{contact.phone}</p>
            <p className="text-sm text-gray-500">{contact.working_hours}</p>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-yellow-50 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Visit Our Studio</h3>
            <p className="text-gray-600">{contact.address}</p>
            <p className="text-sm text-gray-500">By appointment only</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-yellow-400 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <Clock className="w-6 h-6" />
          <h3 className="text-lg font-bold">Quick Response Guarantee</h3>
        </div>
        <p className="text-white/90">
          We respond to all inquiries within 24 hours. For urgent projects, 
          WhatsApp us for immediate assistance!
        </p>
      </div>
    </motion.div>
  );
};

export default ContactInfo;