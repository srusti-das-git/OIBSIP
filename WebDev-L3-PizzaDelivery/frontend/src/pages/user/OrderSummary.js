import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../api/axios';
import FoodImage from '../../components/FoodImage';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const OrderSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');

  if (!state) {
    return <div className="page"><p>No pizza selected. <a href="/build-pizza">Start building</a></p></div>;
  }

  const { pizza, extras = [], totalAmount } = state;

  const handlePayment = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address before paying.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) throw new Error('Razorpay SDK failed to load. Check your connection.');

      const { data: orderData } = await api.post('/orders/create-payment-order', { totalAmount });

      const options = {
        key: orderData.key,
        amount: orderData.razorpayOrder.amount,
        currency: 'INR',
        name: 'Pizza Delivery',
        description: 'Custom Pizza Order',
        order_id: orderData.razorpayOrder.id,
        handler: async (response) => {
          try {
            const { data } = await api.post('/orders/verify-and-place', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              pizza, extras, deliveryAddress: address, quantity: 1, totalAmount,
            });
            navigate('/dashboard', { state: { placedOrder: data.order } });
          } catch (err) {
            setError('Payment succeeded but order placement failed. Contact support.');
          }
        },
        theme: { color: '#e63946' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setError('Payment failed. Please try again.'));
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>🧾 Order Summary</h1>
      <div className="summary-card">
        <div className="summary-pizza-hero">
          <FoodImage query="Pizza" fallbackEmoji="🍕" size={110} className="summary-hero-img" />
        </div>
        <div className="summary-row"><strong>Base</strong><span>{pizza.base}</span></div>
        <div className="summary-row"><strong>Sauce</strong><span>{pizza.sauce}</span></div>
        <div className="summary-row"><strong>Cheese</strong><span>{pizza.cheese}</span></div>
        <div className="summary-row"><strong>Vegetables</strong><span>{pizza.vegetables.join(', ') || 'None'}</span></div>

        {extras.length > 0 && (
          <>
            <hr />
            {extras.map((e) => (
              <div className="summary-row" key={e.name}>
                <strong>{e.category === 'drink' ? '🥤 Drink' : '🍰 Dessert'}</strong>
                <span>{e.name} (+₹{e.price})</span>
              </div>
            ))}
          </>
        )}

        <hr />
        <div className="summary-row total-row"><strong>Total</strong><span>₹{totalAmount}</span></div>
      </div>

      <div className="address-card">
        <label htmlFor="address">📍 Delivery Address</label>
        <textarea
          id="address"
          placeholder="Flat / House no., Street, Area, City, PIN code"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
      </div>

      {error && <p className="error">{error}</p>}
      <button className="btn-primary btn-pay" onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : `Pay ₹${totalAmount} with Razorpay`}
      </button>
    </div>
  );
};

export default OrderSummary;