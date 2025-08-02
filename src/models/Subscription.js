import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: [true, "Must provide a user id"],
    },
    subscription_type: {
        type: String,
        required: [true, "Must be provide subscription type"]
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'pending'
    },
    transaction_id: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Validate if schema already created then not create use previous one
const Subscription = mongoose.models.subscriptions || mongoose.model('subscriptions', SubscriptionSchema);

export default Subscription;
