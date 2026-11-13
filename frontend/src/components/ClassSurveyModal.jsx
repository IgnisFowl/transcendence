import React, { useState } from 'react';
import { BookOpen, Dumbbell, Zap, HeartHandshake, Music, Sparkles, HelpCircle, ArrowLeft } from 'lucide-react';
import { Badge, Button, ProgressBar } from '../design/system';

const CLASS_ORDER = ['WIZARD', 'WARRIOR', 'ROGUE', 'CLERIC', 'BARD'];

const CLASS_INFO = {
  WIZARD: {
    name: 'Mago Arcano',
    icon: <BookOpen color="#3b82f6" size={24} />,
    focus: 'Estudos e conhecimento · Inteligência',
    lens: 'entender a fundo',
    description: 'Você para no problema até ele fazer sentido. Missões de estudo rendem XP extra.',
    recommended: 'Ler 20 páginas, estudar uma linguagem, resolver um exercício de lógica.'
  },
  WARRIOR: {
    name: 'Guerreiro de Elite',
    icon: <Dumbbell color="#ef4444" size={24} />,
    focus: 'Corpo e constância · Força',
    lens: 'aparecer mesmo cansado',
    description: 'Você trata o hábito como treino: versão menor ainda conta. Missões de fitness rendem XP extra.',
    recommended: 'Treinar 30 minutos, caminhar, fazer uma série curta em dia ruim.'
  },
  ROGUE: {
    name: 'Ladino Estrategista',
    icon: <Zap color="#f59e0b" size={24} />,
    focus: 'Sistema e foco · Destreza',
    lens: 'encurtar o caminho',
    description: 'Você corta o que não destrava e monta um sistema que não depende de memória. Missões de produtividade rendem XP extra.',
    recommended: 'Planejar o dia em 10 minutos, limpar a caixa de entrada, fechar a semana.'
  },
  CLERIC: {
    name: 'Clérigo Guardião',
    icon: <HeartHandshake color="#10b981" size={24} />,
    focus: 'Cuidado e ritmo · Sabedoria',
    lens: 'proteger o ritmo',
    description: 'Você cuida do sono, do corpo e de quem está sobrecarregado antes de acelerar. Missões de bem-estar rendem XP extra.',
    recommended: 'Meditar 10 minutos, dormir no horário, alongar ao acordar.'
  },
  BARD: {
    name: 'Bardo Inspirador',
    icon: <Music color="#ec4899" size={24} />,
    focus: 'Voz e gente · Carisma',
    lens: 'fazer junto',
    description: 'O hábito pega quando vira história, prática ou companhia. Missões de criatividade rendem XP extra.',
    recommended: 'Praticar um instrumento, escrever, ligar para alguém, estudar um idioma em voz alta.'
  }
};

const questions = [
  {
    scene: 'O cluster, 23h',
    text: 'O projeto fecha amanhã e você já está cansado. O que você faz de verdade?',
    options: [
      { text: 'Abro a documentação e fico no problema até ele fazer sentido.', weights: [{ cls: 'WIZARD', points: 3 }] },
      { text: 'Levanto, caminho um pouco e volto para empurrar até o fim.', weights: [{ cls: 'WARRIOR', points: 2 }, { cls: 'ROGUE', points: 1 }] },
      { text: 'Corto o que não destrava o grupo e entrego o essencial.', weights: [{ cls: 'ROGUE', points: 3 }] },
      { text: 'Vejo quem travou e sento do lado antes de mexer no meu pedaço.', weights: [{ cls: 'CLERIC', points: 2 }, { cls: 'BARD', points: 1 }] },
      { text: 'Transformo a madrugada em algo que o grupo aguenta junto.', weights: [{ cls: 'BARD', points: 2 }, { cls: 'WIZARD', points: 1 }] }
    ]
  },
  {
    scene: 'A ofensiva quebrou',
    text: 'Você manteve um hábito por doze dias e falhou ontem. Na manhã seguinte…',
    options: [
      { text: 'Anoto o que quebrou e ajusto o plano.', weights: [{ cls: 'ROGUE', points: 2 }, { cls: 'WIZARD', points: 1 }] },
      { text: 'Faço uma versão menor hoje, para o corpo não negociar.', weights: [{ cls: 'WARRIOR', points: 3 }] },
      { text: 'Aceito o dia e protejo o sono da noite.', weights: [{ cls: 'CLERIC', points: 3 }] },
      { text: 'Conto para alguém, porque sozinho eu largo de novo.', weights: [{ cls: 'BARD', points: 2 }, { cls: 'CLERIC', points: 1 }] },
      { text: 'Leio um pouco sobre por que o hábito funciona e recomeço.', weights: [{ cls: 'WIZARD', points: 3 }] }
    ]
  },
  {
    scene: 'Sábado sem plano',
    text: 'Você acorda sem compromisso. O que puxa a sua atenção primeiro?',
    options: [
      { text: 'Um texto longo, um curso ou um problema que ainda não entendi.', weights: [{ cls: 'WIZARD', points: 3 }] },
      { text: 'Treino, trilha ou qualquer coisa que deixe o corpo cansado.', weights: [{ cls: 'WARRIOR', points: 3 }] },
      { text: 'Mesa, calendário e a semana desenhada de uma vez.', weights: [{ cls: 'ROGUE', points: 2 }, { cls: 'CLERIC', points: 1 }] },
      { text: 'Comida boa, alongamento e uma noite que começa cedo.', weights: [{ cls: 'CLERIC', points: 2 }, { cls: 'WARRIOR', points: 1 }] },
      { text: 'Um caderno, um instrumento ou gente que eu não vejo faz tempo.', weights: [{ cls: 'BARD', points: 3 }] }
    ]
  },
  {
    scene: 'No grupo',
    text: 'Num trabalho em grupo, as pessoas te procuram quando…',
    options: [
      { text: 'Ninguém entende a parte difícil.', weights: [{ cls: 'WIZARD', points: 3 }] },
      { text: 'O ritmo caiu e alguém precisa segurar a linha.', weights: [{ cls: 'WARRIOR', points: 2 }, { cls: 'ROGUE', points: 1 }] },
      { text: 'O plano está confuso e precisa de um caminho mais curto.', weights: [{ cls: 'ROGUE', points: 3 }] },
      { text: 'Alguém transbordou e a sala ficou pesada.', weights: [{ cls: 'CLERIC', points: 3 }] },
      { text: 'A energia morreu e o trabalho precisa de um motivo para continuar.', weights: [{ cls: 'BARD', points: 3 }] }
    ]
  },
  {
    scene: 'Uma terça normal',
    text: 'Qual frase soa como você, sem pose?',
    options: [
      { text: 'Quero entender, não só terminar.', weights: [{ cls: 'WIZARD', points: 3 }] },
      { text: 'Se eu consigo cansado, eu consigo qualquer dia.', weights: [{ cls: 'WARRIOR', points: 3 }] },
      { text: 'O melhor sistema é o que eu não preciso lembrar.', weights: [{ cls: 'ROGUE', points: 3 }] },
      { text: 'O dia começa pelo corpo e pela cabeça. O resto vem depois.', weights: [{ cls: 'CLERIC', points: 2 }, { cls: 'WARRIOR', points: 1 }] },
      { text: 'Se eu não conto para alguém, parece que não aconteceu.', weights: [{ cls: 'BARD', points: 2 }, { cls: 'WIZARD', points: 1 }] }
    ]
  },
  {
    scene: 'Daqui a três meses',
    text: 'Se os próximos meses derem certo, o que você quer poder mostrar?',
    options: [
      { text: 'Uma habilidade que eu consigo explicar para outra pessoa.', weights: [{ cls: 'WIZARD', points: 2 }, { cls: 'BARD', points: 1 }] },
      { text: 'Um corpo que aparece sem discussão.', weights: [{ cls: 'WARRIOR', points: 3 }] },
      { text: 'Uma semana que anda sozinha.', weights: [{ cls: 'ROGUE', points: 3 }] },
      { text: 'Sono, comida e uma cabeça mais quieta.', weights: [{ cls: 'CLERIC', points: 3 }] },
      { text: 'Uma prática que existe com outras pessoas: música, texto ou um círculo.', weights: [{ cls: 'BARD', points: 3 }] }
    ]
  }
];

const TIE_SCENES = {
  'BARD|WIZARD': {
    text: 'Você acabou de entender uma coisa difícil. O que fecha o dia?',
    options: [
      { text: 'Fico mais um pouco no assunto, só para fixar.', weights: [{ cls: 'WIZARD', points: 3 }] },
      { text: 'Explico para alguém. Aí sim ficou meu.', weights: [{ cls: 'BARD', points: 3 }] }
    ]
  },
  'CLERIC|WIZARD': {
    text: 'A cabeça já pifou e ainda tem uma página. O que você faz?',
    options: [
      { text: 'Leio a página. Parar no meio me incomoda mais.', weights: [{ cls: 'WIZARD', points: 3 }] },
      { text: 'Fecho. Amanhã eu renderizo o dobro.', weights: [{ cls: 'CLERIC', points: 3 }] }
    ]
  },
  'ROGUE|WIZARD': {
    text: 'Você tem quarenta minutos livres. Como usa?',
    options: [
      { text: 'Entro no tema até entender o mecanismo.', weights: [{ cls: 'WIZARD', points: 3 }] },
      { text: 'Entrego uma versão menor e deixo o resto para depois.', weights: [{ cls: 'ROGUE', points: 3 }] }
    ]
  },
  'WARRIOR|WIZARD': {
    text: 'O bug resistiu a noite inteira. Qual é o próximo movimento?',
    options: [
      { text: 'Continuo na cadeira até achar a causa.', weights: [{ cls: 'WIZARD', points: 3 }] },
      { text: 'Saio para me mexer e volto com outra cabeça.', weights: [{ cls: 'WARRIOR', points: 3 }] }
    ]
  },
  'CLERIC|ROGUE': {
    text: 'A lista do dia não cabe no dia. O que sai primeiro?',
    options: [
      { text: 'O que não é essencial. O sistema fica mais leve.', weights: [{ cls: 'ROGUE', points: 3 }] },
      { text: 'A noite. O resto espera, o descanso não.', weights: [{ cls: 'CLERIC', points: 3 }] }
    ]
  },
  'BARD|ROGUE': {
    text: 'Você vai começar um hábito novo. Como ele nasce?',
    options: [
      { text: 'Num sistema pequeno, só meu, que eu sigo no piloto automático.', weights: [{ cls: 'ROGUE', points: 3 }] },
      { text: 'Com outra pessoa, senão ele não existe.', weights: [{ cls: 'BARD', points: 3 }] }
    ]
  },
  'ROGUE|WARRIOR': {
    text: 'O treino de hoje está chato e longo. O que você faz?',
    options: [
      { text: 'Cumpro a série. Chato também conta.', weights: [{ cls: 'WARRIOR', points: 3 }] },
      { text: 'Encurto e rearrumo, para eu voltar amanhã.', weights: [{ cls: 'ROGUE', points: 3 }] }
    ]
  },
  'BARD|CLERIC': {
    text: 'A semana foi pesada. Como você descarrega?',
    options: [
      { text: 'Fico quieto, como direito e durmo cedo.', weights: [{ cls: 'CLERIC', points: 3 }] },
      { text: 'Chamo alguém e conto como foi.', weights: [{ cls: 'BARD', points: 3 }] }
    ]
  },
  'CLERIC|WARRIOR': {
    text: 'Você está dolorido e o treino está marcado. E agora?',
    options: [
      { text: 'Treino mesmo assim, numa versão que o corpo aceita.', weights: [{ cls: 'WARRIOR', points: 3 }] },
      { text: 'Troco por recuperação. Forçar hoje cobra amanhã.', weights: [{ cls: 'CLERIC', points: 3 }] }
    ]
  },
  'BARD|WARRIOR': {
    text: 'Você vai se mexer hoje. O que te faz aparecer?',
    options: [
      { text: 'A sessão sozinha. Ninguém precisa ver.', weights: [{ cls: 'WARRIOR', points: 3 }] },
      { text: 'Uma aula, um jogo ou alguém me esperando.', weights: [{ cls: 'BARD', points: 3 }] }
    ]
  }
};

const emptyScores = () => Object.fromEntries(CLASS_ORDER.map((cls) => [cls, 0]));

function tally(picks) {
  const scores = emptyScores();
  picks.forEach((pick) => {
    pick.weights.forEach(({ cls, points }) => {
      scores[cls] += points;
    });
  });
  return scores;
}

function ranking(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export const ClassSurveyModal = ({ onCompleteClass }) => {
  const [activeTab, setActiveTab] = useState('survey');
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState([]);
  const [phase, setPhase] = useState('ask');
  const [scores, setScores] = useState(emptyScores);
  const [tie, setTie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const finish = (nextPicks, baseScores) => {
    const nextScores = baseScores || tally(nextPicks);
    const [first, second] = ranking(nextScores);
    const gap = first[1] - second[1];
    setScores(nextScores);
    setPicks(nextPicks);
    if (gap <= 2) {
      const key = [first[0], second[0]].sort().join('|');
      setTie({ key, a: first[0], b: second[0] });
      setPhase('tie');
      return;
    }
    setTie(null);
    setPhase('result');
  };

  const handleSelect = (option) => {
    const nextPicks = [...picks.slice(0, step), option];
    setPicks(nextPicks);
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    finish(nextPicks);
  };

  const handleTie = (option) => {
    const nextScores = tally(picks);
    option.weights.forEach(({ cls, points }) => {
      nextScores[cls] += points;
    });
    setScores(nextScores);
    setPhase('result');
  };

  const handleBack = () => {
    if (phase === 'tie') {
      setPhase('ask');
      setStep(questions.length - 1);
      return;
    }
    if (phase === 'result') {
      setPhase(tie ? 'tie' : 'ask');
      if (!tie) setStep(questions.length - 1);
      return;
    }
    if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(0);
    setPicks([]);
    setPhase('ask');
    setScores(emptyScores());
    setTie(null);
    setSubmitting(false);
  };

  const handleClaim = async (classId) => {
    setSubmitting(true);
    try {
      await onCompleteClass(classId);
    } catch {
      setSubmitting(false);
    }
  };

  const ordered = ranking(scores);
  const winner = ordered[0][0];
  const runner = ordered[1][0];
  const close = ordered[0][1] - ordered[1][1] <= 3;
  const maxScore = questions.length * 3 + (tie ? 3 : 0);
  const progress = phase === 'ask' ? Math.round((step / questions.length) * 100) : 100;
  const current = questions[step];
  const tieScene = tie ? TIE_SCENES[tie.key] : null;

  return (
    <div className="glass-card" style={{ maxWidth: '750px', margin: '0 auto', border: '1px solid rgba(255, 107, 87, 0.3)' }}>
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Button
          variant={activeTab === 'survey' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('survey')}
          style={{ fontSize: '0.9rem', padding: '10px 20px' }}
        >
          <HelpCircle size={16} /> Questionário
        </Button>
        <Button
          variant={activeTab === 'guide' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('guide')}
          style={{ fontSize: '0.9rem', padding: '10px 20px' }}
        >
          <Sparkles size={16} /> Guia das 5 classes
        </Button>
      </div>

      {activeTab === 'guide' ? (
        <div>
          <h3 className="font-rpg title-glow" style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '16px' }}>
            Conheça as classes do Side Quest
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Cada classe é um jeito de manter hábito. O teste soma o que você faria numa cena, e uma missão da sua categoria rende XP extra.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {CLASS_ORDER.map((classId) => {
              const info = CLASS_INFO[classId];
              return (
                <div key={classId} style={{
                  background: 'rgba(10, 14, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {info.icon}
                    <h4 className="font-rpg" style={{ color: '#f8fafc', fontSize: '1.15rem' }}>{info.name}</h4>
                  </div>
                  <span style={{ display: 'inline-block', color: '#ff6b57', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '8px' }}>
                    {info.focus}
                  </span>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '8px', lineHeight: '1.5' }}>{info.description}</p>
                  <div style={{ fontSize: '0.83rem', color: '#94a3b8', fontStyle: 'italic' }}>{info.recommended}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : phase === 'result' ? (
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Sua classe</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {CLASS_INFO[winner].icon}
            <h2 className="font-rpg gradient-text" style={{ fontSize: '1.8rem', margin: 0 }}>{CLASS_INFO[winner].name}</h2>
          </div>
          <p style={{ color: '#cbd5e1', lineHeight: 1.5, marginBottom: '8px' }}>
            O teste leu mais <strong style={{ color: '#f8fafc' }}>{CLASS_INFO[winner].lens}</strong>
            {close ? `, com ${CLASS_INFO[runner].name} logo atrás.` : ` do que as outras tendências.`}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '18px' }}>
            {CLASS_INFO[winner].description}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {ordered.map(([classId, value]) => (
              <div key={classId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>{CLASS_INFO[classId].name}</span>
                  <span>{value}</span>
                </div>
                <ProgressBar value={Math.round((value / maxScore) * 100)} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button onClick={() => handleClaim(winner)} disabled={submitting}>
              {submitting ? 'Gravando…' : `Assumir ${CLASS_INFO[winner].name}`}
            </Button>
            {close && (
              <Button variant="secondary" onClick={() => handleClaim(runner)} disabled={submitting}>
                Ficar com {CLASS_INFO[runner].name}
              </Button>
            )}
            <Button variant="secondary" onClick={handleReset} disabled={submitting}>Refazer</Button>
          </div>
        </div>
      ) : (
        <div>
          <ProgressBar
            value={progress}
            label={phase === 'tie' ? 'Última cena — o resultado ficou perto' : `Cena ${step + 1} de ${questions.length}`}
          />
          <div style={{ margin: '16px 0' }}>
            <Badge>{phase === 'tie' ? 'Desempate' : current.scene}</Badge>
          </div>
          <h2 className="font-rpg gradient-text" style={{ fontSize: '1.4rem', marginBottom: '8px', lineHeight: '1.4' }}>
            {phase === 'tie' ? tieScene.text : current.text}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '18px' }}>
            Não existe resposta certa. Escolha o que você faria, não a classe que parece mais legal.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(phase === 'tie' ? tieScene.options : current.options).map((opt, idx) => (
              <button
                key={opt.text}
                type="button"
                onClick={() => (phase === 'tie' ? handleTie(opt) : handleSelect(opt))}
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
          {(phase === 'tie' || step > 0) && (
            <Button variant="secondary" onClick={handleBack} style={{ marginTop: '16px' }}>
              <ArrowLeft size={16} /> Voltar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
