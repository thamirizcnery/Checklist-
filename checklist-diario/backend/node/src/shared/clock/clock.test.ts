import { describe, expect, it } from 'vitest';
import { addDays, dayInSaoPaulo, daysBetweenInclusive, isValidDay } from './clock.js';

describe('dayInSaoPaulo', () => {
  it('deve manter o dia até 23:59 em Brasília', () => {
    // 23:59 em Brasília (UTC-3) = 02:59 UTC do dia seguinte
    expect(dayInSaoPaulo(new Date('2026-11-26T02:59:00Z'))).toBe('2026-11-25');
  });

  it('deve virar o dia à meia-noite em Brasília', () => {
    expect(dayInSaoPaulo(new Date('2026-11-26T03:00:00Z'))).toBe('2026-11-26');
  });

  it('deve usar o dia de Brasília mesmo quando em UTC já é o dia seguinte', () => {
    expect(dayInSaoPaulo(new Date('2026-11-25T01:00:00Z'))).toBe('2026-11-24');
  });
});

describe('isValidDay', () => {
  it('deve aceitar uma data real', () => {
    expect(isValidDay('2026-02-28')).toBe(true);
  });

  it('deve recusar data inexistente e formato errado', () => {
    expect(isValidDay('2026-02-30')).toBe(false);
    expect(isValidDay('25/11/2026')).toBe(false);
    expect(isValidDay('hoje')).toBe(false);
  });
});

describe('addDays e daysBetweenInclusive', () => {
  it('deve somar e subtrair dias atravessando o mês', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('deve contar os dois extremos', () => {
    expect(daysBetweenInclusive('2026-11-25', '2026-11-25')).toBe(1);
    expect(daysBetweenInclusive('2026-11-23', '2026-11-25')).toBe(3);
  });
});
