import React from 'react';
l<VariantConfig> = {}
    ): VariantConfig => ({
      id: '1',
      name: 'Variant A',
      description: 'Test variant',
      trafficPercentage: 50,
      isControl: false,
      templateId: 'developer',
      ...overrides,
    });

    it('should pass validation for valid experiment', async () => {
      const variants: VariantConfig[] = [
        createVariant({
          id: '1',
          name: 'Control',
          isControl: true,
          trafficPercentage: 50,
        }),
        createVariant({ id: '2', name: 'Variant B', trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors).toEqual({});
    });

    it('should require experiment name', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 50 }),
        createVariant({ trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('', variants);

      expect(errors.name).toBe('Experiment name is required');
    });

    it('should require experiment name to not be only whitespace', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 50 }),
        createVariant({ trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('   ', variants);

      expect(errors.name).toBe('Experiment name is required');
    });

    it('should require at least 2 variants', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 100 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.variants).toBe('At least 2 variants are required');
    });

    it('should require 0 variants to show error', async () => {
      const variants: VariantConfig[] = [];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.variants).toBe('At least 2 variants are required');
    });

    it('should validate traffic allocation equals 100%', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 30 }),
        createVariant({ trafficPercentage: 40 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.traffic).toBe(
        'Traffic allocation must equal 100% (currently 70%)'

    });

    it('should validate traffic allocation over 100%', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 60 }),
        createVariant({ trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.traffic).toBe(
        'Traffic allocation must equal 100% (currently 110%)'

    });

    it('should require a control variant', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: false, trafficPercentage: 50 }),
        createVariant({ isControl: false, trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.control).toBe('One variant must be marked as control');
    });

    it('should allow multiple errors', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: false, trafficPercentage: 30 }),
      ];

      const errors = validateExperimentForm('', variants);

      expect(errors.name).toBe('Experiment name is required');
      expect(errors.variants).toBe('At least 2 variants are required');
      expect(errors.traffic).toBe(
        'Traffic allocation must equal 100% (currently 30%)'

      expect(errors.control).toBe('One variant must be marked as control');
    });

    it('should handle decimal traffic percentages', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 33.33 }),
        createVariant({ trafficPercentage: 33.33 }),
        createVariant({ trafficPercentage: 33.34 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors).toEqual({});
    });

    it('should handle multiple control variants (only check that at least one exists)', async () => {
      const variants: VariantConfig[] = [
        createVariant({ isControl: true, trafficPercentage: 50 }),
        createVariant({ isControl: true, trafficPercentage: 50 }),
      ];

      const errors = validateExperimentForm('Test Experiment', variants);

      expect(errors.control).toBeUndefined();
    });
  });

  describe('getRemainingTrafficPercentage', () => {
    const createVariant = (trafficPercentage: number): VariantConfig => ({
      id: '1',
      name: 'Variant',
      description: 'Test variant',
      trafficPercentage,
      isControl: false,
      templateId: 'developer',
    });

    it('should calculate remaining traffic for empty variants', async () => {
      const remaining = getRemainingTrafficPercentage([]);
      expect(remaining).toBe(100);
    });

    it('should calculate remaining traffic for single variant', async () => {
      const variants = [createVariant(30)];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBe(70);
    });

    it('should calculate remaining traffic for multiple variants', async () => {
      const variants = [
        createVariant(25),
        createVariant(25),
        createVariant(30),
      ];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBe(20);
    });

    it('should return 0 when traffic is fully allocated', async () => {
      const variants = [createVariant(50), createVariant(50)];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBe(0);
    });

    it('should return negative value when over-allocated', async () => {
      const variants = [createVariant(60), createVariant(50)];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBe(-10);
    });

    it('should handle decimal percentages', async () => {
      const variants = [createVariant(33.33), createVariant(33.33)];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBeCloseTo(33.34, 2);
    });

    it('should handle very small percentages', async () => {
      const variants = [
        createVariant(0.1),
        createVariant(0.1),
        createVariant(0.1),
      ];
      const remaining = getRemainingTrafficPercentage(variants);
      expect(remaining).toBeCloseTo(99.7, 2);
    });
  });
});
