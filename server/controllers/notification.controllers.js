import cron from 'node-cron';
import { ProductModel, NotificationModel } from '../models/Product.models.js';
import { sendError, sendSuccess } from '../utils/apiResponses.js';

export const runDailyNotificationJob = () => {
    cron.schedule('50 15 * * *', async () => {
        console.log("🔔 Daily expiry and expired check running...");

        const today = new Date();
        const todayDate = new Date(today.toDateString());

        try {
            const products = await ProductModel.find();

            if (!products || products.length === 0) {
                console.log("🚫 No products found.");
                return;
            }

            for (const product of products) {
                // Skip if already confirmed 
                if (product.confirmed) continue;

                const expDate = new Date(product.expDate.toDateString());

                const existingUnread = await NotificationModel.findOne({
                    productId: product._id,
                    read: false,
                });

                if (!existingUnread) {
                    let message = '';
                    let type = '';

                    if (expDate < todayDate) {
                        message = `❌ ALERT: "${product.productName}" expired on ${expDate.toDateString()}`;
                        type = 'expired';
                    } else {
                        message = `⏰ Reminder: "${product.productName}" will expire on ${expDate.toDateString()}`;
                        type = 'reminder';
                    }

                    await NotificationModel.create({
                        userId: product.userId,
                        productId: product._id,
                        message,
                        type,
                    });

                    //  console.log(`✅ Notification (${type}) created for: ${product.productName}`);
                } else {
                    // console.log(`ℹ️ Unread notification already exists for: ${product.productName}`);
                }
            }


            //delete notiifications whivh is of more than 15 days

            const fifteenDays = new Date();
            fifteenDays.setDate(fifteenDays.getDate() - 15);
            const result = await NotificationModel.deleteMany({
                date: { $lt: fifteenDays }
            });
            if (!result) {
                sendError(res, "Notifications not not deleted", 500);
            }
            //  console.log(`🗑️ Deleted ${result.deletedCount} old notifications`);

        } catch (err) {
            console.error("❌ Cron job error:", err.message);
        }
    });
};


export const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const notifications = await NotificationModel.find({ userId }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (err) {
        console.error("❌ Error fetching notifications:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    runDailyNotificationJob,
};
