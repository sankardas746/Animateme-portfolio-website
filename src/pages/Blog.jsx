import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const Blog = () => {
    const { settings, isInitialized } = useAppSettings();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const [pageContent, setPageContent] = useState({});
    const [featuredPost, setFeaturedPost] = useState(null);
    const [otherPosts, setOtherPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [filteredPosts, setFilteredPosts] = useState([]);

    useEffect(() => {
        if (isInitialized && settings.blogPosts) {
            setPageContent(settings.content?.blog || {});
            
            const sortedPosts = [...settings.blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (sortedPosts.length > 0) {
                setFeaturedPost(sortedPosts[0]);
                setOtherPosts(sortedPosts.slice(1));
            } else {
                setOtherPosts([]);
            }

            setCategories([{ id: 'All', name: 'All' }, ...(settings.blogCategories || [])]);
        }
    }, [isInitialized, settings]);

    useEffect(() => {
        let postsToFilter = otherPosts;
        if(featuredPost){
            postsToFilter = [featuredPost, ...otherPosts];
        }

        if (activeCategory === 'All') {
            setFilteredPosts(otherPosts);
        } else {
            const filtered = postsToFilter.filter(post => post.category === activeCategory);
            // check if featured post is in filtered. if so, remove it from the grid below
            if(featuredPost && filtered.some(p => p.id === featuredPost.id)){
                setFilteredPosts(filtered.filter(p => p.id !== featuredPost.id));
            } else {
                setFilteredPosts(filtered);
            }
        }
    }, [activeCategory, otherPosts, featuredPost]);


    const {
        title = 'Our Blog',
        subtitle = 'Insights, stories, and updates from our creative world.',
        newsletter_title = 'Stay Updated',
        newsletter_subtitle = 'Get the latest animation insights, tips, and industry news delivered to your inbox',
        newsletter_button_text = 'Subscribe',
        newsletter_disclaimer = 'No spam, unsubscribe at any time'
    } = pageContent;

    const handleSubscription = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { error } = await supabase
            .from('subscribers')
            .insert([{ email: email }]);

        if (error) {
            toast({
                title: "Subscription Failed",
                description: error.message.includes('unique constraint')
                    ? "You are already subscribed!"
                    : "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Subscribed!",
                description: "Thanks for subscribing! Check your inbox for a confirmation.",
            });
            setEmail('');
        }
        setIsSubmitting(false);
    };

    if (!isInitialized) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
            </div>
        );
    }
    
    return (
        <>
            <Helmet>
                <title>{title} - {settings.global?.siteName || 'Animate Me'}</title>
                <meta name="description" content={subtitle} />
            </Helmet>

            <div>
                <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <h1 className="text-5xl md:text-6xl font-bold text-white">{title}</h1>
                            <p className="text-xl text-white/90 max-w-3xl mx-auto">{subtitle}</p>
                        </motion.div>
                    </div>
                </section>

                <section className="py-16 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Featured Post */}
                        {featuredPost && (
                             <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="mb-16 bg-white rounded-3xl shadow-2xl overflow-hidden md:flex group"
                            >
                                <div className="md:w-1/2 overflow-hidden">
                                     <Link to={`/blog/${featuredPost.id}`}>
                                        <img 
                                            src={featuredPost.image || `https://placehold.co/800x600/e2e8f0/cccccc?text=${encodeURIComponent(featuredPost.title)}`}
                                            alt={featuredPost.title}
                                            className="w-full h-48 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </Link>
                                </div>
                                <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                                    <p className="text-purple-600 font-semibold mb-2">{featuredPost.category || 'Featured Article'}</p>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                                    <p className="text-gray-600 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4" />
                                            <span>{featuredPost.author}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <Link to={`/blog/${featuredPost.id}`}>
                                        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-yellow-400 text-white">
                                            Read Full Story <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {/* Category Filters */}
                        <div className="flex justify-center flex-wrap gap-3 mb-12">
                            {categories.map(category => (
                                <motion.button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.name)}
                                    className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                                        activeCategory === category.name
                                            ? 'bg-gradient-to-r from-purple-600 to-yellow-400 text-white shadow-lg scale-105'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                                    }`}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {category.name}
                                </motion.button>
                            ))}
                        </div>

                        {/* Other Blog Posts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(activeCategory === "All" ? otherPosts : filteredPosts).map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group"
                                >
                                    <Link to={`/blog/${post.id}`} className="overflow-hidden">
                                        <img 
                                            src={post.image || `https://placehold.co/600x400/e2e8f0/cccccc?text=${encodeURIComponent(post.title)}`}
                                            alt={post.title}
                                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                                            <Tag className="w-4 h-4 text-purple-500" />
                                            <span>{post.category || 'Uncategorized'}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex-grow">{post.title}</h3>
                                        <p className="text-gray-600 mb-4 line-clamp-4">{post.excerpt}</p>
                                        <div className="text-sm text-gray-500 mt-auto flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4" />
                                                <span>{post.author}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(post.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Link to={`/blog/${post.id}`} className="mt-4">
                                            <Button variant="outline" className="w-full group-hover:bg-purple-50 border-gray-300 hover:border-purple-500">Read More <ArrowRight className="w-4 h-4 ml-2" /></Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
                
                <section className="py-20 bg-gradient-to-r from-purple-600 to-yellow-400">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white">{newsletter_title}</h2>
                            <p className="text-xl text-white/90">{newsletter_subtitle}</p>
                            <form onSubmit={handleSubscription} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="flex-grow px-4 py-3 rounded-md border-0 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white"
                                    required
                                    disabled={isSubmitting}
                                />
                                <Button type="submit" size="lg" className="bg-white text-purple-600 hover:bg-gray-100" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {newsletter_button_text}
                                </Button>
                            </form>
                            <p className="text-sm text-white/80">{newsletter_disclaimer}</p>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Blog;