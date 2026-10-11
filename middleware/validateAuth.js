const validateAuthInput = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
            success: false,
            message: 'Server-side validation failed: Valid "email" is required'
        });
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
        return res.status(400).json({
            success: false,
            message: 'Server-side validation failed: "password" is required and must be at least 4 characters long'
        });
    }

    next();
};

module.exports = validateAuthInput;
