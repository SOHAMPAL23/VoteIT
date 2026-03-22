'use client';

import { useState, useEffect } from 'react';
import { getBlocks } from '@/lib/api';
import { motion } from 'framer-motion';
import { Database, Link2, Clock, CheckCircle2, Hashes, ChevronDown, UserSquare2, Shield, Search } from 'lucide-react';

export default function BlockchainExplorer() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const res = await getBlocks();
                setBlocks(res.blocks || []);
            } catch (err) {
                console.error('Failed to load blocks:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
        const interval = setInterval(load, 15000);
        return () => clearInterval(interval);
    }, []);

    const filteredBlocks = blocks.filter(b =>
        b.block_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.voter_id_hash.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="section" style={{ padding: '60px 0' }}>
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="section-title">Blockchain Explorer</h1>
                <p className="section-subtitle">A transparent, tamper-proof ledger of all voting transactions</p>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ marginBottom: '40px' }}>
                <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                    <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder="Search blocks by hash, voter ID, or candidate..."
                        className="input-field"
                        style={{ paddingLeft: '56px', borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)', height: '56px', fontSize: '1rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </motion.div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: '250px', width: '100%', borderRadius: '16px' }} />
                    ))}
                </div>
            ) : filteredBlocks.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <Database size={64} style={{ color: 'var(--text-tertiary)', opacity: 0.5, margin: '0 auto 24px' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No immutable blocks found.</h2>
                    <p style={{ color: 'var(--text-tertiary)', marginTop: '8px' }}>The decentralized network awaits the genesis transaction...</p>
                </div>
            ) : (
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column-reverse', gap: '40px', position: 'relative' }}>
                    {/* Vertical Blockchain Line */}
                    <div style={{ position: 'absolute', left: '36px', top: '40px', bottom: '40px', width: '4px', background: 'var(--gradient-primary)', opacity: 0.2, borderRadius: '4px', zIndex: 0 }} />

                    {filteredBlocks.map((block, index) => (
                        <motion.div key={block.block_number} variants={fadeInUp} style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '24px' }}>

                            {/* Chain Node */}
                            <div style={{
                                width: '76px',
                                height: '76px',
                                borderRadius: '50%',
                                background: 'var(--bg-secondary)',
                                border: '4px solid var(--primary-500)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 0 20px rgba(108,92,231,0.5)',
                                color: 'var(--text-primary)',
                                fontWeight: 800,
                                fontSize: '1.2rem',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '1px dashed var(--primary-300)', animation: 'rotate 10s linear infinite' }} />
                                #{block.block_number}
                            </div>

                            {/* Block Data Card */}
                            <div className="glass-card" style={{ flexGrow: 1, padding: '32px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'rotate(15deg)' }}>
                                    <Database size={150} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-400)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                                            <CheckCircle2 size={16} /> Minted Successfully
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            <Clock size={16} /> {new Date(block.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(108,92,231,0.1)', padding: '8px 16px', borderRadius: 'var(--radius-full)', color: 'var(--primary-300)', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(108,92,231,0.2)' }}>
                                        Proof of Vote Verification
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Secure Identity Node</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            <UserSquare2 size={18} color="var(--accent-400)" /> {block.voter_id_hash}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Voted For Entity</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            <Shield size={18} color="var(--success-500)" /> {block.candidate_name}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-glass)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <Link2 size={16} /> <span style={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Previous: {block.previous_hash}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        <Shield size={16} color="var(--primary-400)" /> <span style={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--primary-300)' }}>Block Hash: {block.block_hash}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
