import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'HashUP Decentralized Voting',
  description: 'Premium blockchain-powered transparent voting system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Navigation />
        <main className="container">
          {children}
        </main>

        <footer className="footer">
          <div className="container" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
            <p style={{ margin: 0 }}>
              <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
              Blockchain Voting System | Educational Purpose Only
            </p>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span className="badge badge-primary">React Next.js Frontend</span>
              <span className="badge badge-success">Python Flask Backend</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
