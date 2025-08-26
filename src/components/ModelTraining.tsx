import { useState } from 'react';
import { Brain, Split, Target, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { trainTestSplit, trainLinearRegression, extractFeatures, TrainTestSplit } from '../utils/mlUtils';
import { toast } from '@/hooks/use-toast';

interface ModelTrainingProps {
  data: any[];
  onModelTrained: (model: any, split: TrainTestSplit, features: string[], target: string) => void;
}

const ModelTraining: React.FC<ModelTrainingProps> = ({ data, onModelTrained }) => {
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [features, setFeatures] = useState('');
  const [target, setTarget] = useState('');
  const [splitData, setSplitData] = useState<TrainTestSplit | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [model, setModel] = useState<any>(null);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter(col => {
    const sample = data.find(row => row[col] !== null && row[col] !== '');
    return sample && !isNaN(Number(sample[col])) && sample[col] !== '';
  });

  const handleSplitData = () => {
    if (!features.trim() || !target.trim()) {
      toast({
        title: "Error",
        description: "Please specify both features and target column",
        variant: "destructive"
      });
      return;
    }

    try {
      const featureColumns = features.split(',').map(f => f.trim()).filter(f => f);
      
      // Validate columns exist
      const invalidColumns = featureColumns.filter(col => !columns.includes(col));
      if (invalidColumns.length > 0) {
        toast({
          title: "Error",
          description: `Invalid columns: ${invalidColumns.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      if (!columns.includes(target)) {
        toast({
          title: "Error",
          description: `Target column "${target}" not found`,
          variant: "destructive"
        });
        return;
      }

      // Extract features and target
      const { X, y } = extractFeatures(data, featureColumns, target);
      
      if (X.length === 0) {
        toast({
          title: "Error",
          description: "No valid data points found for training",
          variant: "destructive"
        });
        return;
      }

      // Perform train-test split
      const split = trainTestSplit(X, y, testSize, randomState);
      setSplitData(split);
      
      toast({
        title: "Data Split Complete",
        description: `Training: ${split.xTrain.length} samples, Testing: ${split.xTest.length} samples`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to split data. Please check your column names.",
        variant: "destructive"
      });
    }
  };

  const handleTrainModel = async () => {
    if (!splitData) {
      toast({
        title: "Error",
        description: "Please split the data first",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    
    try {
      // Train the linear regression model
      const trainedModel = trainLinearRegression(splitData.xTrain, splitData.yTrain);
      setModel(trainedModel);
      
      // Pass results to parent component
      const featureColumns = features.split(',').map(f => f.trim()).filter(f => f);
      onModelTrained(trainedModel, splitData, featureColumns, target);
      
      toast({
        title: "Model Trained Successfully",
        description: `R² Score: ${trainedModel.score.toFixed(4)}`,
      });

    } catch (error) {
      toast({
        title: "Training Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <section className="glass-card p-8 rounded-xl animate-slide-up">
      <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center">
        <Brain className="mr-3" />
        Model Training
      </h2>

      <div className="space-y-6">
        {/* Train-Test Split Configuration */}
        <div className="p-6 border border-border/20 rounded-lg bg-muted/10">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Split className="mr-2" />
            Train-Test Split Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Test Size (0.1 - 0.5)
              </label>
              <input
                type="number"
                min="0.1"
                max="0.5"
                step="0.05"
                value={testSize}
                onChange={(e) => setTestSize(parseFloat(e.target.value))}
                className="input-field w-full px-3 py-2 rounded-lg"
                placeholder="0.2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Proportion of data to use for testing
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Random State
              </label>
              <input
                type="number"
                value={randomState}
                onChange={(e) => setRandomState(parseInt(e.target.value))}
                className="input-field w-full px-3 py-2 rounded-lg"
                placeholder="42"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Seed for reproducible results
              </p>
            </div>
          </div>

          {splitData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-lg font-bold text-primary">{splitData.xTrain.length}</div>
                <div className="text-xs text-muted-foreground">Training Samples</div>
              </div>
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <div className="text-lg font-bold text-accent">{splitData.xTest.length}</div>
                <div className="text-xs text-muted-foreground">Testing Samples</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-lg font-bold text-foreground">{splitData.xTrain[0]?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Features</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-lg font-bold text-foreground">1</div>
                <div className="text-xs text-muted-foreground">Target</div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Selection */}
        <div className="p-6 border border-border/20 rounded-lg bg-muted/10">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Target className="mr-2" />
            Feature Selection
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Features (comma-separated)
              </label>
              <input
                type="text"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="input-field w-full px-3 py-2 rounded-lg"
                placeholder="feature1, feature2, feature3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {numericColumns.join(', ')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Column
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="input-field w-full px-3 py-2 rounded-lg"
              >
                <option value="">Select target column...</option>
                {numericColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSplitData}
              disabled={!features.trim() || !target.trim()}
              className="btn-glass px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Split className="w-4 h-4 mr-2 inline" />
              Split Data
            </button>

            <button
              onClick={handleTrainModel}
              disabled={!splitData || isTraining}
              className="btn-primary px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isTraining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Training Model...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Train Model
                </>
              )}
            </button>
          </div>

          {/* Training Status */}
          {splitData && !model && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-yellow-400 text-sm">Data split complete. Ready to train model.</span>
            </div>
          )}

          {model && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-green-400 text-sm">
                Model trained successfully! R² Score: {model.score.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {/* Model Information */}
        {model && (
          <div className="p-6 border border-border/20 rounded-lg bg-primary/5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Model Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background-secondary/30 rounded-lg">
                <div className="text-xl font-bold text-primary">{model.score.toFixed(4)}</div>
                <div className="text-sm text-muted-foreground">R² Score</div>
              </div>
              
              <div className="text-center p-4 bg-background-secondary/30 rounded-lg">
                <div className="text-xl font-bold text-primary">{model.intercept?.toFixed(4) || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Intercept</div>
              </div>
              
              <div className="text-center p-4 bg-background-secondary/30 rounded-lg">
                <div className="text-xl font-bold text-primary">{model.coefficients?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Coefficients</div>
              </div>
            </div>

            {model.coefficients && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-foreground mb-2">Coefficients</h4>
                <div className="flex flex-wrap gap-2">
                  {model.coefficients.map((coef: number, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-mono"
                    >
                      β{idx + 1}: {coef.toFixed(4)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ModelTraining;