import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusTracker from '../../components/StatusTracker';

const STATUS_OPTIONS = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <div>
      <h2>Order Management</h2>
      {orders.map((order) => (
        <div key={order._id} className="card">
          <p><strong>{order.user?.name}</strong> ({order.user?.email})</p>
          <p>{order.pizza.base} · {order.pizza.sauce} · {order.pizza.cheese} · {order.pizza.vegetables.join(', ')}</p>
          {order.deliveryAddress && <p className="order-sub">📍 {order.deliveryAddress}</p>}
          <p>Total: ₹{order.totalAmount} | Payment: {order.payment.status}</p>
          <StatusTracker status={order.status} />
          <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
};

export default OrderManagement;