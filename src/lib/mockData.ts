import { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    sku: "CY-SRV-001",
    name: "Cyoda Enterprise License",
    description: "Full enterprise license for Cyoda event-driven backend platform with unlimited events processing",
    price: 24999,
    quantityAvailable: 10,
    category: "Licenses",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "CY-CON-002", 
    name: "Professional Services - Implementation",
    description: "Complete implementation package including setup, configuration, and training for Cyoda platform",
    price: 15000,
    quantityAvailable: 5,
    category: "Services",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "CY-SUP-003",
    name: "Premium Support Package",
    description: "24/7 priority support with dedicated technical account manager and SLA guarantees",
    price: 8500,
    quantityAvailable: 15,
    category: "Support",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "CY-TRN-004",
    name: "Developer Training Program",
    description: "Comprehensive 5-day training program for development teams on Cyoda platform best practices",
    price: 5500,
    quantityAvailable: 8,
    category: "Training",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "CY-ADD-005",
    name: "Additional Environment License",
    description: "Extra development/staging environment license for multi-stage deployment pipelines",
    price: 3200,
    quantityAvailable: 20,
    category: "Licenses",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "CY-INT-006",
    name: "Custom Integration Package",
    description: "Bespoke integration development for connecting legacy systems to Cyoda platform",
    price: 12000,
    quantityAvailable: 3,
    category: "Services",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "CY-AUD-007",
    name: "Security Audit & Compliance",
    description: "Comprehensive security assessment and compliance verification for enterprise deployments",
    price: 7500,
    quantityAvailable: 6,
    category: "Services",
    imageUrl: "/api/placeholder/400/300"
  },
  {
    sku: "CY-EXT-008",
    name: "Extended Warranty",
    description: "3-year extended warranty and maintenance coverage for all Cyoda platform components",
    price: 4200,
    quantityAvailable: 12,
    category: "Support",
    imageUrl: "/api/placeholder/400/300"
  }
];

export const categories = ["All", "Licenses", "Services", "Support", "Training"];