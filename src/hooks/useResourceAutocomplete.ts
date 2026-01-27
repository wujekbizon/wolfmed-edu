import { useState, useEffect } from 'react';

interface Resource {
  name: string;
  displayName: string;
}

export function useResourceAutocomplete() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const res = await fetch('/api/mcp/resources');
        const data = await res.json();
        setResources(data.resources || []);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  return { resources, loading };
}
