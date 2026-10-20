import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { ClassSurveyModal } from './components/ClassSurveyModal';
import { HabitManager } from './components/HabitManager';
import { HabitChallenges } from './components/HabitChallenges';
import { PartyChat } from './components/PartyChat';
import { ProfileModal } from './components/ProfileModal';
import { LegalModal } from './components/LegalModal';

const initialHabits = [
  { id: 'h1', title: 'Estudar C++ / WebSockets por 45 minutos', category: 'STUDY', difficulty: 'HARD', streak: 4, completedToday: false },
  { id: 'h2', title: 'Fazer 30 Flexões e Alongamento', category: 'FITNESS', difficulty: 'MEDIUM', streak: 2, completedToday: false },
  { id: 'h3', title: 'Meditar e Treinar Respiração (10 minutos)', category: 'WELLBEING', difficulty: 'EASY', streak: 7, completedToday: true }
];

export const App = () => {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState(initialHabits);
  const [activeTab, setActiveTab] = useState('quests');
  
  const [authModalMode, setAuthModalMode] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  // WebSockets Python Nativo (FastAPI)
  const wsRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([
    { userId: 'u1', username: 'CadeteArcano', characterClass: 'WIZARD', level: 3, stats: { int: 18, str: 10, dex: 12, wis: 14, cha: 11 } },
    { userId: 'u2', username: 'PaladinoColega', characterClass: 'WARRIOR', level: 2, stats: { int: 10, str: 18, dex: 12, wis: 10, cha: 11 } }
  ]);
  const [chatMessages, setChatMessages] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [feedLogs, setFeedLogs] = useState([]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (user) {
          socket.send(JSON.stringify({
            type: 'user_online',
            username: user.username,
            characterClass: user.characterClass,
            level: user.level,
            stats: user.stats
          }));
        }
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'online_users_list') {
          setOnlineUsers(data.users);
        } else if (data.type === 'receive_message') {
          setChatMessages(prev => [...prev, data]);
        } else if (data.type === 'new_challenge_broadcast') {
          setChallenges(prev => [...prev, data]);
        } else if (data.type === 'challenge_completed_broadcast') {
          setChallenges(prev => prev.map(c => c.id === data.challengeId ? { ...c, status: 'COMPLETED' } : c));
        } else if (data.type === 'system_feed') {
          setFeedLogs(prev => [data, ...prev]);
        }
      };

      return () => {
        socket.close();
      };
    } catch (err) {
      console.warn("WebSocket fallback:", err);
    }
  }, [user]);

  // Fluxo de Cadastro e Login
  const handleSuccessRegister = (regData) => {
    const newUser = {
      id: `u_${Date.now()}`,
      email: regData.email,
      username: regData.username,
      characterClass: 'UNASSIGNED',
      hasCompletedSurvey: false,
      level: 1,
      xp: 0,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      gold: 50,
      stats: { str: 10, int: 10, dex: 10, wis: 10, cha: 10 }
    };
    setUser(newUser);
    setAuthModalMode(null);
    setActiveTab('survey');
  };

  const handleSuccessLogin = (loginData) => {
    const existingUser = {
      id: `u_${Date.now()}`,
      email: loginData.email,
      username: loginData.username,
      characterClass: 'WIZARD',
      hasCompletedSurvey: true,
      level: 3,
      xp: 140,
      hp: 90,
      maxHp: 100,
      mana: 40,
      maxMana: 50,
      gold: 125,
      stats: { str: 10, int: 18, dex: 12, wis: 14, cha: 11 }
    };
    setUser(existingUser);
    setAuthModalMode(null);
    setActiveTab('quests');
  };

  const handleLogout = () => {
    setUser(null);
    setShowProfile(false);
    setActiveTab('quests');
  };

  const handleCompleteClassSurvey = (selectedClass) => {
    if (user) {
      setUser({
        ...user,
        characterClass: selectedClass,
        hasCompletedSurvey: true,
        stats: {
          ...user.stats,
          int: selectedClass === 'WIZARD' ? 18 : 10,
          str: selectedClass === 'WARRIOR' ? 18 : 10,
          dex: selectedClass === 'ROGUE' ? 18 : 10,
          wis: selectedClass === 'CLERIC' ? 18 : 10,
          cha: selectedClass === 'BARD' ? 18 : 10
        }
      });
    }
    setActiveTab('quests');
  };

  const handleSendChallenge = (toUsername, title, category, xpReward, goldReward) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && user) {
      wsRef.current.send(JSON.stringify({
        type: 'send_challenge',
        fromUsername: user.username,
        toUsername,
        title,
        category,
        xpReward,
        goldReward
      }));
    }
  };

  const handleCompleteChallenge = (challengeId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && user) {
      wsRef.current.send(JSON.stringify({
        type: 'complete_challenge',
        challengeId,
        completedBy: user.username
      }));

      const ch = challenges.find(c => c.id === challengeId);
      if (ch) {
        setUser(prev => prev ? {
          ...prev,
          xp: prev.xp + ch.xpReward,
          gold: prev.gold + ch.goldReward
        } : null);
      }
    }
  };

  const handleCompleteHabit = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const xpAdd = h.difficulty === 'EASY' ? 25 : h.difficulty === 'MEDIUM' ? 50 : 100;
        const goldAdd = h.difficulty === 'EASY' ? 10 : h.difficulty === 'MEDIUM' ? 20 : 45;
        
        if (user) {
          const newXp = user.xp + xpAdd;
          const xpNeed = user.level * 100;
          const levelUp = newXp >= xpNeed;

          setUser({
            ...user,
            xp: levelUp ? newXp - xpNeed : newXp,
            level: levelUp ? user.level + 1 : user.level,
            gold: user.gold + goldAdd
          });
        }
        return { ...h, completedToday: true, streak: h.streak + 1 };
      }
      return h;
    }));
  };

  const handleCreateHabit = (newH) => {
    const created = {
      id: `h_${Date.now()}`,
      ...newH,
      streak: 0,
      completedToday: false
    };
    setHabits(prev => [created, ...prev]);
  };

  const handleDeleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleGenerateAIQuests = async () => {
    const mockAIHabit = {
      id: `ai_${Date.now()}`,
      title: 'Ler 20 páginas de Arquitetura de Sistemas (Missão Mestre IA Python)',
      description: 'O Mestre da Masmorra gerou este hábito adaptativo.',
      category: 'STUDY',
      difficulty: 'HARD',
      streak: 0,
      completedToday: false
    };
    setHabits(prev => [mockAIHabit, ...prev]);
    alert("🧙‍♂️ O Mestre da Masmorra IA Python gerou uma nova missão!");
  };

  const handleSendMessage = (content) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && user) {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        username: user.username,
        content
      }));
    }
  };

  const handleExportGDPR = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, habits }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `heroi_dados_${user?.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab === 'challenges' ? 'raid' : activeTab}
        setActiveTab={(t) => setActiveTab(t === 'raid' ? 'challenges' : t)}
        openProfile={() => setShowProfile(true)}
        openLegal={() => setShowLegal(true)}
        openAuthLogin={() => setAuthModalMode('login')}
        openAuthSignup={() => setAuthModalMode('signup')}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, padding: '20px' }}>
        {!user && (
          <LandingPage
            onStartSignup={() => setAuthModalMode('signup')}
            onStartLogin={() => setAuthModalMode('login')}
          />
        )}

        {user && (!user.hasCompletedSurvey && user.characterClass === 'UNASSIGNED') && (
          <div style={{ maxWidth: '750px', margin: '40px auto' }}>
            <div style={{
              background: 'rgba(255, 107, 87, 0.15)',
              border: '1px solid #ff6b57',
              padding: '16px',
              borderRadius: '12px',
              color: '#ff6b57',
              textAlign: 'center',
              fontWeight: 'bold',
              marginBottom: '24px'
            }}>
              ✨ Bem-vindo ao HabitQuest! Responda ao questionário inicial abaixo para escolher sua Classe RPG.
            </div>
            <ClassSurveyModal onCompleteClass={handleCompleteClassSurvey} />
          </div>
        )}

        {user && (user.hasCompletedSurvey || user.characterClass !== 'UNASSIGNED') && (
          <>
            {activeTab === 'quests' && (
              <HabitManager
                habits={habits}
                onCompleteHabit={handleCompleteHabit}
                onCreateHabit={handleCreateHabit}
                onDeleteHabit={handleDeleteHabit}
                onGenerateAIQuests={handleGenerateAIQuests}
              />
            )}

            {activeTab === 'challenges' && (
              <HabitChallenges
                currentUser={user}
                onlineUsers={onlineUsers}
                onSendChallenge={handleSendChallenge}
                onCompleteChallenge={handleCompleteChallenge}
                challenges={challenges}
                feedLogs={feedLogs}
              />
            )}

            {activeTab === 'chat' && (
              <PartyChat
                messages={chatMessages}
                onlineUsers={onlineUsers}
                onSendMessage={handleSendMessage}
                currentUsername={user?.username || 'Herói'}
              />
            )}
          </>
        )}
      </main>

      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSuccessRegister={handleSuccessRegister}
          onSuccessLogin={handleSuccessLogin}
        />
      )}

      {showProfile && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onExportGDPR={handleExportGDPR}
          onLogout={handleLogout}
          onDeleteAccount={() => {
            setUser(null);
            setShowProfile(false);
            alert("Conta do Herói excluída com sucesso.");
          }}
        />
      )}

      {showLegal && (
        <LegalModal onClose={() => setShowLegal(false)} />
      )}

      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: '#64748b',
        fontSize: '0.82rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: '40px'
      }}>
        <i>This project has been created as part of the 42 curriculum by aline-arthur</i>
      </footer>
    </div>
  );
};
