const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref:"product", required: true },
    quantity:{type:Number},
    startDate:{type:Date},
    frequencyDates:[Date],
    user:{type:Schema.Types.ObjectId, ref:"user"},
    created_by:{type:Schema.Types.ObjectId, ref:"user"}
},
{versionKey:false});

module.exports = mongoose.model('subscription', subscriptionSchema);
