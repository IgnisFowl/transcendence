import React, { useState } from 'react';
import { Button, Card, Field } from '../design/system';

const ROLES = [
  { id: 'admin', label: 'Mestre' },
  { id: 'moderator', label: 'Moderador' },
  { id: 'user', label: 'Herói' },
  { id: 'guest', label: 'Convidado' }
];

const roleLabel = (role) => ROLES.find((item) => item.id === role)?.label || role;

export const AdminDesk = ({ accounts, currentUser, canManage, onCreate, onUpdate, onDelete }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [pendingDelete, setPendingDelete] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    const ok = await onCreate({ email, username, password, role });
    if (!ok) return;
    setEmail('');
    setUsername('');
    setPassword('');
    setRole('user');
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card>
        <h2 className="font-rpg gradient-text" style={{ marginTop: 0 }}>Mesa da guilda</h2>
        <p style={{ color: '#94a3b8', marginBottom: 0, lineHeight: 1.5 }}>
          {canManage
            ? 'O mestre cria contas, muda o papel e exclui heróis. Um moderador só olha esta lista e pode apagar mensagens na Taverna.'
            : 'Você é moderador: pode ver as contas e apagar mensagens na Taverna. Só o mestre cria, muda papéis e exclui.'}
        </p>
      </Card>

      {canManage && (
        <Card>
          <h3 className="font-rpg" style={{ marginTop: 0 }}>Nova conta</h3>
          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <Field label="Nome">
              <input value={username} onChange={(event) => setUsername(event.target.value)} required style={inputStyle} />
            </Field>
            <Field label="E-mail">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={inputStyle} />
            </Field>
            <Field label="Senha">
              <input type="text" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} style={inputStyle} />
            </Field>
            <Field label="Papel">
              <select value={role} onChange={(event) => setRole(event.target.value)} style={inputStyle}>
                {ROLES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </Field>
            <Button type="submit">Criar conta</Button>
          </form>
          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Herói passa pelo questionário. Convidado entra e só observa. Mestre e moderador jogam e ainda abrem esta mesa.</p>
        </Card>
      )}

      <Card>
        <h3 className="font-rpg" style={{ marginTop: 0 }}>Contas ({accounts.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              canManage={canManage}
              isSelf={account.id === currentUser.id}
              confirming={pendingDelete === account.id}
              onAskDelete={() => setPendingDelete(account.id)}
              onCancelDelete={() => setPendingDelete(null)}
              onDelete={() => { onDelete(account.id); setPendingDelete(null); }}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

function AccountRow({ account, canManage, isSelf, confirming, onAskDelete, onCancelDelete, onDelete, onUpdate }) {
  const [role, setRole] = useState(account.role);
  const [bio, setBio] = useState(account.bio || '');
  const [password, setPassword] = useState('');

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <strong style={{ color: '#f8fafc' }}>{account.username}</strong>
          <span style={{ color: '#94a3b8' }}> · {roleLabel(account.role)} · nível {account.level} · {account.gold} ouro</span>
          <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{account.email}</div>
        </div>
      </div>
      {canManage && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginTop: '10px', alignItems: 'end' }}>
          <Field label="Papel">
            <select value={role} onChange={(event) => setRole(event.target.value)} style={inputStyle}>
              {ROLES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="Bio">
            <input value={bio} onChange={(event) => setBio(event.target.value)} maxLength={240} style={inputStyle} />
          </Field>
          <Field label="Nova senha">
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="em branco mantém" style={inputStyle} />
          </Field>
          <Button type="button" variant="secondary" onClick={() => onUpdate(account.id, { role, bio, password })}>Salvar</Button>
          {!isSelf && !confirming && (
            <Button type="button" onClick={onAskDelete} style={{ background: '#ef4444' }}>Excluir</Button>
          )}
          {confirming && (
            <>
              <Button type="button" onClick={onDelete} style={{ background: '#ef4444' }}>Confirmar exclusão</Button>
              <Button type="button" variant="secondary" onClick={onCancelDelete}>Cancelar</Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(10, 14, 23, 0.8)',
  color: '#fff'
};
