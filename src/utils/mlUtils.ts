import { Matrix } from 'ml-matrix';
import { SimpleLinearRegression } from 'ml-regression';

export interface DataPoint {
  [key: string]: string | number;
}

export interface ValueCount {
  value: string | number;
  count: number;
}

export interface ModelMetrics {
  r2: number;
  mse: number;
  mae: number;
  coefficients?: number[];
  intercept?: number;
}

export interface TrainTestSplit {
  xTrain: number[][];
  xTest: number[][];
  yTrain: number[];
  yTest: number[];
}

// Generate value counts for a column
export const getValueCounts = (data: DataPoint[], column: string): ValueCount[] => {
  const counts: { [key: string]: number } = {};
  
  data.forEach(row => {
    const value = row[column];
    const stringValue = String(value);
    counts[stringValue] = (counts[stringValue] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
};

// Get unique values from a column
export const getUniqueValues = (data: DataPoint[], column: string): (string | number)[] => {
  const uniqueSet = new Set<string | number>();
  data.forEach(row => {
    const value = row[column];
    if (typeof value === 'string' || typeof value === 'number') {
      uniqueSet.add(value);
    }
  });
  return Array.from(uniqueSet).sort((a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });
};

// Replace values in dataset
export const replaceValues = (
  data: DataPoint[], 
  column: string, 
  replacements: { [key: string]: number }
): DataPoint[] => {
  return data.map(row => ({
    ...row,
    [column]: replacements[String(row[column])] !== undefined 
      ? replacements[String(row[column])] 
      : row[column]
  }));
};

// Train-test split
export const trainTestSplit = (
  X: number[][], 
  y: number[], 
  testSize: number = 0.2, 
  randomState?: number
): TrainTestSplit => {
  if (randomState !== undefined) {
    // Simple seeded shuffle (for demo purposes)
    Math.random = () => {
      randomState = (randomState * 9301 + 49297) % 233280;
      return randomState / 233280;
    };
  }

  const indices = Array.from({ length: X.length }, (_, i) => i);
  
  // Shuffle indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const testCount = Math.floor(X.length * testSize);
  const trainCount = X.length - testCount;

  const trainIndices = indices.slice(0, trainCount);
  const testIndices = indices.slice(trainCount);

  return {
    xTrain: trainIndices.map(i => X[i]),
    xTest: testIndices.map(i => X[i]),
    yTrain: trainIndices.map(i => y[i]),
    yTest: testIndices.map(i => y[i])
  };
};

// Linear regression training
export const trainLinearRegression = (X: number[][], y: number[]): any => {
  if (X[0].length === 1) {
    // Simple linear regression for single feature
    const regression = new SimpleLinearRegression(X.map(row => row[0]), y);
    return {
      predict: (values: number[][]) => values.map(row => regression.predict(row[0])),
      coefficients: [regression.slope],
      intercept: regression.intercept,
      score: regression.score(X.map(row => row[0]), y).r2
    };
  } else {
    // Multiple linear regression using least squares
    try {
      // Simple implementation using normal equations
      // For multiple features, we'll use a simplified approach
      const n = X.length;
      const p = X[0].length;
      
      // Create design matrix with intercept column
      const designMatrix: number[][] = X.map(row => [1, ...row]);
      
      // Calculate coefficients using least squares
      const coefficients = solveLeastSquares(designMatrix, y);
      const intercept = coefficients[0];
      const slopes = coefficients.slice(1);
      
      return {
        predict: (values: number[][]) => {
          return values.map(row => {
            return intercept + row.reduce((sum, val, idx) => sum + val * slopes[idx], 0);
          });
        },
        coefficients: slopes,
        intercept: intercept,
        score: calculateR2(X, y, intercept, slopes)
      };
    } catch (error) {
      console.error('Error in linear regression:', error);
      throw new Error('Unable to train model. Check for multicollinearity or insufficient data.');
    }
  }
};

// Simple least squares solver
const solveLeastSquares = (X: number[][], y: number[]): number[] => {
  const n = X.length;
  const p = X[0].length;
  
  // Create XTX matrix (X transpose times X)
  const XTX: number[][] = Array(p).fill(0).map(() => Array(p).fill(0));
  const XTy: number[] = Array(p).fill(0);
  
  // Calculate XTX and XTy
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < n; k++) {
        XTX[i][j] += X[k][i] * X[k][j];
      }
    }
    for (let k = 0; k < n; k++) {
      XTy[i] += X[k][i] * y[k];
    }
  }
  
  // Solve XTX * beta = XTy using Gaussian elimination
  return gaussianElimination(XTX, XTy);
};

// Gaussian elimination solver
const gaussianElimination = (A: number[][], b: number[]): number[] => {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const solution = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    solution[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      solution[i] -= augmented[i][j] * solution[j];
    }
    solution[i] /= augmented[i][i];
  }
  
  return solution;
};

// Calculate R² score
const calculateR2 = (X: number[][], y: number[], intercept: number, coefficients: number[]): number => {
  const predictions = X.map(row => 
    intercept + row.reduce((sum, val, idx) => sum + val * coefficients[idx], 0)
  );
  
  const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
  const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const residualSumSquares = y.reduce((sum, val, idx) => sum + Math.pow(val - predictions[idx], 2), 0);
  
  return 1 - (residualSumSquares / totalSumSquares);
};

// Calculate model metrics
export const calculateMetrics = (yTrue: number[], yPred: number[]): ModelMetrics => {
  const n = yTrue.length;
  
  // Mean Squared Error
  const mse = yTrue.reduce((sum, actual, i) => {
    return sum + Math.pow(actual - yPred[i], 2);
  }, 0) / n;
  
  // Mean Absolute Error
  const mae = yTrue.reduce((sum, actual, i) => {
    return sum + Math.abs(actual - yPred[i]);
  }, 0) / n;
  
  // R² Score
  const yMean = yTrue.reduce((sum, val) => sum + val, 0) / n;
  const totalSumSquares = yTrue.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const residualSumSquares = yTrue.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
  const r2 = 1 - (residualSumSquares / totalSumSquares);
  
  return { r2, mse, mae };
};

// Extract features and target from data
export const extractFeatures = (
  data: DataPoint[], 
  featureColumns: string[], 
  targetColumn: string
): { X: number[][], y: number[] } => {
  const X: number[][] = [];
  const y: number[] = [];
  
  data.forEach(row => {
    const features = featureColumns.map(col => {
      const value = row[col];
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(numValue) ? 0 : numValue;
    });
    
    const target = row[targetColumn];
    const targetValue = typeof target === 'number' ? target : parseFloat(String(target));
    
    if (!isNaN(targetValue)) {
      X.push(features);
      y.push(targetValue);
    }
  });
  
  return { X, y };
};