import mongoose from 'mongoose';

export default async function connectDB() {

    try {
        const { connection } = await mongoose.connect(process.env.MONGO_DB_URL, {
            dbName: "todo-web-and-app"
        });

        console.log("Database connected:");

    }
    catch (e) {
        console.error('Error connecting to database:', e.message);
    }
}





