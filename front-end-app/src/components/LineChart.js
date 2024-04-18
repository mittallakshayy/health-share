import React, { useRef, useEffect } from "react";
import * as Plot from "@observablehq/plot";

//chart component
const LineChart = (props) => {
  const rows = props.data;
  const divRef = useRef();

  // //draws chart
  useEffect(() => {
  rows.forEach(d => {
    d.date = new Date(d.date);
    d.count = Number(d.count);
  });
  let plot = Plot.plot({
    y: {grid: true, label: "Number of tweets"},
    width:1800, //TODO: change width here
    marks: [
      Plot.ruleY([50]),
      Plot.lineY(rows.slice(0,-1), {x: "date", y: "count", stroke: "steelblue"})
    ]
  })

  divRef.current.append(plot);
  return () => plot.remove();
  }, [rows]);

  return (
    
      // <svg ref={svgRef}>
        
        
      // </svg>
      <div ref={divRef} />
    
  );
};

export default LineChart;
