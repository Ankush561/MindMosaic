import React, { useState, useEffect } from 'react';
import Graph from './components/graph.js';
import NodeEditor from './components/NodeEditor.js';
import api from './services/api.js';
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
      setNodes([...nodesRes.data]);
      setEdges([...edgesRes.data]);
      
      console.log('Data refreshed:', {
        nodes: nodesRes.data.length,
        edges: edgesRes.data.length
      });
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  const handleCreateNew = () => {
    setSelectedNode(null);
    setIsCreating(true);
  };
  
  // const handleSave = async (nodeData) => {
  //   try {
  //     console.log('Saving node:', nodeData); // Debug log
      
  //     if (nodeData._id) {
  //       // Update existing node
  //       await api.updateNode(nodeData._id, {
  //         title: nodeData.title,
  //         content: nodeData.content,
  //         tags: nodeData.tags
  //       });
  //     } else {
  //       // Create new node
  //       await api.createNode({
  //         title: nodeData.title,
  //         content: nodeData.content,
  //         tags: nodeData.tags
  //       });
  //     }
      
  //     // Refresh data and reset UI
  //     await fetchData();
  //     setSelectedNode(null);
  //     setIsCreating(false);
      
  //   } catch (err) {
  //     console.error('Save failed:', err.response?.data || err.message);
  //     alert(`Save failed: ${err.response?.data?.message || err.message}`);
  //   }
  // };
  const handleSave = async (nodeData) => {
    console.group('Saving Node Process');
    try {
      console.log('Final payload:', JSON.stringify(nodeData, null, 2));
      
      const response = nodeData._id
        ? await api.updateNode(nodeData._id, nodeData)
        : await api.createNode(nodeData);

        alert(`✅ Node ${nodeData._id ? 'updated' : 'created'}! ID: ${response.data._id}`);

      console.log('Save successful!', response.data);
      await fetchData();
    } catch (err) {
      console.error('Save failed:', {
        error: err,
        request: err.config,
        response: err.response?.data
      });
    } finally {
      console.groupEnd();
      setSelectedNode(null);
      setIsCreating(false);
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
          nodes={nodes || []}       // Fallback empty array
          edges={edges || []}       // Fallback empty array
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
  useEffect(() => {
    const testSave = async () => {
      const testNode = {
        title: "Test Node",
        content: "Test Content",
        tags: ["test"]
      };
      console.log("Testing API...");
      await api.createNode(testNode);
    };
    testSave();
  }, []);
}
// Temporary test in App.js

export default App;