import Invoice from '../models/Invoice.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Earnings from '../models/Earnings.js';
import { initiateSTKPush } from '../utils/mpesa.js';

// Helper function to attribute commission to an employee
const attributeCommission = async (invoice) => {
    try {
        // Only attribute if it's linked to a service request
        if (!invoice.serviceRequest) return;

        const serviceRequest = await ServiceRequest.findById(invoice.serviceRequest);
        if (!serviceRequest || !serviceRequest.assignedTo) {
            console.log(`No employee assigned to service request ${invoice.serviceRequest}. Skipping commission.`);
            return;
        }

        // Check if earnings already attributed for this invoice
        const existingEarnings = await Earnings.findOne({ invoice: invoice._id });
        if (existingEarnings) {
            console.log(`Earnings already attributed for invoice ${invoice.invoiceNumber}.`);
            return;
        }

        const commissionPercentage = 100; // Employees receive 100% of the invoice amount
        const commissionAmount = (invoice.amount * commissionPercentage) / 100;

        await Earnings.create({
            employee: serviceRequest.assignedTo,
            invoice: invoice._id,
            serviceRequest: serviceRequest._id,
            totalAmount: invoice.amount,
            commissionAmount: commissionAmount,
            commissionPercentage: commissionPercentage,
            status: 'available' // Mark as available since payment is confirmed
        });

        console.log(`Full payment of ${commissionAmount} attributed to employee ${serviceRequest.assignedTo} for invoice ${invoice.invoiceNumber}.`);
    } catch (error) {
        console.error('Error attributing commission:', error.message);
    }
};

export const createInvoice = async (req, res) => {
    const { client, serviceRequest, contract, invoiceNumber, amount, dueDate } = req.body;

    const invoice = await Invoice.create({
        client,
        serviceRequest,
        contract,
        invoiceNumber,
        amount,
        dueDate,
    });

    if (invoice) {
        res.status(201).json(invoice);
    } else {
        res.status(400).json({ message: 'Invalid invoice data' });
    }
};

export const getInvoices = async (req, res) => {
    let query = {};
    if (req.user.role === 'client') {
        query.client = req.user._id;
    }

    const invoices = await Invoice.find(query).populate('client', 'name email companyName phone').populate('serviceRequest', 'title').populate('contract', 'title');
    res.json(invoices);
};

export const updateInvoiceStatus = async (req, res) => {
    const { status, paymentDate, paymentMethod } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (invoice) {
        invoice.status = status || invoice.status;
        invoice.paymentDate = paymentDate || invoice.paymentDate;
        invoice.paymentMethod = paymentMethod || invoice.paymentMethod;

        const updatedInvoice = await invoice.save();
        
        // If manually marked as paid, attribute commission
        if (updatedInvoice.status === 'paid') {
            await attributeCommission(updatedInvoice);
        }

        res.json(updatedInvoice);
    } else {
        res.status(404).json({ message: 'Invoice not found' });
    }
};

export const payInvoice = async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (invoice) {
        if (invoice.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to pay this invoice' });
        }

        invoice.status = 'paid';
        invoice.paymentDate = new Date();
        invoice.paymentMethod = req.body.paymentMethod || 'mpesa';

        const updatedInvoice = await invoice.save();
        
        // Attribute commission on successful payment
        await attributeCommission(updatedInvoice);

        res.json(updatedInvoice);
    } else {
        res.status(404).json({ message: 'Invoice not found' });
    }
};

export const initiateMpesaPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone } = req.body;

        const invoice = await Invoice.findById(id).populate('client');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found in database' });
        }

        const phoneNumber = phone || (invoice.client && invoice.client.phone);
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required for M-Pesa payment' });
        }

        const mpesaResponse = await initiateSTKPush(phoneNumber, invoice.amount, invoice.invoiceNumber);
        
        if (mpesaResponse && mpesaResponse.ResponseCode === '0') {
            invoice.mpesaCheckoutRequestID = mpesaResponse.CheckoutRequestID;
            await invoice.save();
            return res.json({ message: 'STK Push initiated successfully', data: mpesaResponse });
        } else {
            return res.status(400).json({ message: 'Failed to initiate STK Push', data: mpesaResponse });
        }
    } catch (error) {
        console.error('STK Push Error:', error.message);
        return res.status(500).json({ message: 'Internal server error during M-Pesa initiation', error: error.message });
    }
};

export const mpesaCallback = async (req, res) => {
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
        return res.status(400).send('Invalid callback data');
    }

    const {
        MerchantRequestID,
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
        CallbackMetadata
    } = Body.stkCallback;

    console.log(`M-Pesa Callback received: ${ResultDesc} (ResultCode: ${ResultCode})`);

    if (ResultCode === 0) {
        const invoice = await Invoice.findOne({ mpesaCheckoutRequestID: CheckoutRequestID });

        if (invoice) {
            invoice.status = 'paid';
            invoice.paymentDate = new Date();
            invoice.paymentMethod = 'mpesa';

            // Extract Receipt Number
            const receiptItem = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
            if (receiptItem) {
                invoice.mpesaReceiptNumber = receiptItem.Value;
            }

            const updatedInvoice = await invoice.save();
            
            // Attribute commission on successful callback
            await attributeCommission(updatedInvoice);

            console.log(`Invoice ${invoice.invoiceNumber} marked as paid via M-Pesa.`);
        }
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
};
