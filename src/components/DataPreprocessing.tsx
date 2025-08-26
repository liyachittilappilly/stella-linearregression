import { useState } from 'react';
import { Settings, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { getUniqueValues, replaceValues } from '../utils/mlUtils';
import { toast } from '@/hooks/use-toast';

interface DataPreprocessingProps {
  data: any[];
  onDataUpdate: (newData: any[]) => void;
}

interface Replacement {
  originalValue: string;
  newValue: number;
}

const DataPreprocessing: React.FC<DataPreprocessingProps> = ({ data, onDataUpdate }) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [uniqueValues, setUniqueValues] = useState<(string | number)[]>([]);
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column);
    if (column) {
      const unique = getUniqueValues(data, column);
      setUniqueValues(unique);
      
      // Initialize replacements with existing values
      const initialReplacements = unique.map((value, index) => ({
        originalValue: String(value),
        newValue: index // Default to index-based numbering
      }));
      setReplacements(initialReplacements);
    } else {
      setUniqueValues([]);
      setReplacements([]);
    }
  };

  const addReplacement = () => {
    if (uniqueValues.length === 0) return;
    
    const unusedValues = uniqueValues.filter(value => 
      !replacements.some(rep => rep.originalValue === String(value))
    );
    
    if (unusedValues.length > 0) {
      setReplacements([...replacements, {
        originalValue: String(unusedValues[0]),
        newValue: 0
      }]);
    }
  };

  const removeReplacement = (index: number) => {
    setReplacements(replacements.filter((_, i) => i !== index));
  };

  const updateReplacement = (index: number, field: 'originalValue' | 'newValue', value: string | number) => {
    const updated = [...replacements];
    updated[index] = {
      ...updated[index],
      [field]: field === 'newValue' ? Number(value) : String(value)
    };
    setReplacements(updated);
  };

  const applyReplacements = async () => {
    if (!selectedColumn || replacements.length === 0) {
      toast({
        title: "Error",
        description: "Please select a column and add replacements",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create replacement map
      const replacementMap: { [key: string]: number } = {};
      replacements.forEach(rep => {
        replacementMap[rep.originalValue] = rep.newValue;
      });

      // Apply replacements
      const updatedData = replaceValues(data, selectedColumn, replacementMap);
      
      // Update the data
      onDataUpdate(updatedData);
      
      toast({
        title: "Success",
        description: `Applied ${replacements.length} replacements to column "${selectedColumn}"`,
      });

      // Reset form
      setSelectedColumn('');
      setUniqueValues([]);
      setReplacements([]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply replacements. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getColumnPreview = () => {
    if (!selectedColumn) return null;
    
    const sampleValues = data.slice(0, 5).map(row => row[selectedColumn]);
    return sampleValues;
  };

  return (
    <section className="glass-card p-8 rounded-xl animate-slide-up">
      <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center">
        <Settings className="mr-3" />
        Data Preprocessing
      </h2>
      
      <div className="space-y-6">
        <div className="p-6 border border-border/20 rounded-lg bg-muted/10">
          <h3 className="text-lg font-semibold text-foreground mb-4">Categorical to Numerical Mapping</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Convert categorical values to numerical values for machine learning model training.
          </p>
          
          {/* Column Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Select Column</label>
            <select 
              value={selectedColumn}
              onChange={(e) => handleColumnSelect(e.target.value)}
              className="input-field w-full px-3 py-2 rounded-lg"
            >
              <option value="">Choose column to preprocess...</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Column Preview */}
          {selectedColumn && (
            <div className="mb-6 p-4 bg-background-secondary/30 rounded-lg">
              <h4 className="text-sm font-semibold text-foreground mb-2">Column Preview</h4>
              <div className="text-sm text-muted-foreground">
                Sample values: {getColumnPreview()?.join(', ')}
              </div>
              <div className="text-sm text-primary mt-1">
                Unique values: {uniqueValues.length} found
              </div>
            </div>
          )}

          {/* Unique Values Display */}
          {uniqueValues.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">Value Mappings</h4>
                <button
                  onClick={addReplacement}
                  className="btn-glass px-3 py-1 text-sm rounded-lg flex items-center hover:scale-105 transition-all"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Mapping
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {replacements.map((replacement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-background-secondary/20 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs text-muted-foreground mb-1">Original Value</label>
                      <select
                        value={replacement.originalValue}
                        onChange={(e) => updateReplacement(index, 'originalValue', e.target.value)}
                        className="input-field w-full px-2 py-1 text-sm rounded"
                      >
                        {uniqueValues.map((value) => (
                          <option key={String(value)} value={String(value)}>
                            {String(value)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="text-muted-foreground">→</div>
                    
                    <div className="flex-1">
                      <label className="block text-xs text-muted-foreground mb-1">Numerical Value</label>
                      <input
                        type="number"
                        value={replacement.newValue}
                        onChange={(e) => updateReplacement(index, 'newValue', e.target.value)}
                        className="input-field w-full px-2 py-1 text-sm rounded"
                        placeholder="Enter number..."
                      />
                    </div>
                    
                    <button
                      onClick={() => removeReplacement(index)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {replacements.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No mappings configured yet</p>
                  <p className="text-xs">Click "Add Mapping" to start</p>
                </div>
              )}
            </div>
          )}

          {/* Apply Button */}
          {replacements.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t border-border/20">
              <div className="text-sm text-muted-foreground">
                {replacements.length} mapping(s) configured
              </div>
              <button
                onClick={applyReplacements}
                disabled={isProcessing || replacements.length === 0}
                className="btn-primary px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground inline mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2 inline" />
                    Apply Replacements
                  </>
                )}
              </button>
            </div>
          )}

          {/* Replacement Preview */}
          {replacements.length > 0 && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="text-sm font-semibold text-primary mb-2">Mapping Preview</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {replacements.map((rep, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted-foreground">"{rep.originalValue}"</span>
                    <span className="text-primary font-mono">{rep.newValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DataPreprocessing;