import {
  estimateTokens,
  calculateMetrics,
  formatNumber,
  formatRelativeTime,
  truncateText,
  generateSessionTitle,
} from '@/lib/utils';
import type { Settings } from '@/lib/types';

describe('utils', () => {
  describe('estimateTokens', () => {
    it('should estimate tokens correctly', () => {
      expect(estimateTokens('Hello world')).toBe(2);
      expect(estimateTokens('')).toBe(0);
      expect(estimateTokens('a'.repeat(100))).toBe(25);
    });
  });

  describe('calculateMetrics', () => {
    const settings: Settings = {
      model_size: 'Medium (GPT-3.5/Flash)',
      energy_mix: 'US Average Grid',
      water_factor: 1.1,
    };

    it('should calculate metrics correctly', () => {
      const result = calculateMetrics(1000, settings);
      expect(result.energy_wh).toBeCloseTo(0.025, 5);
      expect(result.carbon_gco2).toBeCloseTo(0.01, 5);
      expect(result.water_l).toBeCloseTo(0.0000275, 7);
    });

    it('should handle zero tokens', () => {
      const result = calculateMetrics(0, settings);
      expect(result.energy_wh).toBe(0);
      expect(result.carbon_gco2).toBe(0);
      expect(result.water_l).toBe(0);
    });

    it('should work with different model sizes', () => {
      const largeModelSettings: Settings = {
        ...settings,
        model_size: 'Large (GPT-4/Ultra)',
      };
      const result = calculateMetrics(1000, largeModelSettings);
      expect(result.energy_wh).toBeGreaterThan(0.025);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now.toISOString())).toBe('just now');
    });

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(date.toISOString())).toBe('5 minutes ago');
    });

    it('should format hours ago', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(date.toISOString())).toBe('2 hours ago');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a long text that should be truncated';
      expect(truncateText(text, 10)).toBe('This is a ...');
    });

    it('should not truncate short text', () => {
      const text = 'Short';
      expect(truncateText(text, 10)).toBe('Short');
    });
  });

  describe('generateSessionTitle', () => {
    it('should generate title from message', () => {
      const message = 'What is the meaning of life?';
      expect(generateSessionTitle(message)).toBe(message);
    });

    it('should truncate long messages', () => {
      const longMessage = 'a'.repeat(100);
      const title = generateSessionTitle(longMessage, 50);
      expect(title.length).toBe(53); // 50 + '...'
      expect(title.endsWith('...')).toBe(true);
    });
  });
});


