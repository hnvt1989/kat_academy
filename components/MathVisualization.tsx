import React from 'react';
import { MathProblem, OperationType } from '../types';

interface MathVisualizationProps {
  problem: MathProblem;
}

const ITEM_SIZE = 24;
const ITEM_MARGIN = 6;
const MAX_ITEMS_PER_ROW = 10;

const Item: React.FC<{ x: number; y: number; color: string; isCrossedOut?: boolean }> = ({ x, y, color, isCrossedOut }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx={ITEM_SIZE / 2} cy={ITEM_SIZE / 2} r={ITEM_SIZE / 2} fill={color} />
    {isCrossedOut && (
      <>
        <line x1={ITEM_SIZE * 0.15} y1={ITEM_SIZE * 0.15} x2={ITEM_SIZE * 0.85} y2={ITEM_SIZE * 0.85} stroke="red" strokeWidth="3" />
        <line x1={ITEM_SIZE * 0.85} y1={ITEM_SIZE * 0.15} x2={ITEM_SIZE * 0.15} y2={ITEM_SIZE * 0.85} stroke="red" strokeWidth="3" />
      </>
    )}
  </g>
);

const MathVisualization: React.FC<MathVisualizationProps> = ({ problem }) => {
  const { operand1, operand2, operation } = problem;
  const items = [];

  let totalWidth = 0;
  let currentX = 0;
  let currentY = 0;
  let maxItemsInCurrentRow = 0;

  if (operation === OperationType.ADDITION) {
    for (let i = 0; i < operand1; i++) {
      if (maxItemsInCurrentRow >= MAX_ITEMS_PER_ROW) {
        currentY += ITEM_SIZE + ITEM_MARGIN;
        currentX = 0;
        maxItemsInCurrentRow = 0;
      }
      items.push(<Item key={`op1-${i}`} x={currentX} y={currentY} color="#0ea5e9" />);
      currentX += ITEM_SIZE + ITEM_MARGIN;
      maxItemsInCurrentRow++;
    }
    totalWidth = Math.max(totalWidth, currentX - ITEM_MARGIN);
    
    currentX = 0;
    currentY += ITEM_SIZE + ITEM_MARGIN;
    maxItemsInCurrentRow = 0;

    for (let i = 0; i < operand2; i++) {
       if (maxItemsInCurrentRow >= MAX_ITEMS_PER_ROW) {
        currentY += ITEM_SIZE + ITEM_MARGIN;
        currentX = 0;
        maxItemsInCurrentRow = 0;
      }
      items.push(<Item key={`op2-${i}`} x={currentX} y={currentY} color="#10b981" />);
      currentX += ITEM_SIZE + ITEM_MARGIN;
      maxItemsInCurrentRow++;
    }
     totalWidth = Math.max(totalWidth, currentX - ITEM_MARGIN);

  } else if (operation === OperationType.SUBTRACTION) {
    for (let i = 0; i < operand1; i++) {
       if (maxItemsInCurrentRow >= MAX_ITEMS_PER_ROW) {
        currentY += ITEM_SIZE + ITEM_MARGIN;
        currentX = 0;
        maxItemsInCurrentRow = 0;
      }
      items.push(
        <Item
          key={`op1-${i}`}
          x={currentX}
          y={currentY}
          color="#0ea5e9"
          isCrossedOut={i < operand1 && i >= operand1 - operand2}
        />
      );
      currentX += ITEM_SIZE + ITEM_MARGIN;
      maxItemsInCurrentRow++;
    }
    totalWidth = Math.max(totalWidth, currentX - ITEM_MARGIN);
  }
  
  const totalHeight = currentY + ITEM_SIZE;

  return (
    <div className="my-4 p-3 bg-slate-50 rounded-md shadow-inner overflow-x-auto">
      <p className="text-sm text-slate-600 mb-2 font-semibold">Visual Help:</p>
      <svg 
        width="100%" 
        height={Math.max(totalHeight, ITEM_SIZE) + ITEM_MARGIN} 
        viewBox={`0 0 ${Math.max(totalWidth, ITEM_SIZE * 3)} ${Math.max(totalHeight, ITEM_SIZE) + ITEM_MARGIN}`} 
        className="mx-auto"
      >
        {items}
      </svg>
       {operation === OperationType.ADDITION && (
         <p className="text-center mt-2 text-slate-700 font-semibold">
           {operand1} <span className="text-sky-500">items</span> + {operand2} <span className="text-emerald-500">items</span> = {operand1 + operand2} items total
         </p>
       )}
       {operation === OperationType.SUBTRACTION && (
         <p className="text-center mt-2 text-slate-700 font-semibold">
           {operand1} <span className="text-sky-500">items</span>, take away {operand2} items = {operand1 - operand2} items left
         </p>
       )}
    </div>
  );
};

export default MathVisualization; 