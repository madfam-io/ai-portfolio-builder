# API Documentation

## Table of Contents

- [SmartPayments](#smartpayments)
- [Card Intelligence](#card-intelligence)
- [Geographical Context](#geographical-context)
- [Routing](#routing)
- [Pricing](#pricing)
- [Types](#types)
- [Error Handling](#error-handling)

## SmartPayments

The main orchestrator class that coordinates all payment processing modules.

### Constructor

```typescript
new SmartPayments(config: SmartPaymentsConfig)
```

#### Parameters

- `config` - Configuration object containing:
  - `gateways` - Array of gateway configurations
  - `pricingStrategy` - Pricing rules and settings
  - `fraudPrevention` - Fraud detection settings
  - `ui` - UI display preferences
  - `cache` - Caching configuration

### Methods

#### processPayment

Processes a payment request through the entire smart payments pipeline.

```typescript
async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse>
```

**Parameters:**
- `request.amount` - Payment amount with currency
- `request.cardNumber` - Optional card number for BIN detection
- `request.ipAddress` - Customer IP address
- `request.headers` - HTTP headers for context
- `request.customer` - Optional customer data
- `request.requestedCountry` - Optional country for pricing
- `request.discountCode` - Optional discount code

**Returns:**
- `paymentOptions` - Recommended and alternative gateways
- `cardInfo` - Detected card information
- `geoContext` - Geographical context
- `riskAssessment` - Fraud risk analysis
- `pricing` - Dynamic pricing calculation
- `warnings` - Any warnings or alerts

**Example:**
```typescript
const response = await smartPayments.processPayment({
  amount: { amount: 100, currency: 'USD', display: '$100' },
  cardNumber: '4111111111111111',
  ipAddress: '8.8.8.8',
  headers: { 'accept-language': 'en-US' }
});
```

#### lookupBIN

Performs BIN lookup to get card information.

```typescript
async lookupBIN(bin: string): Promise<BINLookupResponse>
```

#### lookupGeo

Performs geographical lookup from IP address.

```typescript
async lookupGeo(ipAddress: string, headers?: Record<string, string>): Promise<GeoLookupResponse>
```

#### calculateGatewayFees

Calculates processing fees for a specific gateway.

```typescript
calculateGatewayFees(gateway: Gateway, amount: Money, isInternational?: boolean): FeeCalculation
```

#### getAvailableGateways

Gets list of available gateways for a country.

```typescript
getAvailableGateways(country: string): Gateway[]
```

#### validateDiscountCode

Validates a discount code.

```typescript
validateDiscountCode(code: string, context: ProcessPaymentRequest): boolean
```

## Card Intelligence

### CardDetector

Detects card information from card numbers.

#### Constructor

```typescript
new CardDetector(config?: CardDetectorConfig)
```

**Config Options:**
- `binDatabase` - Custom BIN database implementation
- `cacheSize` - Max cached entries (default: 1000)
- `cacheTTL` - Cache TTL in seconds (default: 3600)

#### Methods

##### detectCardCountry

```typescript
async detectCardCountry(cardNumber: string): Promise<CardInfo>
```

Detects comprehensive card information including:
- Issuing country
- Card brand and type
- Supported gateways
- Local payment methods
- Card features (3DS, installments, etc.)

##### validateCard

```typescript
async validateCard(cardNumber: string): Promise<ValidationResult>
```

Validates card number with:
- Luhn algorithm check
- Length validation
- Brand pattern matching

##### suggestOptimalGateway

```typescript
async suggestOptimalGateway(cardInfo: CardInfo): Promise<Gateway>
```

Suggests the best gateway based on card information.

### Validators

Utility functions for card validation.

#### validateCardNumber

```typescript
validateCardNumber(cardNumber: string): ValidationResult
```

#### validateExpiry

```typescript
validateExpiry(month: string, year: string): ValidationResult
```

#### validateCVV

```typescript
validateCVV(cvv: string, cardBrand?: CardBrand): ValidationResult
```

#### detectCardBrand

```typescript
detectCardBrand(cardNumber: string): CardBrand
```

#### formatCardNumber

```typescript
formatCardNumber(cardNumber: string, brand?: CardBrand): string
```

Formats card number for display (e.g., "4111 1111 1111 1111").

#### maskCardNumber

```typescript
maskCardNumber(cardNumber: string): string
```

Masks card number showing only last 4 digits (e.g., "••••••••••••1111").

## Geographical Context

### GeographicalContextEngine

Builds comprehensive geographical context from multiple signals.

#### Constructor

```typescript
new GeographicalContextEngine(config?: ContextEngineConfig)
```

**Config Options:**
- `ipinfoToken` - IPInfo API token
- `enableVPNDetection` - Enable VPN detection (default: true)
- `suspiciousCountries` - List of high-risk countries
- `cacheSize` - Max cached entries
- `cacheTTL` - Cache TTL in seconds

#### Methods

##### buildContext

```typescript
async buildContext(ipAddress: string, headers?: Record<string, string>): Promise<GeographicalContext>
```

Builds context including:
- IP geolocation
- VPN/proxy detection
- Risk scoring
- Timezone and language detection

##### assessRisk

```typescript
assessRisk(
  context: GeographicalContext,
  cardCountry?: string,
  customer?: Customer
): RiskAssessment
```

Assesses fraud risk based on:
- VPN usage
- Country mismatches
- Customer history
- Suspicious patterns

##### detectGeographicalArbitrage

```typescript
detectGeographicalArbitrage(
  cardCountry: string,
  ipCountry: string | null,
  vpnDetected: boolean,
  priceCountry: string
): boolean
```

### VPNDetector

Detects VPN, proxy, and datacenter IPs.

#### Methods

##### detect

```typescript
async detect(ipAddress: string): Promise<VPNCheckResult>
```

Returns detection results with confidence scores.

##### getVPNProbability

```typescript
getVPNProbability(result: VPNCheckResult): number
```

Returns VPN probability as percentage (0-100).

### PriceManipulationDetector

Detects attempts to manipulate geographical pricing.

#### Methods

##### detectManipulation

```typescript
detectManipulation(
  geoContext: GeographicalContext,
  cardInfo: CardInfo | null,
  customer: Customer | null,
  requestedCountry?: string
): ManipulationCheck
```

## Routing

### IntelligentRouter

Makes intelligent gateway routing decisions.

#### Constructor

```typescript
new IntelligentRouter(config?: RouterConfig)
```

**Config Options:**
- `enableUserChoice` - Show alternatives to users
- `userChoiceThreshold` - Score difference for showing alternatives
- `preferProfitableGateways` - Optimize for profit

#### Methods

##### route

```typescript
async route(context: PaymentContext): Promise<PaymentOptions>
```

Routes payment considering:
- Transaction fees
- Local payment methods
- Geographic optimization
- Customer preferences
- Risk factors

### GatewayFeeCalculator

Calculates gateway transaction fees.

#### Methods

##### calculateFees

```typescript
calculateFees(
  gateway: Gateway,
  amount: Money,
  isInternational?: boolean,
  installments?: number
): FeeBreakdown
```

##### getEffectiveRate

```typescript
getEffectiveRate(gateway: Gateway, amount: Money, isInternational?: boolean): number
```

##### compareGateways

```typescript
compareGateways(gateways: Gateway[], amount: Money, isInternational?: boolean): ComparisonResult[]
```

## Pricing

### DynamicPricingEngine

Handles geographical pricing with fraud prevention.

#### Constructor

```typescript
new DynamicPricingEngine(config: DynamicPricingConfig)
```

**Config Options:**
- `strategy` - Pricing strategy settings
- `enableManipulationDetection` - Enable fraud detection
- `customPPPIndices` - Custom country multipliers
- `customDiscounts` - Additional discount rules
- `minimumPrice` - Minimum allowed price

#### Methods

##### calculatePrice

```typescript
async calculatePrice(context: PricingContext): Promise<PriceCalculation>
```

Calculates dynamic pricing with:
- PPP adjustments
- Discount application
- Fraud prevention
- Currency conversion

##### getCountryPrice

```typescript
async getCountryPrice(basePrice: Money, country: string): Promise<Money>
```

Gets price for specific country.

##### validateDiscountCode

```typescript
validateDiscountCode(code: string, context: PricingContext): Discount | null
```

## Types

### Core Types

```typescript
interface Money {
  amount: number;
  currency: string;
  display?: string;
}

interface CardInfo {
  bin: string;
  lastFour?: string;
  brand: CardBrand;
  type: CardType;
  issuerCountry: string;
  issuerName?: string;
  issuerCurrency?: string;
  supportedGateways: Gateway[];
  preferredGateway?: Gateway;
  localPaymentMethods?: LocalPaymentMethod[];
  features: CardFeatures;
}

interface GeographicalContext {
  ipCountry: string | null;
  ipRegion?: string;
  ipCity?: string;
  ipCurrency: string;
  vpnDetected: boolean;
  vpnConfidence: number;
  proxyDetected: boolean;
  timezone: string;
  language: string;
  suspiciousActivity: boolean;
  riskScore: number;
}

interface PaymentOptions {
  recommendedGateway: GatewayOption;
  alternativeGateways: GatewayOption[];
  userChoice: boolean;
  reasoning: SelectionReasoning;
  pricingContext: PriceCalculation;
}
```

### Enums

```typescript
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'elo' | 'hipercard' | 'unknown';

type CardType = 'credit' | 'debit' | 'prepaid' | 'unknown';

type Gateway = 'stripe' | 'mercadopago' | 'lemonsqueezy' | 'paypal' | 'razorpay' | 'payu' | 'custom';
```

## Error Handling

### SmartPaymentsError

Base error class for all smart payments errors.

```typescript
class SmartPaymentsError extends Error {
  constructor(message: string, code: string, details?: any)
}
```

### Error Codes

- `BIN_LOOKUP_ERROR` - BIN lookup failed
- `GEO_LOOKUP_ERROR` - Geographical lookup failed
- `CONFIGURATION_ERROR` - Invalid configuration
- `PROCESSING_ERROR` - Payment processing failed

### Example Error Handling

```typescript
try {
  const result = await smartPayments.processPayment(request);
} catch (error) {
  if (error instanceof SmartPaymentsError) {
    console.error(`Error ${error.code}: ${error.message}`);
    console.error('Details:', error.details);
  }
}
```