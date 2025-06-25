import { OTPModel } from '../models/User.OTPModel'
import { sendMail } from './email';

const OTP_LENGTH = 6;
const EXPIRY_MINUTES = 10;

export async function generateAndSendOtp(email, userId) {

    //generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60000);
    //store in db 
    const otp = await OTPModel.create({ email, userId, code, expiresAt });

    const html = `<p>Your verification code for EXPIRY ALERT is <b>${code}</b>. It expires in ${EXPIRY_MINUTES} minutes.</p>`;

    // Send email always (or conditionally if needed)
    await sendMail(email, 'Your OTP CODE', html)
        .then(() => console.log('Email sent!'))
        .catch(console.error);

    return otp;
}

//verify code

export async function verifyOTP(email, code) {
    const otp = await OTPModel.findOne({ email, code, used: false });
    if (!otp) throw new Error('Invalid OTP');
    if (otp.expiresAt < new Date()) throw new Error('OTP expired');

    otp.used = true;
    await otp.save();

    return otp;
}