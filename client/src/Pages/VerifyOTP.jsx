import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const userId = location.state?.userId;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/auth/verify-otp', {
        userId,
        otp
      });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/auth/resend-otp', { userId });
      toast.success("New OTP has been sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Verify your email</h2>
          <p className="mt-2 text-gray-600">Enter the OTP sent to your email</p>
        </div>
        <form onSubmit={handleVerify} className="space-y-6">
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
        <div className="text-center">
          <Button variant="link" onClick={handleResend}>
            Resend OTP
          </Button>
        </div>
      </div>
    </div>
  );
}