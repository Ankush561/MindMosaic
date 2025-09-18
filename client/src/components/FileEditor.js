import React, { useState } from 'react';
import './FileEditor.css';
import SaveIcon from './icons/SaveIcon';
import CancelIcon from './icons/CancelIcon';
import TrashIcon from './icons/TrashIcon';

const FileEditor = ({ file, onSave, onCancel, onDelete }) => {
  const [fileName, setFileName] = useState(file ? file.name : '');
  const [description, setDescription] = useState(file ? file.description || '' : '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...file,
      name: fileName,
      description: description
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(file._id);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="file-editor file-editor-form">
      <h3>Edit File</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fileName">File Name</label>
          <input
            type="text"
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter file description"
            rows="4"
          />
        </div>
        <div className="button-group">
          <button type="submit" className="button primary">
            <SaveIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Save Changes
          </button>
          <button type="button" className="button secondary" onClick={onCancel}>
            <CancelIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Cancel
          </button>
        </div>
      </form>
      
      <div className="delete-section">
        {!showDeleteConfirm ? (
          <button 
            type="button" 
            className="button danger"
            onClick={handleDeleteClick}
            style={{ width: '100%' }}
          >
            <TrashIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Delete File
          </button>
        ) : (
          <div className="delete-confirm">
            <p>Are you sure you want to delete this file? This action cannot be undone.</p>
            <div className="button-group">
              <button 
                type="button" 
                className="button danger"
                onClick={handleDeleteConfirm}
              >
                <TrashIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Yes, Delete File
              </button>
              <button 
                type="button" 
                className="button secondary"
                onClick={handleDeleteCancel}
              >
                <CancelIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditor; 