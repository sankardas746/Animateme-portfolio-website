import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Helmet } from 'react-helmet';

const Admin = () => {
  const { user } = useAuth();

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel</title>
      </Helmet>
      <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
        <AdminDashboard />
      </div>
    </>
  );
};

export default Admin;