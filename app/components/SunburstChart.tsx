"use client";
import React, { useEffect } from "react";
import * as d3 from "d3";
import data from "../data.json";

const SIZE = 975;
const RADIUS = SIZE / 2;

interface Data {
  name: string;
  value?: number;
  children?: Data[];
}

export const SunburstChart = () => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = React.useState("0,0,0,0");

  const partition = (data: Data) =>
    d3.partition<Data>().size([2 * Math.PI, RADIUS])(
      d3
        .hierarchy(data)
        .sum((d) => d.value || 1) // Ensure each node has a value
        .sort((a, b) => (b.value || 0) - (a.value || 0))
    );
  const format = d3.format(",d");
  const arc = d3
    .arc<d3.HierarchyRectangularNode<Data>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 50, 1)) // Adjust padding as needed
    .padRadius(RADIUS)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1);

  const getAutoBox = () => {
    if (!svgRef.current) {
      return "0 0 0 0";
    }

    const { x, y, width, height } = svgRef.current.getBBox();

    return `${x} ${y} ${width} ${height}`;
  };

  useEffect(() => {
    setViewBox(getAutoBox());
  }, []);

  // const getColor = (d: d3.HierarchyRectangularNode<Data>) => {
  //   while (d.depth > 1) d = d.parent;
  //   return color(d.data.name);
  // };
  const getColor = (d: d3.HierarchyRectangularNode<Data>) => {
    // Determine the maximum depth in the hierarchy
    const maxDepth = root.height;
    // Create a color scale based on depth
    const depthColor = d3
      .scaleOrdinal<string>(
        d3.schemeTableau10 // Or any other color scheme you prefer
      )
      .domain(d3.range(0, maxDepth + 1).map(String)); // Convert numbers to strings
    return depthColor(d.depth.toString()); // Return color based on the node's depth
  };

  const getTextTransform = (d: d3.HierarchyRectangularNode<Data>) => {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = (d.y0 + d.y1) / 2;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  };
  const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9-_]/g, "_");

  const wrapText = (text: string, width: number): string[] => {
    const words = text.split(/\s+/).reverse();
    let word;
    let line: string[] = [];
    const lines: string[] = [];
    while ((word = words.pop())) {
      line.push(word);
      const testLine = line.join(" ");
      const testLineWidth = testLine.length * 6; // Approximate width calculation
      if (testLineWidth > width) {
        line.pop();
        lines.push(line.join(" "));
        line = [word];
      }
    }
    lines.push(line.join(" "));
    return lines;
  };

  const handleMouseOver = (event: any, d: any) => {
    d3.selectAll("path").style("opacity", 0.3);
    d3.selectAll("text").style("opacity", 0.3);
    d.ancestors().forEach((node: any) => {
      d3.select(`#node-${sanitizeName(node.data.name)}`).style("opacity", 1);
    });
  };

  const handleMouseOut = () => {
    d3.selectAll("path").style("opacity", 1);
    d3.selectAll("text").style("opacity", 1);
  };

  const root = partition(data);

  return (
    <svg width={SIZE} height={SIZE} viewBox={viewBox} ref={svgRef}>
      <g fillOpacity={0.6}>
        {root
          .descendants()
          .filter((d) => d.depth)
          .map((d, i) => (
            <path
              key={`${d.data.name}-${i}`}
              id={`node-${sanitizeName(d.data.name)}`}
              fill={getColor(d)}
              d={arc(d) || ""}
              style={{
                cursor: "pointer",
              }}
              onMouseOver={(event) => handleMouseOver(event, d)}
              onMouseOut={handleMouseOut}
            >
              <title>
                {d
                  .ancestors()
                  .map((d) => d.data.name)
                  .reverse()
                  .join("/")}
                \n${format(d.value || 0)}
              </title>
            </path>
          ))}
      </g>
      <g pointerEvents="none" textAnchor="middle" fontSize={10}>
        {root
          .descendants()
          .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
          .map((d, i) => (
            <text
              key={`${d.data.name}-${i}`}
              id={`text-${sanitizeName(d.data.name)}`}
              transform={getTextTransform(d)}
              dy="0.35em"
              textAnchor="middle"
              fontSize={Math.min(3, (d.y1 - d.y0) / 4)}
            >
              {wrapText(d.data.name, 10).map((line, index) => (
                <tspan
                  x="0"
                  dy={`${index === 0 ? 0 : 0.9}em`}
                  key={index}
                  dominantBaseline="top"
                >
                  {line}
                </tspan>
              ))}
            </text>
          ))}
      </g>
    </svg>
  );
};
