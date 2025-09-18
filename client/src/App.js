import React, { useState, useEffect, useCallback } from 'react';
import Graph from './components/Graph.js';
import NodeEditor from './components/NodeEditor.js';
import NodeViewer from './components/NodeViewer.js';
import FileList from './components/FileList.js';
import FileEditor from './components/FileEditor.js';
import api from './services/api.js';
import './App.css';
import PencilIcon from './components/icons/PencilIcon.js';
import BackArrowIcon from './components/icons/BackArrowIcon.js';
import logo from './assets/logo.png';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [interactionMode, setInteractionMode] = useState('select');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [newNodeInitialPositionArgs, setNewNodeInitialPositionArgs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if any panel that affects graph layout is visible
  const isAnyPanelVisible = (selectedNode && isEditing) || (selectedNode && !isEditing && !isCreating) || isEditingFile;

  useEffect(() => {
    if (selectedFile) {
      loadFileData();
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedFile]);

  const loadFileData = useCallback(async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      // First load nodes
      const response = await api.getFile(selectedFile._id);
      if (!response.data.nodes) {
        setNodes([]);
        setEdges([]);
        setIsLoading(false);
        return;
      }

      // Process nodes and set them
      const nodesWithPositions = response.data.nodes.map(node => {
        if (!node.position || (node.position.x === null && node.position.y === null)) {
          return {
            ...node,
            position: {
              x: Math.random() * 600 + 100,
              y: Math.random() * 400 + 100
            }
          };
        }
        return node;
      });
      setNodes(nodesWithPositions);

      // Load and filter edges (robust to populated or unpopulated edge refs)
      const allEdges = await api.getEdges();
      const nodeIds = new Set(response.data.nodes.map(n => n._id));
      const filteredEdges = allEdges.data.filter(edge => {
        const s = typeof edge.source === 'object' ? edge.source?._id : edge.source;
        const t = typeof edge.target === 'object' ? edge.target?._id : edge.target;
        return nodeIds.has(s) && nodeIds.has(t);
      });
      setEdges(filteredEdges);
    } catch (err) {
      console.error('Error loading file data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile?._id]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleNodeClick = useCallback((node) => {
    // In connect mode, the Graph component handles the click. This function is for select mode only.
    if (interactionMode !== 'connect') {
      setSelectedNode(node);
      setIsEditing(false);
      setIsCreating(false);
    }
  }, [interactionMode]);

  const handleNodeDoubleClick = useCallback((node) => {
    if (interactionMode !== 'connect') {
      setSelectedNode(node);
      setIsEditing(true);
      setIsCreating(false);
    }
  }, [interactionMode]);

  const handleCreateNode = useCallback((graphDimensions) => {
    if (graphDimensions) {
      setNewNodeInitialPositionArgs(graphDimensions);
    }
    setSelectedNode(null);
    setIsCreating(true);
    setIsEditing(true);
  }, []);

  const handleSave = async (nodeData) => {
    try {
      if (!nodeData._id) {
        let initialX = 300, initialY = 300;
        const minDistance = 100;
        const padding = 50;

        if (newNodeInitialPositionArgs && newNodeInitialPositionArgs.graphWidth && newNodeInitialPositionArgs.graphHeight) {
          const { graphWidth, graphHeight } = newNodeInitialPositionArgs;
          let targetX = graphWidth * 0.70;
          let targetY = graphHeight * 0.40;

          let positionFound = false;
          for (let attempt = 0; attempt < 30; attempt++) {
            let currentX = targetX;
            let currentY = targetY;

            if (attempt > 0) {
              const angle = Math.random() * 2 * Math.PI;
              const radius = 25 * Math.ceil(attempt / 8);
              currentX = targetX + radius * Math.cos(angle);
              currentY = targetY + radius * Math.sin(angle);
            }

            currentX = Math.max(padding, Math.min(graphWidth - padding, currentX));
            currentY = Math.max(padding, Math.min(graphHeight - padding, currentY));

            let collision = false;
            for (const node of nodes) {
              if (node.position) {
                const dist = Math.sqrt(Math.pow(node.position.x - currentX, 2) + Math.pow(node.position.y - currentY, 2));
                if (dist < minDistance) {
                  collision = true;
                  break;
                }
              }
            }

            if (!collision) {
              initialX = currentX;
              initialY = currentY;
              positionFound = true;
              break;
            }
          }
          if (!positionFound) {
            console.warn("Could not find an empty spot for new node, using last attempted or default.");
            initialX = Math.max(padding, Math.min(graphWidth - padding, targetX));
            initialY = Math.max(padding, Math.min(graphHeight - padding, targetY));
          }
          setNewNodeInitialPositionArgs(null);
        } else {
          console.warn("Graph dimensions not available for new node positioning, using defaults.");
        }
        nodeData.position = { x: initialX, y: initialY };
      }

      const isNewNodeCreation = !nodeData._id;

      const response = isNewNodeCreation ? await api.createNode(nodeData) : await api.updateNode(nodeData._id, nodeData);

      if (isNewNodeCreation && response.data && response.data._id) {
        const newNodeFromServer = response.data;

        // Ensure the position we calculated is on the node object
        newNodeFromServer.position = nodeData.position;
        if (selectedFile) {
          await api.addNodeToFile(selectedFile._id, newNodeFromServer._id);
        }
      }
      await loadFileData();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSelectedNode(null);
      setIsCreating(false);
      setIsEditing(false);
    }
  };

  const handleCreateEdge = async (edgeData) => {
    try {
      console.log('Creating edge:', edgeData);
      const response = await api.createEdge(edgeData);
      console.log('Edge created:', response.data);
      await loadFileData();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Unknown error creating edge';
      console.error('Failed to create edge:', msg, err?.response?.data);
      alert('Failed to create edge: ' + msg);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (selectedFile) {
        await api.removeNodeFromFile(selectedFile._id, id);
      }
      await api.deleteNode(id);
      await loadFileData();

      // If the deleted node was the selected one, clear selectedNode
      if (selectedNode && selectedNode._id === id) {
        setSelectedNode(null);
        setIsEditing(false); // Also reset editing mode
      }

    } catch (err) {
      console.error(`Deletion failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteEdge = useCallback(async (edgeId) => {
    try {
      await api.deleteEdge(edgeId);
      await loadFileData();
    } catch (err) {
      console.error(`Edge deletion failed: ${err.response?.data?.message || err.message}`);
    }
  }, [loadFileData]);

  const handleCancel = () => {
    setIsEditing(false);
    if (isCreating) {
      setSelectedNode(null);
      setIsCreating(false);
    }
  };

  const handleStartEdit = () => setIsEditing(true);
  const handleNodePositionChange = useCallback(async (nodeId, x, y) => {
    // Optimistic local update
    setNodes(prev => prev.map(n => n._id === nodeId ? { ...n, position: { x, y }, x, y } : n));
    try {
      await api.updateNodePosition(nodeId, { x, y });
    } catch (err) {
      console.error('Failed to persist node position:', err?.response?.data?.message || err.message);
      // Optionally reload data on failure to resync
      await loadFileData();
    }
  }, [loadFileData]);
  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setIsCreating(false);
    setIsEditing(false);
  }, []);
  const handleEditFile = () => setIsEditingFile(true);
  const handleFileEditSave = async (updatedFile) => {
    try {
      const response = await api.updateFile(updatedFile._id, { name: updatedFile.name, description: updatedFile.description });
      if (response.status === 200) {
        setSelectedFile(response.data);
        setIsEditingFile(false);
      } else {
        alert('Failed to update file. Please try again.');
      }
    } catch (err) {
      alert('Failed to update file: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleFileEditCancel = () => setIsEditingFile(false);
  const handleFileDelete = async (fileId) => {
    try {
      const response = await api.deleteFile(fileId);
      if (response.status === 200 || response.status === 204) {
        setSelectedFile(null);
        setIsEditingFile(false);
      } else {
        alert('Failed to delete file. Please try again.');
      }
    } catch (err) {
      alert('Failed to delete file: ' + (err.response?.data?.message || err.message));
    }
  };

  const isEditorVisible = (selectedNode && isEditing) || isCreating;
  const isViewerVisible = selectedNode && !isEditing && !isCreating;

  return (
    <div className={`app-container ${selectedFile ? 'graph-view-active' : ''}`}>
      <div className="project-title-header">
        <img src={logo} alt="Mind Mosaic Logo" className="project-logo" />
      </div>

      {!selectedFile ? (
        <FileList onFileSelect={handleFileSelect} />
      ) : (
        <>
          <div className="header">
            <button onClick={() => setSelectedFile(null)} className="back-btn">
              <BackArrowIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Back to Files
            </button>
            <h2>{selectedFile.name}</h2>
            <button onClick={handleEditFile} className="edit-file-btn">
              <PencilIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Edit File
            </button>
          </div>
          <div className="main-content">
            {isEditingFile ? (
              <div className="file-editor-container">
                <FileEditor
                  file={selectedFile}
                  onSave={handleFileEditSave}
                  onCancel={handleFileEditCancel}
                  onDelete={handleFileDelete}
                />
              </div>
            ) : (
              <>
                <div className="graph-container">
                  {isLoading ? (
                    <div className="loading-state">
                      Loading graph data...
                    </div>
                  ) : (
                    <Graph
                      nodes={nodes}
                      edges={edges}
                      onNodeClick={handleNodeClick}
                      onNodeDoubleClick={handleNodeDoubleClick}
                      onCreateNew={handleCreateNode}
                      onCreateEdge={handleCreateEdge}
                      onDeleteEdge={handleDeleteEdge}
                      interactionMode={interactionMode}
                      setInteractionMode={setInteractionMode}
                      onBackgroundClick={handleBackgroundClick}
                      isAnyPanelVisible={isAnyPanelVisible}
                      onNodePositionChange={handleNodePositionChange}
                    />
                  )}
                </div>
                <div className={`editor-container ${isEditorVisible || isViewerVisible ? 'visible' : ''}`}>
                  {isEditorVisible ? (
                    <NodeEditor
                      node={selectedNode || { title: '', content: '', tags: [] }}
                      onSave={handleSave}
                      onDelete={selectedNode ? () => handleDelete(selectedNode._id) : null}
                      onCancel={handleCancel}
                    />
                  ) : isViewerVisible ? (
                    <NodeViewer
                      node={selectedNode}
                      onEdit={handleStartEdit}
                    />
                  ) : null}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;