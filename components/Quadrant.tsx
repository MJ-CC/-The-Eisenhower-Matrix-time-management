
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { QuadrantId, TodoItem } from '../types';
import { TodoCard } from './TodoCard';

interface QuadrantProps {
  id: QuadrantId;
  title: string;
  description: string;
  items: TodoItem[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string) => void;
  colorClass: string;
  headerClass: string;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  id,
  title,
  description,
  items,
  onDelete,
  onUpdate,
  colorClass,
  headerClass,
}) => {
  // Logic for Dropping items INTO the Quadrant
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const itemIds = items.map((item) => item.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex
        flex-col
        h-full
        min-h-[150px]
        rounded-lg
        transition-all
        duration-200
        p-2
        border-2
        shadow-lg
        ${colorClass}
        ${isOver ? 'bg-opacity-20 scale-[1.01]' : 'bg-opacity-10'}
      `}
    >
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <span className={`inline-block text-sm font-bold ${headerClass} px-2 py-0.5 rounded-full`}>
          {title}
        </span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 px-1 select-none">{description}</p>
      
      <div className="flex-grow overflow-y-auto custom-scrollbar p-1">
        <SortableContext id={id} items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <TodoCard 
              key={item.id} 
              item={item} 
              onDelete={onDelete} 
              onUpdate={onUpdate} 
            />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 text-xs mt-4" aria-live="polite">
            拖曳待辦事項到這裡
          </div>
        )}
      </div>
    </div>
  );
};
