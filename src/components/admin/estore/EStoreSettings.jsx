import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const EStoreSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase.from('page_estore').select('*').single();
    if (error && error.code !== 'PGRST116') {
      toast({ title: 'Error fetching settings', description: error.message, variant: 'destructive' });
    } else {
      setSettings(data || {});
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    if (!settings.id) {
        const { error } = await supabase.from('page_estore').insert(settings);
         if (error) {
          toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: 'E-Store page settings saved successfully.' });
          fetchSettings();
        }
    } else {
        const { error } = await supabase.from('page_estore').update(settings).eq('id', settings.id);
        if (error) {
          toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Success', description: 'E-Store page settings saved successfully.' });
        }
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Page Content</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="banner_headline">Banner Headline</Label>
          <Input id="banner_headline" name="banner_headline" value={settings.banner_headline || ''} onChange={handleSettingsChange} />
        </div>
        <div>
          <Label htmlFor="banner_about_text">Banner About Text</Label>
          <Textarea id="banner_about_text" name="banner_about_text" value={settings.banner_about_text || ''} onChange={handleSettingsChange} />
        </div>
        <div>
          <Label htmlFor="featured_products_title">Featured Products Title</Label>
          <Input id="featured_products_title" name="featured_products_title" value={settings.featured_products_title || ''} onChange={handleSettingsChange} />
        </div>
      </div>
      <Button onClick={handleSaveSettings} className="mt-6">Save Page Content</Button>
    </div>
  );
};

export default EStoreSettings;