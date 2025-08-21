import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const QuoteCalculator = () => {
  const { toast } = useToast();
  const { settings, isInitialized } = useAppSettings();
  
  const { 
    quote: quoteContent = {}, 
  } = settings.content || {};

  const {
    quoteAnimationTypes = [],
    quoteAnimationStyles = [],
  } = settings;

  const [animationType, setAnimationType] = useState('');
  const [durationInMinutes, setDurationInMinutes] = useState('1');
  const [style, setStyle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quoteAnimationTypes.length > 0 && !animationType) {
      setAnimationType(quoteAnimationTypes[0].value);
    }
    if (quoteAnimationStyles.length > 0 && !style) {
      setStyle(quoteAnimationStyles[0].value);
    }
  }, [quoteAnimationTypes, quoteAnimationStyles, animationType, style]);

  const estimatedPrice = useMemo(() => {
    const duration = parseFloat(durationInMinutes) || 0;
    if (!animationType || !style || quoteAnimationTypes.length === 0 || quoteAnimationStyles.length === 0 || duration <= 0) {
      return 0;
    }
    const selectedType = quoteAnimationTypes.find(t => t.value === animationType);
    const selectedStyle = quoteAnimationStyles.find(s => s.value === style);

    if (!selectedType || !selectedStyle) return 0;

    const durationInSeconds = duration * 60;
    const basePrice = Number(selectedType.base_cost) * durationInSeconds;
    return Math.round(basePrice * Number(selectedStyle.cost_multiplier));
  }, [animationType, durationInMinutes, style, quoteAnimationTypes, quoteAnimationStyles]);

  const handleRequestQuote = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      const duration = parseFloat(durationInMinutes) || 0;

      if (!name || !email || !animationType || !style || duration <= 0 || estimatedPrice === 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields and ensure a valid quote is calculated.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const durationInSeconds = duration * 60;

      const { error } = await supabase.from('quote_requests').insert([
        {
          animation_type: animationType,
          animation_style: style,
          duration: durationInSeconds,
          estimated_price: estimatedPrice,
          name: name,
          email: email,
          message: message,
        },
      ]);

      if (error) {
        console.error("Error submitting quote request:", error);
        toast({
          title: "Error",
          description: "Failed to submit your quote request. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Quote Request Sent!",
          description: "Thank you for your request. We will get back to you shortly!",
        });
        setName('');
        setEmail('');
        setMessage('');
      }
      setIsSubmitting(false);
  };

  if (!isInitialized || quoteAnimationTypes.length === 0 || quoteAnimationStyles.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
      </div>
    );
  }
  
  const currencySymbol = quoteContent.currency_symbol || '₹';

  return (
    <>
      <Helmet>
        <title>{quoteContent.title || 'Get a Quote'} - {settings.global?.site_name || 'Animate Me'}</title>
        <meta name="description" content={quoteContent.subtitle || "Use our interactive calculator to get an estimated quote for your animation project."} />
      </Helmet>
      <div className="bg-gray-800 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-400">{quoteContent.title || 'Instant Quote Calculator'}</h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{quoteContent.subtitle || 'Get a real-time estimate for your animation project. Fine-tune the details to match your vision and budget.'}</p>
          </motion.div>

          <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700/50">
              <form onSubmit={handleRequestQuote} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                   <div>
                      <label className="block text-lg font-semibold text-white mb-3">{quoteContent.form_animation_type_label || 'Animation Type'}</label>
                      <Select onValueChange={setAnimationType} value={animationType}>
                        <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white h-12">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white border-gray-600">
                            {quoteAnimationTypes.map(type => (
                              <SelectItem key={type.id} value={type.value}>{type.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                   </div>
                   <div>
                      <label className="block text-lg font-semibold text-white mb-3">{quoteContent.form_animation_style_label || 'Animation Style'}</label>
                       <Select onValueChange={setStyle} value={style}>
                        <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white h-12">
                            <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 text-white border-gray-600">
                            {quoteAnimationStyles.map(s => (
                              <SelectItem key={s.id} value={s.value}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                   </div>
                   <div>
                        <Label htmlFor="duration" className="block text-lg font-semibold text-white mb-3">
                            {quoteContent.form_duration_label || 'Duration (in minutes)'}
                        </Label>
                        <Input
                            id="duration"
                            type="number"
                            value={durationInMinutes}
                            onChange={(e) => setDurationInMinutes(e.target.value)}
                            placeholder="e.g., 1.5"
                            className="bg-gray-700 border-gray-600 text-white"
                            min="0.1"
                            step="0.1"
                        />
                   </div>
                   <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-white">Your Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="bg-gray-700 border-gray-600 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-white">Your Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john.doe@example.com"
                                className="bg-gray-700 border-gray-600 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="message" className="text-white">Message (Optional)</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us more about your project..."
                                className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
                            />
                        </div>
                   </div>
                </div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gray-800 p-8 rounded-lg text-center border border-purple-500/30"
                >
                  <p className="text-lg text-gray-300">{quoteContent.result_box_title || 'Estimated Cost'}</p>
                  <div className="my-4 text-5xl font-bold text-yellow-400 flex items-center justify-center">
                    <span className="mr-2 opacity-70 text-4xl">{currencySymbol}</span>
                    <motion.span key={estimatedPrice} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        {estimatedPrice}
                    </motion.span>
                  </div>
                  <p className="text-sm text-gray-400 mb-6">{quoteContent.result_box_subtitle || 'This is an estimate. Final price may vary.'}</p>
                   <Button type="submit" size="lg" className="w-full bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition-transform transform hover:scale-105" disabled={isSubmitting}>
                       {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       {quoteContent.result_box_button_text || 'Request Formal Quote'} <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                </motion.div>
              </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuoteCalculator;