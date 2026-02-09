"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Repository {
  id: string;
  name: string;
  url: string;
  status: string;
  lastSynced: string;
  branch: string;
  language: string;
  progress?: number;
}

interface RepositoryContextType {
  repositories: Repository[];
  setRepositories: (repos: Repository[]) => void;
  selectedRepo: Repository | null;
  setSelectedRepo: (repo: Repository | null) => void;
  fetchRepositories: () => Promise<void>;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [repositories, setRepositoriesState] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('repositories');
    if (stored) {
      try {
        setRepositoriesState(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored repositories', e);
      }
    }
    
    const storedSelected = localStorage.getItem('selectedRepo');
    if (storedSelected) {
      try {
        setSelectedRepo(JSON.parse(storedSelected));
      } catch (e) {
        console.error('Failed to parse selected repo', e);
      }
    }
  }, []);

  // Save to localStorage whenever repositories change
  const setRepositories = (repos: Repository[]) => {
    setRepositoriesState(repos);
    localStorage.setItem('repositories', JSON.stringify(repos));
  };

  // Save selected repo to localStorage
  const setSelectedRepoWithStorage = (repo: Repository | null) => {
    setSelectedRepo(repo);
    if (repo) {
      localStorage.setItem('selectedRepo', JSON.stringify(repo));
    } else {
      localStorage.removeItem('selectedRepo');
    }
  };

  // Fetch repositories from backend
  const fetchRepositories = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/repos');
      if (res.ok) {
        const data = await res.json();
        setRepositories(data);
      }
    } catch (e) {
      console.error('Failed to fetch repos', e);
    }
  };

  return (
    <RepositoryContext.Provider
      value={{
        repositories,
        setRepositories,
        selectedRepo,
        setSelectedRepo: setSelectedRepoWithStorage,
        fetchRepositories,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
}
