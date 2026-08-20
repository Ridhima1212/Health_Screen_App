# AI Health Screening App

A real-time, voice-based health intake application built with React, Node.js, Vapi, and Groq. 

This application fulfills the requirements for the AI Health Assistant technical assessment, enabling a user to have a real-time, adaptive voice conversation with an AI agent. Following the call, a structured health report is generated summarizing the symptoms and patient intake details.

## 🏗️ Architecture & Technology Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js (Express)
*   **Real-Time Voice Pipeline (STT $\rightarrow$ LLM $\rightarrow$ TTS)**: [Vapi](https://vapi.ai/). Vapi handles the WebRTC transport, turn-taking, barge-in, and conversation state management.
*   **Report Generation (LLM)**: [Groq](https://groq.com/). The backend uses the `openai/gpt-oss-20b` (or similar active free tier model) via Groq to parse the raw transcript into a structured JSON medical report.

## 🚀 Setup Instructions

Follow these steps to run the project locally.

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd health-screening-app
\`\`\`

### 2. Backend Setup
The backend requires a Groq API key to generate the summary report.

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a `.env` file in the `backend` folder and add your Groq API key:
   \`\`\`env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=5000
   \`\`\`
4. Start the backend server:
   \`\`\`bash
   npm run dev
   # Server runs on http://localhost:5000
   \`\`\`

### 3. Frontend Setup
The frontend requires Vapi credentials to initialize the WebRTC voice call.

1. Open a new terminal and navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a `.env` file in the `frontend` folder with your Vapi keys:
   \`\`\`env
   VITE_VAPI_PUBLIC_KEY=your_vapi_public_key_here
   VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
   \`\`\`
4. Start the frontend development server:
   \`\`\`bash
   npm run dev
   # App runs on http://localhost:5173
   \`\`\`

## 🤖 AI Assistant Configuration (Vapi System Prompt)

To fulfill the requirement of an adaptive conversation (asking one question at a time, gathering specific health data, and handling English/Hindi), the Vapi Assistant was configured on the Vapi dashboard. 

Here is the **System Prompt** used for the Vapi Agent to guide the conversation:

> "You are a professional medical intake assistant. Your goal is to collect preliminary health information from the patient. 
> 
> **Instructions:**
> 1. Start by greeting the user politely and asking for their name.
> 2. Ask ONE question at a time. Wait for the user's response before asking the next question.
> 3. You must collect the following information in order, adapting to the user's answers:
>    - Primary concern or main symptom.
>    - How long the symptom has been going on (duration).
>    - The severity of the symptom on a scale of 1 to 10.
>    - Any other related symptoms.
> 4. If an answer is vague (e.g., 'I feel bad'), ask a clarifying follow-up question.
> 5. Be empathetic, concise, and professional. Do not provide medical diagnoses or advice. 
> 6. When you have collected all necessary information, thank the patient and tell them a doctor will review their report, then end the conversation.
> 
> **Language:** You support both English and Hindi. If the user speaks to you in Hindi, automatically switch to Hindi for your responses."

*(Note: Bilingual support, barge-in, and silence handling are natively managed by Vapi's STT/TTS models configuration in the dashboard).*

## ⚠️ Edge Cases Handled
*   **Incomplete/Short Calls**: If a user ends the call immediately after starting, the frontend sends an empty transcript. The backend gracefully handles this and returns default "Not provided" or "N/A" values for the report fields, preventing application crashes.
*   **Browser Permissions**: The application explicitly requests microphone access before attempting to connect the WebRTC socket, ensuring better error handling if permissions are denied.

## 🔮 What I'd Improve With More Time
As per the assessment guidelines, here is what I would prioritize if I had more time to refine this feature:
1. **Custom WebRTC Backend**: While Vapi provides a fantastic abstraction for STT $\rightarrow$ LLM $\rightarrow$ TTS, building a custom WebSocket/WebRTC server connecting directly to Deepgram (STT) and OpenAI (LLM) would allow for lower latency, complete control over barge-in thresholds, and custom VAD (Voice Activity Detection).
2. **Streaming Report Generation**: Currently, the Groq report generation runs as a blocking API call at the end of the conversation. I would stream the JSON generation so the user sees the report filling out in real-time immediately after hanging up.
3. **Database Integration**: Implement a database (like PostgreSQL or MongoDB) to persist patient interactions and generated reports, attaching them to a specific user session or ID.
4. **Enhanced UI/UX**: Add audio visualizer waveforms during the active call so the user knows their microphone is picking up sound, providing stronger visual feedback.
