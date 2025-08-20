# Cyoda OMS - Order Management System

A modern e-commerce platform built with React that integrates with Cyoda's Entity Database Management System (EDBMS) using standard REST API endpoints.

## 🚀 Features

- **Standard Cyoda API Integration**: Direct integration with `/entity/{Entity}` endpoints
- **Product Catalog**: Browse and search products with real-time filtering
- **Shopping Cart**: Persistent cart state with Cyoda entity synchronization
- **Checkout Flow**: Complete order workflow with user and address management
- **Order Tracking**: Real-time order status and lifecycle management
- **Demo Interface**: Interactive API testing and entity management

## 🏗️ Architecture

This application uses Cyoda's standard Entity-Driven Architecture with REST API endpoints:

- **Standard Entity Endpoints**: All operations use `/entity/{Entity}` REST patterns
- **Entities**: Product, Cart, Order, User, Address (stored as Cyoda entities)
- **Workflows**: State transitions managed through entity updates
- **Service Layer**: TypeScript services wrapping standard CRUD operations
- **Error Handling**: Centralized error management with CyodaApiError class

### Entity Operations

All entities use standard REST patterns:
- `POST /entity/{Entity}` - Create new entity
- `GET /entity/{Entity}/{id}` - Get entity by ID  
- `GET /entity/{Entity}` - List/search entities
- `PATCH /entity/{Entity}/{id}` - Update entity
- `DELETE /entity/{Entity}/{id}` - Delete entity

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Access to a Cyoda instance
- Cyoda API credentials (client ID and secret)

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Cyoda API Configuration
VITE_CYODA_API_BASE=https://your-cyoda-instance.cyoda.net
VITE_CYODA_TOKEN=your_bearer_token_here

# Optional: For OAuth flow
VITE_CYODA_CLIENT_ID=your_client_id
VITE_CYODA_CLIENT_SECRET=your_client_secret
```

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd cyoda-oms
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Cyoda credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to `http://localhost:5173`

## 🔑 Cyoda Authentication

### Option 1: Bearer Token (Quick Start)

1. Obtain a bearer token from your Cyoda instance
2. Set `VITE_CYODA_TOKEN` in your environment variables

### Option 2: OAuth Client Credentials Flow

1. Create a machine-to-machine client in Cyoda
2. Set `VITE_CYODA_CLIENT_ID` and `VITE_CYODA_CLIENT_SECRET`
3. The application will automatically handle token exchange

### Token Management

```javascript
// Manual token refresh example
import { cyodaFetch } from '@/services/cyoda';

const refreshToken = async () => {
  const response = await fetch('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.VITE_CYODA_CLIENT_ID!,
      client_secret: process.env.VITE_CYODA_CLIENT_SECRET!,
    }),
  });
  return response.json();
};
```

## 📋 API Usage

### Basic Entity Operations

```javascript
import { ProductService, CartService, OrderService } from '@/services/cyoda';

// Create a product
const product = await ProductService.create({
  name: "Racing Wheel",
  description: "High-performance carbon wheelset",
  price: 1299.99,
  quantityAvailable: 5,
  category: "Wheels"
});

// Search products
const results = await ProductService.search("carbon", "Wheels");

// Manage cart
const cart = await CartService.create({
  lines: [],
  totalItems: 0,
  grandTotal: 0,
  status: 'NEW'
});
```

### SQL Queries

```javascript
import { querySql } from '@/services/cyoda';

// Direct SQL queries
const products = await querySql(`
  SELECT * FROM Product 
  WHERE category = ? AND price < ?
`, { category: 'Wheels', maxPrice: 1500 });

// Aggregations
const summary = await querySql(`
  SELECT category, COUNT(*) as count, AVG(price) as avg_price
  FROM Product 
  GROUP BY category
`);
```

### Error Handling

```javascript
import { CyodaApiError } from '@/services/cyoda';

try {
  await ProductService.create(productData);
} catch (error) {
  if (error instanceof CyodaApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    console.error('Response:', error.response);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🧪 Testing the Integration

### Demo Interface

1. Navigate to `/demo` in the application
2. Test entity creation with the product form
3. Execute SQL queries directly against Cyoda
4. View live data from your Cyoda instance

### Manual Testing Commands

```bash
# Test API connectivity
curl -H "Authorization: Bearer $VITE_CYODA_TOKEN" \
     $VITE_CYODA_API_BASE/entity/Product

# Create test product
curl -X POST $VITE_CYODA_API_BASE/entity/Product \
     -H "Authorization: Bearer $VITE_CYODA_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Product",
       "description": "Testing API integration",
       "price": 99.99,
       "quantityAvailable": 10,
       "category": "Test"
     }'
```

## 📁 Project Structure

```
src/
├── config/
│   └── cyoda.config.ts        # Cyoda configuration
├── services/
│   └── cyoda.ts              # API client and entity services
├── hooks/
│   └── useAsync.ts           # Async operation hooks
├── store/
│   └── cartStore.ts          # Cart state management
├── types/
│   └── index.ts              # TypeScript interfaces
├── pages/
│   ├── ProductList.tsx       # Product catalog
│   ├── Cart.tsx              # Shopping cart
│   ├── Checkout.tsx          # Order placement
│   ├── OrderConfirmation.tsx # Order success
│   └── CyodaDemo.tsx         # API testing interface
└── components/
    ├── ProductCard.tsx       # Product display
    └── Layout.tsx            # Application layout
```

## 🔄 Workflows

### Cart Workflow
```
NEW → ACTIVE → CHECKING_OUT → CONVERTED
```

### Order Lifecycle
```
WAITING_TO_FULFILL → PICKING → SENT
```

### User Identification
```
ANON → IDENTIFIED
```

## 🚀 Deployment

### Production Environment

```bash
# Build for production
npm run build

# Set production environment variables
export VITE_CYODA_API_BASE=https://prod-cyoda-instance.cyoda.net
export VITE_CYODA_TOKEN=prod_bearer_token
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📚 Additional Resources

- [Cyoda Documentation](https://docs.cyoda.net/)
- [EDBMS Concepts](https://docs.cyoda.net/#concepts/edbms)
- [Entity Workflows](https://medium.com/@paul_42036/entity-workflows-for-event-driven-architectures-4d491cf898a5)
- [API Reference](https://docs.cyoda.net/#api-reference)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with your Cyoda instance
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details
