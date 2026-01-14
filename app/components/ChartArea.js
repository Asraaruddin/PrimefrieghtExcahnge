'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ChartArea = ({ data, color = '#3b82f6', title = 'Chart' }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const width = svgRef.current.parentElement.clientWidth;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) * 1.1])
      .range([height - margin.bottom, margin.top]);

    // Create area generator
    const area = d3.area()
      .x(d => x(d.date) + x.bandwidth() / 2)
      .y0(height - margin.bottom)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', `gradient-${color.replace('#', '')}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.1);

    // Add area path
    svg.append('path')
      .datum(data)
      .attr('fill', `url(#gradient-${color.replace('#', '')})`)
      .attr('d', area);

    // Add line
    const line = d3.line()
      .x(d => x(d.date) + x.bandwidth() / 2)
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add circles on data points
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date) + x.bandwidth() / 2)
      .attr('cy', d => y(d.count))
      .attr('r', 3)
      .attr('fill', color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat((d, i) => i % Math.ceil(data.length / 5) === 0 ? d : ''))
      .attr('color', '#6b7280')
      .selectAll('text')
      .attr('fill', '#6b7280')
      .style('font-size', '10px');

    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', '#6b7280')
      .selectAll('text')
      .attr('fill', '#6b7280')
      .style('font-size', '10px');

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat('')
      )
      .attr('color', '#374151')
      .attr('opacity', 0.3);

  }, [data, color]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 text-sm">No data available</div>
        </div>
      )}
    </div>
  );
};

export default ChartArea;