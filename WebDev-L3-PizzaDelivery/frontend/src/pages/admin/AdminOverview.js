import { useEffect, useState } from 'react';
import api from '../../api/axios';

const StatCard = ({ label, value, icon }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/orders/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p className="muted">Loading overview…</p>;

  return (
    <div>
      <div className="stats-grid">
        <StatCard label="Customers" value={stats.customers} icon="👥" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon="🧾" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon="⏳" />
        <StatCard label="Order Value" value={`₹${stats.orderValue}`} icon="💰" />
        <StatCard label="Ingredients" value={stats.ingredients} icon="🥫" />
        <StatCard label="Low Stock" value={stats.lowStock} icon="⚠️" />
      </div>

      <div className="card">
        <h3>Recent Orders</h3>
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o._id}>
                <td>ORD-{o._id.slice(-6).toUpperCase()}</td>
                <td>{o.user?.name || '—'}</td>
                <td>₹{o.totalAmount}</td>
                <td><span className="status-pill active" style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px' }}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOverview;