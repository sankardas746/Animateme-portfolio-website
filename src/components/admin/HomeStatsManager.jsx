import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const HomeStatsManager = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  const [stats, setStats] = useState([]);
  const [editingStat, setEditingStat] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.homeStats) {
      setStats([...settings.homeStats].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    }
  }, [settings.homeStats]);

  const handleAdd = () => {
    setEditingStat({ id: null, label: '', value: '', sort_order: stats.length + 1 });
  };

  const handleEdit = (stat) => {
    setEditingStat({ ...stat });
  };

  const handleSave = async () => {
    if (!editingStat || !editingStat.label.trim() || !editingStat.value.trim()) {
      toast({
        title: "⚠️ Validation Error",
        description: "Label and Value cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);

    try {
      const statToSave = { 
        label: editingStat.label.trim(),
        value: editingStat.value.trim(),
        sort_order: editingStat.sort_order
      };

      let response;
      if (editingStat.id) {
        response = await supabase
          .from('home_stats')
          .update(statToSave)
          .eq('id', editingStat.id);
      } else {
        response = await supabase
          .from('home_stats')
          .insert([statToSave]);
      }

      if (response.error) throw response.error;

      await refreshData();
      setEditingStat(null);
      toast({
        title: "✅ Stat Saved",
        description: "The home page stat has been saved successfully.",
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
    if (window.confirm("Are you sure you want to delete this stat?")) {
      try {
        const { error } = await supabase.from('home_stats').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
        toast({
          title: "🗑️ Stat Deleted",
          description: "The home page stat has been removed.",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Home Page Stats Management</h2>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-purple-600 to-yellow-400">
          <Plus className="w-4 h-4 mr-2" />
          Add Stat
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.map((stat) => (
              <tr key={stat.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.label}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.value}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.sort_order}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(stat)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(stat.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingStat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingStat.id ? 'Edit Stat' : 'Add New Stat'}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingStat(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Label</label>
                  <input
                    type="text"
                    value={editingStat.label}
                    onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Projects Completed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Value</label>
                  <input
                    type="text"
                    value={editingStat.value}
                    onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 500+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={editingStat.sort_order}
                    onChange={(e) => setEditingStat({ ...editingStat, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setEditingStat(null)}>Cancel</Button>
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

export default HomeStatsManager;