import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  FileText,
  CalendarDays,
  Edit2
} from 'lucide-react';
import type { CalendarEvent } from '../types';

interface AgendaViewProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ events, setEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');
  const [eventColor, setEventColor] = useState('var(--accent)');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Calendar Math
  const calendarCells = useMemo(() => {
    // Starting day of the month (1st of month)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Shift index to make Monday index 0:
    // Sunday (0) -> 6, Monday (1) -> 0, Tuesday (2) -> 1 ...
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Total days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Total days in previous month
    const prevTotalDays = new Date(year, month, 0).getDate();

    const cells: Date[] = [];
    
    // Add previous month filler days
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push(new Date(year, month - 1, prevTotalDays - i));
    }

    // Add current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push(new Date(year, month, i));
    }

    // Add next month filler days to complete the 6-row grid (42 cells)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push(new Date(year, month + 1, i));
    }

    return cells;
  }, [year, month]);

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    // Sort day events by start time
    Object.keys(map).forEach(date => {
      map[date].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    });
    return map;
  }, [events]);

  // Handle Event Creation/Edition
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    if (editingEventId) {
      setEvents(prev => prev.map(ev => {
        if (ev.id === editingEventId) {
          return {
            ...ev,
            title: eventTitle,
            description: eventDesc,
            startTime: eventStartTime,
            endTime: eventEndTime,
            color: eventColor,
          };
        }
        return ev;
      }));
      setEditingEventId(null);
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        description: eventDesc,
        date: selectedDateStr,
        startTime: eventStartTime,
        endTime: eventEndTime,
        color: eventColor,
      };
      setEvents(prev => [...prev, newEvent]);
    }

    setEventTitle('');
    setEventDesc('');
    setEventStartTime('09:00');
    setEventEndTime('10:00');
    setShowEventModal(false);
  };

  const startEditEvent = (event: CalendarEvent) => {
    setEventTitle(event.title);
    setEventDesc(event.description || '');
    setEventStartTime(event.startTime || '09:00');
    setEventEndTime(event.endTime || '10:00');
    setEventColor(event.color || 'var(--accent)');
    setEditingEventId(event.id);
    setShowEventModal(true);
  };

  const openCreateEventModal = () => {
    setEventTitle('');
    setEventDesc('');
    setEventStartTime('09:00');
    setEventEndTime('10:00');
    setEventColor('var(--accent)');
    setEditingEventId(null);
    setShowEventModal(true);
  };

  // Delete Event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // Current day details
  const selectedDayEvents = eventsByDate[selectedDateStr] || [];
  const parsedSelectedDate = new Date(selectedDateStr);

  return (
    <div className="agenda-view fade-in">
      <div className="agenda-container">
        {/* Calendar Card */}
        <div className="calendar-panel glass-panel">
          <div className="calendar-header">
            <div className="month-display">
              <CalendarDays className="month-icon text-purple" />
              <h3>{monthNames[month]} {year}</h3>
            </div>
            
            <div className="calendar-nav-btns">
              <button className="nav-btn" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
              <button className="nav-btn-today" onClick={() => {
                setCurrentDate(new Date());
                setSelectedDateStr(new Date().toISOString().split('T')[0]);
              }}>Bugün</button>
              <button className="nav-btn" onClick={handleNextMonth}><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="calendar-week-header">
            {weekDays.map(day => (
              <div key={day} className="week-day-name">{day}</div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="calendar-grid-cells">
            {calendarCells.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDateStr;
              const isCurrentMonth = date.getMonth() === month;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const cellEvents = eventsByDate[dateStr] || [];

              return (
                <div 
                  key={index} 
                  className={`calendar-cell ${isCurrentMonth ? '' : 'outside-month'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                >
                  <div className="cell-day-num">{date.getDate()}</div>
                  
                  <div className="cell-events-list">
                    {cellEvents.slice(0, 3).map(event => (
                      <div 
                        key={event.id} 
                        className="cell-event-badge" 
                        style={{ borderLeftColor: event.color || 'var(--accent)' }}
                        title={`${event.startTime ? event.startTime + ' - ' : ''}${event.title}`}
                      >
                        {event.startTime && <span className="cell-event-time">{event.startTime}</span>}
                        <span className="cell-event-title">{event.title}</span>
                      </div>
                    ))}
                    {cellEvents.length > 3 && (
                      <div className="cell-events-more">+{cellEvents.length - 3} daha</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Daily Details */}
        <div className="details-panel glass-panel">
          <div className="details-header">
            <h4>{parsedSelectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</h4>
            <button className="btn-icon-primary" onClick={openCreateEventModal} title="Etkinlik Ekle">
              <Plus size={16} />
            </button>
          </div>

          <div className="daily-schedule scrollable">
            {selectedDayEvents.length === 0 ? (
              <div className="empty-agenda-state">
                <Clock size={36} className="text-muted" />
                <p>Bu gün için planlanmış etkinlik veya randevu yok.</p>
                <button className="btn-secondary btn-sm" onClick={openCreateEventModal}>
                  İlk Planını Ekle
                </button>
              </div>
            ) : (
              <div className="agenda-timeline">
                {selectedDayEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="agenda-event-card"
                    style={{ borderLeftColor: event.color || 'var(--accent)' }}
                  >
                    <div className="event-card-header">
                      <div className="event-time-span">
                        <Clock size={12} />
                        <span>{event.startTime || '00:00'} - {event.endTime || '00:00'}</span>
                      </div>
                      <div className="event-card-actions">
                        <button 
                          className="edit-event-btn" 
                          onClick={() => startEditEvent(event)}
                          title="Etkinliği Düzenle"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          className="delete-event-btn" 
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Etkinliği Sil"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="event-card-title">{event.title}</h4>
                    {event.description && (
                      <p className="event-card-desc">
                        <FileText size={11} className="inline-icon" />
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="modal-backdrop">
          <div className="modal-content fade-in">
            <h3>{editingEventId ? 'Etkinliği Düzenle' : 'Etkinlik / Randevu Ekle'}</h3>
            <p className="modal-subtitle">Tarih: {parsedSelectedDate.toLocaleDateString('tr-TR')}</p>
            
            <form onSubmit={handleAddEvent} className="add-task-form">
              <div className="form-group">
                <label>Etkinlik Adı</label>
                <input 
                  type="text" 
                  placeholder="Toplantı, ders, spor vb..." 
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Açıklama (İsteğe Bağlı)</label>
                <textarea 
                  placeholder="Toplantı linki, oda numarası veya notlar..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="time-picker-row">
                <div className="form-group">
                  <label>Başlangıç Saati</label>
                  <input 
                    type="time" 
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Bitiş Saati</label>
                  <input 
                    type="time" 
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Etiket Rengi</label>
                <div className="color-selector">
                  {[
                    { val: 'var(--accent)', label: 'Mor' },
                    { val: 'var(--accent-orange)', label: 'Turuncu' },
                    { val: 'var(--accent-blue)', label: 'Mavi' },
                    { val: 'var(--accent-green)', label: 'Yeşil' },
                    { val: 'var(--accent-red)', label: 'Kırmızı' }
                  ].map(colorObj => (
                    <button
                      key={colorObj.val}
                      type="button"
                      className={`color-btn-dot ${eventColor === colorObj.val ? 'selected' : ''}`}
                      style={{ backgroundColor: colorObj.val }}
                      onClick={() => setEventColor(colorObj.val)}
                      title={colorObj.label}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-footer-btns">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowEventModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .agenda-view {
          height: 100%;
          width: 100%;
        }

        .agenda-container {
          display: flex;
          gap: 20px;
          height: 100%;
        }

        .calendar-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          height: 100%;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .month-display {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .month-icon {
          width: 22px;
          height: 22px;
        }

        .calendar-nav-btns {
          display: flex;
          gap: 6px;
        }

        .nav-btn {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent);
        }

        .nav-btn-today {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .nav-btn-today:hover {
          background: var(--bg-card-hover);
        }

        /* Calendar Grid */
        .calendar-week-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: 700;
          font-size: 12px;
          color: var(--text-muted);
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
        }

        .week-day-name {
          padding: 6px 0;
        }

        .calendar-grid-cells {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(6, 1fr);
          flex: 1;
          margin-top: 4px;
        }

        .calendar-cell {
          border-right: 1px solid rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
          transition: background 0.15s ease;
          min-height: 0;
        }

        .calendar-cell:nth-child(7n) {
          border-right: none;
        }

        .calendar-cell:nth-last-child(-n+7) {
          border-bottom: none;
        }

        .calendar-cell:hover {
          background: var(--bg-card-hover);
        }

        .calendar-cell.outside-month {
          opacity: 0.3;
        }

        .calendar-cell.selected {
          background: var(--accent-bg);
          box-shadow: inset 0 0 0 1px var(--accent);
          border-radius: 4px;
        }

        .calendar-cell.today {
          background: rgba(168, 85, 247, 0.05);
        }

        .calendar-cell.today .cell-day-num {
          background: var(--accent);
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .cell-day-num {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .cell-events-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          overflow: hidden;
        }

        .cell-event-badge {
          border-left: 2px solid;
          background: rgba(255, 255, 255, 0.02);
          padding: 1px 4px;
          font-size: 9px;
          border-radius: 2px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          gap: 3px;
        }

        .cell-event-time {
          font-weight: 700;
          opacity: 0.8;
        }

        .cell-event-title {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cell-events-more {
          font-size: 8px;
          font-weight: 700;
          color: var(--text-muted);
          padding-left: 4px;
        }

        /* Details Sidebar Panel */
        .details-panel {
          width: 340px;
          display: flex;
          flex-direction: column;
          padding: 20px;
          height: 100%;
          flex-shrink: 0;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }

        .details-header h4 {
          font-size: 15px;
          text-align: left;
        }

        .daily-schedule {
          flex: 1;
          overflow-y: auto;
          padding-right: 2px;
        }

        .empty-agenda-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 200px;
          color: var(--text-muted);
          text-align: center;
        }

        .empty-agenda-state p {
          font-size: 13px;
          max-width: 200px;
        }

        .agenda-timeline {
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
        }

        .agenda-event-card {
          background: var(--bg-card);
          border-left: 3px solid;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .agenda-event-card:hover {
          background: var(--bg-card-hover);
        }

        .event-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .event-time-span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .delete-event-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
        }

        .delete-event-btn:hover {
          color: var(--accent-red);
          background: var(--accent-red-bg);
        }

        .edit-event-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          margin-right: 4px;
        }

        .edit-event-btn:hover {
          color: var(--accent);
          background: var(--accent-bg);
        }

        .event-card-actions {
          display: flex;
          align-items: center;
        }

        .event-card-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .event-card-desc {
          font-size: 12px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .inline-icon {
          flex-shrink: 0;
          color: var(--text-muted);
        }

        /* Modal specific */
        .modal-subtitle {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: -16px;
          margin-bottom: 20px;
        }

        .time-picker-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .color-selector {
          display: flex;
          gap: 8px;
          padding: 4px 0;
        }

        .color-btn-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          outline: none;
          transition: transform 0.2s, border-color 0.2s;
        }

        .color-btn-dot:hover {
          transform: scale(1.1);
        }

        .color-btn-dot.selected {
          border-color: var(--text-primary);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
