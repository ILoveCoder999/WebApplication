import React, { useState, useRef } from 'react';
import './GameBoard.css';

/**
 * 游戏棋盘组件的props参数说明:
 *   hand: Array<{ id, title, imgUrl, badLuckIdx }>  - 玩家手牌数组
 *   hiddenCard: { id, title, imgUrl, badLuckIdx } | null  - 待拖拽的隐藏卡片
 *   wrongGuess: boolean  - 是否猜错的标志，用于触发错误动画
 *   onDrop: function(position: number)  - 卡片放置回调函数
 */
export default function GameBoard({ hand, hiddenCard, wrongGuess, onDrop }) {
  const handCount = hand.length;
  const [dragOverPosition, setDragOverPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const dragImageRef = useRef(null);

  // 拖拽开始处理函数
  const handleDragStart = (e) => {
    if (!hiddenCard) return;
    
    e.dataTransfer.setData('text/plain', 'hidden-card');
    e.dataTransfer.effectAllowed = 'move';
    
    // 创建自定义拖拽预览图像
    if (dragImageRef.current) {
      const rect = dragImageRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(dragImageRef.current, rect.width / 2, rect.height / 2);
    }
    
    setIsDragging(true);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
  };

  // 拖拽结束处理函数
  const handleDragEnd = (e) => {
    setIsDragging(false);
    setDragOverPosition(null);
    setDragStartPosition(null);
    
    // 重置拖拽元素的变换
    e.target.style.transform = '';
  };

  // 拖拽进入槽位处理函数
  const handleDragEnter = (e, position) => {
    e.preventDefault();
    if (isDragging) {
      setDragOverPosition(position);
    }
  };

  // 拖拽在槽位上方处理函数
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 拖拽离开槽位处理函数
  const handleDragLeave = (e) => {
    // 检查是否真正离开了槽位区域
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      // 延迟清除，避免在快速移动时闪烁
      setTimeout(() => {
        if (!e.currentTarget.contains(document.elementFromPoint(x, y))) {
          setDragOverPosition(null);
        }
      }, 10);
    }
  };

  // 放置处理函数
  const handleDrop = (e, position) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData('text/plain');
    
    if (dragData === 'hidden-card' && hiddenCard && typeof onDrop === 'function') {
      onDrop(position);
    }
    
    setDragOverPosition(null);
    setIsDragging(false);
  };

  // 渲染每个槽位的内容函数
  const renderSlotContent = (slotIndex) => {
    if (dragOverPosition === null) {
      // 正常状态：显示已有卡片或空槽位
      if (slotIndex < handCount) {
        return {
          type: 'normal',
          card: hand[slotIndex]
        };
      }
      return { type: 'empty' };
    }

    // 拖拽状态：重新计算每个槽位的内容
    if (slotIndex < dragOverPosition) {
      return {
        type: 'normal',
        card: hand[slotIndex]
      };
    } else if (slotIndex === dragOverPosition) {
      return {
        type: 'placeholder',
        card: hiddenCard
      };
    } else {
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

  // 渲染单张卡片组件
  const renderCard = (cardData, type = 'normal') => {
    if (!cardData) return null;

    if (type === 'placeholder') {
      return (
        <div className="card-item card-placeholder">
          <div className="card-image card-placeholder-image" />
          <div className="card-title card-placeholder-title">
            {cardData.title}
          </div>
          <div className="card-index">
            Bad Luck: {cardData.badLuckIdx.toFixed(1)}
          </div>
        </div>
      );
    }

    // 普通卡片渲染
    return (
      <div className="card-item">
        <img
          src={cardData.imgUrl}
          alt={cardData.title}
          className="card-image"
          draggable={false}
          onError={(e) => {
            // 图片加载失败时显示占位符
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          className="card-image card-placeholder-image" 
          style={{ display: 'none' }}
        />
        <div className="card-title">{cardData.title}</div>
        <div className="card-index">
          Bad Luck: {cardData.badLuckIdx.toFixed(1)}
        </div>
      </div>
    );
  };

  return (
    <div className="game-board-container">
      {/* 手牌区域 */}
      <div className="hand-container">
        {Array.from({ length: handCount + 1 }).map((_, idx) => {
          const slotContent = renderSlotContent(idx);
          const isDragOverSlot = dragOverPosition === idx;
          
          return (
            <div
              key={`slot-${idx}`}
              className={`hand-slot ${isDragOverSlot ? 'hand-slot-drag-over' : ''}`}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, idx)}
            >
              {slotContent.type !== 'empty' && renderCard(slotContent.card, slotContent.type)}
              {slotContent.type === 'empty' && (
                <div className="empty">Drop here</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 隐藏卡片区域 */}
      <div className="hidden-card-container">
        {hiddenCard ? (
          <>
            {/* 可见的拖拽元素 */}
            <div
              className={`hidden-card ${isDragging ? 'hidden-card-dragging' : ''} ${wrongGuess ? 'hidden-card-wrong' : ''}`}
              draggable={true}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
            >
              <img
                src={hiddenCard.imgUrl}
                alt={hiddenCard.title}
                className="card-image card-image-hidden"
                draggable={false}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="card-image card-placeholder-image" 
                style={{ display: 'none' }}
              />
              <div className="card-title card-title-hidden">
                {hiddenCard.title}
              </div>
              <div className="card-index">
                Bad Luck: ???
              </div>
            </div>
            
            {/* 隐藏的拖拽预览元素 */}
            <div
              ref={dragImageRef}
              className="hidden-card drag-preview"
              style={{
                position: 'absolute',
                top: '-1000px',
                left: '-1000px',
                pointerEvents: 'none',
                opacity: 0.8,
                transform: 'rotate(5deg)'
              }}
            >
              <img
                src={hiddenCard.imgUrl}
                alt={hiddenCard.title}
                className="card-image"
                draggable={false}
              />
              <div className="card-title">{hiddenCard.title}</div>
            </div>
          </>
        ) : (
          <div className="hidden-card empty">
            Waiting for next card...
          </div>
        )}
      </div>

      {/* 拖拽提示 */}
      {isDragging && (
        <div className="drag-hint">
          <p>Drop the card in the correct position based on its Bad Luck index!</p>
        </div>
      )}
    </div>
  );
}