import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AdminLogin from '@/components/admin/AdminLogin';
import { Helmet } from 'react-helmet';
import { PlusCircle, Edit, Trash2, Upload, X, Loader2 } from 'lucide-react';

const AdminHeroSliderManager = () => {
  const { session } = useAuth();
  const [slides, setSlides] = useState([]);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchSlides = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('home_hero_slides').select('*').order('sort_order', { ascending: true });
    if (error) {
      toast({ title: 'Error fetching slides', description: error.message, variant: 'destructive' });
    } else {
      setSlides(data);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    if (session) {
      fetchSlides();
    }
  }, [session, fetchSlides]);

  const handleImageUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `public/${fileName}`;

    setIsUploading(true);
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadError) {
      toast({ title: 'Image upload failed', description: uploadError.message, variant: 'destructive' });
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
    setEditingSlide(prev => ({ ...prev, background_image: publicUrl }));
    setIsUploading(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingSlide) return;
    setIsSubmitting(true);

    const slideData = { ...editingSlide };
    let error;

    if (slideData.id) {
      const { error: updateError } = await supabase.from('home_hero_slides').update(slideData).eq('id', slideData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('home_hero_slides').insert(slideData);
      error = insertError;
    }

    if (error) {
      toast({ title: 'Error saving slide', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Slide saved successfully.' });
      setEditingSlide(null);
      fetchSlides();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      const { error } = await supabase.from('home_hero_slides').delete().eq('id', id);
      if (error) {
        toast({ title: 'Error deleting slide', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Slide deleted successfully.' });
        fetchSlides();
      }
    }
  };

  const startNewSlide = () => {
    setEditingSlide({
      tagline1: '',
      tagline2: '',
      subtitle: '',
      cta_text: '',
      cta_link: '',
      background_image: '',
      sort_order: slides.length + 1,
    });
  };

  if (!session) {
    return <AdminLogin />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin - Hero Slider Manager</title>
      </Helmet>
      <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Hero Slider Manager</h1>
          <Button onClick={startNewSlide}><PlusCircle className="mr-2 h-4 w-4" /> Add New Slide</Button>
        </div>

        {editingSlide && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">{editingSlide.id ? 'Edit Slide' : 'Add New Slide'}</h2>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tagline1">Tagline 1</Label>
                <Input id="tagline1" value={editingSlide.tagline1} onChange={(e) => setEditingSlide({ ...editingSlide, tagline1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline2">Tagline 2</Label>
                <Input id="tagline2" value={editingSlide.tagline2} onChange={(e) => setEditingSlide({ ...editingSlide, tagline2: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input id="subtitle" value={editingSlide.subtitle} onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_text">CTA Text</Label>
                <Input id="cta_text" value={editingSlide.cta_text} onChange={(e) => setEditingSlide({ ...editingSlide, cta_text: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_link">CTA Link</Label>
                <Input id="cta_link" value={editingSlide.cta_link} onChange={(e) => setEditingSlide({ ...editingSlide, cta_link: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="background_image">Background Image</Label>
                <div className="flex items-center gap-4">
                  <Input id="background_image" type="file" onChange={handleImageUpload} disabled={isUploading} className="flex-grow" />
                  {isUploading && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                {editingSlide.background_image && (
                  <div className="mt-4 relative w-48 h-24">
                    <img src={editingSlide.background_image} alt="Preview" className="rounded-md object-cover w-full h-full" />
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setEditingSlide({ ...editingSlide, background_image: '' })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setEditingSlide(null)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Slide
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Image</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Tagline</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map(slide => (
                <tr key={slide.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4">
                    <img src={slide.background_image} alt={slide.tagline1} className="w-24 h-12 object-cover rounded-md" />
                  </td>
                  <td className="p-4 font-medium text-gray-800">{slide.tagline1} {slide.tagline2}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => setEditingSlide(slide)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(slide.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminHeroSliderManager;