# AI Personal Life Coach

A virtual companion providing personalized guidance, emotional support, and actionable insights to help navigate life's challenges.

## Overview

AI Personal Life Coach leverages artificial intelligence to create a supportive, non-judgmental environment where users can discuss their concerns, set goals, and receive personalized guidance. The system combines therapeutic techniques with practical advice to deliver a holistic coaching experience.

## AI Model

This project uses **Google's Gemini 2.0 Flash** model through the Google Generative AI API. Gemini is a powerful, multimodal AI model that offers:

- Advanced natural language understanding
- Contextual awareness for meaningful conversations
- Fast response times for real-time coaching
- Ability to remember conversation context and provide personalized guidance

## Features

- **Personalized Guidance**: Tailored advice based on your specific situation and goals
- **Emotional Support**: Empathetic responses that acknowledge your feelings and experiences
- **Goal Setting & Tracking**: Help identifying and working toward meaningful objectives
- **Mindfulness Practices**: Techniques to reduce stress and improve mental well-being
- **Actionable Insights**: Practical steps and strategies you can implement immediately
- **24/7 Availability**: Support whenever you need it, day or night
- **Private & Secure**: Your conversations remain confidential

## Technology Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript
- **AI**: Google Generative AI (Gemini API)
- **Deployment**: Local server (with cloud deployment options)

## Installation

1. Clone this repository:
```
git clone https://github.com/anugrahk21/Personal_AI_Life_Coach.git
cd AI_Personal_Life_Coach
```

2. Install dependencies:
```
pip install -r requirements.txt
```

3. Set up your Gemini API key:
   - Create a `.env` file in the root directory
   - Add your API key: `GEMINI_API_KEY=your_api_key_here`
   - You can get an API key from: https://makersuite.google.com/app/apikey

4. Run the application:
```
python app.py
```

5. Open your browser and navigate to the URL displayed in your terminal:
```
http://localhost:5000
```
Note: The port may vary depending on your system configuration or if port 5000 is already in use. The application will display the correct URL when it starts.

## Usage

1. Start a conversation by typing a message in the input field
2. Share your thoughts, challenges, or goals with the AI coach
3. Receive personalized guidance and support
4. Continue the conversation to explore topics in depth

## Screenshots

[Screenshots of the application interface will be added here]

## How It Works

[Detailed explanation of the AI's functionality will be added here]

## Project Structure

```
AI_Personal_Life_Coach/
├── app.py                # Main Flask application
├── coach.py              # TherapistCoach implementation
├── requirements.txt      # Python dependencies
├── static/               # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── assets/           # Images and other assets
└── templates/            # HTML templates
    ├── index.html        # Landing page
    └── coachai.html      # Coach interface
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Future Enhancements

- Voice interaction capabilities
- Mobile application version
- Integration with health tracking devices
- Specialized coaching modules (career, relationships, health)
- Multilingual support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google for providing the Gemini AI capabilities
- Flask team for the web framework
- Bootstrap for the responsive design components

## Contact

Anugrah K - anugrah.k910@gmail.com

Project Link: [Click Here](https://github.com/anugrahk21/Personal_AI_Life_Coach)