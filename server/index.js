import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import earningsRoutes from './routes/earningsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { initScheduler } from './utils/scheduler.js';

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

//middleware configuration

app.use(cors());
app.use(express.json());

//route configure
app.get('/', (_req, res) =>{
    res.status(200).json({
        message: 'Server is alive'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/notifications', notificationRoutes);

const StartMongoServer = async () => {
    try{
        await connectDB();
        
        // Initialize scheduler
        initScheduler();

        app.listen(port, () =>{
            console.log(`Server is running on http://localhost:${port}`);
        });
    }
    catch(error){
        console.error(`error: ${error.message}`);
        process.exit(1);
    }
}

StartMongoServer();
