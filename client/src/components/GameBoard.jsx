import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import clsx from 'clsx';
import './GameBoard.css';

/**
 * props:
 *   hand: Array<{ id, title, imgUrl, badLuckIdx }>
 *   hiddenCard: { id, title, imgUrl, badLuckIdx } | null
 *   wrongGuess: boolean
 *   onDrop: function(position: number)
 */
export default function GameBoard({ hand, hiddenCard, wrongGuess, onDrop }) {
  const handCount = hand.length;
  const [dragOverPosition, setDragOverPosition] = useState(null);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    setDragOverPosition(null); // 重置拖拽状态
    
    if (!destination) return;
    if (
      source.droppableId === 'hidden' &&
      destination.droppableId.startsWith('hand-slot-')
    ) {
      const position = Number(destination.droppableId.replace('hand-slot-', ''));
      onDrop(position);
    }
  };

  const handleDragUpdate = (update) => {
    if (update.destination && update.destination.droppableId.startsWith('hand-slot-')) {
      const position = Number(update.destination.droppableId.replace('hand-slot-', ''));
      setDragOverPosition(position);
    } else {
      setDragOverPosition(null);
    }
  };

  // 渲染每个槽位的内容
  const renderSlotContent = (slotIndex) => {
    if (dragOverPosition === null) {
      // 没有拖拽时，正常显示
      if (slotIndex < handCount) {
        return {
          type: 'normal',
          card: hand[slotIndex]
        };
      }
      return { type: 'empty' };
    }

    // 有拖拽时的逻辑
    if (slotIndex < dragOverPosition) {
      // 拖拽位置之前：保持原样
      return {
        type: 'normal',
        card: hand[slotIndex]
      };
    } else if (slotIndex === dragOverPosition) {
      // 拖拽位置：显示占位符
      return {
        type: 'placeholder',
        card: hiddenCard
      };
    } else {
      // 拖拽位置之后：显示前一个位置的卡片（向右移动）
      const originalIndex = slotIndex - 1;
      if (originalIndex < handCount) {
        return {
          type: 'normal',
          card: hand[originalIndex]
        };
      }
      return { type: 'empty' };
    }
  };

  return (
    <div className="game-board-container">
      <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
        <div className="hand-container">
          {Array.from({ length: handCount + 1 }).map((_, idx) => (
            <Droppable droppableId={`hand-slot-${idx}`} key={`slot-${idx}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={clsx(
                    'hand-slot',
                    snapshot.isDraggingOver && 'hand-slot-drag-over'
                  )}
                >
                  {(() => {
                    const slotContent = renderSlotContent(idx);
                    
                    if (slotContent.type === 'empty') {
                      return null;
                    }
                    
                    if (slotContent.type === 'placeholder') {
                      return (
                        <div className="card-item card-placeholder">
                          <div className="card-image card-placeholder-image" />
                          <div className="card-title card-placeholder-title">
                            {slotContent.card.title}
                          </div>
                          <div className="card-index">
                            Bad Luck: {slotContent.card.badLuckIdx.toFixed(1)}
                          </div>
                        </div>
                      );
                    }
                    
                    // normal type
                    return (
                      <div className="card-item">
                        <img
                          src={slotContent.card.imgUrl}
                          alt={slotContent.card.title}
                          className="card-image"
                          draggable={false} 
                          style={{ pointerEvents: 'none' }}
                        />
                        <div className="card-title">{slotContent.card.title}</div>
                        <div className="card-index">
                          Bad Luck: {slotContent.card.badLuckIdx.toFixed(1)}
                        </div>
                      </div>
                    );
                  })()}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>

        <div className="hidden-card-container">
          <Droppable droppableId="hidden" isDropDisabled={true}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {hiddenCard ? (
                  <Draggable draggableId={`hidden-${hiddenCard.id}`} index={0}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={clsx(
                          'hidden-card',
                          snapshot.isDragging && 'hidden-card-dragging',
                          wrongGuess && 'hidden-card-wrong'
                        )}
                      >
                        <img
                          src={hiddenCard.imgUrl}
                          alt={hiddenCard.title}
                          className="card-image card-image-hidden"
                          draggable={false}
                          style={{ pointerEvents: 'none' }}
                        />
                        <div className="card-title card-title-hidden">
                          {hiddenCard.title}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ) : (
                  <div className="hidden-card empty">Waiting for next card...</div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}