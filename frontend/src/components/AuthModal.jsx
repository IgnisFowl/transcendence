import React, { useState } from 'react';
import { X, UserPlus, LogIn, Mail, Lock, User } from 'lucide-react';

export const AuthModal = ({
  initialMode,
  onClose,
  onSuccessRegister,
  onSuccessLogin
}) => {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (mode === 'signup') {
      if (!username.trim()) return;
      onSuccessRegister({ email, username });
    } else {
      onSuccessLogin({ email, username: username || email.split('@')[0] });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', position: 'relative', border: '1px solid rgba(255, 107, 87, 0.3)' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'rgba(255, 107, 87, 0.15)',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            {mode === 'signup' ? <UserPlus color="#ff6b57" size={26} /> : <LogIn color="#ff6b57" size={26} />}
          </div>
          <h3 className="font-rpg gradient-text" style={{ fontSize: '1.6rem' }}>
            {mode === 'signup' ? 'Criar Sua Conta de Herói' : 'Entrar no HabitQuest'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            {mode === 'signup' ? 'Responda ao questionário de classe após se cadastrar!' : 'Bem-vindo de volta, herói!'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Nome de Usuário (Herói)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Ex: CadeteArcano"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    background: 'rgba(10, 14, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="seu.email@42.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  background: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  background: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <button type="submit" className="btn-paymark" style={{ width: '100%', padding: '14px', borderRadius: '10px', justifyContent: 'center' }}>
            {mode === 'signup' ? 'Cadastrar e Ir ao Questionário de Classe ✨' : 'Entrar na Conta'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          {mode === 'signup' ? (
            <span>Já tem uma conta? <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#ff6b57', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button></span>
          ) : (
            <span>Não tem conta? <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: '#ff6b57', cursor: 'pointer', fontWeight: 'bold' }}>Cadastrar-se</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
