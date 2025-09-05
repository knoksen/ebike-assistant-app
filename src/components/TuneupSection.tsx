import { useState, useEffect } from 'react';
import '../styles/tuneup.css';

interface TuneupItem {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  requiredTools: string[];
  estimatedTime: number; // in minutes
  priority: 'high' | 'medium' | 'low';
}

interface TuneupSection {
  id: string;
  name: string;
  items: TuneupItem[];
}

const DEFAULT_TUNEUP_SECTIONS: TuneupSection[] = [
  {
    id: 'electrical',
    name: 'Electrical System',
    items: [
      {
        id: 'battery-inspection',
        name: 'Battery Health Check',
        description: 'Test battery voltage, inspect connections, check charging system',
        completed: false,
        requiredTools: ['Multimeter', 'Battery brush', 'Contact cleaner'],
        estimatedTime: 15,
        priority: 'high'
      },
      {
        id: 'motor-inspection',
        name: 'Motor Inspection',
        description: 'Check motor mounting, connections, listen for unusual sounds',
        completed: false,
        requiredTools: ['Allen keys', 'Torque wrench', 'Cleaning brush'],
        estimatedTime: 20,
        priority: 'high'
      },
      {
        id: 'wiring-check',
        name: 'Wiring Check',
        description: 'Inspect all electrical connections, cables, and display',
        completed: false,
        requiredTools: ['Electrical tape', 'Cable ties', 'Wire brush'],
        estimatedTime: 10,
        priority: 'medium'
      }
    ]
  },
  {
    id: 'mechanical',
    name: 'Mechanical System',
    items: [
      {
        id: 'drivetrain-check',
        name: 'Drivetrain Check',
        description: 'Inspect chain, cassette, derailleur, test shifting',
        completed: false,
        requiredTools: ['Chain wear tool', 'Chain lube', 'Cleaning brush'],
        estimatedTime: 25,
        priority: 'high'
      },
      {
        id: 'brake-inspection',
        name: 'Brake Inspection',
        description: 'Check brake pads, rotors, fluid levels, test operation',
        completed: false,
        requiredTools: ['Brake cleaner', 'Allen keys', 'Torque wrench'],
        estimatedTime: 30,
        priority: 'high'
      },
      {
        id: 'tire-inspection',
        name: 'Tire Inspection',
        description: 'Check tire pressure, wear, wheel true, spoke tension',
        completed: false,
        requiredTools: ['Tire pressure gauge', 'Spoke wrench', 'Truing stand'],
        estimatedTime: 20,
        priority: 'medium'
      }
    ]
  },
  {
    id: 'frame',
    name: 'Frame & Components',
    items: [
      {
        id: 'frame-inspection',
        name: 'Frame Inspection',
        description: 'Check frame integrity, bolts, mounting points',
        completed: false,
        requiredTools: ['Torque wrench', 'Allen keys', 'Inspection light'],
        estimatedTime: 15,
        priority: 'medium'
      },
      {
        id: 'suspension-check',
        name: 'Suspension Check',
        description: 'Test fork and shock operation, check seals',
        completed: false,
        requiredTools: ['Shock pump', 'Suspension oil', 'Seal driver'],
        estimatedTime: 20,
        priority: 'low'
      }
    ]
  }
];

export function TuneupSectionComponent() {
  const [sections, setSections] = useState<TuneupSection[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load saved tuneup state or use defaults
    const savedTuneup = localStorage.getItem('tuneup-state');
    setSections(savedTuneup ? JSON.parse(savedTuneup) : DEFAULT_TUNEUP_SECTIONS);
  }, []);

  useEffect(() => {
    // Calculate total time and progress
    if (sections.length > 0) {
      let total = 0;
      let completed = 0;
      let itemCount = 0;
      
      sections.forEach(section => {
        section.items.forEach(item => {
          total += item.estimatedTime;
          if (item.completed) completed++;
          itemCount++;
        });
      });
      
      setTotalTime(total);
      setProgress((completed / itemCount) * 100);
      
      // Save state
      localStorage.setItem('tuneup-state', JSON.stringify(sections));
    }
  }, [sections]);

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              return { ...item, completed: !item.completed };
            }
            return item;
          })
        };
      }
      return section;
    }));
  };

  const resetTuneup = () => {
    if (confirm('Are you sure you want to reset all tuneup progress?')) {
      setSections(DEFAULT_TUNEUP_SECTIONS);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <span className="text-2xl" role="img" aria-label="tuneup">🔧</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          E-Bike Tuneup Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete bike inspection and adjustment checklist
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="tuneup-progress-bar dark:tuneup-progress-bar-dark">
          <div 
            className="tuneup-progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Estimated time remaining: {Math.round(totalTime * (1 - progress/100))} minutes
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map(section => (
          <div 
            key={section.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {section.name}
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {section.items.map(item => (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      item.completed 
                        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' 
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className={`font-medium ${
                            item.completed 
                              ? 'text-green-700 dark:text-green-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.name}
                          </h3>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            item.priority === 'high' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : item.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.requiredTools.map((tool, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Estimated time: {item.estimatedTime} minutes
                        </div>
                      </div>
                      <button
                        onClick={() => toggleItem(section.id, item.id)}
                        className={`ml-4 p-2 rounded-full ${
                          item.completed
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                        title={item.completed ? "Mark as incomplete" : "Mark as complete"}
                        aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
                      >
                        <svg 
                          className="w-6 h-6" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          {item.completed ? (
                            <path d="M5 13l4 4L19 7" />
                          ) : (
                            <path d="M12 4v16m8-8H4" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <div className="mt-8 text-center">
        <button
          onClick={resetTuneup}
          className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          Reset Tuneup Progress
        </button>
      </div>
    </div>
  );
}

// Backward compatible export name
export { TuneupSectionComponent as TuneupSection }
