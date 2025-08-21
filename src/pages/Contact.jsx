import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, Send, User, Briefcase } from 'lucide-react';
import { MessageSquare } from 'lucide-react'; // Import MessageSquare
import { getIconComponent } from '@/lib/iconHelper.jsx';

const Contact = () => {
  const { toast } = useToast();
  const { settings, isInitialized } = useAppSettings();
  const [pageContent, setPageContent] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      setPageContent(settings.content?.contact || {});
      setLoading(false);
    }
  }, [isInitialized, settings.content?.contact]);

  const { 
    title = 'Get in Touch', 
    subtitle = 'We\'d love to hear from you. Let\'s create something amazing together.',
    email: contactEmail = '',
    phone: contactPhone = '',
    address: contactAddress = '',
    working_hours: workingHours = '',
    social_links: socialLinks = {},
    budget_options: budgetOptions = [],
    project_types: projectTypes = [],
    currency = '₹', // Default to $ if not set
  } = pageContent;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submissionData = {
        name: formData.name,
        email: formData.email,
        message: `Project Type: ${formData.projectType}\nBudget: ${formData.budget}\n\nMessage: ${formData.message}`,
      };
      const { error } = await supabase.from('contact_submissions').insert([submissionData]);
      if (error) throw error;
      toast({
        title: '✅ Message Sent!',
        description: 'Thank you for reaching out. We will get back to you soon.',
      });
      setFormData({ name: '', email: '', projectType: '', budget: '', message: '' });
    } catch (error) {
      toast({
        title: '❌ Submission Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
        <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-white">{title}</h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">{subtitle}</p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-purple-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-800">Contact Information</h2>
                <div className="space-y-6">
                  {contactEmail && <InfoItem icon={<Mail />} text={contactEmail} href={`mailto:${contactEmail}`} />}
                  {contactPhone && <InfoItem icon={<Phone />} text={contactPhone} href={`tel:${contactPhone}`} />}
                  {contactAddress && <InfoItem icon={<MapPin />} text={contactAddress} />}
                  {workingHours && <InfoItem icon={<Clock />} text={workingHours} />}
                </div>
                {Object.keys(socialLinks).length > 0 && (
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                      {Object.entries(socialLinks).map(([platform, url]) => (
                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-purple-600 transition-colors">
                          {getIconComponent(platform, "w-8 h-8")}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl">
                  <h2 className="text-3xl font-bold text-gray-800 mb-8">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InputField icon={<User />} type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleInputChange} required />
                      <InputField icon={<Mail />} type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <SelectField icon={<Briefcase />} name="projectType" placeholder="Project Type" value={formData.projectType} onValueChange={(value) => handleSelectChange('projectType', value)} options={projectTypes} />
                      <SelectField icon={<span className="font-bold">{currency}</span>} name="budget" placeholder="Your Budget" value={formData.budget} onValueChange={(value) => handleSelectChange('budget', value)} options={budgetOptions} />
                    </div>
                    <div>
                      <div className="relative">
                        <MessageSquare className="absolute top-4 left-4 text-gray-400" />
                        <textarea name="message" placeholder="Your Message" value={formData.message} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors" rows="5"></textarea>
                      </div>
                    </div>
                    <div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-yellow-400 hover:from-purple-700 hover:to-yellow-500 text-lg py-3" disabled={isSubmitting}>
                        <Send className="w-5 h-5 mr-2" />
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const InfoItem = ({ icon, text, href }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-md">
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </div>
    <div>
      {href ? (
        <a href={href} className="text-lg text-gray-700 hover:text-purple-600 transition-colors">{text}</a>
      ) : (
        <p className="text-lg text-gray-700">{text}</p>
      )}
    </div>
  </div>
);

const InputField = ({ icon, ...props }) => (
  <div className="relative">
    {React.cloneElement(icon, { className: "absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" })}
    <input {...props} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors" />
  </div>
);

const SelectField = ({ icon, name, placeholder, value, onValueChange, options }) => (
  <div className="relative">
    {React.cloneElement(icon, { className: "absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 z-10" })}
    <Select name={name} onValueChange={onValueChange} value={value}>
      <SelectTrigger className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors h-auto">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, index) => (
          <SelectItem key={index} value={option}>{option}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default Contact;