import { useState } from 'react';
import api from '../../api/axios';
import { useFoodImage } from '../../components/FoodImage';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const bgPhoto = useFoodImage('Pizza');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/register', form);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <p>Join us and build your first custom pizza in minutes.</p>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">It only takes a minute</p>
          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Full Name" onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required minLength={6} />
            <button className="btn-primary" type="submit">Register</button>
          </form>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <p>Already have an account? <a href="/login">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;