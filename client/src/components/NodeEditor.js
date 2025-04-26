import React, { useState } from 'react';
import api from '../services/api';
import './NodeEditor.css';

const NodeEditor = ({ node, onSave }) => {
  const [formData, setFormData] = useState({
    title: node?.title || '',
    content: node?.content || '',
    tags: node?.tags?.join(', ') || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim());
      const payload = { ...formData, tags: tagsArray };
      
      if (node?._id) {
        await api.updateNode(node._id, payload);
      } else {
        await api.createNode(payload);
      }
      onSave();
    } catch (err) {
      console.error('Error saving node:', err);
    }
  };

  return (
    <div className="editor-panel">
      <h2>{node?._id ? 'Edit Node' : 'Create Node'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="5"
          />
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="save-btn">
          Save
        </button>
      </form>
    </div>
  );
};

export default NodeEditor;