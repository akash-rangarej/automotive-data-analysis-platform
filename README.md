# Data Analytics Suite – Smart Data Analysis & ML Preprocessing Platform

Data Analytics Suite is a full-stack web application that enables users to perform **data analysis, visualization, and preprocessing** in a simple and interactive way. It is designed especially for beginners who want to explore datasets and prepare them for machine learning without complex coding.

---

## 🚀 Features

### 📂 Dataset Upload

* Upload CSV and Excel files (.csv, .xlsx, .xls)
* File validation (type + size limit)
* Instant dataset preview (rows, columns, sample data)
* Backend parsing using Pandas

---

### 🔍 Dataset Analysis (Get Info)

* Null value detection (column-wise)
* Outlier detection using IQR method
* Value counts for categorical data
* Automatic column type classification:
  * Integer
  * Float
  * String
  * Boolean
  * Date

---

### 📈 Data Visualization

* Generate multiple plot types:
  * Line Plot
  * Bar Plot
  * Scatter Plot
  * Pie Chart
  * Heatmap
  * Histogram
  * Box Plot
  * Pair Plot

* Features:
  * Dynamic column selection
  * Input validation for meaningful plots
  * Download plots as images

---

### ⚙️ Data Preprocessing (ML Ready)

#### Step-by-step Processing

* Handle missing values (median/mode)
* Feature scaling (Standard, MinMax, Robust)
* Encode categorical variables (OneHot, Ordinal, Label Encoding)
* Remove outliers (IQR-based)

---

#### Full ML Pipeline (Model-based preprocessing)

Automatically preprocess data based on selected ML model:

* Linear Models (Regression, SVM)
  * Scaling + Encoding + Outlier handling

* Tree-based Models (Random Forest, XGBoost)
  * Encoding + Missing value handling

* Distance-based Models (KNN, PCA)
  * Scaling + Encoding

* Neural Networks
  * Normalization + Encoding

* Naive Bayes
  * Encoding + Scaling

* Clustering Models (K-Means, DBSCAN)
  * Scaling + Outlier handling

---

## 🏗️ Tech Stack

### Frontend

* React.js
* JavaScript
* CSS
* Fetch API

### Backend

* Flask (Python)
* Pandas, NumPy
* Scikit-learn
* Matplotlib, Seaborn

---

## 📂 Project Structure

```bash
project-root/
│
├── backend/
│ ├── app.py
│ ├── get_info.py
│ ├── visualize.py
│ ├── processed.py
│
├── frontend/
│ ├── components/
│ │ ├── About.jsx
│ │ ├── FileUpload.jsx
│ │ ├── GetInfo.jsx
│ │ ├── Visualize.jsx
│ │ ├── GetProcessedData.jsx
│
└── README.md
```

---

## ⚙️ How It Works

1. User uploads dataset (CSV/Excel)
2. Dataset is parsed and stored temporarily in backend
3. User selects one of the options:
   * Get Info → Analyze dataset
   * Visualize → Generate plots
   * Process Data → Preprocess dataset
4. System returns:
   * Analysis results
   * Visualization images
   * Processed dataset (downloadable CSV)

---

## 🔌 Backend API Endpoints

### 📂 Upload

* `POST /upload_file` → Upload dataset

---

### 🔍 Analysis

* `GET /get_nulls` → Get null values per column  
* `GET /get_outliers` → Detect outliers  
* `GET /get_value_counts` → Get categorical value counts  
* `GET /get_categories` → Get column data types  

---

### 📈 Visualization

* `POST /generate_plot` → Generate plots  
  * Inputs:
    * plot type
    * columns (x, y, or single column)
    * title

---

### ⚙️ Processing

* `POST /get_processed_data`
  * Step-based processing OR full pipeline
  * Returns downloadable CSV file

---

## 🧠 Core Logic

### Data Analysis

* Nulls → Pandas `.isnull()`
* Outliers → IQR (Q1, Q3, 1.5×IQR)
* Categories → dtype detection

---

### Data Processing

* Missing values → Median / Mode
* Scaling → StandardScaler, MinMaxScaler, RobustScaler
* Encoding:
  * OneHot (low cardinality)
  * Ordinal (high cardinality)
  * Label encoding (target column)
* Outliers → replaced with median

---

### Visualization

* Built using:
  * Matplotlib
  * Seaborn
* Converted to base64 images for frontend display

---

## ▶️ Running the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py

Runs on:
http://127.0.0.1:5000

Frontend
cd frontend
npm install
npm run dev

Runs on:
http://localhost:5173
```

## ⚠️ Limitations
- No database (data stored in memory)
- File size limit (~10MB)
- Not optimized for very large datasets
- Limited advanced ML integrations


## 🚧 Future Improvements
- Add authentication system
- Support large datasets (chunk processing)
- Add ML model training & prediction
- Cloud deployment (AWS / Render / Vercel)
- Add NLP and image dataset support (CNN projects)


## 📖 Use Case
This platform is useful for
Beginners learning Data Science
Students working on ML projects
Quick dataset exploration
Preparing clean datasets for ML models


## 👨‍💻 Author
Akash Rangarej
