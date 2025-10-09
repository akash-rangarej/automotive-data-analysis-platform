import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from scipy import stats
import io

def handle_missing_values(data):
    df = data.copy()
    
    # Fill numerical columns
    num_cols = df.select_dtypes(include=[np.number]).columns
    df[num_cols] = df[num_cols].fillna(df[num_cols].median())
    
    # Fill categorical columns with mode
    cat_cols = df.select_dtypes(exclude=[np.number]).columns
    for col in cat_cols:
        if df[col].isna().any():
            mode_value = df[col].mode()
            if len(mode_value) > 0:
                df[col] = df[col].fillna(mode_value[0])
            else:
                if df[col].dtype == 'object':
                    df[col] = df[col].fillna('Unknown')
    return df

def scale_features(df, scaler_type='standard'):
    df_scaled = df.copy()
    numerical_cols = df_scaled.select_dtypes(include=[np.number]).columns
    
    if scaler_type == 'standard':
        scaler = StandardScaler()
    elif scaler_type == 'minmax':
        scaler = MinMaxScaler()
    else:
        return df_scaled
    
    df_scaled[numerical_cols] = scaler.fit_transform(df_scaled[numerical_cols])
    return df_scaled


def encode_categorical(df, encoding_type='onehot'):
    df_encoded = df.copy()
    categorical_cols = df_encoded.select_dtypes(exclude=[np.number,'datetime64[ns]','timedelta64[ns]']).columns
    
    if encoding_type == 'onehot':
        # One-hot encoding for categorical variables
        df_encoded = pd.get_dummies(df_encoded, columns=categorical_cols, drop_first=True)
    elif encoding_type == 'label':
        # Label encoding for categorical variables
        le = LabelEncoder()
        for col in categorical_cols:
            df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
    
    return df_encoded


def remove_outliers(df, method='IQR'):
    df_clean = df.copy()
    numerical_cols = df_clean.select_dtypes(include=[np.number]).columns
    
    if method == 'IQR':
        for col in numerical_cols:
            Q1 = df_clean[col].quantile(0.25)
            Q3 = df_clean[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Remove outliers
            df_clean = df_clean[(df_clean[col] >= lower_bound) & (df_clean[col] <= upper_bound)]
    
    elif method == 'zscore':
        # Remove outliers using z-score (beyond 3 standard deviations)
        z_scores = np.abs(stats.zscore(df_clean[numerical_cols]))
        df_clean = df_clean[(z_scores < 3).all(axis=1)]
    
    return df_clean


def normalize_features(df):
    df_normalized = df.copy()
    numerical_cols = df_normalized.select_dtypes(include=[np.number]).columns
    
    # Min-Max normalization (0-1 range)
    for col in numerical_cols:
        min_val = df_normalized[col].min()
        max_val = df_normalized[col].max()
        if max_val > min_val:  # Avoid division by zero
            df_normalized[col] = (df_normalized[col] - min_val) / (max_val - min_val)
    
    return df_normalized


# Pre-defined pipelines for different model types
PREPROCESSING_PIPELINES = {
    'linear_models': [
        ('handle_missing', {'strategy': 'median'}),
        ('remove_outliers', {'method': 'IQR'}),
        ('encode_categorical', {'encoding_type': 'onehot'}),
        ('scale_features', {'scaler_type': 'standard'})
    ],
    'tree_models': [
        ('handle_missing', {'strategy': 'median'}),
        ('encode_categorical', {'encoding_type': 'label'})
        # No scaling typically needed for trees
    ],
    'distance_based_models': [
        ('handle_missing', {'strategy': 'median'}),
        ('encode_categorical', {'encoding_type': 'onehot'}),
        ('normalize_features', {}),
        ('remove_outliers', {'method': 'IQR'})
    ],
    'clustering_models': [
        ('handle_missing', {'strategy': 'median'}),
        ('encode_categorical', {'encoding_type': 'onehot'}),
        ('scale_features', {'scaler_type': 'standard'}),
        ('remove_outliers', {'method': 'IQR'})
    ],
    'naive_bayes': [
        ('handle_missing', {'strategy': 'median'}),
        ('encode_categorical', {'encoding_type': 'onehot'}),
        ('normalize_features', {})
    ],
    'neural_network': [
        ('handle_missing', {'strategy': 'median'}),
        ('encode_categorical', {'encoding_type': 'onehot'}),
        ('normalize_features', {}),
        ('remove_outliers', {'method': 'IQR'})
    ]
}

# Map function names to actual functions
FUNCTION_MAP = {
    'handle_missing': handle_missing_values,
    'scale_features': scale_features,
    'encode_categorical': encode_categorical,
    'remove_outliers': remove_outliers,
    'normalize_features': normalize_features
}

# Main function for full preprocessing pipeline
def get_fully_processed_data(df, model_type):
    if model_type not in PREPROCESSING_PIPELINES:
        return df
    
    pipeline_steps = PREPROCESSING_PIPELINES.get(model_type, [])
    processed_df = df.copy()
    
    for step_name, params in pipeline_steps:
        processing_function = FUNCTION_MAP.get(step_name)
        if processing_function:
            processed_df = processing_function(processed_df, **params)
    
    return processed_df

# Function to convert DataFrame to CSV string for download
def dataframe_to_csv(df):
    output = io.StringIO()
    df.to_csv(output, index=False)
    return output.getvalue()