import React, { useState, useEffect } from 'react';
import Graph from './components/Graph';
import NodeEditor from './components/NodeEditor';
import api from './services/api';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="app-container">
      <div className="graph-container">
        <Graph 
          nodes={nodes} 
          edges={edges} 
          onNodeClick={setSelectedNode}
        />
      </div>
      <div className="editor-container">
        <NodeEditor 
          node={selectedNode} 
          onSave={fetchData}
        />
      </div>
    </div>
  );
}

export default App;