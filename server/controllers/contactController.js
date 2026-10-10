import Contact from '../models/Contact.js';

// @desc    Submit a customer contact message / inquiry
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Message must be at least 5 characters long' });
    }

    const inquiry = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your inquiry has been received by our skincare team.',
      inquiry: {
        id: inquiry._id,
        name: inquiry.name,
        email: inquiry.email,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all contact inquiries (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
export const getContactInquiries = async (req, res) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
