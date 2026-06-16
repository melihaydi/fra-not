import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Trophy,
  Edit2
} from 'lucide-react';
import type { Task, TaskStatus, UserStats } from '../types';
import confetti from 'canvas-confetti';

interface QuestBoardViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

export const QuestBoardView: React.FC<QuestBoardViewProps> = ({
  tasks,
  setTasks,
  setStats,
}) => {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskXp, setTaskXp] = useState(100);
  const [isQuest, setIsQuest] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Predefined Daily Quests pool in Turkish
  const dailyQuestsPool = [
    { title: "Kitap Oku (20 Sayfa)", description: "Zihnini beslemek için en az 20 sayfa kitap oku.", xp: 150 },
    { title: "Egzersiz Yap (30 Dk)", description: "Sağlıklı bir beden için 30 dakika yürüyüş, koşu veya spor yap.", xp: 200 },
    { title: "Kodlama Çalış / Proje Yap", description: "FVT projende veya yeni bir teknikte 1 saat geliştirme yap.", xp: 250 },
    { title: "Su Tüketimi (2.5 Litre)", description: "Gün boyunca en az 2.5 litre su içtiğinden emin ol.", xp: 120 },
    { title: "Portföy & Bütçe Kontrolü", description: "Yatırımlarını kontrol et ve harcamalarını kaydet.", xp: 150 },
    { title: "Yeni Bir Şey Öğren", description: "Bir makale oku veya 15 dakikalık eğitici bir video izle.", xp: 150 },
  ];

  // Award XP and Handle Level Up
  const handleXpGain = (xpReward: number) => {
    setStats(prev => {
      let newXp = Math.max(0, prev.xp + xpReward);
      let newLevel = prev.level;
      let xpToNext = prev.xpToNextLevel;
      let levelUpOccurred = false;

      while (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel += 1;
        xpToNext = Math.floor(xpToNext * 1.25); // Scaling difficulty
        levelUpOccurred = true;
      }

      if (levelUpOccurred) {
        // Trigger high-fidelity Confetti burst
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#c084fc', '#10b981', '#3b82f6', '#f59e0b']
        });
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: xpToNext,
        lastActiveDate: new Date().toISOString().split('T')[0]
      };
    });
  };

  // Move task status
  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        // Check if completing task to award XP
        if (newStatus === 'complete' && task.status !== 'complete') {
          handleXpGain(task.xpReward);
        }
        // Deduct XP if moving back from complete
        else if (task.status === 'complete' && newStatus !== 'complete') {
          handleXpGain(-task.xpReward);
        }

        return {
          ...task,
          status: newStatus
        };
      }
      return task;
    }));
  };

  // Add or Edit Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const finalXp = isQuest ? taskXp + 50 : taskXp;

    if (editingTaskId) {
      setTasks(prev => prev.map(t => {
        if (t.id === editingTaskId) {
          if (t.status === 'complete') {
            handleXpGain(finalXp - t.xpReward);
          }
          return {
            ...t,
            title: taskTitle,
            description: taskDesc,
            xpReward: finalXp,
            isQuest
          };
        }
        return t;
      }));
      setEditingTaskId(null);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle,
        description: taskDesc,
        status: 'todo',
        xpReward: finalXp,
        isQuest,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }

    setTaskTitle('');
    setTaskDesc('');
    setTaskXp(100);
    setIsQuest(false);
    setShowAddTaskModal(false);
  };

  const startEditTask = (task: Task) => {
    setTaskTitle(task.title);
    setTaskDesc(task.description);
    setTaskXp(task.isQuest ? task.xpReward - 50 : task.xpReward);
    setIsQuest(task.isQuest);
    setEditingTaskId(task.id);
    setShowAddTaskModal(true);
  };

  const openCreateModal = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskXp(100);
    setIsQuest(false);
    setEditingTaskId(null);
    setShowAddTaskModal(true);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string, currentStatus: TaskStatus, xpReward: number) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    // Deduct XP if deleting a completed task
    if (currentStatus === 'complete') {
      handleXpGain(-xpReward);
    }
  };

  // Generate 3 Daily Quests
  const handleGenerateDailyQuests = () => {
    // Pick 3 random unique quests from the pool
    const shuffled = [...dailyQuestsPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const newQuests: Task[] = selected.map((q, idx) => ({
      id: `daily-quest-${Date.now()}-${idx}`,
      title: `[GÜNLÜK QUEST] ${q.title}`,
      description: q.description,
      status: 'todo',
      xpReward: q.xp,
      isQuest: true,
      createdAt: new Date().toISOString(),
    }));

    setTasks(prev => {
      // Remove previous uncompleted daily quests to avoid clutter
      const filtered = prev.filter(t => !(t.isQuest && t.status !== 'complete'));
      return [...newQuests, ...filtered];
    });
  };

  // Filter tasks into columns
  const columns: { id: TaskStatus; title: string; colorClass: string }[] = [
    { id: 'todo', title: 'Yapılacaklar', colorClass: 'border-purple' },
    { id: 'inprogress', title: 'Devam Edenler', colorClass: 'border-orange' },
    { id: 'inreview', title: 'İncelemedekiler', colorClass: 'border-blue' },
    { id: 'complete', title: 'Tamamlananlar', colorClass: 'border-green' },
  ];

  return (
    <div className="quest-board-view fade-in">
      {/* Board Header Actions */}
      <div className="board-actions-header glass-panel">
        <div className="board-header-info">
          <h2>Quest Board & Görevler</h2>
          <p>Görevleri tamamla, seviye atla ve günlük serini koru!</p>
        </div>
        
        <div className="board-header-btns">
          <button className="btn-secondary" onClick={handleGenerateDailyQuests}>
            <RotateCcw size={16} />
            Günlük Questleri Yenile
          </button>
          
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Yeni Görev Oluştur
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="kanban-grid">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className={`kanban-column glass-panel ${col.colorClass}`}>
              <div className="column-header">
                <span className="column-title">{col.title}</span>
                <span className="column-count">{colTasks.length}</span>
              </div>
              
              <div className="column-task-list scrollable">
                {colTasks.length === 0 ? (
                  <div className="empty-column-state">
                    <CheckCircle2 size={24} className="text-muted" />
                    <span>Görev yok</span>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`task-card glass-panel ${task.isQuest ? 'quest-card' : ''}`}
                    >
                      {task.isQuest && (
                        <div className="quest-badge">
                          <Sparkles size={10} />
                          <span>DAILY QUEST</span>
                        </div>
                      )}
                      
                      <h4 className="task-card-title">{task.title}</h4>
                      {task.description && <p className="task-card-desc">{task.description}</p>}
                      
                      <div className="task-card-footer">
                        <div className="task-xp-reward" title="Kazanılacak XP">
                          <Trophy size={12} className="text-purple" />
                          <span>+{task.xpReward} XP</span>
                        </div>
                        
                        <div className="task-card-actions">
                          {col.id !== 'complete' && (
                            <button 
                              className="task-action-btn next"
                              onClick={() => {
                                const nextStatusMap: Record<TaskStatus, TaskStatus> = {
                                  todo: 'inprogress',
                                  inprogress: 'inreview',
                                  inreview: 'complete',
                                  complete: 'complete',
                                };
                                moveTask(task.id, nextStatusMap[col.id]);
                              }}
                              title="Sonraki Aşamaya Taşı"
                            >
                              <ArrowRight size={14} />
                            </button>
                          )}
                          
                          {col.id !== 'todo' && (
                            <button 
                              className="task-action-btn prev-stage"
                              onClick={() => {
                                const prevStatusMap: Record<TaskStatus, TaskStatus> = {
                                  todo: 'todo',
                                  inprogress: 'todo',
                                  inreview: 'inprogress',
                                  complete: 'inreview',
                                };
                                moveTask(task.id, prevStatusMap[col.id]);
                              }}
                              title="Önceki Aşamaya Taşı"
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                          
                          <button 
                            className="task-action-btn edit"
                            onClick={() => startEditTask(task)}
                            title="Görevi Düzenle"
                          >
                            <Edit2 size={12} />
                          </button>
                          
                          <button 
                            className="task-action-btn delete"
                            onClick={() => handleDeleteTask(task.id, task.status, task.xpReward)}
                            title="Görevi Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="modal-backdrop">
          <div className="modal-content fade-in">
            <h3>{editingTaskId ? 'Görevi Düzenle' : 'Yeni Görev / Quest Oluştur'}</h3>
            
            <form onSubmit={handleAddTask} className="add-task-form">
              <div className="form-group">
                <label>Görev Başlığı</label>
                <input 
                  type="text" 
                  placeholder="Görevin adını girin..." 
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <textarea 
                  placeholder="Görev detayları..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={isQuest}
                    onChange={(e) => setIsQuest(e.target.checked)}
                  />
                  <span>Gamified Daily Quest (Ekstra +50 XP kazandırır)</span>
                </label>
              </div>

              <div className="form-group">
                <label>Kazanılacak XP</label>
                <select 
                  value={taskXp} 
                  onChange={(e) => setTaskXp(Number(e.target.value))}
                >
                  <option value={50}>50 XP (Kolay Görev)</option>
                  <option value={100}>100 XP (Normal Görev)</option>
                  <option value={200}>200 XP (Zor Görev)</option>
                  <option value={350}>350 XP (Epik Görev)</option>
                </select>
              </div>

              <div className="modal-footer-btns">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowAddTaskModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .quest-board-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
          width: 100%;
        }

        .board-actions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
        }

        .board-header-info h2 {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .board-header-btns {
          display: flex;
          gap: 12px;
        }

        /* Kanban Layout */
        .kanban-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          flex: 1;
          min-height: 0; /* Important for inner scroll to work */
        }

        .kanban-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
          padding: 16px 12px;
          background: var(--bg-card);
          border-top: 4px solid var(--border);
        }

        .kanban-column.border-purple { border-top-color: var(--accent); }
        .kanban-column.border-orange { border-top-color: var(--accent-orange); }
        .kanban-column.border-blue { border-top-color: var(--accent-blue); }
        .kanban-column.border-green { border-top-color: var(--accent-green); }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }

        .column-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }

        .column-count {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .column-task-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 2px;
        }

        .empty-column-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100px;
          color: var(--text-muted);
          font-size: 12px;
          border: 1px dashed var(--border);
          border-radius: 8px;
        }

        /* Task Cards */
        .task-card {
          padding: 14px;
          background: var(--bg-card);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          text-align: left;
        }

        .task-card:hover {
          background: var(--bg-card-hover);
        }

        .quest-card {
          border-left: 3px solid var(--accent-orange);
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.08);
        }

        .quest-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--accent-orange-bg);
          color: var(--accent-orange);
          border: 1px solid rgba(249, 115, 22, 0.2);
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          align-self: flex-start;
        }

        .task-card-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .task-card-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .task-xp-reward {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-light);
        }

        .task-card-actions {
          display: flex;
          gap: 4px;
        }

        .task-action-btn {
          background: transparent;
          border: none;
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .task-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .task-action-btn.delete:hover {
          color: var(--accent-red);
          background: var(--accent-red-bg);
        }

        .task-action-btn.next {
          color: var(--accent-green);
          background: var(--accent-green-bg);
        }

        .task-action-btn.next:hover {
          background: var(--accent-green);
          color: white;
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-content {
          width: 450px;
          background: var(--bg-sidebar);
          padding: 28px;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          text-align: left;
        }

        .modal-content h3 {
          margin-bottom: 20px;
          font-size: 18px;
        }

        .add-task-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .checkbox-group {
          margin: 4px 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};
