import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Video, Image as ImageIcon, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PortfolioCategoryManager from './PortfolioCategoryManager';

const PortfolioManager = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    setPortfolioItems(settings.portfolioItems || []);
    setPortfolioAssets(settings.portfolioAssets || []);
    setCategories(settings.portfolioCategories || []);
  }, [settings.portfolioItems, settings.portfolioAssets, settings.portfolioCategories]);

  const handleAdd = () => {
    const defaultCategory = categories.find(c => c.type === activeTab);
    setEditingItem({
      id: null,
      type: activeTab,
      title: 'New Project',
      sub_category_id: defaultCategory ? defaultCategory.id : null,
      image: '',
      image_url: '',
      video_url: '',
      description: 'Project description',
      client: 'Client Name',
      date: new Date().toISOString(),
    });
  };

  const handleEdit = (item, type) => {
    const fullItem = type === 'video' 
      ? settings.portfolioItems.find(p => p.id === item.id)
      : settings.portfolioAssets.find(p => p.id === item.id);
    setEditingItem({ ...fullItem, type });
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);

    try {
      let response;
      if (editingItem.type === 'video') {
        const itemToSave = {
          title: editingItem.title,
          sub_category_id: editingItem.sub_category_id,
          image: editingItem.image,
          video_url: editingItem.video_url,
          description: editingItem.description,
          client: editingItem.client,
          date: editingItem.date,
        };
        if (editingItem.id) {
          response = await supabase.from('portfolio_items').update(itemToSave).eq('id', editingItem.id);
        } else {
          response = await supabase.from('portfolio_items').insert([itemToSave]);
        }
      } else { // type is 'art'
        const itemToSave = {
          title: editingItem.title,
          image_url: editingItem.image_url,
          sub_category_id: editingItem.sub_category_id,
          sub_category_id_text: editingItem.sub_category_id || 'default'
        };
        if (editingItem.id) {
          response = await supabase.from('portfolio_assets').update(itemToSave).eq('id', editingItem.id);
        } else {
          response = await supabase.from('portfolio_assets').insert([itemToSave]);
        }
      }

      if (response.error) throw response.error;

      await refreshData();
      setEditingItem(null);
      toast({
        title: "✅ Portfolio Updated",
        description: "Portfolio item has been saved successfully.",
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

  const handleDelete = async (id, type) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const fromTable = type === 'video' ? 'portfolio_items' : 'portfolio_assets';
        const { error } = await supabase.from(fromTable).delete().eq('id', id);
        if (error) throw error;
        await refreshData();
        toast({
          title: "🗑️ Item Deleted",
          description: "Portfolio item has been removed.",
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && editingItem) {
      setIsSaving(true);
      try {
        const filePath = `public/portfolio-${Date.now()}`;
        const { data, error } = await supabase.storage.from('images').upload(filePath, file);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(data.path);
        
        const imageUrl = publicUrlData.publicUrl;
        if (editingItem.type === 'video') {
          setEditingItem({ ...editingItem, image: imageUrl });
        } else {
          setEditingItem({ ...editingItem, image_url: imageUrl });
        }
        toast({ title: "✅ Image Uploaded" });
      } catch (error) {
        toast({ title: "❌ Upload Failed", description: error.message, variant: "destructive" });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const renderVideoItems = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolioItems.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src={item.image || "https://placehold.co/300x200/e2e8f0/e2e8f0"} alt={item.title} className="w-full h-32 object-cover"/>
          <div className="p-4">
            <h3 className="font-bold text-gray-800 mb-2 truncate">{item.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{item.category || 'Uncategorized'}</p>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(item, 'video')}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(item.id, 'video')}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderArtItems = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolioAssets.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src={item.image_url || "https://placehold.co/300x200/e2e8f0/e2e8f0"} alt={item.title} className="w-full h-32 object-cover"/>
          <div className="p-4">
            <h3 className="font-bold text-gray-800 mb-2 truncate">{item.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{item.category || 'Uncategorized'}</p>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(item, 'art')}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(item.id, 'art')}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderModal = () => {
    if (!editingItem) return null;
    
    const currentCategories = categories.filter(c => c.type === editingItem.type);
    const isVideo = editingItem.type === 'video';
    const imageUrl = isVideo ? editingItem.image : editingItem.image_url;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingItem.id ? 'Edit' : 'Add'} {isVideo ? 'Video' : 'Art'} Item</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input type="text" value={editingItem.title} onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              
              {isVideo && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client</label>
                    <input type="text" value={editingItem.client} onChange={(e) => setEditingItem({...editingItem, client: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input type="date" value={editingItem.date ? editingItem.date.split('T')[0] : ''} onChange={(e) => setEditingItem({...editingItem, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select
                  value={editingItem.sub_category_id || ''}
                  onValueChange={(value) => setEditingItem({ ...editingItem, sub_category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isVideo && (
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL</label>
                  <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={editingItem.video_url || ''} onChange={(e) => setEditingItem({...editingItem, video_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">{isVideo ? 'Thumbnail Image' : 'Image'}</label>
                <div className="flex items-center space-x-4">
                  <img src={imageUrl || "https://placehold.co/100x80/e2e8f0/e2e8f0"} alt="Preview" className="w-24 h-16 object-cover rounded-md bg-gray-100"/>
                  <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  <Button type="button" variant="outline" onClick={() => imageInputRef.current.click()} disabled={isSaving}>
                    <Upload className="w-4 h-4 mr-2" /> {isSaving ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>

              {isVideo && (
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea value={editingItem.description} onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
              )}
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
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800">Portfolio Items Management</h2>
        <div className="flex gap-2">
            <Button onClick={() => setShowCategoryManager(true)} variant="outline">
                <FolderKanban className="w-4 h-4 mr-2" />
                Manage Categories
            </Button>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-purple-600 to-yellow-400">
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
        <Button onClick={() => setActiveTab('video')} variant={activeTab === 'video' ? 'default' : 'ghost'} className={`w-full ${activeTab === 'video' ? 'bg-purple-600 text-white' : ''}`}>
            <Video className="w-4 h-4 mr-2" /> Video Items
        </Button>
        <Button onClick={() => setActiveTab('art')} variant={activeTab === 'art' ? 'default' : 'ghost'} className={`w-full ${activeTab === 'art' ? 'bg-purple-600 text-white' : ''}`}>
            <ImageIcon className="w-4 h-4 mr-2" /> Art Items
        </Button>
      </div>

      {activeTab === 'video' ? renderVideoItems() : renderArtItems()}
      {renderModal()}
      
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Manage Portfolio Categories</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCategoryManager(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto">
              <PortfolioCategoryManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
