import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import RichTextEditor from '@/components/admin/RichTextEditor';

const ServiceSamplesManager = () => {
  const { toast } = useToast();
  const [samples, setSamples] = useState([]);
  const [services, setServices] = useState([]);
  const [editingSample, setEditingSample] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: samplesData, error: samplesError } = await supabase
        .from('service_samples')
        .select('*, services(name)');
      if (samplesError) throw samplesError;
      setSamples(samplesData.map(s => ({...s, serviceName: s.services?.name || 'N/A' })));

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name');
      if (servicesError) throw servicesError;
      setServices(servicesData);
    } catch (error) {
      toast({
        title: "❌ Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (services.length === 0) {
      toast({
        title: "⚠️ No services found",
        description: "Please add a service before adding a sample.",
        variant: "destructive",
      });
      return;
    }
    setEditingSample({
      id: null,
      service_id: services[0].id,
      details_content: '<p>Start writing the detailed description here...</p>',
      video_url: '',
      features: ['Feature 1', 'Feature 2'],
    });
  };

  const handleEdit = (sample) => {
    setEditingSample({
      ...sample,
      features: sample.features || [],
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...editingSample.features];
    newFeatures[index] = value;
    setEditingSample({ ...editingSample, features: newFeatures });
  };

  const addFeature = () => {
    setEditingSample({ ...editingSample, features: [...(editingSample.features || []), ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = editingSample.features.filter((_, i) => i !== index);
    setEditingSample({ ...editingSample, features: newFeatures });
  };

  const handleSave = async () => {
    if (!editingSample) return;
    setIsSaving(true);
    
    try {
      const sampleData = {
        service_id: editingSample.service_id,
        details_content: editingSample.details_content,
        video_url: editingSample.video_url,
        features: editingSample.features,
      };

      let response;
      if (editingSample.id) {
        response = await supabase
          .from('service_samples')
          .update(sampleData)
          .eq('id', editingSample.id);
      } else {
        response = await supabase
          .from('service_samples')
          .insert([sampleData]);
      }

      if (response.error) throw response.error;

      await fetchData();
      setEditingSample(null);
      toast({
        title: "✅ Sample Saved",
        description: "Your service sample has been saved successfully.",
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
    if (window.confirm("Are you sure you want to delete this sample?")) {
      try {
        const { error } = await supabase.from('service_samples').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
        toast({
          title: "🗑️ Sample Deleted",
          description: "The service sample has been removed.",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Service Samples Management</h2>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-purple-600 to-yellow-400">
          <Plus className="w-4 h-4 mr-2" />
          Add New Sample
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Has Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Has Video</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {samples.map((sample) => (
                    <tr key={sample.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.serviceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.details_content ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.video_url ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(sample)}><Edit className="w-4 h-4" /></Button>
                                <Button size="sm" variant="outline" onClick={() => handleDelete(sample.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {editingSample && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="p-6 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingSample.id ? 'Edit Sample' : 'Add New Sample'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingSample(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="px-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Service</label>
                  <select
                    value={editingSample.service_id}
                    onChange={(e) => setEditingSample({ ...editingSample, service_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={editingSample.id} // Don't allow changing service for existing samples
                  >
                    {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                  </select>
                </div>
                
                <div className="pb-8">
                  <label className="block text-sm font-medium mb-2">Full Details Content</label>
                  <RichTextEditor
                    value={editingSample.details_content || ''}
                    onChange={(value) => setEditingSample({ ...editingSample, details_content: value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Video Sample URL (YouTube)</label>
                  <input
                    type="url"
                    value={editingSample.video_url || ''}
                    onChange={(e) => setEditingSample({ ...editingSample, video_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Features</label>
                  <div className="space-y-2">
                    {(editingSample.features || []).map((feature, index) => (
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
            </div>

            <div className="flex justify-end space-x-3 mt-auto p-6 flex-shrink-0 border-t">
              <Button variant="outline" onClick={() => setEditingSample(null)}>
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

export default ServiceSamplesManager;