import React, { useState, useEffect } from 'react';

interface Phase {
  phase: number;
  description: string;
  sentences: string[];
}

interface PhrasesUIProps {
  onPhaseSelect: (sentences: string[], phaseNumber: number) => void;
  currentPhase: number | null;
}

const PhrasesUI: React.FC<PhrasesUIProps> = ({ onPhaseSelect, currentPhase }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhases = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming the JSON file is in the public folder or accessible via a direct path
        const response = await fetch('/assets/typing_learning_phases.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.phases) {
          setPhases(data.phases);
        } else {
          throw new Error("Invalid JSON structure");
        }
      } catch (err) {
        console.error("Failed to load phases:", err);
        setError(err instanceof Error ? err.message : 'Failed to load typing phases.');
      }
      setIsLoading(false);
    };

    fetchPhases();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-slate-500">Loading phases...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full md:w-1/4 p-4 bg-slate-50 rounded-lg shadow-md max-h-[calc(100vh-200px)] overflow-y-auto">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4">Learning Phases</h2>
      <ul className="space-y-2">
        {phases.map((phase) => (
          <li key={phase.phase}>
            <button
              onClick={() => onPhaseSelect(phase.sentences, phase.phase)}
              className={`w-full text-left p-3 rounded-md transition-colors duration-150 
                          ${currentPhase === phase.phase 
                            ? 'bg-indigo-500 text-white shadow-lg' 
                            : 'bg-white hover:bg-indigo-100 text-slate-700'}`}
            >
              <span className="font-semibold">Phase {phase.phase}:</span> {phase.description}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PhrasesUI; 