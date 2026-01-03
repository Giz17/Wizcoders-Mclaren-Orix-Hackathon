import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user in localStorage
        const savedUser = localStorage.getItem('demo_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            // Demo logic: Accept any password, but require specific email structure for "realism"
            if (email && password) {
                const dummyUser = {
                    name: 'Demo User',
                    email: email,
                    role: 'Financial Analyst'
                };
                localStorage.setItem('demo_user', JSON.stringify(dummyUser));
                setUser(dummyUser);
                resolve(dummyUser);
            } else {
                reject(new Error('Invalid credentials'));
            }
        });
    };

    const logout = () => {
        localStorage.removeItem('demo_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
