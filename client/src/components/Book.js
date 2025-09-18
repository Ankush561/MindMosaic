import React, { useState } from 'react';
import './Book.css';

const Book = ({ onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [files, setFiles] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState('');

  // Placeholder functions - to be implemented
  const handleCreateFile = async (e) => {
    e.preventDefault();
    // TODO: Implement file creation
  };

  const handleFileClick = (file) => {
    // TODO: Implement file selection
  };

  const handleDeleteFile = async (fileId) => {
    // TODO: Implement file deletion
  };

  const handleEditFile = async (fileId, newData) => {
    // TODO: Implement file editing
  };

  const handlePageTurn = (direction) => {
    // TODO: Implement page turning animation
  };

  return (
    <div className={`book-container ${isOpen ? 'open' : ''}`}>
      <div className="book">
        <div className="book-cover" onClick={() => setIsOpen(!isOpen)}>
          <h1>Graph Book</h1>
          <div className="book-spine"></div>
        </div>
        
        <div className="book-content">
          {/* File Creation Form */}
          <div className="book-page book-form-page">
            <h2>Create New Page</h2>
            <form onSubmit={handleCreateFile}>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter page title"
                className="page-input"
              />
              <button type="submit" className="create-page-btn">
                Add Page
              </button>
            </form>
            {error && <div className="error-message">{error}</div>}
          </div>

          {/* File List */}
          <div className="book-pages">
            {files.map((file, index) => (
              <div
                key={file._id}
                className={`book-page ${currentPage === index ? 'current' : ''}`}
                onClick={() => handleFileClick(file)}
              >
                <div className="page-content">
                  <h3>{file.name}</h3>
                  <p className="page-info">
                    {file.nodes?.length || 0} nodes
                  </p>
                  <div className="page-actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement edit
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="page-number">{index + 1}</div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="book-navigation">
            <button
              className="nav-btn prev"
              onClick={() => handlePageTurn('prev')}
              disabled={currentPage === 0}
            >
              ←
            </button>
            <span className="page-counter">
              {files.length > 0 ? `${currentPage + 1} / ${files.length}` : '0 / 0'}
            </span>
            <button
              className="nav-btn next"
              onClick={() => handlePageTurn('next')}
              disabled={currentPage === files.length - 1}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book; 