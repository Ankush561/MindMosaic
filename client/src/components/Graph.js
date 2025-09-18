import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './Graph.css';
import PlusIcon from './icons/PlusIcon';
import LinkIcon from './icons/LinkIcon';

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
  onBackgroundClick,
  onNodePositionChange
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
  const stableViewBoxDimensionsRef = useRef({ width: 600, height: 400 });

  // Connect button component
  const ConnectButton = ({ interactionMode, setInteractionMode, linkingState, svgRef }) => {
  const handleClick = () => {
    const newMode = interactionMode === 'connect' ? 'select' : 'connect';
    setInteractionMode(newMode);  // Changed from setMode to setInteractionMode
    if (newMode === 'select') {
      d3.select(svgRef.current).selectAll('.temp-link').remove();
      d3.select(svgRef.current).selectAll('.node').classed('selected-for-connection', false);
      linkingState.current = { sourceNode: null, tempLink: null, isLinking: false };
      d3.select(svgRef.current).on('mousemove.temp-link', null);
    }
  };

    return (
      <button
        onClick={handleClick}
        className={`button accent ${interactionMode === 'connect' ? 'active' : ''}`}
      >
        <LinkIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
        {interactionMode === 'connect' ? 'Stop Connecting' : 'Connect Nodes'}
      </button>
    );
  };

  // Drag behavior
  const dragBehavior = useCallback((sim, svgInstance, containerWidth, containerHeight) => {
    return d3.drag()
      .on('start', function (event, d) {
        if (interactionMode !== 'select') return;
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', function (event, d) {
        if (interactionMode !== 'select') return;
        d.x = event.x;
        d.y = event.y;
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function (event, d) {
        if (interactionMode !== 'select') return;
        if (!event.active) sim.alphaTarget(0);
        d.position = { x: d.x, y: d.y };
        d.fx = d.x;
        d.fy = d.y;
        if (typeof onNodePositionChange === 'function') {
          onNodePositionChange(d._id, d.x, d.y);
        }
      });
  }, [interactionMode]);

  // Handle node click
  const handleNodeClick = useCallback((event, d) => {
    // In connect mode, process clicks even if default was prevented by drag
    if (interactionMode !== 'connect' && event.defaultPrevented) return;

    if (interactionMode === 'connect') {
      if (!linkingState.current.sourceNode) {
        // First click: select source node
        console.log('Connect mode: selected source node', d._id);
        linkingState.current.sourceNode = d;
        linkingState.current.isLinking = true;

        // Highlight selected node
        d3.select(svgRef.current).selectAll('.node').classed('selected-for-connection', false);
        d3.select(event.currentTarget).classed('selected-for-connection', true);

        // Remove any existing temp link
        d3.select(svgRef.current).selectAll('.temp-link').remove();

        // Create a new temporary link
        linkingState.current.tempLink = d3.select(svgRef.current)
          .append('line')
          .attr('class', 'temp-link')
          .attr('stroke', '#A8C3A4')
          .attr('stroke-dasharray', '5,5')
          .attr('stroke-width', 2);

        // Update the temp link on mouse move
        d3.select(svgRef.current).on('mousemove.temp-link', (e) => {
          if (linkingState.current.isLinking && linkingState.current.sourceNode) {
            const [x, y] = d3.pointer(e, svgRef.current);
            linkingState.current.tempLink
              .attr('x1', linkingState.current.sourceNode.x)
              .attr('y1', linkingState.current.sourceNode.y)
              .attr('x2', x)
              .attr('y2', y);
          }
        });
      } else {
        // Second click: create the edge
        const source = linkingState.current.sourceNode._id;
        const target = d._id;
        console.log('Connect mode: creating edge', { source, target });
        if (source && target && source !== target) {
          onCreateEdge && onCreateEdge({ source, target });
        }

        // Cleanup linking state and visuals
        d3.select(svgRef.current).selectAll('.temp-link').remove();
        d3.select(svgRef.current).selectAll('.node').classed('selected-for-connection', false);
        linkingState.current = { sourceNode: null, tempLink: null, isLinking: false };
        d3.select(svgRef.current).on('mousemove.temp-link', null);
      }
    } else if (onNodeClick) {
      onNodeClick(d);
    }
  }, [interactionMode, onNodeClick, onCreateEdge]);

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

      // Cancel linking if in progress
      if (linkingState.current.isLinking) {
        d3.select(svgRef.current).selectAll('.temp-link').remove();
        d3.select(svgRef.current).selectAll('.node').classed('selected-for-connection', false);
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

    svg.on('click', handleBackgroundClick);

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

    if (stableViewBoxDimensionsRef.current.width === 0 && liveContainerWidth > 0) {
      stableViewBoxDimensionsRef.current.width = liveContainerWidth;
    }
    if (stableViewBoxDimensionsRef.current.height === 0 && liveContainerHeight > 0) {
      stableViewBoxDimensionsRef.current.height = liveContainerHeight;
    }

    const viewBoxWidth = stableViewBoxDimensionsRef.current.width > 0 ? stableViewBoxDimensionsRef.current.width : liveContainerWidth;
    const viewBoxHeight = stableViewBoxDimensionsRef.current.height > 0 ? stableViewBoxDimensionsRef.current.height : liveContainerHeight;

    svg
      .attr('viewBox', [0, 0, viewBoxWidth, viewBoxHeight])
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Background rectangle to capture clicks for clearing selection/linking
    let background = svg.select('rect.background');
    if (background.empty()) {
      background = svg.insert('rect', ':first-child')
        .attr('class', 'background')
        .attr('fill', 'transparent');
    }
    background
      .attr('width', viewBoxWidth)
      .attr('height', viewBoxHeight)
      .on('click', handleBackgroundClick);

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
    const drag = dragBehavior(simulationRef.current, currentSvg, viewBoxWidth, viewBoxHeight);

    const nodeMap = {};
    nodes.forEach(node => {
      if (node && node._id) {
        nodeMap[node._id] = node;
      }
    });

    // Support edges where source/target may be populated objects or plain IDs
    const resolveId = (val) => (val && typeof val === 'object') ? val._id : val;

    const validEdges = edges.filter(edge => {
      if (!(edge && edge.source && edge.target)) return false;
      const s = resolveId(edge.source);
      const t = resolveId(edge.target);
      return !!(nodeMap[s] && nodeMap[t]);
    });

    const processedEdges = validEdges.map(edge => {
      const s = resolveId(edge.source);
      const t = resolveId(edge.target);
      return {
        id: edge._id,
        source: nodeMap[s],
        target: nodeMap[t],
        type: edge.type || 'related',
        _id: edge._id
      };
    });

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
      .attr('fill', 'none')
      .attr('stroke', '#A8C3A4')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    const linkMerged = linkEnter.merge(link)
      .on('click', handleEdgeClick);

    linkMerged
      .attr('d', d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);

    const node = nodeGroup.selectAll('.node')
      .data(nodes, d => d._id);

    node.exit().remove();

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node');

    if (interactionMode === 'select') {
      nodeEnter.call(dragBehavior(simulationRef.current, currentSvg, viewBoxWidth, viewBoxHeight));
    }

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

    const nodeMerged = nodeEnter.merge(node)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', handleNodeClick)
      .on('dblclick', handleNodeDoubleClick);

    if (interactionMode === 'select') {
      nodeMerged.call(dragBehavior(simulationRef.current, currentSvg, viewBoxWidth, viewBoxHeight));
    }

    simulationRef.current.on('tick', () => {
      linkMerged.attr('d', d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
      nodeMerged.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulationRef.current.stop();
    };
  }, [nodes, edges, interactionMode, onNodeClick, onNodeDoubleClick, onBackgroundClick]);

  return (
    <div className="graph-container" style={{ width: '100%', height: '100%', padding: '1rem', boxSizing: 'border-box', position: 'relative' }}>
      <svg ref={svgRef} className="graph" style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'all'
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
          className="button primary"
        >
          <PlusIcon style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Create New Node
        </button>
        <ConnectButton
          interactionMode={interactionMode}
          setInteractionMode={setInteractionMode}
          linkingState={linkingState}
          svgRef={svgRef}
        />
      </div>
      {selectedEdge && (
        <div className="edge-actions" style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            className="button danger"
            onClick={() => {
              if (onDeleteEdge && selectedEdge?._id) {
                onDeleteEdge(selectedEdge._id);
              }
              setSelectedEdge(null);
            }}
          >
            Delete Edge
          </button>
        </div>
      )}
    </div>
  );
};

export default Graph;
