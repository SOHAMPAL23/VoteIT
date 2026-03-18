'use client';

import { useState } from 'react';
import { adminLogin } from '@/lib/api';
import { motion } from 'framer-motion';
import { ShieldAlert, User, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [status, setStatus] = useState({ loading: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '' });

        try {
            const res = await adminLogin(form.username, form.password);
            if (res.success) {
                // Assume auth worked. The backend session logic relies on cookies,
                // but since we are proxying /api-backend/, cookies will be set to /api-backend/.
                // In a true decoupled app we'd use JWTs. For now, we will spoof the admin state locally.
                sessionStorage.setItem('isAdmin', 'true');
                router.push('/admin/dashboard');
            } else {
                setStatus({ loading: false, error: 'Authorization denied. Invalid credentials.' });
            }
        } catch (err) {
            console.error(err);
            setStatus({ loading: false, error: 'Network error connecting to the secure enclave.' });
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px', position: 'relative', overflow: 'hidden' }}>

                {/* Glow decoration */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--gradient-error)', filter: 'blur(80px)', opacity: 0.15, zIndex: 0 }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(238,90,36,0.1)', border: '1px solid rgba(238,90,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--error-500)' }}>
                        <ShieldAlert size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Restricted Access</h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '8px' }}>Authenticate to access the consensus dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label className="input-label" htmlFor="username">Admin Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                id="username"
                                className="input-field"
                                placeholder="Enter root authority"
                                style={{ paddingLeft: '48px' }}
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                disabled={status.loading}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '32px' }}>
                        <label className="input-label" htmlFor="password">Security Credential</label>
                        <div style={{ position: 'relative' }}>
                            <KeyRound size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="password"
                                id="password"
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingLeft: '48px' }}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                disabled={status.loading}
                            />
                        </div>
                    </div>

                    {status.error && (
                        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--error-400)', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={16} /> <span>{status.error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', background: 'var(--gradient-error)', boxShadow: '0 4px 15px rgba(238,90,36,0.3)' }}
                        disabled={status.loading || !form.username || !form.password}
                    >
                        {status.loading ? (
                            <><Loader2 className="animate-spin" size={18} /> Authenticating...</>
                        ) : (
                            <>Establish Secure Context <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

            </motion.div>
        </div>
    );
}
