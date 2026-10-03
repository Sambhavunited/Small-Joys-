// The Small Joys catalog. Prices are in Indian Rupees.
// Items marked `madeToOrder` (or with price: null) are priced on WhatsApp.
// Edit this file to change products, prices or photos everywhere on the site,
// including what the AI assistant knows.

import { GALLERY_CROP, pexels, unsplash } from "@/data/stock-photos";

export type CategoryId =
  "gift-boxes" | "brownies" | "cookies" | "cakes" | "cupcakes" | "treats" | "dessert-table" | "made-to-order";

export type Tone = "burgundy" | "navy" | "olive" | "sand" | "rose";

export type Tag = "bestseller" | "festive" | "corporate" | "kids" | "eggless" | "new";

export type ProductOption = {
  label: string;
  /** Overrides the product price for this option */
  price?: number;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  /** Price in INR. null means the price is shared on WhatsApp. */
  price: number | null;
  /** Upper end of a price range, e.g. ₹400 to ₹600 */
  priceMax?: number;
  /** What the price buys, e.g. "per piece", "box of 6", "250 g" */
  unit?: string;
  options?: ProductOption[];
  optionLabel?: string;
  description: string;
  includes?: string[];
  image?: string;
  imageFit?: "cutout" | "photo";
  tone: Tone;
  tags?: Tag[];
  occasions?: string[];
  madeToOrder?: boolean;
  minQty?: number;
};

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
  tone: Tone;
};

export const categories: Category[] = [
  {
    id: "gift-boxes",
    name: "Gift boxes & hampers",
    blurb: "Ready-to-gift boxes for festivals, thank-yous and everything in between.",
    tone: "burgundy",
  },
  { id: "brownies", name: "Brownies", blurb: "Fudgy, generous and baked in small batches.", tone: "olive" },
  { id: "cookies", name: "Cookies", blurb: "Printed, tinned, dipped or dunked.", tone: "burgundy" },
  { id: "cakes", name: "Cakes & loaves", blurb: "Tea-time loaves, jar cakes and pastries.", tone: "navy" },
  { id: "cupcakes", name: "Cupcakes", blurb: "Swirled, filled and boxed to share.", tone: "navy" },
  { id: "treats", name: "Little treats", blurb: "Macarons, donuts, tiramisu and more.", tone: "olive" },
  {
    id: "dessert-table",
    name: "Dessert table",
    blurb: "Bite-sized pieces for parties and events, priced per piece.",
    tone: "sand",
  },
  { id: "made-to-order", name: "Made to order", blurb: "Custom cakes, gift baskets and personalised gifts.", tone: "rose" },
];

const P = (name: string) => `/images/products/${name}.webp`;
const G = (name: string) => `/images/gallery/${name}.webp`;
// Stock photos (unsplash, pexels) stand in where there is no Small Joys photo yet. See stock-photos.ts.

export const products: Product[] = [
  // ---------- Gift boxes & hampers ----------
  {
    id: "dry-cake-hamper",
    name: "Dry Cake Hamper",
    category: "gift-boxes",
    price: 600,
    unit: "10 mini loaves",
    description: "Ten assorted mini loaf cakes in a handled gift box with a personal note card.",
    includes: ["10 mini loaves, assorted flavours"],
    image: P("dry-cake-hamper"),
    imageFit: "cutout",
    tone: "navy",
    tags: ["bestseller", "festive"],
    occasions: ["festive", "thank-you", "corporate", "house-warming"],
  },
  {
    id: "mini-treats-6",
    name: "Mini Treats Box of 6",
    category: "gift-boxes",
    price: 350,
    unit: "6 treats",
    description: "A little of everything: brownie, donut, truffle ball, cupcake, macaron and cookie in one slim box.",
    includes: ["Brownie", "Donut", "Truffle ball", "Cupcake", "Macaron", "Cookie"],
    image: "/images/scenes/mini-treats.webp",
    imageFit: "photo",
    tone: "sand",
    tags: ["bestseller", "festive"],
    occasions: ["festive", "thank-you", "birthday", "corporate"],
  },
  {
    id: "mini-treats-4",
    name: "Mini Treats Box of 4",
    category: "gift-boxes",
    price: 250,
    unit: "4 treats",
    description: "Four mini treats from our assortment, a sweet small gift or return favour.",
    image: "/images/scenes/mini-treats.webp",
    imageFit: "photo",
    tone: "sand",
    tags: ["festive"],
    occasions: ["festive", "thank-you", "wedding", "kids"],
  },
  {
    id: "diy-cookie-kit",
    name: "DIY Cookie Kit",
    category: "gift-boxes",
    price: 300,
    unit: "kit",
    description: "From The Sibling Edit: four cookies, two icing tubes and sprinkles to decorate together.",
    includes: ["4 cookies", "2 icing tubes", "Sprinkles"],
    image: P("diy-cookie-kit"),
    imageFit: "cutout",
    tone: "navy",
    tags: ["kids", "festive", "new"],
    occasions: ["kids", "festive", "birthday"],
  },
  {
    id: "assorted-hamper",
    name: "Assorted Hamper",
    category: "gift-boxes",
    price: 700,
    unit: "hamper",
    description: "Dry cake, macarons, cupcakes and chocolates, ribboned in a window box.",
    includes: ["Dry cake", "Macarons", "Cupcakes", "Chocolates"],
    image: G("rakhi-assorted-hamper"),
    imageFit: "photo",
    tone: "rose",
    tags: ["festive"],
    occasions: ["festive", "thank-you", "birthday"],
  },
  {
    id: "bag-hamper",
    name: "Bag Hamper",
    category: "gift-boxes",
    price: 700,
    unit: "hamper",
    description: "A ribboned gift bag with a dry cake, six brownies, six cookies and lavash.",
    includes: ["Dry cake", "6 brownies", "6 cookies", "Lavash"],
    image: G("bag-hamper"),
    imageFit: "photo",
    tone: "rose",
    tags: ["festive", "corporate"],
    occasions: ["festive", "corporate", "thank-you"],
  },
  {
    id: "red-box-hamper",
    name: "Red Box Hamper",
    category: "gift-boxes",
    price: 475,
    unit: "2 × 250 g",
    description: "Two 250 g dry cakes in our red gingham gift boxes.",
    image: G("red-box-hamper"),
    imageFit: "photo",
    tone: "burgundy",
    tags: ["festive"],
    occasions: ["festive", "thank-you"],
  },
  {
    id: "cake-pops-hamper",
    name: "Cake Pops Hamper",
    category: "gift-boxes",
    price: 280,
    priceMax: 350,
    unit: "gift box",
    optionLabel: "Choose",
    options: [
      { label: "7 cake pops", price: 350 },
      { label: "2 cookies + 2 brownies + 2 cupcakes", price: 280 },
    ],
    description: "A bouquet of seven cake pops, or a mix of cookies, brownies and cupcakes, in a window box.",
    image: G("rakhi-cake-pops-hamper"),
    imageFit: "photo",
    tone: "rose",
    tags: ["kids", "festive"],
    occasions: ["kids", "festive", "birthday"],
  },
  {
    id: "tea-time-cake-box",
    name: "Tea-time Cake Box",
    category: "gift-boxes",
    price: 500,
    unit: "4 flavours",
    description: "Four signature dry cake squares: ginger orange, blue matcha, lemon and masala chai.",
    includes: ["Ginger orange", "Blue matcha", "Lemon cake", "Masala chai"],
    image: G("rakhi-dry-cake-hamper"),
    imageFit: "photo",
    tone: "rose",
    tags: ["festive"],
    occasions: ["festive", "thank-you", "corporate"],
  },

  // ---------- Brownies ----------
  {
    id: "brownie-single",
    name: "Brownie",
    category: "brownies",
    price: 35,
    unit: "per piece",
    optionLabel: "Flavour",
    options: [
      { label: "Walnut", price: 35 },
      { label: "Oreo", price: 32 },
      { label: "Red velvet", price: 40 },
    ],
    description: "Our classic fudgy brownie, by the piece.",
    image: P("brownies-box-of-6"),
    imageFit: "cutout",
    tone: "olive",
    occasions: ["birthday", "thank-you"],
  },
  {
    id: "brownies-box-6",
    name: "Brownie Box of 6",
    category: "brownies",
    price: 500,
    unit: "box of 6",
    description: "Six assorted brownies in a lilac window box, our most gifted box.",
    image: P("brownies-box-of-6"),
    imageFit: "cutout",
    tone: "olive",
    tags: ["bestseller"],
    occasions: ["festive", "birthday", "thank-you", "corporate"],
  },
  {
    id: "printed-brownies",
    name: "Printed Brownies",
    category: "brownies",
    price: 450,
    unit: "box of 6",
    description: "Six brownies with printed tile-pattern tops, tied with a satin bow. Ask about custom prints and logos.",
    image: P("printed-brownies"),
    imageFit: "cutout",
    tone: "olive",
    tags: ["corporate", "festive"],
    occasions: ["corporate", "festive", "wedding"],
  },
  {
    id: "brownie-tub",
    name: "Brownie Tub",
    category: "brownies",
    price: 500,
    unit: "tub",
    optionLabel: "Flavour",
    options: [{ label: "Nutella" }, { label: "Hazelnut" }, { label: "KitKat" }, { label: "Chocolate" }],
    description: "A generous tub of brownie bites, loaded with your choice of topping.",
    image: P("brownie-tub"),
    imageFit: "cutout",
    tone: "olive",
    tags: ["bestseller"],
    occasions: ["birthday", "thank-you"],
  },
  {
    id: "brownie-slab",
    name: "Brownie Slab",
    category: "brownies",
    price: 400,
    priceMax: 600,
    unit: "slab",
    description: "A whole slab to share, topped with pretzels, nuts or chocolate. Price depends on size and toppings.",
    image: P("brownie-slab"),
    imageFit: "cutout",
    tone: "olive",
    occasions: ["birthday", "festive"],
  },

  // ---------- Cookies ----------
  {
    id: "printed-cookies",
    name: "Printed Cookies",
    category: "cookies",
    price: 80,
    unit: "per cookie",
    optionLabel: "Flavour",
    options: [{ label: "Choco chip" }, { label: "Orange zest" }, { label: "Oats and cinnamon" }, { label: "Almond" }],
    description: "Iced cookies printed with patterns, names or your company logo. Lovely for corporate gifting.",
    image: P("printed-cookies"),
    imageFit: "cutout",
    tone: "burgundy",
    tags: ["corporate", "bestseller"],
    occasions: ["corporate", "wedding", "birthday"],
  },
  {
    id: "cookie-tin",
    name: "Cookie Tin",
    category: "cookies",
    price: 550,
    unit: "tin",
    optionLabel: "Flavour",
    options: [{ label: "Choco chip" }, { label: "Dark chocolate" }],
    description: "A keepsake tin packed with gooey, chunky cookies.",
    image: P("cookie-tin"),
    imageFit: "cutout",
    tone: "burgundy",
    tags: ["festive", "bestseller"],
    occasions: ["festive", "thank-you", "corporate"],
  },
  {
    id: "cookie-cup",
    name: "Cookie Cup",
    category: "cookies",
    price: 300,
    unit: "cup",
    description: "Bite-sized choco chip cookies with a Nutella dip dome.",
    image: P("cookie-cup"),
    imageFit: "cutout",
    tone: "burgundy",
    tags: ["kids"],
    occasions: ["kids", "birthday", "thank-you"],
  },
  {
    id: "classic-cookies",
    name: "Classic Cookies",
    category: "cookies",
    price: 30,
    unit: "per piece",
    optionLabel: "Flavour",
    options: [{ label: "Choco chip" }, { label: "Oats and cinnamon" }],
    description: "Everyday cookies, packed in branded bags.",
    image: P("cookie-choco-chip"),
    imageFit: "cutout",
    tone: "burgundy",
    occasions: ["thank-you", "kids"],
  },
  {
    id: "chocolate-biscuits",
    name: "Chocolate Biscuits",
    category: "cookies",
    price: 35,
    unit: "per piece",
    description: "Chocolate-coated biscuits finished with sprinkles.",
    image: G("cookies-chocolate-dipped"),
    imageFit: "photo",
    tone: "burgundy",
    tags: ["kids"],
    occasions: ["kids", "birthday"],
  },
  {
    id: "chocolate-tablets",
    name: "Chocolate Round Tablets",
    category: "cookies",
    price: 35,
    unit: "per piece",
    description: "Chocolate rounds set with rose petals, pumpkin seeds and dried fruits.",
    image: pexels(7407264),
    imageFit: "photo",
    tone: "burgundy",
    occasions: ["festive", "thank-you"],
  },

  // ---------- Cakes & loaves ----------
  {
    id: "loaf-cake",
    name: "Loaf Cake",
    category: "cakes",
    price: 350,
    unit: "250 g",
    optionLabel: "Flavour",
    options: [
      { label: "Choco chip" },
      { label: "Vanilla orange" },
      { label: "Oreo" },
      { label: "Dark chocolate" },
      { label: "Cinnamon crumble" },
      { label: "Blueberry" },
      { label: "Carrot cinnamon" },
    ],
    description:
      "Soft, buttery tea-time loaves. Ask about our signature flavours: ginger orange rosemary, masala chai, almond honey and a sugar-free whole-wheat carrot cinnamon cake.",
    image: pexels(32789046),
    imageFit: "photo",
    tone: "navy",
    tags: ["bestseller"],
    occasions: ["thank-you", "festive", "house-warming"],
  },
  {
    id: "tea-cake",
    name: "Tea Cake",
    category: "cakes",
    price: 200,
    unit: "250 g",
    optionLabel: "Flavour",
    options: [
      { label: "Marble" },
      { label: "Choco chip" },
      { label: "Dry fruit" },
      { label: "Blueberry" },
      { label: "Caramel" },
      { label: "Orange" },
      { label: "Vanilla" },
    ],
    description: "Classic everyday tea cakes, light and perfect with chai.",
    image: pexels(30700685),
    imageFit: "photo",
    tone: "navy",
    occasions: ["thank-you", "house-warming"],
  },
  {
    id: "jar-cake",
    name: "Jar Cake",
    category: "cakes",
    price: 200,
    priceMax: 250,
    unit: "350 g jar",
    optionLabel: "Flavour",
    options: [
      { label: "Truffle", price: 200 },
      { label: "Black Forest", price: 200 },
      { label: "Butterscotch", price: 200 },
      { label: "Blueberry cheese", price: 250 },
      { label: "Rum and coffee", price: 250 },
      { label: "Rainbow", price: 250 },
    ],
    description: "Layered cake and cream in a 350 g jar, ready to spoon.",
    image: pexels(264731),
    imageFit: "photo",
    tone: "navy",
    occasions: ["birthday", "thank-you"],
  },
  {
    id: "pastry",
    name: "Pastry",
    category: "cakes",
    price: 65,
    priceMax: 75,
    unit: "per piece",
    optionLabel: "Flavour",
    options: [
      { label: "Pineapple", price: 65 },
      { label: "Black Forest", price: 65 },
      { label: "Truffle", price: 75 },
      { label: "Butterscotch", price: 65 },
    ],
    description: "Classic cream pastries by the piece.",
    image: pexels(2147868),
    imageFit: "photo",
    tone: "navy",
    occasions: ["birthday"],
  },

  // ---------- Cupcakes ----------
  {
    id: "cupcakes-box-6",
    name: "Cupcakes Box of 6",
    category: "cupcakes",
    price: 400,
    unit: "box of 6, assorted",
    description:
      "Six assorted cupcakes: choco chip, vanilla orange, Oreo, dark chocolate, cinnamon crumble, blueberry or carrot cinnamon.",
    image: P("cupcakes-box-of-6"),
    imageFit: "cutout",
    tone: "navy",
    tags: ["bestseller"],
    occasions: ["birthday", "festive", "thank-you"],
  },
  {
    id: "cupcakes-box-12-mini",
    name: "Mini Cupcakes Box of 12",
    category: "cupcakes",
    price: 600,
    unit: "box of 12, assorted",
    description: "Twelve frosted mini cupcakes, a party in a box.",
    image: P("cupcakes-box-of-12-mini"),
    imageFit: "cutout",
    tone: "navy",
    tags: ["festive", "kids"],
    occasions: ["birthday", "kids", "festive"],
  },
  {
    id: "cupcake-single",
    name: "Cupcake",
    category: "cupcakes",
    price: 40,
    unit: "60 g, per piece",
    optionLabel: "Flavour",
    options: [
      { label: "Choco chip" },
      { label: "Red velvet" },
      { label: "Caramel" },
      { label: "Mango" },
      { label: "Marble" },
      { label: "Vanilla almond" },
      { label: "Oreo" },
      { label: "Blueberry" },
    ],
    description: "Single cupcakes in our everyday flavours.",
    image: P("cupcake-chocolate"),
    imageFit: "cutout",
    tone: "navy",
    occasions: ["birthday", "kids"],
  },

  // ---------- Little treats ----------
  {
    id: "macarons-box-6",
    name: "Macarons Box of 6",
    category: "treats",
    price: 600,
    unit: "box of 6",
    description: "Six French macarons in a clear gift tube.",
    image: P("macarons-box"),
    imageFit: "cutout",
    tone: "olive",
    tags: ["festive", "bestseller"],
    occasions: ["festive", "wedding", "thank-you", "corporate"],
  },
  {
    id: "donuts-box-6",
    name: "Donuts Box of 6",
    category: "treats",
    price: 500,
    unit: "box of 6, assorted",
    description: "Six glazed and topped donuts in a handled gift box.",
    image: P("donuts-box-of-6"),
    imageFit: "cutout",
    tone: "burgundy",
    tags: ["kids"],
    occasions: ["kids", "birthday"],
  },
  {
    id: "tiramisu-tub",
    name: "Tiramisu Tub",
    category: "treats",
    price: 500,
    unit: "tub",
    description: "Coffee-soaked layers and mascarpone cream, dusted with cocoa.",
    image: P("tiramisu-tub"),
    imageFit: "cutout",
    tone: "burgundy",
    tags: ["bestseller"],
    occasions: ["birthday", "anniversary", "thank-you"],
  },
  {
    id: "stroopwafel",
    name: "Stroopwafel",
    category: "treats",
    price: 60,
    unit: "per piece",
    description: "Thin crisp waffles with a chocolate filling.",
    image: P("stroopwafel"),
    imageFit: "cutout",
    tone: "olive",
    occasions: ["thank-you", "corporate"],
  },
  {
    id: "cake-sickles",
    name: "Cake Sickles",
    category: "treats",
    price: 40,
    unit: "per piece",
    description: "Cake on a stick, dipped in chocolate and decorated. A kids' party favourite.",
    image: G("cake-sickles"),
    imageFit: "photo",
    tone: "burgundy",
    tags: ["kids"],
    occasions: ["kids", "birthday"],
  },

  // ---------- Dessert table (per piece, for parties) ----------
  {
    id: "dt-macarons",
    name: "Eggless Macarons",
    category: "dessert-table",
    price: 75,
    unit: "per piece",
    optionLabel: "Filling",
    options: [{ label: "Nutella" }, { label: "Blueberry" }, { label: "Raspberry" }, { label: "Lotus Biscoff" }],
    description: "Eggless macarons for dessert tables and favours.",
    image: P("macarons-box"),
    imageFit: "cutout",
    tone: "sand",
    tags: ["eggless"],
    occasions: ["wedding", "birthday", "corporate"],
    minQty: 10,
  },
  {
    id: "dt-shot-glasses",
    name: "Dessert Shot Glasses",
    category: "dessert-table",
    price: 45,
    unit: "per glass",
    optionLabel: "Flavour",
    options: [
      { label: "Rasmalai" },
      { label: "Motichoor" },
      { label: "Blueberry" },
      { label: "Chocolate mousse" },
      { label: "Fruit gateau" },
    ],
    description: "Layered dessert shots, from Indian fusion to classic mousse.",
    image: unsplash("1504388192519-fb4be897c4d0"),
    imageFit: "photo",
    tone: "sand",
    occasions: ["wedding", "birthday", "corporate"],
    minQty: 10,
  },
  {
    id: "dt-brownie-shots",
    name: "Brownie Shots",
    category: "dessert-table",
    price: 40,
    unit: "per piece",
    optionLabel: "Style",
    options: [{ label: "Chocolate dipped" }, { label: "Nutella drizzled" }],
    description: "Brownie bites served in shot cups.",
    image: unsplash("1606313564200-e75d5e30476c"),
    imageFit: "photo",
    tone: "sand",
    occasions: ["birthday", "wedding"],
    minQty: 10,
  },
  {
    id: "dt-cheesecake",
    name: "Cheesecake Glasses",
    category: "dessert-table",
    price: 80,
    unit: "per small glass",
    optionLabel: "Flavour",
    options: [
      { label: "Blueberry" },
      { label: "Nutella" },
      { label: "Lotus Biscoff" },
      { label: "New York (strawberry, as available)" },
    ],
    description: "Single-serve cheesecakes in small glasses.",
    image: pexels(20809255),
    imageFit: "photo",
    tone: "sand",
    occasions: ["wedding", "birthday", "anniversary"],
    minQty: 10,
  },
  {
    id: "dt-mini-cupcakes",
    name: "Bite-size Mini Cupcakes",
    category: "dessert-table",
    price: 30,
    unit: "per piece",
    optionLabel: "Flavour",
    options: [
      { label: "Almond" },
      { label: "Marble" },
      { label: "Choco chip" },
      { label: "Blueberry" },
      { label: "Nutella filled" },
      { label: "Orange" },
    ],
    description: "One-bite cupcakes for platters and dessert tables.",
    image: P("cupcake-almond"),
    imageFit: "cutout",
    tone: "sand",
    occasions: ["birthday", "wedding", "kids"],
    minQty: 12,
  },

  // ---------- Made to order (priced on WhatsApp) ----------
  {
    id: "custom-cake",
    name: "Custom Celebration Cake",
    category: "made-to-order",
    price: null,
    description:
      "Theme cakes, tiered cakes, fondant toppers and elegant buttercream finishes, designed around your story. Share the theme, size, flavour and date.",
    image: unsplash("1542007920-992d2c424d09"),
    imageFit: "photo",
    tone: "rose",
    tags: ["bestseller"],
    occasions: ["birthday", "anniversary", "kids", "wedding"],
    madeToOrder: true,
  },
  {
    id: "gift-basket",
    name: "Signature Gift Basket",
    category: "made-to-order",
    price: null,
    description:
      "Curated baskets with bakes, dry fruits, preserves, candles and florals in keepsake leather-look baskets. Built to your budget.",
    image: G("hamper-burgundy-floral"),
    imageFit: "photo",
    tone: "rose",
    tags: ["festive", "corporate"],
    occasions: ["festive", "corporate", "wedding", "house-warming"],
    madeToOrder: true,
  },
  {
    id: "custom-chocolate-bars",
    name: "Personalised Chocolate Bars",
    category: "made-to-order",
    price: null,
    description: "Chocolate bars with custom wrappers: farewells, thank-yous, 'Best Boss', team gifts and more.",
    image: G("custom-chocolate-bars"),
    imageFit: "photo",
    tone: "rose",
    tags: ["corporate"],
    occasions: ["corporate", "thank-you", "birthday"],
    madeToOrder: true,
  },
  {
    id: "diy-cupcake-kit",
    name: "DIY Cupcake Kit",
    category: "made-to-order",
    price: null,
    description: "Cupcakes, frosting and toppings with an instruction card, so kids can decorate their own.",
    image: G("diy-cupcake-kit"),
    imageFit: "photo",
    tone: "rose",
    tags: ["kids", "festive"],
    occasions: ["kids", "festive", "birthday"],
    madeToOrder: true,
  },
  {
    id: "catering-high-tea",
    name: "High-tea & Breakfast Catering",
    category: "made-to-order",
    price: null,
    description:
      "Savoury and sweet spreads for kitty parties, offices and family brunches, from mini samosas and sliders to chaat boards, wraps, waffles and mini pastries.",
    image: unsplash("1601050690597-df0568f70950"),
    imageFit: "photo",
    tone: "sand",
    occasions: ["corporate", "birthday", "house-warming"],
    madeToOrder: true,
  },
];

export const productById = new Map(products.map((p) => [p.id, p]));

export function getProduct(id: string) {
  return productById.get(id);
}

export function productsIn(category: CategoryId) {
  return products.filter((p) => p.category === category);
}

export const bestsellers = [
  "brownies-box-6",
  "dry-cake-hamper",
  "cookie-tin",
  "mini-treats-6",
  "printed-cookies",
  "tiramisu-tub",
  "macarons-box-6",
  "cupcakes-box-6",
]
  .map((id) => productById.get(id))
  .filter((p): p is Product => Boolean(p));

export const occasions = [
  { id: "birthday", label: "Birthday", prompt: "I'm planning a birthday. What would you suggest?" },
  { id: "festive", label: "Diwali & festive", prompt: "I'm looking for festive gifts for Diwali. What do you recommend?" },
  { id: "sibling", label: "Rakhi & Bhai Dooj", prompt: "I want a gift for my sibling for Rakhi or Bhai Dooj." },
  { id: "corporate", label: "Corporate gifting", prompt: "I need corporate gifts for my team or clients." },
  { id: "wedding", label: "Weddings & favours", prompt: "I'm looking for wedding favours or a dessert table." },
  { id: "kids", label: "Kids' party", prompt: "I'm planning a kids' party. What treats would work?" },
  { id: "thank-you", label: "Just to say thanks", prompt: "I want to send a small thank-you gift." },
  { id: "custom-cake", label: "A custom cake", prompt: "I'd like a custom cake designed for a celebration." },
] as const;

/** Catering menus (priced on WhatsApp) */
export const cateringMenus = [
  {
    title: "High-tea menu",
    items: [
      "Mini samosa or puff patties",
      "Pasta salad, sandwiches or veggie wraps (hummus, hung curd, pesto)",
      "Mini pizza, mini burger, vada pav or dhokla",
      "Papri chaat board or kebab board",
      "Nacho chaat or tostadas",
      "Mango shots, yogurt shots, dry cake slices, or scones with sour cream",
    ],
  },
  {
    title: "Breakfast menu",
    items: [
      "Nagori aloo halwa or poori aloo",
      "Kalmi wada or sourdough bread sandwich",
      "Vada pav, pav bhaji or dhokla",
      "Masala buns with hung curd, lavash and nachos with salsa",
      "Salads: quinoa, sprout, mango, pasta or corn",
      "Wraps: falafel, paneer or spinach",
      "Pancakes, waffles or mini pastries",
    ],
  },
] as const;

/** Photos for the gallery and made-to-order pages */
export const gallery = {
  cakes: [
    { src: unsplash("1535141192574-5d4897c12636", GALLERY_CROP), alt: "Three-tier vanilla cake with fresh berries" },
    { src: unsplash("1571927087035-d47ce65e4736", GALLERY_CROP), alt: "Pastel unicorn cake on a cake stand" },
    { src: unsplash("1748813792606-359b33f4ab30", GALLERY_CROP), alt: "Car-themed birthday cake for a little one" },
    { src: unsplash("1464349095431-e9a21285b5f3", GALLERY_CROP), alt: "Sliced celebration cake on a cake stand" },
    { src: unsplash("1525257831700-183b9b8bf5c4", GALLERY_CROP), alt: "Four-tier white cake with flowers" },
    { src: unsplash("1610670444950-0b29430891b4", GALLERY_CROP), alt: "Chocolate birthday cake with lit candles" },
    { src: unsplash("1604413191066-4dd20bedf486", GALLERY_CROP), alt: "Pink and white floral cake" },
    { src: unsplash("1553710120-23dd1551da41", GALLERY_CROP), alt: "Rainbow unicorn birthday cake with candles" },
  ],
  hampers: [
    { src: G("hamper-burgundy-floral"), alt: "Burgundy basket hamper with florals, jars, candle and printed tins" },
    { src: G("hamper-ivory-basket"), alt: "Ivory basket hamper with jars, mini cakes and gift boxes" },
    { src: G("hamper-ivory-basket-side"), alt: "Ivory basket hamper filled with festive treats" },
    { src: G("rakhi-assorted-hamper"), alt: "Assorted hamper with dry cake, macarons and cupcakes" },
    { src: G("rakhi-cake-pops-hamper"), alt: "Cake pops bouquet in a window box" },
    { src: G("red-box-hamper"), alt: "Red gingham gift boxes" },
    { src: G("bag-hamper"), alt: "Ribboned gift bags with treats" },
    { src: G("donut-gift-box"), alt: "Long gift box with donuts and florals" },
    { src: G("printed-brownies-real"), alt: "Boxes of printed tile-pattern brownies" },
  ],
  personalised: [
    { src: G("custom-chocolate-bars"), alt: "Chocolate bars with personalised wrappers" },
    { src: G("diy-cupcake-kit"), alt: "DIY cupcake kit with frosting and instructions" },
    { src: G("cookies-packed"), alt: "Cookies packed in branded Small Joys bags" },
  ],
} as const;
