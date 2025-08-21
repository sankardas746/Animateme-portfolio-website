import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Save, XCircle, Upload } from 'lucide-react';

const ProductForm = ({ product, categories, onSave, onCancel, isAdding }) => {
  const [productData, setProductData] = useState(product);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const featuredImageRef = useRef(null);
  const otherImagesRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return null;
    setIsUploading(true);
    const filePath = `product-images/${Date.now()}-${file.name}`;
    try {
      const { data, error } = await supabase.storage.from('product-images').upload(filePath, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
      setIsUploading(false);
      return publicUrlData.publicUrl;
    } catch (error) {
      toast({ title: "Image upload failed", description: error.message, variant: "destructive" });
      setIsUploading(false);
      return null;
    }
  };

  const handleFeaturedImageChange = async (e) => {
    const file = e.target.files[0];
    const url = await handleFileUpload(file);
    if (url) {
      setProductData(p => ({ ...p, featured_image_url: url }));
    }
  };

  const handleOtherImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    let urls = [...(productData.other_image_urls || [])];
    for (const file of files) {
        const url = await handleFileUpload(file);
        if (url) {
            urls.push(url);
        }
    }
    setProductData(p => ({...p, other_image_urls: urls}));
  };
  
  const removeOtherImage = (index) => {
    setProductData(p => ({...p, other_image_urls: p.other_image_urls.filter((_, i) => i !== index)}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(productData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow space-y-6">
      <h3 className="text-xl font-semibold">{isAdding ? 'Add New Product' : 'Edit Product'}</h3>
      <div>
        <Label>Name</Label>
        <Input value={productData.name} onChange={(e) => setProductData(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={productData.description} onChange={(e) => setProductData(p => ({ ...p, description: e.target.value }))} />
      </div>
      <div>
        <Label>Price (₹)</Label>
        <Input type="number" value={productData.price} onChange={(e) => setProductData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
      </div>
      <div>
        <Label>Stripe Price ID</Label>
        <Input value={productData.stripe_price_id || ''} onChange={(e) => setProductData(p => ({ ...p, stripe_price_id: e.target.value }))} placeholder="price_... (Optional)"/>
        <p className="text-xs text-gray-500 mt-1">For Stripe integration. Can be left blank for manual payments.</p>
      </div>
      <div>
        <Label>Category</Label>
        <Select value={productData.category_id || ''} onValueChange={(value) => setProductData(p => ({ ...p, category_id: value }))}>
          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
          <SelectContent>
            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Featured Image</Label>
        <div className="flex items-center gap-4 mt-2">
            {productData.featured_image_url && <img src={productData.featured_image_url} alt="Featured" className="w-24 h-24 object-cover rounded-md" />}
            <input type="file" ref={featuredImageRef} onChange={handleFeaturedImageChange} className="hidden" accept="image/*" />
            <Button type="button" variant="outline" onClick={() => featuredImageRef.current.click()} disabled={isUploading}>
                <Upload className="w-4 h-4 mr-2" /> {productData.featured_image_url ? 'Change' : 'Upload'}
            </Button>
        </div>
      </div>
      
      <div>
          <Label>Other Images</Label>
          <div className="mt-2 grid grid-cols-3 gap-4">
              {(productData.other_image_urls || []).map((url, index) => (
                  <div key={index} className="relative">
                      <img src={url} alt={`Other ${index+1}`} className="w-24 h-24 object-cover rounded-md" />
                      <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeOtherImage(index)}>
                          <XCircle className="h-4 w-4" />
                      </Button>
                  </div>
              ))}
              <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center">
                  <input type="file" ref={otherImagesRef} onChange={handleOtherImagesChange} multiple className="hidden" accept="image/*" />
                  <Button type="button" variant="outline" size="icon" onClick={() => otherImagesRef.current.click()} disabled={isUploading}>
                      <PlusCircle className="h-6 w-6" />
                  </Button>
              </div>
          </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_featured" checked={productData.is_featured} onChange={(e) => setProductData(p => ({ ...p, is_featured: e.target.checked }))} />
        <Label htmlFor="is_featured">Featured Product</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isUploading}><Save className="mr-2 h-4 w-4" /> {isUploading ? 'Uploading...' : 'Save'}</Button>
        <Button variant="outline" onClick={onCancel}><XCircle className="mr-2 h-4 w-4" /> Cancel</Button>
      </div>
    </form>
  );
};

export default ProductForm;