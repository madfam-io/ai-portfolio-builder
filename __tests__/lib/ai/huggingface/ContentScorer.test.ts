import { ContentScorer } from '@/lib/ai/huggingface/ContentScorer';

describe('ContentScorer', () => {
  let scorer: ContentScorer;

  beforeEach(() => {
    scorer = new ContentScorer();
  });

  describe('scoreBio', () => {
    it('should score a well-written bio highly', () => {
      const goodBio = `Experienced software engineer with 8 years of expertise in building scalable web applications. 
        Led a team of 5 developers to deliver a $2M e-commerce platform that increased sales by 40%. 
        Passionate about clean code, test-driven development, and mentoring junior developers.`;

      const score = scorer.scoreBio(goodBio);

      expect(score.overall).toBeGreaterThan(80);
      expect(score.readability).toBeGreaterThan(70);
      expect(score.professionalism).toBeGreaterThan(80);
      expect(score.impact).toBeGreaterThan(70);
      expect(score.specificity).toBeGreaterThan(80);
    });

    it('should score a vague bio lowly', () => {
      const vagueBio = 'I am a developer who likes to code. I have worked on some projects.';

      const score = scorer.scoreBio(vagueBio);

      expect(score.overall).toBeLessThan(50);
      expect(score.specificity).toBeLessThan(40);
      expect(score.impact).toBeLessThan(40);
    });

    it('should detect and reward metrics', () => {
      const bioWithMetrics = 'Increased performance by 50%, reduced costs by $100K annually, and improved user satisfaction scores by 25%.';
      const bioWithoutMetrics = 'Improved performance, reduced costs, and enhanced user satisfaction.';

      const scoreWith = scorer.scoreBio(bioWithMetrics);
      const scoreWithout = scorer.scoreBio(bioWithoutMetrics);

      expect(scoreWith.impact).toBeGreaterThan(scoreWithout.impact);
      expect(scoreWith.specificity).toBeGreaterThan(scoreWithout.specificity);
    });

    it('should penalize overly long sentences', () => {
      const longSentenceBio = 'I am a developer who has worked on many different projects including web applications, mobile applications, desktop applications, and various other types of software development projects throughout my career spanning over many years in the industry working with different technologies and frameworks.';
      const conciseBio = 'Versatile developer with expertise in web, mobile, and desktop applications. 10+ years of experience across multiple technology stacks.';

      const scoreLong = scorer.scoreBio(longSentenceBio);
      const scoreConcise = scorer.scoreBio(conciseBio);

      expect(scoreConcise.readability).toBeGreaterThan(scoreLong.readability);
    });

    it('should reward action verbs', () => {
      const actionBio = 'Led teams, architected solutions, optimized performance, and mentored developers.';
      const passiveBio = 'Was responsible for teams, solutions were designed, performance was improved.';

      const scoreAction = scorer.scoreBio(actionBio);
      const scorePassive = scorer.scoreBio(passiveBio);

      expect(scoreAction.impact).toBeGreaterThan(scorePassive.impact);
      expect(scoreAction.professionalism).toBeGreaterThan(scorePassive.professionalism);
    });
  });

  describe('scoreProject', () => {
    it('should score a detailed project description highly', () => {
      const goodProject = `Developed a real-time analytics dashboard using React and D3.js that processes 1M+ events daily. 
        Implemented efficient data aggregation pipeline reducing query time by 75%. 
        The solution enabled business stakeholders to make data-driven decisions 3x faster.`;

      const score = scorer.scoreProject(goodProject);

      expect(score.overall).toBeGreaterThan(80);
      expect(score.technical).toBeGreaterThan(80);
      expect(score.impact).toBeGreaterThan(80);
      expect(score.clarity).toBeGreaterThan(70);
    });

    it('should detect technical terms and frameworks', () => {
      const technicalProject = 'Built microservices architecture using Docker, Kubernetes, and gRPC. Implemented CI/CD pipeline with Jenkins.';
      const nonTechnicalProject = 'Created a system that works well and is easy to use.';

      const scoreTech = scorer.scoreProject(technicalProject);
      const scoreNonTech = scorer.scoreProject(nonTechnicalProject);

      expect(scoreTech.technical).toBeGreaterThan(scoreNonTech.technical);
      expect(scoreTech.specificity).toBeGreaterThan(scoreNonTech.specificity);
    });

    it('should reward quantifiable results', () => {
      const withResults = 'Reduced API response time from 2s to 200ms (90% improvement), supporting 10,000 concurrent users.';
      const withoutResults = 'Made the API faster and more scalable.';

      const scoreWith = scorer.scoreProject(withResults);
      const scoreWithout = scorer.scoreProject(withoutResults);

      expect(scoreWith.impact).toBeGreaterThan(scoreWithout.impact);
      expect(scoreWith.overall).toBeGreaterThan(scoreWithout.overall);
    });

    it('should evaluate completeness', () => {
      const completeProject = `Challenge: Legacy system couldn't handle peak traffic.
        Solution: Redesigned architecture using microservices and caching.
        Result: 99.9% uptime and 5x throughput improvement.
        Technologies: Node.js, Redis, Docker, AWS.`;
      
      const incompleteProject = 'Used Node.js to build a better system.';

      const scoreComplete = scorer.scoreProject(completeProject);
      const scoreIncomplete = scorer.scoreProject(incompleteProject);

      expect(scoreComplete.completeness).toBeGreaterThan(80);
      expect(scoreIncomplete.completeness).toBeLessThan(40);
    });
  });

  describe('scoreContent', () => {
    it('should provide general content scoring', () => {
      const content = 'This is a well-written piece of content with clear structure and good flow.';
      
      const score = scorer.scoreContent(content);

      expect(score).toHaveProperty('readability');
      expect(score).toHaveProperty('clarity');
      expect(score).toHaveProperty('engagement');
      expect(score).toHaveProperty('overall');
      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
    });

    it('should handle empty content', () => {
      const score = scorer.scoreContent('');

      expect(score.overall).toBe(0);
      expect(score.readability).toBe(0);
      expect(score.clarity).toBe(0);
    });

    it('should detect professional tone', () => {
      const professional = 'Leveraged expertise in cloud architecture to optimize infrastructure costs while maintaining high availability.';
      const casual = 'I just figured out how to save some money on our servers, which was pretty cool.';

      const scorePro = scorer.scoreContent(professional);
      const scoreCasual = scorer.scoreContent(casual);

      expect(scorePro.professionalism).toBeGreaterThan(scoreCasual.professionalism);
    });
  });

  describe('getImprovementSuggestions', () => {
    it('should suggest improvements for low-scoring bio', () => {
      const weakBio = 'I am a developer.';
      const score = scorer.scoreBio(weakBio);
      
      const suggestions = scorer.getImprovementSuggestions('bio', score);

      expect(suggestions).toContain('Add specific years of experience');
      expect(suggestions).toContain('Include quantifiable achievements');
      expect(suggestions).toContain('Mention specific technologies or skills');
    });

    it('should suggest improvements for project descriptions', () => {
      const weakProject = 'Built a website for a client.';
      const score = scorer.scoreProject(weakProject);
      
      const suggestions = scorer.getImprovementSuggestions('project', score);

      expect(suggestions).toContain('Add technical details and technologies used');
      expect(suggestions).toContain('Include measurable outcomes or metrics');
      expect(suggestions).toContain('Describe the challenge or problem solved');
    });

    it('should not suggest improvements for high-scoring content', () => {
      const excellentBio = `Senior software architect with 10+ years leading cross-functional teams. 
        Delivered 20+ enterprise applications generating $50M+ in revenue. 
        Expert in cloud architecture (AWS, Azure), microservices, and DevOps practices.`;
      
      const score = scorer.scoreBio(excellentBio);
      const suggestions = scorer.getImprovementSuggestions('bio', score);

      expect(suggestions.length).toBeLessThan(2);
    });
  });

  describe('edge cases', () => {
    it('should handle very long content gracefully', () => {
      const longContent = 'Lorem ipsum '.repeat(1000);
      
      const score = scorer.scoreContent(longContent);

      expect(score.readability).toBeLessThan(50); // Should penalize overly long content
      expect(score.overall).toBeDefined();
    });

    it('should handle special characters and emojis', () => {
      const contentWithSpecial = 'Developer 🚀 with experience in C++, C#, and JavaScript!!! 💻✨';
      
      const score = scorer.scoreContent(contentWithSpecial);

      expect(score.overall).toBeGreaterThan(0);
      expect(score.professionalism).toBeLessThan(70); // Should penalize excessive emojis
    });

    it('should handle non-English content appropriately', () => {
      const nonEnglish = 'Desarrollador de software con experiencia en múltiples tecnologías.';
      
      const score = scorer.scoreContent(nonEnglish);

      // Should still provide some scoring even if not optimized for non-English
      expect(score.overall).toBeGreaterThan(0);
    });
  });
});