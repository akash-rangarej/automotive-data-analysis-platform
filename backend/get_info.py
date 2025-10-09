def get_nulls(df):
    if df is None:
        return {"error": "No data loaded"}
    null_counts = df.isnull().sum()
    # Convert to array of objects for consistency
    results = []
    for column, null_count in null_counts.items():
        results.append({
            'column': column,
            'null_count': int(null_count),
            'total_values': len(df)
        })
    return results

def get_outliers(df):
    if df is None:
        return {"error": "No data loaded"}
    
    numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns
    results = []
    
    for col in numerical_cols:
        series = df[col].dropna() 
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lf = q1 - 1.5 * iqr
        hf = q3 + 1.5 * iqr
        
        outliers_mask = (series < lf) | (series > hf)
        outliers_count = outliers_mask.sum()
        outlier_percentage = (outliers_count / len(series)) * 100
        
        results.append({
            'column': col,
            'outliers_count': int(outliers_count),
            'outlier_percentage': f"{round(outlier_percentage, 2)}%",
            'lower_fence': float(lf),
            'upper_fence': float(hf),
            'total_values': int(len(series))
        })
    
    return results

def get_value_counts(df):
    if df is None:
        return {"error": "No data loaded"}
    cols = df.select_dtypes(exclude=['int64', 'float64', 'datetime64[ns]', 'datetime64']).columns
    results = []
    for column in cols:
        value_counts = df[column].str.strip().value_counts().head(5).to_dict()
        results.append({
            'column': column,
            'value_counts': value_counts,
            'total_values': len(df[column].dropna())
        })
    
    return results