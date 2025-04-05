// API Routes
export const saveFeedback = async (req, res) => {
    try {
        const { feedbackType, feedback, email } = req.body;

        if (!feedbackType || !feedback) {
            return res.status(400).json({ message: 'Feedback type and message are required' });
        }

        const newFeedback = new Feedback({
            type: feedbackType,
            message: feedback,
            email: email || ''
        });

        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const retrieveFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
}