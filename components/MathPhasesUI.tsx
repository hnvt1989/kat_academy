import React from 'react';
import { MathPhase } from '../types';

interface MathPhasesUIProps {
  onPhaseSelect: (problems: number[], phaseNumber: number) => void;
  currentPhase: number | null;
}

const MATH_PHASES_DATA: MathPhase[] = [
  { id: 1, title: "Phase 1: Easy Sums", description: "Adding small numbers (result up to 5)", problemIds: [1, 2] },
  { id: 2, title: "Phase 2: Bigger Sums", description: "More addition (result up to 10)", problemIds: [3, 4] },
  { id: 3, title: "Phase 3: Simple Takeaways", description: "Subtracting small numbers", problemIds: [5, 6] },
  { id: 4, title: "Phase 4: Larger Takeaways", description: "More subtraction", problemIds: [7, 8] },
  { id: 5, title: "Phase 5: Mix & Match", description: "Addition and Subtraction", problemIds: [9, 10] },
  { id: 6, title: "Phase 6: Extra Practice", description: "More mixed problems", problemIds: [11, 12, 13, 14, 15] },
  { id: 7, title: "Phase 7: Advanced Mix", description: "Challenging mixed problems", problemIds: [16, 17, 18, 19, 20] },
];

const MathPhasesUI: React.FC<MathPhasesUIProps> = ({ onPhaseSelect, currentPhase }) => {
  const handlePhaseClick = (phase: MathPhase) => {
    onPhaseSelect(phase.problemIds, phase.id);
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-xl mb-4 md:mb-0 md:mr-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Math Phases</h2>
      <div className="relative">
        <div className="h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100 pr-2">
          <div className="space-y-3">
            {MATH_PHASES_DATA.map((phase) => (
              <button
                key={phase.id}
                onClick={() => handlePhaseClick(phase)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400
                  ${currentPhase === phase.id 
                    ? 'bg-indigo-500 text-white shadow-lg scale-105' 
                    : 'bg-slate-100 hover:bg-indigo-100 text-slate-700 shadow-md hover:shadow-lg'
                  }`}
              >
                <h3 className="font-bold text-md">{phase.title}</h3>
                <p className={`text-xs ${currentPhase === phase.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {phase.description}
                </p>
                <p className={`text-xs mt-1 ${currentPhase === phase.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {phase.problemIds.length} problems
                </p>
              </button>
            ))}
          </div>
        </div>
        {/* Scroll indicator gradients */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/90 to-transparent pointer-events-none rounded-t-lg"></div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/90 to-transparent pointer-events-none rounded-b-lg"></div>
      </div>
    </div>
  );
};

export default MathPhasesUI; 