import React, { useState, useMemo } from 'react';
import { 
  File, 
  Folder, 
  Plus, 
  Trash2, 
  Search, 
  Eye, 
  Edit3, 
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { Note } from '../types';

interface NotesViewProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export const NotesView: React.FC<NotesViewProps> = ({ notes, setNotes }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState<boolean>(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Expand / collapse folder toggle
  const toggleFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Add Note
  const handleAddNote = (parentId: string | null = null) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Başlıksız Sayfa',
      content: '',
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    if (parentId) {
      // Auto expand the parent folder
      setExpandedFolders(prev => ({ ...prev, [parentId]: true }));
    }
  };

  // Update Note Title/Content
  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    if (!selectedNoteId) return;
    setNotes(prev => prev.map(note => {
      if (note.id === selectedNoteId) {
        return {
          ...note,
          [field]: value,
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    }));
  };

  // Delete Note and its children
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Get all children recursively
    const getChildIds = (parentId: string): string[] => {
      const children = notes.filter(n => n.parentId === parentId);
      return [parentId, ...children.flatMap(c => getChildIds(c.id))];
    };
    
    const toDeleteIds = getChildIds(id);
    setNotes(prev => prev.filter(n => !toDeleteIds.includes(n.id)));
    if (selectedNoteId && toDeleteIds.includes(selectedNoteId)) {
      setSelectedNoteId(null);
    }
  };

  // Simple Markdown Parser for Preview
  const parseMarkdown = (text: string) => {
    if (!text) return <p className="empty-preview">Boş Sayfa. Yazmaya başlamak için düzenle moduna geçin.</p>;

    const lines = text.split('\n');
    let insideCodeBlock = false;
    let codeBlockContent: string[] = [];

    return lines.map((line, idx) => {
      // Code Blocks
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          insideCodeBlock = false;
          const content = codeBlockContent.join('\n');
          codeBlockContent = [];
          return (
            <pre key={idx} className="preview-code-block">
              <code>{content}</code>
            </pre>
          );
        } else {
          insideCodeBlock = true;
          return null;
        }
      }

      if (insideCodeBlock) {
        codeBlockContent.push(line);
        return null;
      }

      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="preview-h1">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="preview-h2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="preview-h3">{line.slice(4)}</h3>;
      }

      // Checklists
      if (line.trim().startsWith('- [ ] ')) {
        return (
          <div key={idx} className="preview-checkbox-item">
            <input type="checkbox" checked={false} readOnly />
            <span>{line.trim().slice(6)}</span>
          </div>
        );
      }
      if (line.trim().startsWith('- [x] ')) {
        return (
          <div key={idx} className="preview-checkbox-item checked">
            <input type="checkbox" checked={true} readOnly />
            <span>{line.trim().slice(6)}</span>
          </div>
        );
      }

      // Bullet Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <li key={idx} className="preview-bullet">{line.trim().slice(2)}</li>;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        return <blockquote key={idx} className="preview-blockquote">{line.slice(2)}</blockquote>;
      }

      // Empty Line
      if (!line.trim()) {
        return <div key={idx} className="preview-empty-line" />;
      }

      // Normal text with bold support
      const formattedText = line.split('**').map((part, partIdx) => {
        return partIdx % 2 === 1 ? <strong key={partIdx}>{part}</strong> : part;
      });

      return <p key={idx} className="preview-paragraph">{formattedText}</p>;
    });
  };

  // Filtered Notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  // Build Hierarchy Tree
  const renderNoteList = (parentId: string | null = null, depth = 0) => {
    // If searching, display matching notes as a flat list
    const currentNotes = searchQuery 
      ? filteredNotes
      : notes.filter(n => n.parentId === parentId);

    if (currentNotes.length === 0) return null;

    return (
      <ul className="note-tree-ul" style={{ paddingLeft: searchQuery ? 0 : depth > 0 ? '12px' : 0 }}>
        {currentNotes.map(note => {
          const hasChildren = notes.some(n => n.parentId === note.id);
          const isExpanded = expandedFolders[note.id] || false;
          const isSelected = note.id === selectedNoteId;

          return (
            <li key={note.id} className="note-tree-li">
              <div 
                className={`note-tree-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedNoteId(note.id)}
              >
                {!searchQuery && (
                  <button 
                    className="folder-toggle-btn"
                    onClick={(e) => toggleFolder(note.id, e)}
                    style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
                
                {hasChildren ? (
                  <Folder size={16} className="item-icon folder-icon" />
                ) : (
                  <FileText size={16} className="item-icon file-icon" />
                )}
                
                <span className="note-item-title">{note.title || 'Başlıksız'}</span>
                
                <div className="item-actions">
                  <button 
                    className="item-action-btn add"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNote(note.id);
                    }}
                    title="Alt Sayfa Ekle"
                  >
                    <Plus size={12} />
                  </button>
                  <button 
                    className="item-action-btn delete"
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    title="Sayfayı Sil"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              
              {/* Recursive child list */}
              {!searchQuery && isExpanded && renderNoteList(note.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="notes-view fade-in">
      {/* Sidebar inside Notes */}
      <div className="notes-sidebar glass-panel">
        <div className="notes-sidebar-header">
          <h3>Sayfalar</h3>
          <button className="btn-icon-primary" onClick={() => handleAddNote(null)} title="Yeni Sayfa Ekle">
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="search-bar-container">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Sayfalarda ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Note List tree */}
        <div className="notes-tree-container">
          {notes.length === 0 ? (
            <div className="empty-notes-prompt">
              <FileText size={32} />
              <p>Henüz not eklenmemiş.</p>
              <button className="btn-secondary btn-sm" onClick={() => handleAddNote(null)}>İlk Sayfanı Oluştur</button>
            </div>
          ) : (
            renderNoteList(null)
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="editor-panel glass-panel">
        {activeNote ? (
          <div className="editor-wrapper">
            {/* Editor Toolbar */}
            <div className="editor-toolbar">
              <div className="editor-tab-indicators">
                <FileText size={18} className="text-purple" />
                <span className="editor-note-title">{activeNote.title}</span>
              </div>
              
              <div className="editor-mode-toggle">
                <button 
                  className={`toggle-btn ${editMode ? 'active' : ''}`}
                  onClick={() => setEditMode(true)}
                >
                  <Edit3 size={14} />
                  <span>Düzenle</span>
                </button>
                <button 
                  className={`toggle-btn ${!editMode ? 'active' : ''}`}
                  onClick={() => setEditMode(false)}
                >
                  <Eye size={14} />
                  <span>Önizleme</span>
                </button>
              </div>
            </div>

            {/* Note Editor Area */}
            {editMode ? (
              <div className="editor-input-area">
                <input 
                  type="text" 
                  className="editor-title-input"
                  placeholder="Başlıksız Not" 
                  value={activeNote.title}
                  onChange={(e) => handleUpdateNote('title', e.target.value)}
                />
                <textarea 
                  className="editor-content-textarea"
                  placeholder="Yazmaya başla... (Markdown desteği: # başlık, **kalın**, - liste, - [ ] yapılacak listesi)"
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote('content', e.target.value)}
                />
              </div>
            ) : (
              <div className="editor-preview-area scrollable">
                <h1 className="preview-main-title">{activeNote.title || 'Başlıksız Not'}</h1>
                <hr className="preview-divider" />
                <div className="markdown-body">
                  {parseMarkdown(activeNote.content)}
                </div>
              </div>
            )}
            
            <div className="editor-footer-info">
              <span>Son güncelleme: {new Date(activeNote.updatedAt).toLocaleTimeString('tr-TR')}</span>
            </div>
          </div>
        ) : (
          <div className="empty-editor-state">
            <File size={48} className="empty-icon text-muted" />
            <h2>Not Defteri</h2>
            <p>Sol taraftaki menüden bir not seçin veya yeni bir sayfa oluşturarak çalışmaya başlayın.</p>
            <button className="btn-primary" onClick={() => handleAddNote(null)}>
              <Plus size={16} />
              Yeni Sayfa
            </button>
          </div>
        )}
      </div>

      <style>{`
        .notes-view {
          display: flex;
          gap: 20px;
          height: 100%;
          width: 100%;
        }

        .notes-sidebar {
          width: 300px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
          flex-shrink: 0;
        }

        .notes-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-icon-primary {
          background: var(--accent-bg);
          border: 1px solid rgba(168, 85, 247, 0.2);
          color: var(--accent-light);
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-icon-primary:hover {
          background: var(--accent);
          color: white;
        }

        .search-bar-container {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-bar-container input {
          width: 100%;
          padding-left: 32px;
          font-size: 13px;
        }

        .notes-tree-container {
          flex: 1;
          overflow-y: auto;
        }

        .empty-notes-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 100%;
          text-align: center;
          color: var(--text-muted);
          padding: 20px;
        }

        .empty-notes-prompt p {
          font-size: 13px;
        }

        .btn-sm {
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 6px;
        }

        /* Tree Styles */
        .note-tree-ul {
          list-style: none;
          margin: 0;
        }

        .note-tree-li {
          margin: 2px 0;
        }

        .note-tree-item {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
          position: relative;
        }

        .note-tree-item:hover {
          background: var(--bg-card-hover);
        }

        .note-tree-item.selected {
          background: var(--accent-bg);
          border-left: 2px solid var(--accent);
        }

        .folder-toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          margin-right: 4px;
        }

        .folder-toggle-btn:hover {
          color: var(--text-primary);
        }

        .item-icon {
          margin-right: 8px;
          flex-shrink: 0;
        }

        .folder-icon {
          color: var(--accent-orange);
        }

        .file-icon {
          color: var(--text-muted);
        }

        .note-item-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .note-tree-item.selected .note-item-title {
          color: var(--text-primary);
          font-weight: 600;
        }

        .item-actions {
          display: none;
          gap: 4px;
          position: absolute;
          right: 8px;
          background: inherit;
          padding-left: 8px;
        }

        .note-tree-item:hover .item-actions {
          display: flex;
        }

        .item-action-btn {
          background: transparent;
          border: none;
          padding: 3px;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-muted);
        }

        .item-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .item-action-btn.delete:hover {
          color: var(--accent-red);
          background: var(--accent-red-bg);
        }

        /* Editor Area */
        .editor-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .editor-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .editor-tab-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .editor-note-title {
          font-weight: 600;
          font-size: 15px;
          color: var(--text-primary);
        }

        .editor-mode-toggle {
          display: flex;
          background: var(--bg-app);
          border-radius: 8px;
          padding: 2px;
          border: 1px solid var(--border);
        }

        .toggle-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: var(--bg-card);
          color: var(--accent-light);
          box-shadow: var(--shadow);
        }

        .editor-input-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
        }

        .editor-title-input {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          background: transparent;
          border: none;
          color: var(--text-primary);
          padding: 0;
          outline: none;
          width: 100%;
        }

        .editor-title-input:focus {
          border-color: transparent;
        }

        .editor-content-textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          resize: none;
          padding: 0;
          font-size: 15px;
          line-height: 1.65;
          font-family: var(--font-sans);
          outline: none;
          width: 100%;
        }

        .editor-content-textarea:focus {
          border-color: transparent;
        }

        /* Preview area */
        .editor-preview-area {
          flex: 1;
          overflow-y: auto;
          text-align: left;
          padding-right: 8px;
        }

        .preview-main-title {
          font-size: 28px;
          margin-bottom: 12px;
        }

        .preview-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin-bottom: 20px;
        }

        .markdown-body {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.7;
          font-family: var(--font-sans);
        }

        .preview-h1 {
          font-size: 22px;
          margin: 24px 0 12px 0;
          border-bottom: 1px solid var(--border);
          padding-bottom: 6px;
        }

        .preview-h2 {
          font-size: 18px;
          margin: 20px 0 10px 0;
        }

        .preview-h3 {
          font-size: 15px;
          margin: 16px 0 8px 0;
        }

        .preview-paragraph {
          margin-bottom: 12px;
        }

        .preview-bullet {
          margin-left: 20px;
          margin-bottom: 6px;
          list-style-type: disc;
        }

        .preview-blockquote {
          border-left: 4px solid var(--accent);
          padding-left: 16px;
          color: var(--text-muted);
          font-style: italic;
          margin: 16px 0;
        }

        .preview-checkbox-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .preview-checkbox-item input {
          width: 15px;
          height: 15px;
          accent-color: var(--accent);
        }

        .preview-checkbox-item.checked span {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .preview-code-block {
          background: var(--bg-app);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          margin: 16px 0;
          overflow-x: auto;
          font-family: monospace;
          font-size: 13px;
        }

        .preview-empty-line {
          height: 16px;
        }

        .empty-preview {
          color: var(--text-muted);
          font-style: italic;
        }

        .editor-footer-info {
          padding-top: 12px;
          border-top: 1px solid var(--border);
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .empty-editor-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          color: var(--text-muted);
          text-align: center;
          padding: 40px;
        }

        .empty-editor-state h2 {
          color: var(--text-primary);
        }

        .empty-editor-state p {
          max-width: 320px;
          font-size: 13px;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};
