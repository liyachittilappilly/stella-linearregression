import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Database, TrendingUp } from 'lucide-react';

interface DataDisplayProps {
  data: any[];
  fileName: string;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ data, fileName }) => {
  const [activeTab, setActiveTab] = useState<'head' | 'info' | 'describe' | 'nulls'>('head');
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0] || {});
  const shape = [data.length, columns.length];

  // Head data (first 5 rows)
  const headData = data.slice(0, 5);

  // Info data simulation
  const getDataTypes = () => {
    const types: { [key: string]: string } = {};
    const nonNullCounts: { [key: string]: number } = {};
    
    columns.forEach(col => {
      const sample = data.find(row => row[col] !== null && row[col] !== '');
      const value = sample?.[col];
      
      if (value !== undefined) {
        if (!isNaN(Number(value)) && value !== '') {
          types[col] = 'float64';
        } else {
          types[col] = 'object';
        }
      } else {
        types[col] = 'object';
      }
      
      nonNullCounts[col] = data.filter(row => row[col] !== null && row[col] !== '').length;
    });
    
    return { types, nonNullCounts };
  };

  // Describe data simulation (for numeric columns)
  const getDescribeData = () => {
    const numericColumns = columns.filter(col => {
      const sample = data.find(row => row[col] !== null && row[col] !== '');
      return sample && !isNaN(Number(sample[col])) && sample[col] !== '';
    });

    const stats: { [key: string]: { [stat: string]: number } } = {};
    
    numericColumns.forEach(col => {
      const values = data
        .map(row => parseFloat(row[col]))
        .filter(val => !isNaN(val));
      
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
        
        stats[col] = {
          count: values.length,
          mean: Math.round(mean * 100) / 100,
          std: Math.round(std * 100) / 100,
          min: values[0],
          '25%': values[Math.floor(values.length * 0.25)],
          '50%': values[Math.floor(values.length * 0.5)],
          '75%': values[Math.floor(values.length * 0.75)],
          max: values[values.length - 1]
        };
      }
    });
    
    return stats;
  };

  // Null values
  const getNullCounts = () => {
    const nullCounts: { [key: string]: number } = {};
    columns.forEach(col => {
      nullCounts[col] = data.filter(row => row[col] === null || row[col] === '' || row[col] === undefined).length;
    });
    return nullCounts;
  };

  const { types, nonNullCounts } = getDataTypes();
  const describeData = getDescribeData();
  const nullCounts = getNullCounts();

  const tabs = [
    { id: 'head', label: '.head()', icon: Database, description: 'First 5 rows' },
    { id: 'info', label: '.info()', icon: Info, description: 'Data types & info' },
    { id: 'describe', label: '.describe()', icon: TrendingUp, description: 'Statistical summary' },
    { id: 'nulls', label: '.isnull().sum()', icon: ChevronDown, description: 'Missing values' }
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-slide-up">
      <div className="p-6 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Dataset Analysis</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {fileName} • Shape: ({shape[0]}, {shape[1]})
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="overflow-x-auto">
            {activeTab === 'head' && (
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    {columns.map(col => (
                      <th key={col} className="text-left">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {headData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-mono text-primary">{idx}</td>
                      {columns.map(col => (
                        <td key={col} className="font-mono">
                          {row[col] ?? 'NaN'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/10 rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-2">DataFrame Info</h4>
                    <div className="space-y-1 font-mono text-sm">
                      <div>RangeIndex: {data.length} entries, 0 to {data.length - 1}</div>
                      <div>Data columns (total {columns.length} columns):</div>
                    </div>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-2">Memory Usage</h4>
                    <div className="font-mono text-sm">
                      Approx. {Math.round((data.length * columns.length * 8) / 1024)} KB
                    </div>
                  </div>
                </div>
                
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Non-Null Count</th>
                      <th>Dtype</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col, idx) => (
                      <tr key={col}>
                        <td className="font-mono text-primary">{idx} {col}</td>
                        <td className="font-mono">{nonNullCounts[col]} non-null</td>
                        <td className="font-mono">{types[col]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'describe' && (
              <div>
                {Object.keys(describeData).length > 0 ? (
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Statistic</th>
                        {Object.keys(describeData).map(col => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map(stat => (
                        <tr key={stat}>
                          <td className="font-mono text-primary">{stat}</td>
                          {Object.keys(describeData).map(col => (
                            <td key={col} className="font-mono">
                              {describeData[col][stat] !== undefined ? describeData[col][stat] : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No numeric columns found for statistical analysis
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nulls' && (
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Null Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map(col => {
                    const nullCount = nullCounts[col];
                    const percentage = ((nullCount / data.length) * 100).toFixed(1);
                    return (
                      <tr key={col}>
                        <td className="font-mono text-primary">{col}</td>
                        <td className="font-mono">{nullCount}</td>
                        <td className="font-mono">
                          <span className={nullCount > 0 ? 'text-yellow-400' : 'text-green-400'}>
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDisplay;