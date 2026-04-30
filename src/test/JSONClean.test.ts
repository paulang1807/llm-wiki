import { describe, it, expect } from 'vitest';
import { cleanAIJSON } from '../lib/engine';

describe('cleanAIJSON Utility', () => {
  it('should extract JSON from surrounding text', () => {
    const raw = 'Here is your plan: {"summary": "test"} End of message.';
    expect(JSON.parse(cleanAIJSON(raw))).toEqual({ summary: 'test' });
  });

  it('should escape raw newlines within string literals', () => {
    const raw = `
    {
      "summary": "This is a\nmulti-line summary",
      "content": "Line 1\nLine 2"
    }
    `;
    const cleaned = cleanAIJSON(raw);
    expect(() => JSON.parse(cleaned)).not.toThrow();
    const parsed = JSON.parse(cleaned);
    expect(parsed.summary).toBe('This is a\nmulti-line summary');
    expect(parsed.content).toBe('Line 1\nLine 2');
  });

  it('should not escape newlines outside of strings', () => {
    const raw = '{\n  "test": "val"\n}';
    const cleaned = cleanAIJSON(raw);
    expect(JSON.parse(cleaned)).toEqual({ test: 'val' });
  });

  it('should handle escaped quotes within strings', () => {
    const raw = '{"text": "He said \\"Hello\\" and left"}';
    const cleaned = cleanAIJSON(raw);
    expect(JSON.parse(cleaned)).toEqual({ text: 'He said "Hello" and left' });
  });

  it('should handle tabs and carriage returns', () => {
    const raw = '{"text": "Tab\tChar\rReturn"}';
    const cleaned = cleanAIJSON(raw);
    const parsed = JSON.parse(cleaned);
    expect(parsed.text).toBe('Tab\tChar\rReturn');
  });

  it('should handle complex mixed content', () => {
    const raw = `
    Some preamble
    {
      "title": "My Note",
      "content": "---\ntitle: My Note\n---\n# Content\nWith raw newlines"
    }
    Postamble
    `;
    const cleaned = cleanAIJSON(raw);
    const parsed = JSON.parse(cleaned);
    expect(parsed.title).toBe('My Note');
    expect(parsed.content).toContain('---\ntitle: My Note\n---');
  });

  it('should handle trailing commas', () => {
    const raw = '{ "a": 1, "b": 2, }';
    const cleaned = cleanAIJSON(raw);
    expect(() => JSON.parse(cleaned)).not.toThrow();
  });
});
