import mongoose from "mongoose";
const { model, models, Schema } = mongoose;

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    userDataId: { type: Schema.Types.ObjectId, ref: "UserProfile" },
    refreshTokens: { type: [String], default: [] },
    activeSession: { type: String, default: null },
}, {
    timestamps: true
});

export const UserModel = models.User || model("User", UserSchema);
