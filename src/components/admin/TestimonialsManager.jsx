import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Star, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const TestimonialsManager = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setTestimonials(settings.testimonials || []);
  }, [settings.testimonials]);

  const handleAdd = () => {
    setEditingItem({
      id: null,
      author: 'Client Name',
      company: 'Company Name',
      quote: 'Testimonial quote here...',
      rating: 5,
      avatar: ''
    });
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);

    try {
      const itemToSave = {
        author: editingItem.author,
        company: editingItem.company,
        quote: editingItem.quote,
        rating: editingItem.rating,
        avatar: editingItem.avatar,
      };

      let response;
      if (editingItem.id) {
        response = await supabase.from('testimonials').update(itemToSave).eq('id', editingItem.id);
      } else {
        response = await supabase.from('testimonials').insert([itemToSave]);
      }

      if (response.error) throw response.error;

      await refreshData();
      setEditingItem(null);
      toast({
        title: "✅ Testimonial Saved",
        description: "Testimonial has been saved successfully.",
      });
    } catch (error) {
      toast({ title: "❌ Save Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      try {
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
        toast({
          title: "🗑️ Testimonial Deleted",
          description: "Testimonial has been removed.",
        });
      } catch (error) {
        toast({ title: "❌ Delete Failed", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const filePath = `public/avatars-${Date.now()}`;
        const { data, error } = await supabase.storage.from('images').upload(filePath, file);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(data.path);
        setEditingItem({ ...editingItem, avatar: publicUrlData.publicUrl });
        toast({ title: "✅ Image Uploaded" });
      } catch (error) {
        toast({ title: "❌ Upload Failed", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Testimonials Management</h2>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-purple-600 to-yellow-400">
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800">{testimonial.author}</h3>
                <p className="text-sm text-gray-600">{testimonial.company}</p>
                <div className="flex mt-1">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(testimonial)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(testimonial.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-700 text-sm">"{testimonial.quote}"</p>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingItem.id ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Author</label>
                    <input type="text" value={editingItem.author} onChange={(e) => setEditingItem({...editingItem, author: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <input type="text" value={editingItem.company} onChange={(e) => setEditingItem({...editingItem, company: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <select value={editingItem.rating} onChange={(e) => setEditingItem({...editingItem, rating: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg">
                    {[1,2,3,4,5].map(num => (<option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quote</label>
                  <textarea value={editingItem.quote} onChange={(e) => setEditingItem({...editingItem, quote: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Avatar</label>
                  <div className="flex items-center space-x-4">
                    <img src={editingItem.avatar || "https://placehold.co/80x80/e2e8f0/e2e8f0"} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                    <input type="file" ref={avatarInputRef} className="sr-only" accept="image/*" onChange={handleFileChange} />
                    <Button type="button" variant="outline" onClick={() => avatarInputRef.current.click()}>
                      <Upload className="w-4 h-4 mr-2" /> Upload Image
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-yellow-400" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;