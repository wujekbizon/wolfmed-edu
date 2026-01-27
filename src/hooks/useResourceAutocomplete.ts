import { useState, useEffect } from 'react';
import type { Resource } from '@/types/resourceTypes';

export function useResourceAutocomplete() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/mcp/resources');
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setResources([]);
        } else {
          setResources(data.resources || []);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        setError('Failed to load resources');
        setResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  return { resources, loading, error };
}
