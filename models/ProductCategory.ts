import mongoose, { Schema } from "mongoose";

const ProductCategory = new Schema(
    {
        name:{type:String,required:true,unique:true},

        field_required:{
            size:{type:Boolean,default:false},
            colour:{type: Boolean,default : false},
        },

        products:[
            {type:Schema.Types.ObjectId,ref:"Product"},
        ],
    },
    {timestamps : true}
);

export default mongoose.models.ProductCategory || mongoose.model("ProductCategory",ProductCategory)