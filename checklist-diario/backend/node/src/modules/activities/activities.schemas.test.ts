import { describe, expect, it } from 'vitest';
import { MAX_NAME_LENGTH, nameSchema } from './activities.schemas.js';

describe('nameSchema', () => {
  it('deve aparar espaços nas pontas', () => {
    expect(nameSchema.parse('  Caminhar  ')).toBe('Caminhar');
  });

  it.each(['', '   '])('deve recusar nome em branco (%j)', (value) => {
    expect(nameSchema.safeParse(value).success).toBe(false);
  });

  it('deve aceitar exatamente 120 caracteres e recusar 121', () => {
    expect(nameSchema.safeParse('a'.repeat(MAX_NAME_LENGTH)).success).toBe(true);
    expect(nameSchema.safeParse('a'.repeat(MAX_NAME_LENGTH + 1)).success).toBe(false);
  });
});
