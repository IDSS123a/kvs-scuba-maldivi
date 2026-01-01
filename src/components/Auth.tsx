
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { AccessRequestForm } from './AccessRequestForm';
import { PINVerificationForm } from './PINVerificationForm';
import { useAuth } from '../contexts/AuthProvider';

const Auth: React.FC = () => {
    const { login } = useAuth();
    const [mode, setMode] = useState<'pin' | 'request'>('pin');

    const handlePinSuccess = async (userId: string, userName: string) => {
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
