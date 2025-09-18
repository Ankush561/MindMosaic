import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

// Simple icon components to replace the missing imports
const PlusIcon = ({ style }) => (
  <span style={style}>+</span>
);

const LinkIcon = ({ style }) => (
  <span style={style}>🔗</span>
);

// ConnectButton component with proper prop handling
const ConnectButton = ({ mode, setMode, linkingState, svgRef }) => {
  const handleClick = () => {
    const newMode = mode === 'connect' ? 'select' : 'connect';
    setMode(newMode);
    if (newMode === 'select') {
      d3.select(svgRef.current).selectAll('.temp-link').remove();
      linkingState.current = { sourceNode: null, tempLink: null, isLinking: false };
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: mode === 'connect' ? '#4CAF50' : '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <LinkIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
      {mode === 'connect' ? 'Stop Connecting' : 'Connect Nodes'}
    </button>
  );
};

const Graph = ({
  nodes = [],
  edges = [],
  onNodeClick,
  onNodeDoubleClick,
  onCreateNew,
  onCreateEdge,
  onDeleteEdge,
  interactionMode = 'select',
  setInteractionMode,
  onBackgroundClick
}) => {
  const svgRef = useRef(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const linkingState = useRef({
    sourceNode: null,
    tempLink: null,
    isLinking: false
  });
  const simulationRef = useRef();
  const graphDimensionsRef = useRef({ width: 600, height: 400 });

  // Drag behavior
  const dragBehavior = useCallback((sim) => {
    return d3.drag()
      .on('start', function (event, d) {
        if (interactionMode !== 'select') return;
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', function (event, d) {
        if (interactionMode !== 'select') return;
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function (event, d) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }, [interactionMode]);

  // Handle node click
  const handleNodeClick = useCallback((event, d) => {
    if (event.defaultPrevented) return;

    if (interactionMode === 'connect') {
      if (!linkingState.current.sourceNode) {
        // First click: Select the source node
        linkingState.current.sourceNode = d;
        linkingState.current.isLinking = true;

        // Remove existing temporary link if any
        d3.select(svgRef.current).selectAll('.temp-link').remove();

        // Create a new temporary link
        linkingState.current.tempLink = d3.select(svgRef.current)
          .append('line')
          .attr('class', 'temp-link')
          .attr('stroke', '#A8C3A4')
          .attr('stroke-dasharray', '5,5')
          .attr('stroke-width', 2);

        // Update link position on mouse move
        d3.select(svgRef.current).on('mousemove.temp-link', (e) => {
          if (linkingState.current.isLinking) {
            const [x, y] = d3.pointer(e, svgRef.current);
            linkingState.current.tempLink
              .attr('x1', linkingState.current.sourceNode.x)
              .attr('y1', linkingState.current.sourceNode.y)
              .attr('x2', x)
              .attr('y2', y);
          }
        });

      } else {
        // Second click: Create the edge to the target node
        const source = linkingState.current.sourceNode._id;
        const target = d._id;

        if (source !== target) {
          onCreateEdge({ source, target });
        }

        // Reset linking state and remove temp link
        d3.select(svgRef.current).selectAll('.temp-link').remove();
        linkingState.current = { sourceNode: null, tempLink: null, isLinking: false };
        d3.select(svgRef.current).on('mousemove.temp-link', null);
      }
    } else {
      // Original select mode logic
      onNodeClick(d);
    }
  }, [interactionMode, onCreateEdge, onNodeClick]);

  // Handle node double click
  const handleNodeDoubleClick = useCallback((event, d) => {
    if (event.defaultPrevented) return;
    if (interactionMode === 'select' && onNodeDoubleClick) {
      onNodeDoubleClick(d);
    }
  }, [interactionMode, onNodeDoubleClick]);

  // Handle edge click
  const handleEdgeClick = useCallback((event, d) => {
    event.stopPropagation();
    if (interactionMode === 'select') {
      d3.selectAll('.link').classed('selected', false);
      d3.select(event.currentTarget).classed('selected', true);
      setSelectedEdge(d);
    }
  }, [interactionMode]);

  // Handle background click
  const handleBackgroundClick = useCallback((event) => {
    if (event.target.classList.contains('background')) {
      d3.selectAll('.link').classed('selected', false);
      setSelectedEdge(null);

      // Cancel linking on background click
      if (linkingState.current.isLinking) {
        d3.select(svgRef.current).selectAll('.temp-link').remove();
        linkingState.current = { sourceNode: null, tempLink: null, isLinking: false };
        d3.select(svgRef.current).on('mousemove.temp-link', null);
      }

      if (onBackgroundClick) {
        onBackgroundClick();
      }
    }
  }, [onBackgroundClick]);

  // Main effect for D3 rendering and updates
  useEffect(() => {
    const currentSvg = svgRef.current;
    if (!currentSvg) return;

    const initialWidth = graphDimensionsRef.current.width;
    const initialHeight = graphDimensionsRef.current.height;

    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(edges).id(d => d._id).distance(150))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(initialWidth / 2, initialHeight / 2));
    } else {
      simulationRef.current
        .nodes(nodes)
        .force('link', d3.forceLink(edges).id(d => d._id).distance(150));
    }

    simulationRef.current.alpha(0.3).restart();

    const svg = d3.select(currentSvg);
    const simulation = simulationRef.current;

    if (!simulation) return;

    // Add background rectangle for click events
    let background = svg.select('.background');
    if (background.empty()) {
      background = svg.append('rect')
        .attr('class', 'background')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'transparent');
    }

    background.on('click', handleBackgroundClick);

    let linkGroup = svg.select('g.links-group');
    if (linkGroup.empty()) {
      linkGroup = svg.append('g').attr('class', 'links-group');
    }

    let nodeGroup = svg.select('g.nodes-group');
    if (nodeGroup.empty()) {
      nodeGroup = svg.append('g').attr('class', 'nodes-group');
    }

    let defs = svg.select('defs');
    if (defs.empty()) {
      defs = svg.append('defs');
    }
    
    // Only create arrow marker if it doesn't exist
    if (defs.select('#arrow').empty()) {
      defs.append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#A8C3A4");
    }

    const liveContainerWidth = currentSvg.clientWidth;
    const liveContainerHeight = currentSvg.clientHeight;
    graphDimensionsRef.current = { width: liveContainerWidth, height: liveContainerHeight };

    const viewBoxWidth = liveContainerWidth;
    const viewBoxHeight = liveContainerHeight;

    svg
      .attr('viewBox', [0, 0, viewBoxWidth, viewBoxHeight])
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Initialize node positions
    nodes.forEach(node => {
      const hasValidPositionProp = node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number';

      if (hasValidPositionProp) {
        node.x = node.position.x;
        node.y = node.position.y;
        node.fx = node.position.x;
        node.fy = node.position.y;
      } else {
        node.x = typeof node.x === 'number' ? node.x : (Math.random() * (liveContainerWidth - 100) + 50);
        node.y = typeof node.y === 'number' ? node.y : (Math.random() * (liveContainerHeight - 100) + 50);
        node.fx = null;
        node.fy = null;
        node.position = { x: node.x, y: node.y };
      }
    });

    // Initialize drag behavior
    const drag = dragBehavior(simulationRef.current);

    const nodeMap = {};
    nodes.forEach(node => {
      if (node && node._id) {
        nodeMap[node._id] = node;
      }
    });

    const validEdges = edges.filter(edge =>
      edge &&
      edge.source &&
      edge.target &&
      nodeMap[edge.source] &&
      nodeMap[edge.target]
    );

    const processedEdges = validEdges.map(edge => ({
      id: edge._id,
      source: nodeMap[edge.source],
      target: nodeMap[edge.target],
      type: edge.type || 'related',
      _id: edge._id
    }));

    simulationRef.current
      .force('link', d3.forceLink(processedEdges).id(d => d._id))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(viewBoxWidth / 2, viewBoxHeight / 2))
      .force('collision', d3.forceCollide().radius(40));

    simulationRef.current.alpha(0.3).restart();

    const link = linkGroup.selectAll('path.link').data(processedEdges, d => d.id);

    link.exit().remove();

    const linkEnter = link.enter().append('path')
      .attr('class', 'link')
      .attr('stroke', '#A8C3A4')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)')
      .on('click', handleEdgeClick);

    linkEnter.merge(link)
      .attr('d', d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);

    const node = nodeGroup.selectAll('.node')
      .data(nodes, d => d._id);

    node.exit().remove();

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .call(drag);

    nodeEnter.append('circle')
      .attr('r', 20)
      .attr('fill', '#1B5E20')
      .attr('stroke', '#1B5E20')
      .attr('stroke-width', 1.5);

    nodeEnter.append('text')
      .attr('dx', 25)
      .attr('dy', 4)
      .text(d => d.title || d._id)
      .style('font-size', '12px')
      .style('fill', 'white');

    nodeEnter.merge(node)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', handleNodeClick)
      .on('dblclick', handleNodeDoubleClick);

    simulationRef.current.on('tick', () => {
      link.attr('d', d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      // Clean up event listeners
      svg.on('click.temp-link', null);
      svg.on('mousemove.temp-link', null);
      background.on('click', null);
      
      // Stop simulation but don't destroy it completely
      simulationRef.current.stop();
    };
  }, [nodes, edges, interactionMode, dragBehavior, handleNodeClick, handleNodeDoubleClick, handleEdgeClick, handleBackgroundClick]);

  return (
    <div className="graph-container" style={{ width: '100%', height: '100%', padding: '1rem', boxSizing: 'border-box', position: 'relative' }}>
      <svg ref={svgRef} className="graph" style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'all',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <g className="links-group"></g>
        <g className="nodes-group"></g>
      </svg>
      <div className="controls" style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem'
      }}>
        <button
          onClick={onCreateNew}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1B5E20',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <PlusIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Create New Node
        </button>
        <ConnectButton
          mode={interactionMode}
          setMode={setInteractionMode}
          linkingState={linkingState}
          svgRef={svgRef}
        />
      </div>
      {selectedEdge && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button 
            onClick={() => onDeleteEdge(selectedEdge._id)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete Edge
          </button>
        </div>
      )}
    </div>
  );
};

// Example usage component
const GraphExample = () => {
  const [nodes, setNodes] = useState([
    { _id: '1', title: 'Node 1', x: 100, y: 100 },
    { _id: '2', title: 'Node 2', x: 300, y: 100 },
    { _id: '3', title: 'Node 3', x: 200, y: 300 }
  ]);
  
  const [edges, setEdges] = useState([
    { _id: 'e1', source: '1', target: '2' }
  ]);
  
  const [interactionMode, setInteractionMode] = useState('select');

  const handleCreateNew = () => {
    const newNode = {
      _id: `${nodes.length + 1}`,
      title: `Node ${nodes.length + 1}`,
      x: Math.random() * 300 + 50,
      y: Math.random() * 300 + 50
    };
    setNodes([...nodes, newNode]);
  };

  const handleCreateEdge = (edge) => {
    const newEdge = {
      _id: `e${edges.length + 1}`,
      source: edge.source,
      target: edge.target
    };
    setEdges([...edges, newEdge]);
  };

  const handleDeleteEdge = (edgeId) => {
    setEdges(edges.filter(edge => edge._id !== edgeId));
  };

  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Graph
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onCreateNew={handleCreateNew}
        onCreateEdge={handleCreateEdge}
        onDeleteEdge={handleDeleteEdge}
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
      />
    </div>
  );
};

export default GraphExample;