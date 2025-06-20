import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
 <EditorPreview
          {...mockProps}
          portfolio={{
            ...mockPortfolio,
            title: 'Update 1',
            tagline: 'Tagline 1',
          }}
          previewMode="mobile"
        />

      expect(screen.getByText('Hero: Update 1')).toBeInTheDocument();
      expect(screen.getByText('Tagline 1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long content', async () => {
      const longContent = 'A'.repeat(1000);

      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          title: longContent,
          bio: longContent,
        },
      });

      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });

    it('should handle special characters in content', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          title: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
          tagline: '你好世界 🌍 émojis & ñovelty',
        },
      });

      expect(screen.getByText(/Special chars/)).toBeInTheDocument();
      expect(screen.getByText(/你好世界.*émojis/)).toBeInTheDocument();
    });

    it('should handle undefined preview mode gracefully', async () => {
      renderEditorPreview({
        ...mockProps,
        previewMode: undefined as any,
      });

      // Should default to desktop or handle gracefully
      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });
  });
});
