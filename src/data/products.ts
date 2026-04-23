export interface ProductColor {
  name: string;
  bgClass: string;
  hex?: string;
  image: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: number;
  title: string;
  price: string;
  priceNum: number;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: string[];
  badge?: "Best Seller" | "New" | "Sale";
  rating: number;
  reviews: number;
  category: "Tops" | "Pants" | "Outerwear" | "Accessories";
  description: string;
  slug: string;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Ribbed Tank Top",
    slug: "ribbed-tank-top",
    price: "৳1,865",
    priceNum: 1865,
    images: [
      { src: "https://picsum.photos/720/1005?random=1", alt: "Ribbed Tank Top front" },
      { src: "https://picsum.photos/720/1005?random=21", alt: "Ribbed Tank Top back" },
    ],
    colors: [
      { name: "Orange", bgClass: "bg-orange-500", image: "https://picsum.photos/720/1005?random=1" },
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=41" },
      { name: "White", bgClass: "bg-white", image: "https://picsum.photos/720/1005?random=61" },
    ],
    sizes: ["S", "M", "L", "XL"],
    badge: "Best Seller",
    rating: 5,
    reviews: 12,
    category: "Tops",
    description: "A premium ribbed tank top crafted from a soft cotton blend. Featuring a minimalist silhouette, this piece is designed for versatile layering or standalone wear. Detailed with a slight stretch for the perfect fit.",
  },
  {
    id: 2,
    title: "Ribbed Modal T-shirt",
    slug: "ribbed-modal-t-shirt",
    price: "৳2,085",
    priceNum: 2085,
    images: [
      { src: "https://picsum.photos/720/1005?random=2", alt: "Ribbed Modal T-shirt front" },
      { src: "https://picsum.photos/720/1005?random=22", alt: "Ribbed Modal T-shirt back" },
    ],
    colors: [
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=2" },
      { name: "Brown", bgClass: "bg-amber-800", image: "https://picsum.photos/720/1005?random=42" },
    ],
    sizes: ["S", "M", "L"],
    rating: 4,
    reviews: 8,
    category: "Tops",
    description: "This lightweight modal T-shirt offers a silky feel and elegant drape. The fine ribbing adds subtle texture, while the relaxed fit ensures all-day comfort. Perfect for elevated everyday wear.",
  },
  {
    id: 3,
    title: "Oversized Motif T-shirt",
    slug: "oversized-motif-t-shirt",
    price: "৳1,100",
    priceNum: 1100,
    images: [
      { src: "https://picsum.photos/720/1005?random=3", alt: "Oversized Motif T-shirt front" },
      { src: "https://picsum.photos/720/1005?random=23", alt: "Oversized Motif T-shirt back" },
    ],
    colors: [
      { name: "White", bgClass: "bg-white", image: "https://picsum.photos/720/1005?random=3" },
      { name: "Grey", bgClass: "bg-gray-400", image: "https://picsum.photos/720/1005?random=43" },
    ],
    sizes: ["M", "L", "XL"],
    badge: "New",
    rating: 5,
    reviews: 15,
    category: "Tops",
    description: "An expressive oversized T-shirt with a vintage-inspired motif. Constructed from heavyweight organic cotton, it features dropped shoulders and a wider neckline for a relaxed, urban look.",
  },
  {
    id: 4,
    title: "Oversized Printed T-shirt",
    slug: "oversized-printed-t-shirt",
    price: "৳1,865",
    priceNum: 1865,
    images: [
      { src: "https://picsum.photos/720/1005?random=4", alt: "Oversized Printed T-shirt front" },
      { src: "https://picsum.photos/720/1005?random=24", alt: "Oversized Printed T-shirt back" },
    ],
    colors: [
      { name: "Purple", bgClass: "bg-purple-600", image: "https://picsum.photos/720/1005?random=4" },
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=44" },
      { name: "Pink", bgClass: "bg-pink-400", image: "https://picsum.photos/720/1005?random=64" },
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4,
    reviews: 22,
    category: "Tops",
    description: "Bold graphics meet a modern fit in this oversized printed tee. Sustainably sourced cotton provides breathability and durability, making it a seasonal essential for any modern wardrobe.",
  },
  {
    id: 5,
    title: "Slim Fit Fine-Knit Sweater",
    slug: "slim-fit-fine-knit-sweater",
    price: "৳2,085",
    priceNum: 2085,
    images: [
      { src: "https://picsum.photos/720/1005?random=5", alt: "Slim Fit Fine-Knit Sweater front" },
      { src: "https://picsum.photos/720/1005?random=25", alt: "Slim Fit Fine-Knit Sweater back" },
    ],
    colors: [
      { name: "Beige", bgClass: "bg-amber-100", image: "https://picsum.photos/720/1005?random=5" },
      { name: "Light Green", bgClass: "bg-green-300", image: "https://picsum.photos/720/1005?random=45" },
    ],
    sizes: ["S", "M", "L"],
    badge: "Best Seller",
    rating: 5,
    reviews: 30,
    category: "Outerwear",
    description: "Crafted from fine-gauge wool, this slim-fit sweater is a masterclass in understated luxury. It features a tailored silhouette that transitions effortlessly from office settings to evening outings.",
  },
  {
    id: 6,
    title: "Regular Fit Oxford Shirt",
    slug: "regular-fit-oxford-shirt",
    price: "৳1,100",
    priceNum: 1100,
    images: [
      { src: "https://picsum.photos/720/1005?random=6", alt: "Regular Fit Oxford Shirt front" },
      { src: "https://picsum.photos/720/1005?random=26", alt: "Regular Fit Oxford Shirt back" },
    ],
    colors: [
      { name: "Blue", bgClass: "bg-blue-500", image: "https://picsum.photos/720/1005?random=6" },
      { name: "White", bgClass: "bg-white", image: "https://picsum.photos/720/1005?random=46" },
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4,
    reviews: 18,
    category: "Tops",
    description: "The quintessential timeless classic. This Oxford shirt is made from crisp cotton with a button-down collar and a chest pocket. A true foundation piece for any casual or formal wardrobe.",
  },
  {
    id: 7,
    title: "Loose Fit Hoodie",
    slug: "loose-fit-hoodie",
    price: "৳2,745",
    priceNum: 2745,
    images: [
      { src: "https://picsum.photos/720/1005?random=7", alt: "Loose Fit Hoodie front" },
      { src: "https://picsum.photos/720/1005?random=27", alt: "Loose Fit Hoodie back" },
    ],
    colors: [
      { name: "Grey", bgClass: "bg-gray-400", image: "https://picsum.photos/720/1005?random=7" },
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=47" },
    ],
    sizes: ["M", "L", "XL"],
    badge: "Sale",
    rating: 5,
    reviews: 42,
    category: "Outerwear",
    description: "Relaxed comfort redefined. This oversized hoodie features a soft brushed interior and a dual-layer hood for extra warmth. Finished with a spacious kangaroo pocket and ribbed cuffs.",
  },
  {
    id: 8,
    title: "Patterned Scarf",
    slug: "patterned-scarf",
    price: "৳1,425",
    priceNum: 1425,
    images: [
      { src: "https://picsum.photos/720/1005?random=8", alt: "Patterned Scarf front" },
      { src: "https://picsum.photos/720/1005?random=28", alt: "Patterned Scarf back" },
    ],
    colors: [
      { name: "Brown", bgClass: "bg-amber-800", image: "https://picsum.photos/720/1005?random=8" },
      { name: "Beige", bgClass: "bg-amber-100", image: "https://picsum.photos/720/1005?random=48" },
    ],
    sizes: ["One Size"],
    rating: 4,
    reviews: 7,
    category: "Accessories",
    description: "An elegant accessory to elevate any winter look. This patterned scarf is woven from a warm, lightweight wool blend with subtle fringe detailing and a sophisticated geometric print.",
  },
  {
    id: 9,
    title: "Cotton Jersey Top",
    slug: "cotton-jersey-top",
    price: "৳985",
    priceNum: 985,
    images: [
      { src: "https://picsum.photos/720/1005?random=9", alt: "Cotton Jersey Top front" },
      { src: "https://picsum.photos/720/1005?random=29", alt: "Cotton Jersey Top back" },
    ],
    colors: [
      { name: "Pink", bgClass: "bg-pink-400", image: "https://picsum.photos/720/1005?random=9" },
      { name: "White", bgClass: "bg-white", image: "https://picsum.photos/720/1005?random=49" },
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=69" },
    ],
    sizes: ["S", "M", "L"],
    badge: "New",
    rating: 5,
    reviews: 25,
    category: "Tops",
    description: "A comfortable jersey top made from premium organic cotton. Featuring a clean, modern cut and a soft feel, it's the perfect building block for any minimalist outfit.",
  },
  {
    id: 10,
    title: "Linen-Blend Dress",
    slug: "linen-blend-dress",
    price: "৳3,735",
    priceNum: 3735,
    images: [
      { src: "https://picsum.photos/720/1005?random=10", alt: "Linen-Blend Dress front" },
      { src: "https://picsum.photos/720/1005?random=30", alt: "Linen-Blend Dress back" },
    ],
    colors: [
      { name: "Beige", bgClass: "bg-amber-100", image: "https://picsum.photos/720/1005?random=10" },
      { name: "Orange", bgClass: "bg-orange-500", image: "https://picsum.photos/720/1005?random=50" },
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4,
    reviews: 19,
    category: "Tops",
    description: "This lightweight linen-blend dress is designed for breezy summer days. It features a relaxed silhouette with adjustable straps and a refined texture that ages beautifully with wear.",
  },
  {
    id: 11,
    title: "Wide-Leg Trousers",
    slug: "wide-leg-trousers",
    price: "৳3,185",
    priceNum: 3185,
    images: [
      { src: "https://picsum.photos/720/1005?random=11", alt: "Wide-Leg Trousers front" },
      { src: "https://picsum.photos/720/1005?random=31", alt: "Wide-Leg Trousers back" },
    ],
    colors: [
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=11" },
      { name: "Grey", bgClass: "bg-gray-400", image: "https://picsum.photos/720/1005?random=51" },
    ],
    sizes: ["S", "M", "L"],
    badge: "Best Seller",
    rating: 5,
    reviews: 36,
    category: "Pants",
    description: "Make a statement with these sophisticated wide-leg trousers. Featuring a high waist and clean pleat detailing, They are tailored from a high-quality wool blend for a structured yet flowing silhouette.",
  },
  {
    id: 12,
    title: "Relaxed Fit Sweatshirt",
    slug: "relaxed-fit-sweatshirt",
    price: "৳2,525",
    priceNum: 2525,
    images: [
      { src: "https://picsum.photos/720/1005?random=12", alt: "Relaxed Fit Sweatshirt front" },
      { src: "https://picsum.photos/720/1005?random=32", alt: "Relaxed Fit Sweatshirt back" },
    ],
    colors: [
      { name: "Light Green", bgClass: "bg-green-300", image: "https://picsum.photos/720/1005?random=12" },
      { name: "White", bgClass: "bg-white", image: "https://picsum.photos/720/1005?random=52" },
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4,
    reviews: 14,
    category: "Outerwear",
    description: "A cozy, relaxed-fit sweatshirt made from soft French terry cotton. Featuring dropped shoulders and a minimalist design, it's an elevated take on athletic-inspired loungewear.",
  },
  {
    id: 13,
    title: "V-neck Cashmere Sweater",
    slug: "v-neck-cashmere-sweater",
    price: "৳4,950",
    priceNum: 4950,
    images: [
      { src: "https://picsum.photos/720/1005?random=13", alt: "V-neck Cashmere Sweater front" },
      { src: "https://picsum.photos/720/1005?random=33", alt: "V-neck Cashmere Sweater back" },
    ],
    colors: [
      { name: "Brown", bgClass: "bg-amber-800", image: "https://picsum.photos/720/1005?random=13" },
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=53" },
    ],
    sizes: ["M", "L", "XL"],
    rating: 5,
    reviews: 27,
    category: "Outerwear",
    description: "Indulge in the unparalleled softness of pure Mongolian cashmere. This V-neck sweater features a refined gauge and classic fit, providing timeless warmth and elegance for cooler seasons.",
  },
  {
    id: 14,
    title: "Denim Mini Skirt",
    slug: "denim-mini-skirt",
    price: "৳2,195",
    priceNum: 2195,
    images: [
      { src: "https://picsum.photos/720/1005?random=14", alt: "Denim Mini Skirt front" },
      { src: "https://picsum.photos/720/1005?random=34", alt: "Denim Mini Skirt back" },
    ],
    colors: [
      { name: "Blue", bgClass: "bg-blue-500", image: "https://picsum.photos/720/1005?random=14" },
    ],
    sizes: ["S", "M", "L"],
    badge: "New",
    rating: 4,
    reviews: 11,
    category: "Tops",
    description: "A modern classic in durable denim. This mini skirt features a high-waisted fit and a subtle A-line silhouette, making it a versatile piece for effortless transitional styling.",
  },
  {
    id: 15,
    title: "Silk Blend Blouse",
    slug: "silk-blend-blouse",
    price: "৳4,285",
    priceNum: 4285,
    images: [
      { src: "https://picsum.photos/720/1005?random=15", alt: "Silk Blend Blouse front" },
      { src: "https://picsum.photos/720/1005?random=35", alt: "Silk Blend Blouse back" },
    ],
    colors: [
      { name: "White", bgClass: "bg-white", image: "https://picsum.photos/720/1005?random=15" },
      { name: "Pink", bgClass: "bg-pink-400", image: "https://picsum.photos/720/1005?random=55" },
    ],
    sizes: ["S", "M", "L"],
    rating: 5,
    reviews: 20,
    category: "Tops",
    description: "Luxurious silk meets a relaxed cut in this elegant blouse. Features a soft sheen and a hidden button placket for a clean, sophisticated profile. Perfect for professional or formal wear.",
  },
  {
    id: 16,
    title: "Cropped Cardigan",
    slug: "cropped-cardigan",
    price: "৳2,965",
    priceNum: 2965,
    images: [
      { src: "https://picsum.photos/720/1005?random=16", alt: "Cropped Cardigan front" },
      { src: "https://picsum.photos/720/1005?random=36", alt: "Cropped Cardigan back" },
    ],
    colors: [
      { name: "Beige", bgClass: "bg-amber-100", image: "https://picsum.photos/720/1005?random=16" },
      { name: "Grey", bgClass: "bg-gray-400", image: "https://picsum.photos/720/1005?random=56" },
    ],
    sizes: ["S", "M", "L", "XL"],
    badge: "Sale",
    rating: 4,
    reviews: 16,
    category: "Outerwear",
    description: "This chunky-knit cropped cardigan is a cozy seasonal staple. Featuring a button-front design and voluminous sleeves, it's perfect for layering over dresses or high-waisted denim.",
  },
  {
    id: 17,
    title: "Pleated Midi Skirt",
    slug: "pleated-midi-skirt",
    price: "৳3,520",
    priceNum: 3520,
    images: [
      { src: "https://picsum.photos/720/1005?random=17", alt: "Pleated Midi Skirt front" },
      { src: "https://picsum.photos/720/1005?random=37", alt: "Pleated Midi Skirt back" },
    ],
    colors: [
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=17" },
      { name: "Brown", bgClass: "bg-amber-800", image: "https://picsum.photos/720/1005?random=57" },
    ],
    sizes: ["S", "M", "L"],
    rating: 5,
    reviews: 33,
    category: "Tops",
    description: "A timeless pleated midi skirt with a fluid drape. Made from a durable synthetic blend, it features a comfortable elastic waist and sharp permanent pleats that add movement to any look.",
  },
  {
    id: 18,
    title: "Puffer Vest",
    slug: "puffer-vest",
    price: "৳4,725",
    priceNum: 4725,
    images: [
      { src: "https://picsum.photos/720/1005?random=18", alt: "Puffer Vest front" },
      { src: "https://picsum.photos/720/1005?random=38", alt: "Puffer Vest back" },
    ],
    colors: [
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=18" },
      { name: "Orange", bgClass: "bg-orange-500", image: "https://picsum.photos/720/1005?random=58" },
    ],
    sizes: ["M", "L", "XL"],
    rating: 4,
    reviews: 9,
    category: "Outerwear",
    description: "A lightweight yet highly insulating puffer vest designed for transitional weather. Features water-resistant fabric and a high funnel neck for superior protection against the elements.",
  },
  {
    id: 19,
    title: "Wrap Midi Dress",
    slug: "wrap-midi-dress",
    price: "৳4,065",
    priceNum: 4065,
    images: [
      { src: "https://picsum.photos/720/1005?random=19", alt: "Wrap Midi Dress front" },
      { src: "https://picsum.photos/720/1005?random=39", alt: "Wrap Midi Dress back" },
    ],
    colors: [
      { name: "Light Green", bgClass: "bg-green-300", image: "https://picsum.photos/720/1005?random=19" },
      { name: "Black", bgClass: "bg-black", image: "https://picsum.photos/720/1005?random=59" },
    ],
    sizes: ["S", "M", "L"],
    badge: "Best Seller",
    rating: 5,
    reviews: 41,
    category: "Tops",
    description: "Flatter any figure with this elegant wrap midi dress. Features a V-neckline and a cinched waist that leads into a flowing skirt. Made from a breathable viscose blend with a soft matte finish.",
  },
  {
    id: 20,
    title: "Knit Polo Shirt",
    slug: "knit-polo-shirt",
    price: "৳2,450",
    priceNum: 2450,
    images: [
      { src: "https://picsum.photos/720/1005?random=20", alt: "Knit Polo Shirt front" },
      { src: "https://picsum.photos/720/1005?random=40", alt: "Knit Polo Shirt back" },
    ],
    colors: [
      { name: "White", bgClass: "bg-white", image: "https://picsum.photos/720/1005?random=20" },
      { name: "Blue", bgClass: "bg-blue-500", image: "https://picsum.photos/720/1005?random=60" },
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4,
    reviews: 13,
    category: "Tops",
    description: "An elevated take on a casual staple. This knit polo shirt features a refined texture and a sharp collar, bridging the gap between comfort and sophistication for modern daily life.",
  },
];
