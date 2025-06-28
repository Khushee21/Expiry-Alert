import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    productName: {
        type: String
    },
    mfgDate: {
        type: Date,
    },
    expDate: {
        type: Date,
    },
    imageUrl: {
        type: String
    },
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
})


const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: String,
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

export const Notification = mongoose.model("Notification", notificationSchema);

export const ProductModel = mongoose.model("Product", ProductSchema);