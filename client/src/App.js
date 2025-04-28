import React, { useState, useEffect } from 'react';
import NodeEditor from './components/NodeEditor';
import Graph from './components/Graph.js';
import api from './services/api';
import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [nodesRes, edgesRes] = await Promise.all([
        api.getNodes(),
        api.getEdges()
      ]);
      setNodes(nodesRes.data);
      setEdges(edgesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleCreateNew = () => {
    setSelectedNode(null);
    setIsCreating(true);
  };

  const handleSave = async (nodeData) => {
    try {
      console.log('Saving node:', nodeData); // Debug log
      
      if (nodeData._id) {
        // Update existing node
        await api.updateNode(nodeData._id, {
          title: nodeData.title,
          content: nodeData.content,
          tags: nodeData.tags
        });
      } else {
        // Create new node
        await api.createNode({
          title: nodeData.title,
          content: nodeData.content,
          tags: nodeData.tags
        });
      }
      
      // Refresh data and reset UI
      await fetchData();
      setSelectedNode(null);
      setIsCreating(false);
      
    } catch (err) {
      console.error('Save failed:', err.response?.data || err.message);
      alert(`Save failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNode(id);
      await fetchData();
      setSelectedNode(null);
    } catch (err) {
      console.error('Error deleting node:', err);
    }
  };

  return (
    <div className="app-container">
      <div className="graph-container">
        <Graph 
          nodes={nodes} 
          edges={edges} 
          onNodeClick={setSelectedNode}
          onCreateNew={handleCreateNew}
        />
      </div>
      <div className="editor-container">
        {(selectedNode || isCreating) ? (
          <NodeEditor 
            node={selectedNode || { title: '', content: '', tags: [] }}
            onSave={handleSave}
            onDelete={selectedNode ? () => handleDelete(selectedNode._id) : null}
            onCancel={() => {
              setSelectedNode(null);
              setIsCreating(false);
            }}
          />
        ) : (
          <div className="empty-state">
            <p>Select a node or</p>
            <button onClick={handleCreateNew}>Create New Node</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;