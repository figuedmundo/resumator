import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { devLog } from '@/utils/helpers';
import { STATUS_CONFIG } from '../components/Applications';

const useApplicationList = (perPage = 20) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = { page: currentPage, per_page: perPage };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery.trim();

      const data = await apiService.getApplications(params);
      setApplications(data.applications || []);
      setTotalCount(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / perPage));
      devLog('Applications loaded:', data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setError('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, statusFilter, searchQuery]);

  const loadStats = useCallback(async () => {
    try {
      const statusCounts = {};
      for (const status of STATUS_CONFIG) {
        try {
          const data = await apiService.getApplications({ status: status.value, page: 1, per_page: 1 });
          statusCounts[status.value] = data.total || 0;
        } catch (e) {
          statusCounts[status.value] = 0;
        }
      }
      setStats(statusCounts);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [currentPage, statusFilter, loadApplications]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadApplications();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const refresh = () => {
    loadApplications();
    loadStats();
  };

  return {
    state: {
      applications,
      loading,
      error,
      searchQuery,
      statusFilter,
      stats,
      currentPage,
      totalPages,
      totalCount,
      perPage,
    },
    handlers: {
      setSearchQuery,
      setStatusFilter,
      handleSearch,
      handlePageChange,
      refresh,
      setApplications,
      setTotalCount,
    },
  };
};

export default useApplicationList;
