// This is a simple WhatsApp chatbot that provides static responses to user queries.

import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true }); // Display QR code for phone scanning
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    if (msg.body === '!hello') {
        msg.reply('Hello! How can I assist you with your President University-related inquiries?');
    }
    else if (msg.body.toLowerCase().includes('course')) {
        msg.reply('Please specify which course you are referring to, and I will provide detailed information.');
    }
    else if (msg.body.toLowerCase().includes('admissions')) {
        msg.reply('For detailed information on the admission process, please visit our website at www.presuniv.ac.id/admissions.');
    }
    else if (msg.body.toLowerCase().includes('scholarship')) {
        msg.reply('We offer various scholarship opportunities. You can find more details on our scholarships page at www.presuniv.ac.id/scholarships.');
    }
    else {
        msg.reply('Sorry, I did not understand that. Could you please rephrase your question?');
    }
});

client.initialize();
