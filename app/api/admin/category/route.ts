import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import ProductCategory from "../../../../models/ProductCategory";

export async function GET(){
    await connectDB();
    const categories = await ProductCategory.find().populate("products").sort({createdAt :-1});

    return NextResponse.json(categories);
}


export async function POST(req:Request){
    await connectDB();

    const data = await req.json();

    const category = await ProductCategory.create(data);
    return NextResponse.json(category);
}
