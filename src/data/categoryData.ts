// src/data/categoryData.ts
// =============================================================================
//  All 8 category definitions — products, images, metadata, accent colours
//  Images: Unsplash CDN (free, no-auth)
// =============================================================================

export interface CategoryProduct {
    id: number;
    image: string;
    tag: string;
    price: string;
    name: string;
    category: string;
    rating: number;
    badge?: string; // 'New' | 'Sale' | 'Hot'
  }
  
  export interface CategoryConfig {
    slug: string;
    name: string;
    tagline: string;
    description: string;
    heroImage: string;
    accent: string;         // CSS hex colour for highlights
    accentLight: string;    // lighter tint for backgrounds
    icon: string;           // emoji icon
    products: CategoryProduct[];
    filterTags: string[];
  }
  
  // ─── 1. Portrait Frames ────────────────────────────────────────────────────────
  const portraitFrames: CategoryProduct[] = [
    { id: 101, category: 'portrait-frames', name: 'Classic Gold Ornate Frame', price: '$89.00', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=600&q=80', rating: 5 },
    { id: 102, category: 'portrait-frames', name: 'Slim Black Minimalist Frame', price: '$45.00', tag: 'New Arrival', image: 'https://images.unsplash.com/photo-1579541592108-09a3e1f95938?w=600&q=80', rating: 4, badge: 'New' },
    { id: 103, category: 'portrait-frames', name: 'Rustic Barnwood Frame 18×24', price: '$67.00', tag: 'Handcrafted', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', rating: 4 },
    { id: 104, category: 'portrait-frames', name: 'Shadow Box Display Frame', price: '$110.00', tag: 'Premium', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', rating: 5, badge: 'Hot' },
    { id: 105, category: 'portrait-frames', name: 'Floating Acrylic Frame', price: '$78.00', tag: 'Modern', image: 'https://images.unsplash.com/photo-1541855492-581f618f69a0?w=600&q=80', rating: 4 },
    { id: 106, category: 'portrait-frames', name: 'Antique Silver Gallery Frame', price: '$95.00', tag: 'Vintage', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80', rating: 5 },
    { id: 107, category: 'portrait-frames', name: 'Collage Multi-Photo Frame', price: '$55.00', tag: 'Sale', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', rating: 3, badge: 'Sale' },
    { id: 108, category: 'portrait-frames', name: 'Bamboo Eco Frame 12×16', price: '$39.00', tag: 'Eco-Friendly', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80', rating: 4 },
    { id: 109, category: 'portrait-frames', name: 'Baroque Gold Statement Frame', price: '$149.00', tag: 'Luxury', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80', rating: 5 },
  ];
  
  // ─── 2. Canvas Paintings ───────────────────────────────────────────────────────
  const canvasPaintings: CategoryProduct[] = [
    { id: 201, category: 'canvas-paintings', name: 'Abstract Ocean Tides — 36×48"', price: '$189.00', tag: 'Original', image: 'https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=600&q=80', rating: 5, badge: 'New' },
    { id: 202, category: 'canvas-paintings', name: 'Golden Sunset Landscape', price: '$145.00', tag: 'Handpainted', image: 'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?w=600&q=80', rating: 5 },
    { id: 203, category: 'canvas-paintings', name: 'Botanical Watercolour Print', price: '$98.00', tag: 'Print', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', rating: 4 },
    { id: 204, category: 'canvas-paintings', name: 'Geometric Minimalist Triptych', price: '$220.00', tag: 'Set of 3', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80', rating: 4, badge: 'Hot' },
    { id: 205, category: 'canvas-paintings', name: 'Forest Dawn Oil Painting', price: '$310.00', tag: 'Original Oil', image: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600&q=80', rating: 5 },
    { id: 206, category: 'canvas-paintings', name: 'Modern Abstract Splatter', price: '$167.00', tag: 'Contemporary', image: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600&q=80', rating: 4 },
    { id: 207, category: 'canvas-paintings', name: 'Vintage Map Canvas Art', price: '$79.00', tag: 'Sale', image: 'https://images.unsplash.com/photo-1565799557186-8e23e9e9dbb9?w=600&q=80', rating: 3, badge: 'Sale' },
    { id: 208, category: 'canvas-paintings', name: 'Night Sky Acrylic Pour', price: '$134.00', tag: 'Handpainted', image: 'https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=600&q=80', rating: 5 },
    { id: 209, category: 'canvas-paintings', name: 'Floral Impressionist Canvas', price: '$158.00', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=600&q=80', rating: 4 },
  ];
  
  // ─── 3. Temple Art Prints ──────────────────────────────────────────────────────
  const templeArtPrints: CategoryProduct[] = [
    { id: 301, category: 'temple-art-prints', name: 'Lord Ganesha Gold Foil Print', price: '$65.00', tag: 'Spiritual', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80', rating: 5, badge: 'Hot' },
    { id: 302, category: 'temple-art-prints', name: 'Madhubani Durga Painting', price: '$89.00', tag: 'Folk Art', image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600&q=80', rating: 5 },
    { id: 303, category: 'temple-art-prints', name: 'Lotus Mandala Wall Print', price: '$49.00', tag: 'Spiritual', image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&q=80', rating: 4 },
    { id: 304, category: 'temple-art-prints', name: 'Radha Krishna Pattachitra', price: '$120.00', tag: 'Handpainted', image: 'https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=600&q=80', rating: 5, badge: 'New' },
    { id: 305, category: 'temple-art-prints', name: 'Om Symbol Brass Emboss Print', price: '$75.00', tag: 'Premium', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80', rating: 4 },
    { id: 306, category: 'temple-art-prints', name: 'Warli Tribal Art Canvas', price: '$55.00', tag: 'Folk Art', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', rating: 4 },
    { id: 307, category: 'temple-art-prints', name: 'Tanjore Gold Lakshmi', price: '$195.00', tag: 'Tanjore', image: 'https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=600&q=80', rating: 5 },
    { id: 308, category: 'temple-art-prints', name: 'Buddha Serenity Zen Print', price: '$58.00', tag: 'Zen', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80', rating: 4 },
    { id: 309, category: 'temple-art-prints', name: 'Kalamkari Krishna Flute', price: '$88.00', tag: 'Kalamkari', image: 'https://images.unsplash.com/photo-1541187714594-731ed82e544a?w=600&q=80', rating: 5 },
  ];
  
  // ─── 4. Wall Murals ────────────────────────────────────────────────────────────
  const wallMurals: CategoryProduct[] = [
    { id: 401, category: 'wall-murals', name: 'Tropical Jungle Panorama Mural', price: '$245.00', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', rating: 5, badge: 'Hot' },
    { id: 402, category: 'wall-murals', name: 'Marble Effect Full Wall Mural', price: '$189.00', tag: 'Luxury', image: 'https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?w=600&q=80', rating: 5 },
    { id: 403, category: 'wall-murals', name: 'Starry Night Galaxy Mural', price: '$210.00', tag: 'Dreamy', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80', rating: 4, badge: 'New' },
    { id: 404, category: 'wall-murals', name: 'Cityscape Skyline at Dusk', price: '$167.00', tag: 'Urban', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80', rating: 4 },
    { id: 405, category: 'wall-murals', name: 'Cherry Blossom Forest Mural', price: '$198.00', tag: 'Nature', image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&q=80', rating: 5 },
    { id: 406, category: 'wall-murals', name: 'Ocean Underwater World Mural', price: '$225.00', tag: 'Nature', image: 'https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=600&q=80', rating: 4 },
    { id: 407, category: 'wall-murals', name: 'Abstract Geometric Mural', price: '$145.00', tag: 'Modern', image: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&q=80', rating: 4 },
    { id: 408, category: 'wall-murals', name: 'Mountain Sunrise Panorama', price: '$178.00', tag: 'Sale', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', rating: 3, badge: 'Sale' },
    { id: 409, category: 'wall-murals', name: 'Vintage World Map Mural', price: '$155.00', tag: 'Vintage', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80', rating: 4 },
  ];
  
  // ─── 5. Modern Wallpapers ──────────────────────────────────────────────────────
  const modernWallpapers: CategoryProduct[] = [
    { id: 501, category: 'modern-wallpapers', name: 'Herringbone Textured Wallpaper', price: '$38.00', tag: 'Per Roll', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80', rating: 5 },
    { id: 502, category: 'modern-wallpapers', name: 'Blush Floral Boho Wallpaper', price: '$42.00', tag: 'Per Roll', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', rating: 4, badge: 'New' },
    { id: 503, category: 'modern-wallpapers', name: 'Dark Moody Botanical Print', price: '$55.00', tag: 'Premium', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', rating: 5, badge: 'Hot' },
    { id: 504, category: 'modern-wallpapers', name: 'Concrete Industrial Wallpaper', price: '$29.00', tag: 'Per Roll', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', rating: 3 },
    { id: 505, category: 'modern-wallpapers', name: 'Gold Geometric Repeat Pattern', price: '$65.00', tag: 'Luxury', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80', rating: 5 },
    { id: 506, category: 'modern-wallpapers', name: 'Soft Pastel Watercolour Wash', price: '$44.00', tag: 'Bedroom', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', rating: 4 },
    { id: 507, category: 'modern-wallpapers', name: 'Navy Blue Chinoiserie Toile', price: '$58.00', tag: 'Classic', image: 'https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?w=600&q=80', rating: 4 },
    { id: 508, category: 'modern-wallpapers', name: 'Terrazzo Stone Effect Paper', price: '$36.00', tag: 'Sale', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80', rating: 3, badge: 'Sale' },
    { id: 509, category: 'modern-wallpapers', name: 'Lush Green Tropical Leaves', price: '$48.00', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1619413378006-e6a90d35a4c2?w=600&q=80', rating: 5 },
  ];
  
  // ─── 6. Customize Blinds ──────────────────────────────────────────────────────
  const customizeBlinds: CategoryProduct[] = [
    { id: 601, category: 'customize-blinds', name: 'Bamboo Roman Shade — Custom', price: '$120.00', tag: 'Custom', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', rating: 5, badge: 'New' },
    { id: 602, category: 'customize-blinds', name: 'Blackout Roller Blind White', price: '$89.00', tag: 'Blackout', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80', rating: 5 },
    { id: 603, category: 'customize-blinds', name: 'Wooden Venetian Slat Blind', price: '$145.00', tag: 'Wood', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80', rating: 4 },
    { id: 604, category: 'customize-blinds', name: 'Sheer Linen Roman Blind', price: '$98.00', tag: 'Sheer', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', rating: 4, badge: 'Hot' },
    { id: 605, category: 'customize-blinds', name: 'Printed Floral Roller Blind', price: '$78.00', tag: 'Printed', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', rating: 4 },
    { id: 606, category: 'customize-blinds', name: 'Day-Night Zebra Blind', price: '$110.00', tag: 'Day/Night', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', rating: 5 },
    { id: 607, category: 'customize-blinds', name: 'Motorised Smart Blind', price: '$285.00', tag: 'Smart', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', rating: 5 },
    { id: 608, category: 'customize-blinds', name: 'Cellular Honeycomb Blind', price: '$135.00', tag: 'Insulating', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80', rating: 4, badge: 'Sale' },
    { id: 609, category: 'customize-blinds', name: 'Vertical Fabric Panel Blind', price: '$92.00', tag: 'Office', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80', rating: 3 },
  ];
  
  // ─── 7. Neon Signs ─────────────────────────────────────────────────────────────
  const neonSigns: CategoryProduct[] = [
    { id: 701, category: 'neon-signs', name: '"Good Vibes Only" Neon Sign', price: '$165.00', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80', rating: 5, badge: 'Hot' },
    { id: 702, category: 'neon-signs', name: 'Custom Name Neon in Pink', price: '$199.00', tag: 'Custom', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', rating: 5 },
    { id: 703, category: 'neon-signs', name: '"Open" Business LED Neon', price: '$89.00', tag: 'Commercial', image: 'https://images.unsplash.com/photo-1565799557186-8e23e9e9dbb9?w=600&q=80', rating: 4, badge: 'New' },
    { id: 704, category: 'neon-signs', name: 'Heart Shape Neon — Rose Gold', price: '$125.00', tag: 'Décor', image: 'https://images.unsplash.com/photo-1614362374642-0f29c3e1ba24?w=600&q=80', rating: 5 },
    { id: 705, category: 'neon-signs', name: '"Hustle" Motivational Neon', price: '$148.00', tag: 'Office', image: 'https://images.unsplash.com/photo-1545315003-c5ad6226c272?w=600&q=80', rating: 4 },
    { id: 706, category: 'neon-signs', name: 'Flamingo Tropical Neon Sign', price: '$178.00', tag: 'Trendy', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', rating: 4 },
    { id: 707, category: 'neon-signs', name: 'Moon & Stars Bedroom Neon', price: '$139.00', tag: 'Kids', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80', rating: 5 },
    { id: 708, category: 'neon-signs', name: 'Logo Custom Neon Business', price: '$299.00', tag: 'Custom', image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&q=80', rating: 5 },
    { id: 709, category: 'neon-signs', name: '"Eat Drink Be Merry" Kitchen', price: '$155.00', tag: 'Sale', image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80', rating: 3, badge: 'Sale' },
  ];
  
  // ─── 8. Backlit LED ────────────────────────────────────────────────────────────
  const backlitLed: CategoryProduct[] = [
    { id: 801, category: 'backlit-led', name: 'LED Backlit Canvas Art Panel', price: '$215.00', tag: 'Premium', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80', rating: 5, badge: 'New' },
    { id: 802, category: 'backlit-led', name: 'RGB Backlit Mirror Frame', price: '$189.00', tag: 'Smart', image: 'https://images.unsplash.com/photo-1612967834496-6f8abb3e9d4a?w=600&q=80', rating: 5 },
    { id: 803, category: 'backlit-led', name: 'Floating LED Wall Shelf', price: '$145.00', tag: 'Furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', rating: 4, badge: 'Hot' },
    { id: 804, category: 'backlit-led', name: 'LED Galaxy Projector Panel', price: '$98.00', tag: 'Ambience', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80', rating: 4 },
    { id: 805, category: 'backlit-led', name: 'Backlit Periodic Table Art', price: '$165.00', tag: 'Educational', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80', rating: 4 },
    { id: 806, category: 'backlit-led', name: 'Edge-Lit LED Glass Panel', price: '$245.00', tag: 'Luxury', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', rating: 5 },
    { id: 807, category: 'backlit-led', name: 'Sunrise Alarm LED Light Panel', price: '$79.00', tag: 'Wellness', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80', rating: 4 },
    { id: 808, category: 'backlit-led', name: 'LED Word Art — Motivational', price: '$110.00', tag: 'Sale', image: 'https://images.unsplash.com/photo-1536148935331-408321065b18?w=600&q=80', rating: 3, badge: 'Sale' },
    { id: 809, category: 'backlit-led', name: 'Backlit City Map LED Panel', price: '$198.00', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80', rating: 5 },
  ];
  
  // =============================================================================
  //  CATEGORY CONFIG MAP
  // =============================================================================
  export const CATEGORIES: Record<string, CategoryConfig> = {
    'portrait-frames': {
      slug: 'portrait-frames',
      name: 'Portrait Frames',
      tagline: 'Frame Every Precious Memory',
      description: 'Handcrafted and precision-made frames for every style — from ornate baroque gold to clean Scandinavian minimalism. Each frame is built to preserve your most cherished moments for generations.',
      heroImage: 'https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=1400&q=85',
      accent: '#BB976D',
      accentLight: '#fdf6ee',
      icon: '🖼️',
      filterTags: ['Gold', 'Black', 'Silver', 'Rustic', 'Minimalist', 'Ornate'],
      products: portraitFrames,
    },
    'canvas-paintings': {
      slug: 'canvas-paintings',
      name: 'Canvas Paintings',
      tagline: 'Original Art for Every Wall',
      description: 'From hand-painted originals to museum-quality prints, our canvas collection transforms blank walls into personal galleries. Each piece tells a story.',
      heroImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1400&q=85',
      accent: '#6B5CE7',
      accentLight: '#f3f1ff',
      icon: '🎨',
      filterTags: ['Abstract', 'Landscape', 'Floral', 'Geometric', 'Portrait', 'Oil'],
      products: canvasPaintings,
    },
    'temple-art-prints': {
      slug: 'temple-art-prints',
      name: 'Temple Art Prints',
      tagline: 'Sacred Art, Timeless Devotion',
      description: 'Authentic Indian temple art — Tanjore, Madhubani, Pattachitra, Kalamkari and more. Bring divine blessings and cultural heritage into your home with museum-quality prints.',
      heroImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400&q=85',
      accent: '#D4830A',
      accentLight: '#fff8ee',
      icon: '🪔',
      filterTags: ['Ganesha', 'Lakshmi', 'Krishna', 'Buddha', 'Mandala', 'Tanjore'],
      products: templeArtPrints,
    },
    'wall-murals': {
      slug: 'wall-murals',
      name: 'Wall Murals',
      tagline: 'Transform Your Room Entirely',
      description: 'Floor-to-ceiling statement murals that redefine any room. Easy-install, peel-and-stick wallpaper murals in hundreds of stunning designs — no professional required.',
      heroImage: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1400&q=85',
      accent: '#2E8B57',
      accentLight: '#f0faf4',
      icon: '🌿',
      filterTags: ['Nature', 'Urban', 'Abstract', 'Tropical', 'Galaxy', 'Vintage'],
      products: wallMurals,
    },
    'modern-wallpapers': {
      slug: 'modern-wallpapers',
      name: 'Modern Wallpapers',
      tagline: 'Layer Your Walls with Personality',
      description: 'Contemporary wallpaper designs that go beyond plain paint. Whether you prefer bold prints or subtle textures, our curated collection has the perfect pattern to define your space.',
      heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=85',
      accent: '#C0647A',
      accentLight: '#fdf1f3',
      icon: '🌸',
      filterTags: ['Textured', 'Floral', 'Geometric', 'Botanical', 'Metallic', 'Neutral'],
      products: modernWallpapers,
    },
    'customize-blinds': {
      slug: 'customize-blinds',
      name: 'Customize Blinds',
      tagline: 'Light Control, Your Way',
      description: 'Custom-cut window blinds made to your exact measurements. Choose from roller, roman, venetian, or motorised smart blinds in hundreds of fabrics and finishes.',
      heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85',
      accent: '#5B7FA6',
      accentLight: '#f0f5fa',
      icon: '🪟',
      filterTags: ['Blackout', 'Sheer', 'Bamboo', 'Motorised', 'Roman', 'Venetian'],
      products: customizeBlinds,
    },
    'neon-signs': {
      slug: 'neon-signs',
      name: 'Neon Signs',
      tagline: 'Light Up Your World',
      description: 'Custom LED neon signs for homes, businesses, events, and gifting. Handcrafted with energy-efficient LED flex tubing — vibrant, dimmable, and built to last 50,000+ hours.',
      heroImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1400&q=85',
      accent: '#FF3CAC',
      accentLight: '#fff0f8',
      icon: '💡',
      filterTags: ['Custom', 'Quote', 'Heart', 'Business', 'Kids', 'Wedding'],
      products: neonSigns,
    },
    'backlit-led': {
      slug: 'backlit-led',
      name: 'Backlit LED',
      tagline: 'Art That Glows',
      description: 'Next-generation LED backlit panels that fuse art with ambient lighting. Perfect for accent walls, gaming rooms, offices, and anywhere you want dramatic atmosphere.',
      heroImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1400&q=85',
      accent: '#00C9FF',
      accentLight: '#f0fbff',
      icon: '✨',
      filterTags: ['Canvas', 'Mirror', 'Shelf', 'Galaxy', 'Smart', 'Luxury'],
      products: backlitLed,
    },
  };
  
  export const getCategoryConfig = (slug: string): CategoryConfig | undefined =>
    CATEGORIES[slug];