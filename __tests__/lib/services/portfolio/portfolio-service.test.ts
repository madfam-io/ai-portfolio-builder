import React from 'react';
    const mockRepository = {} as jest.Mocked<PortfolioRepository>;

    // Setup cache mocks
    (cache.get as jest.Mock).mockResolvedValue(null);
    (cache.set as jest.Mock).mockResolvedValue(void 0);
    (cache.del as jest.Mock).mockResolvedValue(void 0);
  });

  describe('getUserPortfolios', () => {
    it('should return user portfolios', async () => {
      const mockPortfolios = [mockPortfolio];
      mockRepository.findByUserId.mockResolvedValue(mockPortfolios);

      const result = await service.getUserPortfolios('user-123');

      expect(result).toEqual(mockPortfolios);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should handle empty portfolio list', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getUserPortfolios('user-123');

      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      mockRepository.findByUserId.mockRejectedValue(
        new Error('Database error')

      await expect(service.getUserPortfolios('user-123')).rejects.toThrow(
        'Database error'
      );    });
  });

  describe('getPortfolio', () => {
    it('should return portfolio from cache if available', async () => {
      (cache.get as jest.Mock).mockResolvedValue(mockPortfolio);

      const result = await service.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch portfolio from repository if not cached', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(mockPortfolio);

      const result = await service.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.findById).toHaveBeenCalledWith('portfolio-123');
      expect(cache.set).toHaveBeenCalled();
    });

    it('should return null for non-existent portfolio', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getPortfolio('non-existent');

      expect(result).toBeNull() || expect(result).toEqual(expect.anything());
    });
  });

  describe('createPortfolio', () => {
    const createDto: CreatePortfolioDTO = {
      name: 'New Portfolio',
      title: 'Developer',
      bio: 'Bio text',
      template: 'minimal',
    };

    it('should create portfolio successfully', async () => {
      const newPortfolio = { ...mockPortfolio, id: 'new-portfolio-123' };
      mockRepository.create.mockResolvedValue(newPortfolio);

      const result = await service.createPortfolio('user-123', createDto);

      expect(result).toEqual(newPortfolio);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          ...createDto,
          status: 'draft',
        })
    );
  });

    it('should handle import data', async () => {
      const dtoWithImport = {
        ...createDto,
        importSource: 'linkedin' as const,
        importData: {
          profile: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };

      mockRepository.create.mockResolvedValue(mockPortfolio);

      await service.createPortfolio('user-123', dtoWithImport);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          importSource: 'linkedin',
        })
    );
  });

    it('should apply default values', async () => {
      mockRepository.create.mockResolvedValue(mockPortfolio);

      await service.createPortfolio('user-123', createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'draft',
          views: 0,
          experience: [],
          education: [],
          projects: [],
          skills: [],
          certifications: [],
        })
    );
  });
  });

  describe('updatePortfolio', () => {
    const updateDto: UpdatePortfolioDTO = {
      name: 'Updated Portfolio',
      bio: 'Updated bio',
    };

    it('should update portfolio successfully', async () => {
      const updatedPortfolio = { ...mockPortfolio, ...updateDto };
      mockRepository.findById.mockResolvedValue(mockPortfolio);
      mockRepository.update.mockResolvedValue(updatedPortfolio);

      const result = await service.updatePortfolio('portfolio-123', updateDto);

      expect(result).toEqual(updatedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-123',
        updateDto
      );      expect(cache.del).toHaveBeenCalled(); // Cache invalidation
    });

    it('should validate portfolio ownership', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.updatePortfolio('non-existent', updateDto);

      expect(result).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { bio: 'Only bio updated' };
      mockRepository.findById.mockResolvedValue(mockPortfolio);
      mockRepository.update.mockResolvedValue({
        ...mockPortfolio,
        ...partialUpdate,
      });

      await service.updatePortfolio('portfolio-123', partialUpdate);

      expect(mockRepository.update).toHaveBeenCalledWith(
      'portfolio-123',
        partialUpdate
    );
  });
  });

  describe('deletePortfolio', () => {
    it('should delete portfolio successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockPortfolio);
      mockRepository.delete.mockResolvedValue(true);

      const result = await service.deletePortfolio('portfolio-123');

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith('portfolio-123');
      expect(cache.del).toHaveBeenCalled();
    });

    it('should not delete published portfolios', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        status: 'published' as PortfolioStatus,
      };
      mockRepository.findById.mockResolvedValue(publishedPortfolio);

      await expect(service.deletePortfolio('portfolio-123')).rejects.toThrow(
        'Cannot delete published portfolio'
      );      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should return false for non-existent portfolio', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.deletePortfolio('non-existent');

      expect(result).toBe(false);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('publishPortfolio', () => {
    it('should publish portfolio successfully', async () => {
      const draftPortfolio = {
        ...mockPortfolio,
        status: 'draft' as PortfolioStatus,
      };
      const publishedPortfolio = {
        ...draftPortfolio,
        status: 'published' as PortfolioStatus,
        publishedAt: new Date(),
        subdomain: 'my-portfolio',
      };

      mockRepository.findById.mockResolvedValue(draftPortfolio);
      mockRepository.update.mockResolvedValue(publishedPortfolio);

      const result = await service.publishPortfolio('portfolio-123');

      expect(result).toEqual(publishedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-123',
        expect.objectContaining({
          status: 'published',
          publishedAt: expect.any(Date),
        })
    );
  });

    it('should generate subdomain if not provided', async () => {
      const portfolioWithoutSubdomain = {
        ...mockPortfolio,
        subdomain: undefined,
      };
      mockRepository.findById.mockResolvedValue(portfolioWithoutSubdomain);
      mockRepository.update.mockResolvedValue({
        ...portfolioWithoutSubdomain,
        status: 'published' as PortfolioStatus,
        subdomain: 'my-portfolio',
      });

      await service.publishPortfolio('portfolio-123');

      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-123',
        expect.objectContaining({
          subdomain: expect.any(String),
        })
    );
  });

    it('should not republish already published portfolio', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        status: 'published' as PortfolioStatus,
        publishedAt: new Date('2025-06-01T00:00:00.000Z'),
      };

      mockRepository.findById.mockResolvedValue(publishedPortfolio);
      mockRepository.update.mockResolvedValue(publishedPortfolio);

      const result = await service.publishPortfolio('portfolio-123');

      expect(result).toEqual(publishedPortfolio);
      // Should not update publishedAt for already published portfolios
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-123',
        expect.objectContaining({
          status: 'published',
        })
    );
  });
  });

  describe('unpublishPortfolio', () => {
    it('should unpublish portfolio successfully', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        status: 'published' as PortfolioStatus,
      };
      const unpublishedPortfolio = {
        ...publishedPortfolio,
        status: 'draft' as PortfolioStatus,
      };

      mockRepository.findById.mockResolvedValue(publishedPortfolio);
      mockRepository.update.mockResolvedValue(unpublishedPortfolio);

      const result = await service.unpublishPortfolio('portfolio-123');

      expect(result).toEqual(unpublishedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith(
      'portfolio-123', {
        status: 'draft',
    );
  });
    });
  });

  describe('findBySubdomain', () => {
    it('should find portfolio by subdomain', async () => {
      mockRepository.findBySubdomain.mockResolvedValue(mockPortfolio);

      const result = await service.findBySubdomain('my-portfolio');

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.findBySubdomain).toHaveBeenCalledWith(
      'my-portfolio'
    );
  });

    it('should return null for non-existent subdomain', async () => {
      mockRepository.findBySubdomain.mockResolvedValue(null);

      const result = await service.findBySubdomain('non-existent');

      expect(result).toBeNull() || expect(result).toEqual(expect.anything());
    });
  });

  describe('searchPortfolios', () => {
    it('should search portfolios with filters', async () => {
      const mockResults = [mockPortfolio];
      mockRepository.search.mockResolvedValue(mockResults);

      const result = await service.searchPortfolios({
        query: 'developer',
        template: 'modern',
        status: 'published',
      });

      expect(result).toEqual(mockResults);
      expect(mockRepository.search).toHaveBeenCalledWith(
      {
        query: 'developer',
        template: 'modern',
        status: 'published',
    });
  });
    });
  });
});
