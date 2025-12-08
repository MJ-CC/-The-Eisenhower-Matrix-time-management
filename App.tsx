
import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { QuadrantId, TodoItem, ItemsState } from './types';
import { Quadrant } from './components/Quadrant';
import { TodoListPanel } from './components/TodoListPanel';
import { TodoCard } from './components/TodoCard';

function App() {
  const [items, setItems] = useState<ItemsState>({
    [QuadrantId.URGENT_IMPORTANT]: [],
    [QuadrantId.NOT_URGENT_IMPORTANT]: [],
    [QuadrantId.URGENT_NOT_IMPORTANT]: [],
    [QuadrantId.NOT_URGENT_NOT_IMPORTANT]: [],
    unassigned: [],
  });
  const [nextId, setNextId] = useState(1); 
  const [activeId, setActiveId] = useState<string | null>(null);
  // Track the ID of the newly added item to trigger auto-edit
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    }),
    useSensor(KeyboardSensor),
  );

  const findContainer = useCallback((id: string): QuadrantId | 'unassigned' | null => {
    if (id in items) {
      return id as QuadrantId | 'unassigned';
    }
    for (const key of Object.keys(items) as Array<QuadrantId | 'unassigned'>) {
      if (items[key].some((item) => item.id === id)) {
        return key;
      }
    }
    return null;
  }, [items]);

  const getActiveItem = useCallback((): TodoItem | null => {
    if (!activeId) return null;
    const containerId = findContainer(activeId);
    if (!containerId) return null;
    return items[containerId].find((item) => item.id === activeId) || null;
  }, [activeId, findContainer, items]);

  const handleAddTodo = useCallback((targetContainer: QuadrantId | 'unassigned' = 'unassigned') => {
    const newId = `todo-${nextId}`;
    const newItem: TodoItem = {
      id: newId,
      text: '新待辦事項',
    };
    setItems((prev) => ({
      ...prev,
      [targetContainer]: [...prev[targetContainer], newItem],
    }));
    setNextId((prev) => prev + 1);
    setNewlyAddedId(newId); // Mark this ID as new to trigger auto-edit
  }, [nextId]);

  const handleDeleteTodo = useCallback((idToDelete: string) => {
    setItems((prev) => {
      const newState = { ...prev };
      for (const key of Object.keys(newState) as Array<QuadrantId | 'unassigned'>) {
        newState[key] = newState[key].filter((item) => item.id !== idToDelete);
      }
      return newState;
    });
  }, []);

  const handleUpdateTodo = useCallback((idToUpdate: string, newText: string) => {
    setItems((prev) => {
      const newState = { ...prev };
      for (const key of Object.keys(newState) as Array<QuadrantId | 'unassigned'>) {
        newState[key] = newState[key].map((item) =>
          item.id === idToUpdate ? { ...item, text: newText } : item
        );
      }
      return newState;
    });
    setNewlyAddedId(null); // Clear auto-edit status after update
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setNewlyAddedId(null); // Clear auto-edit status when dragging starts
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;

    if (!overId || activeId === overId) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeContainer === overContainer) {
      const oldIndex = items[activeContainer].findIndex((item) => item.id === activeId);
      const newIndex = items[activeContainer].findIndex((item) => item.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setItems((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
        }));
      }
    } else {
      setItems((prev) => {
        const newItems = { ...prev };
        const activeItem = newItems[activeContainer].find((item) => item.id === activeId);
        if (!activeItem) return prev;

        newItems[activeContainer] = newItems[activeContainer].filter((item) => item.id !== activeId);

        const overItemIndex = newItems[overContainer].findIndex((item) => item.id === overId);

        if (overItemIndex !== -1) {
          newItems[overContainer].splice(overItemIndex, 0, activeItem);
        } else {
          newItems[overContainer].push(activeItem);
        }
        return newItems;
      });
    }
    setActiveId(null);
  }, [items, findContainer]);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  const allItemIds: string[] = Object.values(items).flatMap((arr) => (arr as TodoItem[]).map((item) => item.id));

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Left 2/3 section: Time Matrix */}
        <div className="lg:w-2/3 w-full grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
          <SortableContext id="all-items" items={allItemIds}>
            <Quadrant
              id={QuadrantId.URGENT_IMPORTANT}
              title="重要且緊急"
              description="立即行動，優先處理"
              items={items[QuadrantId.URGENT_IMPORTANT]}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
              onAddTodo={() => handleAddTodo(QuadrantId.URGENT_IMPORTANT)}
              colorClass="border-red-500 bg-red-50 dark:bg-red-950"
              headerClass="bg-red-500 text-white"
              newlyAddedId={newlyAddedId}
            />
            <Quadrant
              id={QuadrantId.NOT_URGENT_IMPORTANT}
              title="重要但不緊急"
              description="計畫，預約時間完成"
              items={items[QuadrantId.NOT_URGENT_IMPORTANT]}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
              onAddTodo={() => handleAddTodo(QuadrantId.NOT_URGENT_IMPORTANT)}
              colorClass="border-green-500 bg-green-50 dark:bg-green-950"
              headerClass="bg-green-500 text-white"
              newlyAddedId={newlyAddedId}
            />
            <Quadrant
              id={QuadrantId.URGENT_NOT_IMPORTANT}
              title="不重要但緊急"
              description="委託，尋找他人協助"
              items={items[QuadrantId.URGENT_NOT_IMPORTANT]}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
              onAddTodo={() => handleAddTodo(QuadrantId.URGENT_NOT_IMPORTANT)}
              colorClass="border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
              headerClass="bg-yellow-500 text-gray-800"
              newlyAddedId={newlyAddedId}
            />
            <Quadrant
              id={QuadrantId.NOT_URGENT_NOT_IMPORTANT}
              title="不重要且不緊急"
              description="刪除，減少時間浪費"
              items={items[QuadrantId.NOT_URGENT_NOT_IMPORTANT]}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
              onAddTodo={() => handleAddTodo(QuadrantId.NOT_URGENT_NOT_IMPORTANT)}
              colorClass="border-gray-400 bg-gray-50 dark:bg-gray-700"
              headerClass="bg-gray-400 text-white"
              newlyAddedId={newlyAddedId}
            />
          </SortableContext>
        </div>

        {/* Right 1/3 section: Todo List Panel */}
        <div className="lg:w-1/3 w-full h-full">
          <TodoListPanel
            items={items.unassigned}
            onAddTodo={() => handleAddTodo('unassigned')}
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
            newlyAddedId={newlyAddedId}
          />
        </div>

        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId && getActiveItem() ? (
              <TodoCard item={getActiveItem()!} onDelete={handleDeleteTodo} onUpdate={handleUpdateTodo} isOverlay />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

export default App;
