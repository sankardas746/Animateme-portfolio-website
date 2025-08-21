import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      toast({ title: "❌ Error fetching submissions", description: error.message, variant: "destructive" });
    } else {
      setSubmissions(data);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
      if (error) {
        toast({ title: "❌ Delete failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "🗑️ Submission deleted" });
        fetchSubmissions();
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Contact Form Submissions</h2>
      
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No submissions yet</h3>
            <p className="text-gray-600">Contact form submissions will appear here</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">{submission.name}</h3>
                  <p className="text-sm text-gray-600">{submission.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(submission.submitted_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Button size="icon" variant="outline" onClick={() => handleDelete(submission.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactSubmissions;