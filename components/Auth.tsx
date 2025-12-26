import React, { useState } from 'react';
import { Lock, AlertCircle, Loader2, UserPlus, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { AccessRequestForm } from './AccessRequestForm';
import { PINVerificationForm } from './PINVerificationForm';
import { useAuth } from '../contexts/AuthProvider';

const LOGO_URL = "https://www.scubasarajevo.com/wp-content/uploads/2024/02/cropped-LOGO-SCUBA-Sarajevo-okrugli-240px.png";

const Auth: React.FC = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'pin' | 'request'>('pin');

  const handlePinSuccess = async (userId: string, userName: string) => {
    console.log(`[Auth] User authenticated: ${userName}`);

    // Get full user data
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, role, status')
      .eq('id', userId)
      .single();

    if (user) {
      login({
        uid: user.id,
        email: user.email,
        displayName: user.name,
        role: user.role === 'admin' ? 'admin' : 'user'
      });
    }
  };

  const handleRequestSuccess = () => {
    setMode('pin');
  };

  return mode === 'pin' ? (
    <PINVerificationForm
      onSuccess={handlePinSuccess}
      onBackToRequest={() => setMode('request')}
    />
  ) : (
    <AccessRequestForm
      onRequestSubmitted={handleRequestSuccess}
      onBackToLogin={() => setMode('pin')}
    />
  );
};

export default Auth;
