/**
 * @madfam/smart-payments
 * 
 * World-class payment gateway detection and routing system with AI-powered optimization
 * 
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 * 
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 * 
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * VPN/Proxy Detection Module
 * 
 * Detects VPN, proxy, Tor, and datacenter IPs
 */

import { VPNCheckResult } from '../types';

// Known VPN/Proxy providers (partial list for demo)
const VPN_PROVIDERS = new Set([
  'NordVPN',
  'ExpressVPN',
  'Surfshark',
  'CyberGhost',
  'Private Internet Access',
  'IPVanish',
  'ProtonVPN',
  'Mullvad',
  'TunnelBear',
  'Windscribe',
]);

// Known datacenter/hosting providers
const HOSTING_PROVIDERS = new Set([
  'Amazon',
  'Google',
  'Microsoft',
  'DigitalOcean',
  'Linode',
  'Vultr',
  'OVH',
  'Hetzner',
  'Cloudflare',
  'Akamai',
]);

// Tor exit node patterns
const TOR_PATTERNS = [
  /tor-exit/i,
  /tornode/i,
  /exit\.tor/i,
  /\.tor\./i,
];

export interface VPNDetectorConfig {
  apiKey?: string;
  timeout?: number;
  enableMLDetection?: boolean;
}

/**
 * VPN and proxy detection service
 */
export class VPNDetector {
  constructor(private config: VPNDetectorConfig = {}) {}
  
  /**
   * Detect if IP is VPN/Proxy/Tor
   */
  async detect(ipAddress: string): Promise<VPNCheckResult> {
    // In production, would use services like:
    // - IPQualityScore
    // - MaxMind
    // - IP2Proxy
    // - Custom ML models
    
    // For demo, use heuristics and patterns
    const checks = await Promise.all([
      this.checkKnownVPNRanges(ipAddress),
      this.checkHostingProviders(ipAddress),
      this.checkTorExitNodes(ipAddress),
      this.checkBehavioralPatterns(ipAddress),
    ]);
    
    // Combine results
    const isVPN = checks[0].isVPN || false;
    const isProxy = checks[0].isProxy || false;
    const isHosting = checks[1] || false;
    const isTor = checks[2] || false;
    
    // Calculate confidence based on multiple signals
    const confidence = this.calculateConfidence({
      isVPN,
      isProxy,
      isHosting,
      isTor,
      behavioral: checks[3],
    });
    
    // Identify provider if possible
    const provider = this.identifyProvider(ipAddress);
    
    return {
      isVPN,
      isProxy,
      isTor,
      isHosting,
      confidence,
      provider,
    };
  }
  
  /**
   * Check if IP belongs to known VPN ranges
   */
  private async checkKnownVPNRanges(ipAddress: string): Promise<{
    isVPN: boolean;
    isProxy: boolean;
  }> {
    // Simplified check based on IP patterns
    // In production, would use comprehensive IP range databases
    
    const parts = ipAddress.split('.').map(Number);
    
    // Common VPN ranges (simplified)
    const vpnRanges = [
      { start: [104, 200], end: [104, 255] }, // NordVPN range
      { start: [45, 32], end: [45, 95] },     // ExpressVPN range
      { start: [185, 230], end: [185, 255] }, // Surfshark range
    ];
    
    for (const range of vpnRanges) {
      if (this.isInRange(parts, range)) {
        return { isVPN: true, isProxy: false };
      }
    }
    
    // Common proxy ranges
    const proxyRanges = [
      { start: [192, 241], end: [192, 255] }, // Common proxy range
      { start: [89, 248], end: [89, 255] },   // European proxies
    ];
    
    for (const range of proxyRanges) {
      if (this.isInRange(parts, range)) {
        return { isVPN: false, isProxy: true };
      }
    }
    
    return { isVPN: false, isProxy: false };
  }
  
  /**
   * Check if IP belongs to hosting providers
   */
  private async checkHostingProviders(ipAddress: string): Promise<boolean> {
    // Check against known datacenter ranges
    const parts = ipAddress.split('.').map(Number);
    
    // AWS ranges (simplified)
    if (parts[0] === 54 || parts[0] === 52 || parts[0] === 35) {
      return true;
    }
    
    // Google Cloud ranges
    if (parts[0] === 35 && parts[1] >= 190 && parts[1] <= 255) {
      return true;
    }
    
    // DigitalOcean ranges
    if (parts[0] === 104 && parts[1] >= 16 && parts[1] <= 31) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if IP is a Tor exit node
   */
  private async checkTorExitNodes(ipAddress: string): Promise<boolean> {
    // In production, would check against Tor exit node list
    // For demo, check patterns
    
    const parts = ipAddress.split('.').map(Number);
    
    // Known Tor exit node patterns
    if (parts[0] === 192 && parts[1] === 42 && parts[2] >= 100) {
      return true;
    }
    
    if (parts[0] === 23 && parts[1] >= 92 && parts[1] <= 95) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check behavioral patterns that indicate VPN usage
   */
  private async checkBehavioralPatterns(ipAddress: string): Promise<number> {
    // Behavioral indicators (would be more sophisticated in production)
    let score = 0;
    
    const parts = ipAddress.split('.').map(Number);
    
    // Sequential IPs often indicate datacenter
    if (parts[3] === 1 || parts[3] === 254) {
      score += 0.2;
    }
    
    // Round numbers in third octet
    if (parts[2] % 10 === 0) {
      score += 0.1;
    }
    
    // Check for residential patterns (inverse)
    const residentialPatterns = [
      parts[0] >= 70 && parts[0] <= 100,  // Common residential ranges
      parts[1] >= 100 && parts[1] <= 200, // Varied second octet
    ];
    
    if (!residentialPatterns.some(p => p)) {
      score += 0.3;
    }
    
    return Math.min(1, score);
  }
  
  /**
   * Calculate confidence score
   */
  private calculateConfidence(signals: {
    isVPN: boolean;
    isProxy: boolean;
    isHosting: boolean;
    isTor: boolean;
    behavioral: number;
  }): number {
    let confidence = 0;
    
    if (signals.isVPN) confidence += 0.9;
    if (signals.isProxy) confidence += 0.8;
    if (signals.isHosting) confidence += 0.7;
    if (signals.isTor) confidence += 0.95;
    
    confidence += signals.behavioral * 0.5;
    
    // Normalize to 0-1
    return Math.min(1, confidence);
  }
  
  /**
   * Try to identify the VPN/proxy provider
   */
  private identifyProvider(ipAddress: string): string | undefined {
    // In production, would use reverse DNS lookup and ASN data
    const parts = ipAddress.split('.').map(Number);
    
    // Simplified provider detection
    if (parts[0] === 104 && parts[1] >= 200) return 'NordVPN';
    if (parts[0] === 45 && parts[1] >= 32 && parts[1] <= 95) return 'ExpressVPN';
    if (parts[0] === 185 && parts[1] >= 230) return 'Surfshark';
    if (parts[0] === 54 || parts[0] === 52) return 'Amazon AWS';
    if (parts[0] === 35 && parts[1] >= 190) return 'Google Cloud';
    
    return undefined;
  }
  
  /**
   * Check if IP parts are in range
   */
  private isInRange(
    parts: number[],
    range: { start: number[]; end: number[] }
  ): boolean {
    if (parts[0] < range.start[0] || parts[0] > range.end[0]) return false;
    if (parts[0] === range.start[0] && parts[1] < range.start[1]) return false;
    if (parts[0] === range.end[0] && parts[1] > range.end[1]) return false;
    return true;
  }
  
  /**
   * Batch check multiple IPs
   */
  async detectBatch(ipAddresses: string[]): Promise<Map<string, VPNCheckResult>> {
    const results = new Map<string, VPNCheckResult>();
    
    // Process in parallel for performance
    const checks = await Promise.all(
      ipAddresses.map(async ip => ({
        ip,
        result: await this.detect(ip),
      }))
    );
    
    for (const { ip, result } of checks) {
      results.set(ip, result);
    }
    
    return results;
  }
  
  /**
   * Get VPN probability score (0-100)
   */
  getVPNProbability(result: VPNCheckResult): number {
    let score = 0;
    
    if (result.isTor) return 100;
    if (result.isVPN && result.confidence > 0.8) return 90;
    if (result.isProxy && result.confidence > 0.8) return 85;
    if (result.isHosting) score += 60;
    
    score += result.confidence * 30;
    
    return Math.min(100, Math.round(score));
  }
}