import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const ContactSettings = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings.content?.contact);
  const [socialLinks, setSocialLinks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const contactSettings = settings.content?.contact || {};
    setLocalSettings(JSON.parse(JSON.stringify(contactSettings)));
    
    const linksArray = contactSettings.social_links 
      ? Object.entries(contactSettings.social_links).map(([platform, url]) => ({ platform, url }))
      : [];
    setSocialLinks(linksArray);

  }, [settings.content?.contact]);

  const handleInputChange = useCallback((name, value) => {
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSocialLinkChange = (index, field, value) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleBudgetRangeChange = (index, value) => {
    const newRanges = [...(localSettings?.budget_options || [])];
    newRanges[index] = value;
    handleInputChange('budget_options', newRanges);
  };

  const addBudgetRange = () => {
    const newRanges = [...(localSettings?.budget_options || []), ''];
    handleInputChange('budget_options', newRanges);
  };

  const removeBudgetRange = (index) => {
    const newRanges = (localSettings?.budget_options || []).filter((_, i) => i !== index);
    handleInputChange('budget_options', newRanges);
  };

  const handleProjectTypeChange = (index, value) => {
    const newTypes = [...(localSettings?.project_types || [])];
    newTypes[index] = value;
    handleInputChange('project_types', newTypes);
  };

  const addProjectType = () => {
    const newTypes = [...(localSettings?.project_types || []), ''];
    handleInputChange('project_types', newTypes);
  };

  const removeProjectType = (index) => {
    const newTypes = (localSettings?.project_types || []).filter((_, i) => i !== index);
    handleInputChange('project_types', newTypes);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const socialLinksObject = socialLinks.reduce((acc, { platform, url }) => {
        if (platform && url) {
          acc[platform.toLowerCase()] = url;
        }
        return acc;
      }, {});

      const { error } = await supabase
        .from('page_contact')
        .update({ 
            ...localSettings,
            social_links: socialLinksObject,
            updated_at: new Date()
        })
        .eq('id', settings.content?.contact?.id || 1);

      if (error) throw error;

      await refreshData();
      toast({
        title: "✅ Settings Saved",
        description: "Your contact settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "❌ Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-8 rounded-xl shadow-md"
    >
      <form onSubmit={handleSave} className="space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact & Social Links</h2>
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={localSettings?.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" value={localSettings?.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input type="text" value={localSettings?.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                      <input type="text" value={localSettings?.working_hours || ''} onChange={(e) => handleInputChange('working_hours', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
                    <div className="space-y-3">
                      {socialLinks.map((link, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Platform (e.g., facebook)"
                            value={link.platform}
                            onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                            className="w-1/3 px-3 py-2 border rounded-md"
                          />
                          <input
                            type="url"
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                            className="w-2/3 px-3 py-2 border rounded-md"
                          />
                          <Button type="button" variant="outline" size="icon" onClick={() => removeSocialLink(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialLink} className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Social Link
                    </Button>
                  </div>
              </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="2xl font-bold text-gray-800 mb-6">Contact Form & Currency</h2>
          <div className="space-y-8">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency Symbol
              </label>
              <input
                type="text"
                id="currency"
                name="currency"
                value={localSettings?.currency || ''}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g., ₹, $, €"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Types
              </label>
              <div className="space-y-3">
                {(localSettings?.project_types || []).map((type, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={type}
                      onChange={(e) => handleProjectTypeChange(index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder={`Project Type ${index + 1}`}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeProjectType(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addProjectType} className="mt-3">
                <Plus className="w-4 h-4 mr-2" />
                Add Project Type
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Ranges
              </label>
              <div className="space-y-3">
                {(localSettings?.budget_options || []).map((range, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={range}
                      onChange={(e) => handleBudgetRangeChange(index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder={`Budget Range ${index + 1}`}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeBudgetRange(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addBudgetRange} className="mt-3">
                <Plus className="w-4 h-4 mr-2" />
                Add Budget Range
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end border-t pt-8 mt-8">
          <Button type="submit" className="bg-gradient-to-r from-purple-600 to-yellow-400" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ContactSettings;