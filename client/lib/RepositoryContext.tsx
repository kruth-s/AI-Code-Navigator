"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

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

const RepositoryContext = createContext<RepositoryContextType | undefined>(
  undefined,
);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [repositories, setRepositoriesState] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("repositories");
    if (stored) {
      try {
        setRepositoriesState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored repositories", e);
      }
    }

    const storedSelected = localStorage.getItem("selectedRepo");
    if (storedSelected) {
      try {
        setSelectedRepo(JSON.parse(storedSelected));
      } catch (e) {
        console.error("Failed to parse selected repo", e);
      }
    }
  }, []);

  // Save to localStorage whenever repositories change
  const setRepositories = useCallback((repos: Repository[]) => {
    setRepositoriesState(repos);
    localStorage.setItem("repositories", JSON.stringify(repos));
  }, []);

  // Save selected repo to localStorage
  const setSelectedRepoWithStorage = useCallback((repo: Repository | null) => {
    setSelectedRepo(repo);
    if (repo) {
      localStorage.setItem("selectedRepo", JSON.stringify(repo));
    } else {
      localStorage.removeItem("selectedRepo");
    }
  }, []);

  // Fetch repositories from backend
  const fetchRepositories = useCallback(async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      const apiUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      
      let mapped: Repository[] = [];
      const res = await fetch(`${apiUrl}/api/users/${userId}/repositories`);
      if (res.ok) {
        const data = await res.json();
        // Map DB repos to context shape
        mapped = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          url: r.html_url || "",
          status: r.is_indexed ? "Indexed" : "Pending",
          lastSynced: r.updated_at || "",
          branch: "main",
          language: "Unknown",
        }));
      }

      // Merge manually imported global JSON repos
      try {
        const jsonRes = await fetch(`${apiUrl}/api/repos`);
        if (jsonRes.ok) {
          const jsonRepos = await jsonRes.json();
          jsonRepos.forEach((jr: any) => {
            const existing = mapped.find(mr => 
              mr.name === jr.name || 
              mr.url === jr.url ||
              (mr.url && jr.url && mr.url.replace('.git', '') === jr.url.replace('.git', ''))
            );
            
            if (!existing) {
              mapped.push(jr);
            } else {
              // Update status from JSON if it's more accurate
              if (jr.status === "Indexed") {
                existing.status = "Indexed";
              } else if (jr.status === "Indexing") {
                existing.status = "Indexing";
              }
            }
          });
        }
      } catch(e) {}

      setRepositories(mapped);
    } catch (e) {
      console.error("Failed to fetch repos:", e);
      // Don't throw - just use empty state
    }
  }, [setRepositories]);

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
    throw new Error("useRepository must be used within a RepositoryProvider");
  }
  return context;
}
