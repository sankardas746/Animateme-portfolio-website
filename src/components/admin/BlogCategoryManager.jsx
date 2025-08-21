import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const CategoryForm = ({ isOpen, onClose, onSubmit, categoryData, setCategoryData, editingCategory, isSaving }) => {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <input
            name="name"
            value={categoryData.name}
            onChange={handleInputChange}
            placeholder="Category Name"
            className="w-full p-3 border rounded-md"
            required
          />
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-yellow-400" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BlogCategoryManager = () => {
  const { settings, refreshData } = useAppSettings();
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryData, setCategoryData] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCategories(settings.blogCategories || []);
  }, [settings.blogCategories]);

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setCategoryData({ name: '' });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let response;
      if (editingCategory) {
        response = await supabase.from('blog_categories').update({ name: categoryData.name }).eq('id', editingCategory.id);
      } else {
        response = await supabase.from('blog_categories').insert([{ name: categoryData.name }]);
      }
      if (response.error) throw response.error;
      
      await refreshData();
      toast({ title: `✅ Category ${editingCategory ? 'Updated' : 'Created'}`, description: `The category has been successfully ${editingCategory ? 'updated' : 'created'}.` });
      resetForm();
    } catch (error) {
      toast({ title: "❌ Save Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryData({ name: category.name });
    setIsFormOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This might affect existing blog posts.')) {
      try {
        const { error } = await supabase.from('blog_categories').delete().eq('id', categoryId);
        if (error) throw error;
        await refreshData();
        toast({ title: "🗑️ Category Deleted", description: "The category has been removed." });
      } catch (error) {
        toast({ title: "❌ Delete Failed", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <CategoryForm
        isOpen={isFormOpen}
        onClose={resetForm}
        onSubmit={handleSaveCategory}
        categoryData={categoryData}
        setCategoryData={setCategoryData}
        editingCategory={editingCategory}
        isSaving={isSaving}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Blog Category Management</h2>
        <Button onClick={() => { setEditingCategory(null); setCategoryData({name: ''}); setIsFormOpen(true); }} className="bg-gradient-to-r from-purple-600 to-yellow-400">
          <Plus className="w-4 h-4 mr-2" /> Create New Category
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length > 0 ? categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="2" className="text-center py-10 text-gray-500">No categories found. Create one to get started!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogCategoryManager;