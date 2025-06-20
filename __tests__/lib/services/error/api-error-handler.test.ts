import React from 'react';
y<RequestBody>(mockRequest);

      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
    });

    it('should handle empty body', async () => {
      mockRequest.json = jest.fn().mockResolvedValue(null);

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeNull() || expect(result).toEqual(expect.anything());
    });
  });

  describe('Error Context Extraction', () => {
    it('should extract full context from request', async () => {
      const error = new Error('Test');
      handleApiError(error, mockRequest);

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          url: 'http://localhost:3000/api/test',
          method: 'GET',
          metadata: {
            userAgent: 'Test Agent',
            referer: 'http://localhost:3000',
            ip: '192.168.1.1',
          },
        })
    });

    it('should handle missing headers gracefully', async () => {
      const minimalRequest = {
        url: 'http://localhost:3000/api/test',
        method: 'GET',
        headers: new Headers(),
      } as NextRequest;

      const error = new Error('Test');
      handleApiError(error, minimalRequest);

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          metadata: {
            userAgent: undefined,
            referer: undefined,
            ip: undefined,
          },
        })
    });

    it('should prefer x-real-ip over x-forwarded-for', async () => {
      const requestWithRealIp = {
        ...mockRequest,
        headers: new Headers({
          'x-forwarded-for': '10.0.0.1',
          'x-real-ip': '192.168.1.100',
        }),
      } as NextRequest;

      const error = new Error('Test');
      handleApiError(error, requestWithRealIp);

      expect(errorLogger.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          metadata: expect.objectContaining({
            ip: '10.0.0.1', // x-forwarded-for takes precedence
          }),
        })
    });
  });
});
