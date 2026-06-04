from flask import Flask, jsonify, request, send_file, send_from_directory
import pandas as pd
import json
from werkzeug.utils import secure_filename
from flask_cors import CORS
import io
import numpy as np
import os
import openpyxl
import xlrd
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        # Handle pandas/numpy NaN values
        if pd.isna(obj):
            return None
        # Handle numpy types that aren't JSON serializable
        if isinstance(obj, (np.integer, np.floating)):
            return obj.item()
        return super().default(obj)

# Set as the default JSON encoder for Flask
app.json_encoder = CustomJSONEncoder

# Store dataset globally
uploaded_data = None
fname = None

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route("/upload_file", methods=['POST'])
def upload_file():
    """
    Upload CSV or Excel file and return DataFrame
    """
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'data': None, 'message': 'No file uploaded'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'data': None, 'message': 'No file selected'})
        
        global fname
        filename = secure_filename(file.filename)
        fname = filename
        file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        if file_extension == 'csv':
            df = pd.read_csv(file, na_values=['', 'NULL', 'null', 'NaN', 'N/A'])
            message = 'CSV file uploaded successfully'
        elif file_extension in ['xlsx', 'xls']:
            # Save the file temporarily to read with specific engines
            temp_path = f"temp_{filename}"
            file.save(temp_path)
            
            try:
                if file_extension == 'xlsx':
                    # Use openpyxl for .xlsx files
                    df = pd.read_excel(temp_path, engine='openpyxl', na_values=['', 'NULL', 'null', 'NaN', 'N/A'])
                else:  # .xls files
                    # Use xlrd for .xls files
                    df = pd.read_excel(temp_path, engine='xlrd', na_values=['', 'NULL', 'null', 'NaN', 'N/A'])
                message = 'Excel file uploaded successfully'
            except Exception as excel_error:
                # Fallback to default engine if specific engines fail
                try:
                    df = pd.read_excel(temp_path, na_values=['', 'NULL', 'null', 'NaN', 'N/A'])
                    message = 'Excel file uploaded successfully (using default engine)'
                except Exception as fallback_error:
                    return jsonify({
                        'success': False, 
                        'data': None, 
                        'message': f'Error reading Excel file: {str(excel_error)}. Fallback also failed: {str(fallback_error)}'
                    })
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        else:
            return jsonify({'success': False, 'data': None, 'message': 'Invalid file type. Please upload CSV or Excel files.'})
        
        global uploaded_data 
        uploaded_data = df
        
        # Convert NaN to None for the entire DataFrame
        df_cleaned = df.replace({np.nan: None})
        
        data_preview = {
            'columns': df_cleaned.columns.tolist(),
            'first_few_rows': df_cleaned.head(10).to_dict('records'),
            'shape': [df_cleaned.shape[0], df_cleaned.shape[1]]
        }
        
        response_data = {
            'success': True,
            'data': df_cleaned.to_dict('records'),
            'message': message,
            'preview': data_preview,
            'shape': [df_cleaned.shape[0], df_cleaned.shape[1]],
            'columns': df_cleaned.columns.tolist()
        }

        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'success': False, 'data': None, 'message': f'Error reading file: not suitable for data analysis'})    

# Get info section
@app.route("/get_nulls", methods=['GET'])
def nulls_analysis():
    global uploaded_data
    if uploaded_data is None:
            return jsonify({'error': 'No dataset uploaded. Please upload a dataset first.'}), 400
    from get_info import get_nulls
    no_of_nulls = get_nulls(uploaded_data)
    return jsonify({'data': no_of_nulls})

@app.route("/get_outliers", methods=['GET'])
def get_outliers_analysis():
    global uploaded_data
    if uploaded_data is None:
            return jsonify({'error': 'No dataset uploaded. Please upload a dataset first.'}), 400
    from get_info import get_outliers
    outliers_info = get_outliers(uploaded_data)
    return jsonify({'data': outliers_info})

@app.route("/get_value_counts", methods=['GET'])
def get_value_counts_analysis():
    global uploaded_data
    if uploaded_data is None:
            return jsonify({'error': 'No dataset uploaded. Please upload a dataset first.'}), 400
    from get_info import get_value_counts
    value_counts_info = get_value_counts(uploaded_data)
    return jsonify({'data': value_counts_info})


@app.route("/get_categories", methods=['GET'])
def get_categories_analysis():
    global uploaded_data
    if uploaded_data is None:
            return jsonify({'error': 'No dataset uploaded. Please upload a dataset first.'}), 400
    from get_info import get_categories
    categories_raw = get_categories(uploaded_data)
    categories = {
        'int_fields': sorted(list(categories_raw[0])),
        'float_fields': sorted(list(categories_raw[1])),
        'str_fields': sorted(list(categories_raw[2])),
        'date_fields': sorted(list(categories_raw[3])),
        'bool_fields': sorted(list(categories_raw[4]))
    }
    return jsonify({'data': categories})



@app.route('/get_columns', methods=['GET'])
def get_columns():
    global uploaded_data
    if uploaded_data is None:
        return jsonify({'columns': []})
    return jsonify({'columns': uploaded_data.columns.tolist()})



@app.route('/generate_plot', methods=['POST','GET'])
def generate_plot():
    try:
        global uploaded_data
        if uploaded_data is None:
            return jsonify({'error': 'No dataset uploaded. Please upload a dataset first.'}), 400
        
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
        plot_function = data.get('plot_function')
        x = data.get('x')
        y = data.get('y')
        title = data.get('title','')
        column = data.get('column')
        
        if not plot_function:
            return jsonify({'error': 'Plot function is required'}), 400
        
        # Import plot functions
        from visualize import lineplot, barplot, scatterplot, piechart, heatmap, boxplot ,histogram, pairplot
        
        if plot_function == 'lineplot':
            if not x or not y:
                return jsonify({'error': 'Both x and y columns are required for line plot'}), 400
            
            if not pd.api.types.is_numeric_dtype(uploaded_data[y]):
                return jsonify({'error': 'Y-axis must be numerical for line plot'}), 400
            
            if uploaded_data[[x, y]].dropna().shape[0] < 2:
                return jsonify({
                    'error': 'Insufficient data for line plot. Need at least 2 valid data points'
                }), 400
            if uploaded_data[x].dtype == 'O' and uploaded_data[x].nunique() > 20:
                return jsonify({
                    'error': f'{x} column has too many values for line plot'
                }), 400
            image_b64 = lineplot(uploaded_data, x, y, title)
        
        elif plot_function == 'barplot':
            if not x or not y:
                return jsonify({'error': 'Both x and y columns are required for bar plot'}), 400
            
            if not pd.api.types.is_numeric_dtype(uploaded_data[y]):
                return jsonify({'error': 'Y-axis must be numerical for bar plot'}), 400
            if uploaded_data[x].dtype == 'O' and uploaded_data[x].nunique() > 20:
                return jsonify({
                    'error': f'{x} column has too many values for bar plot'
                }), 400
            # Check for reasonable number of categories
            category_count = uploaded_data[x].nunique()
            if category_count > 30:
                return jsonify({
                    'error': f'Bar plot would have too many bars ({category_count}). Consider using a different plot type or aggregating your data.'
                }), 400
            
            # Basic data check
            if uploaded_data[[x, y]].dropna().empty:
                return jsonify({
                    'error': 'No valid data available for bar plot'
                }), 400
            
            image_b64 = barplot(uploaded_data, x, y, title)
        
        elif plot_function == 'scatterplot':
            if not x or not y:
                return jsonify({'error': 'Both x and y columns are required for scatter plot'}), 400
            if not (pd.api.types.is_numeric_dtype(uploaded_data[x]) and pd.api.types.is_numeric_dtype(uploaded_data[y])):
                return jsonify({'error': 'Both x and y columns should be numerical for scatter plot'}), 400
            clean_data = uploaded_data[[x, y]].dropna()
            if len(clean_data) < 3:
                return jsonify({
                    'error': 'Need at least 3 valid data points for meaningful scatter plot'
                }), 400
            image_b64 = scatterplot(uploaded_data, x, y,title)
        
        elif plot_function == 'piechart':
            if not column:
                return jsonify({'error': 'Column is required for pie chart'}), 400
            # Simple but robust check
            if (not pd.api.types.is_string_dtype(uploaded_data[column]) and not pd.api.types.is_categorical_dtype(uploaded_data[column]) and not pd.api.types.is_object_dtype(uploaded_data[column])):
    
                return jsonify({
                'error': f"Column '{column}' must be categorical data (text-based) for pie charts. Current type: {uploaded_data[column].dtype}"
                    }), 400
            # Check category count
            if uploaded_data[column].nunique() > 20:
                return jsonify({
                    'error': f"Pie charts work best with limited categories. Column '{column}' has {uploaded_data[column].nunique()} unique values. Maximum 20 values are allowed"
                }), 400
            image_b64 = piechart(uploaded_data, column,title)

        elif plot_function == 'boxplot':
            if not column:
                return jsonify({'error': 'Column is required for box plot'}), 400
            def validate_boxplot_data(series):
                """Validate if series is suitable for box plot"""                
                # Check if numeric
                if not pd.api.types.is_numeric_dtype(series):
                    return False, f"Data must be numerical for box plots. Current type: {series.dtype}"                
                # Check for sufficient data points (box plots need reasonable sample size)
                non_null_count = series.count()
                if non_null_count < 5:
                    return False, f"Insufficient data points ({non_null_count}) for box plot. Minimum 5 non-null values required."                
                # Check if there's meaningful variation (not all same values)
                if series.nunique() <= 1:
                    return False, "Data has no variation (all values are identical). Box plot requires meaningful data distribution."                
                return True, "Valid"
            is_valid, message = validate_boxplot_data(uploaded_data[column])
            if not is_valid:
                return jsonify({'error': message}), 400
            image_b64 = boxplot(uploaded_data, column,title)

        elif plot_function == 'histogram':
            if not column:
                return jsonify({'error': 'Column is required for histogram'}), 400
            def validate_histogram_data(series):
                """Validate if series is suitable for histogram"""                
                # Check if numeric
                if not pd.api.types.is_numeric_dtype(series):
                    return False, f"Data must be numerical for histograms. Current type: {series.dtype}"                
                # Check for sufficient data points
                non_null_count = series.count()
                if non_null_count < 5:
                    return False, f"Insufficient data points ({non_null_count}) for histogram. Minimum 5 non-null values required."                
                # Check if there's meaningful variation
                if series.nunique() <= 1:
                    return False, "Data has no variation (all values are identical). Histogram requires meaningful data distribution."                
                # Check if data has enough spread for meaningful bins
                data_range = series.max() - series.min()
                if data_range == 0:
                    return False, "Data has no range (all values are the same). Cannot create meaningful histogram."                
                return True, "Valid"
            
            is_valid, message = validate_histogram_data(uploaded_data[column])
            if not is_valid:
                return jsonify({'error': message}), 400
            image_b64 = histogram(uploaded_data, column,title)

        elif plot_function == 'heatmap':
            def validate_heatmap_data(df):
                # Check we have at least 2 columns
                num_cols = df.select_dtypes(include=np.number).columns.tolist()
                if len(num_cols) < 2:
                    return False, "Heatmap requires at least 2 numerical columns"
                    # check if all numerical columns are not having non-null values
                if uploaded_data[num_cols].dropna().empty:
                    return False,"numerical columns have no valid data for heatmap"
                return True ,"valid"
            is_valid, message = validate_heatmap_data(uploaded_data)
            if not is_valid:
                return jsonify({'error': message}), 400
            image_b64 = heatmap(uploaded_data,title)

        elif plot_function == 'pairplot':
            numeric_cols = uploaded_data.select_dtypes(include=np.number).columns.tolist()
            if len(numeric_cols) == 0:
                  return jsonify({
                    'error': "No numerical columns are available in this dataset"
                }), 400
            if len(numeric_cols) < 2:
                return jsonify({
                    'error': "Pairplot requires at least 2 numerical columns in the dataset"
                }), 400
            image_b64 = pairplot(uploaded_data, title)

        
        else:
            return jsonify({'error': f'Unknown plot function: {plot_function}'}), 400
        
        return jsonify({'image': image_b64})
    
    except Exception as e:
        return jsonify({'error': f'Error generating plot: {str(e)}'}), 500



from processed import get_fully_processed_data, handle_missing_values, scale_features, encode_categorical, remove_outliers, dataframe_to_csv

@app.route("/get_processed_data", methods=['POST','GET'])
def get_processed_data():
    try:
        global uploaded_data
        if uploaded_data is None:
            return jsonify({'error': 'No dataset uploaded. Please upload a dataset first.'}), 400
        
        data = request.get_json()
        processing_type = data.get('processing_type')
        model_type = data.get('model_type')
        target_column = data.get('target_column')
        
        if processing_type == 'full_pipeline':
            if not model_type:
                return jsonify({"error":"Model type is required for full preprocessing"}), 400
            
            processed_df = get_fully_processed_data(uploaded_data,model_type,target_column)
            
        else:
            processed_df = uploaded_data.copy()
            
            if processing_type == 'handle_missing_values':
                processed_df = handle_missing_values(processed_df)
            elif processing_type == 'scale_features':
                processed_df = scale_features(processed_df)
            elif processing_type == 'encode_categorical':
                if uploaded_data[target_column].dtype not in ['object', 'category']:
                    return jsonify({"error": "The provided target column is not categorical data"}), 400
            
                processed_df = encode_categorical(processed_df, target_column)
            elif processing_type == 'remove_outliers':
                processed_df = remove_outliers(processed_df)
            else:
                return jsonify({"error":"Invalid processing type"}), 400
        
        # Convert to CSV and send as file
        csv_data = dataframe_to_csv(processed_df)
        
        return send_file(
            io.BytesIO(csv_data.encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'processed_{fname.split(".")[0]}.csv'
        )
        
    except Exception as e:
        print(f"Error processing data: {str(e)}")
        return jsonify({"error": f"Error processing data: {str(e)}"}), 500




from model_train import train_models
@app.route("/get_trained_model",methods=['GET','POST'])
def get_trained_model():
    try:
        global uploaded_data
        if uploaded_data is None:
            return jsonify({'error': 'No dataset uploaded. Please upload a dataset first.'}), 400
        
        data = request.get_json()
        problem_type = data.get('problem_type')
        model_type = data.get('model_type')
        target_column = data.get('target_column')

        if not model_type :
            return jsonify({"error":"Model type is required for full preprocessing to train the model"}), 400
        if not problem_type:
            return jsonify({"error":"Problem type is required for model training"}), 400
        if not target_column:
            return jsonify({"error":"Target column is required for model training"}), 400
        if target_column not in uploaded_data.columns:
            return jsonify({"error":f"Target column '{target_column}' not found in dataset"}), 400

        accuraries = train_models(uploaded_data,model_type,target_column,problem_type)

        return jsonify({"accuracies":accuraries}), 200

    except Exception as e:
        print(f"Error processing data: {str(e)}")
        return jsonify({"error": f"Error processing data: {str(e)}"}), 500
    

if __name__ == "__main__":
    app.run(debug=True)
