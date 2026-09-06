import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusTracker from '../../components/StatusTracker';
import FoodImage, { useFoodImage } from '../../components/FoodImage';

const MENU_TABS = ['All', 'Pizzas', 'Drinks', 'Desserts'];
const BLURBS = {
  base: 'Freshly baked pizza base',
  drink: 'Chilled and refreshing',
  dessert: 'Sweet finish to your meal',
};

const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState({ base: [], drink: [], dessert: [] });
  const [menuTab, setMenuTab] = useState('All');
  const navigate = useNavigate();
  const heroPhoto = useFoodImage('Pizza');

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/mine');
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.get('/inventory/public').then(({ data }) =>
      setMenu({ base: data.base || [], drink: data.drink || [], dessert: data.dessert || [] })
    );
  }, []);

  const menuItems = [
    ...menu.base.map((i) => ({ ...i, category: 'base' })),
    ...menu.drink.map((i) => ({ ...i, category: 'drink' })),
    ...menu.dessert.map((i) => ({ ...i, category: 'dessert' })),
  ].filter((item) => {
    if (menuTab === 'All') return true;
    if (menuTab === 'Pizzas') return item.category === 'base';
    if (menuTab === 'Drinks') return item.category === 'drink';
    if (menuTab === 'Desserts') return item.category === 'dessert';
    return true;
  });

  return (
    <div>
      <div className="hero-banner" style={heroPhoto ? { backgroundImage: `url(${heroPhoto})` } : undefined}>
        <div className="hero-overlay">
          <div className="hero-content page">
            <div className="hero-text">
              <h1 className="brand-title">Welcome, <span className="brand-title-accent">{user?.name?.split(' ')[0]}!</span></h1>
              <p className="brand-tagline">Order pizzas, drinks, or build your own favourite from scratch.</p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => navigate('/build-pizza')}>🍕 Build Your Own Pizza</button>
                <button className="btn-ghost" onClick={logoutUser}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        <div className="promo-banner">
          <div>
            <h3>🔥 First order? Get 40% off + free delivery</h3>
            <p>Build your custom pizza in under a minute and check out with Razorpay test mode.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/build-pizza')}>Order Now</button>
        </div>

        <div className="menu-header">
          <h2 className="section-title">Explore Our Menu</h2>
          <span className="menu-count">{menuItems.length} items available</span>
        </div>
        <div className="menu-tabs">
          {MENU_TABS.map((t) => (
            <button key={t} className={menuTab === t ? 'active' : ''} onClick={() => setMenuTab(t)}>{t}</button>
          ))}
        </div>
        <div className="menu-scroll">
          {menuItems.map((item) => (
            <div key={`${item.category}-${item.name}`} className="menu-item-card">
              <FoodImage query={item.imageQuery || item.name} fallbackEmoji={item.emoji} size={120} className="menu-item-img" />
              <p className="menu-item-name">{item.name}</p>
              <p className="menu-item-desc">{BLURBS[item.category] || 'Made fresh, just for you'}</p>
              <div className="menu-item-bottom">
                <span className="menu-item-price">{item.price ? `₹${item.price}` : 'Included'}</span>
                <button className="btn-primary btn-small" onClick={() => navigate('/build-pizza')}>Add</button>
              </div>
            </div>
          ))}
          {menuItems.length === 0 && <p className="muted">No items in this category yet.</p>}
        </div>

        <h2 className="section-title" style={{ marginTop: '36px' }}>Your Orders</h2>
        {orders.length === 0 && (
          <div className="empty-state">
            <span className="empty-emoji">🍕</span>
            <p>No orders yet. Build your first pizza!</p>
          </div>
        )}
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-top">
              <FoodImage query="Pizza" fallbackEmoji="🍕" size={64} className="order-img" />
              <div>
                <p className="order-title">{order.pizza.base} · {order.pizza.sauce} · {order.pizza.cheese}</p>
                <p className="order-sub">{order.pizza.vegetables.join(', ') || 'No veggies'}</p>
                {order.extras?.length > 0 && (
                  <p className="order-sub">
                    {order.extras.map((e) => `${e.category === 'drink' ? '🥤' : '🍰'} ${e.name}`).join(' · ')}
                  </p>
                )}
                {order.deliveryAddress && <p className="order-sub">📍 {order.deliveryAddress}</p>}
              </div>
              <div className="order-price">₹{order.totalAmount}</div>
            </div>
            <StatusTracker status={order.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;