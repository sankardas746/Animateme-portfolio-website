import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const BlogPost = () => {
  const { postId } = useParams();
  const { settings, isInitialized } = useAppSettings();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`*, blog_categories(name)`)
        .eq('id', postId)
        .single();
      
      if (error) {
        console.error("Error fetching blog post:", error);
      } else {
        setPost({
          ...data,
          category: data.blog_categories?.name || 'Uncategorized'
        });
      }
      setLoading(false);
    };

    if (postId && isInitialized) {
      fetchPost();
    }
  }, [postId, isInitialized]);

  if (loading || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <Helmet>
            <title>Post Not Found - {settings.global?.site_name || 'Animate Me'}</title>
        </Helmet>
        <h1 className="text-4xl font-bold mb-4">Post not found</h1>
        <p className="text-gray-600 mb-8">Sorry, we couldn't find the blog post you're looking for.</p>
        <Link to="/blog">
          <Button>Back to Blog</Button>
        </Link>
      </div>
    );
  }

  const pageTitle = `${post.title || 'Blog Post'} - ${settings.global?.site_name || 'Animate Me'}`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={post.excerpt || ''} />
      </Helmet>

      <div>
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative py-32 md:py-48 bg-gradient-to-r from-purple-600 to-yellow-400">
            <div className="absolute inset-0">
                <img src={post.image || `https://placehold.co/1200x400/e2e8f0/cccccc?text=${encodeURIComponent(post.title)}`} alt={post.title} className="w-full h-full object-cover opacity-30" />
            </div>
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              <p className="text-lg font-semibold bg-white/20 text-white px-4 py-1 rounded-full inline-block mb-4">
                {post.category}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {post.title}
              </h1>
              <div className="mt-6 flex justify-center items-center space-x-6 text-white/90">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <span>{post.read_time}</span>
              </div>
            </div>
          </div>

          <div className="bg-white py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div 
                className="prose prose-lg lg:prose-xl max-w-none mx-auto prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-purple-600 hover:prose-a:text-purple-800 prose-strong:text-gray-800"
                dangerouslySetInnerHTML={{ __html: post.content }}
              >
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 border-t pt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 text-center">
                <Link to="/blog">
                  <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Articles
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </>
  );
};

export default BlogPost;