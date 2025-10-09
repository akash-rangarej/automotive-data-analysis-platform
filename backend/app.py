from flask import Flask, jsonify, request,send_file
import pandas as pd
import json
from werkzeug.utils import secure_filename
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if pd.isna(obj):
            return None
        return super().default(obj)

# Store dataset globally
uploaded_data = None
fname = None
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
        
        df_filled = df.where(pd.notna(df), None)
        
        data_preview = {
            'columns': df.columns.tolist(),
            'first_few_rows': df_filled.head(10).to_dict('records'),
            'shape': [df.shape[0], df.shape[1]]
        }
        
        response_data = {
            'success': True,
            'data': df_filled.to_dict('records'),
            'message': message,
            'preview': data_preview,
            'shape': [df.shape[0], df.shape[1]],
            'columns': df.columns.tolist()
        }

        return app.response_class(
            response=json.dumps(response_data, cls=CustomJSONEncoder),
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        return jsonify({'success': False, 'data': None, 'message': f'Error reading file: {str(e)}'})

# Get info section
@app.route("/get_nulls", methods=['GET'])
def nulls_analysis():
    from get_info import get_nulls
    no_of_nulls = get_nulls(uploaded_data)
    return jsonify({'data': no_of_nulls})

@app.route("/get_outliers", methods=['GET'])
def get_outliers_analysis():
    from get_info import get_outliers
    outliers_info = get_outliers(uploaded_data)
    return jsonify({'data': outliers_info})

@app.route("/get_value_counts", methods=['GET'])
def get_value_counts_analysis():
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
            image_b64 = piechart(uploaded_data, column,title)

        elif plot_function == 'boxplot':
            if not column:
                return jsonify({'error': 'Column is required for box plot'}), 400
            image_b64 = boxplot(uploaded_data, column,title)

        elif plot_function == 'histogram':
            if not column:
                return jsonify({'error': 'Column is required for histogram'}), 400
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



from processed import get_fully_processed_data, handle_missing_values, scale_features, encode_categorical, remove_outliers, normalize_features, dataframe_to_csv

@app.route("/get_processed_data", methods=['POST','GET'])
def get_processed_data():
    try:
        global uploaded_data
        
        if uploaded_data is None:
            return "No data uploaded", 400
        
        data = request.get_json()
        processing_type = data.get('processing_type')
        model_type = data.get('model_type')
        
        if processing_type == 'full_pipeline':
            # Full preprocessing pipeline for specific model type
            if not model_type:
                return "Model type is required for full preprocessing", 400
            
            processed_df = get_fully_processed_data(uploaded_data, model_type)
            
        else:
            # Individual processing step
            processed_df = uploaded_data.copy()
            
            if processing_type == 'handle_missing_values':
                processed_df = handle_missing_values(processed_df)
            elif processing_type == 'scale_features':
                processed_df = scale_features(processed_df)
            elif processing_type == 'encode_categorical':
                processed_df = encode_categorical(processed_df)
            elif processing_type == 'remove_outliers':
                processed_df = remove_outliers(processed_df)
            elif processing_type == 'normalize_features':
                processed_df = normalize_features(processed_df)
            else:
                return "Invalid processing type", 400
        
        # Convert to CSV and send as file
        csv_data = dataframe_to_csv(processed_df)
        
        return send_file(
            io.BytesIO(csv_data.encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'processed_{fname.split('.')[0]}.csv'
        )
        
    except Exception as e:
        return f"Error processing data: {str(e)}", 500

if __name__ == "__main__":
    app.run(debug=True)