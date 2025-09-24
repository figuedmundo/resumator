import { useState } from 'react';

/**
 * Custom hook for managing application deletion confirmation dialogs
 */
export function useApplicationDeletion() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  const confirmDeleteApplication = (application) => {
    setApplicationToDelete(application);
    setShowDeleteDialog(true);
  };

  const cancelDeletion = () => {
    setShowDeleteDialog(false);
    setApplicationToDelete(null);
  };

  const getDeleteDialogProps = () => ({
    isOpen: showDeleteDialog,
    onClose: cancelDeletion,
    title: "Delete Application",
    message: applicationToDelete 
      ? `Are you sure you want to delete your application to ${applicationToDelete.company} for the ${applicationToDelete.position} position? This action cannot be undone.`
      : '',
    confirmText: "Delete",
    variant: "danger",
  });

  return {
    showDeleteDialog,
    applicationToDelete,
    confirmDeleteApplication,
    cancelDeletion,
    getDeleteDialogProps,
  };
}
