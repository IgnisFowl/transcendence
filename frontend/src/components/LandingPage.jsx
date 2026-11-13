import React, { useState } from 'react';
import { Sparkles, Sword, Shield, Trophy, Flame, ArrowRight, ChevronDown } from 'lucide-react';

export const LandingPage = ({ onStartSignup, onStartLogin }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "O que é o Side Quest e como funciona o onboarding?",
      a: "O Side Quest é um aplicativo gamificado no estilo RPG que transforma suas metas diárias (estudo, exercícios, produtividade) em missões. Ao acessar pela primeira vez, você faz seu cadastro e responde ao Questionário Inicial para descobrir sua Classe RPG."
    },
    {
      q: "O questionário inicial fica disponível para sempre?",
      a: "Ele aparece no primeiro acesso: seis cenas, sem resposta certa. Se duas classes ficam perto, uma última cena desempata e você confirma a ficha. Depois disso, missões, desafios e a Taverna abrem."
    },
    {
      q: "Como funcionam os desafios em dupla e a Taverna?",
      a: "Na Taverna você conversa em tempo real e vê quem está online, com classe e nível. Nos Desafios você manda uma missão para outro herói, e quem recebe ganha XP e ouro ao concluir."
    },
    {
      q: "Quais são as 5 Classes disponíveis no jogo?",
      a: "As classes são: Mago Arcano (focado em estudos/INT), Guerreiro de Elite (fitness/FOR), Ladino Estrategista (produtividade/DES), Clérigo Guardião (bem-estar/SAB) e Bardo Inspirador (criatividade/CAR)."
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 0 60px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', margin: '40px 0 70px' }}>
        <div className="hero-pill-badge" style={{ margin: '0 auto 20px' }}>
          <Sparkles size={16} /> O Rastreador de Hábitos Gamificado da 42 (JS + Python FastAPI)
        </div>

        <h1 className="font-rpg gradient-text title-glow" style={{ fontSize: '3.2rem', lineHeight: '1.15', marginBottom: '20px' }}>
          Transforme Sua Rotina Diária em uma Jornada RPG Épica
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '720px', margin: '0 auto 36px', lineHeight: '1.6' }}>
          Responda ao questionário inicial para descobrir sua classe, ganhe XP e ouro ao cumprir seus hábitos da vida real, e desafie seus colegas de guilda na Taverna!
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-paymark" onClick={onStartSignup} style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
            Começar Agora (Questionário Inicial) <ArrowRight size={18} />
          </button>
          <button className="btn-paymark-secondary" onClick={onStartLogin} style={{ fontSize: '1.05rem', padding: '16px 32px' }}>
            Já tenho uma conta (Entrar)
          </button>
        </div>
      </section>

      {/* Ticker / Metrics */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        margin: '60px 0'
      }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <Flame color="#ff6b57" size={32} style={{ marginBottom: '8px' }} />
          <h3 className="font-rpg" style={{ fontSize: '2rem', color: '#fff' }}>6 cenas</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>O teste lê o que você faria</p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <Shield color="#3b82f6" size={32} style={{ marginBottom: '8px' }} />
          <h3 className="font-rpg" style={{ fontSize: '2rem', color: '#fff' }}>5 Classes</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Mago, Guerreiro, Ladino, etc.</p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <Trophy color="#f59e0b" size={32} style={{ marginBottom: '8px' }} />
          <h3 className="font-rpg" style={{ fontSize: '2rem', color: '#fff' }}>FastAPI + WS</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Python Assíncrono em Tempo Real</p>
        </div>
      </section>

      {/* Accordion FAQ Paymark Style */}
      <section style={{ maxWidth: '800px', margin: '80px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 className="font-rpg title-glow" style={{ color: '#ffffff', fontSize: '2rem' }}>
            Perguntas Frequentes (FAQ)
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="glass-card"
              style={{ padding: '18px 24px', cursor: 'pointer', borderRadius: '14px' }}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: 0, fontWeight: 600 }}>
                  {faq.q}
                </h4>
                <ChevronDown 
                  size={20} 
                  color="#ff6b57" 
                  style={{ transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
                />
              </div>

              {openFaq === index && (
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '14px', lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
