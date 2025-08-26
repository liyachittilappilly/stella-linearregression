import { useState, useEffect } from 'react';
import { TrendingUp, Download, BarChart3, Target } from 'lucide-react';
import { calculateMetrics, ModelMetrics, TrainTestSplit } from '../utils/mlUtils';
import Plotly from 'plotly.js-dist-min';

interface ResultsProps {
  model: any;
  split: TrainTestSplit;
  features: string[];
  target: string;
}

const Results: React.FC<ResultsProps> = ({ model, split, features, target }) => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [predictions, setPredictions] = useState<number[]>([]);

  useEffect(() => {
    if (model && split) {
      // Make predictions on test set
      const yPred = model.predict(split.xTest);
      setPredictions(yPred);
      
      // Calculate metrics
      const calculatedMetrics = calculateMetrics(split.yTest, yPred);
      setMetrics({
        ...calculatedMetrics,
        coefficients: model.coefficients,
        intercept: model.intercept
      });

      // Generate scatter plot
      generateScatterPlot(split.yTest, yPred);
    }
  }, [model, split]);

  const generateScatterPlot = (yTrue: number[], yPred: number[]) => {
    const trace1 = {
      x: yTrue,
      y: yPred,
      mode: 'markers',
      type: 'scatter',
      name: 'Predictions',
      marker: {
        color: '#f875aa',
        size: 8,
        opacity: 0.7
      }
    };

    // Perfect prediction line (y = x)
    const minVal = Math.min(...yTrue, ...yPred);
    const maxVal = Math.max(...yTrue, ...yPred);
    const trace2 = {
      x: [minVal, maxVal],
      y: [minVal, maxVal],
      mode: 'lines',
      type: 'scatter',
      name: 'Perfect Prediction',
      line: {
        color: '#ffffff',
        width: 2,
        dash: 'dash'
      }
    };

    const layout = {
      title: {
        text: 'Actual vs Predicted Values',
        font: { color: '#ffffff', size: 16 }
      },
      xaxis: { 
        title: `Actual ${target}`,
        color: '#ffffff',
        gridcolor: 'rgba(255,255,255,0.1)'
      },
      yaxis: { 
        title: `Predicted ${target}`,
        color: '#ffffff',
        gridcolor: 'rgba(255,255,255,0.1)'
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#ffffff' },
      margin: { t: 50, r: 50, b: 50, l: 50 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(0,0,0,0.5)',
        bordercolor: 'rgba(255,255,255,0.2)',
        borderwidth: 1
      }
    };

    const config = {
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'select2d']
    };

    const plotDiv = document.getElementById('results-plot');
    if (plotDiv) {
      Plotly.newPlot('results-plot', [trace1, trace2], layout, config);
    }
  };

  const downloadResults = () => {
    if (!metrics || !predictions) return;

    const results = {
      model_info: {
        features: features,
        target: target,
        training_samples: split.xTrain.length,
        testing_samples: split.xTest.length
      },
      metrics: {
        r2_score: metrics.r2,
        mean_squared_error: metrics.mse,
        mean_absolute_error: metrics.mae
      },
      model_parameters: {
        intercept: metrics.intercept,
        coefficients: metrics.coefficients
      },
      predictions: predictions.slice(0, 10) // First 10 predictions as sample
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPerformanceLevel = (r2: number) => {
    if (r2 >= 0.9) return { level: 'Excellent', color: 'text-green-400' };
    if (r2 >= 0.7) return { level: 'Good', color: 'text-blue-400' };
    if (r2 >= 0.5) return { level: 'Moderate', color: 'text-yellow-400' };
    return { level: 'Poor', color: 'text-red-400' };
  };

  if (!metrics) {
    return (
      <div className="glass-card p-8 rounded-xl animate-fade-in">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Calculating results...</p>
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(metrics.r2);

  return (
    <section className="glass-card p-8 rounded-xl animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground flex items-center">
          <TrendingUp className="mr-3" />
          Model Results
        </h2>
        <button
          onClick={downloadResults}
          className="btn-primary px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Results
        </button>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-3xl font-bold text-primary mb-2">
            {metrics.r2.toFixed(4)}
          </div>
          <div className="text-sm text-muted-foreground mb-1">R² Score</div>
          <div className={`text-xs font-semibold ${performance.color}`}>
            {performance.level}
          </div>
        </div>
        
        <div className="text-center p-6 bg-accent/10 rounded-lg border border-accent/20">
          <div className="text-3xl font-bold text-accent mb-2">
            {metrics.mse.toFixed(4)}
          </div>
          <div className="text-sm text-muted-foreground">Mean Squared Error</div>
          <div className="text-xs text-muted-foreground mt-1">Lower is better</div>
        </div>
        
        <div className="text-center p-6 bg-secondary/10 rounded-lg border border-secondary/20">
          <div className="text-3xl font-bold text-secondary-foreground mb-2">
            {metrics.mae.toFixed(4)}
          </div>
          <div className="text-sm text-muted-foreground">Mean Absolute Error</div>
          <div className="text-xs text-muted-foreground mt-1">Average deviation</div>
        </div>
      </div>

      {/* Model Equation */}
      {metrics.coefficients && metrics.intercept !== undefined && (
        <div className="mb-8 p-6 bg-muted/10 rounded-lg border border-border/20">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Target className="mr-2" />
            Model Equation
          </h3>
          
          <div className="font-mono text-lg text-center p-4 bg-background-secondary/30 rounded-lg">
            <span className="text-primary">{target}</span>
            <span className="text-muted-foreground"> = </span>
            <span className="text-accent">{metrics.intercept.toFixed(4)}</span>
            {metrics.coefficients.map((coef, idx) => (
              <span key={idx}>
                <span className="text-muted-foreground"> + </span>
                <span className="text-accent">{coef.toFixed(4)}</span>
                <span className="text-muted-foreground"> × </span>
                <span className="text-primary">{features[idx]}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scatter Plot */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <BarChart3 className="mr-2" />
          Prediction Scatter Plot
        </h3>
        <div 
          id="results-plot" 
          className="w-full h-96 bg-background-secondary/50 rounded-lg border border-border/20"
          style={{ minHeight: '400px' }}
        ></div>
      </div>

      {/* Model Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-muted/10 rounded-lg border border-border/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">Training Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Features:</span>
              <span className="text-foreground font-mono">{features.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target:</span>
              <span className="text-foreground font-mono">{target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Training Samples:</span>
              <span className="text-primary font-mono">{split.xTrain.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Testing Samples:</span>
              <span className="text-primary font-mono">{split.xTest.length}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/10 rounded-lg border border-border/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Interpretation</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-foreground font-medium">R² Score: {metrics.r2.toFixed(4)}</div>
              <div className="text-muted-foreground">
                {(metrics.r2 * 100).toFixed(2)}% of variance explained by the model
              </div>
            </div>
            <div>
              <div className="text-foreground font-medium">Residual Analysis</div>
              <div className="text-muted-foreground">
                Points closer to diagonal line indicate better predictions
              </div>
            </div>
            <div className={`${performance.color} font-medium`}>
              Model Performance: {performance.level}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Results;