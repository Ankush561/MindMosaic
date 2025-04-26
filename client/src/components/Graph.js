import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './Graph.css';

const Graph = ({ nodes, edges, onNodeClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!nodes.length || !edges.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d._id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw edges
    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.weight));

    // Draw nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .call(drag(simulation))
      .on('click', (event, d) => onNodeClick(d));

    // Add labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.title)
      .attr('font-size', 12)
      .attr('dx', 15)
      .attr('dy', 4);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  return <svg ref={svgRef} className="graph-svg" />;
};

export default Graph;