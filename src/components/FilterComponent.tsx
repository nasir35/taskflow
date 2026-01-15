import { useState } from "react";
import { Filter, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PriorityFilter() {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const priorities = [
    {
      id: "low",
      label: "Low",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-500/10",
      textColor: "text-emerald-700",
    },
    {
      id: "medium",
      label: "Medium",
      color: "bg-amber-500",
      lightColor: "bg-amber-500/10",
      textColor: "text-amber-700",
    },
    {
      id: "high",
      label: "High",
      color: "bg-rose-500",
      lightColor: "bg-rose-500/10",
      textColor: "text-rose-700",
    },
  ];

  const togglePriority = (priorityId: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priorityId) ? prev.filter((id) => id !== priorityId) : [...prev, priorityId]
    );
  };

  const clearFilters = () => {
    setSelectedPriorities([]);
  };

  const handleApply = () => {
    console.log("Selected priorities:", selectedPriorities);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300",
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
          "hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105",
          "active:scale-95",
          "border border-blue-400/30"
        )}
      >
        <div className="relative">
          <Filter className="w-5 h-5" />
          {selectedPriorities.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {selectedPriorities.length}
            </span>
          )}
        </div>
        <span>Filter by Priority</span>
        <div className={cn("transition-transform duration-300", isOpen && "rotate-180")}>▼</div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-80 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Panel Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Select Priority</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="p-4 space-y-2">
              {priorities.map((priority) => {
                const isSelected = selectedPriorities.includes(priority.id);
                return (
                  <button
                    key={priority.id}
                    onClick={() => togglePriority(priority.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "border-2",
                      isSelected
                        ? `${priority.lightColor} ${priority.color}/30 border-${priority.color}`
                        : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        isSelected
                          ? `${priority.color} border-${priority.color}`
                          : "border-slate-300 dark:border-slate-500"
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>

                    {/* Label */}
                    <div className="flex-1 text-left">
                      <span
                        className={cn(
                          "font-semibold",
                          isSelected ? priority.textColor : "text-slate-900 dark:text-white"
                        )}
                      >
                        {priority.label}
                      </span>
                    </div>

                    {/* Color Indicator */}
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full transition-transform",
                        priority.color,
                        isSelected && "scale-125"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600 flex gap-3">
              {selectedPriorities.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={handleApply}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  selectedPriorities.length > 0
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                    : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                )}
                disabled={selectedPriorities.length === 0}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
