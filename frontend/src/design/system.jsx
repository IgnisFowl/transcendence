import React from 'react';

export function Button({ children, variant = 'primary', style, ...props }) {
  const className = variant === 'secondary' ? 'btn-paymark btn-paymark-secondary' : 'btn-paymark';
  return (
    <button className={className} style={style} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, style }) {
  return (
    <div className="glass-card" style={style}>
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px' }}>
      {label}
      <div style={{ marginTop: '6px' }}>{children}</div>
    </label>
  );
}

export function Badge({ children }) {
  return <span className="badge-class">{children}</span>;
}

export function Avatar({ name, src, size = 64 }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={`Avatar de ${name}`}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      aria-label={`Avatar padrão de ${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#ff6b57',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'var(--font-rpg)',
        fontSize: size * 0.4,
        fontWeight: 700
      }}
    >
      {initial}
    </div>
  );
}

export function ProgressBar({ value, label }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
          <span>{label}</span>
          <span>{width}%</span>
        </div>
      )}
      <div className="progress-bar-container" aria-valuenow={width} aria-valuemin={0} aria-valuemax={100} role="progressbar">
        <div className="progress-xp" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: '640px', position: 'relative' }}>
        <Button variant="secondary" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px' }}>
          Fechar
        </Button>
        <h2 className="font-rpg gradient-text" style={{ fontSize: '1.4rem', marginBottom: '16px' }}>{title}</h2>
        {children}
      </Card>
    </div>
  );
}

export function Pill({ children }) {
  return <span className="hero-pill-badge">{children}</span>;
}

export function Stat({ label, value, color = '#f8fafc' }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</span>
      <h4 style={{ color, fontSize: '1.2rem', margin: '2px 0 0' }}>{value}</h4>
    </div>
  );
}

export function EmptyState({ children }) {
  return <p style={{ color: '#64748b', textAlign: 'center', margin: 0 }}>{children}</p>;
}
