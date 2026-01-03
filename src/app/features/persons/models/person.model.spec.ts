import { describe, it, expect } from 'vitest';
import { Person, PersonCreate, PersonUpdate, SortBy, SortOrder } from './person.model';

describe('Person model interfaces', () => {
  describe('Person interface', () => {
    it('should accept valid Person object', () => {
      const person: Person = {
        id: 1,
        first_name: 'John',
        second_name: 'Doe',
        person_photo_url: null,
      };

      expect(person.id).toBe(1);
      expect(person.first_name).toBe('John');
      expect(person.second_name).toBe('Doe');
      expect(person.person_photo_url).toBe(null);
    });

    it('should accept Person with photo URL', () => {
      const person: Person = {
        id: 2,
        first_name: 'Jane',
        second_name: 'Smith',
        person_photo_url: 'http://example.com/photo.jpg',
      };

      expect(person.person_photo_url).toBe('http://example.com/photo.jpg');
    });

    it('should handle id as number', () => {
      const person: Person = {
        id: 999,
        first_name: 'Test',
        second_name: 'User',
        person_photo_url: null,
      };

      expect(typeof person.id).toBe('number');
    });

    it('should require all Person fields', () => {
      const person: Person = {
        id: 1,
        first_name: 'Required',
        second_name: 'Required',
        person_photo_url: null,
      };

      expect(person.first_name).toBeDefined();
      expect(person.second_name).toBeDefined();
      expect(person.id).toBeDefined();
    });
  });

  describe('PersonCreate interface', () => {
    it('should accept valid PersonCreate object', () => {
      const personData: PersonCreate = {
        first_name: 'John',
        second_name: 'Doe',
      };

      expect(personData.first_name).toBe('John');
      expect(personData.second_name).toBe('Doe');
    });

    it('should accept PersonCreate with photo URL', () => {
      const personData: PersonCreate = {
        first_name: 'Jane',
        second_name: 'Smith',
        person_photo_url: 'http://example.com/photo.jpg',
      };

      expect(personData.person_photo_url).toBe('http://example.com/photo.jpg');
    });

    it('should accept PersonCreate without photo URL', () => {
      const personData: PersonCreate = {
        first_name: 'Bob',
        second_name: 'Johnson',
      };

      expect(personData.person_photo_url).toBeUndefined();
    });
  });

  describe('PersonUpdate interface', () => {
    it('should accept valid PersonUpdate object', () => {
      const personData: PersonUpdate = {
        first_name: 'Updated',
        second_name: 'Name',
      };

      expect(personData.first_name).toBe('Updated');
      expect(personData.second_name).toBe('Name');
    });

    it('should accept PersonUpdate with only first_name', () => {
      const personData: PersonUpdate = {
        first_name: 'New First Name',
      };

      expect(personData.first_name).toBe('New First Name');
      expect(personData.second_name).toBeUndefined();
      expect(personData.person_photo_url).toBeUndefined();
    });

    it('should accept PersonUpdate with only second_name', () => {
      const personData: PersonUpdate = {
        second_name: 'New Second Name',
      };

      expect(personData.first_name).toBeUndefined();
      expect(personData.second_name).toBe('New Second Name');
      expect(personData.person_photo_url).toBeUndefined();
    });

    it('should accept PersonUpdate with only photo URL', () => {
      const personData: PersonUpdate = {
        person_photo_url: 'http://example.com/new-photo.jpg',
      };

      expect(personData.first_name).toBeUndefined();
      expect(personData.second_name).toBeUndefined();
      expect(personData.person_photo_url).toBe('http://example.com/new-photo.jpg');
    });

    it('should accept empty PersonUpdate', () => {
      const personData: PersonUpdate = {};

      expect(personData.first_name).toBeUndefined();
      expect(personData.second_name).toBeUndefined();
      expect(personData.person_photo_url).toBeUndefined();
    });
  });

  describe('Type definitions', () => {
    it('should accept valid SortBy values', () => {
      const sortBy1: SortBy = 'first_name';
      const sortBy2: SortBy = 'second_name';

      expect(sortBy1).toBe('first_name');
      expect(sortBy2).toBe('second_name');
    });

    it('should accept valid SortOrder values', () => {
      const sortOrder1: SortOrder = 'asc';
      const sortOrder2: SortOrder = 'desc';

      expect(sortOrder1).toBe('asc');
      expect(sortOrder2).toBe('desc');
    });
  });
});
