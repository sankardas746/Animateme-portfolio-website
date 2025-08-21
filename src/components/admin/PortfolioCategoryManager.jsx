import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PortfolioCategoryManager = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeType, setActiveType] = useState('video');

  useEffect(() => {
    setCategories(settings.portfolioCategories || []);
  }, [settings.portfolioCategories]);

  const handleAdd = () => {
    setEditingCategory({ id: null, name: '', type: activeType });
  };

  const handleEdit = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSave = async () => {
    if (!editingCategory || !editingCategory.name.trim() || !editingCategory.type) {
      toast({
        title: "⚠️ Validation Error",
        description: "Category name and type are required.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);

    try {
      const categoryToSave = { 
        name: editingCategory.name.trim(),
        type: editingCategory.type,
      };

      let response;
      if (editingCategory.id) {
        response = await supabase
          .from('portfolio_categories')
          .update(categoryToSave)
          .eq('id', editingCategory.id);
      } else {
        response = await supabase
          .from('portfolio_categories')
          .insert([categoryToSave]);
      }

      if (response.error) throw response.error;

      await refreshData();
      setEditingCategory(null);
      toast({
        title: "✅ Category Saved",
        description: "The portfolio category has been saved successfully.",
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
    if (window.confirm("Are you sure you want to delete this category? This might affect existing portfolio items.")) {
      try {
        const { error } = await supabase.from('portfolio_categories').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
        toast({
          title: "🗑️ Category Deleted",
          description: "The portfolio category has been removed.",
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

  const filteredCategories = categories.filter(c => c.type === activeType);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Portfolio Category Management</h2>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-purple-600 to-yellow-400">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
        <Button onClick={() => setActiveType('video')} variant={activeType === 'video' ? 'default' : 'ghost'} className={`w-full ${activeType === 'video' ? 'bg-purple-600 text-white' : ''}`}>
            <Video className="w-4 h-4 mr-2" /> Video Categories
        </Button>
        <Button onClick={() => setActiveType('art')} variant={activeType === 'art' ? 'default' : 'ghost'} className={`w-full ${activeType === 'art' ? 'bg-purple-600 text-white' : ''}`}>
            <ImageIcon className="w-4 h-4 mr-2" /> Art Categories
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category Name
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCategories.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500">No {activeType} categories found. Click 'Add Category' to get started.</p>
            </div>
        )}
      </div>

      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingCategory.id ? 'Edit Category' : 'Add New Category'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingCategory(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category Name</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Explainer Videos"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Category Type</label>
                    <Select
                        value={editingCategory.type}
                        onValueChange={(value) => setEditingCategory({ ...editingCategory, type: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="art">Art</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-yellow-400" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCategoryManager;