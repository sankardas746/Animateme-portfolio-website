import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Settings, Edit3, MessageSquare, Briefcase, FileText, User, Users, Film, PenSquare, Quote, BarChart, Home, Mail, DollarSign, Shield, FolderKanban } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import PageContentManager from './PageContentManager';
import ContactSubmissions from './ContactSubmissions';
import ServicesManager from './ServicesManager';
import PortfolioManager from './PortfolioManager';
import TestimonialsManager from './TestimonialsManager';
import CaseStudiesManager from './CaseStudiesManager';
import BlogManager from './BlogManager';
import PortfolioCategoryManager from './PortfolioCategoryManager';
import QuoteCalculatorManager from './QuoteCalculatorManager';
import HomeStatsManager from './HomeStatsManager';
import SubscribersManager from './SubscribersManager';
import QuoteRequestsManager from './QuoteRequestsManager';
import UserManager from './UserManager';
import HeroSliderManager from './HeroSliderManager';

const AdminDashboard = () => {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General Settings', icon: Settings },
        { id: 'hero_slider', label: 'Hero Slider', icon: Home },
        { id: 'pages', label: 'Page Content', icon: Edit3 },
        { id: 'services', label: 'Services', icon: Briefcase },
        { id: 'portfolio_categories', label: 'Portfolio Categories', icon: FolderKanban },
        { id: 'portfolio', label: 'Portfolio Items', icon: Film },
        { id: 'testimonials', label: 'Testimonials', icon: Users },
        { id: 'case_studies', label: 'Case Studies', icon: FileText },
        { id: 'blog', label: 'Blog', icon: PenSquare },
        { id: 'submissions', label: 'Contact Submissions', icon: MessageSquare },
        { id: 'subscribers', label: 'Subscribers', icon: Mail },
        { id: 'quote_calculator', label: 'Quote Calculator', icon: Quote },
        { id: 'quote_requests', label: 'Quote Requests', icon: DollarSign },
        { id: 'home_stats', label: 'Home Stats', icon: BarChart },
        { id: 'users', label: 'User Manager', icon: Shield },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings />;
            case 'hero_slider':
                return <HeroSliderManager />;
            case 'pages':
                return <PageContentManager />;
            case 'services':
                return <ServicesManager />;
            case 'portfolio_categories':
                return <PortfolioCategoryManager />;
            case 'portfolio':
                return <PortfolioManager />;
            case 'testimonials':
                return <TestimonialsManager />;
            case 'case_studies':
                return <CaseStudiesManager />;
            case 'blog':
                return <BlogManager />;
            case 'submissions':
                return <ContactSubmissions />;
            case 'subscribers':
                return <SubscribersManager />;
            case 'quote_calculator':
                return <QuoteCalculatorManager />;
            case 'quote_requests':
                return <QuoteRequestsManager />;
            case 'home_stats':
                return <HomeStatsManager />;
            case 'users':
                return <UserManager />;
            default:
                return <GeneralSettings />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4 lg:w-1/5 space-y-6">
                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                    <User className="mx-auto w-16 h-16 text-purple-600 mb-2" />
                    <p className="font-semibold text-gray-700">{user.email}</p>
                    <Button onClick={signOut} variant="link" className="text-red-500 text-sm mt-2">
                        Sign Out
                    </Button>
                </div>
                <nav className="p-4 bg-white rounded-lg shadow-md">
                    <ul className="space-y-1">
                        {tabs.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center p-3 rounded-md text-left transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-purple-100 text-purple-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <tab.icon className="w-5 h-5 mr-3" />
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="flex-1">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;