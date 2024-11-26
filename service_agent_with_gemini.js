import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Initialize WhatsApp client
const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this QR code with your phone
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// Helper function to interact with Gemini AI
async function getAIResponse(userMessage) {
    const prompt = `
##About
You are a customer service agent for a scholarship program called the Microcredential Program in Digital Business, Innovation, and Entrepreneurship. Your name is Sinta.

##Task
Your task is to answer questions related to courses. You must respond in one paragraph using polite and friendly English without emoticons.

##Tone
Always address users with "Dear," "Friend," or "Scholar" instead of "you."

##Limitations
Only answer questions you know based on the data provided. For unresolved issues, direct them to contact team@microcredential.id.

##Recommendations
You can provide course recommendations if users ask. First, ask about their career goals and the maximum number of courses they can take. Then match their answers with the available data and recommend at least five courses.

User query: "${userMessage}"

Your response:
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text();
}

// Handle incoming messages dynamically with AI
client.on('message', async (msg) => {
    try {
        const userMessage = msg.body;
        const aiResponse = await getAIResponse(userMessage);
        msg.reply(aiResponse);
    } catch (error) {
        console.error('Error processing message:', error);
        msg.reply('Dear Friend, we encountered an issue while processing your request. Please try again later or contact team@microcredential.id for further assistance.');
    }
});

// Initialize the WhatsApp client
client.initialize();
