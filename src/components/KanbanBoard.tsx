import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MoreVertical, Plus, GripVertical, Calendar, User, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

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
    cards: [
      { id: 'task-1', title: 'Design System Update', description: 'Update the primary color palette and typography scales.', priority: 'high', assignee: 'Alex', tags: ['Design'] },
      { id: 'task-2', title: 'API Integration', description: 'Connect the frontend to the new GraphQL endpoint.', priority: 'medium', assignee: 'Sam', tags: ['Dev'] },
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: 'task-3', title: 'User Authentication', description: 'Implement JWT-based auth flow with refresh tokens.', priority: 'high', assignee: 'Jordan', tags: ['Security'] },
    ]
  },
  {
    id: 'done',
    title: 'Done',
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

  return (
    <div className={cn("flex gap-6 overflow-x-auto pb-4 h-full min-h-[600px]", className)}>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col w-80 shrink-0 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white/80">{column.title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/40">
                  {column.cards.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onAddCard?.(column.id)}
                  className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
                <button className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                  <MoreVertical size={14} />
                </button>
              </div>
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
        <button className="flex flex-col items-center justify-center w-80 shrink-0 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-6 hover:bg-white/[0.03] hover:border-white/20 transition-all group">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-nexus-accent/10 transition-colors">
            <Plus size={20} className="text-white/20 group-hover:text-nexus-accent" />
          </div>
          <span className="text-xs font-bold text-white/20 group-hover:text-white/40">Add New Column</span>
        </button>
      </DragDropContext>
    </div>
  );
};
