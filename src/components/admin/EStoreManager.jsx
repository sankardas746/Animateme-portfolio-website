import React, { useState } from 'react';
import { ShoppingCart, Settings } from 'lucide-react';
import ProductManager from '@/components/admin/estore/ProductManager';
import OrderManager from '@/components/admin/estore/OrderManager';
import CategoryManager from '@/components/admin/estore/CategoryManager';
import PaymentSettingsManager from '@/components/admin/estore/PaymentSettingsManager';
import EStoreSettings from '@/components/admin/estore/EStoreSettings';

const EStoreManager = () => {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Manage Products', icon: ShoppingCart, component: <ProductManager /> },
    { id: 'orders', label: 'Manage Orders', icon: ShoppingCart, component: <OrderManager /> },
    { id: 'categories', label: 'Product Categories', icon: null, component: <CategoryManager /> },
    { id: 'payment', label: 'Payment Settings', icon: Settings, component: <PaymentSettingsManager /> },
    { id: 'settings', label: 'Page Settings', icon: null, component: <EStoreSettings /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
          >
            {tab.icon && <tab.icon className="mr-2 h-4 w-4" />}
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default EStoreManager;