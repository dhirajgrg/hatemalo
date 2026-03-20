import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/db/db.js';

const PORT = process.env.PORT || 5000;

const initServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🚀🚀🚀`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

initServer();