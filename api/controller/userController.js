const User = require('../models/UserModel');
const OTP = require('../models/otpModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const nodemailer = require('nodemailer');

// Create SMTP transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Your App Name" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Email Verification OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Email Verification</h2>
                <p>Your OTP for email verification is:</p>
                <h1 style="color: #4CAF50; font-size: 40px; letter-spacing: 2px;">${otp}</h1>
                <p>This OTP will expire in 60 seconds.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

const register = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, photoBase64 } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        let photoUrl = null;
        let photoPublicId = null;

        if (photoBase64) {
            const uploadResponse = await cloudinary.uploader.upload(photoBase64, {
                folder: 'url-shortener/profiles'
            });
            photoUrl = uploadResponse.secure_url;
            photoPublicId = uploadResponse.public_id;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name,
            email,
            phoneNumber,
            password: hashedPassword,
            photoUrl,
            photoPublicId,
            isVerified: false
        });

        await user.save();

        // Generate and save OTP
        const otp = generateOTP();
        const otpDoc = new OTP({
            userId: user._id,
            email: user.email,
            otp
        });
        await otpDoc.save();

        // Send OTP email
        await sendOTPEmail(email, otp);

        res.status(201).json({
            message: 'Registration successful. Please verify your email with the OTP sent.',
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const otpDoc = await OTP.findOne({ userId, otp });
        if (!otpDoc) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        await user.save();
        await OTP.deleteOne({ _id: otpDoc._id });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                photoUrl: user.photoUrl
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Delete any existing OTP
        await OTP.deleteOne({ userId });

        // Generate and save new OTP
        const otp = generateOTP();
        const otpDoc = new OTP({
            userId: user._id,
            email: user.email,
            otp
        });
        await otpDoc.save();

        await sendOTPEmail(user.email, otp);

        res.json({ 
            message: 'OTP resent successfully',
            info: 'Please note that the OTP will expire in 60 seconds'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // if (!user.isVerified) {
        //     return res.status(400).json({ message: 'Email not verified' });
        // }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                photoUrl: user.photoUrl
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    register,
    login,
    verifyOTP,
    resendOTP
};