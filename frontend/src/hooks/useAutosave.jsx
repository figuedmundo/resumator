import { useState, useEffect, useCallback } from 'react';

const useAutosave = (callback, delay = 2000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [timeoutId, setTimeoutId] = useState(null);

  const handleSave = useCallback(async () => {
    if (saveStatus === 'saving') return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await callback();
      setSaveStatus('saved');
    } catch (error) {
      console.error('Autosave failed:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [callback, saveStatus]);

  const triggerSave = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setSaveStatus('unsaved');
    const newTimeoutId = setTimeout(() => {
      handleSave();
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [handleSave, delay, timeoutId]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return { isSaving, saveStatus, triggerSave };
};

export default useAutosave;
