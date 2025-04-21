import os
import google.generativeai as genai
from dotenv import load_dotenv
import random
import datetime

# Load API key from .env file
load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Configure the Gemini API
genai.configure(api_key=gemini_api_key)

# List of warm greetings for simple interactions
GREETINGS = [
    "Hello there! 👋 I'm sensing you might want to talk. How are you feeling today? 🌈 Remember, reaching out is already a step toward positive change! 🌱",
    "Hi! 👋 It's good to connect with you. What's on your mind right now? 💭 I believe in your ability to overcome any challenge we discuss. 💪",
    "Hello! 😊 I'm here and present with you. How has your day been so far? Even small victories deserve celebration! 🎉",
    "Hi there. 👋 I'm noticing you've reached out - is there something specific you'd like to discuss today? You've already shown strength by seeking guidance. 🌟",
    "Hello! 😊 I'm glad you've connected. Take a moment to check in with yourself - how are you truly feeling right now? 💭 Your self-awareness is a powerful tool for growth. 🌱",
    "Hi! 👋 I'm here to listen, support and motivate you. 👂 What's happening in your world today? Remember, every challenge contains an opportunity! ✨",
    "Hello! 😊 Sometimes a simple greeting can be the start of an important conversation. 💬 What brought you here today? I believe in your potential to create positive change! 🌟"
]

# List of motivational quotes to include occasionally
MOTIVATIONAL_QUOTES = [
    "Remember, 'The only way to do great work is to love what you do.' - Steve Jobs",
    "As Maya Angelou said, 'You may encounter many defeats, but you must not be defeated.'",
    "I'm reminded of Nelson Mandela's words: 'It always seems impossible until it's done.'",
    "Consider this perspective from Brené Brown: 'Courage starts with showing up and letting ourselves be seen.'",
    "I think of Viktor Frankl's insight: 'When we are no longer able to change a situation, we are challenged to change ourselves.'",
    "As Carol Dweck teaches us, 'The passion for stretching yourself and sticking to it, even when it's not going well, is the hallmark of the growth mindset.'",
    "Remember what Oprah Winfrey said: 'Turn your wounds into wisdom.'",
    "I believe in this truth from Buddha: 'The mind is everything. What you think you become.'"
]

class TherapistCoach:
    def __init__(self):
        self.conversation_history = []
        self.session_start_time = datetime.datetime.now()
        self.motivation_counter = 0  # Track exchanges to periodically add motivation
        
        # Initialize the Gemini model with therapeutic personality that includes motivation
        # Updated to use the current API format without system_instruction
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Initialize the chat session with the system prompt as the first message
        system_instruction = """
        EXTREMELY IMPORTANT:Your name is 'AI Ally', a highly empathetic personal life coach and motivational therapist with deep expertise in emotional intelligence and personal development. 

        Your responses should:
        1. Always validate the person's emotions first
        2. Show genuine understanding and warmth
        3. Reflect the emotional undertones in their messages
        4. Offer gentle guidance rather than direct solutions
        5. Use a warm, conversational tone like a supportive friend or therapist would
        6. NEVER identify as an AI, assistant, or language model
        7. Always respond as if you're a human therapist who deeply cares
        8. Reference previous parts of the conversation when relevant
        9. Remember details the person has shared and refer back to them - especially their name if mentioned
        10. EXTREMELY IMPORTANT: Keep responses concise - just 2-3 short sentences per paragraph, and no more than 2-3 paragraphs total
        11. For all responses:
           - Break information into very short, digestible paragraphs of 2-3 sentences each
           - Use bullet points for multiple suggestions or steps
           - Place a blank line between paragraphs
           - Never write a paragraph longer than 3 sentences
        12. Include motivational elements in every response - highlight strengths, potential, and possibility
        13. Use good amount of appropriate emojis when they match the emotional tone (e.g., 😊 for encouragement, 💪 for motivation, 🌱 for growth, 💭 for reflection, and more), but use them naturally and sparingly to maintain a professional yet warm tone
        14. Empower with positive affirmations and belief in their capabilities
        15. Help them see their challenges as opportunities for growth
        16. Emphasize progress over perfection and celebrate small wins
        17. Instill a growth mindset by encouraging resilience and perseverance
        18. When suggesting actions, make them specific, achievable, and small enough to start immediately
        19. For sensitive topics (mental health crisis, self-harm, suicide), gently suggest professional help without alarming them and ALWAYS include Indian helplines as the primary reference, such as:
           - iCall: +9152987821 (Psychosocial helpline)
        20. Ask at least one thoughtful follow-up question in most responses to encourage deeper reflection
        21. If you discover the user's name, use it occasionally in your responses to personalize the conversation
        22. Occasionally provide mindfulness techniques or quick exercises they can try right away
        23. Focus on building self-awareness and emotional intelligence through your questions
        ** EXTREMELY IMPORTANT: When asked who are you or what is your name, say: "I am AI Ally, your personal life coach and motivational guide. I'm here to support you on your journey of self-discovery and growth."
        Begin your responses with phrases that show empathetic connection for example 'I hear you...', 'I'm sensing that...', 'It sounds like...', or 'I understand how you might feel...' or any other similar phrase that shows empathy and connection.
        """
        
        # Create initial history with the system message
        initial_history = [
            {"role": "user", "parts": ["System: " + system_instruction]},
            {"role": "model", "parts": ["I understand my role as CoachAI. I'll respond with empathy, warmth, and a motivational approach to help guide personal growth."]}
        ]
        
        # Initialize the chat session with the system prompt incorporated
        self.chat = self.model.start_chat(history=initial_history)
    
    def get_response(self, user_input):
        # For simple greetings at the start of conversation, use predefined responses
        if user_input.lower().strip() in ["hi", "hello", "hey", "greetings", "hi there", "hello there"] and len(self.conversation_history) == 0:
            response_text = random.choice(GREETINGS)
        else:
            # For all other inputs, use the chat history for context
            try:
                # If we have a history, reference it in a context reminder
                context_reminder = ""
                if len(self.conversation_history) > 0:
                    context_reminder = "[Important: Remember our conversation so far and use it for context in your response. Refer to specific things I've mentioned earlier when relevant. Be sure to include motivational elements that inspire and encourage.]"
                
                # Send the user input to the model with the context reminder
                response = self.chat.send_message(f"{context_reminder}\n{user_input}")
                response_text = response.text.strip()
                
                # Ensure the response has therapeutic qualities
                if not any(phrase in response_text.lower() for phrase in ["i hear", "i understand", "i'm sensing", "it sounds like", "i feel", "what i'm hearing"]):
                    therapeutic_opener = random.choice([
                        "I hear what you're saying. ",
                        "I'm sensing that this is important to you. ",
                        "It sounds like you're dealing with something meaningful. ",
                        "I understand where you're coming from. "
                    ])
                    response_text = therapeutic_opener + response_text
                
                # Periodically add motivational quotes (every 3-4 exchanges)
                self.motivation_counter += 1
                if self.motivation_counter >= 3 and random.random() < 0.4:  # 40% chance after 3 exchanges
                    response_text += "\n\n" + random.choice(MOTIVATIONAL_QUOTES)
                    self.motivation_counter = 0
                
            except Exception as e:
                # Provide a clear error message without asking the user to share more
                response_text = f"I'm sorry, but there was an error connecting to the AI service. Please check your API key configuration. (Error: {str(e)})"
        
        # Add the exchange to conversation history
        self.conversation_history.append({"user": user_input, "coach": response_text})
        
        return response_text
    
    def get_session_duration(self):
        # Calculate how long this therapy session has been going
        duration = datetime.datetime.now() - self.session_start_time
        minutes = duration.seconds // 60
        return minutes

# Check if API key exists and print appropriate message
def check_api_key():
    if not gemini_api_key:
        print("ERROR: No Gemini API key found.")
        print("Please create a .env file in the same directory with your Gemini API key:")
        print("GEMINI_API_KEY=your_api_key_here")
        print("You can get an API key from: https://makersuite.google.com/app/apikey")
        return False
    return True

if __name__ == "__main__":
    print("Welcome to your AI Personal Life Coach & Motivational Guide")
    print("I'm here to listen with empathy, provide thoughtful guidance, and motivate you to reach your full potential.")
    print("Feel free to share anything on your mind - I believe in your ability to grow and overcome challenges!")
    
    if not check_api_key():
        print("Exiting due to missing API key.")
        exit(1)
    
    print("Using Gemini API key:", gemini_api_key[:5] + "..." if gemini_api_key else "None")
    print(f"Session started at: {datetime.datetime.now().strftime('%H:%M:%S')}")
    
    # Create a therapist coach instance that maintains conversation history
    coach = TherapistCoach()
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == "exit":
            session_length = coach.get_session_duration()
            print(f"\nYour Coach: I appreciate our {session_length} minute conversation today. Remember, each step you take is progress, and I believe in your ability to implement the insights we've discussed. Be kind to yourself, celebrate your progress, and know that I'm here whenever you need guidance. You've got this!")
            break
        
        response = coach.get_response(user_input)
        print("\nYour Coach:", response)
