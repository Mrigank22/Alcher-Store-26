import { config } from "dotenv";
config({ path: ".env.local" });

async function updateExistingProducts() {
  const { connectDB } = await import("../lib/mongodb.js");
  const ProductModule = await import("../models/Product.js");
  const ProductCategoryModule = await import("../models/ProductCategory.js");
  const Product = ProductModule.default;
  const ProductCategory = ProductCategoryModule.default;

  await connectDB();

  // Get Merch category
  const merchCategory = await ProductCategory.findOne({ name: "Merch" });
  
  if (!merchCategory) {
    console.log("❌ Merch category not found. Run seedCategories first.");
    process.exit(1);
  }

  // Find products without category
  const productsWithoutCategory = await Product.find({ 
    $or: [
      { category: { $exists: false } },
      { category: null }
    ]
  });

  console.log(`Found ${productsWithoutCategory.length} products without category`);

  // Assign Merch category to them
  for (const product of productsWithoutCategory) {
    await Product.updateOne(
      { _id: product._id },
      { $set: { category: merchCategory._id } }
    );
    console.log(`✓ Updated ${product.name} to Merch category`);
  }

  console.log("\n✅ Update complete!");
  process.exit(0);
}

updateExistingProducts().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
