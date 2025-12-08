
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
  onAddTodo: () => void;
  colorClass: string;
  headerClass: string;
  newlyAddedId?: string | null;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  id,
  title,
  description,
  items,
  onDelete,
  onUpdate,
  onAddTodo,
  colorClass,
  headerClass,
  newlyAddedId,
}) => {
  // Logic for Dropping items INTO the Quadrant
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const itemIds = items.map((item) => item.id);

  return (
    <div
      ref={setNodeRef}
      onDoubleClick={onAddTodo}
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
      
      <div className="flex-grow overflow-y-auto custom-scrollbar p-1 flex flex-col">
        <SortableContext id={id} items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <TodoCard 
              key={item.id} 
              item={item} 
              onDelete={onDelete} 
              onUpdate={onUpdate}
              autoEdit={item.id === newlyAddedId} 
            />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg m-1 min-h-[60px] opacity-60 hover:opacity-100 transition-opacity cursor-pointer space-y-1">
            <span className="text-gray-500 dark:text-gray-400 text-xs select-none">拖曳待辦事項到這裡</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs select-none">或</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs select-none">雙擊空白處新增</span>
          </div>
        )}
      </div>
    </div>
  );
};
