from flask import Flask, render_template, request, jsonify
from PIL import Image
import base64
from datetime import datetime
from groq import Groq
import os
from dotenv import load_dotenv
import io
import requests
import google.generativeai as genai
from werkzeug.utils import secure_filename
from weather_module import WeatherAnalyzer, get_7_day_forecast

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Initialize API clients
load_dotenv()
groq_client = Groq(api_key='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')
genai.configure(api_key='AIzaSyDzvX8V8lBewrWrKT32VMUAJ49rKHagd8M')
gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')

def encode_image(image):
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def analyze_image_with_llama(image):
    try:
        # Ensure the image is in RGB mode
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        base64_image = encode_image(image)
        
        headers = {
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "llama-3.2-90b-vision-preview",
            "messages": [
                {
                    "role": "user", 
                    "content": [
                        {
                            "type": "text",
                            "text": "What crop is shown in this image? Just provide the crop name."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.7,
            "max_tokens": 300
        }

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            print(f"API Response: {response.text}")  # Debug logging
            raise Exception(f"API request failed with status {response.status_code}")
            
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Error in analyze_image_with_llama: {str(e)}")
        raise Exception(f"Error analyzing image: {str(e)}")

def get_water_advice(crop_type, soil_type):
    prompt = f"""Provide specific water management advice for {crop_type} crop grown in {soil_type} soil.
    Structure your response in this exact format:

    # Water Management Plan
    [Brief overview of water requirements for {crop_type} in {soil_type} soil]

    # Detailed Recommendations
    1. **Watering Schedule**
    [Details about frequency and timing specific to {crop_type}]

    2. **Water Amount**
    [Specific quantities and measurements for {soil_type} soil]

    # Best Practices
    [Rest of the format...]"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error getting water advice: {str(e)}"

def analyze_disease_with_vision(image):
    try:
        base64_image = encode_image(image)
        
        headers = {
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        }

        prompt = """Analyze this plant image and provide a detailed disease assessment following this exact format:

# Disease Identification
[Identify the disease name and affected plant]

# Symptoms Analysis
1. **Visual Symptoms**
[List and describe visible symptoms]

2. **Severity Assessment**
[Evaluate the stage and severity of infection]

# Treatment Recommendations
1. **Immediate Actions**
[List urgent steps to take]

2. **Long-term Management**
[Provide sustainable treatment options]

# Prevention Measures
1. **Cultural Practices**
[List preventive farming practices]

2. **Environmental Controls**
[Describe optimal growing conditions]

# Additional Notes
[Any other relevant information or specific concerns]"""

        payload = {
            "model": "llama-3.2-90b-vision-preview",
            "messages": [
                {
                    "role": "user", 
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.7,
            "max_tokens": 800
        }

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            print(f"API Response: {response.text}")
            raise Exception(f"API request failed with status {response.status_code}")
            
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Error in analyze_disease_with_vision: {str(e)}")
        raise Exception(f"Error analyzing plant disease: {str(e)}")

def get_agriculture_advice(question):
    prompt = f"""As an agricultural expert, please provide comprehensive advice about sutainable way : {question}
    Structure your response in this exact format:
    
    # Introduction
    [Brief introduction to the topic]

    # Detailed Recommendations
    1. **[First Recommendation Title]**
    [Detailed explanation]
    
    2. **[Second Recommendation Title]**
    [Detailed explanation]
    
    # Best Practices
    1. **[First Practice]**
    [Explanation]
    
    2. **[Second Practice]**
    [Explanation]
    
    # Common Mistakes to Avoid
    1. **[First Mistake]**
    [How to avoid it]
    
    2. **[Second Mistake]**
    [How to avoid it]
    
    # Sustainable Approaches
    1. **[First Approach]**
    [Details]
    
    2. **[Second Approach]**
    [Details]
    
    # Related Topics for Further Learning
    - **[Topic 1]**: [Brief description]
    - **[Topic 2]**: [Brief description]
    """
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error getting agriculture advice: {str(e)}"

def get_sustainable_crop_advice(crop_name):
    prompt = f"""Provide sustainable farming advice for {crop_name}. Structure your response in this exact format:

# Introduction
[Brief introduction about the crop]

# Sustainable Practices
1. **Soil Management**
[Organic and sustainable soil practices]

2. **Water Conservation**
[Efficient irrigation methods]

# Natural Solutions
1. **Pest Management**
[Organic pest control methods]

2. **Disease Prevention**
[Natural disease prevention]

# Eco-friendly Techniques
1. **Companion Planting**
[Best companion crops]

2. **Crop Rotation**
[Rotation schedule]

# Resource Optimization
1. **Water Usage**
[Water-saving techniques]

2. **Soil Fertility**
[Natural fertilization methods]

# Additional Tips
- **Climate Adaptation**: [Climate-specific advice]
- **Harvest Timing**: [Optimal harvesting practices]"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error getting sustainable advice: {str(e)}"

def analyze_crop_image(image):
    crop_name = analyze_image_with_llama(image)
    sustainable_advice = get_sustainable_crop_advice(crop_name)
    return {
        "crop_identified": crop_name,
        "sustainable_advice": sustainable_advice
    }

def get_bio_fertilizer_advice(crop_type, soil_type, growth_stage):
    prompt = f"""Provide specific bio-fertilizer recommendations for {crop_type} crop in {soil_type} soil during {growth_stage} stage.
    Structure your response in this exact format:

    # Bio-Fertilizer Overview
    [Brief introduction about organic fertilization for {crop_type}]

    # Primary Recommendations
    1. **Recommended Bio-Fertilizers**
    [List and describe main bio-fertilizers suitable for {crop_type}]

    2. **Application Method**
    [Detailed application instructions for {soil_type} soil]

    # Timing and Frequency
    1. **Application Schedule**
    [When to apply during {growth_stage} stage]

    2. **Frequency Guidelines**
    [How often to apply]

    # Best Practices
    1. **Storage Guidelines**
    [How to store bio-fertilizers]

    2. **Safety Precautions**
    [Safety measures during application]

    # Additional Tips
    - **Soil Preparation**: [Preparation guidelines]
    - **Compatibility**: [What to avoid mixing]"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800  # Increased token limit for more detailed response
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error getting bio-fertilizer advice: {str(e)}"

def get_scheme_information(state, category):
    prompt = f"""Provide comprehensive information about agricultural schemes and loans in {state} state for {category} category. 
    Format all links as HTML anchor tags with target="_blank". For example:
    <a href="https://apcob.org/" target="_blank">APCOB</a>
    make sure the links are not invalid and they work properly.
    Structure your response in this exact format:
    Dsiclaimer : The information provided here is for reference purposes only. Please verify the details with the official sources before applying.
    # Government Schemes Overview
    [Brief introduction about available schemes in {state} for {category}]

    # Available Schemes
    1. **[Scheme Name]**
    - Eligibility: [List key eligibility criteria]
    - Benefits: [List main benefits]
    - Documents Required: [List essential documents]
    - Official Website: <a href="[URL]" target="_blank">[Scheme Name] Portal</a>

    2. **[Another Scheme Name]**
    - Eligibility: [List key eligibility criteria]
    - Benefits: [List main benefits]
    - Documents Required: [List essential documents]
    - Official Website: <a href="[URL]" target="_blank">[Scheme Name] Portal</a>

    # Application Process
    1. **Steps to Apply**
    [List application steps with clickable links where relevant]
    
    2. **Important Deadlines**
    [Mention any deadlines or time constraints]

    # Additional Information
    - **Contact Details**: [Relevant office contacts]
    - **Official Portal**: <a href="[URL]" target="_blank">[Portal Name]</a>
    - **More Resources**: [List with clickable links]"""

    try:
        response = gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "top_p": 0.8,
                "top_k": 40
            }
        )
        
        if response.text:
            return response.text
        else:
            raise Exception("No response generated")
            
    except Exception as e:
        print(f"Error in get_scheme_information: {str(e)}")  # Add debug logging
        raise Exception(f"Error getting scheme information: {str(e)}")

def get_crop_recommendations(weather_summary):
    prompt = f"""Based on the following weather forecast, provide detailed crop recommendations:

{weather_summary}

Structure your response in this exact format:

# Crop Recommendations Based on Weather Forecast

1. **Suitable Crops**
[List 3-4 crops that would thrive in these conditions]

2. **Planting Advice**
[Specific planting recommendations considering the weather]

3. **Precautionary Measures**
[Weather-specific precautions farmers should take]

4. **Irrigation Guidelines**
[Water management advice based on forecast]

5. **Additional Recommendations**
[Any other relevant advice based on the weather conditions]"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error getting crop recommendations: {str(e)}"

@app.route('/schemes', methods=['POST'])
def schemes():
    try:
        state = request.form.get('state')
        category = request.form.get('category')
        
        if not state or not category:
            return jsonify({'error': 'Please select both state and category'}), 400
        
        schemes_info = get_scheme_information(state, category)
        return jsonify({'schemes': schemes_info})
    except Exception as e:
        print(f"Error in schemes route: {str(e)}")  # Add debug logging
        return jsonify({'error': str(e)}), 500

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/agriculture')  # Remove .html extension from routes
def agriculture():
    return render_template('agriculture.html')

@app.route('/water')
def water():
    return render_template('water.html')

@app.route('/image')
def image():
    return render_template('image.html')

@app.route('/disease')
def disease():
    return render_template('disease.html')

@app.route('/bio-fertilizer')
def bio_fertilizer_page():
    return render_template('bio-fertilizer.html')

@app.route('/schemes')
def schemes_page():
    return render_template('schemes.html')

@app.route('/crop-recommendations')
def crop_recommendations_page():
    return render_template('crop-recommendations.html')

@app.route('/get-advice', methods=['POST'])
def get_advice():
    question = request.form.get('question')
    try:
        advice = get_agriculture_advice(question)
        return jsonify({'advice': advice})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/water-management', methods=['POST'])
def water_management():
    crop_type = request.form.get('crop_type')
    soil_type = request.form.get('soil_type')
    
    if not crop_type or soil_type:
        return jsonify({'error': 'Please provide both crop type and soil type'}), 400
    
    advice = get_water_advice(crop_type, soil_type)
    return jsonify({'advice': advice})

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        image = Image.open(file.stream)
        results = analyze_crop_image(image)
        return jsonify(results)
    except Exception as e:
        print(f"Error in analyze_image route: {str(e)}")  # Add debug logging
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-disease', methods=['POST'])
def analyze_disease():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        image = Image.open(file.stream)
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        diagnosis = analyze_disease_with_vision(image)
        return jsonify({'diagnosis': diagnosis})
    except Exception as e:
        print(f"Error in analyze_disease route: {str(e)}")  # Add debug logging
        return jsonify({'error': str(e)}), 500

@app.route('/bio-fertilizer', methods=['POST'])
def bio_fertilizer():
    crop_type = request.form.get('crop_type')
    soil_type = request.form.get('soil_type')
    growth_stage = request.form.get('growth_stage')
    
    if not all([crop_type, soil_type, growth_stage]):
        return jsonify({'error': 'Please provide all required fields'}), 400
    
    advice = get_bio_fertilizer_advice(crop_type, soil_type, growth_stage)
    return jsonify({'advice': advice})

@app.route('/weather', methods=['POST'])
def get_weather():
    city = request.form.get('city')
    if not city:
        return jsonify({'error': 'Please provide a city name'}), 400

    try:
        # Get weather forecast only
        forecast_data = get_7_day_forecast(city)
        if 'error' in forecast_data:
            return jsonify({'error': forecast_data['error']}), 500

        return jsonify(forecast_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-crop-recommendations', methods=['POST'])
def get_crop_recommendations_route():
    city = request.form.get('city')
    if not city:
        return jsonify({'error': 'Please provide a city name'}), 400

    try:
        # Get weather forecast
        forecast_data = get_7_day_forecast(city)
        if 'error' in forecast_data:
            return jsonify({'error': forecast_data['error']}), 500

        # Get crop recommendations based on weather
        recommendations = get_crop_recommendations(forecast_data['weather_summary'])
        
        return jsonify({
            'weather_summary': forecast_data['weather_summary'],
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)
