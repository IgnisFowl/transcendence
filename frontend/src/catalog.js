export const CLASS_LABELS = {
  WIZARD: 'Mago',
  WARRIOR: 'Guerreiro',
  ROGUE: 'Ladino',
  CLERIC: 'Clérigo',
  BARD: 'Bardo'
};

export const CATEGORY_LABELS = {
  STUDY: 'Estudo',
  FITNESS: 'Fitness',
  PRODUCTIVITY: 'Produtividade',
  WELLBEING: 'Bem-estar',
  CREATIVITY: 'Criatividade'
};

export const DIFFICULTY_LABELS = {
  EASY: 'Fácil · 25 XP',
  MEDIUM: 'Média · 50 XP',
  HARD: 'Difícil · 100 XP'
};

export const QUEST_EXAMPLES = [
  { classId: 'WIZARD', category: 'STUDY', difficulty: 'EASY', title: 'Ler 10 páginas', why: 'Dez páginas cabem entre duas aulas. Num dia ruim, ainda dá.' },
  { classId: 'WIZARD', category: 'STUDY', difficulty: 'MEDIUM', title: 'Estudar 45 minutos sem o celular', why: 'Um bloco só, com o telefone em outro cômodo.' },
  { classId: 'WIZARD', category: 'STUDY', difficulty: 'HARD', title: 'Resolver 3 exercícios e anotar onde travou', why: 'O ponto anotado vale mais do que acertar no escuro.' },
  { classId: 'WARRIOR', category: 'FITNESS', difficulty: 'EASY', title: 'Caminhar 15 minutos', why: 'Sair e voltar já conta. O hábito é aparecer.' },
  { classId: 'WARRIOR', category: 'FITNESS', difficulty: 'MEDIUM', title: 'Treinar 30 minutos', why: 'Qualquer treino que deixe o corpo cansado de verdade.' },
  { classId: 'WARRIOR', category: 'FITNESS', difficulty: 'HARD', title: 'Fazer o treino e alongar no fim', why: 'O alongamento é o que faz você voltar amanhã.' },
  { classId: 'ROGUE', category: 'PRODUCTIVITY', difficulty: 'EASY', title: 'Planejar o dia em 10 minutos', why: 'Três tarefas, na ordem em que vão acontecer.' },
  { classId: 'ROGUE', category: 'PRODUCTIVITY', difficulty: 'MEDIUM', title: 'Uma sessão de 25 minutos numa tarefa só', why: 'O timer acaba e você para. O hábito é começar.' },
  { classId: 'ROGUE', category: 'PRODUCTIVITY', difficulty: 'HARD', title: 'Esvaziar a caixa de entrada', why: 'Decidir cada mensagem, não só abrir e fechar.' },
  { classId: 'CLERIC', category: 'WELLBEING', difficulty: 'EASY', title: 'Beber um copo de água ao acordar', why: 'O primeiro copo ancora o resto do dia.' },
  { classId: 'CLERIC', category: 'WELLBEING', difficulty: 'MEDIUM', title: 'Meditar ou respirar por 10 minutos', why: 'Sentar conta, mesmo quando a cabeça não colabora.' },
  { classId: 'CLERIC', category: 'WELLBEING', difficulty: 'HARD', title: 'Ficar sem tela na última hora antes de dormir', why: 'A hora existe para o sono chegar, não para mais uma aba.' },
  { classId: 'BARD', category: 'CREATIVITY', difficulty: 'EASY', title: 'Escrever cinco linhas no diário', why: 'Cinco linhas. Não um texto.' },
  { classId: 'BARD', category: 'CREATIVITY', difficulty: 'MEDIUM', title: 'Praticar um idioma ou instrumento por 20 minutos', why: 'Em voz alta. Calado, o hábito não pega.' },
  { classId: 'BARD', category: 'CREATIVITY', difficulty: 'HARD', title: 'Mostrar para alguém algo que você fez', why: 'Uma frase, um áudio, um rascunho. O hábito é soltar pequeno.' }
];

export const CHALLENGE_EXAMPLES = [
  { category: 'STUDY', title: 'Ler o mesmo texto e trocar uma ideia', xpReward: 50, goldReward: 20, why: 'O combinado é o capítulo, não a maratona.' },
  { category: 'FITNESS', title: 'Caminhar 20 minutos hoje', xpReward: 50, goldReward: 20, why: 'Cada um no seu caminho. O desafio é sair.' },
  { category: 'PRODUCTIVITY', title: '25 minutos na tarefa mais importante, sem trocar de aba', xpReward: 25, goldReward: 10, why: 'Curto de propósito, para os dois começarem.' },
  { category: 'WELLBEING', title: 'Alongar 10 minutos e contar como foi', xpReward: 25, goldReward: 10, why: 'O relato impede que vire um alongamento imaginário.' },
  { category: 'CREATIVITY', title: 'Mandar uma mensagem de verdade, sem ser só um emoji', xpReward: 50, goldReward: 20, why: 'Uma frase para alguém de verdade.' }
];
