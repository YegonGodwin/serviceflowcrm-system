import Earnings from '../models/Earnings.js';
import { initiateB2CPayout } from '../utils/mpesa.js';

export const getEarnings = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'employee') {
            query.employee = req.user._id;
        }

        const earnings = await Earnings.find(query)
            .populate('employee', 'name email phone')
            .populate('invoice', 'invoiceNumber amount status')
            .populate('serviceRequest', 'title');

        // Calculate statistics
        const stats = {
            totalEarned: earnings.reduce((sum, e) => sum + e.commissionAmount, 0),
            pending: earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.commissionAmount, 0),
            available: earnings.filter(e => e.status === 'available').reduce((sum, e) => sum + e.commissionAmount, 0),
            withdrawn: earnings.filter(e => e.status === 'withdrawn').reduce((sum, e) => sum + e.commissionAmount, 0),
        };

        res.json({ earnings, stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const initiatePayout = async (req, res) => {
    try {
        const { id } = req.params;
        const earning = await Earnings.findById(id).populate('employee').populate('invoice');

        if (!earning) {
            return res.status(404).json({ message: 'Earning record not found' });
        }

        if (earning.status !== 'available') {
            return res.status(400).json({ message: `Cannot payout earning with status: ${earning.status}` });
        }

        const employeePhone = earning.employee.phone;
        if (!employeePhone) {
            return res.status(400).json({ message: 'Employee does not have a phone number set for M-Pesa' });
        }

        const payoutResponse = await initiateB2CPayout(
            employeePhone, 
            earning.commissionAmount, 
            earning.invoice ? `Payout for ${earning.invoice.invoiceNumber}` : 'Service Commission Payment'
        );

        if (payoutResponse.ResponseCode === '0') {
            // We store the ConversationID to track this payout in the callback
            earning.payoutReceiptNumber = payoutResponse.ConversationID; // Temporary store ConversationID
            await earning.save();
            res.json({ message: 'Payout initiated successfully', data: payoutResponse });
        } else {
            res.status(400).json({ message: 'Failed to initiate B2C Payout', data: payoutResponse });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const payoutCallback = async (req, res) => {
    try {
        const { Result } = req.body;
        if (!Result) return res.status(400).send('Invalid callback');

        const { ResultCode, ResultDesc, OriginatorConversationID, ConversationID, TransactionID } = Result;

        console.log(`B2C Payout Callback: ${ResultDesc} (Code: ${ResultCode})`);

        if (ResultCode === 0) {
            // Find earning by ConversationID (which we stored in payoutReceiptNumber temporarily)
            const earning = await Earnings.findOne({ payoutReceiptNumber: ConversationID });
            
            if (earning) {
                earning.status = 'withdrawn';
                earning.payoutDate = new Date();
                earning.payoutReceiptNumber = TransactionID; // Store actual M-Pesa Receipt Number
                await earning.save();
                console.log(`Earnings ${earning._id} marked as withdrawn.`);
            }
        }
        
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        console.error('B2C Callback Processing Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};
