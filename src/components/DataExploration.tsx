import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, BarChart, LineChart } from 'lucide-react';
import { getValueCounts, ValueCount } from '../utils/mlUtils';
import Plotly from 'plotly.js-dist-min';

interface DataExplorationProps {
  data: any[];
}

const DataExploration: React.FC<DataExplorationProps> = ({ data }) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [valueCounts, setValueCounts] = useState<ValueCount[]>([]);
  const [showValueCounts, setShowValueCounts] = useState(false);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [plotType, setPlotType] = useState('scatter');
  const [isGeneratingPlot, setIsGeneratingPlot] = useState(false);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter(col => {
    const sample = data.find(row => row[col] !== null && row[col] !== '');
    return sample && !isNaN(Number(sample[col])) && sample[col] !== '';
  });

  const handleGenerateValueCount = () => {
    if (!selectedColumn) return;
    
    const counts = getValueCounts(data, selectedColumn);
    setValueCounts(counts);
    setShowValueCounts(true);
  };

  const handleGeneratePlot = async () => {
    if (!xAxis || !yAxis) return;
    
    setIsGeneratingPlot(true);
    
    try {
      const plotData = data.map(row => ({
        x: row[xAxis],
        y: row[yAxis]
      })).filter(point => 
        point.x !== null && point.x !== '' && !isNaN(Number(point.x)) &&
        point.y !== null && point.y !== '' && !isNaN(Number(point.y))
      );

      const xValues = plotData.map(p => Number(p.x));
      const yValues = plotData.map(p => Number(p.y));

      let trace: any = {
        x: xValues,
        y: yValues,
        mode: 'markers',
        type: 'scatter',
        name: `${yAxis} vs ${xAxis}`,
        marker: {
          color: '#f875aa',
          size: 8,
          opacity: 0.7
        }
      };

      switch (plotType) {
        case 'line':
          trace.mode = 'lines+markers';
          trace.line = { color: '#f875aa', width: 2 };
          break;
        case 'bar':
          trace = {
            x: xValues,
            y: yValues,
            type: 'bar',
            name: `${yAxis} by ${xAxis}`,
            marker: { color: '#f875aa' }
          };
          break;
        case 'histogram':
          trace = {
            x: xValues,
            type: 'histogram',
            name: `Distribution of ${xAxis}`,
            marker: { color: '#f875aa' },
            nbinsx: 20
          };
          break;
      }

      const layout = {
        title: {
          text: `${plotType.charAt(0).toUpperCase() + plotType.slice(1)} Plot: ${yAxis} vs ${xAxis}`,
          font: { color: '#ffffff', size: 16 }
        },
        xaxis: { 
          title: xAxis,
          color: '#ffffff',
          gridcolor: 'rgba(255,255,255,0.1)'
        },
        yaxis: { 
          title: plotType === 'histogram' ? 'Count' : yAxis,
          color: '#ffffff',
          gridcolor: 'rgba(255,255,255,0.1)'
        },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        margin: { t: 50, r: 50, b: 50, l: 50 }
      };

      const config = {
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'select2d']
      };

      // Clear existing plot
      const plotDiv = document.getElementById('plot-container');
      if (plotDiv) {
        Plotly.newPlot('plot-container', [trace], layout, config);
      }
    } catch (error) {
      console.error('Error generating plot:', error);
    } finally {
      setIsGeneratingPlot(false);
    }
  };

  return (
    <section className="glass-card p-8 rounded-xl animate-slide-up">
      <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center">
        <BarChart3 className="mr-3" />
        Data Exploration
      </h2>
      
      {/* Value Counts Section */}
      <div className="mb-8 p-6 border border-border/20 rounded-lg bg-muted/10">
        <h3 className="text-lg font-semibold text-foreground mb-4">Value Counts Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Select Column for Value Counts
            </label>
            <select 
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Choose a column...</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleGenerateValueCount}
              disabled={!selectedColumn}
              className="btn-primary px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              Generate Value Count
            </button>
          </div>
        </div>

        {/* Value Counts Display */}
        {showValueCounts && valueCounts.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <h4 className="text-md font-semibold text-primary mb-3">
              Value Counts for "{selectedColumn}"
            </h4>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Value</th>
                    <th className="text-left">Count</th>
                    <th className="text-left">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {valueCounts.map((item, idx) => {
                    const percentage = ((item.count / data.length) * 100).toFixed(1);
                    return (
                      <tr key={idx}>
                        <td className="font-mono text-primary">{String(item.value)}</td>
                        <td className="font-mono">{item.count}</td>
                        <td className="font-mono text-accent">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Plotting Controls */}
      <div className="p-6 border border-border/20 rounded-lg bg-muted/10">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Activity className="mr-2" />
          Interactive Plotting Controls
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">X-axis</label>
            <select 
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="input-field w-full px-3 py-2 rounded-lg"
            >
              <option value="">Select X-axis...</option>
              {numericColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Y-axis</label>
            <select 
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="input-field w-full px-3 py-2 rounded-lg"
            >
              <option value="">Select Y-axis...</option>
              {numericColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Plot Type</label>
            <select 
              value={plotType}
              onChange={(e) => setPlotType(e.target.value)}
              className="input-field w-full px-3 py-2 rounded-lg"
            >
              <option value="scatter">Scatter</option>
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleGeneratePlot}
              disabled={!xAxis || (!yAxis && plotType !== 'histogram') || isGeneratingPlot}
              className="btn-glass px-4 py-2 rounded-lg font-medium w-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPlot ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary inline mr-2"></div>
              ) : (
                <BarChart3 className="w-4 h-4 mr-2 inline" />
              )}
              Generate Plot
            </button>
          </div>
        </div>

        {/* Plot Container */}
        <div 
          id="plot-container" 
          className="w-full h-96 bg-background-secondary/50 rounded-lg border border-border/20"
          style={{ minHeight: '400px' }}
        ></div>
      </div>
    </section>
  );
};

export default DataExploration;