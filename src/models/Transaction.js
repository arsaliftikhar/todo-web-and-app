import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: [true, "Must provide a user id"],
    },
    amount: {
        type: Number,
        required: [true,"Must be provide an amount"]
    },
    transaction_type: {
        type: String,
        enum: ['income', 'expense'],
        default: null
    },
    description: {
        type: String,
        required: [true, "Must be provide description"],
        default: null
    },
}, {
    timestamps: true
});

// Validate if schema already created then not create use previous one
const Transaction = mongoose.models.transactions || mongoose.model('transactions', TransactionSchema);

export default Transaction;
