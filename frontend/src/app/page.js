'use client';

import { useState, useEffect } from 'react';
import { getVoteCounts, getBlockchainInfo, checkIntegrity } from '@/lib/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, ShieldCheck, Cpu, RefreshCw, AlertTriangle, Users } from 'lucide-react';

const COLORS = ['#6c5ce7', '#00d2ff', '#00b894', '#feca57', '#ff6b6b'];

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/vote');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ padding: '40px', background: 'var(--bg-glass)', borderRadius: '16px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary-400)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Routing you to the correct zone...</p>
      </div>
    </div>
  );
}
