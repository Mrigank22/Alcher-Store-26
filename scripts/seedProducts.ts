import { config } from "dotenv";
config({ path: ".env.local" });

async function seedProducts() {
  const { connectDB } = await import("../lib/mongodb.js");
  const ProductModule = await import("../models/Product.js");
  const ProductCategoryModule = await import("../models/ProductCategory.js");
  const Product = ProductModule.default;
  const ProductCategory = ProductCategoryModule.default;

  await connectDB();

  // Get category IDs
  const categories = await ProductCategory.find();
  const categoryMap: Record<string, any> = {};
  categories.forEach((cat) => {
    categoryMap[cat.name] = cat._id;
  });

  const products = [
    // ===================== COMBOS =====================
    {
      name: "Godfather's Set",
      product_id: "godfathers-set",
      category: categoryMap["Combo"],
      price: 1000,
      description: "Full House Combo - Complete Alcher merchandise experience with premium items",
      productType: "Full House Combo",
      images: [], // Upload images through admin panel
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Set 1 - Flawless",
          variantDescription: `1 Tote Bag (Flawless)
1 Poster A3 (Gambit)
1 Poster A4 (Joker Saga)
5 Badges (Jacked, Absolute Cinema, Pew Pew Badge, Dont Blink, Alcher Lady)
2 Keychain (OMG, Aeroplane Mode)
2 Wrist Band (OMG, Alcher 26 - Blue)
10 Sticker - 3 PVC (6-7, Alchikin, Cat and Mouse) + 7 Vinyl (Duck, Indian Lady, Card Trick, Skull Joker, Alcher Surf, Joker Love, Octopus)
Card Set (La Regalia)`,
          stock: 25,
        },
        {
          variantName: "Set 2 - King Card",
          variantDescription: `1 Tote Bag (King Card)
1 Poster A3 (Fool Knows)
1 Poster A4 (Are You Ready?)
5 Badges (Jacked, Absolute Cinema, Pew Pew Badge, Dont Blink, Alcher Lady)
2 Keychain (OMG, Aesthetic)
2 Wrist Band (OMG, Alcher 26 - Purple)
10 Sticker - 3 PVC (Rhino, Loading, Alchikin) + 7 Vinyl (Indian Lady, Medusa, Card Trick, Joker Love, Slot Machine, Octopus, Old Lady)
Card Set (La Regalia)`,
          stock: 25,
        },
      ],
    },

    {
      name: "Regal Set",
      product_id: "regal-set",
      category: categoryMap["Combo"],
      price: 580,
      description: "Essentials Combo - Curated selection of must-have Alcher items",
      productType: "Essentials Combo",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Set 1 - Flawless",
          variantDescription: `1 Tote Bag (Flawless)
2 Badges (Jacked, Alcher Lady)
1 Keychain (OMG)
1 Wrist Band (Alcher 26 - Blue)
5 Sticker - 2 PVC (Alchikin, Cat and Mouse) + 3 Vinyl (Card Trick, Joker Love, Alcher Surf)
Card Set (La Regalia)`,
          stock: 30,
        },
        {
          variantName: "Set 2 - King Card",
          variantDescription: `1 Tote Bag (King Card)
2 Badges (Absolute Cinema, Pew Pew Badge)
1 Keychain (Aeroplane Mode)
1 Wrist Band (Alcher 26 - Purple)
5 Sticker - 2 PVC (Rhino, Loading) + 3 Vinyl (Indian Lady, Duck, Octopus)
Card Set (La Regalia)`,
          stock: 30,
        },
      ],
    },

    {
      name: "Sovereign Set",
      product_id: "sovereign-set",
      category: categoryMap["Combo"],
      price: 300,
      description: "Small Combo - Perfect starter pack for Alcher fans",
      productType: "Small Combo",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Set 1",
          variantDescription: `2 Badges (Jacked, Alcher Lady)
5 Sticker - 2 PVC (Alchikin, Cat and Mouse) + 3 Vinyl (Card Trick, Joker Love, Alcher Surf)
Card Set (La Regalia)`,
          stock: 30,
        },
        {
          variantName: "Set 2",
          variantDescription: `2 Badges (Absolute Cinema, Pew Pew Badge)
5 Sticker - 2 PVC (Rhino, Loading) + 3 Vinyl (Indian Lady, Duck, Octopus)
Card Set (La Regalia)`,
          stock: 30,
        },
        {
          variantName: "Set 3",
          variantDescription: `2 Badges (Alcher Lady, Don't Blink)
5 Sticker - 2 PVC (Rhino, 6-7) + 3 Vinyl (Card Trick, Old Lady, Indian Lady)
Card Set (La Regalia)`,
          stock: 30,
        },
        {
          variantName: "Set 4",
          variantDescription: `2 Badges (Jacked, Pew Pew)
5 Sticker - 2 PVC (loading, 6-7) + 3 Vinyl (Duck, Joker Love, Indian Lady)
Card Set (La Regalia)`,
          stock: 30,
        },
      ],
    },

    // ===================== CARDS =====================
    {
      name: "La Regalia",
      product_id: "la-regalia-card-deck",
      category: categoryMap["Cards"],
      price: 170,
      description: "Complete deck of premium playing cards with Alcher design",
      productType: "Deck of Cards",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "La Regalia",
          stock: 100,
        },
      ],
    },

    // ===================== VINYL STICKERS =====================
    {
      name: "Vinyl Stickers",
      product_id: "vinyl-stickers-set-10",
      category: categoryMap["Vinyl Stickers"],
      price: 120,
      description: "Bundle of 10 premium vinyl stickers featuring Duck, Indian Lady, Medusa, Card Trick, Skull Joker, Alcher Surf, Joker Love, Slot Machine, Octopus, Old Lady",
      productType: "Set of 10",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Set 1",
          variantDescription: "Duck, Indian Lady, Medusa, Card Trick, Skull Joker, Alcher Surf, Joker Love, Slot Machine, Octopus, Old Lady",
          stock: 100,
        },
      ],
    },

    // ===================== PVC STICKERS =====================
    {
      name: "PVC Stickers (Set of 5)",
      product_id: "pvc-stickers-set-5",
      category: categoryMap["PVC stickers"],
      price: 75,
      description: "Bundle of 5 durable PVC stickers featuring Cat and Mouse, Rhino, Alchikin, Loading, 6-7",
      productType: "Set of 5",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Set 1",
          variantDescription: "Cat and Mouse, Rhino, Alchikin, Loading, 6-7",
          stock: 100,
        },
      ],
    },

    // ===================== BADGES =====================
    {
      name: "Badges (Set of 5)",
      product_id: "badges-set-5",
      category: categoryMap["Badges"],
      price: 200,
      description: "Bundle of 5 collectible badges featuring Jacked, Absolute Cinema, Pew Pew Badge, Dont Blink, Alcher Lady",
      productType: "Set of 5",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Set 1",
          variantDescription: "Jacked, Absolute Cinema, Pew Pew Badge, Dont Blink, Alcher Lady",
          stock: 100,
        },
      ],
    },

    // ===================== WRIST BANDS =====================
    {
      name: "Wrist Bands (Set of 3)",
      product_id: "wrist-bands-set-3",
      category: categoryMap["Wrist Bands"],
      price: 120,
      description: "Bundle of 3 comfortable wrist bands featuring OMG, Alcher 26 - Blue, Alcher 26 - Purple",
      productType: "Set of 3",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Set 1",
          variantDescription: "OMG, Alcher 26 - Blue, Alcher 26 - Purple",
          stock: 100,
        },
      ],
    },

    // ===================== KEYCHAIN =====================
    {
      name: "Keychain",
      product_id: "satin-keychain",
      category: categoryMap["Keychain"],
      price: 80,
      description: "Premium satin keychain - Single piece",
      productType: "Satin Keychain",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "OMG",
          stock: 50,
        },
        {
          variantName: "Aeroplane Mode",
          stock: 50,
        },
        {
          variantName: "Aesthetic",
          stock: 50,
        },
      ],
    },

    // ===================== POSTER A3 =====================
    {
      name: "Poster A3",
      product_id: "poster-a3-300gsm",
      category: categoryMap["Poster A3"],
      price: 100,
      description: "High-quality 300 GSM A3 poster - Single piece",
      productType: "300 GSM Posters",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Fool Knows",
          stock: 40,
        },
        {
          variantName: "Gambit",
          stock: 40,
        },
        {
          variantName: "Joker Saga",
          stock: 40,
        },
        {
          variantName: "Are You Ready",
          stock: 40,
        },
        {
          variantName: "Shuffle",
          stock: 40,
        },
      ],
    },

    // ===================== POSTER A4 =====================
    {
      name: "Poster A4",
      product_id: "poster-a4-300gsm",
      category: categoryMap["Poster A4"],
      price: 80,
      description: "High-quality 300 GSM A4 poster - Single piece",
      productType: "300 GSM Posters",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Fool Knows",
          stock: 40,
        },
        {
          variantName: "Gambit",
          stock: 40,
        },
        {
          variantName: "Joker Saga",
          stock: 40,
        },
        {
          variantName: "Are You Ready",
          stock: 40,
        },
        {
          variantName: "Shuffle",
          stock: 40,
        },
      ],
    },

    // ===================== TOTE BAG =====================
    {
      name: "Tote Bag",
      product_id: "nylon-tote-bag",
      category: categoryMap["Tote Bag"],
      price: 200,
      description: "Durable nylon tote bag - Single piece",
      productType: "Nylon Tote Bag",
      images: [],
      hasSize: false,
      hasColor: false,
      variants: [
        {
          variantName: "Flawless",
          stock: 50,
        },
        {
          variantName: "King Card",
          stock: 50,
        },
      ],
    },
  ];

  for (const product of products) {
    await Product.updateOne(
      { product_id: product.product_id },
      { $set: product },
      { upsert: true }
    );
    console.log(`✓ Product: ${product.name} (${product.variants.length} variants)`);
  }

  console.log("\n✅ Products seeded successfully!");
  console.log(`Total products: ${products.length}`);
  process.exit(0);
}

seedProducts().catch((err) => {
  console.error("❌ Error seeding products:", err);
  process.exit(1);
});
