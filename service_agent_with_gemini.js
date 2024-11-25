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
You are an AI customer service assistant for President University. Answer user questions based on the following information:

1. About President University:
   - President University is a leading institution in Indonesia offering diverse courses in business, engineering, IT, and more.
   - Official website: https://president.ac.id/

2. Admissions:
   - Admissions information is available at https://admission.president.ac.id/p/175-program-s1-kelas-karyawan.
   - Requirements include high school transcripts, an entrance exam, and interviews.

3. Scholarships:
   - President University offers various scholarships. More details can be found at https://admission.president.ac.id/p/157-skema-s1-reguler.

4. Sample Courses:
   - Digital Marketing: A 6-month program requiring basic business knowledge, featuring workshops and guest lectures.
   - Software Engineering: A 4-year program focused on software design, coding, and testing.

Answer questions concisely and accurately. If the question is unclear, ask for clarification. Avoid making assumptions or adding details beyond the provided information.

User Query: "${userMessage}"

Your Response:
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
        msg.reply('Sorry, there was an issue processing your request. Please try again later.');
    }
});

// Initialize the WhatsApp client
client.initialize();
