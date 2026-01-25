import { config } from "dotenv";
config({ path: ".env.local" });

async function seedCategories() {
  const { connectDB } = await import("../lib/mongodb.js");
  const ProductCategoryModule = await import("../models/ProductCategory.js");
  const ProductCategory = ProductCategoryModule.default;

  await connectDB();

  const categories = [
    { 
      name: "Merch", 
      field_required: { size: true, colour: true } 
    },
    { 
      name: "Combo", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "Cards", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "Vinyl Stickers", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "PVC stickers", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "Badges", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "Wrist Bands", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "Keychain", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "Poster A3", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "Poster A4", 
      field_required: { size: false, colour: false } 
    },
    { 
      name: "Tote Bag", 
      field_required: { size: false, colour: false } 
    },
  ];

  for (const cat of categories) {
    await ProductCategory.updateOne(
      { name: cat.name },
      { $set: cat },
      { upsert: true }
    );
    console.log(`✓ Category: ${cat.name}`);
  }

  console.log("\n✅ Categories seeded successfully!");
  process.exit(0);
}

seedCategories().catch((err) => {
  console.error("❌ Error seeding categories:", err);
  process.exit(1);
});
