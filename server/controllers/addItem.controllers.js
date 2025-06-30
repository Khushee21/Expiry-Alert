import Tesseract from 'tesseract.js';
import { ProductModel } from '../models/Product.models.js';
import { sendError, sendSuccess } from '../utils/apiResponses.js';
// import { scheduleNotification } from '../utils/scheduleNotification.js';
import sharp from 'sharp';

const shelfLifeMap = {
    milk: 7,
    bread: 5,
    juice: 30,
    paneer: 4,
    curd: 7,
    cheese: 30,
    butter: 45,
};


//1. using Camera OCR
export const AddViaOCR = async (req, res) => {
    try {
        const image = req.file;
        const userId = req.user?.id?.userId || null;
        const productName = req.body?.productName?.trim().toLowerCase() || 'unknown';

        console.log("🔍 Product Name:", productName);
        console.log("🖼️ Uploaded Image Info:", image);
        console.log("👤 User ID:", req.user);

        if (!image) return sendError(res, 'No image uploaded', 400);
        if (!userId) return sendError(res, 'User not authenticated', 401);

        const normalizedPath = image.path.replace(/\\/g, '/');
        console.log("🛣️ Normalized image path:", normalizedPath);

        // OCR processing
        const result = await Tesseract.recognize(normalizedPath, 'eng', {
            logger: m => console.log("📄 OCR Progress:", m),
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:/.- ',
            preserve_interword_spaces: 1,
        });

        const text = result.data.text;
        console.log("📃 OCR Extracted Text:\n", text);

        // Date matching
        const digitDateRegex = /\d{2}[-/]\d{2}[-/]\d{4}/g;
        const altDateRegex = /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[ ]*\/[ ]*(\d{4})/gi;
        const dateMatches = text.match(digitDateRegex);
        const altMatches = [...text.matchAll(altDateRegex)];
        const mfgMatch = text.match(/(MFG|Manufacture\s*Date)[:.]?\s*([A-Z]{3,4})\s*[\/.-]?\s*(\d{4})/i);
        const expMatch = text.match(/(EXP|Use\s*by\s*Date)[:.]?\s*([A-Z]{3,4})\s*[\/.-]?\s*(\d{4})/i);

        console.log("📅 Date Matches:", dateMatches);
        console.log("📅 Alt Matches:", altMatches);
        console.log("🧪 MFG Match:", mfgMatch);
        console.log("🧪 EXP Match:", expMatch);

        let mfgDate = null;
        let expDate = null;

        if (mfgMatch) mfgDate = new Date(`${mfgMatch[2]} 1, ${mfgMatch[3]}`);
        else if (dateMatches?.[0]) mfgDate = new Date(dateMatches[0]);
        else if (altMatches.length > 0) {
            const [month, year] = altMatches[0].slice(1);
            mfgDate = new Date(`${month} 1, ${year}`);
        }

        if (expMatch) expDate = new Date(`${expMatch[2]} 1, ${expMatch[3]}`);
        else if (dateMatches?.[1]) expDate = new Date(dateMatches[1]);
        else if (altMatches.length > 1) {
            const [month, year] = altMatches[1].slice(1);
            expDate = new Date(`${month} 1, ${year}`);
        }

        console.log("📌 Parsed MFG Date:", mfgDate);
        console.log("📌 Parsed EXP Date:", expDate);

        // Estimate expiry using shelf life if needed
        if (!expDate && mfgDate && shelfLifeMap[productName]) {
            const shelfDays = shelfLifeMap[productName];
            expDate = new Date(mfgDate);
            expDate.setDate(expDate.getDate() + shelfDays);
            console.log(`🧮 Estimated EXP Date (via shelf life of ${shelfDays} days):`, expDate);
        }

        const saveProduct = await ProductModel.create({
            userId,
            productName,
            mfgDate,
            expDate,
            imageUrl: image.path,
        });

        console.log("✅ Product Saved:", saveProduct);

        return sendSuccess(res, saveProduct, 200);

    } catch (err) {
        console.error("❌ OCR Error:", err);
        return sendError(res, "OCR ERROR : " || err, 500);
    }
};



//2. manually
export const AddManually = async (req, res) => {
    try {
        const { mfgDate, expDate, productName } = req.body;
        const userId = req.user?.id?.userId || null;

        if (!productName || !mfgDate || !expDate) {
            return sendError(res, "Items are missing", 400);
        }

        if (!userId) {
            return sendError(res, "User not authenticated", 401);
        }

        const saveProduct = await ProductModel.create({
            userId,
            productName: productName.trim().toLowerCase(),
            mfgDate: new Date(mfgDate),
            expDate: new Date(expDate),
            imageUrl: null, // manual entry has no image
        });

        if (!saveProduct) {
            return sendError(res, "Error saving product", 500);
        }

        return sendSuccess(res, saveProduct, 200);

    } catch (err) {
        console.log("Manual form adding error:", err);
        return sendError(res, err.message || "Manual form adding error", 500);
    }
};


//get items
export const getAllProducts = async (req, res) => {
    try {
        const userId = req.user?.id?.userId;

        if (!userId) {
            return sendError(res, {}, "User not authenticated", 400);
        }

        const items = await ProductModel.find({ userId });

        if (items.length === 0) {
            return sendSuccess(res, [], "No items found", 200);
        }

        return sendSuccess(res, items, "Items fetched successfully", 200);
    } catch (err) {
        console.log("Error Fetching Items:", err);
        return sendError(res, {}, "Error Fetching Items", 500);
    }
};
