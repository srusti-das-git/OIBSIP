import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminOverview from './AdminOverview';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';
import { useState } from 'react';

const AdminDashboard = () => {
  const { admin, logoutAdmin } = useAuth();
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="page">
      <div className="admin-welcome-card">
        <div>
          <p className="admin-welcome-eyebrow">ADMINISTRATOR</p>
          <h1>Welcome, {admin?.name}</h1>
          <p className="admin-welcome-sub">Manage customer orders and pizza ingredients from one dashboard.</p>
        </div>
        <button className="btn-primary" onClick={handleLogout}>Logout</button>
      </div>

      <div className="tabs">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>Inventory</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
      </div>

      {tab === 'overview' && <AdminOverview />}
      {tab === 'inventory' && <InventoryManagement />}
      {tab === 'orders' && <OrderManagement />}
    </div>
  );
};

export default AdminDashboard;