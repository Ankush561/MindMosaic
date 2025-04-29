import React, { useState } from 'react';
import './NodeEditor.css';

const NodeEditor = ({ node, onSave, onDelete, onCancel }) => {
  const [formData, setFormData] = useState({
    title: node?.title || '',
    content: node?.content || '',
    tags: node?.tags?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted!'); // Add this
    
    const tagsArray = formData.tags.split(',').map(tag => tag.trim());
    console.log('Data being sent:', { // Add this
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
  
  return (
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
        
        <div className="button-group">
          <button type="submit" className="save-btn">
            Save
          </button>
          {onCancel && (
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          {onDelete && (
            <button type="button" className="delete-btn" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NodeEditor;