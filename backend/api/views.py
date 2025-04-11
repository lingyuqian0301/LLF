from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import google.generativeai as genai
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

# Path configuration
from pathlib import Path

# Convert to Path object
data_dir = Path("data/datasets/")

# print current working directory
print(os.getcwd())

# Load datasets with error handling
try:
    keywords_df = pd.read_csv(data_dir / 'keywords.csv')
    merchants_df = pd.read_csv(data_dir / 'merchant.csv')
    transaction_data_df = pd.read_csv(data_dir / 'transaction_data.csv')
    transaction_items_df = pd.read_csv(data_dir / 'transaction_items.csv')
    items_df = pd.read_csv(data_dir / 'items.csv')
except FileNotFoundError as e:
    print(f"File not found: {e}")
except Exception as e:
    print(f"Error loading datasets: {e}")


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

def get_merchant_data(merchant_id):
    # Merge with a custom suffix for right-side duplicates.
    merged_df = pd.merge(merchants_df, items_df, on='merchant_id', how='inner', suffixes=('', '_drop'))
    merged_df = pd.merge(merged_df, transaction_items_df, on='item_id', how='inner', suffixes=('', '_drop'))
    merged_df = pd.merge(merged_df, transaction_data_df, left_on='order_id', right_on='order_id', how='inner', suffixes=('', '_drop'))

    #  drop column ' Unnamed: 0  '
    merged_df.drop(columns=['Unnamed: 0'], inplace=True)

    # Now drop any columns ending with '_drop'
    cols_to_drop = [col for col in merged_df.columns if col.endswith('_drop')]
    merged_df.drop(columns=cols_to_drop, inplace=True)
    
    # Parse datetime just once here
    merged_df['order_time'] = pd.to_datetime(merged_df['order_time'])
    merged_df['delivery_time'] = pd.to_datetime(merged_df['delivery_time'])
    merged_df['driver_arrival_time'] = pd.to_datetime(merged_df['driver_arrival_time'])
    merged_df['driver_pickup_time'] = pd.to_datetime(merged_df['driver_pickup_time'])
    merged_df['join_date'] = pd.to_datetime(merged_df['join_date'], format='%d%m%Y')

    return merged_df

def get_top_selling_items(data, top_n=5):
    # Group by item_id and item_name, count sales
    top_items = (
        data.groupby(['item_id', 'item_name'])
        .size()
        .reset_index(name='num_sales')
        .sort_values(by='num_sales', ascending=False)
        .head(top_n)
    )
    return top_items

def get_least_selling_items(data, bottom_n=5):
    # Group by item_id and item_name, count sales
    bottom_items = (
        data.groupby(['item_id', 'item_name'])
        .size()
        .reset_index(name='num_sales')
        .sort_values(by='num_sales', ascending=True)
        .head(bottom_n)
    )
    return bottom_items

def get_popular_order_hours(data):
    df = data.copy()
    df['order_time'] = pd.to_datetime(df['order_time'])
    df['order_hour'] = df['order_time'].dt.hour
    return df['order_hour'].value_counts().sort_values(ascending=False)

def get_popular_order_days(data):
    df = data.copy()
    df['order_time'] = pd.to_datetime(df['order_time'])
    df['order_day'] = df['order_time'].dt.day_name()
    return df['order_day'].value_counts().sort_values(ascending=False)

def get_average_basket_size(data):
    df = data[['order_id', 'item_id']].drop_duplicates()
    avg_basket = df.groupby('order_id').size().mean()
    return round(avg_basket, 2)

def get_average_order_value(data):
    return round(data['order_value'].mean(), 2)

def get_avg_delivery_time(data):
    df = data.copy()
    df['order_time'] = pd.to_datetime(df['order_time'])
    df['delivery_time'] = pd.to_datetime(df['delivery_time'])
    df['delivery_duration_min'] = (df['delivery_time'] - df['order_time']).dt.total_seconds() / 60
    return round(df['delivery_duration_min'].mean(), 2)

# Example usage
preset_merchant_id = "b7a3e"
print("checkpoint1")
data = get_merchant_data(preset_merchant_id)
print("checkpoint2")
print(data.head())
top_items_df = get_top_selling_items(data)
print("\nTop 5 Selling Items (DataFrame):")
print(top_items_df)
print("\nPopular Order Hours:")
print(get_popular_order_hours(data))

print("\nPopular Order Days:")
print(get_popular_order_days(data))

print(f"\nAverage Basket Size: {get_average_basket_size(data)} items/order")
print(f"Average Order Value: RM {get_average_order_value(data)}")
print(f"Average Delivery Time: {get_avg_delivery_time(data)} minutes")
