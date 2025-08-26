import { useState } from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import DataDisplay from '../components/DataDisplay';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [projectName, setProjectName] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const handleDataLoad = (loadedData: any[], loadedFileName: string) => {
    setData(loadedData);
    setFileName(loadedFileName);
    setCurrentStep(2);
    toast({
      title: "Dataset Loaded Successfully",
      description: `${loadedFileName} has been processed and is ready for analysis.`,
    });
  };

  const handleError = (error: string) => {
    toast({
      title: "Upload Error",
      description: error,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <section id="home" className="text-center py-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Simple Linear Regression Model
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build, train, and analyze linear regression models with an elegant, 
              intuitive interface designed for data scientists and researchers.
            </p>
          </section>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step <= currentStep
                        ? 'bg-primary text-primary-foreground shadow-glow'
                        : 'bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-all ${
                        step < currentStep ? 'bg-primary' : 'bg-muted/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Setup */}
              <section className="glass-card p-8 rounded-xl animate-fade-in">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Project Setup</h2>
                
                <div className="mb-6">
                  <label htmlFor="projectName" className="block text-sm font-medium text-foreground mb-3">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter your project name..."
                    className="input-field w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </section>

              {/* File Upload */}
              <FileUpload onDataLoad={handleDataLoad} onError={handleError} />

              {/* Data Display */}
              {data.length > 0 && <DataDisplay data={data} fileName={fileName} />}

              {/* Data Exploration Section */}
              {data.length > 0 && (
                <section className="glass-card p-8 rounded-xl animate-slide-up">
                  <h2 className="text-2xl font-semibold mb-6 text-foreground">Data Exploration</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Select Column for Value Counts
                      </label>
                      <select className="input-field w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Choose a column...</option>
                        {Object.keys(data[0] || {}).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button className="btn-primary px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 w-full">
                        Generate Value Count
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 p-6 border border-border/20 rounded-lg bg-muted/10">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Plotting Controls</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">X-axis</label>
                        <select className="input-field w-full px-3 py-2 rounded-lg">
                          <option value="">Select X-axis...</option>
                          {Object.keys(data[0] || {}).map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Y-axis</label>
                        <select className="input-field w-full px-3 py-2 rounded-lg">
                          <option value="">Select Y-axis...</option>
                          {Object.keys(data[0] || {}).map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Plot Type</label>
                        <select className="input-field w-full px-3 py-2 rounded-lg">
                          <option value="scatter">Scatter</option>
                          <option value="line">Line</option>
                          <option value="bar">Bar</option>
                          <option value="histogram">Histogram</option>
                        </select>
                      </div>
                      
                      <div className="flex items-end">
                        <button className="btn-glass px-4 py-2 rounded-lg font-medium w-full transition-all hover:scale-105">
                          Generate Plot
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Data Preprocessing Section */}
              {data.length > 0 && (
                <section className="glass-card p-8 rounded-xl animate-slide-up">
                  <h2 className="text-2xl font-semibold mb-6 text-foreground">Data Preprocessing</h2>
                  
                  <div className="space-y-6">
                    <div className="p-6 border border-border/20 rounded-lg bg-muted/10">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Data Replacement Tool</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Column Name</label>
                          <select className="input-field w-full px-3 py-2 rounded-lg">
                            <option value="">Select column...</option>
                            {Object.keys(data[0] || {}).map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Replace With</label>
                          <input
                            type="text"
                            placeholder="Enter replacement value..."
                            className="input-field w-full px-3 py-2 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <button className="btn-glass px-6 py-2 rounded-lg font-medium mt-4 transition-all hover:scale-105">
                        Apply Replacement
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              {data.length > 0 && (
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Dataset Overview</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rows</span>
                      <span className="font-mono text-primary">{data.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Columns</span>
                      <span className="font-mono text-primary">{Object.keys(data[0] || {}).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-mono text-primary">{Math.round((data.length * Object.keys(data[0] || {}).length * 8) / 1024)} KB</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sample Dataset */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-4">Need Sample Data?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Download our sample datasets to get started quickly.
                </p>
                <button className="btn-glass px-4 py-2 rounded-lg font-medium w-full transition-all hover:scale-105">
                  Download Sample CSV
                </button>
              </div>

              {/* Help Section */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <a href="#how-it-works" className="block text-primary hover:text-primary-glow transition-colors text-sm">
                    → How Linear Regression Works
                  </a>
                  <a href="#projects" className="block text-primary hover:text-primary-glow transition-colors text-sm">
                    → View Example Projects
                  </a>
                  <a href="#" className="block text-primary hover:text-primary-glow transition-colors text-sm">
                    → Documentation & Tutorials
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;