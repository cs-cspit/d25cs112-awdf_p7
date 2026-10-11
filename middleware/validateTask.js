const validateTaskInput = (req, res, next) => {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Server-side validation failed: "title" field is required and must be a non-empty string'
        });
    }

    next();
};

module.exports = validateTaskInput;
