import { describe, expect, it } from 'vitest';
import { Position, PositionCreate, PositionUpdate } from './position.model';

describe('Position Model', () => {
  describe('Position interface', () => {
    it('should accept valid Position object', () => {
      const position: Position = {
        id: 1,
        title: 'Goalkeeper',
        sport_id: 1,
      };
      expect(position.id).toBe(1);
      expect(position.title).toBe('Goalkeeper');
      expect(position.sport_id).toBe(1);
    });

    it('should enforce title as required string', () => {
      const position: Position = {
        id: 1,
        title: 'Forward',
        sport_id: 1,
      };
      expect(typeof position.title).toBe('string');
      expect(position.title.length).toBeGreaterThan(0);
    });

    it('should enforce id as required number', () => {
      const position: Position = {
        id: 100,
        title: 'Midfielder',
        sport_id: 1,
      };
      expect(typeof position.id).toBe('number');
      expect(position.id).toBe(100);
    });
  });

  describe('PositionCreate interface', () => {
    it('should accept valid PositionCreate object', () => {
      const positionData: PositionCreate = {
        title: 'Striker',
        sport_id: 2,
      };
      expect(positionData.title).toBe('Striker');
      expect(positionData.sport_id).toBe(2);
    });

    it('should enforce title as required', () => {
      const positionData: PositionCreate = {
        title: 'Defender',
        sport_id: 1,
      };
      expect(positionData.title).toBeDefined();
      expect(typeof positionData.title).toBe('string');
    });

    it('should enforce sport_id as required', () => {
      const positionData: PositionCreate = {
        title: 'Winger',
        sport_id: 1,
      };
      expect(positionData.sport_id).toBeDefined();
      expect(typeof positionData.sport_id).toBe('number');
    });
  });

  describe('PositionUpdate interface', () => {
    it('should accept valid PositionUpdate object', () => {
      const positionUpdate: PositionUpdate = {
        title: 'Wing Back',
        sport_id: 1,
      };
      expect(positionUpdate.title).toBe('Wing Back');
      expect(positionUpdate.sport_id).toBe(1);
    });

    it('should accept PositionUpdate with only title', () => {
      const positionUpdate: PositionUpdate = {
        title: 'Center Back',
      };
      expect(positionUpdate.title).toBe('Center Back');
      expect(positionUpdate.sport_id).toBeUndefined();
    });

    it('should allow empty PositionUpdate object', () => {
      const positionUpdate: PositionUpdate = {};
      expect(positionUpdate.title).toBeUndefined();
      expect(positionUpdate.sport_id).toBeUndefined();
    });
  });
});
