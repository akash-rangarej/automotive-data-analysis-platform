import base64
from io import BytesIO
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib
matplotlib.use('Agg')

def plot_to_base64(plt):
    """Convert matplotlib plot to base64 string."""
    buffer = BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    buffer.close()
    plt.close()  # Free memory
    return image_base64

def lineplot(df, x, y,title):
    plt.figure(figsize=(10, 6))
    sns.lineplot(data=df, x=x, y=y)
    plt.title(title)
    plt.xticks(rotation=45)
    plt.tight_layout()
    return plot_to_base64(plt)

def barplot(df, x, y,title):
    plt.figure(figsize=(10, 6))
    sns.barplot(data=df, x=x, y=y)
    plt.title(title)
    plt.xticks(rotation=45)
    plt.tight_layout()
    return plot_to_base64(plt)

def scatterplot(df, x, y,title):
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df, x=x, y=y)
    plt.title(title)
    plt.tight_layout()
    return plot_to_base64(plt)

def piechart(df, column,title):
    plt.figure(figsize=(8, 8))
    df[column].value_counts().plot.pie(autopct='%1.1f%%')
    plt.title(title)
    plt.ylabel('')  # Remove y-label
    plt.tight_layout()
    return plot_to_base64(plt)

def heatmap(df,title):
    plt.figure(figsize=(12, 8))
    numeric_df = df.select_dtypes(include=['number'])
    if numeric_df.shape[1] > 1:  # Only plot if we have at least 2 numeric columns
        sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt='.2f')
        plt.title(title)
    else:
        plt.text(0.5, 0.5, 'Not enough numeric columns for heatmap', 
                ha='center', va='center', transform=plt.gca().transAxes)
        plt.title("Heatmap Not Available")
    plt.tight_layout()
    return plot_to_base64(plt)

def boxplot(df, column, title):
    try:
        if pd.api.types.is_numeric_dtype(df[column]):
            plt.figure(figsize=(10, 6))
            sns.boxplot(data=df, y=column)
            plt.title(title)
            plt.tight_layout()
            return plot_to_base64(plt)
        return "Error: Please select a numerical column for boxplot visualization"
    except KeyError:
        return "Error: Selected column does not exist in the dataset"

def histogram(df, column, title):
    try:
        if pd.api.types.is_numeric_dtype(df[column]):
            plt.figure(figsize=(10, 6))
            sns.histplot(data=df, x=column, kde=True)
            plt.title(title)
            plt.tight_layout()
            return plot_to_base64(plt)
        return "Error: Please select a numerical column for histogram visualization"
    except KeyError:
        return "Error: Selected column does not exist in the dataset"
    

def pairplot(df, title):
    try:
        numeric_df = df.select_dtypes(include=['number'])
        if numeric_df.shape[1] > 1:
            # sns.pairplot returns a PairGrid object
            pair_grid = sns.pairplot(numeric_df,kind='kde')
            pair_grid.figure.suptitle(title, y=1.02)
            
            # Convert the PairGrid figure to base64
            buffer = BytesIO()
            pair_grid.figure.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            buffer.close()
            plt.close(pair_grid.figure)  # Free memory
            return image_base64
        return "Error: Need at least 2 numerical columns for pairplot visualization"
    except Exception as e:
        return f"Error: Unable to create pairplot - {str(e)}"