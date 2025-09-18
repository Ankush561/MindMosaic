import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import './FileList.css';
import PlusIcon from './icons/PlusIcon';
import SaveIcon from './icons/SaveIcon';
import CancelIcon from './icons/CancelIcon';

const FileList = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createError, setCreateError] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await api.getFiles();
      setFiles(response.data);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files. Please try again.');
    }
  };

  const handleInitiateCreateFile = () => {
    setShowCreateInput(true);
    setNewFileName('');
    setCreateError('');
  };

  const handleCancelCreateFile = () => {
    setShowCreateInput(false);
    setNewFileName('');
    setCreateError('');
  };

  const handleSaveNewFile = async (e) => {
    e.preventDefault();
    const trimmedName = newFileName.trim();
    
    if (!trimmedName) {
      setCreateError('Please enter a file name for the new file.');
      return;
    }

    if (files.some(file => file.name.toLowerCase() === trimmedName.toLowerCase())) {
      setCreateError('A file with this name already exists.');
      return;
    }

    setCreateError('');
    setError('');
    setIsCreating(true);

    try {
      const response = await api.createFile(trimmedName);
      setShowCreateInput(false);
      setNewFileName('');
      await loadFiles();
      onFileSelect(response.data);
    } catch (err) {
      console.error('Error creating file:', err);
      setCreateError('Failed to create file. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDoubleClick = (file) => {
    onFileSelect(file);
  };

  const filteredFiles = useMemo(() => {
    console.log('Filtering with searchTerm:', searchTerm);
    if (!searchTerm) {
      return files;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const result = files.filter(file => 
      file.name.toLowerCase().includes(lowerSearchTerm)
    );
    console.log('Filtered files count:', result.length);
    return result;
  }, [files, searchTerm]);

  return (
    <div className="file-list-container">
      <h2>Files</h2>

      <div className="file-actions-bar">
        <div className="file-search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files by name..."
            className="file-input search-input"
          />
        </div>

        {!showCreateInput && (
          <button 
            onClick={handleInitiateCreateFile}
            className="button primary create-file-toggle-btn"
          >
            <PlusIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Create New File
          </button>
        )}
      </div>
      
      {showCreateInput && (
        <form onSubmit={handleSaveNewFile} className="file-create-form-active">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => {
              setNewFileName(e.target.value);
              setCreateError(''); 
            }}
            placeholder="Enter new file name"
            className="file-input create-new-file-input-active"
            disabled={isCreating}
            autoFocus
          />
          <div className="create-form-buttons">
            <button 
              type="submit" 
              className="button primary save-new-file-btn"
              disabled={isCreating}
            >
              <SaveIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              {isCreating ? 'Creating...' : 'Create File'}
            </button>
            <button 
              type="button" 
              className="button secondary cancel-create-btn"
              onClick={handleCancelCreateFile}
              disabled={isCreating}
            >
              <CancelIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Cancel
            </button>
          </div>
        </form>
      )}
      {createError && <div className="error-message create-error-message">{createError}</div>}
      {error && <div className="error-message">{error}</div>} 

      <div className="file-list">
        {filteredFiles.length > 0 ? (
          filteredFiles.map(file => (
            <div
              key={file._id}
              className="file-item"
              onDoubleClick={() => handleDoubleClick(file)}
            >
              <span className="file-number">#{file.srNo}</span>
              <span className="file-name">{file.name}</span>
              <span className="file-nodes-count">{file.nodes?.length || 0} nodes</span>
            </div>
          ))
        ) : (
          <div className="empty-files">
            {searchTerm && files.length > 0 ? 'No files match your search.' : 
             !searchTerm && files.length === 0 ? 'No files yet. Click "Create New File" to start.' : 
             searchTerm && files.length === 0 ? 'No files to search. Create one first!' :
             'No files found.'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default FileList; 