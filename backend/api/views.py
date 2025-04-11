from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import google.generativeai as genai
import pandas as pd

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

import os
from pathlib import Path
import pandas as pd

# Get the directory of the current script
current_dir = Path(__file__).parent

# Path to datasets (adjust based on your folder structure)
data_dir = current_dir / "data" / "datasets"

# Debug: Print paths to verify
print(f"Data directory: {data_dir}")
print(f"Files in directory: {os.listdir(data_dir)}")  # Check if files are listed

# Load CSV files
keywords_df = pd.read_csv(data_dir / 'keywords.csv')
merchants_df = pd.read_csv(data_dir / 'merchants.csv')
transaction_data_df = pd.read_csv(data_dir / 'transaction_data.csv')
transaction_items_df = pd.read_csv(data_dir / 'transaction_items.csv')
items_df = pd.read_csv(data_dir / 'items.csv')
@api_view(['POST'])
def ask_gemini(request):
    user_query = request.data.get('query')
    
    # Verify environment variables
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return Response({'error': 'API key missing'}, status=500)
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(user_query)
        return Response({'response': response.text})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    

def analyze(request):
    query = request.data.get('query')
    merchant_id = request.data.get('merchant_id')
    
    # Load merchant-specific data
    merged_df = pd.merge(
        transaction_items_df[transaction_items_df['merchant_id'] == merchant_id],
        items_df,
        on=['item_id', 'merchant_id']
    )
    merged_df = pd.merge(
        merged_df,
        transaction_data_df,
        on='order_id'
    )
    
    # Natural language processing
    analysis = {}
    if 'top' in query and ('item' in query or 'product' in query):
        analysis = handle_top_items(merged_df)
    elif 'trend' in query or 'sales over time' in query:
        analysis = handle_sales_trends(merged_df)
    elif 'delivery' in query and 'time' in query:
        analysis = handle_delivery_metrics(transaction_data_df)
    
    return Response(analysis)

def handle_top_items(df):
    top_items = df.groupby('item_name').size().nlargest(5)
    return {
        'insight': f"Your top selling items are: {', '.join(top_items.index.tolist())}",
        'chart_data': {
            'type': 'bar',
            'data': {
                'labels': top_items.index.tolist(),
                'datasets': [{
                    'label': 'Number of Sales',
                    'data': top_items.values.tolist(),
                    'backgroundColor': '#3B82F6'
                }]
            }
        },
        'raw_data': top_items.to_dict()
    }

def handle_sales_trends(df):
    df['order_date'] = pd.to_datetime(df['order_time']).dt.date
    trends = df.groupby('order_date')['order_value'].sum()
    return {
        'insight': 'Sales trends over the last 30 days:',
        'chart_data': {
            'type': 'line',
            'data': {
                'labels': trends.index.astype(str).tolist(),
                'datasets': [{
                    'label': 'Daily Sales',
                    'data': trends.values.tolist(),
                    'borderColor': '#10B981'
                }]
            }
        },
        'raw_data': trends.to_dict()
    }

def handle_delivery_metrics(df):
    df['delivery_time'] = (pd.to_datetime(df['delivery_time']) - 
                          pd.to_datetime(df['order_time'])).dt.total_seconds() / 60
    avg_time = df['delivery_time'].mean()
    return {
        'insight': f"Average delivery time: {avg_time:.1f} minutes",
        'chart_data': None,
        'raw_data': {'average_delivery_time': avg_time}
    }