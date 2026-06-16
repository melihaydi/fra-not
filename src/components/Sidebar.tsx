import React from 'react';
import { 
  BookOpen, 
  Sword, 
  Calendar, 
  Target, 
  TrendingUp, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import type { UserStats, CalendarEvent } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  events: CalendarEvent[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  stats,
  setStats,
  theme,
  setTheme,
  events,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Lütfen 2MB'dan küçük bir fotoğraf seçin.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setStats(prev => ({
            ...prev,
            avatarUrl: reader.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    { id: 'notes', label: 'Notlar (Notion)', icon: BookOpen, color: 'var(--accent)' },
    { id: 'quests', label: 'Quest Board (Görevler)', icon: Sword, color: 'var(--accent-orange)' },
    { id: 'agenda', label: 'Ajanda & Takvim', icon: Calendar, color: 'var(--accent-blue)' },
    { id: 'goals', label: 'Günlük/Haftalık Hedefler', icon: Target, color: 'var(--accent-purple-light)' },
    { id: 'portfolio', label: 'Yatırım Portföyü', icon: TrendingUp, color: 'var(--accent-green)' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Format date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate XP Percentage
  const xpPercentage = Math.min(100, Math.floor((stats.xp / stats.xpToNextLevel) * 100));

  // Get upcoming events
  const todayStr = today.toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(event => event.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <aside className="sidebar" style={{ width: isCollapsed ? '70px' : 'var(--sidebar-width)' }}>
      {/* Sidebar Top Section */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="logo-section">
            <img src="./logo.png" alt="Fra-NOT Logo" className="logo-img" style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'contain', marginRight: '2px' }} />
            <span className="logo-text">Fra-NOT</span>
          </div>
        )}
        <button 
          className="collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Hidden File Input for Avatar Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* RPG User Stats Section */}
      <div className="stats-box glass-panel">
        {isCollapsed ? (
          <div className="stats-box-collapsed">
            <div className="user-avatar" onClick={triggerPhotoUpload} title="Profil Fotoğrafı Yükle" style={{ width: '30px', height: '30px' }}>
              {stats.avatarUrl ? (
                <img src={stats.avatarUrl} alt="Avatar" className="avatar-img" />
              ) : (
                <span className="avatar-letter" style={{ fontSize: '12px' }}>{(stats.username || 'G').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="stats-badge-lvl">Lvl {stats.level}</span>
          </div>
        ) : (
          <div className="stats-box-expanded">
            <div className="user-profile-header">
              <div className="user-avatar" onClick={triggerPhotoUpload} title="Profil Fotoğrafı Yükle">
                {stats.avatarUrl ? (
                  <img src={stats.avatarUrl} alt="Avatar" className="avatar-img" />
                ) : (
                  <span className="avatar-letter">{(stats.username || 'G').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="user-meta">
                <span className="user-name">{stats.username || 'Gezgin Savaşçı'}</span>
                <span className="user-title">Seviye {stats.level}</span>
              </div>
            </div>
            
            <div className="xp-container">
              <div className="xp-bar-label">
                <span>XP: {stats.xp} / {stats.xpToNextLevel}</span>
                <span>{xpPercentage}%</span>
              </div>
              <div className="xp-progress-bg">
                <div 
                  className="xp-progress-fill" 
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentView(item.id)}
                  title={item.label}
                >
                  <Icon 
                    size={20} 
                    style={{ color: isActive ? 'white' : item.color }} 
                    className="nav-icon"
                  />
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  {isActive && !isCollapsed && <span className="active-dot" style={{ backgroundColor: item.color }} />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Upcoming events preview */}
      {!isCollapsed && upcomingEvents.length > 0 && (
        <div className="upcoming-events-sidebar">
          <h4 className="section-title">Yaklaşan Etkinlikler</h4>
          <div className="event-list-mini">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-item-mini">
                <div className="event-marker" style={{ backgroundColor: event.color || 'var(--accent)' }}></div>
                <div className="event-details-mini">
                  <span className="event-title-mini">{event.title}</span>
                  <span className="event-time-mini">
                    {new Date(event.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                    {event.startTime ? ` • ${event.startTime}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="date-display">
            <span className="date-label">BUGÜN</span>
            <span className="date-value">{formattedDate}</span>
          </div>
        )}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? "Light Mode" : "Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Internal component styling */}
      <style>{`
        .sidebar {
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 16px;
          height: 100%;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease;
          overflow: hidden;
          flex-shrink: 0;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          height: 32px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }

        .logo-icon {
          color: var(--accent);
          animation: logo-glow 3s infinite alternate;
        }

        @keyframes logo-glow {
          0% { filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.2)); }
          100% { filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.7)); }
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 16px;
          white-space: nowrap;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .collapse-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .collapse-btn:hover {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        /* Stats Box */
        .stats-box {
          padding: 12px;
          margin-bottom: 24px;
          border-radius: 12px;
          background-color: var(--bg-card);
          transition: all 0.3s ease;
        }

        .stats-box-collapsed {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          position: relative;
        }

        .stats-badge-lvl {
          font-weight: 700;
          font-family: var(--font-display);
          font-size: 10px;
          color: var(--text-secondary);
          background: var(--border);
          padding: 2px 6px;
          border-radius: 10px;
          white-space: nowrap;
        }

        .user-profile-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          position: relative;
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 14px;
          color: white;
          box-shadow: 0 4px 10px rgba(168, 85, 247, 0.15);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .user-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
          border-color: var(--accent);
        }

        .user-avatar::after {
          content: 'Yükle';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
          color: white;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .user-avatar:hover::after {
          opacity: 1;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .avatar-letter {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 16px;
          color: white;
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-title {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 1px;
        }

        .xp-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .xp-bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .xp-progress-bg {
          height: 6px;
          background-color: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }

        .xp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%);
          border-radius: 3px;
          transition: width 0.4s ease;
        }

        /* Nav List */
        .sidebar-nav {
          flex: 1;
          margin-bottom: 24px;
        }

        .sidebar-nav ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-link {
          width: 100%;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-link:hover {
          background-color: var(--bg-card);
        }

        .nav-link.active {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.25);
        }

        .nav-icon {
          transition: transform 0.2s;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-weight: 550;
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
          text-align: left;
        }

        .nav-link.active .nav-label {
          color: #fff;
          font-weight: 600;
        }

        .active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          position: absolute;
          right: 12px;
        }

        /* Upcoming events */
        .upcoming-events-sidebar {
          margin-top: auto;
          margin-bottom: 16px;
          padding: 0 4px;
        }

        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .event-list-mini {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .event-item-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
          border-left: 2px solid transparent;
        }

        .event-marker {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .event-details-mini {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .event-title-mini {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .event-time-mini {
          font-size: 10px;
          color: var(--text-muted);
        }

        /* Footer */
        .sidebar-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          height: 48px;
        }

        .date-display {
          display: flex;
          flex-direction: column;
        }

        .date-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }

        .date-value {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .theme-toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
        }

        .theme-toggle-btn:hover {
          background: var(--bg-card);
          color: var(--accent);
        }
      `}</style>
    </aside>
  );
};
