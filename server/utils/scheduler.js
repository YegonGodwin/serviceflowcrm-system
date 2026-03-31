import cron from 'node-cron';
import Contract from '../models/Contract.js';
import Notification from '../models/Notification.js';

const checkContractExpiries = async () => {
    console.log('Running daily contract expiry check...');
    try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        // 1. Check for contracts that just expired
        const expiredContracts = await Contract.find({
            status: 'active',
            endDate: { $lt: today }
        });

        for (const contract of expiredContracts) {
            contract.status = 'expired';
            await contract.save();

            // Create notification if not already notified
            const existingNotification = await Notification.findOne({
                user: contract.client,
                type: 'contract_overdue',
                'metadata.contractId': contract._id,
                createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
            });

            if (!existingNotification) {
                await Notification.create({
                    user: contract.client,
                    type: 'contract_overdue',
                    message: `Your contract "${contract.title}" has expired. Please contact us for renewal.`,
                    metadata: { contractId: contract._id }
                });
            }
        }

        // 2. Check for contracts expiring in the next 7 days
        const expiringSoonContracts = await Contract.find({
            status: 'active',
            endDate: { $gte: today, $lte: nextWeek }
        });

        for (const contract of expiringSoonContracts) {
            // Check if notified in the last 7 days to avoid spamming
            const existingNotification = await Notification.findOne({
                user: contract.client,
                type: 'contract_expiry',
                'metadata.contractId': contract._id,
                createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });

            if (!existingNotification) {
                const daysLeft = Math.ceil((contract.endDate - today) / (1000 * 60 * 60 * 24));
                await Notification.create({
                    user: contract.client,
                    type: 'contract_expiry',
                    message: `Your contract "${contract.title}" will expire in ${daysLeft} days.`,
                    metadata: { contractId: contract._id }
                });
            }
        }
    } catch (error) {
        console.error('Error in contract expiry check:', error);
    }
};

export const initScheduler = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', checkContractExpiries);
    
    // Also run once on startup
    checkContractExpiries();
};