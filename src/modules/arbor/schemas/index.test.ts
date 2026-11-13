import { describe, it, expect } from 'vitest';
import { treeCreateSchema, speciesCreateSchema } from './index';

describe('Zod Validation Schemas', () => {

    describe('treeCreateSchema', () => {
        it('should validate a correct tree object', () => {
            const validTree = {
                tree_code: 'MNG-001',
                species_id: 1,
                zone_id: 1,
                status: 'pending'
            };

            const result = treeCreateSchema.safeParse(validTree);
            expect(result.success).toBe(true);
        });

        it('should accept a tree without tree_code (generated server-side from the zone)', () => {
            const treeWithoutCode = {
                species_id: 1
            };

            const result = treeCreateSchema.safeParse(treeWithoutCode);
            expect(result.success).toBe(true);
        });

        it('should convert empty string species_id to 0 due to coerce.number', () => {
            const validTree = {
                tree_code: 'MNG-002',
                species_id: ''
            };

            const result = treeCreateSchema.safeParse(validTree);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.species_id).toBe(0);
            }
        });
    });

    describe('speciesCreateSchema', () => {
        it('should validate a correct species object', () => {
            const validSpecies = {
                common_name: 'Mango',
                scientific_name: 'Mangifera indica'
            };

            const result = speciesCreateSchema.safeParse(validSpecies);
            expect(result.success).toBe(true);
        });

        it('should fail if common_name is empty', () => {
            const invalidSpecies = {
                common_name: '',
                scientific_name: 'Mangifera indica'
            };

            const result = speciesCreateSchema.safeParse(invalidSpecies);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Common name is required');
            }
        });
    });

});
