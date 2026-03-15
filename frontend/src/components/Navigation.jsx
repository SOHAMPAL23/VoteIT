'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Vote, LayoutDashboard, SearchCode, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        setIsAdmin(sessionStorage.getItem('isAdmin') === 'true');
    }, [pathname]);

    const links = [
        { href: '/vote', label: 'Cast Vote', icon: <Vote size={18} /> },
    ];

    if (isAdmin) {
        links.unshift({ href: '/admin/dashboard', label: 'Supervisor Dashboard', icon: <LayoutDashboard size={18} /> });
        links.push({ href: '/blockchain', label: 'Blockchain Log', icon: <Database size={18} /> });
    }

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(10, 10, 18, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-glass)'
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '70px',
            }}>
                <Link href={isAdmin ? "/" : "/vote"} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(108,92,231,0.4)',
                    }}>
                        <Shield size={22} color="white" />
                    </div>
                    <span style={{
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>HashUP</span>
                </Link>

                <div style={{
                    display: 'flex',
                    gap: '32px',
                    alignItems: 'center'
                }}>
                    {links.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    color: isActive ? 'var(--primary-400)' : 'var(--text-secondary)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                            >
                                {link.icon}
                                {link.label}
                                {isActive && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-25px',
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: 'var(--gradient-primary)',
                                        borderRadius: '3px 3px 0 0'
                                    }} className="animate-fade-in-up" />
                                )}
                            </Link>
                        )
                    })}

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)', margin: '0 8px' }} />

                    <Link href="/admin" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        <SearchCode size={16} /> Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
}
