import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../src/services/auth.service.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { MockSessionRepository } from './mocks/mock-session.repository.js';
import { ClientDeviceInfo } from '../src/types/index.js';
import { BadRequestError, UnauthorizedError } from '../src/errors/app-error.js';

describe('AuthService & Session Management', () => {
  let authService: AuthService;
  let mockUserRepo: MockUserRepository;
  let mockSessionRepo: MockSessionRepository;

  const mockClientInfo: ClientDeviceInfo = {
    deviceName: 'Chrome 124 on Windows 11',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    metadata: {
      browser: 'Chrome',
      os: 'Windows',
      deviceType: 'desktop',
    },
  };

  beforeEach(() => {
    mockUserRepo = new MockUserRepository();
    mockSessionRepo = new MockSessionRepository();
    authService = new AuthService(mockUserRepo, mockSessionRepo);
  });

  describe('Registration & Initial Session', () => {
    it('should register a new user and create an initial session', async () => {
      const result = await authService.register(
        {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
        },
        mockClientInfo
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.username).toBe('johndoe');
      expect(result.user.email).toBe('john@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');

      // Verify session was created
      const sessions = await mockSessionRepo.findByUserId(result.userId);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].deviceName).toBe(mockClientInfo.deviceName);
      expect(sessions[0].ipAddress).toBe(mockClientInfo.ipAddress);
    });

    it('should reject registration if email is already taken', async () => {
      await authService.register(
        {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
        },
        mockClientInfo
      );

      await expect(
        authService.register(
          {
            username: 'anotheruser',
            email: 'john@example.com',
            password: 'password456',
          },
          mockClientInfo
        )
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('Login & Device Sessions', () => {
    beforeEach(async () => {
      await authService.register(
        {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'securepassword',
        },
        mockClientInfo
      );
    });

    it('should authenticate user and create a new active session', async () => {
      const mobileClient: ClientDeviceInfo = {
        deviceName: 'Safari on iPhone 15',
        ipAddress: '10.0.0.1',
        userAgent: 'iPhone Mobile Safari',
        metadata: { browser: 'Safari', os: 'iOS', deviceType: 'mobile' },
      };

      const result = await authService.login(
        {
          email: 'john@example.com',
          password: 'securepassword',
        },
        mobileClient
      );

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Total 2 sessions now (1 from register, 1 from mobile login)
      const sessions = await mockSessionRepo.findByUserId(result.userId);
      expect(sessions).toHaveLength(2);
      expect(sessions[0].deviceName).toBe('Safari on iPhone 15');
    });

    it('should reject login with invalid password', async () => {
      await expect(
        authService.login(
          {
            email: 'john@example.com',
            password: 'wrongpassword',
          },
          mockClientInfo
        )
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('Refresh Token Rotation (RTR)', () => {
    it('should rotate tokens: invalidate old token and issue fresh access + refresh tokens', async () => {
      const auth = await authService.register(
        {
          username: 'janedoe',
          email: 'jane@example.com',
          password: 'password123',
        },
        mockClientInfo
      );

      const oldRefreshToken = auth.refreshToken;

      // Rotate token
      const refreshed = await authService.refresh(oldRefreshToken, mockClientInfo);

      expect(refreshed.accessToken).toBeDefined();
      expect(refreshed.refreshToken).toBeDefined();
      expect(refreshed.refreshToken).not.toBe(oldRefreshToken);

      // Verify that using the OLD refresh token now fails (anti-theft)
      await expect(authService.refresh(oldRefreshToken, mockClientInfo)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should detect replay attack / token reuse and revoke all sessions for that user', async () => {
      const auth = await authService.register(
        {
          username: 'bob',
          email: 'bob@example.com',
          password: 'password123',
        },
        mockClientInfo
      );

      // Create a second session (e.g. tablet)
      await authService.login(
        {
          email: 'bob@example.com',
          password: 'password123',
        },
        { ...mockClientInfo, deviceName: 'Tablet' }
      );

      // Verify 2 sessions active
      let activeSessions = await mockSessionRepo.findByUserId(auth.userId);
      expect(activeSessions).toHaveLength(2);

      // Manually revoke the first session (or simulate compromised token)
      await authService.logout(auth.refreshToken);

      // Replaying the revoked token triggers security reuse detection
      await expect(authService.refresh(auth.refreshToken, mockClientInfo)).rejects.toThrow(
        UnauthorizedError
      );

      // ALL sessions for the user should now be revoked (anti-theft kill switch)
      activeSessions = await mockSessionRepo.findByUserId(auth.userId);
      expect(activeSessions).toHaveLength(0);
    });
  });

  describe('Active Sessions & Device Management', () => {
    it('should list all active devices and mark the current device', async () => {
      const auth1 = await authService.register(
        {
          username: 'alice',
          email: 'alice@example.com',
          password: 'password123',
        },
        { ...mockClientInfo, deviceName: 'Laptop (Chrome)' }
      );

      await authService.login(
        {
          email: 'alice@example.com',
          password: 'password123',
        },
        { ...mockClientInfo, deviceName: 'Phone (Safari)' }
      );

      const sessions = await authService.listSessions(auth1.userId, auth1.refreshToken);

      expect(sessions).toHaveLength(2);
      const laptopSession = sessions.find((s) => s.deviceName === 'Laptop (Chrome)');
      const phoneSession = sessions.find((s) => s.deviceName === 'Phone (Safari)');

      expect(laptopSession?.isCurrent).toBe(true);
      expect(phoneSession?.isCurrent).toBe(false);
    });

    it('should revoke all other sessions except the current one', async () => {
      const auth = await authService.register(
        {
          username: 'charlie',
          email: 'charlie@example.com',
          password: 'password123',
        },
        { ...mockClientInfo, deviceName: 'Current Work PC' }
      );

      // 2 other device logins
      await authService.login(
        { email: 'charlie@example.com', password: 'password123' },
        { ...mockClientInfo, deviceName: 'Home Laptop' }
      );
      await authService.login(
        { email: 'charlie@example.com', password: 'password123' },
        { ...mockClientInfo, deviceName: 'Mobile Phone' }
      );

      expect(await mockSessionRepo.findByUserId(auth.userId)).toHaveLength(3);

      // Revoke all other sessions
      const revokedCount = await authService.revokeOtherSessions(auth.userId, auth.refreshToken);
      expect(revokedCount).toBe(2);

      // Only the current session remains active
      const remainingSessions = await mockSessionRepo.findByUserId(auth.userId);
      expect(remainingSessions).toHaveLength(1);
      expect(remainingSessions[0].deviceName).toBe('Current Work PC');
    });
  });
});
