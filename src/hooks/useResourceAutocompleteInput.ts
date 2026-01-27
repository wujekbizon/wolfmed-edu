import { useRef, useState } from 'react';

interface Resource {
  name: string;
  displayName: string;
}

export function useResourceAutocompleteInput(resources: Resource[]) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredResources = resources.filter((r) =>
    r.name.toLowerCase().includes(autocompleteQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredResources.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredResources.length > 0) {
      e.preventDefault();
      const selected = filteredResources[selectedIndex];
      if (selected) {
        insertResource(selected.name);
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  const insertResource = (filename: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart || 0;
    const value = textarea.value;

    const textBefore = value.substring(0, cursorPos);
    const atIndex = textBefore.lastIndexOf('@');

    const newValue =
      value.substring(0, atIndex) + `@${filename} ` + value.substring(cursorPos);

    textarea.value = newValue;
    const newCursorPos = atIndex + filename.length + 2;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    setShowAutocomplete(false);
  };

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
