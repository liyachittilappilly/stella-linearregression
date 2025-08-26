

# Stella - Supervised Learning Simplified

A minimalistic, elegant web application for exploring and implementing simple linear regression models with a sophisticated dark-themed interface.


## Features

- **Dataset Upload & Exploration**: Upload CSV files and instantly view key statistics
- **Interactive Data Visualization**: Create dynamic plots using Plotly.js
- **Data Preprocessing**: Replace text values with numerical data for modeling
- **Model Training**: Train linear regression models with customizable parameters
- **Performance Evaluation**: Visualize predictions and view key metrics
- **Responsive Design**: Fully functional across all device sizes
- **Dark Theme**: Elegant monochrome gradient background with glowing accents

## Tech Stack

- **Frontend**: HTML5, CSS3 (Grid, Flexbox, Variables), JavaScript (ES6+)
- **Visualization**: Plotly.js for interactive charts
- **Data Processing**: Custom JavaScript implementation of Pandas-like operations
- **Styling**: Minimalistic design with smooth transitions and micro-interactions

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server-side requirements (fully client-side application)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stella-ai.git
```

2. Navigate to the project directory:
```bash
cd stella-ai
```

3. Open `index.html` in your browser:
```bash
# For macOS
open index.html

# For Windows
start index.html

# For Linux
xdg-open index.html
```

## Usage

1. **Upload Dataset**: Click "Upload Dataset" to select a CSV file from your computer
2. **Explore Data**: View automatically generated statistics including `.head()`, `.shape()`, `.info()`, `.describe()`, and null value counts
3. **Visualize Data**: Select columns and plot type to generate interactive visualizations
4. **Preprocess Data**: Use the data replacement tool to convert text values to numerical data
5. **Train Model**: Configure train-test split parameters and select features/target
6. **Evaluate Results**: View model performance metrics and prediction visualization
7. **Export Results**: Download model summary as PDF or CSV

## Project Structure

```
stella-ai/
├── index.html          # Main HTML file
├── css/
│   ├── style.css       # Main stylesheet
│   └── variables.css   # CSS variables
├── js/
│   ├── app.js          # Main application logic
│   ├── dataProcessor.js # Data manipulation functions
│   ├── modelTrainer.js # Linear regression implementation
│   └── visualizer.js   # Plotly.js integration
├── assets/
│   ├── logo.svg        # Stella logo
│   └── sample-data.csv # Sample dataset for testing
└── README.md           # This file
```

## Functionality

### Data Processing
- CSV parsing with PapaParse
- Pandas-like operations implemented in JavaScript:
  - `.head()` - First 5 rows
  - `.shape()` - Dataset dimensions
  - `.info()` - Data types and non-null counts
  - `.describe()` - Statistical summary
  - `.isnull().sum()` - Null value counts

### Model Training
- Simple linear regression implementation
- Train-test split functionality
- Feature selection and target variable specification
- Model evaluation metrics:
  - Mean Squared Error (MSE)
  - Mean Absolute Error (MAE)
  - R-squared (R²) score

### Visualization
- Interactive plots using Plotly.js
- Support for bar, line, scatter, and histogram charts
- Dynamic axis selection
- Prediction vs actual scatter plot

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
