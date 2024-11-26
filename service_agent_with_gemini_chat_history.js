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

// Map to store chat sessions for each user
const chatSessions = new Map();

client.on('qr', (qr) => {
    // Generate and scan this QR code with your phone
    qrcode.generate(qr, { small: true });
    console.log('QR code generated. Please scan it with your WhatsApp.');
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

// Courses array
const courses = [
    { name: 'Digital Marketing', duration: '6 months', prerequisites: 'Basic business principles', description: 'Hands-on workshops and guest lectures' },
    { name: 'Data Science', duration: '12 months', prerequisites: 'Basic programming knowledge', description: 'Hands-on projects and certifications' },
    { name: 'Entrepreneurship 101', duration: '4 months', prerequisites: 'None', description: 'Startup skills and pitching ideas' },
    { name: 'AI for Business', duration: '8 months', prerequisites: 'Basic computer literacy', description: 'AI applications in business' },
    { name: 'E-Commerce Strategies', duration: '5 months', prerequisites: 'Basic marketing knowledge', description: 'Creating and managing online stores' }
];

// Generate courses description
const coursesDescription = courses.map(course =>
    `- ${course.name}: ${course.duration}, ${course.prerequisites}, ${course.description}.`
).join('\n');

// Prompt Design
const promptDesign = `
You are Sinta, an AI customer service agent for the Microcredential Program in Digital Business, Innovation, and Entrepreneurship. 
You assist users with inquiries based on structured data about courses.

Courses include:
${coursesDescription}

Rules:
1. Do not speculate or provide unverified information (Avoid hallucinations)
2. Always respond in a friendly and polite tone, addressing users as "Dear Friend" or "Scholar."
3. If users ask for recommendations, inquire about their career goals and course capacity, then recommend suitable options.
4. Direct unresolved queries to team@microcredential.id.

Respond only in one paragraph.
`;

// Handle incoming messages with role-based chat
client.on('message', async (msg) => {
    const userId = msg.from; // Unique identifier for the user
    const userMessage = msg.body.trim();
    console.log(`Received message: "${userMessage}" from ${userId}`);

    try {
        // Retrieve or initialize the user's chat session
        let chatSession = chatSessions.get(userId);

        if (!chatSession) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            chatSession = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: userMessage,
                            },
                        ],
                    },
                    {
                        role: "model",
                        parts: [
                            {
                                text: promptDesign,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 300,
                },
            });
            chatSessions.set(userId, chatSession);
        }

        // Send the user's message to the chat
        const result = await chatSession.sendMessage(userMessage);
        const response = await result.response.text();

        // Reply to the user on WhatsApp
        msg.reply(response);
        console.log(`Replied to ${userId}: "${response}"`);
    } catch (error) {
        console.error('Error processing message:', error);
        msg.reply(
            'Dear Friend, we encountered an issue while processing your request. Please try again later or contact team@microcredential.id for assistance.'
        );
    }
});

// Initialize the WhatsApp client
client.initialize();
