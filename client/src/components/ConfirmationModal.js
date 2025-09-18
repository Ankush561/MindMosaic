import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="button secondary modal-button cancel-button">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="button danger modal-button confirm-button">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 