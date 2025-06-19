#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const testFile = '__tests__/app/api/v1/ai/optimize-project/route.test.ts';

console.log(`Fixing optimize-project route test...`);

let content = fs.readFileSync(testFile, 'utf8');

// Fix 1: Update request body format to match the schema
content = content.replace(
  /const requestBody = \{[\s\S]*?project: \{[\s\S]*?\},[\s\S]*?\};/g,
  (match) => {
    // Extract the project properties
    const titleMatch = match.match(/title:\s*['"`]([^'"`]+)['"`]/);
    const descMatch = match.match(/description:\s*['"`]([^'"`]+)['"`]/);
    const techMatch = match.match(/technologies:\s*\[([^\]]+)\]/);
    
    if (titleMatch && descMatch && techMatch) {
      return `const requestBody = {
        title: '${titleMatch[1]}',
        description: '${descMatch[1]}',
        technologies: [${techMatch[1]}],
        context: {
          targetAudience: 'employers',
          emphasize: 'technical',
        },
      };`;
    }
    return match;
  }
);

// Fix 2: Update test for projects with short descriptions
content = content.replace(
  /const request = createMockRequest\(\{[\s\S]*?project: \{[\s\S]*?title: 'Project',[\s\S]*?description: 'Short',[\s\S]*?\}[\s\S]*?\}\);/,
  `const request = createMockRequest({
        title: 'Project',
        description: 'Short', // Too short
        technologies: ['JavaScript'],
      });`
);

// Fix 3: Update test for missing title
content = content.replace(
  /const request = createMockRequest\(\{[\s\S]*?project: \{[\s\S]*?description: 'Some description',[\s\S]*?\}[\s\S]*?\}\);/,
  `const request = createMockRequest({
        description: 'Some description',
        technologies: ['JavaScript'],
      });`
);

// Fix 4: Update test for no credits
content = content.replace(
  /const requestBody = \{[\s\S]*?project: \{[\s\S]*?title: 'Project',[\s\S]*?description: 'Description of the project work',[\s\S]*?\}[\s\S]*?\};/g,
  `const requestBody = {
        title: 'Project',
        description: 'Description of the project work',
        technologies: ['JavaScript'],
      };`
);

// Fix 5: Update enterprise project test
content = content.replace(
  /const requestBody = \{[\s\S]*?project: \{[\s\S]*?title: 'Enterprise Project',[\s\S]*?description: 'Large scale enterprise system implementation',[\s\S]*?\}[\s\S]*?\};/,
  `const requestBody = {
        title: 'Enterprise Project',
        description: 'Large scale enterprise system implementation',
        technologies: ['Java', 'Spring', 'Kubernetes'],
      };`
);

// Fix 6: Update test project descriptions
content = content.replace(
  /const requestBody = \{[\s\S]*?project: \{[\s\S]*?title: 'Test Project',[\s\S]*?description: 'Test project description',[\s\S]*?\}[\s\S]*?\};/g,
  `const requestBody = {
        title: 'Test Project',
        description: 'Test project description',
        technologies: ['React', 'Node.js'],
      };`
);

// Fix 7: Update the second test
content = content.replace(
  /const requestBody = \{[\s\S]*?project: \{[\s\S]*?title: 'Chat Application',[\s\S]*?description:[\s\S]*?'Created real-time chat app that increased user engagement by 50%\.',[\s\S]*?\},[\s\S]*?\};/,
  `const requestBody = {
        title: 'Chat Application',
        description: 'Created real-time chat app that increased user engagement by 50%.',
        technologies: ['Socket.io', 'Node.js', 'React'],
      };`
);

// Fix 8: Fix the mock setup for RPC calls
content = content.replace(
  /single: jest[\s\S]*?\.fn\(\)[\s\S]*?\.mockResolvedValueOnce\(\{[\s\S]*?data: \{[\s\S]*?id: 'user_123',[\s\S]*?ai_credits: \d+,[\s\S]*?subscription_plan: ['"`]\w+['"`],[\s\S]*?\},/g,
  (match) => {
    // Add rpc mock
    return match.replace(/\},\s*$/, `},
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(), 
        eq: jest.fn().mockReturnThis(),
        rpc: jest.fn().mockResolvedValue({ data: true, error: null }),`);
  }
);

// Fix 9: Ensure the default mock has rpc
if (!content.includes('defaultSupabaseMock') || !content.includes('rpc:')) {
  content = content.replace(
    /const defaultSupabaseMock = \{[\s\S]*?\};/,
    (match) => {
      if (!match.includes('rpc:')) {
        return match.replace(/\};$/, `  rpc: jest.fn().mockResolvedValue({ data: true, error: null }),
};`);
      }
      return match;
    }
  );
}

fs.writeFileSync(testFile, content, 'utf8');
console.log(`✅ Fixed: ${testFile}`);