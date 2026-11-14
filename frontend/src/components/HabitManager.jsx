import React, { useState } from 'react';
import { Plus, Check, Trash2, Sparkles, Flame } from 'lucide-react';
import { EmptyState } from '../design/system';
import { CATEGORY_LABELS, CLASS_LABELS, DIFFICULTY_LABELS, QUEST_EXAMPLES } from '../catalog';

const CLASS_ORDER = ['WIZARD', 'WARRIOR', 'ROGUE', 'CLERIC', 'BARD'];

function nextStreakBonus(streak) {
  const next = streak + 1;
  if (next >= 7) return 15;
  if (next >= 3) return 10;
  if (next >= 2) return 5;
  return 0;
}

export const HabitManager = ({
  habits,
  characterClass,
  onCompleteHabit,
  onCreateHabit,
  onDeleteHabit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('STUDY');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [showForm, setShowForm] = useState(false);
  const [showExamples, setShowExamples] = useState(habits.length === 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateHabit({ title, description, category, difficulty });
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  const categoryLabels = {
    STUDY: { label: 'Estudo', color: '#60a5fa' },
    FITNESS: { label: 'Fitness', color: '#f87171' },
    PRODUCTIVITY: { label: 'Produtividade', color: '#fbbf24' },
    WELLBEING: { label: 'Bem-Estar', color: '#34d399' },
    CREATIVITY: { label: 'Criatividade', color: '#f472b6' }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Actions */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="font-rpg gradient-text" style={{ fontSize: '1.8rem', margin: 0 }}>
            Registro de Missões & Hábitos
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Uma missão fácil da sua classe vale 30 XP, uma média 60 e uma difícil 120. O próximo nível pede nível × 100. Do segundo dia seguido, a ofensiva soma mais XP.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-paymark-secondary"
            onClick={() => setShowExamples((open) => !open)}
            style={{ fontSize: '0.85rem' }}
          >
            <Sparkles size={16} /> Exemplos de missão
          </button>

          <button 
            className="btn-paymark"
            onClick={() => setShowForm(!showForm)}
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Nova Missão
          </button>
        </div>
      </div>

      {/* Formulário de Criação de Hábito */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card" style={{ border: '1px solid rgba(255, 107, 87, 0.4)' }}>
          <h3 className="font-rpg" style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '16px' }}>
            📜 Criar Nova Missão Diária
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Título da Missão</label>
              <input
                type="text"
                required
                placeholder="Ex: Ler 20 páginas de C++ ou fazer 30 flexões"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(10, 14, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#fff'
                  }}
                >
                  <option value="STUDY">Estudo (Foco Mago)</option>
                  <option value="FITNESS">Fitness (Foco Guerreiro)</option>
                  <option value="PRODUCTIVITY">Produtividade (Foco Ladino)</option>
                  <option value="WELLBEING">Bem-Estar (Foco Clérigo)</option>
                  <option value="CREATIVITY">Criatividade (Foco Bardo)</option>
                </select>
                <span style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '0.75rem' }}>
                  A categoria da sua classe rende XP extra.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>Dificuldade</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(10, 14, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#fff'
                  }}
                >
                  <option value="EASY">Fácil (+25 XP / +10 Ouro)</option>
                  <option value="MEDIUM">Média (+50 XP / +20 Ouro)</option>
                  <option value="HARD">Difícil (+100 XP / +45 Ouro)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn-paymark-secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-paymark">
                Salvar Missão
              </button>
            </div>
          </div>
        </form>
      )}

      {showExamples && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3 className="font-rpg" style={{ color: '#f8fafc', fontSize: '1.2rem', margin: 0 }}>
              Exemplos para começar
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0' }}>
              Três por classe: uma curtinha, uma de um bloco e uma que pede mais de você. A da sua classe rende XP extra.
            </p>
          </div>
          {[...(characterClass && CLASS_ORDER.includes(characterClass) ? [characterClass] : []), ...CLASS_ORDER.filter((classId) => classId !== characterClass)]
            .map((classId) => (
              <div key={classId}>
                <h4 style={{ color: classId === characterClass ? '#ff6b57' : '#cbd5e1', fontSize: '0.92rem', margin: '0 0 10px' }}>
                  {CLASS_LABELS[classId]}{classId === characterClass ? ' · sua classe' : ''}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {QUEST_EXAMPLES.filter((example) => example.classId === classId).map((example) => {
                    const owned = habits.some((habit) => habit.title.toLowerCase() === example.title.toLowerCase());
                    return (
                      <div key={example.title} style={{
                        background: 'rgba(10, 14, 23, 0.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <strong style={{ color: '#f8fafc' }}>{example.title}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                          {CATEGORY_LABELS[example.category]} · {DIFFICULTY_LABELS[example.difficulty]}
                        </span>
                        <p style={{ color: '#cbd5e1', fontSize: '0.84rem', margin: 0, lineHeight: 1.45 }}>{example.why}</p>
                        <button
                          type="button"
                          className="btn-paymark-secondary"
                          disabled={owned}
                          onClick={() => onCreateHabit({
                            title: example.title,
                            description: example.why,
                            category: example.category,
                            difficulty: example.difficulty
                          })}
                          style={{ fontSize: '0.8rem', marginTop: 'auto' }}
                        >
                          {owned ? 'Já na lista' : 'Adicionar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Lista de Hábitos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {habits.length === 0 && (
          <EmptyState>Nenhuma missão ainda. Crie a primeira para ganhar XP.</EmptyState>
        )}
        {habits.map((h) => {
          const catInfo = categoryLabels[h.category] || { label: h.category, color: '#94a3b8' };
          return (
            <div 
              key={h.id} 
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '16px 20px',
                opacity: h.completedToday ? 0.65 : 1,
                borderLeft: `4px solid ${catInfo.color}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => onCompleteHabit(h.id)}
                  disabled={h.completedToday}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: h.completedToday ? 'none' : '2px solid #ff6b57',
                    background: h.completedToday ? '#10b981' : 'transparent',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: h.completedToday ? 'default' : 'pointer'
                  }}
                >
                  {h.completedToday && <Check size={20} />}
                </button>

                <div>
                  <h4 style={{
                    color: '#f8fafc',
                    fontSize: '1.05rem',
                    margin: 0,
                    textDecoration: h.completedToday ? 'line-through' : 'none'
                  }}>
                    {h.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                    <span style={{ color: catInfo.color, fontWeight: 'bold' }}>{catInfo.label}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff6b57' }}>
                      <Flame size={13} /> {h.streak} {h.streak === 1 ? 'dia' : 'dias'} de ofensiva
                      {h.completedToday && nextStreakBonus(h.streak) > 0 ? ` · amanhã +${nextStreakBonus(h.streak)} XP` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteHabit(h.id)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
