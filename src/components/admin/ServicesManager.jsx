import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { getIconComponent } from '@/lib/iconHelper.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import RichTextEditor from '@/components/admin/RichTextEditor';

const ServicesManager = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  const [localServices, setLocalServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalServices(settings.services || []);
  }, [settings.services]);

  const handleAdd = () => {
    setEditingService({
      id: null,
      icon: 'Palette',
      name: 'New Service',
      description: 'A brief description of the new service.',
      price_per_second: 0,
      image: null,
      details_content: '<p>Start writing the detailed description here...</p>',
      video_url: '',
      features: ['Feature 1', 'Feature 2'],
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEdit = (service) => {
    setEditingService({
      ...service,
      features: service.features || [],
    });
    setImageFile(null);
    setImagePreview(service.image || null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...editingService.features];
    newFeatures[index] = value;
    setEditingService({ ...editingService, features: newFeatures });
  };

  const addFeature = () => {
    setEditingService({ ...editingService, features: [...(editingService.features || []), ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = editingService.features.filter((_, i) => i !== index);
    setEditingService({ ...editingService, features: newFeatures });
  };

  const handleSave = async () => {
    if (!editingService) return;
    setIsSaving(true);

    try {
      let imageUrl = editingService.image;

      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(`services/${fileName}`, imageFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = urlData.publicUrl;
      }

      const serviceData = {
        name: editingService.name,
        description: editingService.description,
        icon: editingService.icon,
        price_per_second: editingService.price_per_second,
        image: imageUrl,
        details_content: editingService.details_content,
        video_url: editingService.video_url,
        features: editingService.features,
      };

      let response;
      if (editingService.id) {
        response = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)
          .select();
      } else {
        response = await supabase
          .from('services')
          .insert([serviceData])
          .select();
      }

      if (response.error) throw response.error;

      await refreshData();
      setEditingService(null);
      setImageFile(null);
      setImagePreview(null);
      toast({
        title: "✅ Service Saved",
        description: "Your service has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "❌ Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
        
        await refreshData();
        toast({
          title: "🗑️ Service Deleted",
          description: "The service has been removed.",
        });
      } catch (error) {
        toast({
          title: "❌ Delete Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const iconOptions = ['Palette', 'Zap', 'Video', 'Youtube', 'FileText', 'Mic', 'Baby', 'Package'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Services Management</h2>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-purple-600 to-yellow-400">
          <Plus className="w-4 h-4 mr-2" />
          Add New Service
        </Button>
      </div>
      <p className="text-sm text-gray-600">Manage all details of your services here, including descriptions, images, videos, and features.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 flex items-center space-x-4 bg-gray-50 border-b">
              <div className="text-purple-600">{getIconComponent(service.icon, "w-6 h-6")}</div>
              <h3 className="font-bold text-gray-800 truncate">{service.name}</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(service.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="p-6 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingService.id ? 'Edit Service' : 'Add New Service'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingService(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="px-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Icon</label>
                  <select
                    value={editingService.icon}
                    onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <textarea
                    value={editingService.description}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="pb-8">
                  <label className="block text-sm font-medium mb-2">Full Details Content</label>
                  <RichTextEditor
                    value={editingService.details_content || ''}
                    onChange={(value) => setEditingService({ ...editingService, details_content: value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Video Sample URL (YouTube)</label>
                  <input
                    type="url"
                    value={editingService.video_url || ''}
                    onChange={(e) => setEditingService({ ...editingService, video_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Features</label>
                  <div className="space-y-2">
                    {(editingService.features || []).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder={`Feature ${index + 1}`}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature} className="mt-2">
                    <Plus className="w-4 h-4 mr-2" /> Add Feature
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price Per Second ({settings.contact?.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingService.price_per_second || 0}
                    onChange={(e) => setEditingService({ ...editingService, price_per_second: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-auto p-6 flex-shrink-0 border-t">
              <Button variant="outline" onClick={() => setEditingService(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-yellow-400" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ServicesManager;