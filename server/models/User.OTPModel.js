import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const OtpSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        email: { type: String, required: true, index: true },
        code: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        used: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const OTPModel = models.OTP || model('OTP', OtpSchema);
