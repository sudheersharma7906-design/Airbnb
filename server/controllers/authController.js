const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail, sendSignupOTPEmail } = require('../utils/emailService');
const { sendSignupOTPSMS } = require('../utils/smsService');

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userRole = role === 'host' ? 'host' : 'user';
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: userRole,
    });

    res.status(201).json({
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

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

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

    // Validate email format and existence
    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'This email is already registered. Please log in or use another email.' });
    }

    // Auto-format mobile number to E.164 format
    let formattedMobile = mobile ? mobile.trim() : undefined;
    if (formattedMobile) {
      if (!formattedMobile.startsWith('+')) {
        if (/^\d{10}$/.test(formattedMobile)) {
          formattedMobile = `+91${formattedMobile}`;
        } else {
          formattedMobile = `+${formattedMobile}`;
        }
      }
    }

    // Validate mobile existence
    if (formattedMobile) {
      const existingMobile = await User.findOne({ mobile: formattedMobile });
      if (existingMobile) {
        return res.status(400).json({ message: 'This mobile number is already registered.' });
      }
    }

    // Generate secure random 6-digit email OTP
    const emailOtp = crypto.randomInt(100000, 999999).toString();
    const emailHashedOtp = await bcrypt.hash(emailOtp, 10);

    // Generate secure random 6-digit mobile OTP if mobile is provided
    let mobileOtp;
    let mobileHashedOtp;
    if (formattedMobile) {
      mobileOtp = crypto.randomInt(100000, 999999).toString();
      mobileHashedOtp = await bcrypt.hash(mobileOtp, 10);
    }

    // Save/Overwrite OTP in DB
    await Otp.deleteOne({ email: normalizedEmail });
    await Otp.create({
      email: normalizedEmail,
      mobile: formattedMobile,
      emailHashedOtp,
      mobileHashedOtp: formattedMobile ? mobileHashedOtp : undefined,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      resendCount: 0,
      verified: false
    });

    // Send email OTP
    const emailSent = await sendSignupOTPEmail(normalizedEmail, emailOtp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }

    // Send mobile OTP
    if (formattedMobile) {
      await sendSignupOTPSMS(formattedMobile, mobileOtp);
    }

    res.json({ message: 'Verification OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifySignupOTP = async (req, res) => {
  try {
    const { email, emailOtp, mobileOtp } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check expiration
    if (otpRecord.expiresAt < Date.now()) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify email OTP
    const emailMatch = await bcrypt.compare(emailOtp, otpRecord.emailHashedOtp);
    if (!emailMatch) {
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ email: normalizedEmail });
        return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
      }
      await otpRecord.save();
      return res.status(400).json({ message: `Invalid Email OTP. You have ${5 - otpRecord.attempts} attempts remaining.` });
    }

    // Verify mobile OTP if record has mobileHashedOtp
    if (otpRecord.mobileHashedOtp) {
      if (!mobileOtp) {
        return res.status(400).json({ message: 'Please enter the verification code sent to your mobile.' });
      }
      const mobileMatch = await bcrypt.compare(mobileOtp, otpRecord.mobileHashedOtp);
      if (!mobileMatch) {
        otpRecord.attempts += 1;
        if (otpRecord.attempts >= 5) {
          await Otp.deleteOne({ email: normalizedEmail });
          return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
        }
        await otpRecord.save();
        return res.status(400).json({ message: `Invalid Mobile OTP. You have ${5 - otpRecord.attempts} attempts remaining.` });
      }
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
    const { email } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Session expired. Please register again.' });
    }

    if (otpRecord.resendCount >= 5) {
      return res.status(400).json({ message: 'Resend limit reached. Please register again later.' });
    }

    // Generate new email OTP
    const emailOtp = crypto.randomInt(100000, 999999).toString();
    const emailHashedOtp = await bcrypt.hash(emailOtp, 10);

    // Generate new mobile OTP if mobile was provided
    let mobileOtp;
    let mobileHashedOtp;
    if (otpRecord.mobile) {
      mobileOtp = crypto.randomInt(100000, 999999).toString();
      mobileHashedOtp = await bcrypt.hash(mobileOtp, 10);
    }

    otpRecord.emailHashedOtp = emailHashedOtp;
    if (otpRecord.mobile) {
      otpRecord.mobileHashedOtp = mobileHashedOtp;
    }
    otpRecord.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    otpRecord.attempts = 0;
    otpRecord.resendCount += 1;
    otpRecord.verified = false;
    await otpRecord.save();

    // Send new OTPs
    await sendSignupOTPEmail(otpRecord.email, emailOtp);
    if (otpRecord.mobile) {
      await sendSignupOTPSMS(otpRecord.mobile, mobileOtp);
    }

    res.json({ message: 'A new OTP has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const { email, mobile, fullName, username, password, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check MongoDB unique constraints again
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'This email is already registered. Please log in or use another email.' });
    }

    // Auto-format mobile number to E.164 format
    let formattedMobile = mobile ? mobile.trim() : undefined;
    if (formattedMobile) {
      if (!formattedMobile.startsWith('+')) {
        if (/^\d{10}$/.test(formattedMobile)) {
          formattedMobile = `+91${formattedMobile}`;
        } else {
          formattedMobile = `+${formattedMobile}`;
        }
      }
    }

    if (formattedMobile) {
      const existingMobile = await User.findOne({ mobile: formattedMobile });
      if (existingMobile) {
        return res.status(400).json({ message: 'This mobile number is already registered.' });
      }
    }

    // Validate that the OTP is marked verified and not expired
    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord || !otpRecord.verified || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Verification session expired. Please verify your OTP again.' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = (role === 'Host' || role === 'host') ? 'host' : 'user';

    const user = await User.create({
      name: fullName,
      fullName: fullName,
      username: username ? username.trim() : undefined,
      email: normalizedEmail,
      mobile: formattedMobile,
      password: hashedPassword,
      role: normalizedRole,
      emailVerified: true,
      phoneVerified: formattedMobile ? true : false,
      wishlist: [],
    });

    // Delete OTP record
    await Otp.deleteOne({ email: normalizedEmail });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist || [],
      token: generateToken(user._id),
      message: 'Account created successfully. Welcome to Airbnb!',
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
  signup
};

