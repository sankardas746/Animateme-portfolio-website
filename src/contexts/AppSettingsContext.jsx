import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AppSettingsContext = createContext();

export const useAppSettings = () => useContext(AppSettingsContext);

const defaultSettings = {
  global: { site_name: 'Animate Me', logo: '/logo.png', favicon: '/favicon.png' },
  content: {},
  portfolioItems: [],
  portfolioCategories: [],
  portfolioAssets: [],
  services: [],
  testimonials: [],
  caseStudies: [],
  blogPosts: [],
  blogCategories: [],
  quoteAnimationTypes: [],
  quoteAnimationStyles: [],
  homeHeroSlides: [],
  homeStats: [],
};

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const tableNames = [
        'general_settings',
        'page_home',
        'page_services',
        'page_portfolio',
        'page_testimonials',
        'page_contact',
        'page_quote',
        'page_case_studies',
        'page_blog',
        'page_about',
        'page_disclaimer',
        'page_privacy_policy',
        'services',
        'portfolio_items',
        'portfolio_categories',
        'portfolio_assets',
        'testimonials',
        'case_studies',
        'blog_posts',
        'blog_categories',
        'quote_animation_types',
        'quote_animation_styles',
        'home_hero_slides',
        'home_stats',
      ];

      const promises = tableNames.map(tableName => {
        if (tableName.startsWith('page_') || tableName === 'general_settings') {
          return supabase.from(tableName).select('*').limit(1).single();
        } else if (tableName === 'blog_posts') {
            return supabase.from('blog_posts').select('*, blog_categories(name)').order('date', { ascending: false });
        } else if (tableName === 'portfolio_items') {
            return supabase.from('portfolio_items').select('*, portfolio_categories(name)').order('date', { ascending: false });
        } else if (tableName === 'portfolio_assets') {
            return supabase.from('portfolio_assets').select('*, portfolio_categories(name)').order('created_at', { ascending: false });
        } else if (tableName === 'home_hero_slides') {
            return supabase.from('home_hero_slides').select('*').order('sort_order', { ascending: true });
        } else if (tableName === 'home_stats') {
            return supabase.from('home_stats').select('*').order('sort_order', { ascending: true });
        }
        return supabase.from(tableName).select('*');
      });

      const responses = await Promise.all(promises);

      const newSettings = { ...defaultSettings, content: {} };
      
      responses.forEach((res, index) => {
        const tableName = tableNames[index];
        if (res.error && res.error.code !== 'PGRST116') { // Ignore error for empty single() result
            console.warn(`Error fetching ${tableName}:`, res.error);
        }

        const data = res.data;

        switch (tableName) {
          case 'general_settings':
            newSettings.global = data || defaultSettings.global;
            break;
          case 'page_home':
            newSettings.content.home = data || {};
            break;
          case 'page_services':
            newSettings.content.services = data || {};
            break;
          case 'page_portfolio':
            newSettings.content.portfolio = data || {};
            break;
          case 'page_testimonials':
            newSettings.content.testimonials = data || {};
            break;
          case 'page_contact':
            newSettings.content.contact = data || {};
            break;
          case 'page_quote':
            newSettings.content.quote = data || {};
            break;
          case 'page_case_studies':
            newSettings.content.caseStudies = data || {};
            break;
          case 'page_blog':
            newSettings.content.blog = data || {};
            break;
          case 'page_about':
            newSettings.content.about = data || {};
            break;
          case 'page_disclaimer':
            newSettings.content.disclaimer = data || {};
            break;
          case 'page_privacy_policy':
            newSettings.content.privacy_policy = data || {};
            break;
          case 'services':
            newSettings.services = data || [];
            break;
          case 'portfolio_items':
            newSettings.portfolioItems = (data || []).map(p => ({...p, category: p.portfolio_categories?.name || 'Uncategorized'}));
            break;
          case 'portfolio_categories':
            newSettings.portfolioCategories = data || [];
            break;
          case 'portfolio_assets':
            newSettings.portfolioAssets = (data || []).map(p => ({...p, category: p.portfolio_categories?.name || 'Uncategorized'}));
            break;
          case 'testimonials':
            newSettings.testimonials = data || [];
            break;
          case 'case_studies':
            newSettings.caseStudies = data || [];
            break;
          case 'blog_posts':
            newSettings.blogPosts = (data || []).map(p => ({...p, category: p.blog_categories?.name || 'Uncategorized'}));
            break;
          case 'blog_categories':
            newSettings.blogCategories = data || [];
            break;
          case 'quote_animation_types':
            newSettings.quoteAnimationTypes = data || [];
            break;
          case 'quote_animation_styles':
            newSettings.quoteAnimationStyles = data || [];
            break;
          case 'home_hero_slides':
            newSettings.homeHeroSlides = data || [];
            break;
          case 'home_stats':
            newSettings.homeStats = data || [];
            break;
          default:
            break;
        }
      });
      
      setSettings(newSettings);

    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
      setSettings(defaultSettings);
    } finally {
      setIsInitialized(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const value = { settings, isInitialized, loading, setSettings, refreshData: fetchAllData };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};