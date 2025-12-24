import React, { useState } from 'react';
import { Lock, AlertCircle, Loader2, UserPlus, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { AuthUser } from '../types';
import { AccessRequestForm } from './AccessRequestForm';
import { PINVerificationForm } from './PINVerificationForm';

const LOGO_URL = "https://www.scubasarajevo.com/wp-content/uploads/2024/02/cropped-LOGO-SCUBA-Sarajevo-okrugli-240px.png";

interface Props {
  onLogin: (user: AuthUser) => void;
  onAccessRequest?: () => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<'pin' | 'request'>('pin');
  const handlePinSuccess = async (userId: string, userName: string) => {
    console.log(`✅ User authenticated: ${userName}`);
    
    // Get full user data
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (user) {
      onLogin({
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
