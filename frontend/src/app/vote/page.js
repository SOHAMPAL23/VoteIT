'use client';

import { useState, useEffect } from 'react';
import { getBlockchainInfo, castVote } from '@/lib/api';
import { motion } from 'framer-motion';
import { Vote, Fingerprint, Lock, CheckCircle2, ChevronRight, Hash, AlertTriangle } from 'lucide-react';

export default function VotePage() {
    const [candidates, setCandidates] = useState({});
    const [chainInfo, setChainInfo] = useState({ is_voting_active: false });
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ voter_id: '', candidate_id: '' });
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' }); // success or error

    useEffect(() => {
        async function load() {
            try {
                const info = await getBlockchainInfo();
                setCandidates(info.candidates || {});
                setChainInfo(info);
            } catch (err) {
                console.error('Failed to load candidates:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.voter_id || !form.candidate_id) {
            setStatus({ type: 'error', message: 'Please select a candidate and provide your unique ID.' });
            return;
        }

        if (!chainInfo.is_voting_active) {
            setStatus({ type: 'error', message: 'ERROR: Voting is currently locked by the administrator.' });
            return;
        }

        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await castVote(form.voter_id, form.candidate_id);
            if (res.success) {
                setStatus({ type: 'success', message: 'Vote cryptographically secured and recorded on the blockchain.' });
                setForm({ voter_id: '', candidate_id: '' });
            } else {
                setStatus({ type: 'error', message: res.message || 'Error recording vote. You might have already voted.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to cast vote. Network or server error.' });
        } finally {
            setSubmitting(false);
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="section" style={{ padding: '60px 0', maxWidth: '800px', margin: '0 auto' }}>
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="section-title">Cast Your Vote</h1>
                <p className="section-subtitle">Secure, immutable, and fully transparent.</p>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={0.2} className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>

                {/* Glow decoration */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '300px', height: '100px', background: 'var(--gradient-primary)', filter: 'blur(80px)', opacity: 0.2, zIndex: 0 }} />

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>

                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(108,92,231,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Fingerprint color="var(--primary-400)" size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Voter Identity</h2>
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="voter_id">Secure Universal Identifier (UID)</label>
                            <div style={{ position: 'relative' }}>
                                <Hash size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    id="voter_id"
                                    className="input-field"
                                    placeholder="Enter your cryptographic ID (e.g. voter-892)"
                                    style={{ paddingLeft: '48px' }}
                                    value={form.voter_id}
                                    onChange={(e) => setForm({ ...form, voter_id: e.target.value })}
                                    disabled={submitting}
                                />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Lock size={12} /> ID will be hashed with SHA-256 before storage
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,210,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Vote color="var(--accent-400)" size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Select Candidate</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '70px', width: '100%', borderRadius: '12px' }} />)
                            ) : Object.keys(candidates).length > 0 ? (
                                Object.entries(candidates).map(([id, name]) => (
                                    <label
                                        key={id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '20px 24px',
                                            background: form.candidate_id === id ? 'rgba(108,92,231,0.1)' : 'var(--bg-glass)',
                                            border: `1px solid ${form.candidate_id === id ? 'var(--primary-400)' : 'var(--border-glass)'}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => !submitting && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                                        onMouseLeave={(e) => !submitting && (e.currentTarget.style.borderColor = form.candidate_id === id ? 'var(--primary-400)' : 'var(--border-glass)')}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: `2px solid ${form.candidate_id === id ? 'var(--primary-400)' : 'var(--text-tertiary)'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {form.candidate_id === id && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-400)' }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: form.candidate_id === id ? 'var(--primary-300)' : 'var(--text-primary)' }}>{name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>ID: {id}</div>
                                            </div>
                                        </div>
                                        <input
                                            type="radio"
                                            name="candidate"
                                            value={id}
                                            checked={form.candidate_id === id}
                                            onChange={(e) => setForm({ ...form, candidate_id: e.target.value })}
                                            style={{ opacity: 0, position: 'absolute' }}
                                            disabled={submitting}
                                        />
                                    </label>
                                ))
                            ) : (
                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-glass)', borderRadius: '12px' }}>
                                    No candidates available for election.
                                </div>
                            )}
                        </div>
                    </div>

                    {status.message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                            className={`toast-${status.type}`}
                            style={{ padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'static', maxWidth: '100%' }}
                        >
                            {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                            <span style={{ fontWeight: 500 }}>{status.message}</span>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={submitting || !form.voter_id || !form.candidate_id}
                    >
                        {submitting ? (
                            <>Encrypting & Minting Block...</>
                        ) : (
                            <>Sign & Mine Vote Transaction <ChevronRight size={18} /></>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
