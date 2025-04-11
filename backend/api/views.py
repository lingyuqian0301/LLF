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
    

preset_merchant_id="b7a3e"
def get_merchant_data(merchant_id):
    # retrieve all related data for the given merchant_id
    data_selected = items_df[items_df['merchant_id'] == merchant_id]
    # merge with transaction_data_df and transaction_items_df
    data_selected = data_selected.merge(transaction_data_df, on='merchant_id', how='left')
    data_selected = data_selected.merge(transaction_items_df, on='merchant_id', how='left')
    data_selected = data_selected.merge(merchants_df, on='merchant_id', how='left')
    print("checkpoint2")
    return data_selected


print("checkpoint1")
data = get_merchant_data(preset_merchant_id)
print("checkpoint3")
print(data.head())