import Tesseract from 'tesseract.js';
import { ProductModel } from '../models/Product.models.js';
import { sendError } from '../utils/apiResponses.js';
// import { scheduleNotification } from '../utils/scheduleNotification.js';

const shelfLifeMap = {
    milk: 7,
    bread: 5,
    juice: 30,
    paneer: 4,
    curd: 7,
    cheese: 30,
    butter: 45,
};

const AddViaOCR = async (req, res) => {
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

        return res.status(200).json({
            success: true,
            productName,
            mfgDate,
            expDate,
            imageUrl: saveProduct.imageUrl,
        });

    } catch (err) {
        console.error("❌ OCR Error:", err);
        return res.status(500).json({
            success: false,
            message: "OCR processing failed",
            error: err.message,
        });
    }
};

export default AddViaOCR;
