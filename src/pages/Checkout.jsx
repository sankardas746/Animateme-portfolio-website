import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Checkout = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerInfo({ name: user.user_metadata?.full_name || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setLoading(false);
        toast({ title: 'Error', description: 'No product specified.', variant: 'destructive' });
        navigate('/estore');
        return;
      }

      try {
        setLoading(true);
        const productPromise = supabase.from('estore_products').select('*').eq('id', productId).single();
        const paymentPromise = supabase.from('payment_settings').select('*').single();

        const [{ data: productData, error: productError }, { data: paymentData, error: paymentError }] = await Promise.all([productPromise, paymentPromise]);
        
        if (productError) throw productError;
        setProduct(productData);

        if (paymentError && paymentError.code !== 'PGRST116') throw paymentError;
        setPaymentSettings(paymentData);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({ title: 'Error', description: 'Could not fetch checkout details.', variant: 'destructive' });
        navigate('/estore');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, navigate, toast]);

  const handleConfirmOnWhatsApp = async (e) => {
    e.preventDefault();
    if (!customerInfo.name.trim() || !customerInfo.email.trim()) {
      toast({ title: 'Required', description: 'Please enter your name and email.', variant: 'destructive' });
      return;
    }
    if (!paymentSettings?.whatsapp_number) {
        toast({ title: 'Configuration Error', description: 'WhatsApp number is not set up.', variant: 'destructive' });
        return;
    }

    setSubmitting(true);
    try {
      const { data: newOrder, error } = await supabase.from('estore_orders').insert({
        product_id: product.id,
        amount: product.price,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        status: 'pending'
      }).select().single();

      if (error) throw error;
      
      const message = `Hello, I've placed an order for "${product.name}".\n\nOrder ID: ${newOrder.id}\nName: ${customerInfo.name}\nEmail: ${customerInfo.email}\n\nI am sending the payment screenshot.`;
      const whatsappUrl = `https://wa.me/${paymentSettings.whatsapp_number}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'Redirecting to WhatsApp...',
        description: "Please send the screenshot to confirm your payment.",
      });

      setTimeout(() => {
        navigate('/estore');
      }, 3000);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({ title: 'Error', description: 'There was a problem creating your order.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${text} copied to clipboard.`});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button onClick={() => navigate('/estore')} className="mt-4">Back to Store</Button>
      </div>
    );
  }
  
  const bankDetails = paymentSettings?.bank_account_details;
  
  return (
    <>
      <Helmet>
        <title>Checkout - {product.name}</title>
        <meta name="description" content={`Complete your purchase for ${product.name}`} />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button variant="ghost" onClick={() => navigate('/estore')} className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="flex items-center space-x-6">
                  <img src={product.featured_image_url || 'https://placehold.co/150x150'} alt={product.name} className="w-32 h-32 object-cover rounded-lg" />
                  <div>
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <p className="text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  </div>
                </div>
                <div className="mt-8 border-t pt-6 space-y-4 text-lg">
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>₹{product.price}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Payment Instructions</h2>
                {paymentSettings ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg">{paymentSettings.method_name}</h3>
                      <p className="text-gray-600 mt-1">{paymentSettings.method_description}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {paymentSettings.upi_id && (
                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                           <span>UPI ID: <strong>{paymentSettings.upi_id}</strong></span>
                           <Button variant="ghost" size="icon" onClick={() => copyToClipboard(paymentSettings.upi_id)}><Copy className="w-4 h-4" /></Button>
                        </div>
                      )}
                      {paymentSettings.qr_code_url && (
                        <div className="text-center">
                           <img src={paymentSettings.qr_code_url} alt="Payment QR Code" className="w-48 h-48 mx-auto object-contain rounded-lg border p-2" />
                        </div>
                      )}
                      {bankDetails && bankDetails.account_number && (
                        <div className="border-t pt-4 space-y-3">
                          <h4 className="font-semibold text-lg">Or, Bank Transfer</h4>
                          <div className="flex items-center justify-between"><span>Name:</span> <strong>{bankDetails.name}</strong></div>
                          <div className="flex items-center justify-between">
                            <span>A/C No:</span>
                            <div className="flex items-center gap-2">
                                <strong>{bankDetails.account_number}</strong>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(bankDetails.account_number)}><Copy className="w-4 h-4" /></Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between"><span>Bank:</span> <strong>{bankDetails.bank_name}</strong></div>
                          <div className="flex items-center justify-between">
                             <span>IFSC:</span> 
                             <div className="flex items-center gap-2">
                                <strong>{bankDetails.ifsc_code}</strong>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(bankDetails.ifsc_code)}><Copy className="w-4 h-4" /></Button>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleConfirmOnWhatsApp} className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Confirm Your Order</h3>
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" type="text" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} required placeholder="Enter your full name"/>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} required placeholder="Enter your email"/>
                      </div>
                      <div className="text-center bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                          Please send the payment successful page screenshot to the WhatsApp number below. The document will be provided within 10 minutes via email.
                          </p>
                      </div>

                      <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white" disabled={submitting}>
                        {submitting ? 'Processing...' : <><MessageSquare className="mr-2 h-5 w-5" /> Confirm on WhatsApp</>}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <p>Payment method not configured yet. Please contact support.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Checkout;