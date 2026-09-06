import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then((res) => setStatus(res.data.message))
      .catch((err) => setStatus(err.response?.data?.message || 'Verification failed'));
  }, [token]);

  return (
    <div className="auth-card">
      <h2>Email Verification</h2>
      <p>{status}</p>
      <a href="/login">Go to Login</a>
    </div>
  );
};

export default VerifyEmail;
