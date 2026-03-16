import mongoose from 'mongoose';

const connectDB = async () =>{
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected on: ${connect.connection.host}`);        
    }
    catch(error){
        console.log(`Error ${error.message}`);
        throw error;
    }
}

export default connectDB;