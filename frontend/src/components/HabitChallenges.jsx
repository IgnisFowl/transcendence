import React, { useState } from 'react';
import { Sword, Users, Send, CheckCircle, Trophy, Sparkles } from 'lucide-react';

export const HabitChallenges = ({
  currentUser,
  onlineUsers,
  onSendChallenge,
  onCompleteChallenge,
  challenges,
  feedLogs
}) => {
  const [selectedTargetUser, setSelectedTargetUser] = useState('');
  const [challengeTitle, setChallengeTitle] = useState('');
  const [category, setCategory] = useState('STUDY');
  const [xpReward, setXpReward] = useState(50);
  const [goldReward, setGoldReward] = useState(25);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!selectedTargetUser || !challengeTitle.trim()) return;

    onSendChallenge(selectedTargetUser, challengeTitle, category, xpReward, goldReward);
    setChallengeTitle('');
    setShowCreateModal(false);
    alert(`⚔️ Desafio enviado com sucesso para ${selectedTargetUser}!`);
  };

  const classNamesPt = {
    WIZARD: 'Mago',
    WARRIOR: 'Guerreiro',
    ROGUE: 'Ladino',
    CLERIC: 'Clérigo',
    BARD: 'Bardo',
    UNASSIGNED: 'Sem Classe'
  };

  const myIncomingChallenges = challenges.filter(
    c => c.toUsername === currentUser?.username && c.status === 'PENDING'
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', border: '1px solid rgba(255, 107, 87, 0.3)' }}>
        <div>
          <div className="hero-pill-badge" style={{ marginBottom: '8px' }}>
            <Sword size={14} /> Interação Multijogador Co-op & Desafios (Python FastAPI)
          </div>
          <h2 className="font-rpg gradient-text" style={{ fontSize: '1.8rem', margin: 0 }}>
            Desafios de Hábitos & Status dos Heróis
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Veja o progresso de outros jogadores, lance missões personalizadas e receba recompensas ao completá-las.
          </p>
        </div>

        <button 
          className="btn-paymark" 
          onClick={() => setShowCreateModal(true)}
          style={{ fontSize: '0.95rem', padding: '12px 24px' }}
        >
          <Send size={16} /> Lançar Novo Desafio
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <Users color="#ff6b57" size={20} />
            <h3 className="font-rpg" style={{ color: '#f8fafc', fontSize: '1.2rem', margin: 0 }}>
              Status dos Heróis Conectados
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
            {onlineUsers.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>Nenhum outro herói conectado no momento.</p>
            ) : (
              onlineUsers.map((u, i) => (
                <div key={i} style={{
                  background: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{u.username}</strong>
                      <span className="badge-class" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        {classNamesPt[u.characterClass] || u.characterClass}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                      <span>Nível {u.level || 1}</span>
                      <span>•</span>
                      <span style={{ color: '#fbbf24' }}>INT {u.stats?.int || 10} | FOR {u.stats?.str || 10} | DES {u.stats?.dex || 10}</span>
                    </div>
                  </div>

                  {u.username !== currentUser?.username && (
                    <button
                      className="btn-paymark-secondary"
                      onClick={() => {
                        setSelectedTargetUser(u.username);
                        setShowCreateModal(true);
                      }}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      Desafiar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <Trophy color="#f59e0b" size={20} />
            <h3 className="font-rpg" style={{ color: '#f8fafc', fontSize: '1.2rem', margin: 0 }}>
              Minhas Missões Desafio ({myIncomingChallenges.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
            {myIncomingChallenges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.9rem' }}>
                <Sparkles size={32} color="#334155" style={{ marginBottom: '8px' }} />
                <p>Você não tem nenhuma missão desafio pendente enviada por outros heróis.</p>
              </div>
            ) : (
              myIncomingChallenges.map((ch) => (
                <div key={ch.id} style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#ff6b57', fontWeight: 'bold' }}>
                      ENVIADO POR: {ch.fromUsername}
                    </span>
                    <h4 style={{ color: '#ffffff', fontSize: '1rem', marginTop: '2px' }}>{ch.title}</h4>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#fbbf24', marginTop: '4px' }}>
                      <span>Recompensa: +{ch.xpReward} XP</span>
                      <span>+{ch.goldReward} Ouro</span>
                    </div>
                  </div>

                  <button
                    className="btn-paymark"
                    onClick={() => onCompleteChallenge(ch.id)}
                    style={{ fontSize: '0.82rem', padding: '8px 16px', width: '100%', justifyContent: 'center' }}
                  >
                    <CheckCircle size={15} /> Concluir Desafio Agora
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="font-rpg" style={{ color: '#f8fafc', fontSize: '1.15rem', marginBottom: '14px' }}>
          📜 Feed de Desafios em Tempo Real (FastAPI WebSockets)
        </h3>

        <div style={{
          background: 'rgba(10, 14, 23, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '14px',
          maxHeight: '180px',
          overflowY: 'auto',
          fontSize: '0.88rem',
          lineHeight: '1.6'
        }}>
          {feedLogs.length === 0 ? (
            <span style={{ color: '#64748b', fontStyle: 'italic' }}>Aguardando atividades de desafios dos heróis...</span>
          ) : (
            feedLogs.map((log, index) => (
              <div key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px', marginBottom: '4px' }}>
                <span style={{ color: '#64748b', fontSize: '0.78rem', marginRight: '8px' }}>[{log.timestamp}]</span>
                <span style={{ color: '#cbd5e1' }}>{log.text}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', border: '1px solid rgba(255, 107, 87, 0.3)' }}>
            <h3 className="font-rpg gradient-text" style={{ fontSize: '1.4rem', marginBottom: '16px' }}>
              ⚔️ Lançar Desafio de Hábitos
            </h3>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Selecione o Herói Destino:
                </label>
                <select
                  value={selectedTargetUser}
                  onChange={(e) => setSelectedTargetUser(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(10, 14, 23, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Selecione um Herói --</option>
                  {onlineUsers.map((u) => (
                    <option key={u.userId || u.username} value={u.username}>
                      {u.username} ({classNamesPt[u.characterClass] || u.characterClass})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Título da Missão / Desafio:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ler 1 capítulo de C++ ou fazer 20 flexões"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(10, 14, 23, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
                    Recompensa XP:
                  </label>
                  <input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(10, 14, 23, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
                    Recompensa Ouro:
                  </label>
                  <input
                    type="number"
                    value={goldReward}
                    onChange={(e) => setGoldReward(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(10, 14, 23, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-paymark-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-paymark">
                  Enviar Desafio agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
