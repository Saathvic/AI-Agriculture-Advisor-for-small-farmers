# 🌱 AI Agriculture Advisor for Small Farmers

An intelligent web application that empowers small farmers with AI-driven agricultural insights, crop recommendations, and sustainable farming practices.

## 🚀 Features

### Core Services
- **🌾 Agriculture Advice**: Get expert guidance for farming needs with AI-powered recommendations
- **💧 Water Management**: Optimize irrigation practices with personalized water management plans
- **📸 Image Analysis**: Analyze crop conditions using advanced computer vision
- **🔍 Disease Detection**: Early identification of plant diseases with AI vision models
- **🌿 Bio Fertilizer Recommendations**: Sustainable fertilizer guidance for different crops and soil types
- **💰 Schemes & Loans**: Access information about government agricultural schemes and financial assistance

### Advanced Tools
- **🌤️ Weather-Based Crop Recommendations**: Get crop suggestions based on 7-day weather forecasts and soil conditions
- **🔄 Crop Rotation Guide**: Learn optimal crop rotation patterns for sustainable farming
- **🌍 Multi-language Support**: Available in English, Hindi, Telugu, and Tamil

## 🛠️ Technology Stack

- **Backend**: Flask (Python)
- **AI/ML**: 
  - Groq API with Llama models for text generation
  - Google Gemini for scheme information
  - Computer vision for image analysis
- **APIs**: OpenWeatherMap for weather data
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Image Processing**: PIL (Python Imaging Library)

## 📋 Prerequisites

- Python 3.8 or higher
- API Keys for:
  - Groq API
  - Google Gemini API
  - OpenWeatherMap API

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/AI-Agriculture-Adhvisor-for-small-farmers.git
   cd AI-Agriculture-Adhvisor-for-small-farmers
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

4. **Create upload directory**
   ```bash
   mkdir -p static/uploads
   ```

## 🚀 Usage

1. **Start the application**
   ```bash
   python app100.py
   ```

2. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 📱 Application Structure

```
AI-Agriculture-Adhvisor-for-small-farmers/
├── app100.py                 # Main Flask application
├── weather_module.py         # Weather analysis module
├── main.py                   # Weather utility functions
├── requirements.txt          # Python dependencies
├── templates/               # HTML templates
│   └── index.html          # Home page template
├── static/                 # Static files (CSS, JS, images)
│   ├── styles.css         # Application styles
│   ├── main.js           # JavaScript functionality
│   └── uploads/          # Image upload directory
└── README.md             # Project documentation
```

## 🌟 Key Features Explained

### 1. **Smart Crop Analysis**
Upload images of your crops to get:
- Crop identification
- Health assessment
- Sustainable farming recommendations

### 2. **Disease Detection**
- Upload plant images for disease analysis
- Get detailed diagnosis with symptoms
- Receive treatment and prevention recommendations

### 3. **Water Management**
- Personalized irrigation schedules
- Water conservation techniques
- Soil-specific watering guidelines

### 4. **Weather Integration**
- 7-day weather forecasts
- Weather-based crop recommendations
- Climate adaptation strategies

### 5. **Government Schemes**
- State-wise scheme information
- Eligibility criteria and benefits
- Direct links to official portals

## 🔧 API Configuration

### Groq API
Used for text generation and agricultural advice
- Model: `llama-3.3-70b-versatile`
- Vision Model: `llama-3.2-90b-vision-preview`

### Google Gemini
Used for government scheme information
- Model: `gemini-2.0-flash-exp`

### OpenWeatherMap
Used for weather data and forecasts
- Provides current weather and 7-day forecasts

## 🌐 Supported Languages

- **English**: Default language
- **Hindi**: हिंदी भाषा समर्थन
- **Telugu**: తెలుగు భాష మద్దతు
- **Tamil**: தமிழ் மொழி ஆதரவு

## 📊 File Upload Limits

- Maximum file size: 16 MB
- Supported formats: PNG, JPG, JPEG
- Secure filename handling

## 🔒 Security Features

- Secure file upload handling
- Input validation and sanitization
- Error handling for API failures
- Rate limiting considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Email**: btechit221179@smvec.ac.in
- **Phone**: +91 8667866489
- **Location**: Madagadipet, Puducherry

## 🙏 Acknowledgments

- OpenWeatherMap for weather data services
- Groq for AI model access
- Google for Gemini API
- Bootstrap for UI components
- The farming community for inspiration and feedback

## 📈 Future Enhancements

- [ ] Mobile app development
- [ ] Offline mode capabilities
- [ ] Community forum integration
- [ ] IoT sensor integration
- [ ] Market price predictions
- [ ] Soil testing recommendations
- [ ] Pest prediction models

---

**Note**: This application is designed to assist farmers with AI-powered recommendations. Always consult with local agricultural experts for critical farming decisions.