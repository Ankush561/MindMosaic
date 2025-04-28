import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './Graph.css';

const Graph = ({ nodes, edges, onNodeClick, onCreateNew }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!nodes.length) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(300, 300));

    svg.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'steelblue');

    simulation.on('tick', () => {
      svg.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    return () => simulation.stop();
  }, [nodes]);

  return (
    <div className="graph-wrapper">
      <svg ref={svgRef} width="600" height="600" className="graph-svg" />
      <button className="create-btn" onClick={onCreateNew}>
        + New Node
      </button>
    </div>
  );
};

export default Graph; // This line is critical