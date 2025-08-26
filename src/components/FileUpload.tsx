import { useState, useRef } from 'react';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

interface FileUploadProps {
  onDataLoad: (data: any[], fileName: string) => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoad, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onError('Please upload a CSV file');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setFileName(file.name);
    setUploadStatus('idle');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          onError('Error parsing CSV file: ' + results.errors[0].message);
          setUploadStatus('error');
        } else {
          onDataLoad(results.data, file.name);
          setUploadStatus('success');
        }
        setUploading(false);
      },
      error: (error) => {
        onError('Error reading file: ' + error.message);
        setUploadStatus('error');
        setUploading(false);
      }
    });
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="glass-card p-8 rounded-xl animate-fade-in">
      <h3 className="text-xl font-semibold mb-6 text-foreground">Upload Dataset</h3>
      
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-primary bg-primary/5 scale-105'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-500/5'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-500/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          ) : uploadStatus === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <Upload className={`h-12 w-12 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          )}

          <div>
            {uploading ? (
              <p className="text-foreground font-medium">Processing {fileName}...</p>
            ) : uploadStatus === 'success' ? (
              <p className="text-green-500 font-medium">Successfully loaded {fileName}</p>
            ) : uploadStatus === 'error' ? (
              <p className="text-red-500 font-medium">Upload failed</p>
            ) : (
              <>
                <p className="text-foreground font-medium mb-2">
                  {dragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                </p>
                <p className="text-muted-foreground text-sm">or click to browse</p>
              </>
            )}
          </div>

          {!uploading && uploadStatus !== 'success' && (
            <button
              onClick={onButtonClick}
              className="btn-primary px-6 py-2 rounded-lg font-medium transition-all hover:scale-105"
            >
              <File className="w-4 h-4 mr-2 inline" />
              Choose File
            </button>
          )}
        </div>
      </div>

      {uploadStatus === 'success' && (
        <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-green-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Dataset uploaded successfully! View the data exploration below.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;