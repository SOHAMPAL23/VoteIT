'use client';

import { useState, useEffect } from 'react';
import { getBlocks, getBlockchainInfo, addCandidate, removeCandidate, getVoteCounts, toggleVoting } from '@/lib/api';
import { motion } from 'framer-motion';
import { SearchCode, UsersRound, Settings, Plus, Trash2, Hash, Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [candidates, setCandidates] = useState({});
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isVotingActive, setIsVotingActive] = useState(false);
    const [data, setData] = useState({ votes: [], total_votes: 0 });
    const [chainInfo, setChainInfo] = useState({ total_blocks: 0, is_valid: true });
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);

    // Candidate form state
    const [newId, setNewId] = useState('');
    const [newName, setNewName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('');

    // Protect route
    useEffect(() => {
        if (!sessionStorage.getItem('isAdmin')) {
            router.replace('/admin');
        } else {
            loadData();
        }
    }, [router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [chainInfoRes, blocksDataRes, votesRes] = await Promise.all([
                getBlockchainInfo(),
                getBlocks(),
                getVoteCounts()
            ]);
            setCandidates(chainInfoRes.candidates || {});
            setBlocks(blocksDataRes.blocks || []);
            setIsVotingActive(chainInfoRes.is_voting_active || false);
            setChainInfo(chainInfoRes);
            setData(votesRes);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVoting = async () => {
        try {
            const res = await toggleVoting(!isVotingActive);
            if (res.success) {
                setIsVotingActive(res.is_voting_active);
                setStatus(`Voting state changed to ${res.is_voting_active ? 'ACTIVE' : 'LOCKED'}`);
                setTimeout(() => setStatus(''), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleVerify = async () => {
        try {
            setVerifying(true);
            const res = await checkIntegrity();
            setVerificationResult(res.valid);
            setTimeout(() => setVerificationResult(null), 5000);
        } catch (err) {
            console.error('Failed to verify integrity:', err);
            setVerificationResult(false);
        } finally {
            setVerifying(false);
        }
    };

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        if (!newId || !newName) return;

        setSubmitting(true);
        try {
            await addCandidate(newId, newName);
            setStatus(`Successfully added ${newName}`);
            setNewId('');
            setNewName('');
            loadData();
        } catch (err) {
            console.error(err);
            setStatus('Failed to add candidate');
        } finally {
            setSubmitting(false);
            setTimeout(() => setStatus(''), 4000);
        }
    };

    const handleRemoveCandidate = async (id) => {
        if (!confirm(`Are you sure you want to remove candidate ID: ${id}?`)) return;

        try {
            await removeCandidate(id);
            setStatus(`Candidate removed.`);
            loadData();
        } catch (err) {
            console.error(err);
            setStatus('Failed to remove candidate');
        } finally {
            setTimeout(() => setStatus(''), 4000);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAdmin');
        router.replace('/');
    };

    if (loading) {
        return (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <RefreshCw size={48} className="animate-spin" style={{ color: 'var(--primary-400)', margin: '0 auto 24px' }} />
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>Loading Secure Interface...</h2>
            </div>
        );
    }

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="section" style={{ padding: '60px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div>
                        <h1 className="section-title" style={{ fontSize: '2rem' }}>Consensus Control Center</h1>
                        <p className="section-subtitle" style={{ marginBottom: 0 }}>Root authority and state management.</p>
                    </div>
                    <button onClick={handleToggleVoting} className={`badge ${isVotingActive ? 'badge-success' : 'badge-primary'}`} style={{ cursor: 'pointer', border: 'none', padding: '8px 16px', fontSize: '1rem' }}>
                        {isVotingActive ? '🟢 Voting Active' : '🔴 Voting Locked'}
                    </button>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '10px 20px', borderColor: 'var(--error-500)', color: 'var(--error-400)' }}>
                    <Settings size={18} /> Terminate Session
                </button>
            </div>

            {status && (
                <div className="toast toast-success" style={{ zIndex: 9999 }}>
                    <CheckCircle2 size={20} /> {status}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '32px' }}>

                {/* Entity Management */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ padding: '12px', background: 'rgba(0,210,255,0.1)', borderRadius: '12px', color: 'var(--accent-400)' }}>
                            <UsersRound size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Entity Management</h2>
                    </div>

                    <form onSubmit={handleAddCandidate} style={{ display: 'flex', gap: '12px', marginBottom: '32px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Unique ID (e.g. CAND009)"
                                className="input-field"
                                value={newId}
                                onChange={(e) => setNewId(e.target.value.toUpperCase())}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Candidate Full Name"
                                className="input-field"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '0 24px', whiteSpace: 'nowrap' }}>
                            {submitting ? <RefreshCw className="animate-spin" size={20} /> : <><Plus size={20} /> Register</>}
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(candidates).map(([id, name]) => (
                            <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{id}</div>
                                </div>
                                <button onClick={() => handleRemoveCandidate(id)} className="btn-icon" style={{ color: 'var(--error-400)', background: 'rgba(255,107,107,0.1)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {Object.keys(candidates).length === 0 && (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>No candidates registered.</div>
                        )}
                    </div>
                </motion.div>

                {/* Audit Log Placeholder */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={0.2} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ padding: '12px', background: 'rgba(108,92,231,0.1)', borderRadius: '12px', color: 'var(--primary-400)' }}>
                            <Database size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Supervisory Ledger Log</h2>
                    </div>

                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-glass)', overflowY: 'auto', maxHeight: '500px', padding: '16px' }}>
                        {blocks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>Ledger is currently empty.</div>
                        ) : (
                            blocks.slice().reverse().map((b) => (
                                <div key={b.block_number} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600 }}>Block #{b.block_number}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{new Date(b.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                                        Hash: {b.block_hash.substring(0, 20)}...
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                        <UsersRound size={14} color="var(--success-400)" /> {b.candidate_name}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
