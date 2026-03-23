import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MoreVertical, Plus, GripVertical, Calendar, User, Tag, Settings, Trash2, X, Check, Palette, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
  description?: string;
}

interface KanbanBoardProps {
  initialColumns?: KanbanColumn[];
  onCardMove?: (cardId: string, sourceColumnId: string, destinationColumnId: string, index: number) => void;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

const defaultColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#94a3b8',
    description: 'Tasks that need to be started',
    cards: [
      { id: 'task-1', title: 'Design System Update', description: 'Update the primary color palette and typography scales.', priority: 'high', assignee: 'Alex', tags: ['Design'] },
      { id: 'task-2', title: 'API Integration', description: 'Connect the frontend to the new GraphQL endpoint.', priority: 'medium', assignee: 'Sam', tags: ['Dev'] },
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#38bdf8',
    description: 'Tasks currently being worked on',
    cards: [
      { id: 'task-3', title: 'User Authentication', description: 'Implement JWT-based auth flow with refresh tokens.', priority: 'high', assignee: 'Jordan', tags: ['Security'] },
    ]
  },
  {
    id: 'done',
    title: 'Done',
    color: '#34d399',
    description: 'Completed tasks',
    cards: [
      { id: 'task-4', title: 'Initial Setup', description: 'Project boilerplate and CI/CD pipeline configuration.', priority: 'low', assignee: 'Alex', tags: ['DevOps'] },
    ]
  }
];

const priorityColors = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  initialColumns = defaultColumns, 
  onCardMove,
  onAddCard,
  className 
}) => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  
  // Form state for editing/adding
  const [editTitle, setEditTitle] = useState('');
  const [editColor, setEditColor] = useState('#94a3b8');
  const [editDescription, setEditDescription] = useState('');

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId);

    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];

    const sourceCards = [...sourceCol.cards];
    const destCards = source.droppableId === destination.droppableId 
      ? sourceCards 
      : [...destCol.cards];

    const [removed] = sourceCards.splice(source.index, 1);
    destCards.splice(destination.index, 0, removed);

    const newColumns = [...columns];
    newColumns[sourceColIndex] = { ...sourceCol, cards: sourceCards };
    newColumns[destColIndex] = { ...destCol, cards: destCards };

    setColumns(newColumns);

    if (onCardMove) {
      onCardMove(removed.id, source.droppableId, destination.droppableId, destination.index);
    }
  };

  const handleAddColumn = () => {
    if (!editTitle.trim()) return;
    
    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      title: editTitle,
      color: editColor,
      description: editDescription,
      cards: []
    };
    
    setColumns([...columns, newColumn]);
    setIsAddingColumn(false);
    resetForm();
  };

  const handleUpdateColumn = () => {
    if (!editingColumnId || !editTitle.trim()) return;
    
    setColumns(columns.map(col => 
      col.id === editingColumnId 
        ? { ...col, title: editTitle, color: editColor, description: editDescription }
        : col
    ));
    setEditingColumnId(null);
    resetForm();
  };

  const handleDeleteColumn = (id: string) => {
    setColumns(columns.filter(col => col.id !== id));
  };

  const resetForm = () => {
    setEditTitle('');
    setEditColor('#94a3b8');
    setEditDescription('');
  };

  const startEditing = (column: KanbanColumn) => {
    setEditingColumnId(column.id);
    setEditTitle(column.title);
    setEditColor(column.color || '#94a3b8');
    setEditDescription(column.description || '');
  };

  const startAdding = () => {
    setIsAddingColumn(true);
    resetForm();
  };

  return (
    <div className={cn("flex gap-6 overflow-x-auto pb-4 h-full min-h-[600px]", className)}>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col w-80 shrink-0 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group/column">
            {/* Column Header */}
            <div className="p-4 flex flex-col border-b border-white/5 bg-white/[0.02] relative">
              <div 
                className="absolute top-0 left-0 w-full h-1" 
                style={{ backgroundColor: column.color || '#94a3b8' }}
              />
              
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white/80">{column.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/40">
                    {column.cards.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onAddCard?.(column.id)}
                    className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    title="Add Card"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={() => startEditing(column)}
                    className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    title="Column Settings"
                  >
                    <Settings size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteColumn(column.id)}
                    className="p-1.5 rounded-md hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-colors"
                    title="Delete Column"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {column.description && (
                <p className="text-[10px] text-white/30 italic line-clamp-1">{column.description}</p>
              )}
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "flex-1 p-3 space-y-3 transition-colors",
                    snapshot.isDraggingOver ? "bg-nexus-accent/5" : "bg-transparent"
                  )}
                >
                  {column.cards.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "group bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3 transition-all",
                            snapshot.isDragging ? "shadow-2xl shadow-black/50 border-nexus-accent/50 rotate-2 scale-105 z-50" : "hover:border-white/10 hover:bg-white/[0.05]"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <h4 className="text-sm font-semibold text-white/90 leading-tight">{card.title}</h4>
                              {card.description && (
                                <p className="text-xs text-white/40 line-clamp-2">{card.description}</p>
                              )}
                            </div>
                            <div {...provided.dragHandleProps} className="text-white/20 group-hover:text-white/40 transition-colors cursor-grab active:cursor-grabbing">
                              <GripVertical size={16} />
                            </div>
                          </div>

                          {/* Card Meta */}
                          <div className="flex flex-wrap gap-2">
                            {card.priority && (
                              <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border", priorityColors[card.priority])}>
                                {card.priority}
                              </span>
                            )}
                            {card.tags?.map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/5">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <div className="flex items-center gap-3">
                              {card.assignee && (
                                <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                                  <User size={10} />
                                  <span>{card.assignee}</span>
                                </div>
                              )}
                              {card.dueDate && (
                                <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                                  <Calendar size={10} />
                                  <span>{card.dueDate}</span>
                                </div>
                              )}
                            </div>
                            <div className="w-5 h-5 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center text-[8px] font-bold text-nexus-accent">
                              {card.assignee?.charAt(0) || '?'}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}

        {/* Add Column Button */}
        {isAddingColumn ? (
          <div className="flex flex-col w-80 shrink-0 bg-white/[0.02] border border-nexus-accent/30 rounded-2xl p-4 space-y-4 h-fit animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-nexus-accent">New Column</h4>
              <button onClick={() => setIsAddingColumn(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Column Title" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-nexus-accent/50 transition-colors"
                  autoFocus
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 bg-transparent border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-nexus-accent/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">Description</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What is this column for?" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none h-20"
                />
              </div>
            </div>
            
            <button 
              onClick={handleAddColumn}
              disabled={!editTitle.trim()}
              className="w-full py-2.5 rounded-xl bg-nexus-accent text-nexus-accent-contrast text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create Column
            </button>
          </div>
        ) : (
          <button 
            onClick={startAdding}
            className="flex flex-col items-center justify-center w-80 shrink-0 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-6 hover:bg-white/[0.03] hover:border-white/20 transition-all group h-fit"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-nexus-accent/10 transition-colors">
              <Plus size={20} className="text-white/20 group-hover:text-nexus-accent" />
            </div>
            <span className="text-xs font-bold text-white/20 group-hover:text-white/40">Add New Column</span>
          </button>
        )}
      </DragDropContext>

      {/* Edit Column Modal Overlay */}
      {editingColumnId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-nexus-bg border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-nexus-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Column Settings</h3>
              </div>
              <button onClick={() => setEditingColumnId(null)} className="text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Color Accent</label>
                <div className="flex gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl border border-white/10 relative overflow-hidden"
                    style={{ backgroundColor: editColor }}
                  >
                    <input 
                      type="color" 
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Palette size={16} className="text-white/50 mix-blend-difference" />
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-nexus-accent/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Description</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors resize-none h-24"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setEditingColumnId(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateColumn}
                className="flex-1 py-3 rounded-xl bg-nexus-accent text-nexus-accent-contrast text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
