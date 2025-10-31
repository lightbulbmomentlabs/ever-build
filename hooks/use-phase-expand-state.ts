/**
 * Hook for managing phase expand/collapse state with localStorage persistence
 */

import { useState, useEffect } from 'react';

type Phase = {
  id: string;
  is_task: boolean;
};

interface UsePhaseExpandStateReturn {
  expandedPhases: Set<string>;
  togglePhase: (phaseId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isExpanded: (phaseId: string) => boolean;
}

export function usePhaseExpandState(
  projectId: string,
  phases: Phase[]
): UsePhaseExpandStateReturn {
  const key = `project_${projectId}_phase_expand_state`;

  // Initialize with empty Set to prevent hydration mismatch
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage after mount to avoid hydration issues
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) return;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setExpandedPhases(new Set(JSON.parse(saved)));
        setIsInitialized(true);
        return;
      }
    } catch (error) {
      console.error('Failed to load expand state from localStorage:', error);
    }

    // Default: all expanded on first visit
    if (phases.length > 0) {
      const topLevelPhaseIds = phases
        .filter(p => !p.is_task)
        .map(p => p.id);

      if (topLevelPhaseIds.length > 0) {
        setExpandedPhases(new Set(topLevelPhaseIds));
      }
    }

    setIsInitialized(true);
  }, [key, phases, isInitialized]);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify([...expandedPhases]));
    } catch (error) {
      console.error('Failed to save expand state to localStorage:', error);
    }
  }, [expandedPhases, key]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allPhaseIds = phases
      .filter(p => !p.is_task)
      .map(p => p.id);
    setExpandedPhases(new Set(allPhaseIds));
  };

  const collapseAll = () => {
    setExpandedPhases(new Set());
  };

  const isExpanded = (phaseId: string) => {
    return expandedPhases.has(phaseId);
  };

  return {
    expandedPhases,
    togglePhase,
    expandAll,
    collapseAll,
    isExpanded,
  };
}
