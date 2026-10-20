import React from 'react';
import { X, Download, Trash2, LogOut } from 'lucide-react';

export const ProfileModal = ({
  user,
  onClose,
  onExportGDPR,
  onDeleteAccount,
  onLogout
}) => {
  const classNamesPt = {
    WIZARD: 'Mago Arcano',
    WARRIOR: 'Guerreiro de Elite',
    ROGUE: 'Ladino Estrategista',
    CLERIC: 'Clérigo Guardião',
    BARD: 'Bardo Inspirador',
    UNASSIGNED: 'Sem Classe'
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
      <div className="glass-card" style={{ width: '100%', maxWidth: '580px', position: 'relative', border: '1px solid rgba(255, 107, 87, 0.3)' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff6b57, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#fff',
            boxShadow: '0 0 20px rgba(255, 107, 87, 0.4)'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="font-rpg gradient-text" style={{ fontSize: '1.6rem', margin: 0 }}>
              {user.username}
            </h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
              <span className="badge-class">{classNamesPt[user.characterClass] || user.characterClass}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Nível {user.level}</span>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(10, 14, 23, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '18px',
          marginBottom: '24px'
        }}>
          <h3 className="font-rpg" style={{ color: '#fbbf24', fontSize: '1.1rem', marginBottom: '14px' }}>
            ⚔️ Atributos do Herói RPG
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>INTELIGÊNCIA (INT)</span>
              <h4 style={{ color: '#60a5fa', fontSize: '1.2rem', margin: '2px 0 0' }}>{user.stats?.int || 10}</h4>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>FORÇA (FOR)</span>
              <h4 style={{ color: '#f87171', fontSize: '1.2rem', margin: '2px 0 0' }}>{user.stats?.str || 10}</h4>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>DESTREZA (DES)</span>
              <h4 style={{ color: '#fbbf24', fontSize: '1.2rem', margin: '2px 0 0' }}>{user.stats?.dex || 10}</h4>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SABEDORIA (SAB)</span>
              <h4 style={{ color: '#34d399', fontSize: '1.2rem', margin: '2px 0 0' }}>{user.stats?.wis || 10}</h4>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CARISMA (CAR)</span>
              <h4 style={{ color: '#f472b6', fontSize: '1.2rem', margin: '2px 0 0' }}>{user.stats?.cha || 10}</h4>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>OURO ACUMULADO</span>
              <h4 style={{ color: '#fbbf24', fontSize: '1.2rem', margin: '2px 0 0' }}>{user.gold} 🪙</h4>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn-paymark-secondary"
            onClick={onExportGDPR}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <Download size={16} /> Exportar Meus Dados em JSON (GDPR)
          </button>

          <button 
            className="btn-paymark"
            onClick={onLogout}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            <LogOut size={16} /> Sair da Conta (Logoff)
          </button>

          <button 
            onClick={onDeleteAccount}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.82rem',
              marginTop: '4px'
            }}
          >
            <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> Excluir Minha Conta Permanentemente
          </button>
        </div>
      </div>
    </div>
  );
};
