import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

export const LegalModal = ({ onClose }) => {
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
      <div className="glass-card" style={{ width: '100%', maxWidth: '640px', position: 'relative', border: '1px solid rgba(255, 107, 87, 0.3)', maxHeight: '80vh', overflowY: 'auto' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <ShieldCheck color="#10b981" size={26} />
          <h2 className="font-rpg gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>
            Termos de Serviço & Política de Privacidade (GDPR/LGPD)
          </h2>
        </div>

        <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <h4 style={{ color: '#ff6b57', margin: '14px 0 6px' }}>1. Coleta e Uso de Dados</h4>
          <p>
            O HabitQuest armazena apenas seu nome de usuário, e-mail criptografado, classe RPG e preferências de hábitos com a finalidade exclusiva de gamificação. Seus dados nunca são vendidos ou compartilhados com terceiros.
          </p>

          <h4 style={{ color: '#ff6b57', margin: '14px 0 6px' }}>2. Direitos de Portabilidade (GDPR)</h4>
          <p>
            Em conformidade com as diretrizes do GDPR e LGPD, você possui o direito de exportar a totalidade de seus dados em formato JSON legível a qualquer momento a partir da Ficha de Perfil.
          </p>

          <h4 style={{ color: '#ff6b57', margin: '14px 0 6px' }}>3. Direito ao Esquecimento</h4>
          <p>
            Você pode solicitar a exclusão permanente de sua conta e de todos os registros de hábitos a qualquer momento. Todos os dados associados serão removidos do banco de dados imediatamente.
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button className="btn-paymark" onClick={onClose} style={{ padding: '8px 20px' }}>
            Compreendi e Aceito
          </button>
        </div>
      </div>
    </div>
  );
};
