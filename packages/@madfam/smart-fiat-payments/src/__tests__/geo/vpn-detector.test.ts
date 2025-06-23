/**
 * @madfam/smart-fiat-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * VPN Detector Test Suite
 *
 * Tests for VPN/Proxy detection functionality
 */

import { VPNDetector } from '../../geo/vpn-detector';
import { VPNCheckResult } from '../../types';

describe('VPNDetector', () => {
  let detector: VPNDetector;

  beforeEach(() => {
    detector = new VPNDetector();
  });

  describe('detect', () => {
    it('should detect known VPN IP ranges', async () => {
      // Known NordVPN range
      const result = await detector.detect('104.200.50.123');

      expect(result.isVPN).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.provider).toBe('NordVPN');
    });

    it('should detect proxy servers', async () => {
      // Known proxy range
      const result = await detector.detect('192.241.100.50');

      expect(result.isProxy).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect hosting providers', async () => {
      // AWS IP
      const result = await detector.detect('54.123.45.67');

      expect(result.isHosting).toBe(true);
      expect(result.provider).toBe('Amazon AWS');
    });

    it('should detect Tor exit nodes', async () => {
      // Known Tor pattern
      const result = await detector.detect('192.42.116.100');

      expect(result.isTor).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should not flag residential IPs', async () => {
      // Typical residential IP
      const result = await detector.detect('75.150.123.45');

      expect(result.isVPN).toBe(false);
      expect(result.isProxy).toBe(false);
      expect(result.isHosting).toBe(false);
      expect(result.isTor).toBe(false);
      expect(result.confidence).toBeLessThan(0.3);
    });

    it('should identify multiple VPN providers', async () => {
      const providers = [
        { ip: '45.50.123.45', provider: 'ExpressVPN' },
        { ip: '185.240.123.45', provider: 'Surfshark' },
      ];

      for (const { ip, provider } of providers) {
        const result = await detector.detect(ip);
        expect(result.provider).toBe(provider);
      }
    });

    it('should calculate confidence based on multiple signals', async () => {
      // IP with multiple suspicious characteristics
      const result = await detector.detect('104.200.1.254');

      // Should have higher confidence due to:
      // - VPN range
      // - Sequential IP (.1 or .254)
      // - Non-residential pattern
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('detectBatch', () => {
    it('should process multiple IPs efficiently', async () => {
      const ips = [
        '104.200.50.123',
        '75.150.123.45',
        '54.123.45.67',
        '192.241.100.50',
      ];

      const results = await detector.detectBatch(ips);

      expect(results.size).toBe(4);
      expect(results.get('104.200.50.123')?.isVPN).toBe(true);
      expect(results.get('75.150.123.45')?.isVPN).toBe(false);
      expect(results.get('54.123.45.67')?.isHosting).toBe(true);
      expect(results.get('192.241.100.50')?.isProxy).toBe(true);
    });
  });

  describe('getVPNProbability', () => {
    it('should return 100 for Tor nodes', () => {
      const result: VPNCheckResult = {
        isVPN: false,
        isProxy: false,
        isTor: true,
        isHosting: false,
        confidence: 0.95,
      };

      expect(detector.getVPNProbability(result)).toBe(100);
    });

    it('should return high probability for confident VPN', () => {
      const result: VPNCheckResult = {
        isVPN: true,
        isProxy: false,
        isTor: false,
        isHosting: false,
        confidence: 0.9,
      };

      expect(detector.getVPNProbability(result)).toBe(90);
    });

    it('should return moderate probability for hosting', () => {
      const result: VPNCheckResult = {
        isVPN: false,
        isProxy: false,
        isTor: false,
        isHosting: true,
        confidence: 0.8,
      };

      const probability = detector.getVPNProbability(result);
      expect(probability).toBeGreaterThanOrEqual(60);
      expect(probability).toBeLessThanOrEqual(90);
    });

    it('should return low probability for residential', () => {
      const result: VPNCheckResult = {
        isVPN: false,
        isProxy: false,
        isTor: false,
        isHosting: false,
        confidence: 0.1,
      };

      expect(detector.getVPNProbability(result)).toBeLessThan(30);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid IP formats gracefully', async () => {
      const result = await detector.detect('not.an.ip.address');

      // Invalid IPs are treated as potential VPNs with behavioral scoring
      expect(result.isVPN).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle empty IP', async () => {
      const result = await detector.detect('');

      expect(result.isVPN).toBe(false);
      // Empty IP still gets some behavioral scoring
      expect(result.confidence).toBe(0.15);
    });

    it('should detect datacenter sequential IPs', async () => {
      const sequential = ['192.168.1.1', '10.0.0.254'];

      for (const ip of sequential) {
        const result = await detector.detect(ip);
        // Private IPs should not be flagged
        expect(result.isVPN).toBe(false);
      }
    });
  });
});
