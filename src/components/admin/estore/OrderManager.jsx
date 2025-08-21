import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('estore_orders')
            .select(`*, estore_products(name)`)
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: 'Error fetching orders', description: error.message, variant: 'destructive' });
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleStatusChange = async (orderId, newStatus) => {
        const { error } = await supabase.from('estore_orders').update({ status: newStatus }).eq('id', orderId);
        if (error) {
            toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Order status updated.' });
            fetchOrders();
        }
    };


    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Manage Orders</h3>
            <div className="space-y-4">
                {orders.length === 0 ? <p>No orders yet.</p> : orders.map(order => (
                    <div key={order.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{order.estore_products?.name || 'Product not found'}</p>
                                <p><strong>Customer:</strong> {order.customer_name} ({order.customer_email})</p>
                                <p><strong>Amount:</strong> ₹{order.amount}</p>
                                <p><strong>Transaction ID:</strong> {order.transaction_id}</p>
                                <p className="text-sm text-gray-500">Ordered on: {new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {order.status}
                                </span>
                                <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderManager;