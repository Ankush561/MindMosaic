import React from 'react';
import './NodeViewer.css';
import PencilIcon from './icons/PencilIcon';

const NodeViewer = ({ node, onEdit }) => {
  if (!node) return null;

  return (
    <div className="node-viewer">
      <div className="node-viewer-header">
        <h3>{node.title}</h3>
      </div>
      <div className="node-viewer-content">
        <p>{node.content}</p>
      </div>
      {node.tags && node.tags.length > 0 && (
        <div className="node-viewer-tags">
          {node.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="node-viewer-actions">
        <button onClick={onEdit} className="button secondary">
          <PencilIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Edit
        </button>
      </div>
    </div>
  );
};

export default NodeViewer; 