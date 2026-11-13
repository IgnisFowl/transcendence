import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { ClassSurveyModal } from './components/ClassSurveyModal';
import { HabitManager } from './components/HabitManager';
import { HabitChallenges } from './components/HabitChallenges';
import { PartyChat } from './components/PartyChat';
import { ProfilePage } from './components/ProfilePage';
import { LegalModal } from './components/LegalModal';
import { Leaderboard } from './components/Leaderboard';
import { AdminDesk } from './components/AdminDesk';
import { api, getToken, setToken } from './api';

export const App = () => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState([]);
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [feedLogs, setFeedLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [staffAccounts, setStaffAccounts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('quests');
  const [authModalMode, setAuthModalMode] = useState(null);
  const [profileSubject, setProfileSubject] = useState(null);
  const [showLegal, setShowLegal] = useState(false);

  const pushToast = (text) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 4200);
  };

  const showUnlocks = (unlocked, leveled) => {
    if (unlocked?.length) {
      setUser((prev) => {
        if (!prev) return prev;
        const known = new Set((prev.achievements || []).map((item) => item.id));
        const extra = unlocked.filter((item) => !known.has(item.id));
        return extra.length ? { ...prev, achievements: [...(prev.achievements || []), ...extra] } : prev;
      });
      unlocked.forEach((item) => pushToast(`Conquista desbloqueada: ${item.title}`));
    }
    if (leveled) pushToast('Você subiu de nível.');
  };

  const rememberNotification = (notification) => {
    if (!notification) return;
    setNotifications((prev) => prev.some((item) => item.id === notification.id) ? prev : [notification, ...prev]);
  };

  const loadWorld = async () => {
    const [habitRows, friendRows, messages, notes, ranks, mailbox, challengeRows] = await Promise.all([
      api('/api/habits'),
      api('/api/friends'),
      api('/api/chat'),
      api('/api/notifications'),
      api('/api/leaderboard'),
      api('/api/me/emails'),
      api('/api/challenges')
    ]);
    setHabits(habitRows);
    setFriends(friendRows);
    setChatMessages(messages);
    setNotifications(notes);
    setLeaderboard(ranks);
    setEmails(mailbox);
    setChallenges(challengeRows);
  };

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api('/api/me')
      .then(async (me) => {
        setUser(me);
        if (me.role === 'guest') setActiveTab('ranking');
        await loadWorld();
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'auth', token: getToken() }));
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'online_users_list') {
        setOnlineUsers(data.users || []);
      } else if (data.type === 'receive_message') {
        setChatMessages((prev) => prev.some((item) => item.id === data.id) ? prev : [...prev, data]);
      } else if (data.type === 'new_challenge_broadcast') {
        setChallenges((prev) => prev.some((item) => item.id === data.id) ? prev : [data, ...prev]);
      } else if (data.type === 'challenge_completed_broadcast') {
        setChallenges((prev) => prev.map((item) => item.id === data.challengeId ? { ...item, status: 'COMPLETED' } : item));
      } else if (data.type === 'challenge_cancelled_broadcast') {
        setChallenges((prev) => prev.map((item) => item.id === data.challengeId ? { ...item, status: 'CANCELLED' } : item));
        if (data.refundedTo) {
          setUser((prev) => prev && prev.username === data.refundedTo ? { ...prev, gold: data.gold } : prev);
        }
      } else if (data.type === 'system_feed') {
        setFeedLogs((prev) => [data, ...prev].slice(0, 20));
      } else if (data.type === 'message_deleted') {
        setChatMessages((prev) => prev.filter((item) => item.id !== data.id));
      } else if (data.type === 'notification') {
        rememberNotification(data.notification);
        if (data.notification.entity === 'friend') {
          api('/api/friends').then(setFriends).catch(() => {});
        }
      }
    };
    return () => socket.close();
  }, [user?.id]);

  const acceptSession = async (result) => {
    setToken(result.token);
    setUser(result.user);
    setAuthModalMode(null);
    await loadWorld();
    if (result.user.role === 'guest') setActiveTab('ranking');
    else if (!result.user.hasCompletedSurvey && result.user.characterClass === 'UNASSIGNED') setActiveTab('survey');
  };

  const handleSuccessRegister = (data) => api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(acceptSession);

  const handleSuccessLogin = (data) => api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(acceptSession);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setHabits([]);
    setFriends([]);
    setChatMessages([]);
    setChallenges([]);
    setNotifications([]);
    setProfileSubject(null);
    setActiveTab('quests');
  };

  const run = async (action) => {
    try {
      await action();
      return true;
    } catch (err) {
      pushToast(err.message || 'Não foi possível concluir a ação.');
      return false;
    }
  };

  const handleCompleteClassSurvey = async (selectedClass) => {
    const names = {
      WIZARD: 'Mago Arcano',
      WARRIOR: 'Guerreiro de Elite',
      ROGUE: 'Ladino Estrategista',
      CLERIC: 'Clérigo Guardião',
      BARD: 'Bardo Inspirador'
    };
    try {
      const updated = await api('/api/user/survey', {
        method: 'POST',
        body: JSON.stringify({ character_class: selectedClass })
      });
      setUser(updated);
      setActiveTab('quests');
      pushToast(`${names[selectedClass] || 'Classe'} definida. Missões dessa categoria rendem XP extra.`);
    } catch (err) {
      pushToast(err.message || 'Não foi possível concluir a ação.');
      throw err;
    }
  };

  const handleCreateHabit = (draft) => run(async () => {
    const result = await api('/api/habits', { method: 'POST', body: JSON.stringify(draft) });
    setHabits((prev) => [result.habit, ...prev]);
    showUnlocks(result.unlocked, false);
    api('/api/notifications').then(setNotifications).catch(() => {});
  });

  const handleDeleteHabit = (id) => run(async () => {
    await api(`/api/habits/${id}`, { method: 'DELETE' });
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
    api('/api/notifications').then(setNotifications).catch(() => {});
  });

  const handleCompleteHabit = (id) => run(async () => {
    const result = await api(`/api/habits/${id}/complete`, { method: 'POST' });
    setHabits((prev) => prev.map((habit) => habit.id === id ? result.habit : habit));
    setUser(result.user);
    showUnlocks(result.unlocked, result.leveled);
    const parts = [];
    if (result.classBonus) parts.push(`${result.classBonus} da classe`);
    if (result.streakBonus) parts.push(`${result.streakBonus} da ofensiva`);
    const bonus = parts.length ? ` (${parts.join(', ')})` : '';
    pushToast(`+${result.xp} XP${bonus} e +${result.gold} ouro`);
    api('/api/leaderboard').then(setLeaderboard).catch(() => {});
    api('/api/notifications').then(setNotifications).catch(() => {});
  });

  const handleSendMessage = (content) => run(async () => {
    const result = await api('/api/chat', { method: 'POST', body: JSON.stringify({ content }) });
    setChatMessages((prev) => prev.some((item) => item.id === result.message.id) ? prev : [...prev, result.message]);
    showUnlocks(result.unlocked, false);
  });

  const refreshFriends = () => api('/api/friends').then(setFriends).catch(() => {});

  const handleAddFriend = (friendUser) => run(async () => {
    const result = await api('/api/friends', {
      method: 'POST',
      body: JSON.stringify({ username: friendUser.username || friendUser })
    });
    await refreshFriends();
    showUnlocks(result.unlocked, false);
    pushToast(`${friendUser.username || friendUser} agora é seu aliado.`);
  });

  const handleRemoveFriend = (username) => run(async () => {
    await api(`/api/friends/${encodeURIComponent(username)}`, { method: 'DELETE' });
    await refreshFriends();
    pushToast(`${username} saiu da sua lista.`);
  });

  const handleSendChallenge = (toUsername, title, category, xpReward, goldReward) => run(async () => {
    const result = await api('/api/challenges', {
      method: 'POST',
      body: JSON.stringify({ toUsername, title, category, xpReward: Number(xpReward), goldReward: Number(goldReward) })
    });
    setUser(result.user);
    setChallenges((prev) => prev.some((item) => item.id === result.challenge.id) ? prev : [result.challenge, ...prev]);
    pushToast(`Desafio enviado. ${goldReward} de ouro saíram da bolsa.`);
  });

  const handleCancelChallenge = (challengeId) => run(async () => {
    const result = await api(`/api/challenges/${challengeId}/cancel`, { method: 'POST' });
    setUser(result.user);
    setChallenges((prev) => prev.map((item) => item.id === challengeId ? result.challenge : item));
    pushToast(`${result.challenge.goldReward} de ouro voltaram para a bolsa.`);
  });

  const handleCompleteChallenge = (challengeId) => run(async () => {
    const result = await api(`/api/challenges/${challengeId}/complete`, { method: 'POST' });
    setUser(result.user);
    setChallenges((prev) => prev.map((item) => item.id === challengeId ? result.challenge : item));
    showUnlocks(result.unlocked, result.leveled);
    api('/api/leaderboard').then(setLeaderboard).catch(() => {});
  });

  const handleExportGDPR = () => run(async () => {
    const result = await api('/api/me/export');
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `side-quest-${user.username}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setEmails((prev) => [result.email, ...prev]);
    pushToast(`E-mail de confirmação registrado para ${result.email.to}.`);
  });

  const handleDeleteAccount = (confirmation) => run(async () => {
    const result = await api('/api/me', {
      method: 'DELETE',
      body: JSON.stringify({ confirmation })
    });
    pushToast(`E-mail de confirmação: ${result.email.subject}`);
    handleLogout();
  });

  const handleSaveProfile = (bio) => run(async () => {
    const updated = await api('/api/me', { method: 'PUT', body: JSON.stringify({ bio }) });
    setUser(updated);
    pushToast('Perfil atualizado.');
  });

  const handleOpenProfile = (username) => run(async () => {
    if (!username || username === user.username) {
      setProfileSubject(null);
    } else {
      const hero = await api(`/api/users/${encodeURIComponent(username)}`);
      setProfileSubject(hero);
    }
    setActiveTab('profile');
  });

  const handleAvatarChange = (updated) => {
    setUser(updated);
    setProfileSubject(null);
  };

  const handleResetAvatar = () => run(async () => {
    const updated = await api('/api/me/avatar', { method: 'DELETE' });
    setUser(updated);
    pushToast('Avatar padrão restaurado.');
  });

  const handleMarkNotificationsRead = async () => {
    await api('/api/notifications/read', { method: 'POST' });
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const loadStaff = () => api('/api/admin/users').then(setStaffAccounts).catch(() => {});

  useEffect(() => {
    if (activeTab === 'mesa' && (user?.role === 'admin' || user?.role === 'moderator')) {
      loadStaff();
    }
  }, [activeTab, user?.role]);

  const handleCreateAccount = (draft) => run(async () => {
    await api('/api/admin/users', { method: 'POST', body: JSON.stringify(draft) });
    await loadStaff();
    pushToast(`Conta ${draft.username} criada como ${draft.role}.`);
  });

  const handleUpdateAccount = (id, draft) => run(async () => {
    const updated = await api(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(draft) });
    setStaffAccounts((prev) => prev.map((item) => item.id === id ? updated : item));
    if (updated.id === user.id) setUser((prev) => prev ? { ...prev, role: updated.role, bio: updated.bio } : prev);
    pushToast(`Conta ${updated.username} atualizada.`);
  });

  const handleStaffDelete = (id) => run(async () => {
    await api(`/api/admin/users/${id}`, { method: 'DELETE' });
    setStaffAccounts((prev) => prev.filter((item) => item.id !== id));
    pushToast('Conta excluída.');
  });

  const friendsLive = friends.map((friend) => ({
    ...friend,
    isOnline: onlineUsers.some((online) => online.username === friend.username)
  }));
  const surveyed = user && (user.role === 'guest' || user.hasCompletedSurvey || user.characterClass !== 'UNASSIGNED');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab === 'challenges' ? 'raid' : activeTab}
        setActiveTab={(tab) => setActiveTab(tab === 'raid' ? 'challenges' : tab)}
        openProfile={() => handleOpenProfile(user?.username)}
        openLegal={() => setShowLegal(true)}
        openAuthLogin={() => setAuthModalMode('login')}
        openAuthSignup={() => setAuthModalMode('signup')}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      <main style={{ flex: 1, padding: '20px' }}>
        {!ready && <p style={{ textAlign: 'center', color: '#94a3b8' }}>Carregando Side Quest...</p>}

        {ready && !user && (
          <LandingPage
            onStartSignup={() => setAuthModalMode('signup')}
            onStartLogin={() => setAuthModalMode('login')}
          />
        )}

        {user && !surveyed && (
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
              Seis cenas do seu dia. O teste lê o que você faria, e se duas classes ficarem perto, uma última cena decide.
            </div>
            <ClassSurveyModal onCompleteClass={handleCompleteClassSurvey} />
          </div>
        )}

        {user && surveyed && (
          <>
            {activeTab === 'mesa' && (user.role === 'admin' || user.role === 'moderator') && (
              <AdminDesk
                accounts={staffAccounts}
                currentUser={user}
                canManage={user.role === 'admin'}
                onCreate={handleCreateAccount}
                onUpdate={handleUpdateAccount}
                onDelete={handleStaffDelete}
              />
            )}
            {activeTab === 'quests' && user.role !== 'guest' && (
              <HabitManager
                habits={habits}
                characterClass={user.characterClass}
                onCompleteHabit={handleCompleteHabit}
                onCreateHabit={handleCreateHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            )}
            {activeTab === 'challenges' && user.role !== 'guest' && (
              <HabitChallenges
                currentUser={user}
                onlineUsers={onlineUsers}
                onSendChallenge={handleSendChallenge}
                onCompleteChallenge={handleCompleteChallenge}
                onCancelChallenge={handleCancelChallenge}
                challenges={challenges}
                feedLogs={feedLogs}
              />
            )}
            {activeTab === 'chat' && (
              <PartyChat
                messages={chatMessages}
                onlineUsers={onlineUsers}
                onSendMessage={handleSendMessage}
                currentUsername={user.username}
                friends={friendsLive}
                onAddFriend={handleAddFriend}
                onRemoveFriend={handleRemoveFriend}
                onOpenProfile={handleOpenProfile}
                canPlay={user.role !== 'guest'}
                canModerate={user.role === 'admin' || user.role === 'moderator'}
                onDeleteMessage={(id) => run(async () => {
                  await api(`/api/chat/${id}`, { method: 'DELETE' });
                  setChatMessages((prev) => prev.filter((item) => item.id !== id));
                })}
              />
            )}
            {activeTab === 'ranking' && <Leaderboard rows={leaderboard} />}
            {activeTab === 'profile' && (
              <ProfilePage
                user={profileSubject || user}
                isSelf={!profileSubject || profileSubject.username === user.username}
                friends={friendsLive}
                emails={emails}
                onSaveProfile={handleSaveProfile}
                onExport={handleExportGDPR}
                onDelete={handleDeleteAccount}
                onLogout={handleLogout}
                onAvatarChange={handleAvatarChange}
                onResetAvatar={handleResetAvatar}
                onOpenFriend={handleOpenProfile}
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

      {showLegal && <LegalModal onClose={() => setShowLegal(false)} />}

      <div style={{ position: 'fixed', right: '16px', bottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 80 }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="glass-card" style={{ padding: '12px 16px', width: '280px' }}>
            {toast.text}
          </div>
        ))}
      </div>

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
