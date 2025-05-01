'use client';

import React from 'react';
import Plot from 'react-plotly.js';

type ChartProps = {
  title: string;
  data: {
    x: any[];
    y: any[];
    type?: string;
  };
};

export default function PlotChart({ title, data }: ChartProps) {
  return (
    <div className="my-6">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <Plot
        data={[
          {
            x: data.x,
            y: data.y,
            type: data.type || 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' },
          },
        ]}
        layout={{ width: 500, height: 300, title }}
      />
    </div>
  );
}
