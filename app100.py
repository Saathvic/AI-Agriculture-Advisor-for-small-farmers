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
            "max_tokens": 100
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

        payload = {
            "model": "llama-3.2-90b-vision-preview",
            "messages": [
                {
                    "role": "user", 
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this plant image and provide a detailed disease assessment following this format:"
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
            print(f"API Response: {response.text}")  # Debug logging
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
    [Brief introduction to recommendations for {crop_type}]

    # Detailed Recommendations
    1. **Primary Bio-Fertilizers**
    [Main products suitable for {crop_type} in {growth_stage} stage]

    2. **Application Methods**
    [How to apply properly considering {soil_type} soil]

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
        return f"Error getting bio-fertilizer advice: {str(e)}"

def get_scheme_information(state, category):
    disclaimer = """# Disclaimer
**Important Notice**: The information provided about agricultural schemes and loans is for general guidance only. Actual schemes, eligibility criteria, and benefits may vary. Please verify all details with your local agricultural office or concerned authorities before making any decisions.

"""
    prompt = f"""{disclaimer}Provide information about agricultural schemes and loans in {state} state for {category}.
    Structure your response in this exact format:

    # Government Schemes Overview
    [Brief introduction to available schemes in {state} for {category}]

    # Major Schemes
    1. **[Scheme Name 1 for {category}]**
    [Detailed description]
    - Eligibility: [Criteria specific to {state}]
    - Benefits: [Details]
    - Documents: [Requirements]

    [Rest of the format...]"""

    try:
        response = gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "top_p": 0.8,
                "top_k": 40
            }
        )
        return disclaimer + response.text
    except Exception as e:
        return f"Error getting scheme information: {str(e)}"

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
    
    if not crop_type or not soil_type:
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

@app.route('/schemes', methods=['POST'])
def schemes():
    state = request.form.get('state')
    category = request.form.get('category')
    
    if not state or not category:
        return jsonify({'error': 'Please select both state and category'}), 400
    
    schemes = get_scheme_information(state, category)
    return jsonify({'schemes': schemes})

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)
