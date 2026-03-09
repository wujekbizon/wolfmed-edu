import { useState, useEffect } from 'react';
import type { Resource } from '@/types/resourceTypes';

/**
 * Fetches the current user's available resources (notes, materials, docs)
 * from the MCP resources API on mount. Cancels the in-flight request on unmount.
 */
export function useResourceAutocomplete() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResources() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/mcp/resources', { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setResources([]);
        } else {
          setResources(data.resources || []);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources');
        setResources([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();

    return () => controller.abort();
  }, []);

  return { resources, loading, error };
}
