import { TestBed } from '@angular/core/testing';
import { Sport, SportCreate, SportUpdate } from './sport.model';

describe('Sport Models', () => {
  describe('Sport interface', () => {
    it('should accept valid Sport object', () => {
      const sport: Sport = {
        id: 1,
        title: 'Football',
        description: 'Association football',
      };
      expect(sport.id).toBe(1);
      expect(sport.title).toBe('Football');
      expect(sport.description).toBe('Association football');
    });

    it('should handle Sport without description', () => {
      const sport: Sport = {
        id: 1,
        title: 'Basketball',
      };
      expect(sport.id).toBe(1);
      expect(sport.title).toBe('Basketball');
      expect(sport.description).toBeUndefined();
    });

    it('should handle Sport with null description', () => {
      const sport: Sport = {
        id: 1,
        title: 'Tennis',
        description: null,
      };
      expect(sport.description).toBeNull();
    });

    it('should enforce title as required string', () => {
      const sport: Sport = {
        id: 1,
        title: 'Hockey',
      };
      expect(typeof sport.title).toBe('string');
      expect(sport.title.length).toBeGreaterThan(0);
    });

    it('should enforce id as required number', () => {
      const sport: Sport = {
        id: 100,
        title: 'Soccer',
      };
      expect(typeof sport.id).toBe('number');
      expect(sport.id).toBe(100);
    });
  });

  describe('SportCreate interface', () => {
    it('should accept valid SportCreate object', () => {
      const sportData: SportCreate = {
        title: 'Tennis',
      };
      expect(sportData.title).toBe('Tennis');
      expect(sportData.description).toBeUndefined();
    });

    it('should accept SportCreate with description', () => {
      const sportData: SportCreate = {
        title: 'Hockey',
        description: 'Ice hockey',
      };
      expect(sportData.title).toBe('Hockey');
      expect(sportData.description).toBe('Ice hockey');
    });

    it('should accept SportCreate with null description', () => {
      const sportData: SportCreate = {
        title: 'Baseball',
        description: null,
      };
      expect(sportData.description).toBeNull();
    });

    it('should enforce title as required', () => {
      const sportData: SportCreate = {
        title: 'Golf',
      };
      expect(sportData.title).toBeDefined();
      expect(typeof sportData.title).toBe('string');
    });

    it('should allow empty string description', () => {
      const sportData: SportCreate = {
        title: 'Rugby',
        description: '',
      };
      expect(sportData.description).toBe('');
    });
  });

  describe('SportUpdate interface', () => {
    it('should accept partial SportUpdate object with only title', () => {
      const sportUpdate: SportUpdate = {
        title: 'Soccer',
      };
      expect(sportUpdate.title).toBe('Soccer');
      expect(sportUpdate.description).toBeUndefined();
    });

    it('should accept partial SportUpdate object with only description', () => {
      const sportUpdate: SportUpdate = {
        description: 'Updated description',
      };
      expect(sportUpdate.description).toBe('Updated description');
      expect(sportUpdate.title).toBeUndefined();
    });

    it('should accept SportUpdate with multiple fields', () => {
      const sportUpdate: SportUpdate = {
        title: 'Rugby',
        description: 'Rugby union',
      };
      expect(sportUpdate.title).toBe('Rugby');
      expect(sportUpdate.description).toBe('Rugby union');
    });

    it('should accept SportUpdate with null description', () => {
      const sportUpdate: SportUpdate = {
        description: null,
      };
      expect(sportUpdate.description).toBeNull();
    });

    it('should allow empty SportUpdate object', () => {
      const sportUpdate: SportUpdate = {};
      expect(sportUpdate.title).toBeUndefined();
      expect(sportUpdate.description).toBeUndefined();
    });
  });
});
