import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const CaseStudiesManager = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  const [caseStudies, setCaseStudies] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    setCaseStudies(settings.caseStudies || []);
  }, [settings.caseStudies]);

  const handleAdd = () => {
    setEditingItem({
      id: null,
      title: 'New Case Study',
      client: 'Client Name',
      challenge: 'The challenge the client was facing.',
      solution: 'How we solved the problem.',
      result: 'The positive outcomes and metrics.',
      image: '',
      video_url: '',
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
        title: editingItem.title,
        client: editingItem.client,
        challenge: editingItem.challenge,
        solution: editingItem.solution,
        result: editingItem.result,
        image: editingItem.image,
        video_url: editingItem.video_url,
      };

      let response;
      if (editingItem.id) {
        response = await supabase.from('case_studies').update(itemToSave).eq('id', editingItem.id);
      } else {
        response = await supabase.from('case_studies').insert([itemToSave]);
      }

      if (response.error) throw response.error;

      await refreshData();
      setEditingItem(null);
      toast({
        title: "✅ Case Study Saved",
        description: "The case study has been saved successfully.",
      });
    } catch (error) {
      toast({ title: "❌ Save Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this case study?")) {
      try {
        const { error } = await supabase.from('case_studies').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
        toast({
          title: "🗑️ Case Study Deleted",
          description: "The case study has been removed.",
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
        const filePath = `public/casestudies-${Date.now()}`;
        const { data, error } = await supabase.storage.from('images').upload(filePath, file);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(data.path);
        setEditingItem({ ...editingItem, image: publicUrlData.publicUrl });
        toast({ title: "✅ Image Uploaded" });
      } catch (error) {
        toast({ title: "❌ Upload Failed", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Case Studies Management</h2>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-purple-600 to-yellow-400">
          <Plus className="w-4 h-4 mr-2" />
          Add Case Study
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {caseStudies.map((study) => (
          <div key={study.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800">{study.title}</h3>
                <p className="text-sm text-gray-600">{study.client}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(study)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(study.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-700 text-sm line-clamp-2">{study.solution}</p>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingItem.id ? 'Edit Case Study' : 'Add Case Study'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <input type="text" value={editingItem.title} onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name</label>
                  <input type="text" value={editingItem.client} onChange={(e) => setEditingItem({...editingItem, client: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Challenge</label>
                  <textarea value={editingItem.challenge} onChange={(e) => setEditingItem({...editingItem, challenge: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Solution</label>
                  <textarea value={editingItem.solution} onChange={(e) => setEditingItem({...editingItem, solution: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Result</label>
                  <textarea value={editingItem.result} onChange={(e) => setEditingItem({...editingItem, result: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube Video URL</label>
                  <div className="flex items-center space-x-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={editingItem.video_url || ''} onChange={(e) => setEditingItem({...editingItem, video_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <div className="flex items-center space-x-4">
                    <img src={editingItem.image || "https://placehold.co/100x80/e2e8f0/e2e8f0"} alt="Preview" className="w-24 h-16 object-cover rounded-md bg-gray-100" />
                    <input type="file" ref={imageInputRef} className="sr-only" accept="image/*" onChange={handleFileChange} />
                    <Button type="button" variant="outline" onClick={() => imageInputRef.current.click()}>
                      <Upload className="w-4 h-4 mr-2" /> Upload
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

export default CaseStudiesManager;