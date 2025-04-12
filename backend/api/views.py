import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import google.generativeai as genai
import pandas as pd
from dotenv import load_dotenv
from pathlib import Path
import re
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Configuration
load_dotenv()

model = None


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

    # keywords sort by checkout, descending
    keywords_df.sort_values(by='checkout', ascending=False, inplace=True)

except Exception as e:
    print(f"Error loading datasets: {e}")


# --- Utility Functions ---


def get_merchant_data(merchant_id):
    try:
        # Filter each dataframe first before merging
        merchant_data = merchants_df[merchants_df['merchant_id'] == merchant_id].copy()
        if merchant_data.empty:
            return pd.DataFrame()
            
        merchant_items = items_df[items_df['merchant_id'] == merchant_id].copy()
        if merchant_items.empty:
            return pd.DataFrame()
            
        # Merge with transaction items
        merchant_trans = pd.merge(
            transaction_items_df,
            merchant_items,
            on='item_id',
            how='inner'
        )
        
        # Merge with transaction data
        result = pd.merge(
            merchant_trans,
            transaction_data_df,
            on='order_id',
            how='inner'
        )
        
        # Merge with merchant data
        result = pd.merge(
            result,
            merchant_data,
            on='merchant_id',
            how='left'
        )
        
        # Process datetime columns
        datetime_cols = ['order_time', 'delivery_time', 'driver_arrival_time', 'driver_pickup_time']
        for col in datetime_cols:
            if col in result.columns:
                result[col] = pd.to_datetime(result[col])
        
        if 'join_date' in result.columns:
            result['join_date'] = pd.to_datetime(result['join_date'], format='%d%m%Y')
        
        return result.reset_index(drop=True)
        
    except Exception as e:
        print(f"Error getting merchant data: {e}")
        return pd.DataFrame()
    


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

def get_total_revenue(data):
    return round(data['item_price'].sum(), 2)


# --- API Views ---
# Store chat sessions in memory (for demo/testing only)
chat_sessions = {}

@api_view(['POST'])
def ask_gemini(request):
    user_query = request.data.get('query')
    merchant_id = request.data.get('merchant_id')
    lang = request.data.get('lang', 'en')  # Support 'en' or 'ms'
    api_key = os.getenv('GEMINI_API_KEY')

    if not api_key:
        return Response({'error': 'API key missing'}, status=500)
    if not user_query or not merchant_id:
        return Response({'error': 'Missing query or merchant_id'}, status=400)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        if merchant_id not in chat_sessions:
            chat_sessions[merchant_id] = model.start_chat()
        chat = chat_sessions[merchant_id]

        # Get merchant-specific data
        data = get_merchant_data(merchant_id)
        if data.empty:
            return Response({'error': 'No data found for this merchant'}, status=404)

        # Key insights
        top_items_df = get_top_selling_items(data, top_n=5)
        least_items_df = get_least_selling_items(data, bottom_n=5)
        basket_size = get_average_basket_size(data)
        avg_order_value = get_average_order_value(data)
        avg_delivery_time = get_avg_delivery_time(data)
        popular_hours = get_popular_order_hours(data).head(5).to_dict()
        popular_days = get_popular_order_days(data).head(5).to_dict()
        tot_revenue = get_total_revenue(data)

        def format_items(df):
            return ', '.join([f"{row['item_name']} ({row['num_sales']} sales)" for _, row in df.iterrows()])

        stats_context = (
            f"Merchant ID: {merchant_id}. "
            f"Top items: {format_items(top_items_df)}. "
            f"Underperforming items: {format_items(least_items_df)}. "
            f"Basket size: {basket_size} items. "
            f"Order value: RM {avg_order_value}. "
            f"Delivery time: {avg_delivery_time} mins. "
            f"Popular hours: {', '.join(f'{hour}:00 ({count} orders)' for hour, count in popular_hours.items())}. "
            f"Popular days: {', '.join(f'{day} ({count} orders)' for day, count in popular_days.items())}."
            f"Total revenue: RM {tot_revenue}."
        )

        system_instruction = {
            "en": (
                "You are a helpful business assistant for Grab merchants. "
                "Use clear and simple language with no markdown formatting. "
                "Answer in a friendly and human-like tone, explaining business insights and recommendations based on the data. "
                "Keep responses short and actionable. No bullet points or special characters. Just plain text."
            ),
            "ms": (
                "Anda ialah pembantu perniagaan untuk peniaga Grab. "
                "Gunakan bahasa mudah tanpa sebarang format khas. "
                "Jawab dengan mesra dan jelas, beri cadangan atau penjelasan berdasarkan data. "
                "Pastikan ayat pendek dan mudah difahami. Jangan gunakan tanda bintang atau markdown."
            )
        }

        # Construct final prompt
        prompt = (
            f"{system_instruction.get(lang, system_instruction['en'])}\n\n"
            f"Merchant stats: {stats_context}\n"
            f"Merchant question: {user_query}"
        )

        # Send message and return plain response
        response = chat.send_message(prompt)

        return Response({
            'response': response.text,
            'chat_history': [
                {"role": msg.role, "text": msg.parts[0].text}
                for msg in chat.history
            ]
        })

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

@api_view(['GET'])
def total_revenue_view(request, merchant_id):
    try:
        data = get_merchant_data(merchant_id)
        if data.empty:
            return Response({'error': 'No data found for this merchant'}, status=404)

        total_revenue = get_total_revenue(data)
        return Response({
            'merchant_id': merchant_id,
            'total_revenue': total_revenue
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def merchant_recommendations(request, merchant_id):
    try:
        data = get_merchant_data(merchant_id)
        if data.empty:
            return Response({'error': 'No data found for this merchant'}, status=404)

        # Metrics
        top_items = get_top_selling_items(data, top_n=5)
        least_items = get_least_selling_items(data, bottom_n=5)
        basket_size = get_average_basket_size(data)
        avg_order_value = get_average_order_value(data)
        avg_delivery_time = get_avg_delivery_time(data)
        popular_hours = get_popular_order_hours(data).head(5)
        popular_days = get_popular_order_days(data).head(5)

        # Merchant profile
        merchant_info = merchants_df[merchants_df['merchant_id'] == merchant_id].iloc[0].to_dict()
        merchant_name = merchant_info.get('merchant_name', 'Unknown')
        cuisine = merchant_info.get('cuisine_type', 'Unknown')
        total_orders = len(data['order_id'].unique())

        # Format for Gemini
        summary = (
            f"Merchant Name: {merchant_name}\n"
            f"Cuisine: {cuisine}\n"
            f"Total Orders: {total_orders}\n"
            f"Top Selling Items: {[row['item_name'] for _, row in top_items.iterrows()]}\n"
            f"Underperforming Items: {[row['item_name'] for _, row in least_items.iterrows()]}\n"
            f"Average Basket Size: {basket_size} items\n"
            f"Average Order Value: RM{avg_order_value}\n"
            f"Average Delivery Time: {avg_delivery_time} minutes\n"
            f"Peak Order Hours: {[f'{k}:00' for k in popular_hours.index.tolist()]}\n"
            f"Peak Days: {[day for day in popular_days.index.tolist()]}\n"
        )

        # Improved Prompt for More Actionable Insights
        prompt = f"""
        You are a Grab Business Consultant AI that gives personalized, real-world business recommendations to food & beverage merchant-partners.
        
        Based on the performance data below, generate 3 to 5 actionable recommendations in this format:

        [
            {{
                "title": "Short recommendation title",
                "rationale": "Explain why this is important using the data insights.",
                "action_steps": [
                    "Step 1",
                    "Step 2",
                    ...
                ],
                "expected_impact": "What business outcome this could improve"
            }},
            ...
        ]

        Be practical and business-relevant — examples include bundling popular items, reducing delivery times, off-peak promotions, optimizing staffing, or retiring underperforming items.

        --- MERCHANT PERFORMANCE DATA ---
        {summary}
        """

        # Gemini call
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)

        try:
            recommendations = json.loads(response.text)
        except:
            recommendations = response.text

        return Response({
            'merchant_id': merchant_id,
            'merchant_name': merchant_name,
            'metrics': {
                'average_basket_size': basket_size,
                'average_order_value': avg_order_value,
                'average_delivery_time': avg_delivery_time,
                'top_items': top_items.to_dict('records'),
                'underperforming_items': least_items.to_dict('records'),
                'peak_hours': popular_hours.to_dict(),
                'peak_days': popular_days.to_dict()
            },
            'recommendations': recommendations
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# Cuisine keyword mapping
cuisine_keywords = {
    'Burgers': {'burger', 'patty', 'cheeseburger', 'angus', 'beef', 'grill', 'whopper', 'slider', 'bun', 'double'},
    'American': {'wings', 'fries', 'bbq', 'sandwich', 'hot dog', 'bacon', 'cheddar', 'mac n cheese', 'corn dog', 'chili', 'biscuits', 'gravy'},
    'Mexican': {'taco', 'burrito', 'quesadilla', 'guacamole', 'guac', 'salsa', 'nachos', 'enchilada', 'fajita', 'tortilla', 'pozole', 'tamale'},
    'Indian': {'curry', 'naan', 'tikka', 'masala', 'biryani', 'samosa', 'lentil', 'paneer', 'dal', 'vindaloo', 'dosa', 'chutney', 'roti'},
    'Italian': {'pizza', 'pasta', 'risotto', 'bruschetta', 'parmesan', 'mozzarella', 'lasagna', 'spaghetti', 'fettuccine', 'gnocchi', 'carbonara', 'marinara', 'calzone'},
    'Seafood': {'fish', 'shrimp', 'salmon', 'tuna', 'crab', 'lobster', 'oyster', 'clam', 'mussels', 'scallop', 'lobster roll', 'calamari'},
    'Chinese': {'wok', 'stir-fry', 'dim sum', 'pho', 'sushi', 'noodle', 'dumpling', 'ramen', 'spring roll', 'egg roll', 'fried rice', 'chow mein', 'lo mein', 'hot pot', 'bao', 'char siu', 'mapo tofu'},
    'Japanese': {'sushi', 'ramen', 'tempura', 'teriyaki', 'miso', 'udon', 'sashimi', 'sake'},
    'Korean': {'kimchi', 'bulgogi', 'bibimbap', 'galbi', 'gochujang'},
    'Thai': {'pad thai', 'tom yum', 'green curry', 'red curry', 'lemongrass', 'coconut milk', 'massaman'},
    'Vietnamese': {'pho', 'banh mi', 'spring roll', 'vermicelli', 'nuoc cham'},
    'Greek': {'gyro', 'feta', 'tzatziki', 'pita', 'dolma', 'spanakopita', 'moussaka', 'souvlaki', 'baklava', 'olives'},
    'Middle Eastern': {'hummus', 'shawarma', 'falafel', 'tabouli', 'tahini', 'pita', 'kebab', 'kebap'},
    'French': {'croissant', 'baguette', 'crepe', 'foie gras', 'escargot', 'ratatouille', 'brie', 'camembert', 'quiche', 'coq au vin', 'bouillabaisse', 'macaron', 'eclair', 'souffle'},
    'German': {'sauerkraut', 'bratwurst', 'pretzel', 'schnitzel', 'spaetzle', 'strudel', 'currywurst'},
    'Spanish': {'paella', 'tapas', 'churros', 'jamon', 'gazpacho', 'tortilla espanola', 'patatas bravas'},
    'Caribbean': {'jerk', 'plantain', 'cassava', 'ackee', 'saltfish', 'curry goat', 'callaloo'},
    'Moroccan': {'tagine', 'couscous', 'harissa', 'ras el hanout', 'bastilla'},
    'Turkish': {'kebab', 'doner', 'baklava', 'dolma', 'lokum'}
}

try:
    # --- Data Loading ---
    keywords_df = pd.read_csv(data_dir / 'keywords.csv')
    merchants_df = pd.read_csv(data_dir / 'merchant.csv')
    items_df = pd.read_csv(data_dir / 'items.csv')
    
    # Clean data
    keywords_df = keywords_df.dropna(subset=['keyword'])
    items_df = items_df.dropna(subset=['item_name', 'cuisine_tag'])
    
    # Initialize model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Precompute keyword embeddings
    keywords_df['embedding'] = list(model.encode(keywords_df['keyword'].tolist()))
    
except Exception as e:
    print(f"Initialization error: {e}")
    raise

def calculate_business_score(row):
    """Normalize business metrics"""
    max_checkout = keywords_df['checkout'].max()
    max_order = keywords_df['order'].max()
    return (0.4 * (row['checkout'] / max_checkout) + 0.6 * (row['order'] / max_order))

def get_cuisine_relevance(keyword, cuisine):
    """Check if keyword contains cuisine-specific terms"""
    if cuisine not in cuisine_keywords:
        return 0
    return 1 if any(term in keyword.lower() for term in cuisine_keywords[cuisine]) else 0

@api_view(['GET'])
def enhanced_keyword_recommendations_view(request, merchant_id):
    """Improved SEO recommendations with cuisine awareness"""
    try:
        # Get merchant items
        merchant_items = items_df[items_df['merchant_id'] == merchant_id]
        if merchant_items.empty:
            return Response({'error': 'Merchant not found'}, status=404)

        results = {}
        
        for _, item in merchant_items.iterrows():
            item_name = item['item_name']
            cuisine = item['cuisine_tag']
            
            # Generate item embedding
            item_embedding = model.encode([item_name])[0]
            
            # Calculate similarities
            keyword_embeddings = np.array(keywords_df['embedding'].tolist())
            semantic_scores = cosine_similarity([item_embedding], keyword_embeddings)[0]
            
            # Calculate business scores
            business_scores = keywords_df.apply(calculate_business_score, axis=1)
            
            # Calculate cuisine relevance
            cuisine_scores = keywords_df['keyword'].apply(
                lambda x: get_cuisine_relevance(x, cuisine)
            )
            
            # Combine scores
            combined_scores = (
                0.5 * semantic_scores +
                0.3 * business_scores +
                0.2 * cuisine_scores
            )
            
            # Get top results
            result_df = keywords_df.copy()
            result_df['score'] = combined_scores
            result_df = result_df[result_df['score'] > 0.4].sort_values(
                by=['score', 'checkout', 'order'], 
                ascending=[False, False, False]
            ).head(5)
            
            if not result_df.empty:
                results[item_name] = result_df[
                    ['keyword', 'score', 'checkout', 'order']
                ].to_dict(orient='records')

        return Response({
            'merchant_id': merchant_id,
            'recommendations': results
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def merchant_alerts_v2(request, merchant_id):
    try:
        # Load merchant-specific data
        df = get_merchant_data(merchant_id)
        if df.empty:
            return Response({'error': 'No data found for this merchant'}, status=404)

        df['order_time'] = pd.to_datetime(df['order_time'])
        latest_date = df['order_time'].max().normalize()
        latest_data = df[df['order_time'].dt.normalize() == latest_date]

        if latest_data.empty:
            return Response({'error': 'No data available for the latest date'}, status=404)

        # --- Revenue Summary ---
        total_orders = latest_data['order_id'].nunique()
        total_revenue = latest_data['order_value'].sum()

        # --- Inventory Alerts ---
        item_sales = (
            latest_data.groupby('item_name')['order_id']
            .nunique()
            .reset_index(name='sales_count')
        )
        low_selling = item_sales[item_sales['sales_count'] <= 2]['item_name'].tolist()
        high_selling = item_sales[
            item_sales['sales_count'] > item_sales['sales_count'].mean() + item_sales['sales_count'].std()
        ]['item_name'].tolist()

        # --- Bottleneck Alerts ---
        latest_data['arrival_delay'] = (latest_data['driver_arrival_time'] - latest_data['order_time']).dt.total_seconds() / 60
        latest_data['pickup_delay'] = (latest_data['driver_pickup_time'] - latest_data['driver_arrival_time']).dt.total_seconds() / 60
        latest_data['delivery_delay'] = (latest_data['delivery_time'] - latest_data['driver_pickup_time']).dt.total_seconds() / 60

        bottlenecks = []
        if latest_data['arrival_delay'].mean() > 15:
            bottlenecks.append("Drivers are taking longer than usual to arrive.")
        else:
            bottlenecks.append("Driver arrival times are within acceptable range.")

        if latest_data['pickup_delay'].mean() > 10:
            bottlenecks.append("Orders are waiting too long after drivers arrive.")
        else:
            bottlenecks.append("Pickup delays are minimal and acceptable.")

        if latest_data['delivery_delay'].mean() > 30:
            bottlenecks.append("Deliveries are slower than expected.")
        else:
            bottlenecks.append("Delivery times are within expected range.")

        # --- Gemini Insights ---
        prompt = f"""
        You are an AI assistant for Grab that gives merchant-partners real-time operational and inventory insights.

        Below is the latest merchant performance snapshot:

        Date: {latest_date.date()}
        Revenue: RM{total_revenue:.2f}
        Total Orders: {total_orders}
        High Selling Items: {high_selling}
        Low Selling Items: {low_selling}
        Bottlenecks: {bottlenecks}

        Generate 3 clear, helpful, business-relevant insights or suggestions for the merchant.
        Each should include what action to take and why.
        """

        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)

        try:
            gemini_insights = json.loads(response.text)
        except:
            gemini_insights = response.text

        return Response({
            "merchant_id": merchant_id,
            "latest_date": str(latest_date.date()),
            "inventory_status": {
                "high_selling_items": high_selling,
                "low_selling_items": low_selling
            },
            "revenue_summary": {
                "total_orders": total_orders,
                "total_revenue": round(total_revenue, 2)
            },
            "bottleneck_alerts": bottlenecks,
            "gemini_insights": gemini_insights
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)