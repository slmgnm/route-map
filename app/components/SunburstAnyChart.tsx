"use client";
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface ChartProps {
  data: any; // Define a suitable type for your data
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Specify the chart’s dimensions.
    const width = 328;
    const height = width;
    const radius = width / 6;

    // Create the color scale.
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );

    // Compute the layout.
    const hierarchy = d3
      .hierarchy(data)
      .sum((d: any) => d.value)
      .sort((a: any, b: any) => b.value - a.value);
    const root = d3.partition().size([2 * Math.PI, hierarchy.height + 1])(
      hierarchy
    );
    root.each((d: any) => (d.current = d));

    // Create the arc generator.
    const arc = d3
      .arc<any>()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d: any) => d.y0 * radius)
      .outerRadius((d: any) => Math.max(d.y0 * radius, d.y1 * radius - 1));

    // Create the SVG container.
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "1px sans-serif");

    // Append the arcs.
    const path = svg
      .append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", (d: any) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", (d: any) =>
        arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("pointer-events", (d: any) =>
        arcVisible(d.current) ? "auto" : "none"
      )
      .attr("d", (d: any) => arc(d.current));

    // Make them clickable if they have children.
    path
      .filter((d: any) => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    const format = d3.format(",d");
    path.append("title").text(
      (d: any) =>
        `${d
          .ancestors()
          .map((d: any) => d.data.name)
          .reverse()
          .join("/")}\n${format(d.value)}`
    );

    const label = svg
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(2))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", (d: any) => +labelVisible(d.current))
      .attr("transform", (d: any) => labelTransform(d.current))
      .each(function (d: any) {
        const lines = wrapText(d.data.name, 10); // Adjust the wrap width as needed
        d3.select(this)
          .selectAll("tspan")
          .data(lines)
          .enter()
          .append("tspan")
          .attr("x", 0)
          .attr("dy", (line, i) => (i === 0 ? 0 : 1.1) + "em")
          .text((line: string) => line);
      });

    const parent = svg
      .append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    // Handle zoom on click.
    function clicked(event: any, p: any) {
      parent.datum(p.parent || root);

      root.each(
        (d: any) =>
          (d.target = {
            x0:
              Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            x1:
              Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth),
          })
      );

      const t = svg.transition().duration(750);

      path
        .transition(t as any)
        .tween("data", (d: any) => {
          const i = d3.interpolate(d.current, d.target);
          return (t: any) => (d.current = i(t));
        })
        .filter(function (d: any) {
          return (
            !!+d3.select(this as SVGPathElement).attr("fill-opacity") ||
            arcVisible(d.target)
          );
        })
        .attr("fill-opacity", (d: any) =>
          arcVisible(d.target) ? (d.children ? 1 : 0.4) : 0
        )
        .attr("pointer-events", (d: any) =>
          arcVisible(d.target) ? "auto" : "none"
        )
        .attrTween("d", (d: any) => (t: number) => arc(d.current) || "");

      label
        .filter(function (d: any) {
          return (
            !!+d3.select(this as SVGTextElement).attr("fill-opacity") ||
            labelVisible(d.target)
          );
        })
        .transition(t as any)
        .attr("fill-opacity", (d: any) => +labelVisible(d.target))
        .attrTween("transform", (d: any) => () => labelTransform(d.current));
    }

    function arcVisible(d: any) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d: any) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d: any) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    // Function to wrap text
    function wrapText(text: string, width: number) {
      const words = text.split(/\s+/);
      const lines = [];
      let line = "";

      while (words.length > 0) {
        const word = words.shift()!;
        if (line.length + word.length > width) {
          lines.push(line);
          line = word;
        } else {
          line += (line.length ? " " : "") + word;
        }
      }
      lines.push(line);
      return lines;
    }

    return () => {
      // Clean up D3 elements and transitions
      svg.selectAll("*").interrupt();
      svg.selectAll("*").remove();
    };
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Chart;
