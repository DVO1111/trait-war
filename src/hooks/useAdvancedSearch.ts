import { useState, useMemo } from 'react';
import { Mission } from '@/hooks/useMissions';

export interface SearchFilters {
  query: string;
  category: string;
  difficulty: string;
  xpRange: [number, number];
  isOfficial: boolean | null;
  sortBy: 'created_at' | 'xp_reward' | 'title' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

export const useAdvancedSearch = (missions: Mission[]) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    difficulty: '',
    xpRange: [0, 1000],
    isOfficial: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAndSortedMissions = useMemo(() => {
    let filtered = missions.filter(mission => {
      // Text search
      if (filters.query && !mission.title.toLowerCase().includes(filters.query.toLowerCase()) && 
          !mission.description.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category && mission.category !== filters.category) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty && mission.difficulty !== filters.difficulty) {
        return false;
      }

      // XP range filter
      if (mission.xp_reward < filters.xpRange[0] || mission.xp_reward > filters.xpRange[1]) {
        return false;
      }

      // Official filter
      if (filters.isOfficial !== null && mission.is_official !== filters.isOfficial) {
        return false;
      }

      return true;
    });

    // Sort missions
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'xp_reward':
          aValue = a.xp_reward;
          bValue = b.xp_reward;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
          aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
          bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [missions, filters]);

  const paginatedMissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedMissions.slice(startIndex, endIndex);
  }, [filteredAndSortedMissions, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedMissions.length / itemsPerPage);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(missions.map(m => m.category))];
    return uniqueCategories.filter(Boolean);
  }, [missions]);

  const difficulties = useMemo(() => {
    const uniqueDifficulties = [...new Set(missions.map(m => m.difficulty))];
    return uniqueDifficulties.filter(Boolean);
  }, [missions]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      category: '',
      difficulty: '',
      xpRange: [0, 1000],
      isOfficial: null,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    paginatedMissions,
    totalMissions: filteredAndSortedMissions.length,
    currentPage,
    setCurrentPage,
    totalPages,
    categories,
    difficulties,
    hasActiveFilters: filters.query || filters.category || filters.difficulty || 
                     filters.xpRange[0] > 0 || filters.xpRange[1] < 1000 || 
                     filters.isOfficial !== null
  };
};