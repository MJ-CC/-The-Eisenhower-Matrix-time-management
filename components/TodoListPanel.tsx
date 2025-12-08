
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TodoItem } from '../types';
import { TodoCard } from './TodoCard';

interface TodoListPanelProps {
  items: TodoItem[];
  onAddTodo: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string) => void; // New prop
}

export const TodoListPanel: React.FC<TodoListPanelProps> = ({ items, onAddTodo, onDelete, onUpdate }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  });

  const itemIds = items.map((item) => item.id);

  return (
    <div
      ref={setNodeRef}
      onDoubleClick={onAddTodo}
      className={`
        relative
        bg-gray-50
        dark:bg-gray-800
        p-2
        rounded-lg
        shadow-lg
        flex
        flex-col
        h-full
        min-h-[300px]
        transition-all
        duration-200
        ${isOver ? 'ring-4 ring-blue-300 dark:ring-blue-600' : ''}
      `}
    >
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">待辦事項</h2>
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
        <SortableContext id="unassigned" items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <TodoCard key={item.id} item={item} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 text-xs mt-4 select-none" aria-live="polite">
            可點擊+或雙擊空白處新增待辦事項
          </div>
        )}
      </div>
      {/* New hint message */}
      {items.length > 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-[10px] mt-2 select-none">
          雙擊修改內容
        </p>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent double click event on the button from bubbling if user clicks fast
          onAddTodo();
        }}
        className="
          mt-3
          bg-blue-600
          hover:bg-blue-700
          text-white
          font-bold
          py-2
          rounded-full
          shadow-lg
          transition-colors
          duration-200
          flex
          items-center
          justify-center
          text-lg
          focus:outline-none
          focus:ring-4
          focus:ring-blue-300
          focus:ring-opacity-75
          w-12 h-12 mx-auto
        "
        aria-label="Add new todo item"
      >
        +
      </button>
    </div>
  );
};
