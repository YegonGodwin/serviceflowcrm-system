import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const getAccessToken = async () => {
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching M-Pesa access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get M-Pesa access token');
    }
};

export const initiateSTKPush = async (phoneNumber, amount, invoiceNumber) => {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const shortcode = process.env.SHORTCODE;
    const passkey = process.env.PASSKEY;
    const callbackUrl = process.env.CALLBACK_URL;

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // Ensure phone number is in format 2547XXXXXXXX
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.slice(1)}`;
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
        formattedPhone = `254${formattedPhone}`;
    }

    const requestBody = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: invoiceNumber,
        TransactionDesc: `Payment for invoice ${invoiceNumber}`,
    };

    try {
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Safaricom API Error:', error.response.status, error.response.data);
        } else {
            console.error('Error initiating M-Pesa STK Push:', error.message);
        }
        throw new Error('Failed to initiate M-Pesa payment');
    }
};

// Business to Customer (B2C) - Send money to employees
export const initiateB2CPayout = async (phoneNumber, amount, remarks) => {
    const accessToken = await getAccessToken();
    const shortcode = process.env.SHORTCODE;
    const initiatorName = process.env.INITIATOR_NAME || 'testapi';
    const securityCredential = process.env.SECURITY_CREDENTIAL; // This must be encrypted using the public certificate
    const resultUrl = process.env.CALLBACK_URL; // Or a specific B2C result URL

    // Ensure phone number is in format 2547XXXXXXXX
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.slice(1)}`;
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
        formattedPhone = `254${formattedPhone}`;
    }

    const requestBody = {
        InitiatorName: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: 'SalaryPayment', // Options: SalaryPayment, BusinessPayment, PromotionPayment
        Amount: Math.round(amount),
        PartyA: shortcode,
        PartyB: formattedPhone,
        Remarks: remarks || 'Service Commission Payment',
        QueueTimeOutURL: resultUrl,
        ResultURL: resultUrl,
        Occasion: 'ServiceFlow Payment',
    };

    try {
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Safaricom B2C API Error:', error.response.status, error.response.data);
        } else {
            console.error('Error initiating M-Pesa B2C Payout:', error.message);
        }
        throw new Error('Failed to initiate employee payout via M-Pesa');
    }
};
