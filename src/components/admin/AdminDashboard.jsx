import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Edit, Check, X, Building, Users, Award, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from './RichTextEditor';

const iconMap = {
  building: Building,
  users: Users,
  award: Award,
};

const IconSelect = ({ value, onChange }) => (
    <div className="flex space-x-2">
        {Object.keys(iconMap).map(iconKey => {
            const Icon = iconMap[iconKey];
            return (
                <Button 
                    key={iconKey} 
                    type="button" 
                    variant={value === iconKey ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onChange(iconKey)}
                    className={value === iconKey ? 'bg-purple-600' : ''}
                >
                    <Icon className="w-5 h-5" />
                </Button>
            );
        })}
    </div>
);


const HomeAboutManager = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  
  const [mainContent, setMainContent] = useState({});
  const [tabs, setTabs] = useState([]);
  const [editingTab, setEditingTab] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.homeAboutSection) {
      setMainContent(JSON.parse(JSON.stringify(settings.homeAboutSection)));
    }
    if (settings.homeAboutTabs) {
      setTabs(JSON.parse(JSON.stringify(settings.homeAboutTabs)));
    }
  }, [settings.homeAboutSection, settings.homeAboutTabs]);

  const handleMainContentChange = (field, value) => {
    setMainContent(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveMainContent = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('home_about_section')
        .update({ ...mainContent, updated_at: new Date() })
        .eq('id', mainContent.id);
      if (error) throw error;
      await refreshData();
      toast({ title: '✅ Main Content Saved' });
    } catch (error) {
      toast({ title: '❌ Save Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTab = () => {
    setEditingTab({
        id: null,
        icon: 'building',
        title: '',
        short_info: '',
        full_content: '',
        sort_order: tabs.length + 1
    });
  };

  const handleEditTab = (tab) => {
    setEditingTab({ ...tab });
  };
  
  const handleSaveTab = async () => {
    if (!editingTab) return;
    setIsSaving(true);
    try {
        let response;
        const tabData = { ...editingTab };
        delete tabData.created_at;
        delete tabData.updated_at;
        
        if (editingTab.id) {
            response = await supabase.from('home_about_tabs').update(tabData).eq('id', editingTab.id);
        } else {
            response = await supabase.from('home_about_tabs').insert([tabData]);
        }

        if (response.error) throw response.error;
        
        await refreshData();
        setEditingTab(null);
        toast({ title: `✅ Tab ${editingTab.id ? 'Updated' : 'Added'}` });
    } catch (error) {
        toast({ title: '❌ Save Failed', description: error.message, variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeleteTab = async (id) => {
    if (window.confirm('Are you sure you want to delete this tab?')) {
        try {
            const { error } = await supabase.from('home_about_tabs').delete().eq('id', id);
            if (error) throw error;
            await refreshData();
            toast({ title: '🗑️ Tab Deleted' });
        } catch (error) {
            toast({ title: '❌ Delete Failed', description: error.message, variant: 'destructive' });
        }
    }
  };

  const renderTabModal = () => {
    if (!editingTab) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">{editingTab.id ? 'Edit' : 'Add'} Tab</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Icon</label>
                            <IconSelect value={editingTab.icon} onChange={(icon) => setEditingTab({...editingTab, icon})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <Input value={editingTab.title} onChange={(e) => setEditingTab({...editingTab, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Short Info</label>
                            <Textarea value={editingTab.short_info} onChange={(e) => setEditingTab({...editingTab, short_info: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Content</label>
                            <RichTextEditor value={editingTab.full_content} onChange={(value) => setEditingTab({...editingTab, full_content: value})} />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setEditingTab(null)}>Cancel</Button>
                        <Button onClick={handleSaveTab} disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Main Content Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">About Section Main Content</h2>
        <div className="space-y-4">
          <Input label="Welcome Text" value={mainContent?.welcome_text || ''} onChange={(e) => handleMainContentChange('welcome_text', e.target.value)} />
          <Input label="Title" value={mainContent?.title || ''} onChange={(e) => handleMainContentChange('title', e.target.value)} />
          <Textarea label="Short Description" value={mainContent?.short_description || ''} onChange={(e) => handleMainContentChange('short_description', e.target.value)} rows={3} />
          <Textarea label="Long Description" value={mainContent?.long_description || ''} onChange={(e) => handleMainContentChange('long_description', e.target.value)} rows={5} />
          <Input label="YouTube Video URL" value={mainContent?.video_url || ''} onChange={(e) => handleMainContentChange('video_url', e.target.value)} />
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveMainContent} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Main Content'}
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Information Tabs</h2>
            <Button onClick={handleAddTab}>
                <Plus className="w-4 h-4 mr-2" /> Add New Tab
            </Button>
        </div>
        <div className="space-y-2">
            {tabs.map(tab => {
                const Icon = iconMap[tab.icon] || Building;
                return (
                    <div key={tab.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-4">
                            <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                            <Icon className="w-6 h-6 text-purple-600" />
                            <span className="font-semibold">{tab.title}</span>
                        </div>
                        <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditTab(tab)}><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteTab(tab.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
      {renderTabModal()}
    </motion.div>
  );
};

export default HomeAboutManager;
