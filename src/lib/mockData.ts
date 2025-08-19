import { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    sku: "BK-DRV-001",
    name: "Shimano Ultegra Di2 Derailleur",
    description: "Electronic rear derailleur with precise shifting and wireless connectivity",
    price: 459,
    quantityAvailable: 15,
    category: "Drivetrain",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "BK-WHL-002", 
    name: "Carbon Fiber Wheelset",
    description: "Lightweight carbon wheelset with ceramic bearings for racing performance",
    price: 1299,
    quantityAvailable: 8,
    category: "Wheels",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "BK-FRM-003",
    name: "Titanium Frame Set",
    description: "Premium titanium frame with lifetime warranty and custom geometry options",
    price: 2499,
    quantityAvailable: 5,
    category: "Frames",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "BK-BRK-004",
    name: "Hydraulic Disc Brake Set",
    description: "High-performance hydraulic disc brakes with 160mm rotors and tool-free adjustment",
    price: 329,
    quantityAvailable: 22,
    category: "Brakes",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "BK-SDP-005",
    name: "Clipless Pedal System",
    description: "Professional clipless pedals with adjustable float and dual-sided entry",
    price: 149,
    quantityAvailable: 30,
    category: "Pedals",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "BK-CHN-006",
    name: "11-Speed Chain",
    description: "Durable 11-speed chain with quick-link technology and corrosion resistance",
    price: 45,
    quantityAvailable: 50,
    category: "Drivetrain",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "BK-HLM-007",
    name: "Aero Road Helmet",
    description: "Lightweight aerodynamic helmet with MIPS technology and 24 ventilation ports",
    price: 199,
    quantityAvailable: 18,
    category: "Safety",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "BK-TYR-008",
    name: "Tubeless Road Tires",
    description: "High-performance tubeless tires with puncture protection and low rolling resistance",
    price: 89,
    quantityAvailable: 40,
    category: "Tires",
    imageUrl: "/api/placeholder/400/300"
  }
];

export const categories = ["All", "Drivetrain", "Wheels", "Frames", "Brakes", "Pedals", "Safety", "Tires"];