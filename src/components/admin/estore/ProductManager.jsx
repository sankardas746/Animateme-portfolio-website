import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import ProductForm from './ProductForm';

const ProductManager = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProductsAndCategories = useCallback(async () => {
    setLoading(true);
    const { data: productsData, error: productsError } = await supabase.from('estore_products').select('*, estore_categories(id, name)').order('name');
    const { data: categoriesData, error: categoriesError } = await supabase.from('estore_categories').select('*').order('name');

    if (productsError) toast({ title: 'Error fetching products', description: productsError.message, variant: 'destructive' });
    else setProducts(productsData || []);

    if (categoriesError) toast({ title: 'Error fetching categories', description: categoriesError.message, variant: 'destructive' });
    else setCategories(categoriesData || []);
    
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);
  
  const handleSave = async (productData) => {
    const productToSave = { ...productData };
    delete productToSave.estore_categories;

    const { error } = isAdding
      ? await supabase.from('estore_products').insert(productToSave)
      : await supabase.from('estore_products').update(productToSave).eq('id', productToSave.id);

    if (error) {
      toast({ title: 'Error saving product', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Product ${isAdding ? 'added' : 'updated'}.` });
      setEditingProduct(null);
      setIsAdding(false);
      fetchProductsAndCategories();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('estore_products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting product', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Product deleted.' });
      fetchProductsAndCategories();
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingProduct({ name: '', description: '', price: 0, category_id: null, is_featured: false, featured_image_url: '', other_image_urls: [], stripe_price_id: '' });
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAdding(false);
  };

  if (loading) return <div>Loading products...</div>;

  if (editingProduct) {
    return <ProductForm product={editingProduct} categories={categories} onSave={handleSave} onCancel={handleCancel} isAdding={isAdding} />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Products</h3>
        <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Product</Button>
      </div>
      <div className="space-y-2">
        {products.map(product => (
          <div key={product.id} className="flex justify-between items-center p-2 border rounded-md">
            <div className="flex items-center gap-4">
              <img src={product.featured_image_url || 'https://placehold.co/64x64/e2e8f0/e2e8f0'} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
              <div>
                <p className="font-semibold">{product.name} - ₹{product.price}</p>
                <p className="text-sm text-gray-500">{product.estore_categories?.name || 'Uncategorized'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingProduct(product); }}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;