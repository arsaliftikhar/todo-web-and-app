import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Must be provide an email"],
        unique: [true, "Must be unique"]
    },
    password: {
        type: String,
        required: [true, "Must be provide a password"]
    }
}, {
    timestamps: true
});

// Validate if schema already created then not create use previous one
const User = mongoose.models.users || mongoose.model('users', UserSchema);

export default User;
