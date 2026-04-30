
import { cleanAIJSON } from '../src/lib/engine';

const cases = [
  // Case 1: Unescaped quotes inside a string (Common AI failure)
  {
    name: "Unescaped quotes",
    raw: '{ "summary": "He said "Hello" world" }',
    shouldFail: true
  },
  // Case 2: Truncated JSON
  {
    name: "Truncated",
    raw: '{ "summary": "test"',
    shouldFail: true
  },
  // Case 3: Trailing comma
  {
    name: "Trailing comma",
    raw: '{ "summary": "test", }',
    shouldFail: true
  },
  // Case 4: Control characters not handled by current cleanAIJSON
  {
    name: "Other control chars",
    raw: '{ "summary": "test\b" }', // backspace
    shouldFail: false // Current cleanAIJSON handles code < 32
  },
  // Case 5: Large position error simulation
  {
    name: "Large content with unescaped quote deep inside",
    raw: '{ "content": "' + "a".repeat(16400) + ' "break" ' + "b".repeat(100) + '" }',
    shouldFail: true
  }
];

cases.forEach(c => {
  console.log(`Testing: ${c.name}`);
  const cleaned = cleanAIJSON(c.raw);
  try {
    JSON.parse(cleaned);
    console.log(`  Result: Success`);
    if (c.shouldFail) console.warn(`  WARNING: Expected failure but succeeded!`);
  } catch (e: any) {
    console.log(`  Result: Failed - ${e.message}`);
    // Check if position matches the user's report style
    // "at position 16496"
  }
});
