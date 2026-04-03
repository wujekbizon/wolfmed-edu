import { useRef, useState, useMemo, useCallback } from 'react';
import type { Resource } from '@/types/resourceTypes';

/**
 * Manages @-mention resource autocomplete for a textarea.
 *
 * Detects when the user types "@" and filters the dynamic resources list
 * (docs, notes, materials loaded from the API) against the typed query.
 * Handles keyboard navigation (↑ ↓ Enter Tab Escape). On selection it inserts
 * the resource display name directly into the uncontrolled textarea via DOM
 * mutation and dispatches a synthetic "input" event so parent change handlers
 * stay in sync.
 *
 * Owns the textareaRef — the ref is shared with useCommandAutocompleteInput
 * via the return value. The consumer is responsible for routing input/keydown
 * events to the correct hook based on which autocomplete is currently active.
 *
 * Used in: RagCellForm (@ resource mentions in the AI query textarea)
 */
export function useResourceAutocompleteInput(resources: Resource[]) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredResources = useMemo(
    () => resources.filter((r) =>
      r.displayName.toLowerCase().includes(autocompleteQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(autocompleteQuery.toLowerCase())
    ),
    [resources, autocompleteQuery]
  );

  const insertResource = useCallback((displayName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart ?? 0;
    const value = textarea.value;

    const textBefore = value.substring(0, cursorPos);
    const atIndex = textBefore.lastIndexOf('@');

    const newValue =
      value.substring(0, atIndex) + `@${displayName} ` + value.substring(cursorPos);

    textarea.value = newValue;
    const newCursorPos = atIndex + displayName.length + 2;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    setShowAutocomplete(false);

    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  }, [textareaRef]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart ?? 0;

    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.substring(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setAutocompleteQuery(query);
        setShowAutocomplete(true);
        setSelectedIndex(0);
        return;
      }
    }

    setShowAutocomplete(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredResources.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if ((e.key === 'Enter' || e.key === 'Tab') && filteredResources.length > 0) {
      e.preventDefault();
      const selected = filteredResources[selectedIndex];
      if (selected) insertResource(selected.displayName);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  }, [showAutocomplete, filteredResources, selectedIndex, insertResource]);

  return {
    textareaRef,
    showAutocomplete,
    filteredResources,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    insertResource,
  };
}
