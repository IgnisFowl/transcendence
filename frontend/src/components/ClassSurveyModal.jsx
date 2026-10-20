import React, { useState } from 'react';
import { BookOpen, Dumbbell, Zap, HeartHandshake, Music, Sparkles, HelpCircle } from 'lucide-react';

export const ClassSurveyModal = ({ onCompleteClass }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState({
    WIZARD: 0,
    WARRIOR: 0,
    ROGUE: 0,
    CLERIC: 0,
    BARD: 0
  });

  const [activeTab, setActiveTab] = useState('survey');

  const questions = [
    {
      id: 1,
      text: "Quando você se depara com um grande desafio ou projeto difícil, qual é seu primeiro impulso?",
      options: [
        { text: "Pesquisar a fundo, ler documentações e entender a teoria por trás.", classTarget: 'WIZARD', points: 3 },
        { text: "Enfrentar de cabeça erguida com disciplina física e esforço bruto.", classTarget: 'WARRIOR', points: 3 },
        { text: "Encontrar um atalho inteligente, otimizar rotinas e economizar tempo.", classTarget: 'ROGUE', points: 3 },
        { text: "Garantir a saúde mental e estabilidade da equipe antes de agir.", classTarget: 'CLERIC', points: 3 },
        { text: "Conectar pessoas, pedir ajuda e transformar a tarefa em algo divertido.", classTarget: 'BARD', points: 3 }
      ]
    },
    {
      id: 2,
      text: "Qual hábito diário você consideraria sua maior conquista de vida?",
      options: [
        { text: "Ler 30 minutos de livros técnicos ou aprender um novo idioma.", classTarget: 'WIZARD', points: 3 },
        { text: "Treinar corrida, musculação ou artes marciais sem falhar.", classTarget: 'WARRIOR', points: 3 },
        { text: "Zerar minha caixa de entrada, organizar tarefas e manter foco absoluto.", classTarget: 'ROGUE', points: 3 },
        { text: "Praticar meditação, boa alimentação e sono de 8 horas regulares.", classTarget: 'CLERIC', points: 3 },
        { text: "Praticar um instrumento musical, escrever ou socializar diariamente.", classTarget: 'BARD', points: 3 }
      ]
    },
    {
      id: 3,
      text: "Como você prefere gastar seu tempo livre em um final de semana?",
      options: [
        { text: "Estudando novas tecnologias, código ou mistérios do conhecimento.", classTarget: 'WIZARD', points: 3 },
        { text: "Praticando esportes, caminhadas ao ar livre ou exercícios físicos.", classTarget: 'WARRIOR', points: 3 },
        { text: "Organizando projetos pessoais e automatizando tarefas manuais.", classTarget: 'ROGUE', points: 3 },
        { text: "Descansando a mente, praticando yoga e repondo as energias.", classTarget: 'CLERIC', points: 3 },
        { text: "Saindo com amigos, indo a eventos ou praticando hobbies criativos.", classTarget: 'BARD', points: 3 }
      ]
    },
    {
      id: 4,
      text: "Em um grupo de trabalho ou estudos, qual papel costuma ser o seu?",
      options: [
        { text: "O especialista analítico que tira dúvidas técnicas e resolve bugs complexos.", classTarget: 'WIZARD', points: 3 },
        { text: "O líder disciplinado que mantém o ritmo firme e não deixa ninguém desistir.", classTarget: 'WARRIOR', points: 3 },
        { text: "O estrategista prático que simplifica processos e elimina desperdícios.", classTarget: 'ROGUE', points: 3 },
        { text: "O mediador empático que apoia os colegas sob estresse ou ansiedade.", classTarget: 'CLERIC', points: 3 },
        { text: "O comunicador entusiasmado que motiva e mantém o astral elevado.", classTarget: 'BARD', points: 3 }
      ]
    },
    {
      id: 5,
      text: "Qual destas frases mais descreve sua filosofia pessoal?",
      options: [
        { text: "'Conhecimento é o verdadeiro poder e a chave para a evolução.'", classTarget: 'WIZARD', points: 3 },
        { text: "'A disciplina e a força superam qualquer obstáculo no caminho.'", classTarget: 'WARRIOR', points: 3 },
        { text: "'Eficiência e astúcia abrem portas que a força bruta não consegue.'", classTarget: 'ROGUE', points: 3 },
        { text: "'Equilíbrio interno e saúde são o alicerce de qualquer conquista.'", classTarget: 'CLERIC', points: 3 },
        { text: "'A vida é feita de conexões, expressão criativa e boas histórias.'", classTarget: 'BARD', points: 3 }
      ]
    },
    {
      id: 6,
      text: "Qual é a sua principal meta nos próximos meses?",
      options: [
        { text: "Dominar novas habilidades cognitivas, cursos ou linguagens.", classTarget: 'WIZARD', points: 3 },
        { text: "Alcançar meu ápice de condicionamento e resistência física.", classTarget: 'WARRIOR', points: 3 },
        { text: "Aumentar drasticamente minha produtividade e foco diário.", classTarget: 'ROGUE', points: 3 },
        { text: "Melhorar minha saúde mental, hábitos de sono e bem-estar geral.", classTarget: 'CLERIC', points: 3 },
        { text: "Expandir meu círculo social, rede de contatos e projetos artísticos.", classTarget: 'BARD', points: 3 }
      ]
    }
  ];

  const handleSelectOption = (targetClass, points) => {
    const nextScores = { ...scores, [targetClass]: scores[targetClass] + points };
    setScores(nextScores);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      let highestClass = 'WIZARD';
      let maxScore = -1;

      Object.keys(nextScores).forEach(cls => {
        if (nextScores[cls] > maxScore) {
          maxScore = nextScores[cls];
          highestClass = cls;
        }
      });

      onCompleteClass(highestClass);
    }
  };

  const classExplanations = [
    {
      class: 'WIZARD',
      name: 'Mago Arcano',
      icon: <BookOpen color="#3b82f6" size={24} />,
      focus: 'Estudos & Conhecimento (Atributo Principal: INT)',
      description: 'Especialista em foco profundo e absorção de novos conhecimentos. Ganha bônus de XP ao completar missões de leitura, código, idiomas e cursos.',
      recommended: 'Exemplos de hábitos: Estudar 45min de C++, ler 20 páginas de um livro, praticar exercícios de lógica.'
    },
    {
      class: 'WARRIOR',
      name: 'Guerreiro de Elite',
      icon: <Dumbbell color="#ef4444" size={24} />,
      focus: 'Fitness & Resistência (Atributo Principal: FOR)',
      description: 'Focado em superação física e força muscular. Ganha bônus de XP com exercícios físicos regulares, corridas, musculação e treinos pesados.',
      recommended: 'Exemplos de hábitos: 30 flexões diárias, treino de musculação, 5km de corrida, postura corporal.'
    },
    {
      class: 'ROGUE',
      name: 'Ladino Estrategista',
      icon: <Zap color="#f59e0b" size={24} />,
      focus: 'Produtividade & Agilidade (Atributo Principal: DES)',
      description: 'Mestre em otimização de tempo e organização diária. Ganha bônus de XP limpando listas de tarefas, organizando projetos e evitando distrações.',
      recommended: 'Exemplos de hábitos: Inbox Zero, Técnica Pomodoro, organizar o espaço de trabalho, planejar a semana.'
    },
    {
      class: 'CLERIC',
      name: 'Clérigo Guardião',
      icon: <HeartHandshake color="#10b981" size={24} />,
      focus: 'Bem-Estar & Saúde Mental (Atributo Principal: SAB)',
      description: 'Protetor da paz interior, saúde e equilíbrio vital. Ganha bônus de XP praticando meditação, hidratação, sono adequado e hábitos de saúde.',
      recommended: 'Exemplos de hábitos: 10 minutos de meditação, beber 2L de água, dormir 8 horas, alongamento ao acordar.'
    },
    {
      class: 'BARD',
      name: 'Bardo Inspirador',
      icon: <Music color="#ec4899" size={24} />,
      focus: 'Criatividade & Comunicação (Atributo Principal: CAR)',
      description: 'Espírito artístico e social da taverna. Ganha bônus de XP ao praticar instrumentos, hábitos criativos, networking e manter boas conversas.',
      recommended: 'Exemplos de hábitos: Praticar violão 20min, escrever diário pessoal, ligar para um amigo, artes visuais.'
    }
  ];

  return (
    <div className="glass-card" style={{ maxWidth: '750px', margin: '0 auto', border: '1px solid rgba(255, 107, 87, 0.3)' }}>
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '24px' }}>
        <button 
          className={`btn-paymark ${activeTab === 'survey' ? '' : 'btn-paymark-secondary'}`}
          onClick={() => setActiveTab('survey')}
          style={{ fontSize: '0.9rem', padding: '10px 20px' }}
        >
          <HelpCircle size={16} /> Questionário Inicial ({currentStep + 1}/{questions.length})
        </button>

        <button 
          className={`btn-paymark ${activeTab === 'guide' ? '' : 'btn-paymark-secondary'}`}
          onClick={() => setActiveTab('guide')}
          style={{ fontSize: '0.9rem', padding: '10px 20px' }}
        >
          <Sparkles size={16} /> Guia das 5 Classes RPG
        </button>
      </div>

      {activeTab === 'survey' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
            <span>Pergunta {currentStep + 1} de {questions.length}</span>
            <span>{Math.round(((currentStep + 1) / questions.length) * 100)}% Concluído</span>
          </div>

          <div className="progress-bar-container" style={{ marginBottom: '24px' }}>
            <div className="progress-xp" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }} />
          </div>

          <h2 className="font-rpg gradient-text" style={{ fontSize: '1.4rem', marginBottom: '20px', lineHeight: '1.4' }}>
            {questions[currentStep].text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questions[currentStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt.classTarget, opt.points)}
                className="btn-paymark-secondary"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  background: 'rgba(10, 14, 23, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <span style={{ color: '#ff6b57', fontWeight: 'bold', marginRight: '10px' }}>{String.fromCharCode(65 + idx)}.</span>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-rpg title-glow" style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '16px' }}>
            Conheça as Classes do HabitQuest
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
            Cada classe representa o seu foco principal de desenvolvimento de hábitos na vida real.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {classExplanations.map((c, i) => (
              <div key={i} style={{
                background: 'rgba(10, 14, 23, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {c.icon}
                  <h4 className="font-rpg" style={{ color: '#f8fafc', fontSize: '1.15rem' }}>{c.name}</h4>
                </div>
                <span style={{ display: 'inline-block', color: '#ff6b57', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '8px' }}>
                  {c.focus}
                </span>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '8px', lineHeight: '1.5' }}>
                  {c.description}
                </p>
                <div style={{ fontSize: '0.83rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  💡 {c.recommended}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
