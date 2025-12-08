
import React, { HTMLAttributes, useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TodoItem } from '../types';

interface TodoCardProps extends HTMLAttributes<HTMLDivElement> {
  item: TodoItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string) => void; // New prop for updating text
  isOverlay?: boolean; // For styling the drag overlay
  autoEdit?: boolean; // New prop to trigger edit mode automatically
}

export const TodoCard: React.FC<TodoCardProps> = ({ item, onDelete, onUpdate, isOverlay = false, autoEdit = false, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  // Initialize edit state. If it's an overlay, never start in edit mode.
  const [isEditing, setIsEditing] = useState(isOverlay ? false : autoEdit);
  const [editText, setEditText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      if (autoEdit && !isOverlay) {
         inputRef.current?.select(); // Select all text if auto-editing (new item)
      }
    }
  }, [isEditing, autoEdit, isOverlay]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1, // Ensure dragging item is on top
    opacity: isDragging && !isOverlay ? 0.4 : 1, // Hide original item when dragging
    ...props.style,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting or editing if clicking delete
    onDelete(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Delete' && !isEditing) { // Only delete if not in editing mode
      onDelete(item.id);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling up to dnd-kit listeners
    e.preventDefault(); // Prevent default browser behavior (e.g., text selection) and dnd-kit drag start
    if (!isOverlay) { // Only allow editing if not the drag overlay
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (editText.trim() !== item.text && editText.trim() !== '') {
      onUpdate(item.id, editText.trim());
    } else if (editText.trim() === '' && item.text !== '') {
      // If text becomes empty, update it. If user intended to delete, they can use X or DEL key.
      onUpdate(item.id, editText.trim());
    } else if (editText.trim() === '' && item.text === '') {
      // If text was already empty and remains empty, no update needed.
      // Do nothing or handle as specific empty state, e.g., delete.
    } else {
      // If text is same as original, no update.
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur(); // Trigger blur to save changes
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      tabIndex={isOverlay ? -1 : 0} // Make focusable for keyboard deletion, but not for overlay
      onKeyDown={handleKeyDown}
      className={`
        relative
        bg-white
        dark:bg-gray-700
        text-gray-800
        dark:text-gray-200
        p-2
        mb-2
        rounded-lg
        shadow-sm
        flex
        justify-between
        items-center
        border
        border-gray-200
        dark:border-gray-600
        ${isDragging && !isOverlay ? 'ring-2 ring-blue-500' : ''}
        ${isOverlay ? 'opacity-90 shadow-lg cursor-grabbing border-blue-500' : 'cursor-grab'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
        transition-all duration-200 ease-in-out
      `}
      {...props}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onPointerDown={(e) => e.stopPropagation()} // Stop drag from starting on input
          className="
            flex-grow
            bg-transparent
            border-b
            border-blue-400
            dark:border-blue-300
            focus:outline-none
            focus:border-blue-600
            dark:focus:border-blue-400
            text-xs
            font-medium
            pr-2
          "
          aria-label={`Edit task: "${item.text}"`}
        />
      ) : (
        <span
          className="flex-grow text-xs font-medium pr-2 break-words"
          onDoubleClick={handleDoubleClick}
          // Note: We DO NOT stop pointer propagation here so the card can be dragged by the text.
          // The activationConstraint in App.tsx handles the double click detection.
        >
          {item.text}
        </span>
      )}
      {!isOverlay && ( // Delete button always visible, even during editing
        <button
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()} // CRITICAL FIX: Stop drag sensor from seeing the click
          className="
            ml-2
            p-1
            text-gray-500
            dark:text-gray-400
            hover:text-red-600
            hover:dark:text-red-400
            rounded-full
            focus:outline-none
            focus:ring-2
            focus:ring-red-500
            focus:ring-opacity-50
            transition-colors
            duration-200
          "
          aria-label={`Delete task "${item.text}"`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
