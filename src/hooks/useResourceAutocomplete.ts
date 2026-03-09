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
    // AbortController lets us cancel the fetch if the component unmounts before
    // the request completes — prevents updating state on an unmounted component.
    const controller = new AbortController();

    async function fetchResources() {
      setLoading(true);
      setError(null);
      try {
        // Pass the controller's signal to fetch — it will automatically cancel
        // the request when controller.abort() is called (see cleanup below).
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
        // AbortError is thrown when we intentionally cancel — not a real error,
        // so we silently return instead of logging or updating error state.
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources');
        setResources([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();

    // Cleanup: called by React when the component unmounts or before the next
    // effect run. Cancels any in-flight request tied to this controller.
    return () => controller.abort();
  }, []);

  return { resources, loading, error };
}
