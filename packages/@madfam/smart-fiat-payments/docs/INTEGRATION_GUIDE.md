# Integration Guide

This guide walks you through integrating @madfam/smart-payments into your application.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [React Integration](#react-integration)
3. [Next.js Integration](#nextjs-integration)
4. [Express Integration](#express-integration)
5. [Advanced Scenarios](#advanced-scenarios)
6. [Best Practices](#best-practices)

## Basic Setup

### Installation

```bash
npm install @madfam/smart-payments
```

### Basic Configuration

```typescript
import { SmartPayments } from '@madfam/smart-payments';

const smartPayments = new SmartPayments({
  // Gateway configurations
  gateways: [
    // Use default configurations
  ],
  
  // Pricing strategy
  pricingStrategy: {
    enableGeographicalPricing: true,
    baseCountry: 'US',
    baseCurrency: 'USD',
    discounts: {
      // Country-specific discounts (optional)
      'IN': 0.75, // 75% of base price
      'BR': 0.60, // 60% of base price
    },
    roundingStrategy: 'nearest',
    displayLocalCurrency: true,
  },
  
  // Fraud prevention
  fraudPrevention: {
    enableVPNDetection: true,
    blockVPNDiscounts: true,
    requireCardCountryMatch: false,
    maxRiskScore: 75,
    suspiciousCountries: ['XX'], // Add your list
  },
  
  // UI preferences
  ui: {
    showSavingsAmount: true,
    showProcessingTime: true,
    showGatewayLogos: true,
    showFeeBreakdown: true,
  },
  
  // Caching
  cache: {
    enableBINCache: true,
    enableGeoCache: true,
    ttl: 300, // 5 minutes
    maxSize: 1000,
  },
});
```

## React Integration

### Payment Form Component

```typescript
import React, { useState } from 'react';
import { SmartPayments } from '@madfam/smart-payments';

const smartPayments = new SmartPayments(config);

export function PaymentForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await smartPayments.processPayment({
        amount: { amount: 99.99, currency: 'USD' },
        cardNumber,
        ipAddress: await fetchUserIP(), // Your IP detection
        headers: {
          'accept-language': navigator.language,
        },
      });
      
      setPaymentOptions(result.paymentOptions);
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        placeholder="Card Number"
        maxLength={19}
      />
      
      {paymentOptions && (
        <PaymentOptions options={paymentOptions} />
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Continue'}
      </button>
    </form>
  );
}
```

### Payment Options Display

```typescript
function PaymentOptions({ options }) {
  const { recommendedGateway, alternativeGateways, userChoice } = options;
  
  return (
    <div>
      <div className="recommended-gateway">
        <h3>Recommended Payment Method</h3>
        <GatewayOption gateway={recommendedGateway} primary />
      </div>
      
      {userChoice && alternativeGateways.length > 0 && (
        <div className="alternative-gateways">
          <h4>Other Options</h4>
          {alternativeGateways.map((gateway) => (
            <GatewayOption 
              key={gateway.gateway} 
              gateway={gateway} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GatewayOption({ gateway, primary }) {
  return (
    <div className={`gateway-option ${primary ? 'primary' : ''}`}>
      <h4>{gateway.displayName}</h4>
      <p>Processing fee: {gateway.fees.display}</p>
      <p>Total: {gateway.estimatedTotal.display}</p>
      
      {gateway.benefits.map((benefit) => (
        <span key={benefit} className="benefit">✓ {benefit}</span>
      ))}
      
      {gateway.installmentOptions && (
        <select>
          <option>Pay in full</option>
          {gateway.installmentOptions.map((option) => (
            <option key={option.months} value={option.months}>
              {option.label} - {option.monthlyAmount.display}/mo
            </option>
          ))}
        </select>
      )}
      
      <button>Pay with {gateway.displayName}</button>
    </div>
  );
}
```

### Real-time Card Validation

```typescript
import { validateCardNumber, formatCardNumber, detectCardBrand } from '@madfam/smart-payments/card-intelligence';

function CardInput() {
  const [value, setValue] = useState('');
  const [brand, setBrand] = useState('unknown');
  const [errors, setErrors] = useState([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\s/g, '');
    
    // Format for display
    const formatted = formatCardNumber(input);
    setValue(formatted);
    
    // Detect brand
    if (input.length >= 4) {
      setBrand(detectCardBrand(input));
    }
    
    // Validate when complete
    if (input.length >= 13) {
      const validation = validateCardNumber(input);
      setErrors(validation.errors);
    }
  };
  
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Card Number"
      />
      {brand !== 'unknown' && (
        <img src={`/cards/${brand}.svg`} alt={brand} />
      )}
      {errors.map((error) => (
        <span key={error.code} className="error">
          {error.message}
        </span>
      ))}
    </div>
  );
}
```

## Next.js Integration

### API Route

```typescript
// pages/api/process-payment.ts or app/api/process-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SmartPayments } from '@madfam/smart-payments';

const smartPayments = new SmartPayments(config);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get real IP address (considering proxies)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const result = await smartPayments.processPayment({
      amount: body.amount,
      cardNumber: body.cardNumber,
      ipAddress: ip,
      headers: Object.fromEntries(req.headers.entries()),
      customer: body.customer,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
```

### Server Component

```typescript
// app/checkout/page.tsx
import { SmartPayments } from '@madfam/smart-payments';
import { headers } from 'next/headers';

const smartPayments = new SmartPayments(config);

export default async function CheckoutPage() {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  // Pre-fetch geographical context
  const geoContext = await smartPayments.lookupGeo(ip, {
    'accept-language': headersList.get('accept-language') || 'en',
  });
  
  return (
    <CheckoutForm 
      initialCountry={geoContext.context?.ipCountry}
      detectedCurrency={geoContext.context?.ipCurrency}
    />
  );
}
```

## Express Integration

### Middleware Setup

```typescript
import express from 'express';
import { SmartPayments } from '@madfam/smart-payments';

const app = express();
const smartPayments = new SmartPayments(config);

// Middleware to extract IP
app.use((req, res, next) => {
  req.clientIP = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress ||
                 'unknown';
  next();
});

// Payment endpoint
app.post('/api/process-payment', async (req, res) => {
  try {
    const result = await smartPayments.processPayment({
      amount: req.body.amount,
      cardNumber: req.body.cardNumber,
      ipAddress: req.clientIP,
      headers: req.headers,
      customer: req.user, // From auth middleware
    });
    
    res.json(result);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});
```

### WebSocket for Real-time Updates

```typescript
import { Server } from 'socket.io';

io.on('connection', (socket) => {
  socket.on('validate-card', async (cardNumber) => {
    try {
      const cardInfo = await smartPayments.lookupBIN(
        cardNumber.substring(0, 8)
      );
      
      socket.emit('card-info', cardInfo);
    } catch (error) {
      socket.emit('card-error', error.message);
    }
  });
  
  socket.on('check-pricing', async (data) => {
    try {
      const result = await smartPayments.processPayment({
        amount: data.amount,
        cardNumber: data.cardNumber,
        ipAddress: socket.handshake.address,
      });
      
      socket.emit('pricing-update', result.pricing);
    } catch (error) {
      socket.emit('pricing-error', error.message);
    }
  });
});
```

## Advanced Scenarios

### Custom BIN Database

```typescript
import { BINDatabase } from '@madfam/smart-payments/card-intelligence';

class CustomBINDatabase implements BINDatabase {
  async lookup(bin: string) {
    // Your custom implementation
    const response = await fetch(`https://your-api.com/bin/${bin}`);
    const data = await response.json();
    
    return {
      bin: data.bin,
      brand: data.brand,
      type: data.type,
      issuerCountry: data.country,
      issuerName: data.bank,
      features: {
        supports3DSecure: data.supports_3ds,
        supportsInstallments: data.supports_installments,
        supportsTokenization: true,
        requiresCVV: true,
      },
    };
  }
  
  isSupported(bin: string): boolean {
    return bin.length >= 6;
  }
}

const smartPayments = new SmartPayments({
  ...config,
  binDatabase: new CustomBINDatabase(),
});
```

### Multi-Currency Support

```typescript
// Detect user's preferred currency
const getUserCurrency = async (request) => {
  const result = await smartPayments.processPayment({
    amount: { amount: 100, currency: 'USD' },
    ipAddress: request.ip,
  });
  
  return result.pricing.displayCurrency;
};

// Convert prices dynamically
const convertPrice = async (amount, fromCurrency, toCurrency) => {
  // Use your exchange rate service
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};
```

### A/B Testing Gateway Selection

```typescript
class ABTestRouter {
  constructor(private smartPayments: SmartPayments) {}
  
  async routeWithTest(request, testGroup) {
    const result = await this.smartPayments.processPayment(request);
    
    if (testGroup === 'B') {
      // Swap primary and alternative for test group
      const [alt] = result.paymentOptions.alternativeGateways;
      if (alt) {
        return {
          ...result,
          paymentOptions: {
            ...result.paymentOptions,
            recommendedGateway: alt,
            alternativeGateways: [
              result.paymentOptions.recommendedGateway,
              ...result.paymentOptions.alternativeGateways.slice(1),
            ],
          },
        };
      }
    }
    
    return result;
  }
}
```

### Subscription Handling

```typescript
async function setupSubscription(customerId: string, planId: string) {
  // Get customer's default payment method
  const customer = await getCustomer(customerId);
  
  // Process with smart routing
  const result = await smartPayments.processPayment({
    amount: getSubscriptionPrice(planId),
    cardNumber: customer.defaultCard,
    customer,
  });
  
  // Use recommended gateway for subscription
  const gateway = result.paymentOptions.recommendedGateway.gateway;
  
  // Create subscription with selected gateway
  switch (gateway) {
    case 'stripe':
      return createStripeSubscription(customer, planId);
    case 'paypal':
      return createPayPalSubscription(customer, planId);
    // ... other gateways
  }
}
```

## Best Practices

### 1. Security

```typescript
// Never log sensitive data
const safeRequest = {
  ...request,
  cardNumber: request.cardNumber ? '****' + request.cardNumber.slice(-4) : undefined,
};
console.log('Processing payment:', safeRequest);

// Validate all inputs
import { z } from 'zod';

const PaymentSchema = z.object({
  amount: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3),
  }),
  cardNumber: z.string().min(13).max(19).optional(),
});

const validatedData = PaymentSchema.parse(requestData);
```

### 2. Performance

```typescript
// Pre-warm cache
async function prewarmCache() {
  const commonBINs = ['411111', '555555', '378282'];
  
  await Promise.all(
    commonBINs.map(bin => smartPayments.lookupBIN(bin))
  );
}

// Implement request batching
class BatchProcessor {
  private queue: Array<{ request: any; resolve: Function }> = [];
  private timer: NodeJS.Timeout | null = null;
  
  async process(request) {
    return new Promise((resolve) => {
      this.queue.push({ request, resolve });
      
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 50);
      }
    });
  }
  
  private async flush() {
    const batch = this.queue.splice(0);
    const results = await Promise.all(
      batch.map(({ request }) => smartPayments.processPayment(request))
    );
    
    batch.forEach(({ resolve }, i) => resolve(results[i]));
    this.timer = null;
  }
}
```

### 3. Error Handling

```typescript
// Comprehensive error handling
async function processPaymentSafely(request) {
  try {
    return await smartPayments.processPayment(request);
  } catch (error) {
    // Log to monitoring service
    logger.error('Payment processing failed', {
      error: error.message,
      code: error.code,
      request: sanitizeRequest(request),
    });
    
    // Fallback to default gateway
    return {
      paymentOptions: {
        recommendedGateway: getDefaultGateway(),
        alternativeGateways: [],
        userChoice: false,
        reasoning: {
          userFriendlyExplanation: 'Using standard payment processing',
        },
      },
      warnings: ['Some features may be limited'],
    };
  }
}
```

### 4. Testing

```typescript
// Mock for testing
import { SmartPayments } from '@madfam/smart-payments';

jest.mock('@madfam/smart-payments');

const mockSmartPayments = SmartPayments as jest.MockedClass<typeof SmartPayments>;

beforeEach(() => {
  mockSmartPayments.prototype.processPayment.mockResolvedValue({
    paymentOptions: {
      recommendedGateway: {
        gateway: 'stripe',
        displayName: 'Stripe',
        fees: { display: '2.9% + $0.30' },
        estimatedTotal: { amount: 103.20, currency: 'USD' },
        benefits: ['Fast processing'],
      },
      alternativeGateways: [],
      userChoice: false,
    },
  });
});
```