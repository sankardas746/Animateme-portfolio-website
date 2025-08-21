import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Shield, KeyRound, Loader2 } from 'lucide-react';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(''); // 'password', 'role', 'delete'
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { session, user: adminUser } = useAuth();
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        if (!session) {
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('admin-user-management', {
                body: JSON.stringify({ action: 'listUsers' }),
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            
            if (error) {
              const errorBody = await error.context.json();
              throw new Error(errorBody.error || error.message);
            }

            if(data.error) {
                throw new Error(data.error);
            }

            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            toast({
                title: "Failed to fetch users",
                description: error.message || "An unknown error occurred.",
                variant: "destructive",
            });
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [session, toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const openDialog = (user, type) => {
        setEditingUser(user);
        setDialogType(type);
        if (type === 'role') setNewRole(user.role);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingUser(null);
        setNewPassword('');
        setNewRole('');
        setIsSubmitting(false);
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-user-management', {
                body: JSON.stringify({ action: 'updateUserPassword', payload: { userId: editingUser.id, newPassword } }),
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (error) {
                const errorBody = await error.context.json();
                throw new Error(errorBody.error || error.message);
            };
            if(data.error) throw new Error(data.error);
            toast({ title: "Success", description: `Password for ${editingUser.email} has been updated.` });
            handleDialogClose();
        } catch (error) {
            toast({ title: "Error", description: `Failed to update password: ${error.message}`, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRole = async () => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-user-management', {
                body: JSON.stringify({ action: 'updateUserRole', payload: { userId: editingUser.id, newRole } }),
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (error) {
                const errorBody = await error.context.json();
                throw new Error(errorBody.error || error.message);
            };
            if(data.error) throw new Error(data.error);
            toast({ title: "Success", description: `Role for ${editingUser.email} updated to ${newRole}.` });
            fetchUsers();
            handleDialogClose();
        } catch (error) {
            toast({ title: "Error", description: `Failed to update role: ${error.message}`, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteUser = async () => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-user-management', {
                body: JSON.stringify({ action: 'deleteUser', payload: { userId: editingUser.id } }),
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (error) {
                const errorBody = await error.context.json();
                throw new Error(errorBody.error || error.message);
            };
            if(data.error) throw new Error(data.error);
            toast({ title: "Success", description: `User ${editingUser.email} has been deleted.` });
            fetchUsers();
            handleDialogClose();
        } catch (error) {
            toast({ title: "Error", description: `Failed to delete user: ${error.message}`, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDialogContent = () => {
        if (!editingUser) return null;

        switch (dialogType) {
            case 'password':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Change Password for {editingUser.email}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                            <Button onClick={handleUpdatePassword} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin"/> : "Update Password"}</Button>
                        </DialogFooter>
                    </>
                );
            case 'role':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Change Role for {editingUser.email}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <Label htmlFor="new-role">New Role</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                            <Button onClick={handleUpdateRole} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin"/> : "Update Role"}</Button>
                        </DialogFooter>
                    </>
                );
            case 'delete':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Delete User {editingUser.email}?</DialogTitle>
                        </DialogHeader>
                        <p className="py-4">Are you sure you want to permanently delete this user? This action cannot be undone.</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteUser} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin"/> : "Delete User"}</Button>
                        </DialogFooter>
                    </>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 gradient-text flex items-center"><Shield className="mr-2" /> User Management</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Joined</th>
                            <th scope="col" className="px-6 py-3">Last Sign In</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openDialog(user, 'password')}><KeyRound className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => openDialog(user, 'role')}><Shield className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => openDialog(user, 'delete')} className="text-red-500 hover:text-red-700" disabled={user.id === adminUser.id}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManager;