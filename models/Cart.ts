import mongoose, {Schema ,model,models} from "mongoose";


const CartItem = new Schema(
    {
        product:{type:Schema.Types.ObjectId,ref:"Product",required:true},
        size:{type:String},
        colour:{type:String},
        quantity :{type: Number, required:true,min:1,default: 1},
        price:{ type:Number,required:true}
    },
)

const Cart = new Schema(
    {
        user_email: {type: String,required: true,unique: true,index: true,lowercase:true},
        items:{type:[CartItem],default:[]},
        total_quantity:{type:Number,default:0},
        total_price:{type:Number,default:0},
    },
    {timestamps:true}
);


export default models.Cart || mongoose.model("Cart",Cart);