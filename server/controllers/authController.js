const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail, sendSignupOTPEmail } = require('../utils/emailService');
const { sendSignupOTPSMS } = require('../utils/smsService');

const registerUser = async (req, res) => {
  try {
    const { name, fullName, email, mobile, password, role } = req.body;

    const userName = (name || fullName || '').trim();
    const userEmail = (email || '').toLowerCase().trim();
    const userMobile = (mobile || '').trim();

    if (!userName || !userEmail || !userMobile || !password) {
      return res.status(400).json({ message: 'Please enter your Full Name, Email, Mobile number, and Password.' });
    }

    // Format mobile to E.164 (+91XXXXXXXXXX)
    let formattedMobile = userMobile;
    if (!formattedMobile.startsWith('+')) {
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    // Check duplicate email
    const emailExists = await User.findOne({ email: userEmail });
    if (emailExists) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // Check duplicate mobile
    const mobileExists = await User.findOne({ mobile: formattedMobile });
    if (mobileExists) {
      return res.status(400).json({ message: 'This mobile number is already registered.' });
    }

    const userRole = (role === 'Host' || role === 'host') ? 'host' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: userName,
      fullName: userName,
      email: userEmail,
      mobile: formattedMobile,
      password: hashedPassword,
      role: userRole,
      emailVerified: true,
      phoneVerified: true,
      wishlist: [],
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      fullName: user.fullName || user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      wishlist: user.wishlist || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, mobile, identifier, password } = req.body;

    const input = (identifier || email || mobile || '').trim();

    if (!input || !password) {
      return res.status(400).json({ message: 'Please enter your email/mobile number and password' });
    }

    // Format mobile if user typed numbers
    let formattedMobile = input;
    if (!formattedMobile.startsWith('+')) {
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    // Search user by email OR mobile
    const user = await User.findOne({
      $or: [
        { email: input.toLowerCase() },
        { mobile: input },
        { mobile: formattedMobile }
      ]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials. Please check your email/mobile and password.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      fullName: user.fullName || user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      wishlist: user.wishlist || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMe = async (req, res) => {
  res.json(req.user);
};

const toggleWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const index = user.wishlist.indexOf(propertyId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(propertyId);
    }
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist. Please enter the email you used during registration.' });
    }

    // Generate secure random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpires = otpExpire;
    user.otpAttempts = 0;
    user.otpVerified = false;
    await user.save();

    const emailSent = await sendOTPEmail(user.email, user.name, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }

    res.json({ message: 'OTP sent successfully to your registered email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (!user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: 'No OTP requested. Please request a new OTP.' });
    }

    // Check expiration
    if (user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    // Check max attempts
    if (user.otpAttempts >= 5) {
      // Invalidate OTP
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      user.otpAttempts += 1;
      
      if (user.otpAttempts >= 5) {
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save();
        return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
      }
      
      await user.save();
      return res.status(400).json({ message: `Invalid OTP. You have ${5 - user.otpAttempts} attempts remaining.` });
    }

    user.otpVerified = true;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist. Please enter the email you used during registration.' });
    }

    // Generate secure random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpires = otpExpire;
    user.otpAttempts = 0;
    user.otpVerified = false;
    await user.save();

    const emailSent = await sendOTPEmail(user.email, user.name, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }

    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Check if OTP was verified and is still valid (within 5 minutes expiry)
    if (!user.otpVerified || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired session. Please start over.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    
    // Clear reset OTP fields
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.otpAttempts = undefined;
    user.otpVerified = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendSignupOTP = async (req, res) => {
  try {
    const { email, mobile, fullName, username, password, role } = req.body;

    if (!mobile || !fullName) {
      return res.status(400).json({ message: 'Mobile number and Full Name are required.' });
    }

    // Auto-format mobile number to E.164 format
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    // Validate mobile existence
    const existingMobile = await User.findOne({ mobile: formattedMobile });
    if (existingMobile) {
      return res.status(400).json({ message: 'This mobile number is already registered.' });
    }

    // Optional email check
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(400).json({ message: 'This email is already registered.' });
      }
    }

    // Generate secure random 6-digit mobile OTP
    const mobileOtp = crypto.randomInt(100000, 999999).toString();
    const mobileHashedOtp = await bcrypt.hash(mobileOtp, 10);

    // Save/Overwrite OTP in DB
    await Otp.deleteOne({ mobile: formattedMobile });
    await Otp.create({
      mobile: formattedMobile,
      mobileHashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      resendCount: 0,
      verified: false
    });

    // Send mobile OTP
    const smsSent = await sendSignupOTPSMS(formattedMobile, mobileOtp);
    if (!smsSent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please check your mobile number and try again.' });
    }

    res.json({ message: 'Verification OTP sent successfully to mobile' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifySignupOTP = async (req, res) => {
  try {
    const { mobile, mobileOtp, firebaseVerified } = req.body;

    if (!mobile || !mobileOtp) {
      return res.status(400).json({ message: 'Please enter verification details' });
    }

    // Auto-format mobile number to E.164 format
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    const otpRecord = await Otp.findOne({ mobile: formattedMobile });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check expiration
    if (otpRecord.expiresAt < Date.now()) {
      await Otp.deleteOne({ mobile: formattedMobile });
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ mobile: formattedMobile });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // If verified on frontend via Firebase or using Test Code 123456
    if (firebaseVerified || mobileOtp === '123456') {
      otpRecord.verified = true;
      await otpRecord.save();
      return res.json({ message: 'OTP verified successfully' });
    }

    // Verify mobile OTP against backend DB
    const mobileMatch = await bcrypt.compare(mobileOtp, otpRecord.mobileHashedOtp);
    if (!mobileMatch) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ mobile: formattedMobile });
        return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
      }
      await otpRecord.save();
      return res.status(400).json({ message: `Invalid OTP. You have ${5 - otpRecord.attempts} attempts remaining.` });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const resendSignupOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    // Auto-format mobile number to E.164 format
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    const existingMobile = await User.findOne({ mobile: formattedMobile });
    if (existingMobile) {
      return res.status(400).json({ message: 'This mobile number is already registered.' });
    }

    const otpRecord = await Otp.findOne({ mobile: formattedMobile });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Session expired. Please register again.' });
    }

    if (otpRecord.resendCount >= 5) {
      return res.status(400).json({ message: 'Resend limit reached. Please register again later.' });
    }

    // Generate new mobile OTP
    const mobileOtp = crypto.randomInt(100000, 999999).toString();
    const mobileHashedOtp = await bcrypt.hash(mobileOtp, 10);

    otpRecord.mobileHashedOtp = mobileHashedOtp;
    otpRecord.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    otpRecord.attempts = 0;
    otpRecord.resendCount += 1;
    otpRecord.verified = false;
    await otpRecord.save();

    // Send mobile OTP
    const smsSent = await sendSignupOTPSMS(otpRecord.mobile, mobileOtp);
    if (!smsSent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }

    res.json({ message: 'A new OTP has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const { email, mobile, fullName, username, password, role } = req.body;

    if (!mobile || !fullName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Auto-format mobile number to E.164 format
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    const existingMobile = await User.findOne({ mobile: formattedMobile });
    if (existingMobile) {
      return res.status(400).json({ message: 'This mobile number is already registered.' });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(400).json({ message: 'This email is already registered.' });
      }
    }

    // Validate that the OTP is marked verified and not expired
    const otpRecord = await Otp.findOne({ mobile: formattedMobile });
    if (!otpRecord || !otpRecord.verified || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Verification session expired. Please verify your OTP again.' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password || 'dummy-password-not-used', 10);
    const normalizedRole = (role === 'Host' || role === 'host') ? 'host' : 'user';

    const user = await User.create({
      name: fullName,
      fullName: fullName,
      username: username ? username.trim() : undefined,
      email: normalizedEmail || undefined,
      mobile: formattedMobile,
      password: hashedPassword,
      role: normalizedRole,
      emailVerified: normalizedEmail ? true : false,
      phoneVerified: true,
      wishlist: [],
    });

    // Delete OTP record
    await Otp.deleteOne({ mobile: formattedMobile });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist || [],
      token: generateToken(user._id),
      message: 'Account created successfully. Welcome to Nestfinder!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendLoginOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Please provide your mobile number' });
    }

    // Auto-format mobile number to E.164 format
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    const user = await User.findOne({ mobile: formattedMobile });
    if (!user) {
      return res.status(400).json({ message: 'Mobile number is not registered. Please sign up first.' });
    }

    // Generate secure random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save/Overwrite OTP in DB
    await Otp.deleteOne({ mobile: formattedMobile });
    await Otp.create({
      mobile: formattedMobile,
      mobileHashedOtp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      resendCount: 0,
      verified: false
    });

    // Send OTP via SMS
    const smsSent = await sendSignupOTPSMS(formattedMobile, otp);
    if (!smsSent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please check your mobile number and try again.' });
    }

    res.json({ message: 'Login OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyLoginOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Please provide mobile number and OTP' });
    }

    // Auto-format mobile number to E.164 format
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
      if (/^\d{10}$/.test(formattedMobile)) {
        formattedMobile = `+91${formattedMobile}`;
      } else {
        formattedMobile = `+${formattedMobile}`;
      }
    }

    const otpRecord = await Otp.findOne({ mobile: formattedMobile });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP has expired or invalid request. Please request a new OTP.' });
    }

    // Check expiration
    if (otpRecord.expiresAt < Date.now()) {
      await Otp.deleteOne({ mobile: formattedMobile });
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ mobile: formattedMobile });
      return res.status(400).json({ message: 'Too many verification attempts. Please request a new OTP.' });
    }

    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.mobileHashedOtp);
    if (!isMatch) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ mobile: formattedMobile });
        return res.status(400).json({ message: 'Too many verification attempts. Please request a new OTP.' });
      }
      await otpRecord.save();
      return res.status(400).json({ message: `Invalid OTP. You have ${5 - otpRecord.attempts} attempts remaining.` });
    }

    // Find the user
    const user = await User.findOne({ mobile: formattedMobile });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Delete OTP record
    await Otp.deleteOne({ mobile: formattedMobile });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getMe, 
  toggleWishlist,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword,
  sendSignupOTP,
  verifySignupOTP,
  resendSignupOTP,
  signup,
  sendLoginOTP,
  verifyLoginOTP
};

