from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import google.generativeai as genai
import pandas as pd
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Dataset loading
data_dir = Path("data/datasets/")
try:
    keywords_df = pd.read_csv(data_dir / 'keywords.csv')
    merchants_df = pd.read_csv(data_dir / 'merchant.csv')
    transaction_data_df = pd.read_csv(data_dir / 'transaction_data.csv')
    transaction_items_df = pd.read_csv(data_dir / 'transaction_items.csv')
    items_df = pd.read_csv(data_dir / 'items.csv')

    merged_df = pd.merge(merchants_df, items_df, on='merchant_id', how='inner')
    merged_df = pd.merge(merged_df, transaction_items_df, on='item_id', how='inner')
    merged_df = pd.merge(merged_df, transaction_data_df, on='order_id', how='inner')

    merged_df.drop(columns=['Unnamed: 0'], errors='ignore', inplace=True)
    merged_df.drop(columns=[col for col in merged_df.columns if col.endswith('_drop')], inplace=True)

    merged_df['order_time'] = pd.to_datetime(merged_df['order_time'])
    merged_df['delivery_time'] = pd.to_datetime(merged_df['delivery_time'])
    merged_df['driver_arrival_time'] = pd.to_datetime(merged_df['driver_arrival_time'])
    merged_df['driver_pickup_time'] = pd.to_datetime(merged_df['driver_pickup_time'])
    merged_df['join_date'] = pd.to_datetime(merged_df['join_date'], format='%d%m%Y')

except Exception as e:
    print(f"Error loading datasets: {e}")


# --- Utility Functions ---

def get_merchant_data(merchant_id):
    result = merged_df[merged_df['merchant_id'] == merchant_id].copy()
    return result.reset_index(drop=True)

def get_top_selling_items(data, top_n=5):
    return (
        data.groupby(['item_id', 'item_name'])
        .size()
        .reset_index(name='num_sales')
        .sort_values(by='num_sales', ascending=False)
        .head(top_n)
    )

def get_least_selling_items(data, bottom_n=5):
    return (
        data.groupby(['item_id', 'item_name'])
        .size()
        .reset_index(name='num_sales')
        .sort_values(by='num_sales', ascending=True)
        .head(bottom_n)
    )

def get_popular_order_hours(data):
    data['order_hour'] = data['order_time'].dt.hour
    return data['order_hour'].value_counts().sort_values(ascending=False)

def get_popular_order_days(data):
    data['order_day'] = data['order_time'].dt.day_name()
    return data['order_day'].value_counts().sort_values(ascending=False)

def get_average_basket_size(data):
    return round(data[['order_id', 'item_id']].drop_duplicates().groupby('order_id').size().mean(), 2)

def get_average_order_value(data):
    return round(data['order_value'].mean(), 2)

def get_avg_delivery_time(data):
    return round(((data['delivery_time'] - data['order_time']).dt.total_seconds() / 60).mean(), 2)


# --- API Views ---

@api_view(['POST'])
def ask_gemini(request):
    user_query = request.data.get('query')
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


@api_view(['GET'])
def top_selling_items_view(request, merchant_id):
    data = get_merchant_data(merchant_id)
    result = get_top_selling_items(data).to_dict(orient='records')
    return Response(result)

@api_view(['GET'])
def least_selling_items_view(request, merchant_id):
    data = get_merchant_data(merchant_id)
    result = get_least_selling_items(data).to_dict(orient='records')
    return Response(result)

@api_view(['GET'])
def popular_hours_view(request, merchant_id):
    data = get_merchant_data(merchant_id)
    result = get_popular_order_hours(data).to_dict()
    return Response(result)

@api_view(['GET'])
def popular_days_view(request, merchant_id):
    data = get_merchant_data(merchant_id)
    result = get_popular_order_days(data).to_dict()
    return Response(result)

@api_view(['GET'])
def average_basket_size_view(request, merchant_id):
    data = get_merchant_data(merchant_id)
    return Response({'average_basket_size': get_average_basket_size(data)})

@api_view(['GET'])
def average_order_value_view(request, merchant_id):
    data = get_merchant_data(merchant_id)
    return Response({'average_order_value': get_average_order_value(data)})

@api_view(['GET'])
def average_delivery_time_view(request, merchant_id):
    data = get_merchant_data(merchant_id)
    return Response({'average_delivery_time': get_avg_delivery_time(data)})

