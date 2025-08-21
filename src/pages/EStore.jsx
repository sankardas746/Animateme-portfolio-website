import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { ExternalLink, ShoppingBag } from 'lucide-react';

const EStore = () => {
  const { toast } = useToast();
  const { settings, isInitialized } = useAppSettings();
  const [pageContent, setPageContent] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        
        const pagePromise = supabase.from('page_estore').select('*').single();
        const { data: productsData, error: productsError } = await supabase.functions.invoke('fetch-animio-products');
        
        const { data: pageData, error: pageError } = await pagePromise;

        if (pageError && pageError.code !== 'PGRST116') throw pageError;
        setPageContent(pageData || {});

        if (productsError) throw productsError;
        setProducts(productsData || []);

      } catch (error) {
        console.error('Error fetching E-Store data:', error);
        toast({
          title: 'Error',
          description: `Could not fetch store data: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) {
      fetchPageData();
    }
  }, [isInitialized, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  const {
    title = 'E-Store',
    subtitle = 'Our Latest Products from Animio.shop',
    banner_headline = 'Explore Our Creative Collection',
    banner_about_text = 'Discover high-quality digital assets and merchandise, sourced directly from our main store. Click on any product to see more details and purchase.',
    featured_products_title = 'Latest Arrivals'
  } = pageContent;

  return (
    <>
      <Helmet>
        <title>{title} - {settings.global?.siteName || 'Animate Me'}</title>
        <meta name="description" content={subtitle} />
      </Helmet>

      <div>
        <section className="relative py-12 bg-gray-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-yellow-500 opacity-10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{banner_headline}</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">{banner_about_text}</p>
            </motion.div>
          </div>
        </section>

        <main className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 to-purple-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12 text-center">{featured_products_title}</h2>
              
              {products.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">We couldn't fetch products at the moment. Please try again later.</p>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

const ProductCard = ({ product }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">
        <div className="aspect-w-3 aspect-h-4 bg-gray-200 sm:aspect-none sm:h-60">
          <img alt={product.title} className="h-full w-full object-cover object-center sm:h-full sm:w-full" src={product.imageUrl} />
        </div>
        <div className="flex flex-1 flex-col space-y-2 p-4">
          <h3 className="text-lg font-bold text-gray-900">
            {product.title}
          </h3>
          <div className="flex flex-1 flex-col justify-end">
            <p className="text-2xl font-semibold text-gray-900">₹{product.price}</p>
          </div>
        </div>
        <div className="p-4 pt-0 mt-auto">
          <div className="w-full bg-gradient-to-r from-purple-600 to-yellow-400 text-white flex items-center justify-center py-2 px-4 rounded-md font-semibold transform group-hover:scale-105 transition-transform">
            <ExternalLink className="mr-2 h-5 w-5" />
            View Product
          </div>
        </div>
      </a>
    </motion.div>
  );
};

export default EStore;