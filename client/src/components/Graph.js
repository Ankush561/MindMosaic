import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './Graph.css';

const Graph = ({ nodes = [], edges = [], onNodeClick, onCreateNew }) => {
  const svgRef = useRef();

  console.log('Graph received:', { 
    nodeCount: nodes.length,
    edgeCount: edges.length 
  });

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create a force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw edges (if any)
    if (edges.length > 0) {
      svg.selectAll('line')
        .data(edges)
        .enter()
        .append('line')
        .attr('stroke', 'gray')
        .attr('stroke-width', 2);
    }

    // Draw nodes
    const nodeElements = svg.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'steelblue')
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    simulation.on('tick', () => {
      nodeElements
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      svg.selectAll('line')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    });

    return () => simulation.stop();
  }, [nodes, edges, onNodeClick]);

  return (
    <div className="graph-wrapper">
      <svg ref={svgRef} width="600" height="600" className="graph-svg" />
      <button className="create-btn" onClick={onCreateNew}>
        + New Node
      </button>
    </div>
  );
};

export default Graph;
