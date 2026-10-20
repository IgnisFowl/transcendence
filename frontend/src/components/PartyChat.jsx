import React, { useState } from 'react';
import { Send, Users, Sparkles, UserPlus, UserX, MessageSquare } from 'lucide-react';

export const PartyChat = ({
  messages,
  onlineUsers,
  onSendMessage,
  currentUsername
}) => {
  const [inputMsg, setInputMsg] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('chat');
  const [friendsList, setFriendsList] = useState([
    { username: 'PaladinoColega', characterClass: 'WARRIOR', level: 2, isOnline: true }
  ]);
  const [viewingUser, setViewingUser] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    onSendMessage(inputMsg);
    setInputMsg('');
  };

  const handleAddFriend = (user) => {
    if (friendsList.some(f => f.username === user.username)) return;
    setFriendsList(prev => [...prev, {
      username: user.username,
      characterClass: user.characterClass,
      level: user.level || 1,
      isOnline: true
    }]);
    alert(`🤝 ${user.username} foi adicionado à sua lista de amigos/aliados!`);
  };

  const handleRemoveFriend = (username) => {
    setFriendsList(prev => prev.filter(f => f.username !== username));
    alert(`🗑️ ${username} foi removido da sua lista de amigos.`);
  };

  const classNamesPt = {
    WIZARD: 'Mago',
    WARRIOR: 'Guerreiro',
    ROGUE: 'Ladino',
    CLERIC: 'Clérigo',
    BARD: 'Bardo',
    UNASSIGNED: 'Sem Classe'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', border: '1px solid rgba(255, 107, 87, 0.3)' }}>
        <div>
          <div className="hero-pill-badge" style={{ marginBottom: '6px' }}>
            <Sparkles size={14} /> Módulo Major: Interação de Usuários, Chat e Amigos (Python FastAPI)
          </div>
          <h2 className="font-rpg gradient-text" style={{ fontSize: '1.7rem', margin: 0 }}>
            Taverna dos Heróis & Lista de Amigos
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`btn-paymark ${activeSubTab === 'chat' ? '' : 'btn-paymark-secondary'}`}
            onClick={() => setActiveSubTab('chat')}
            style={{ fontSize: '0.88rem', padding: '10px 20px' }}
          >
            <MessageSquare size={16} /> Bate-Papo da Taverna
          </button>

          <button 
            className={`btn-paymark ${activeSubTab === 'friends' ? '' : 'btn-paymark-secondary'}`}
            onClick={() => setActiveSubTab('friends')}
            style={{ fontSize: '0.88rem', padding: '10px 20px' }}
          >
            <Users size={16} /> Meus Amigos / Aliados ({friendsList.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'chat' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '20px' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <Sparkles size={36} color="#334155" style={{ marginBottom: '8px' }} />
                  <p>A Taverna está silenciosa... Envie a primeira mensagem para os outros heróis!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.username === currentUsername;
                  return (
                    <div 
                      key={index}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        background: isMe ? 'linear-gradient(135deg, rgba(255, 107, 87, 0.2), rgba(245, 158, 11, 0.15))' : 'rgba(10, 14, 23, 0.8)',
                        border: isMe ? '1px solid rgba(255, 107, 87, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '12px 16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <strong style={{ color: isMe ? '#ff6b57' : '#60a5fa', fontSize: '0.85rem' }}>{msg.username}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{msg.timestamp}</span>
                      </div>
                      <p style={{ color: '#f1f5f9', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>{msg.content}</p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <input
                type="text"
                placeholder="Escreva uma mensagem na Taverna..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'rgba(10, 14, 23, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '999px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-paymark" style={{ padding: '12px 24px' }}>
                <Send size={16} />
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
            <h3 className="font-rpg" style={{ color: '#f8fafc', fontSize: '1.05rem', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              👥 Heróis na Taverna ({onlineUsers.length})
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {onlineUsers.map((u) => {
                const isFriend = friendsList.some(f => f.username === u.username);
                const isMe = u.username === currentUsername;

                return (
                  <div key={u.userId || u.username} style={{
                    background: 'rgba(10, 14, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong 
                        style={{ color: '#f8fafc', fontSize: '0.88rem', cursor: 'pointer' }}
                        onClick={() => setViewingUser(u)}
                        title="Clique para ver o perfil do herói"
                      >
                        {u.username} {isMe ? '(Você)' : ''}
                      </strong>
                      <span className="badge-class" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                        {classNamesPt[u.characterClass] || u.characterClass}
                      </span>
                    </div>

                    {!isMe && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button
                          className="btn-paymark-secondary"
                          onClick={() => setViewingUser(u)}
                          style={{ fontSize: '0.72rem', padding: '4px 8px', flex: 1 }}
                        >
                          Ver Perfil
                        </button>

                        {isFriend ? (
                          <button
                            onClick={() => handleRemoveFriend(u.username)}
                            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                            title="Remover Amigo"
                          >
                            <UserX size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddFriend(u)}
                            style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                            title="Adicionar aos Amigos"
                          >
                            <UserPlus size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <h3 className="font-rpg gradient-text" style={{ fontSize: '1.4rem', marginBottom: '16px' }}>
            🤝 Sistema de Amigos / Lista de Aliados da Guilda
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {friendsList.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>Você ainda não adicionou nenhum amigo. Visite a aba do Chat para adicionar heróis!</p>
            ) : (
              friendsList.map((friend, idx) => (
                <div key={idx} style={{
                  background: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{friend.username}</strong>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: friend.isOnline ? '#10b981' : '#64748b'
                      }} />
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                      {classNamesPt[friend.characterClass] || friend.characterClass} • Nível {friend.level}
                    </div>
                  </div>

                  <button
                    className="btn-paymark-secondary"
                    onClick={() => handleRemoveFriend(friend.username)}
                    style={{ fontSize: '0.78rem', padding: '6px 12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {viewingUser && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', border: '1px solid rgba(255, 107, 87, 0.3)' }}>
            <h3 className="font-rpg gradient-text" style={{ fontSize: '1.4rem', marginBottom: '14px' }}>
              👤 Perfil do Herói: {viewingUser.username}
            </h3>

            <div style={{ background: 'rgba(10, 14, 23, 0.8)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '6px' }}>
                <strong>Classe:</strong> {classNamesPt[viewingUser.characterClass] || viewingUser.characterClass}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '6px' }}>
                <strong>Nível:</strong> {viewingUser.level || 1}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                <strong>Atributos:</strong> INT {viewingUser.stats?.int || 10} | FOR {viewingUser.stats?.str || 10} | DES {viewingUser.stats?.dex || 10}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-paymark"
                onClick={() => {
                  handleAddFriend(viewingUser);
                  setViewingUser(null);
                }}
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <UserPlus size={15} /> Adicionar aos Amigos
              </button>

              <button className="btn-paymark-secondary" onClick={() => setViewingUser(null)} style={{ fontSize: '0.85rem' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
