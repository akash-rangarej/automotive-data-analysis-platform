from flask import Flask, jsonify, request, send_file, send_from_directory
import pandas as pd
import json
from werkzeug.utils import secure_filename
from flask_cors import CORS
import io
import numpy as np
import os

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
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
            df = pd.read_excel(file)
            message = 'Excel file uploaded successfully'
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

        # Now you can use jsonify directly since we set the custom encoder
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'success': False, 'data': None, 'message': f'Error reading file: {str(e)}'})
    

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
            image_b64 = lineplot(uploaded_data, x, y,title)
        
        elif plot_function == 'barplot':
            if not x or not y:
                return jsonify({'error': 'Both x and y columns are required for bar plot'}), 400
            image_b64 = barplot(uploaded_data, x, y,title)
        
        elif plot_function == 'scatterplot':
            if not x or not y:
                return jsonify({'error': 'Both x and y columns are required for scatter plot'}), 400
            image_b64 = scatterplot(uploaded_data, x, y,title)
        
        elif plot_function == 'piechart':
            if not column:
                return jsonify({'error': 'Column is required for pie chart'}), 400
            if uploaded_data[column].dtype != "O":
                return jsonify({"error":"the provided column is not an categorical data"}), 400
            image_b64 = piechart(uploaded_data, column,title)

        elif plot_function == 'boxplot':
            if not column:
                return jsonify({'error': 'Column is required for box plot'}), 400
            if uploaded_data[column].dtype not in ["int64","float64"]:
                return jsonify({"error":"the provided column is not an numerical data"}), 400
            image_b64 = boxplot(uploaded_data, column,title)

        elif plot_function == 'histogram':
            if not column:
                return jsonify({'error': 'Column is required for histogram'}), 400
            if uploaded_data[column].dtype not in ["int64","float64"]:
                return jsonify({"error":"the provided column is not an numerical data"}), 400
            image_b64 = histogram(uploaded_data, column,title)
        
        elif plot_function == 'heatmap':
            image_b64 = heatmap(uploaded_data,title)

        elif plot_function == 'pairplot':
            image_b64 = pairplot(uploaded_data,title)

        
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
                if target_column and target_column != 'no':
                    if target_column not in uploaded_data.columns:
                        return jsonify({"error": f"Target column '{target_column}' not found in dataset"}), 400
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

if __name__ == "__main__":
    app.run(debug=True)