import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const QuoteRequestsManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchQuoteRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching quote requests:', error);
      toast({
        title: "Error",
        description: "Could not fetch quote requests.",
        variant: "destructive",
      });
    } else {
      setRequests(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote request?')) {
      const { error } = await supabase.from('quote_requests').delete().eq('id', id);
      if (error) {
        toast({
          title: "Error",
          description: "Could not delete quote request.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Quote request deleted successfully.",
        });
        fetchQuoteRequests();
      }
    }
  };
  
  const filteredRequests = useMemo(() =>
    requests.filter(
      (req) =>
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.animation_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.animation_style.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.message && req.message.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [requests, searchTerm]
  );
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Quote Requests</h2>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, email, type, style, or message..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 font-semibold text-gray-600">Name</th>
                <th className="p-3 font-semibold text-gray-600">Email</th>
                <th className="p-3 font-semibold text-gray-600">Type</th>
                <th className="p-3 font-semibold text-gray-600">Style</th>
                <th className="p-3 font-semibold text-gray-600">Duration</th>
                <th className="p-3 font-semibold text-gray-600">Estimated Price</th>
                <th className="p-3 font-semibold text-gray-600">Message</th>
                <th className="p-3 font-semibold text-gray-600">Submitted On</th>
                <th className="p-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{req.name}</td>
                    <td className="p-3 text-purple-600">{req.email}</td>
                    <td className="p-3">{req.animation_type}</td>
                    <td className="p-3">{req.animation_style}</td>
                    <td className="p-3">{req.duration / 60} min</td>
                    <td className="p-3">₹{req.estimated_price}</td>
                    <td className="p-3 max-w-xs cursor-pointer" title="Click to view full message">
                        {req.message ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <span className="text-blue-600 hover:underline">
                                        {req.message.length > 50 ? req.message.substring(0, 47) + '...' : req.message}
                                    </span>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Message from {req.name}</DialogTitle>
                                        <DialogDescription className="whitespace-pre-wrap">
                                            {req.message}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p><strong>Email:</strong> {req.email}</p>
                                        <p><strong>Animation Type:</strong> {req.animation_type}</p>
                                        <p><strong>Animation Style:</strong> {req.animation_style}</p>
                                        <p><strong>Duration:</strong> {req.duration / 60} minutes</p>
                                        <p><strong>Estimated Price:</strong> ₹{req.estimated_price}</p>
                                        <p><strong>Submitted On:</strong> {new Date(req.submitted_at).toLocaleDateString()}</p>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            '-'
                        )}
                    </td>
                    <td className="p-3">{new Date(req.submitted_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(req.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-6 text-gray-500">
                    No quote requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuoteRequestsManager;