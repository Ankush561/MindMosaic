import React, { useState, useEffect } from 'react';
import './NodeEditor.css';
import SaveIcon from './icons/SaveIcon';
import CancelIcon from './icons/CancelIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';

const NodeEditor = ({ node, onSave, onDelete, onCancel }) => {
  const [formData, setFormData] = useState({
    title: node?.title || '',
    content: node?.content || '',
    tags: node?.tags?.join(', ') || ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Update form data when node changes
  useEffect(() => {
    setFormData({
      title: node?.title || '',
      content: node?.content || '',
      tags: node?.tags?.join(', ') || ''
    });
  }, [node]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    
    const tagsArray = formData.tags.split(',').map(tag => tag.trim());
    console.log('Data being sent:', {
      ...node,
      ...formData,
      tags: tagsArray
    });
    
    onSave({
      ...node,
      ...formData,
      tags: tagsArray
    });
  };

  const handleDeleteRequest = () => {
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setShowConfirmModal(false);
    
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      if (onCancel) onCancel();
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
  };
  
  return (
    <>
      <div className="editor-panel">
        <h2>{node?._id ? 'Edit Node' : 'Create Node'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
            />
          </div>
        
          <div className="editor-actions">
            <button type="submit" className="button primary">
              <SaveIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Save
            </button>
            {onCancel && (
              <button type="button" className="button secondary" onClick={onCancel}>
                <CancelIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Cancel
              </button>
            )}
            {onDelete && node?._id && (
              <button
                type="button"
                className="button danger"
                onClick={handleDeleteRequest}
                disabled={isDeleting}
                style={{ width: '100%' }}
              >
                <TrashIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                {isDeleting ? 'Deleting Node...' : 'Delete Node'}
              </button>
            )}
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        message="Permanently delete this node? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete Node"
        cancelText="Keep Node"
      />
    </>
  );
};

export default NodeEditor;