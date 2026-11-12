import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './auth.store';

// These tests describe the server version's sign-in; the phone version is covered in core/data/mode.test.tsx.
vi.mock('../data/mode', () => ({ DATA_MODE: 'server', isLocal: () => false }))

describe('Auth Store', () => {
    beforeEach(() => {
        // Reset state before each test
        useAuthStore.setState({ user: null, token: null, refreshToken: null });
        localStorage.clear();
    });

    it('should initialize with null values', () => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.refreshToken).toBeNull();
    });

    it('should set authenticated user and tokens', () => {
        const user = { id: 1, name: 'Shiva', email: 'shiva@farm.com', role: 'employee' };

        useAuthStore.getState().setAuth(user, 'access_token_123', 'refresh_token_456');

        const state = useAuthStore.getState();
        expect(state.user).toEqual(user);
        expect(state.token).toBe('access_token_123');
        expect(state.refreshToken).toBe('refresh_token_456');

        expect(localStorage.getItem('tms_token')).toBe('access_token_123');
        expect(localStorage.getItem('tms_refresh')).toBe('refresh_token_456');
    });

    it('should log out correctly by clearing state and localStorage', () => {
        const user = { id: 1, name: 'Admin', email: 'admin@farm.com', role: 'owner' };
        useAuthStore.getState().setAuth(user, 'access_token_123', 'refresh_token_456');

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.refreshToken).toBeNull();

        expect(localStorage.getItem('tms_token')).toBeNull();
        expect(localStorage.getItem('tms_refresh')).toBeNull();
    });

    it('should correctly identify roles', () => {
        useAuthStore.setState({ user: { id: 1, name: 'Admin', email: 'a@a.com', role: 'owner' } });
        expect(useAuthStore.getState().isOwner()).toBe(true);
        expect(useAuthStore.getState().isEmployee()).toBe(false);

        useAuthStore.setState({ user: { id: 2, name: 'Worker', email: 'w@w.com', role: 'employee' } });
        expect(useAuthStore.getState().isEmployee()).toBe(true);
        expect(useAuthStore.getState().isOwner()).toBe(false);

        useAuthStore.setState({ user: { id: 3, name: 'Vol', email: 'v@v.com', role: 'volunteer' } });
        expect(useAuthStore.getState().isVolunteer()).toBe(true);
        expect(useAuthStore.getState().isOwner()).toBe(false);
    });
});
