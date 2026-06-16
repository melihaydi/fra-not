import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Target,
  Sparkles,
  BookOpen,
  Dumbbell,
  Laptop,
  Coins
} from 'lucide-react';
import type { Goal } from '../types';

interface GoalsViewProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, setGoals }) => {
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState(1);
  const [goalUnit, setGoalUnit] = useState('adet');
  const [goalPeriod, setGoalPeriod] = useState<'daily' | 'weekly'>('daily');
  const [goalCategory, setGoalCategory] = useState('Personal');

  const categories = [
    { name: 'Kişisel', icon: Sparkles, color: 'var(--accent)' },
    { name: 'Eğitim', icon: BookOpen, color: 'var(--accent-blue)' },
    { name: 'Spor/Sağlık', icon: Dumbbell, color: 'var(--accent-orange)' },
    { name: 'İş/Kariyer', icon: Laptop, color: 'var(--accent-purple-light)' },
    { name: 'Finans', icon: Coins, color: 'var(--accent-green)' },
  ];

  // Add Goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalTitle,
      targetValue: goalTarget,
      currentValue: 0,
      unit: goalUnit,
      period: goalPeriod,
      category: goalCategory,
      createdAt: new Date().toISOString()
    };

    setGoals(prev => [newGoal, ...prev]);
    setGoalTitle('');
    setGoalTarget(1);
    setGoalUnit('adet');
    setShowAddGoalModal(false);
  };

  // Delete Goal
  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Adjust Progress Value
  const handleAdjustValue = (id: string, amount: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const newValue = Math.max(0, Math.min(goal.targetValue, goal.currentValue + amount));
        return {
          ...goal,
          currentValue: parseFloat(newValue.toFixed(1))
        };
      }
      return goal;
    }));
  };

  // Render SVG Circular Progress
  const CircularProgress: React.FC<{ percentage: number; color: string }> = ({ percentage, color }) => {
    const radius = 26;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius; // ~163.36
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="circular-progress-wrapper">
        <svg width="64" height="64" viewBox="0 0 64 64">
          {/* Background Track */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Fill */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
            style={{ transition: 'stroke-dashoffset 0.35s' }}
          />
        </svg>
        <span className="circular-progress-text" style={{ color }}>
          {percentage}%
        </span>
      </div>
    );
  };

  const dailyGoals = goals.filter(g => g.period === 'daily');
  const weeklyGoals = goals.filter(g => g.period === 'weekly');

  const getCategoryTheme = (catName: string) => {
    const category = categories.find(c => c.name === catName) || categories[0];
    return {
      Icon: category.icon,
      color: category.color
    };
  };

  return (
    <div className="goals-view fade-in">
      {/* Goals Header Actions */}
      <div className="goals-actions-header glass-panel">
        <div className="goals-header-info">
          <h2>Günlük & Haftalık Hedefler</h2>
          <p>Kişisel alışkanlıklarını ve hedeflerini belirle, gelişimini takip et.</p>
        </div>
        
        <button className="btn-primary" onClick={() => setShowAddGoalModal(true)}>
          <Plus size={16} />
          Yeni Hedef Ekle
        </button>
      </div>

      <div className="goals-container">
        {/* Daily Goals Section */}
        <div className="goals-section-card glass-panel">
          <div className="section-title-bar">
            <h3>Günlük Hedefler</h3>
            <span className="badge-count purple">{dailyGoals.length}</span>
          </div>

          <div className="goals-list scrollable">
            {dailyGoals.length === 0 ? (
              <div className="empty-goals-state">
                <Target size={32} className="text-muted" />
                <p>Eklenmiş günlük hedef bulunmuyor.</p>
              </div>
            ) : (
              dailyGoals.map(goal => {
                const { Icon, color } = getCategoryTheme(goal.category);
                const pct = Math.round((goal.currentValue / goal.targetValue) * 100);
                const isCompleted = goal.currentValue === goal.targetValue;

                return (
                  <div key={goal.id} className={`goal-card glass-panel ${isCompleted ? 'completed-border' : ''}`}>
                    <div className="goal-card-left">
                      <div className="goal-icon-bg" style={{ backgroundColor: `${color}15`, color }}>
                        <Icon size={20} />
                      </div>
                      <div className="goal-info">
                        <span className="goal-title">{goal.title}</span>
                        <span className="goal-progress-nums">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                    </div>

                    <div className="goal-card-right">
                      {/* Interactive adjustment buttons */}
                      <div className="goal-adjust-btns">
                        <button 
                          className="adjust-btn minus" 
                          onClick={() => handleAdjustValue(goal.id, -1)}
                        >-</button>
                        <button 
                          className="adjust-btn plus" 
                          onClick={() => handleAdjustValue(goal.id, 1)}
                        >+</button>
                        {goal.targetValue >= 5 && (
                          <button 
                            className="adjust-btn plus-five" 
                            onClick={() => handleAdjustValue(goal.id, 5)}
                          >+5</button>
                        )}
                      </div>

                      <CircularProgress percentage={pct} color={color} />

                      <button 
                        className="delete-goal-btn" 
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Hedefi Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Goals Section */}
        <div className="goals-section-card glass-panel">
          <div className="section-title-bar">
            <h3>Haftalık Hedefler</h3>
            <span className="badge-count green">{weeklyGoals.length}</span>
          </div>

          <div className="goals-list scrollable">
            {weeklyGoals.length === 0 ? (
              <div className="empty-goals-state">
                <Target size={32} className="text-muted" />
                <p>Eklenmiş haftalık hedef bulunmuyor.</p>
              </div>
            ) : (
              weeklyGoals.map(goal => {
                const { Icon, color } = getCategoryTheme(goal.category);
                const pct = Math.round((goal.currentValue / goal.targetValue) * 100);
                const isCompleted = goal.currentValue === goal.targetValue;

                return (
                  <div key={goal.id} className={`goal-card glass-panel ${isCompleted ? 'completed-border' : ''}`}>
                    <div className="goal-card-left">
                      <div className="goal-icon-bg" style={{ backgroundColor: `${color}15`, color }}>
                        <Icon size={20} />
                      </div>
                      <div className="goal-info">
                        <span className="goal-title">{goal.title}</span>
                        <span className="goal-progress-nums">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                    </div>

                    <div className="goal-card-right">
                      {/* Interactive adjustment buttons */}
                      <div className="goal-adjust-btns">
                        <button 
                          className="adjust-btn minus" 
                          onClick={() => handleAdjustValue(goal.id, -1)}
                        >-</button>
                        <button 
                          className="adjust-btn plus" 
                          onClick={() => handleAdjustValue(goal.id, 1)}
                        >+</button>
                        {goal.targetValue >= 5 && (
                          <button 
                            className="adjust-btn plus-five" 
                            onClick={() => handleAdjustValue(goal.id, 5)}
                          >+5</button>
                        )}
                      </div>

                      <CircularProgress percentage={pct} color={color} />

                      <button 
                        className="delete-goal-btn" 
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Hedefi Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="modal-backdrop">
          <div className="modal-content fade-in">
            <h3>Yeni Alışkanlık / Hedef Belirle</h3>
            
            <form onSubmit={handleAddGoal} className="add-task-form">
              <div className="form-group">
                <label>Hedef Açıklaması</label>
                <input 
                  type="text" 
                  placeholder="Günde 2.5L su iç, Haftada 3 gün spor yap vb..." 
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="time-picker-row">
                <div className="form-group">
                  <label>Hedef Değer</label>
                  <input 
                    type="number" 
                    min={1}
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(Number(e.target.value))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Birim</label>
                  <input 
                    type="text" 
                    placeholder="Litre, sayfa, adet, dk..." 
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Periyot</label>
                <select 
                  value={goalPeriod} 
                  onChange={(e) => setGoalPeriod(e.target.value as 'daily' | 'weekly')}
                >
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                </select>
              </div>

              <div className="form-group">
                <label>Kategori</label>
                <select 
                  value={goalCategory} 
                  onChange={(e) => setGoalCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer-btns">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowAddGoalModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Hedef Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .goals-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
          width: 100%;
        }

        .goals-actions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
        }

        .goals-header-info h2 {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .goals-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          flex: 1;
          min-height: 0;
        }

        .goals-section-card {
          display: flex;
          flex-direction: column;
          padding: 20px;
          height: 100%;
        }

        .section-title-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }

        .section-title-bar h3 {
          font-size: 16px;
        }

        .badge-count {
          font-size: 11px;
          font-weight: 700;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .badge-count.purple { background-color: var(--accent); }
        .badge-count.green { background-color: var(--accent-green); }

        .goals-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 2px;
        }

        .empty-goals-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 180px;
          color: var(--text-muted);
          border: 1px dashed var(--border);
          border-radius: 12px;
        }

        /* Goal Card */
        .goal-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: var(--bg-card);
          transition: border-color 0.3s;
          text-align: left;
        }

        .goal-card.completed-border {
          border-left: 3px solid var(--accent-green);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.08);
        }

        .goal-card-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .goal-icon-bg {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .goal-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .goal-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        .goal-progress-nums {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .goal-card-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .goal-adjust-btns {
          display: flex;
          gap: 4px;
        }

        .adjust-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-primary);
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .adjust-btn:hover {
          border-color: var(--accent);
          background: var(--bg-card-hover);
        }

        .adjust-btn.plus-five {
          font-size: 10px;
        }

        /* SVG Circular Progress Styles */
        .circular-progress-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
        }

        .circular-progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: 700;
        }

        .delete-goal-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .delete-goal-btn:hover {
          color: var(--accent-red);
          background: var(--accent-red-bg);
        }
      `}</style>
    </div>
  );
};
