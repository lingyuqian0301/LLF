from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import google.generativeai as genai

#verify why cannot read key from env
from dotenv import load_dotenv
load_dotenv()

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