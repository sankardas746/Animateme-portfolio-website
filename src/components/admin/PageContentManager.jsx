import React, { useState, useEffect, useCallback } from 'react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import PageSection from './page-content/PageSection';
import RichContentSection from './page-content/RichContentSection';
import StatsSection from './page-content/StatsSection';
import ProcessStepsSection from './page-content/ProcessStepsSection';

const keyToTableNameMap = {
    home: 'page_home',
    services: 'page_services',
    portfolio: 'page_portfolio',
    testimonials: 'page_testimonials',
    blog: 'page_blog',
    quote: 'page_quote',
    caseStudies: 'page_case_studies',
    contact: 'page_contact',
    about: 'page_about',
    disclaimer: 'page_disclaimer',
    privacy_policy: 'page_privacy_policy',
};

const PageContentManager = () => {
  const { settings, refreshData, isInitialized } = useAppSettings();
  const [pageContent, setPageContent] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isInitialized && settings.content) {
      setPageContent(JSON.parse(JSON.stringify(settings.content)));
    }
  }, [isInitialized, settings.content]);
  
  const handleContentChange = useCallback((pageKey, field, value) => {
    setPageContent(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: value,
      },
    }));
  }, []);

  const handleStatChange = useCallback((pageKey, index, field, value) => {
    setPageContent(prev => {
        const newState = { ...prev };
        const newStats = [...(newState[pageKey]?.stats || [])];
        newStats[index] = { ...newStats[index], [field]: value };
        newState[pageKey].stats = newStats;
        return newState;
    });
  }, []);
  
  const handleAddStat = useCallback((pageKey) => {
    setPageContent(prev => {
        const newState = { ...prev };
        newState[pageKey].stats = [...(newState[pageKey]?.stats || []), { label: '', value: '' }];
        return newState;
    });
  }, []);

  const handleRemoveStat = useCallback((pageKey, index) => {
    setPageContent(prev => {
        const newState = { ...prev };
        newState[pageKey].stats = (newState[pageKey]?.stats || []).filter((_, i) => i !== index);
        return newState;
    });
  }, []);

  const handleProcessStepChange = useCallback((pageKey, index, field, value) => {
    setPageContent(prev => {
        const newState = { ...prev };
        const newSteps = [...(newState[pageKey]?.process_steps || [])];
        newSteps[index] = { ...newSteps[index], [field]: value };
        newState[pageKey].process_steps = newSteps;
        return newState;
    });
  }, []);

  const handleAddProcessStep = useCallback((pageKey) => {
    setPageContent(prev => {
        const newState = { ...prev };
        newState[pageKey].process_steps = [...(newState[pageKey]?.process_steps || []), { title: '', description: '' }];
        return newState;
    });
  }, []);

  const handleRemoveProcessStep = useCallback((pageKey, index) => {
    setPageContent(prev => {
        const newState = { ...prev };
        newState[pageKey].process_steps = (newState[pageKey]?.process_steps || []).filter((_, i) => i !== index);
        return newState;
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const updates = Object.entries(pageContent)
            .filter(([key]) => keyToTableNameMap[key] && settings.content[key])
            .map(([pageKey, content]) => {
                const tableName = keyToTableNameMap[pageKey];
                const originalContent = settings.content[pageKey];
                if (!tableName || !originalContent || !originalContent.id) {
                    console.warn(`Skipping update for ${pageKey} due to missing data.`);
                    return Promise.resolve({ error: null });
                }

                const { id, ...contentToSave } = content;
                contentToSave.updated_at = new Date().toISOString();

                return supabase.from(tableName).update(contentToSave).eq('id', originalContent.id);
            });

        const results = await Promise.all(updates);
        const errors = results.filter(res => res.error);

        if (errors.length > 0) {
            errors.forEach(err => console.error("Save error details:", err.error));
            throw new Error(errors.map(e => e.error.message).join(', '));
        }

        await refreshData();
        toast({
            title: "✅ Content Updated",
            description: "All page content has been saved successfully.",
        });
    } catch (error) {
        console.error("Save failed:", error);
        toast({
            title: "❌ Save Failed",
            description: `An error occurred: ${error.message}`,
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (!isInitialized || Object.keys(pageContent).length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Page Content Management</h2>
        <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-yellow-400" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <PageSection title="Services Page" pageKey="services" fields={[
            { key: 'title', label: 'Page Title' },
            { key: 'subtitle', label: 'Page Subtitle' },
            { key: 'process_title', label: 'Process Section Title' },
            { key: 'cta_title', label: 'CTA Section Title' },
            { key: 'cta_subtitle', label: 'CTA Section Subtitle' },
            { key: 'cta_button', label: 'CTA Button Text' },
        ]} content={pageContent} onContentChange={handleContentChange} />

        <ProcessStepsSection title="Services Page Process Steps" pageKey="services" content={pageContent} onStepChange={handleProcessStepChange} onAddStep={handleAddProcessStep} onRemoveStep={handleRemoveProcessStep} />

        <PageSection title="Portfolio Page" pageKey="portfolio" fields={[
          { key: 'title', label: 'Page Title' },
          { key: 'subtitle', label: 'Page Subtitle' },
          { key: 'cta_title', label: 'CTA Title' },
          { key: 'cta_subtitle', label: 'CTA Subtitle' },
          { key: 'cta_button', label: 'CTA Button Text' },
        ]} content={pageContent} onContentChange={handleContentChange} />

        <StatsSection title="Portfolio Page Stats" pageKey="portfolio" content={pageContent} onStatChange={handleStatChange} onAddStat={handleAddStat} onRemoveStat={handleRemoveStat} />

        <PageSection title="Testimonials Page" pageKey="testimonials" fields={[
          { key: 'title', label: 'Page Title' },
          { key: 'subtitle', label: 'Page Subtitle' },
          { key: 'cta_title', label: 'CTA Title' },
          { key: 'cta_subtitle', label: 'CTA Subtitle' },
          { key: 'cta_button', label: 'CTA Button Text' },
        ]} content={pageContent} onContentChange={handleContentChange} />

        <StatsSection title="Testimonials Page Stats" pageKey="testimonials" content={pageContent} onStatChange={handleStatChange} onAddStat={handleAddStat} onRemoveStat={handleRemoveStat} />
        
        <PageSection title="Blog Page" pageKey="blog" fields={[
          { key: 'title', label: 'Page Title' },
          { key: 'subtitle', label: 'Page Subtitle' },
          { key: 'newsletter_title', label: 'Newsletter Title' },
          { key: 'newsletter_subtitle', label: 'Newsletter Subtitle' },
          { key: 'newsletter_button_text', label: 'Newsletter Button Text' },
          { key: 'newsletter_disclaimer', label: 'Newsletter Disclaimer' },
        ]} content={pageContent} onContentChange={handleContentChange} />
        
        <PageSection title="Quote Calculator Page" pageKey="quote" fields={[
          { key: 'title', label: 'Page Title' },
          { key: 'subtitle', label: 'Page Subtitle' },
          { key: 'currency_symbol', label: 'Currency Symbol (e.g., $, ₹)'},
          { key: 'form_animation_type_label', label: 'Form: Animation Type Label' },
          { key: 'form_animation_style_label', label: 'Form: Animation Style Label' },
          { key: 'form_duration_label', label: 'Form: Duration Label' },
          { key: 'form_duration_unit', label: 'Form: Duration Unit' },
          { key: 'result_box_title', label: 'Result Box: Title' },
          { key: 'result_box_subtitle', label: 'Result Box: Subtitle' },
          { key: 'result_box_button_text', label: 'Result Box: Button Text' },
        ]} content={pageContent} onContentChange={handleContentChange} />

        <PageSection title="Case Studies Page" pageKey="caseStudies" fields={[
            { key: 'title', label: 'Page Title' },
            { key: 'subtitle', label: 'Page Subtitle' },
            { key: 'cta_title', label: 'CTA Title' },
            { key: 'cta_subtitle', label: 'CTA Subtitle' },
            { key: 'cta_button', label: 'CTA Button Text' },
        ]} content={pageContent} onContentChange={handleContentChange} />

        <PageSection title="About Us Page" pageKey="about" fields={[
          { key: 'title', label: 'Page Title' },
          { key: 'subtitle', label: 'Page Subtitle' },
          { key: 'image', label: 'Image URL' }
        ]} content={pageContent} onContentChange={handleContentChange} />
        <RichContentSection title="About Us Content" pageKey="about" content={pageContent} onContentChange={handleContentChange} />

        <PageSection title="Disclaimer Page" pageKey="disclaimer" fields={[
          { key: 'title', label: 'Page Title' }
        ]} content={pageContent} onContentChange={handleContentChange} />
        <RichContentSection title="Disclaimer Content" pageKey="disclaimer" content={pageContent} onContentChange={handleContentChange} />

        <PageSection title="Privacy Policy Page" pageKey="privacy_policy" fields={[
          { key: 'title', label: 'Page Title' }
        ]} content={pageContent} onContentChange={handleContentChange} />
        <RichContentSection title="Privacy Policy Content" pageKey="privacy_policy" content={pageContent} onContentChange={handleContentChange} />
      </div>
    </div>
  );
};

export default PageContentManager;