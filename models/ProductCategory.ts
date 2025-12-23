import mongoose, { Schema, models } from "mongoose";

const ProductCategorySchema = new Schema(
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

export default models.ProductCategory || mongoose.model("ProductCategory",ProductCategorySchema)