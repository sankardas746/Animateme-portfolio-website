import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, UploadCloud, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from './RichTextEditor';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from '@/lib/customSupabaseClient';

const PostForm = ({ isOpen, onClose, onSubmit, postData, setPostData, editingPost, categories, isSaving }) => {
  const imageInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setPostData(prev => ({ ...prev, content }));
  };

  const handleCategoryChange = (value) => {
    setPostData(prev => ({ ...prev, category_id: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const filePath = `public/blog-images/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('images').upload(filePath, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(data.path);
      setPostData(prev => ({ ...prev, image: publicUrlData.publicUrl }));
    } catch (error) {
      console.error("Image upload error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <input name="title" value={postData.title} onChange={handleInputChange} placeholder="Post Title" className="w-full p-3 border rounded-md" required />
          
          <Select onValueChange={handleCategoryChange} value={postData.category_id || ''}>
            <SelectTrigger className="w-full p-3 border rounded-md">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <textarea name="excerpt" value={postData.excerpt} onChange={handleInputChange} placeholder="Short Excerpt (for post preview)" rows="3" className="w-full p-3 border rounded-md" required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Post Content</label>
            <RichTextEditor value={postData.content} onChange={handleContentChange} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-16">
            <input name="author" value={postData.author} onChange={handleInputChange} placeholder="Author Name" className="w-full p-3 border rounded-md" required />
            <input name="read_time" value={postData.read_time} onChange={handleInputChange} placeholder="Read Time (e.g., 5 min read)" className="w-full p-3 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
            <div className="flex items-center gap-4">
              {postData.image && <img src={postData.image} alt="Preview" className="w-24 h-24 object-cover rounded-md" />}
              <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <Button type="button" variant="outline" onClick={() => imageInputRef.current.click()}>
                <UploadCloud className="w-4 h-4 mr-2" /> {postData.image ? 'Change Image' : 'Upload Image'}
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-yellow-400" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BlogManager = () => {
  const { settings, refreshData } = useAppSettings();
  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [postData, setPostData] = useState({
    title: '', excerpt: '', content: '', author: 'Admin', category_id: '', image: '', read_time: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    setBlogPosts(settings.blogPosts || []);
    setCategories(settings.blogCategories || []);
  }, [settings.blogPosts, settings.blogCategories]);

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingPost(null);
    setPostData({
      title: '', excerpt: '', content: '', author: 'Admin', category_id: '', image: '', read_time: ''
    });
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { blog_categories, category, ...postToSave } = postData;
      
      const dataToSubmit = Object.keys(postToSave).reduce((acc, key) => {
        if (key !== 'blog_categories' && key !== 'category') {
            acc[key] = postToSave[key];
        }
        return acc;
      }, {});


      let response;
      if (editingPost) {
        response = await supabase.from('blog_posts').update(dataToSubmit).eq('id', editingPost.id);
      } else {
        response = await supabase.from('blog_posts').insert([{ ...dataToSubmit, date: new Date().toISOString() }]);
      }
      if (response.error) throw response.error;

      await refreshData();
      toast({ title: `✅ Post ${editingPost ? 'Updated' : 'Created'}`, description: `The blog post has been successfully ${editingPost ? 'updated' : 'created'}.` });
      resetForm();
    } catch (error) {
      toast({ title: "❌ Save Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setPostData({
      ...post,
      read_time: post.read_time || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
        if (error) throw error;
        await refreshData();
        toast({ title: "🗑️ Post Deleted", description: "The blog post has been removed." });
      } catch (error) {
        toast({ title: "❌ Delete Failed", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <PostForm 
        isOpen={isFormOpen}
        onClose={resetForm}
        onSubmit={handleSavePost}
        postData={postData}
        setPostData={setPostData}
        editingPost={editingPost}
        categories={categories}
        isSaving={isSaving}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Blog Posts Management</h2>
        <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-to-r from-purple-600 to-yellow-400">
          <Plus className="w-4 h-4 mr-2" /> Create New Post
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogPosts.length > 0 ? blogPosts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(post)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">No blog posts found. Create one to get started!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogManager;