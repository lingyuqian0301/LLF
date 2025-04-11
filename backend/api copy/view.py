from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import google.generativeai as genai

@api_view(['POST'])
def ask_gemini(request):
    user_query = request.data.get('query')
    
    # Configure Gemini
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    model = genai.GenerativeModel('gemini-pro')
    
    try:
        response = model.generate_content(user_query)
        return Response({'response': response.text})
    except Exception as e:
        return Response({'error': str(e)}, status=500)