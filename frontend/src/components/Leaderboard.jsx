import React from 'react';
import { Trophy } from 'lucide-react';
import { Badge, Card, EmptyState } from '../design/system';

const classNamesPt = {
  WIZARD: 'Mago',
  WARRIOR: 'Guerreiro',
  ROGUE: 'Ladino',
  CLERIC: 'Clérigo',
  BARD: 'Bardo',
  UNASSIGNED: 'Sem Classe'
};

export const Leaderboard = ({ rows }) => {
  return (
    <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="font-rpg gradient-text" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
        <Trophy size={22} style={{ marginRight: '8px' }} /> Ranking da Guilda
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: '18px' }}>
        Os heróis sobem no ranking com nível e XP guardados no banco. Cada missão concluída conta.
      </p>
      {rows.length === 0 ? (
        <EmptyState>Ainda não há heróis no ranking.</EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rows.map((row) => (
            <div key={row.username} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(10, 14, 23, 0.8)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <strong style={{ color: '#ff6b57', width: '36px' }}>#{row.rank}</strong>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff' }}>{row.username}</div>
                <Badge>{classNamesPt[row.characterClass] || row.characterClass}</Badge>
              </div>
              <div style={{ textAlign: 'right', color: '#fbbf24' }}>
                Nível {row.level}
                <div style={{ color: '#c084fc', fontSize: '0.82rem' }}>{row.xp} XP · {row.gold} ouro</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
