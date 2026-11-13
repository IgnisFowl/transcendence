import React, { useState } from 'react';
import { Avatar, Badge, Button, Card, EmptyState, Field, Pill, Stat } from '../design/system';
import { apiForm } from '../api';

const classNamesPt = {
  WIZARD: 'Mago',
  WARRIOR: 'Guerreiro',
  ROGUE: 'Ladino',
  CLERIC: 'Clérigo',
  BARD: 'Bardo',
  UNASSIGNED: 'Sem Classe'
};

export const ProfilePage = ({
  user,
  isSelf,
  friends = [],
  emails = [],
  onSaveProfile,
  onExport,
  onDelete,
  onLogout,
  onAvatarChange,
  onResetAvatar,
  onOpenFriend
}) => {
  const [bio, setBio] = useState(user.bio || '');
  const [phrase, setPhrase] = useState('');
  const [message, setMessage] = useState('');
  const xpNeeded = Math.max(user.level || 1, 1) * 100;

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setMessage('Envie uma imagem PNG, JPEG ou WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('A imagem deve ter no máximo 2 MB.');
      return;
    }
    try {
      const body = new FormData();
      body.append('file', file);
      const updated = await apiForm('/api/me/avatar', body);
      onAvatarChange(updated);
      setMessage('Avatar atualizado.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card>
        <Pill>Ficha do herói</Pill>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
          <Avatar name={user.username} src={user.avatarUrl} size={84} />
          <div>
            <h2 className="font-rpg gradient-text" style={{ margin: 0 }}>{user.username}</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <Badge>{classNamesPt[user.characterClass] || user.characterClass}</Badge>
              <span style={{ color: '#94a3b8' }}>Nível {user.level}</span>
            </div>
            {!user.avatarUrl && (
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '8px' }}>Retrato padrão, feito com a inicial do nome.</p>
            )}
          </div>
        </div>

        {isSelf && (
          <div style={{ marginTop: '16px' }}>
            <Field label="Enviar avatar (PNG, JPEG ou WebP, até 2 MB)">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
            </Field>
            {user.avatarUrl && (
              <Button variant="secondary" onClick={onResetAvatar}>Voltar ao avatar padrão</Button>
            )}
          </div>
        )}
        {message && <p style={{ color: '#fbbf24', marginTop: '10px' }}>{message}</p>}
      </Card>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <Stat label="NÍVEL" value={user.level} color="#ff6b57" />
          <Stat label="XP" value={`${user.xp} / ${xpNeeded}`} color="#c084fc" />
          <Stat label="OURO" value={user.gold} color="#fbbf24" />
          <Stat label="FOR" value={user.stats?.str || 10} color="#f87171" />
          <Stat label="INT" value={user.stats?.int || 10} color="#60a5fa" />
          <Stat label="DES" value={user.stats?.dex || 10} color="#fbbf24" />
        </div>
      </Card>

      {isSelf ? (
        <Card>
          <Field label="Bio">
            <textarea
              value={bio}
              maxLength={240}
              onChange={(event) => setBio(event.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(10, 14, 23, 0.8)',
                color: '#fff'
              }}
            />
          </Field>
          <Button variant="secondary" onClick={() => onSaveProfile(bio)}>Salvar perfil</Button>
        </Card>
      ) : (
        <Card>
          <p style={{ color: '#cbd5e1', margin: 0 }}>{user.bio || 'Este herói ainda não escreveu uma bio.'}</p>
        </Card>
      )}

      <Card>
        <h3 className="font-rpg" style={{ marginTop: 0 }}>Conquistas</h3>
        {(user.achievements || []).length === 0 ? (
          <EmptyState>Nenhuma conquista ainda.</EmptyState>
        ) : user.achievements.map((item) => (
          <p key={item.id} style={{ margin: '0 0 6px' }}>{item.title} — {item.description}</p>
        ))}
      </Card>

      {isSelf && (
        <Card>
          <h3 className="font-rpg" style={{ marginTop: 0 }}>Aliados online</h3>
          {friends.length === 0 ? (
            <EmptyState>Você ainda não tem aliados. Adicione um na Taverna.</EmptyState>
          ) : friends.map((friend) => (
            <div key={friend.username} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <button
                onClick={() => onOpenFriend(friend.username)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
              >
                <Avatar name={friend.username} src={friend.avatarUrl} size={32} /> {friend.username}
              </button>
              <Badge>{friend.isOnline ? 'Online' : 'Offline'}</Badge>
            </div>
          ))}
        </Card>
      )}

      {isSelf && (
        <Card>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={onExport}>Exportar meus dados</Button>
            <Button variant="secondary" onClick={onLogout}>Sair</Button>
          </div>
          {emails.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <h3 className="font-rpg" style={{ fontSize: '1rem' }}>E-mails de confirmação</h3>
              {emails.slice(0, 3).map((email, index) => (
                <p key={`${email.subject}-${index}`} style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                  Para {email.to}: {email.subject}
                </p>
              ))}
            </div>
          )}
          <Field label="Digite EXCLUIR para apagar a conta">
            <input
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              placeholder="EXCLUIR"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.4)',
                background: 'rgba(10, 14, 23, 0.8)',
                color: '#fff'
              }}
            />
          </Field>
          <Button disabled={phrase !== 'EXCLUIR'} onClick={() => onDelete(phrase)} style={{ background: '#ef4444' }}>
            Confirmar exclusão
          </Button>
        </Card>
      )}
    </div>
  );
};
