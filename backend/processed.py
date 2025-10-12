import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, RobustScaler,OneHotEncoder,OrdinalEncoder
from sklearn.pipeline import FunctionTransformer,Pipeline
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



def scale_features(df, method='auto', handle_outliers=True):
    """
    Scale numerical features with intelligent outlier handling.
    
    Parameters:
    - df: DataFrame to scale
    - method: 'auto', 'standard', 'minmax', or 'robust'
    - handle_outliers: Whether to detect and handle outliers in scaling choice
    """
    df_scaled = df.copy()
    numerical_cols = df_scaled.select_dtypes(include=[np.number]).columns
    
    # If no numerical columns, return original dataframe
    if len(numerical_cols) == 0:
        return df_scaled
    
    if method == 'auto' and handle_outliers:
        # Scale each column based on its outlier characteristics
        for col in numerical_cols:
            if has_outliers(df_scaled[col]):
                # Use RobustScaler for columns with outliers
                scaler = RobustScaler()
            else:
                # Use MinMaxScaler for well-behaved columns
                scaler = MinMaxScaler()
            
            df_scaled[col] = scaler.fit_transform(df_scaled[[col]]).flatten()
    
    elif method == 'standard':
        scaler = StandardScaler()
        df_scaled[numerical_cols] = scaler.fit_transform(df_scaled[numerical_cols])
    
    elif method == 'minmax':
        scaler = MinMaxScaler()
        df_scaled[numerical_cols] = scaler.fit_transform(df_scaled[numerical_cols])
    
    elif method == 'robust':
        scaler = RobustScaler()
        df_scaled[numerical_cols] = scaler.fit_transform(df_scaled[numerical_cols])
    
    return df_scaled

def has_outliers(series):
    """Check if a series has outliers using IQR method"""
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    return ((series < lower_bound) | (series > upper_bound)).any()


def encode_categorical(df, target_column):
    df_encoded = df.copy()
    
    # Initialize encoders
    ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    ordinal = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
    le = LabelEncoder()

    if target_column != 'no' and target_column in df_encoded.columns:
        if df_encoded[target_column].dtype == 'object':
            df_encoded[target_column] = le.fit_transform(df_encoded[target_column])

    categorical_cols = df_encoded.select_dtypes(include=['object', 'category']).columns
    
    if target_column != 'no' and target_column in categorical_cols:
        categorical_cols = categorical_cols.drop(target_column)
    
    ohe_categorical_cols = []
    ordinal_categorical_cols = []

    for col in categorical_cols:
        if len(df_encoded[col].value_counts()) <= 10:
            ohe_categorical_cols.append(col)
        else:
            ordinal_categorical_cols.append(col)

    # Apply OneHotEncoding
    if ohe_categorical_cols:
        try:
            ohe_encoded = ohe.fit_transform(df_encoded[ohe_categorical_cols])
            ohe_df = pd.DataFrame(
                ohe_encoded, 
                columns=ohe.get_feature_names_out(ohe_categorical_cols),
                index=df_encoded.index
            )
            # Drop original columns and concatenate encoded ones
            df_encoded = df_encoded.drop(ohe_categorical_cols, axis=1)
            df_encoded = pd.concat([df_encoded, ohe_df], axis=1)
        except Exception as e:
            raise Exception(f"Error in one-hot encoding: {str(e)}")

    # Apply OrdinalEncoding
    if ordinal_categorical_cols:
        try:
            df_encoded[ordinal_categorical_cols] = ordinal.fit_transform(
                df_encoded[ordinal_categorical_cols]
            )
        except Exception as e:
            raise Exception(f"Error in ordinal encoding: {str(e)}")

    return df_encoded


def remove_outliers(df):
    df_clean = df.copy()
    numerical_cols = df_clean.select_dtypes(include=[np.number]).columns
    
    for col in numerical_cols:
        Q1 = df_clean[col].quantile(0.25)
        Q3 = df_clean[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outlier_mask = (df_clean[col] < lower_bound) | (df_clean[col] > upper_bound)
        df_clean.loc[outlier_mask, col] = df_clean[col].median()
    
    return df_clean






# Main function for full preprocessing pipeline
def get_fully_processed_data(df, model_type,target_column):
    model_types = ['linear_models','tree_models','distance_based_models','clustering_models','neural_network','naive_bayes']
    common_processing_model_types = ['linear_models','distance_based_models','clustering_models','neural_network']
    pipeline = None
    if model_type not in model_types:
        return df
    processed_df = df.copy()
    missing_transformer = FunctionTransformer(handle_missing_values)
    outliers_transformer = FunctionTransformer(remove_outliers)
    scale_transformer = FunctionTransformer(scale_features)

    # For encode_categorical, we need to handle the target_column parameter
    def encode_with_target(X, target_column):
        return encode_categorical(X, target_column)

    encode_transformer = FunctionTransformer(encode_with_target, kw_args={'target_column': target_column})

    common_pipeline = Pipeline([
    ('missing_value', missing_transformer),
    ('outliers', outliers_transformer),
    ('scale', scale_transformer),
    ('encode', encode_transformer)
    ])

    tree_pipeline = Pipeline([
    ('missing_value', missing_transformer),
    ('encode', encode_transformer)
    ])

    nb_pipeline = Pipeline([
    ('missing_value', missing_transformer),
    ('encode', encode_transformer),
    ('scale', scale_transformer)
    ])


    if model_type in common_processing_model_types:
        pipeline = common_pipeline
    elif model_type == 'naive_bayes':
        pipeline = nb_pipeline
    else: 
        pipeline = tree_pipeline

    # Apply the pipeline
    processed_df = pipeline.fit_transform(processed_df)
    
    
    return processed_df

# Function to convert DataFrame to CSV string for download
def dataframe_to_csv(df):
    output = io.StringIO()
    df.to_csv(output, index=False)
    return output.getvalue()