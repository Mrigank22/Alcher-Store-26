import mongoose, {Schema ,model,models} from "mongoose";


const CartItemSchema = new Schema(
    {
        product:{type:Schema.Types.ObjectId,ref:"Product",required:true},
        size:{type:String},
        colour:{type:String},
        quantity :{type: Number, required:true,min:1,default: 1},
        price:{ type:Number,required:true}
    },
)

const CartSchema = new Schema(
    {
        user_email: {type: String,required: true,unique: true,index: true},
        items:{type:[CartItemSchema],default:[]},
        total_quantity:{type:Number,default:0},
        total_price:{type:Number,default:0},
    },
    {timestamps:true}
);


export default models.Cart || mongoose.model("Cart",CartSchema);