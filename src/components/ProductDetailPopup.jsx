import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Tag, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProductDetailPopup = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    if (product) {
      setMainImage(product.featured_image_url || 'https://images.unsplash.com/photo-1539278383962-a7774385fa02');
    }
  }, [product]);

  const handleCheckout = () => {
    navigate(`/checkout/${product.id}`);
  };

  if (!product) return null;

  const otherImages = product.other_image_urls || [];
  const galleryImages = [product.featured_image_url, ...otherImages]
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-1/2 p-6">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
            <img alt={product.name} className="h-full w-full object-cover object-center" src={mainImage} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {galleryImages.slice(0, 3).map((imgUrl, index) => (
              <div 
                key={index} 
                className={`aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 cursor-pointer border-2 ${mainImage === imgUrl ? 'border-purple-500' : 'border-transparent'}`}
                onClick={() => setMainImage(imgUrl)}
              >
                <img alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full object-cover object-center" src={imgUrl} />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
          
          <div className="mt-2 flex items-center">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">₹{product.price}</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <Tag className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {product.estore_categories?.name || 'Uncategorized'}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-base text-gray-700 dark:text-gray-300 flex-grow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="mt-8">
            <Button
              onClick={handleCheckout}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-yellow-400 text-white hover:from-purple-700 hover:to-yellow-500 transition-all transform hover:scale-105"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetailPopup;