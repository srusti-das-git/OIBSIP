import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useFoodImage } from '../../components/FoodImage';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const bgPhoto = useFoodImage('Pizza');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      loginUser(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-split">
      <div
        className="auth-visual"
        style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : undefined}
      >
        <div className="auth-visual-overlay">
          <div className="auth-visual-inner">
            <h1>🍕 <span>Pizza Delivery</span></h1>
            <p>Handcrafted pizzas, real-time tracking, delivered hot.</p>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Log in to order your next pizza</p>
          <form onSubmit={handleSubmit}>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <button className="btn-primary" type="submit">Login</button>
          </form>
          {error && <p className="error">{error}</p>}
          <p><a href="/forgot-password">Forgot password?</a></p>
          <p>No account? <a href="/register">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;