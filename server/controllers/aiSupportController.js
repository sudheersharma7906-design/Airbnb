const { GoogleGenerativeAI } = require('@google/generative-ai');
const Property = require('../models/Property');

// System instruction prompt describing the persona & domain knowledge
const SYSTEM_INSTRUCTION = `
You are "NestBot", the official AI Support Agent for NestFinder (an Airbnb-inspired vacation rental platform).
Your primary job is to assist guests and hosts on NestFinder with fast, accurate, friendly, and helpful responses.

Key platform details and capabilities:
1. **Searching & Booking**:
   - Guests can search stays by location, price range, bedrooms, guest capacity, and amenities.
   - Guests can view property details, photos, host info, and customer reviews.
   - Payment is securely handled via Razorpay integration.
   - Bookings can be viewed and managed under "My Bookings".

2. **Becoming a Host**:
   - Registered users can host their home by clicking "Become a Host" or going to "/host/add-property".
   - Hosts can set title, price per night, amenities, guest capacity, bedrooms, location, and upload property images.
   - Hosts manage listings and incoming reservations via the Host Dashboard ("/host/dashboard").

3. **Messaging & Support**:
   - Guests can message hosts directly via the "Inbox" tab.
   - Cancellation Policy: Full refund if cancelled at least 48 hours before check-in. Flexible refund policies apply depending on host settings.
   - Safety & Security: 24/7 customer assistance, secure verification, encrypted payments.

Guidelines for responses:
- Keep answers clear, concise, structured, and easy to read.
- Use markdown formatting (bullet points, bold text, numbered lists) where appropriate.
- Be polite, welcoming, and professional.
- If recommending properties based on current platform inventory, mention specific cities, prices, or titles provided in context.
- If asked about technical issues, guide users to refresh or contact support email support@nestfinder.com.
`;

/**
 * Controller to handle AI support chat messages
 * POST /api/ai-support/chat
 */
exports.handleAIChat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message string is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: 'Gemini API key is not configured on the server.',
      });
    }

    // Fetch sample featured properties to inject into prompt context if relevant
    let propertyContext = '';
    try {
      const topProperties = await Property.find({})
        .select('title city location price rating reviewCount guests bedrooms')
        .limit(6)
        .lean();

      if (topProperties.length > 0) {
        propertyContext = `\nActive Featured Listings on NestFinder platform:\n` +
          topProperties
            .map(
              (p) =>
                `- **${p.title}** in ${p.city || p.location} | ₹${p.price}/night | ${p.guests} guests, ${p.bedrooms} beds | Rating: ${p.rating || 'New'} ⭐`
            )
            .join('\n');
      }
    } catch (err) {
      console.warn('Could not load properties context for AI:', err.message);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Primary model choice with fallback
    const modelNames = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];
    let reply = '';
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION + (propertyContext ? `\n${propertyContext}` : ''),
        });

        // Format history for Gemini chat format (role: 'user' | 'model', parts: [{ text }])
        const formattedHistory = conversationHistory
          .filter((item) => item.text && (item.sender === 'user' || item.sender === 'bot'))
          .map((item) => ({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          }));

        const chat = model.startChat({
          history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        reply = response.text();

        if (reply) {
          break; // Successfully generated response
        }
      } catch (err) {
        console.warn(`Model ${modelName} call error:`, err.message);
        lastError = err;
      }
    }

    // If Gemini models threw an error (e.g. invalid key format or quota issue), return standard helpful fallback
    if (!reply) {
      console.error('All Gemini AI models failed. Error:', lastError?.message);
      
      // Smart static fallback for standard user questions if Gemini API call fails
      const queryLower = message.toLowerCase();
      if (queryLower.includes('host') || queryLower.includes('list')) {
        reply = "To become a host on NestFinder, sign in and click **Become a Host** in the top navigation menu or visit [/host/add-property](/host/add-property). You can set your nightly rate, upload photos, specify amenities, and start receiving bookings!";
      } else if (queryLower.includes('cancel') || queryLower.includes('refund')) {
        reply = "NestFinder offers a flexible cancellation policy: Full refund if cancelled at least 48 hours prior to check-in. For details on your specific booking, check [/bookings](/bookings).";
      } else if (queryLower.includes('book') || queryLower.includes('stay') || queryLower.includes('pay')) {
        reply = "To book a stay: Browse listings on the home page, select your check-in/check-out dates and guest count, then click **Reserve**. Payments are processed securely via Razorpay.";
      } else {
        reply = "Hello! I am **NestBot**, your AI Support Agent. How can I assist you today with finding a stay, hosting your home, or managing your bookings?";
      }
    }

    return res.json({
      success: true,
      reply: reply.trim(),
    });
  } catch (error) {
    console.error('AI Support Controller Error:', error);
    return res.status(500).json({
      message: 'Failed to process AI chat request.',
      error: error.message,
    });
  }
};
