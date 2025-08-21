import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';

const CategoryManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('estore_categories').select('*').order('name');
    if (error) {
      toast({ title: 'Error fetching categories', description: error.message, variant: 'destructive' });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const { error } = await supabase.from('estore_categories').insert({ name: newCategory.trim() });
    if (error) {
      toast({ title: 'Error adding category', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Category added.' });
      setNewCategory('');
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id) => {
    const { error } = await supabase.from('estore_categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Category deleted.' });
      fetchCategories();
    }
  };

  if(loading) return <div>Loading categories...</div>

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Product Categories</h3>
      <div className="flex gap-2 mb-4">
        <Input placeholder="New category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        <Button onClick={handleAddCategory}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
      </div>
      <ul className="space-y-2">
        {categories.map(cat => (
          <li key={cat.id} className="flex justify-between items-center p-2 border rounded-md">
            <span>{cat.name}</span>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CategoryManager;