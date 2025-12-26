export interface User {
    id: string;
    email?: string;
    name?: string;
    avatar_url?: string;
    role?: 'admin' | 'member' | 'pending' | 'user';
    created_at?: string;
    ssi_number?: string;
    user_metadata?: any;
}

export interface Session {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: User;
}

export interface AuthError {
    message: string;
}
