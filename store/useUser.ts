
import { useState, useEffect } from 'react';

export interface User {
    email: string;
    phone: string;
    zip: string;
}

export function useUser() {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('knwn_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('knwn_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('knwn_user');
        }
    }, [user]);

    const register = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return { user, register, logout, isRegistered: !!user };
}
