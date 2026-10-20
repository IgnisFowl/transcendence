import React from 'react';
import { Sparkles, Scroll, Coins, User, Sword, LogOut } from 'lucide-react';

export const Navbar = ({
  user,
  activeTab,
  setActiveTab,
  openProfile,
  openLegal,
  openAuthLogin,
  openAuthSignup,
  onLogout
}) => {
  const xpNeeded = user ? user.level * 100 : 100;
  const xpPercent = user ? Math.min(100, Math.round((user.xp / xpNeeded) * 100)) : 0;

  const classNamesPt = {
    WIZARD: 'Mago',
    WARRIOR: 'Guerreiro',
    ROGUE: 'Ladino',
    CLERIC: 'Clérigo',
    BARD: 'Bardo',
    UNASSIGNED: 'Sem Classe'
  };

  return (
    <header style={{
      background: 'rgba(7, 9, 14, 0.85)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Paymark Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('quests')}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b57, #f59e0b)',
            padding: '8px',
            borderRadius: '12px',
            boxShadow: '0 0 16px rgba(255, 107, 87, 0.4)'
          }}>
            <Sword size={22} color="#ffffff" />
          </div>
          <div>
            <h1 className="font-rpg gradient-text" style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
              HabitQuest
            </h1>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.05em' }}>
              JS (REACT) + PYTHON (FASTAPI)
            </span>
          </div>
        </div>

        {/* User RPG HUD */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span className="font-rpg" style={{ color: '#ff6b57', fontWeight: 'bold' }}>NÍV {user.level}</span>
                <span style={{ color: '#c084fc' }}>{user.xp} / {xpNeeded} XP</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-xp" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '6px 12px',
              borderRadius: '999px',
              color: '#fbbf24',
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}>
              <Coins size={15} />
              <span>{user.gold} Ouro</span>
            </div>

            <span className="badge-class">{classNamesPt[user.characterClass] || user.characterClass}</span>
          </div>
        ) : null}

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <button 
                className={`btn-paymark ${activeTab === 'quests' ? '' : 'btn-paymark-secondary'}`}
                onClick={() => setActiveTab('quests')}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Scroll size={16} /> Missões
              </button>
              
              <button 
                className={`btn-paymark ${activeTab === 'raid' || activeTab === 'challenges' ? '' : 'btn-paymark-secondary'}`}
                onClick={() => setActiveTab('raid')}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Sword size={16} /> Desafios Co-op
              </button>

              <button 
                className={`btn-paymark ${activeTab === 'chat' ? '' : 'btn-paymark-secondary'}`}
                onClick={() => setActiveTab('chat')}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <Sparkles size={16} /> Taverna
              </button>

              <button 
                className="btn-paymark-secondary"
                onClick={openProfile}
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                title="Ficha do Herói"
              >
                <User size={16} /> Perfil
              </button>

              <button 
                className="btn-paymark-secondary"
                onClick={onLogout}
                style={{ fontSize: '0.85rem', padding: '8px 12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                title="Sair da Conta"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-paymark-secondary" onClick={openAuthLogin} style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
                Entrar
              </button>
              <button className="btn-paymark" onClick={openAuthSignup} style={{ fontSize: '0.85rem', padding: '8px 20px' }}>
                Cadastrar-se
              </button>
            </>
          )}

          <button 
            onClick={openLegal}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: '6px'
            }}
          >
            Termos
          </button>
        </div>
      </div>
    </header>
  );
};
