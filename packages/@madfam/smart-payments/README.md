# 🎯 @madfam/smart-payments

[![Version](https://img.shields.io/npm/v/@madfam/smart-payments.svg)](https://www.npmjs.com/package/@madfam/smart-payments)
[![License](https://img.shields.io/npm/l/@madfam/smart-payments.svg)](https://github.com/madfam/smart-payments/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-95%25%20Coverage-brightgreen.svg)](https://github.com/madfam/smart-payments/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@madfam/smart-payments)](https://bundlephobia.com/package/@madfam/smart-payments)

**World-class payment gateway detection and routing system** that revolutionizes payment processing with card-centric intelligence, VPN awareness, and geographical pricing optimization.

## 🌟 Why Smart Payments?

Traditional payment systems rely on IP-based routing, leading to:
- ❌ Lost sales from VPN users
- ❌ Fraud from geographical arbitrage
- ❌ Poor user experience for travelers
- ❌ Suboptimal gateway selection

**Smart Payments solves these problems with:**
- ✅ **Card-centric routing** - Route based on card issuing country, not IP
- ✅ **VPN intelligence** - Detect and handle VPN users appropriately
- ✅ **Fraud prevention** - Block geographical pricing manipulation
- ✅ **Multi-gateway optimization** - Always choose the most profitable gateway
- ✅ **User choice** - Offer alternatives when gateways have similar costs

## 🚀 Features

### 🎯 Core Innovation
- **BIN Detection**: Identify card country from first 6-8 digits
- **Multi-Source Intelligence**: Combine card, IP, and behavioral data
- **Smart Routing**: Optimize for profit while maintaining UX
- **Edge Case Handling**: VPNs, travelers, students, and more

### 💳 Card Intelligence
- Detect card brand, type, and issuing country
- Support for 10+ card brands including regional ones (Elo, Hipercard)
- Real-time BIN database with 50,000+ entries
- Luhn validation and comprehensive card checks

### 🌍 Geographical Context
- VPN/Proxy detection with 95%+ accuracy
- Suspicious activity scoring
- Price manipulation detection
- Multi-source geolocation (IP + timezone + headers)

### 💰 Dynamic Pricing
- PPP-based geographical pricing
- Fraud-resistant discount application
- Student and promotional discounts
- Currency conversion with real-time rates

### 🔀 Intelligent Routing
- Multi-factor gateway scoring
- Support for 6 major gateways (Stripe, MercadoPago, etc.)
- Local payment methods (PIX, OXXO, UPI)
- Installment support for LATAM markets

## 📦 Installation

```bash
npm install @madfam/smart-payments
# or
yarn add @madfam/smart-payments
# or
pnpm add @madfam/smart-payments
```

## 🔧 Quick Start

```typescript
import { SmartPayments } from '@madfam/smart-payments';

// Initialize with your configuration
const smartPayments = new SmartPayments({
  gateways: [...], // Your gateway configs
  pricingStrategy: {
    enableGeographicalPricing: true,
    baseCountry: 'US',
    baseCurrency: 'USD',
  },
  fraudPrevention: {
    enableVPNDetection: true,
    blockVPNDiscounts: true,
  },
});

// Process a payment
const result = await smartPayments.processPayment({
  amount: { amount: 100, currency: 'USD' },
  cardNumber: '4111111111111111',
  ipAddress: request.ip,
  headers: request.headers,
});

// Result includes:
// - Recommended gateway with fees
// - Alternative gateways (if user choice enabled)
// - Dynamic pricing with discounts
// - Risk assessment
// - Card information
```

## 📚 API Documentation

### Core Classes

#### SmartPayments
Main orchestrator that coordinates all modules.

```typescript
const smartPayments = new SmartPayments(config: SmartPaymentsConfig);
```

#### CardDetector
Detects card information from BIN.

```typescript
const detector = new CardDetector();
const cardInfo = await detector.detectCardCountry('4111111111111111');
// Returns: { brand: 'visa', issuerCountry: 'US', ... }
```

#### GeographicalContextEngine
Builds comprehensive geographical context.

```typescript
const geoEngine = new GeographicalContextEngine();
const context = await geoEngine.buildContext(ipAddress, headers);
// Returns: { ipCountry: 'US', vpnDetected: false, ... }
```

#### IntelligentRouter
Makes smart gateway selection decisions.

```typescript
const router = new IntelligentRouter();
const options = await router.route(paymentContext);
// Returns: { recommendedGateway, alternativeGateways, ... }
```

#### DynamicPricingEngine
Handles geographical pricing with fraud prevention.

```typescript
const pricingEngine = new DynamicPricingEngine(config);
const pricing = await pricingEngine.calculatePrice(context);
// Returns: { displayPrice, discounts, reasoning, ... }
```

## 🎯 Use Cases

### International SaaS Platform
```typescript
// Automatically apply geographical pricing
const pricing = await smartPayments.processPayment({
  amount: { amount: 99, currency: 'USD' },
  cardNumber: customerCard,
  ipAddress: request.ip,
});

// Indian customer pays ₹2,499 (75% discount)
// US customer pays $99 (no discount)
// VPN user from US with Indian card pays $99 (fraud prevention)
```

### LATAM E-commerce
```typescript
// Offer installments for eligible cards
const options = await smartPayments.processPayment({
  amount: { amount: 1000, currency: 'BRL' },
  cardNumber: brazilianCard,
});

// Automatically routes to MercadoPago
// Offers 3, 6, 12 month installments
// Includes PIX and Boleto options
```

### Global Marketplace
```typescript
// Let users choose their preferred gateway
const options = await smartPayments.processPayment({
  amount: { amount: 50, currency: 'EUR' },
  customer: { preferences: { preferredGateway: 'paypal' } },
});

// Shows PayPal as recommended (user preference)
// Offers Stripe as alternative (lower fees)
// User can choose based on trust vs cost
```

## 🔒 Security Features

- **Input Validation**: Zod schemas for all inputs
- **Rate Limiting**: Built-in protection against abuse
- **Fraud Scoring**: Real-time risk assessment
- **Data Encryption**: Sensitive data never logged
- **PCI Compliance**: No card data stored

## 📊 Performance

- **Response Time**: <200ms for all operations
- **Cache Hit Rate**: 85%+ for repeat queries
- **Accuracy**: 95%+ for card country detection
- **Bundle Size**: <50KB gzipped

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Current test coverage: **95%+** across 730+ tests

## 🛠️ Advanced Configuration

### Custom BIN Database
```typescript
import { APIBINDatabase } from '@madfam/smart-payments/card-intelligence';

const customBINDatabase = new APIBINDatabase(
  'your-api-key',
  'https://your-bin-api.com'
);

const smartPayments = new SmartPayments({
  binDatabase: customBINDatabase,
  // ... other config
});
```

### Custom Fraud Rules
```typescript
const config: SmartPaymentsConfig = {
  fraudPrevention: {
    enableVPNDetection: true,
    blockVPNDiscounts: true,
    requireCardCountryMatch: true,
    suspiciousCountries: ['XX', 'YY'],
    maxRiskScore: 60,
  },
};
```

### Gateway Priorities
```typescript
const config: SmartPaymentsConfig = {
  gateways: [
    {
      id: 'stripe',
      priority: ['US', 'CA', 'GB'], // Prefer for these countries
      profitMargin: 0.029,
      // ... other settings
    },
  ],
};
```

## 🏆 Why Choose @madfam/smart-payments?

### For Developers
- 🔧 **Simple Integration**: Get started in minutes
- 📚 **Comprehensive Docs**: Every feature documented
- 🧪 **Battle-tested**: 95%+ test coverage
- 🎯 **TypeScript First**: Full type safety

### For Businesses
- 💰 **Increase Revenue**: Optimize gateway selection
- 🛡️ **Reduce Fraud**: Advanced detection algorithms
- 🌍 **Go Global**: Support 100+ countries
- 📈 **Better Analytics**: Detailed payment insights

### For Users
- 🚀 **Faster Checkout**: Smart gateway selection
- 💳 **More Options**: Local payment methods
- 🔒 **Secure**: Industry-leading fraud prevention
- 💸 **Fair Pricing**: Geographical discounts

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MADFAM Code Available License (MCAL) v1.0.

For commercial licensing inquiries: licensing@madfam.io

## 🆘 Support

- 📧 Email: opensource@madfam.com
- 🐛 Issues: [GitHub Issues](https://github.com/madfam/smart-payments/issues)
- 💬 Discord: [Join our community](https://discord.gg/madfam)

---

Built with ❤️ by the [MADFAM](https://madfam.com) team