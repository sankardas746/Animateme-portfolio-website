import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const GeneralSettings = () => {
  const { settings, refreshData } = useAppSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings.global);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  useEffect(() => {
    setLocalSettings(JSON.parse(JSON.stringify(settings.global || {})));
  }, [settings.global]);

  const handleInputChange = useCallback((name, value) => {
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  }, []);

  const uploadFile = async (file, bucket, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  };

  const handleFileChange = async (e, name) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const filePath = `public/${name}-${Date.now()}`;
        const publicUrl = await uploadFile(file, 'images', filePath);
        handleInputChange(name, publicUrl);
        toast({ title: "✅ Image Uploaded", description: "Your image has been uploaded successfully." });
      } catch (error) {
        toast({ title: "❌ Upload Failed", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('general_settings')
        .update({ 
          site_name: localSettings.site_name,
          logo: localSettings.logo,
          favicon: localSettings.favicon,
          footer_description: localSettings.footer_description,
          updated_at: new Date()
        })
        .eq('id', settings.global.id || 1);
      
      if (error) throw error;

      await refreshData();
      toast({
        title: "✅ Settings Saved",
        description: "Your general settings have been updated successfully.",
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">General Settings</h2>
          <div className="space-y-8">
            <div>
              <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-2">
                App Name
              </label>
              <input
                type="text"
                id="site_name"
                name="site_name"
                value={localSettings?.site_name || ''}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border">
                  {localSettings?.logo ? (
                    <img src={localSettings.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-500 text-center">No Logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    ref={logoInputRef}
                    onChange={(e) => handleFileChange(e, 'logo')}
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => logoInputRef.current.click()}>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 200x50px. PNG, JPG or SVG.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border">
                  {localSettings?.favicon ? (
                    <img src={localSettings.favicon} alt="Favicon Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-500">...</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="favicon"
                    name="favicon"
                    ref={faviconInputRef}
                    onChange={(e) => handleFileChange(e, 'favicon')}
                    accept="image/png, image/x-icon"
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => faviconInputRef.current.click()}>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Upload Favicon
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 32x32px. PNG or ICO.</p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="footer_description" className="block text-sm font-medium text-gray-700 mb-2">
                Footer Description
              </label>
              <textarea
                id="footer_description"
                name="footer_description"
                rows="3"
                value={localSettings?.footer_description || ''}
                onChange={(e) => handleInputChange('footer_description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">A short description displayed in the footer under the logo.</p>
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

export default GeneralSettings;