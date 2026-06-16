import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { NotesView } from './components/NotesView';
import { QuestBoardView } from './components/QuestBoardView';
import { AgendaView } from './components/AgendaView';
import { GoalsView } from './components/GoalsView';
import { PortfolioView } from './components/PortfolioView';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { 
  UserStats, 
  Note, 
  Task, 
  CalendarEvent, 
  Goal, 
  Transaction 
} from './types';
import { X, Minus, Square } from 'lucide-react';

// Seed Data
const initialStats: UserStats = {
  level: 1,
  xp: 150,
  xpToNextLevel: 500,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0]
};

const initialNotes: Note[] = [
  {
    id: '1',
    title: '🚀 Fra-NOT Rehberi',
    content: `# Fra-NOT'a Hoş Geldiniz!
Bu uygulama, günlük aktivitelerinizi, yatırımlarınızı ve kişisel gelişiminizi tek bir yerden takip etmeniz için tasarlanmış yeni nesil bir çalışma alanıdır.

## 🌟 Sunulan Ana Özellikler:
1. **Notlar (Notion-like)**: Sayfalar oluşturun, hiyerarşik alt sayfalar ekleyin ve notlarınızı Markdown formatında biçimlendirin.
2. **Quest Board**: Tamamlanan her görev size **XP (Deneyim Puanı)** kazandırır. Seviye atlayarak karakterinizi geliştirin!
3. **Ajanda & Takvim**: Etkinliklerinizi planlayın ve gününüzü saat saat organize edin.
4. **Hedefler (Günlük/Haftalık)**: Alışkanlık takibi yapın ve SVG halkalarında gelişiminizi izleyin.
5. **Yatırım Portföyü**: Varlık alım satımlarınızı kaydedin. Gelişmiş area ve donut grafiklerle portföyünüzü ve kar/zararınızı inceleyin.

> [!NOTE]
> Yazmaya başlamak için sağ üstteki **Düzenle** moduna tıklayabilir veya sol panelden yeni bir sayfa ekleyebilirsiniz.`,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: '📝 Günlük Fikirler',
    content: `## Bugün aklıma gelenler:
- Elektron ve React ile masaüstü uygulamaları geliştirme sürecini blog yazısı yap.
- Portföyümü çeşitlendirmek için emtia ve borsa fonlarını araştır.
- Günlük 20 sayfa kitap okuma serisine devam et.`,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'İlk Görevini Tamamla! (Quest)',
    description: 'Quest Board özelliklerini test et ve ilk görevini tamamlayarak XP kazan.',
    status: 'todo',
    xpReward: 100,
    isQuest: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    title: 'Fra-NOT Arayüzünü İncele',
    description: 'Grafikleri, takvim görünümünü ve sidebarı kontrol et.',
    status: 'inprogress',
    xpReward: 50,
    isQuest: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 't3',
    title: 'Portföy Yapılandırması',
    description: 'Yatırım listesine BTC ve Apple hissesi işlemlerini ekle.',
    status: 'complete',
    xpReward: 150,
    isQuest: false,
    createdAt: new Date().toISOString()
  }
];

const initialEvents: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Proje Değerlendirmesi',
    description: 'Fra-NOT projesinin özelliklerinin gözden geçirilmesi.',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    color: 'var(--accent)'
  },
  {
    id: 'e2',
    title: 'Yatırım ve Finans Toplantısı',
    description: 'Haftalık portföy dağılımı ve kar durumunun kontrol edilmesi.',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: '14:00',
    endTime: '15:00',
    color: 'var(--accent-green)'
  }
];

const initialGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Su Tüketimi',
    targetValue: 3,
    currentValue: 1.5,
    unit: 'Litre',
    period: 'daily',
    category: 'Spor/Sağlık',
    createdAt: new Date().toISOString()
  },
  {
    id: 'g2',
    title: 'Kitap Oku',
    targetValue: 20,
    currentValue: 10,
    unit: 'Sayfa',
    period: 'daily',
    category: 'Eğitim',
    createdAt: new Date().toISOString()
  },
  {
    id: 'g3',
    title: 'Haftalık Yazılım Geliştirme',
    targetValue: 15,
    currentValue: 5,
    unit: 'Saat',
    period: 'weekly',
    category: 'İş/Kariyer',
    createdAt: new Date().toISOString()
  }
];

const initialTransactions: Transaction[] = [
  {
    id: 'tr1',
    assetSymbol: 'BTC',
    assetName: 'Bitcoin',
    type: 'buy',
    quantity: 0.15,
    price: 65000,
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0] // 4 days ago
  },
  {
    id: 'tr2',
    assetSymbol: 'AAPL',
    assetName: 'Apple Inc.',
    type: 'buy',
    quantity: 12,
    price: 175.5,
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0] // 2 days ago
  }
];

export default function App() {
  const isElectron = !!window.electronAPI;
  const [currentView, setCurrentView] = useState('notes');
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('fvt-theme', 'dark');
  const [usernameInput, setUsernameInput] = useState('');
  
  // App States with persistent LocalStorage hooks
  const [stats, setStats] = useLocalStorage<UserStats>('fvt-stats', initialStats);
  const [notes, setNotes] = useLocalStorage<Note[]>('fvt-notes', initialNotes);
  const [tasks, setTasks] = useLocalStorage<Task[]>('fvt-tasks', initialTasks);
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('fvt-events', initialEvents);
  const [goals, setGoals] = useLocalStorage<Goal[]>('fvt-goals', initialGoals);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('fvt-transactions', initialTransactions);

  // Set theme data-attribute on body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Window actions utilizing native Electron Preload methods
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.close();
    }
  };

  const handleStartOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setStats(prev => ({
      ...prev,
      username: usernameInput.trim()
    }));
  };

  // Render active workspace view
  const renderActiveView = () => {
    switch (currentView) {
      case 'notes':
        return <NotesView notes={notes} setNotes={setNotes} />;
      case 'quests':
        return <QuestBoardView tasks={tasks} setTasks={setTasks} setStats={setStats} />;
      case 'agenda':
        return <AgendaView events={events} setEvents={setEvents} />;
      case 'goals':
        return <GoalsView goals={goals} setGoals={setGoals} />;
      case 'portfolio':
        return <PortfolioView transactions={transactions} setTransactions={setTransactions} />;
      default:
        return <NotesView notes={notes} setNotes={setNotes} />;
    }
  };

  if (!stats.username) {
    return (
      <div className="onboarding-container" data-theme={theme}>
        <div className="onboarding-card glass-panel fade-in">
          <div className="onboarding-logo">
            <img src="./logo.png" alt="Fra-NOT Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '10px' }} />
            <h2>Fra-NOT</h2>
          </div>
          <p className="onboarding-desc">
            Çalışma alanınıza hoş geldiniz. Başlamadan önce kullanıcı adınızı girin:
          </p>
          <form onSubmit={handleStartOnboarding} className="onboarding-form">
            <input
              type="text"
              placeholder="Kullanıcı adınız..."
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              maxLength={20}
              required
              autoFocus
            />
            <button type="submit" className="btn-primary">
              Çalışma Alanını Başlat
            </button>
          </form>
        </div>
        
        <style>{`
          .onboarding-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100vw;
            height: 100vh;
            background-color: var(--bg-app);
            color: var(--text-primary);
          }
          .onboarding-card {
            width: 400px;
            padding: 36px 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            text-align: center;
            border-radius: 16px;
          }
          .onboarding-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }
          .onboarding-logo h2 {
            font-size: 24px;
            font-family: var(--font-display);
            background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent-light));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .onboarding-desc {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
          }
          .onboarding-form {
            display: flex;
            flex-direction: column;
            gap: 14px;
            width: 100%;
          }
          .onboarding-form input {
            width: 100%;
            padding: 10px 14px;
            font-size: 13px;
            text-align: center;
          }
          .onboarding-form button {
            width: 100%;
            justify-content: center;
            padding: 10px;
            font-size: 13px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`app-root ${!isElectron ? 'web-mode' : ''}`}>
      {/* Titlebar for Electron Frameless Mode */}
      <header className="titlebar">
        <div className="titlebar-title">
          <img src="./logo.png" alt="Fra-NOT Logo" style={{ width: '16px', height: '16px', marginRight: '6px', objectFit: 'contain' }} />
          <span>Fra-NOT</span>
        </div>
        <div className="titlebar-controls">
          <button className="titlebar-ctrl-btn minimize" onClick={handleMinimize} title="Küçült">
            <Minus size={10} />
          </button>
          <button className="titlebar-ctrl-btn maximize" onClick={handleMaximize} title="Ekranı Kapla">
            <Square size={8} />
          </button>
          <button className="titlebar-ctrl-btn close" onClick={handleClose} title="Kapat">
            <X size={10} />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="app-container">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          stats={stats} 
          setStats={setStats}
          theme={theme}
          setTheme={setTheme}
          events={events}
        />
        
        <main className="workspace-panel">
          {renderActiveView()}
        </main>
      </div>

      <style>{`
        .app-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        .web-mode {
          --titlebar-height: 0px;
        }

        .web-mode .titlebar {
          display: none;
        }

        /* Titlebar buttons */
        .titlebar-ctrl-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
        }

        .titlebar-ctrl-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .titlebar-ctrl-btn.close:hover {
          background: var(--accent-red);
          color: white;
        }
      `}</style>
    </div>
  );
}
