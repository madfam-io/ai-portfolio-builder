// Mock for @huggingface/inference
export const HfInference = jest.fn().mockImplementation(() => ({
  textGeneration: jest.fn().mockResolvedValue({
    generated_text: 'Mock generated text',
  }),
  conversational: jest.fn().mockResolvedValue({
    generated_text: 'Mock conversational response',
  }),
  summarization: jest.fn().mockResolvedValue({
    summary_text: 'Mock summary',
  }),
}));

export default HfInference;
