import Earnings from '../models/Earnings.js';
import Payroll from '../models/Payroll.js';
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

// Payroll Logic
export const generateMonthlyPayroll = async (req, res) => {
    try {
        const { month, year } = req.body; // e.g., month: 3, year: 2026
        
        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        // Find all available earnings for that month/year
        // We look for earnings created in that period
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const availableEarnings = await Earnings.find({
            status: 'available',
            createdAt: { $gte: startDate, $lte: endDate }
        });

        if (availableEarnings.length === 0) {
            return res.status(404).json({ message: 'No available earnings found for this period' });
        }

        // Group by employee
        const employeeEarnings = {};
        availableEarnings.forEach(earn => {
            if (!employeeEarnings[earn.employee]) {
                employeeEarnings[earn.employee] = {
                    total: 0,
                    earningsIds: []
                };
            }
            employeeEarnings[earn.employee].total += earn.commissionAmount;
            employeeEarnings[earn.employee].earningsIds.push(earn._id);
        });

        const payrolls = [];
        for (const employeeId in employeeEarnings) {
            try {
                const payroll = await Payroll.findOneAndUpdate(
                    { employee: employeeId, month, year },
                    {
                        earnings: employeeEarnings[employeeId].earningsIds,
                        totalAmount: employeeEarnings[employeeId].total,
                        status: 'pending'
                    },
                    { upsert: true, new: true }
                );
                payrolls.push(payroll);
            } catch (err) {
                console.error(`Error creating payroll for employee ${employeeId}:`, err.message);
            }
        }

        res.json({ message: 'Monthly payroll generated successfully', count: payrolls.length, payrolls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPayrolls = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'employee') {
            query.employee = req.user._id;
        }

        const { month, year } = req.query;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        const payrolls = await Payroll.find(query)
            .populate('employee', 'name email phone position department')
            .populate({
                path: 'earnings',
                populate: { path: 'serviceRequest', select: 'title' }
            })
            .sort({ year: -1, month: -1 });

        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const executePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findById(id).populate('employee');

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        if (payroll.status === 'paid' || payroll.status === 'processing') {
            return res.status(400).json({ message: `Payroll already ${payroll.status}` });
        }

        const employeePhone = payroll.employee.phone;
        if (!employeePhone) {
            return res.status(400).json({ message: 'Employee does not have a phone number set for M-Pesa' });
        }

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const remarks = `Salary/Commission for ${monthNames[payroll.month - 1]} ${payroll.year}`;

        const payoutResponse = await initiateB2CPayout(
            employeePhone, 
            payroll.totalAmount, 
            remarks
        );

        if (payoutResponse.ResponseCode === '0') {
            // Store ConversationID to track this payout in the callback
            payroll.status = 'processing';
            payroll.payoutReceiptNumber = payoutResponse.ConversationID; 
            await payroll.save();
            res.json({ message: 'Monthly payout initiated successfully', data: payoutResponse });
        } else {
            res.status(400).json({ message: 'Failed to initiate M-Pesa B2C Payout', data: payoutResponse });
        }
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

        const { ResultCode, ResultDesc, ConversationID, TransactionID } = Result;

        console.log(`B2C Payout Callback: ${ResultDesc} (Code: ${ResultCode})`);

        if (ResultCode === 0) {
            // Check if it's a Payroll payout
            const payroll = await Payroll.findOne({ payoutReceiptNumber: ConversationID });
            if (payroll) {
                payroll.status = 'paid';
                payroll.payoutDate = new Date();
                payroll.payoutReceiptNumber = TransactionID;
                await payroll.save();

                // Mark all associated earnings as withdrawn
                await Earnings.updateMany(
                    { _id: { $in: payroll.earnings } },
                    { 
                        status: 'withdrawn', 
                        payoutDate: new Date(),
                        payoutReceiptNumber: TransactionID
                    }
                );
                console.log(`Payroll ${payroll._id} and its earnings marked as paid.`);
                return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
            }

            // Check if it's an individual Earning payout (fallback)
            const earning = await Earnings.findOne({ payoutReceiptNumber: ConversationID });
            if (earning) {
                earning.status = 'withdrawn';
                earning.payoutDate = new Date();
                earning.payoutReceiptNumber = TransactionID;
                await earning.save();
                console.log(`Individual Earning ${earning._id} marked as withdrawn.`);
                return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
            }
        } else {
            // Handle failure
            const payroll = await Payroll.findOne({ payoutReceiptNumber: ConversationID });
            if (payroll) {
                payroll.status = 'failed';
                payroll.remarks = ResultDesc;
                await payroll.save();
            }
        }
        
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Callback received' });
    } catch (error) {
        console.error('B2C Callback Processing Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};
