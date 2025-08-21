import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player/youtube';
import { Play, Filter, X, Eye, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Link } from 'react-router-dom';
import AnimatedCounter from '@/components/AnimatedCounter';

const Portfolio = () => {
    const { toast } = useToast();
    const { settings, isInitialized } = useAppSettings();
    
    const [mainTab, setMainTab] = useState('Video');
    const [subTab, setSubTab] = useState('All');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [loading, setLoading] = useState(true);

    const {
        pageContent,
        portfolioItems,
        portfolioAssets,
        videoCategories,
        artCategories
    } = useMemo(() => {
        return {
            pageContent: settings.content?.portfolio || {},
            portfolioItems: settings.portfolioItems || [],
            portfolioAssets: settings.portfolioAssets || [],
            videoCategories: (settings.portfolioCategories || []).filter(c => c.type === 'video'),
            artCategories: (settings.portfolioCategories || []).filter(c => c.type === 'art'),
        }
    }, [settings]);

    useEffect(() => {
        if(isInitialized){
            setLoading(false);
        }
    }, [isInitialized]);

    useEffect(() => {
        setSubTab('All');
    }, [mainTab]);

    const { 
        title = 'Our Work', 
        subtitle = 'A Glimpse into Our Animated Worlds',
        cta_title = 'Ready to Create Your Next Masterpiece?',
        cta_subtitle = 'Join our portfolio of successful projects and bring your vision to life',
        cta_button = 'Start Your Project'
    } = pageContent;
      
    const stats = pageContent?.stats || [];

    const filteredItems = useMemo(() => {
        if (mainTab === 'Video') {
            if (subTab === 'All') return portfolioItems;
            return portfolioItems.filter(item => item.category === subTab);
        }
        if (mainTab === 'Art') {
            if (subTab === 'All') return portfolioAssets;
            return portfolioAssets.filter(item => item.category === subTab);
        }
        return [];
    }, [mainTab, subTab, portfolioItems, portfolioAssets]);

    const getYoutubeVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getThumbnailUrl = (item) => {
        if (item.image) return item.image;
        const videoId = getYoutubeVideoId(item.video_url);
        if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return "https://images.unsplash.com/photo-1583268921016-514d0a038478?w=800&q=80";
    };

    const handleVideoClick = (item) => {
        if (item.video_url) {
            setSelectedVideo(item);
            setIsPlayerReady(false);
        } else {
            toast({
                title: "🚧 Video Not Available",
                description: "A valid YouTube link for this project has not been added yet.",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
            </div>
        );
    }
    
    const currentSubCategories = mainTab === 'Video' ? videoCategories : artCategories;

    return (
        <>
            <Helmet>
                <title>{title} - {settings.global?.siteName || 'Animate Me'}</title>
                <meta name="description" content="Explore our portfolio of stunning animations, character designs, and background art." />
            </Helmet>

            <div>
                <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
                            <h1 className="text-5xl md:text-6xl font-bold text-white">{title}</h1>
                            <p className="text-xl text-white/90 max-w-3xl mx-auto">{subtitle}</p>
                        </motion.div>
                    </div>
                </section>

                <section className="py-8 bg-white border-b sticky top-16 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-full">
                                <Button onClick={() => setMainTab('Video')} variant={mainTab === 'Video' ? 'default' : 'ghost'} className={`rounded-full transition-all duration-200 ${mainTab === 'Video' ? 'bg-gradient-to-r from-purple-600 to-yellow-400' : ''}`}><Video className="w-4 h-4 mr-2"/>Video</Button>
                                <Button onClick={() => setMainTab('Art')} variant={mainTab === 'Art' ? 'default' : 'ghost'} className={`rounded-full transition-all duration-200 ${mainTab === 'Art' ? 'bg-gradient-to-r from-purple-600 to-yellow-400' : ''}`}><ImageIcon className="w-4 h-4 mr-2"/>Art</Button>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Button variant={subTab === 'All' ? 'secondary' : 'outline'} onClick={() => setSubTab('All')} className="rounded-full">All</Button>
                                {currentSubCategories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={subTab === category.name ? "secondary" : "outline"}
                                        onClick={() => setSubTab(category.name)}
                                        className="rounded-full">
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gradient-to-br from-purple-50 to-yellow-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${mainTab}-${subTab}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {filteredItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group cursor-pointer"
                                        onClick={() => mainTab === 'Video' ? handleVideoClick(item) : setSelectedImage(item)}
                                    >
                                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                            <div className="relative">
                                                <img
                                                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                                    alt={item.title}
                                                    src={mainTab === 'Video' ? getThumbnailUrl(item) : item.image_url}
                                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/e2e8f0/e2e8f0"; }}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                                        {mainTab === 'Video' ? <Play className="w-8 h-8 text-purple-600 ml-1" /> : <Eye className="w-8 h-8 text-purple-600" />}
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-yellow-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                    {item.category}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{item.title}</h3>
                                                {mainTab === 'Video' && (
                                                    <>
                                                        <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                                            <span className="font-medium">{item.client}</span>
                                                            <span>{item.date ? new Date(item.date).getFullYear() : ''}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {filteredItems.length === 0 && !loading && (
                            <div className="text-center py-20 col-span-full">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">No items found</h3>
                                <p className="text-gray-600">Try selecting a different category or check back later for new content.</p>
                            </div>
                        )}
                    </div>
                </section>
                
                {stats && stats.length > 0 && (
                    <section className="py-20 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                                {stats.map((stat, index) => (
                                    <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="space-y-2">
                                        <AnimatedCounter value={stat.value} />
                                        <p className="text-gray-600 font-medium">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-white">{cta_title}</h2>
                            <p className="text-xl text-white/90 max-w-3xl mx-auto">{cta_subtitle}</p>
                            <Link to="/contact">
                                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">{cta_button}</Button>
                            </Link>
                        </motion.div>
                    </div>
                </section>
                
                <AnimatePresence>
                    {selectedVideo && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-center p-6 border-b">
                                    <h3 className="text-2xl font-bold">{selectedVideo.title}</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedVideo(null)}><X className="w-6 h-6" /></Button>
                                </div>
                                <div className="p-6">
                                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4 relative">
                                        {!isPlayerReady && <div className="absolute inset-0 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div></div>}
                                        <ReactPlayer url={selectedVideo.video_url} playing={true} controls={true} width="100%" height="100%" onReady={() => setIsPlayerReady(true)} config={{ youtube: { playerVars: { showinfo: 0, modestbranding: 1, rel: 0 } } }} />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                                    <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedImage(null)}><X className="w-6 h-6" /></Button>
                                </div>
                                <div className="p-2 md:p-6 overflow-auto">
                                    <img src={selectedImage.image_url} alt={selectedImage.title} className="w-full h-auto object-contain rounded-lg max-h-[75vh]" />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default Portfolio;