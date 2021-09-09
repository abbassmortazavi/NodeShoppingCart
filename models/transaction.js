let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let transactionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    cardName: {
        type: String,
        required: true
    },
    cardExpireMonth: {
        type: Number,
        required: true
    },
    cardExpireYear: {
        type: Number,
        required: true
    },
    cvc: {
        type: Number,
        required: true
    },
    user:{
      type:Schema.Types.ObjectId ,
      ref:'User'
    },
    cart:{
      type:Object,
      required:true
    },
    status: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    resId: {
        type: Number,
        default: 0
    },
});


module.exports = mongoose.model('Transaction' , transactionSchema);
