import { describe, it, expect } from 'vitest';
import { Season, SeasonCreate, SeasonUpdate } from './season.model';

describe('Season Model', () => {
  describe('Season interface', () => {
    it('should create a valid season object', () => {
      const season: Season = {
        id: 1,
        year: 2024,
        description: 'Test season',
      };

      expect(season.id).toBe(1);
      expect(season.year).toBe(2024);
      expect(season.description).toBe('Test season');
    });

    it('should allow null description', () => {
      const season: Season = {
        id: 1,
        year: 2024,
        description: null,
      };

      expect(season.description).toBeNull();
    });

    it('should allow undefined description', () => {
      const season: Season = {
        id: 1,
        year: 2024,
      };

      expect(season.description).toBeUndefined();
    });
  });

  describe('SeasonCreate interface', () => {
    it('should create a valid season create object', () => {
      const seasonCreate: SeasonCreate = {
        year: 2024,
        description: 'Test season',
      };

      expect(seasonCreate.year).toBe(2024);
      expect(seasonCreate.description).toBe('Test season');
    });

    it('should allow null description', () => {
      const seasonCreate: SeasonCreate = {
        year: 2024,
        description: null,
      };

      expect(seasonCreate.description).toBeNull();
    });

    it('should allow undefined description', () => {
      const seasonCreate: SeasonCreate = {
        year: 2024,
      };

      expect(seasonCreate.description).toBeUndefined();
    });
  });

  describe('SeasonUpdate interface', () => {
    it('should create a valid season update object', () => {
      const seasonUpdate: SeasonUpdate = {
        year: 2025,
        description: 'Updated description',
      };

      expect(seasonUpdate.year).toBe(2025);
      expect(seasonUpdate.description).toBe('Updated description');
    });

    it('should allow undefined properties', () => {
      const seasonUpdate: SeasonUpdate = {};

      expect(seasonUpdate.year).toBeUndefined();
      expect(seasonUpdate.description).toBeUndefined();
    });
  });
});
