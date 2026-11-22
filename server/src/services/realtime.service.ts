import { config } from '../config/env.js';
import { OmniSocketClient, CONNECTION_TYPE } from '../lib/omni-socket/omni-client.js';
import { InternalServerError, AppError } from '../errors/app-error.js';

export interface TokenMintOptions {
  username?: string;
  role?: string;
  allowedRooms?: string[];
  canPublish?: boolean;
  ttlSeconds?: number;
}

export interface RealtimeTokenResponse {
  token: string;
  expiresInSeconds: number;
  serverUrl: string;
  applicationId: string;
  userId: string;
}

export interface RealtimePublicConfig {
  enabled: boolean;
  serverUrl: string;
  applicationId: string;
}

export class RealtimeService {
  private serverClient: OmniSocketClient | null = null;
  private isConnecting = false;
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly apiKey: string;

  constructor(options?: { url?: string; appId?: string; apiKey?: string }) {
    this.baseUrl = (options?.url || config.omnisocket?.url || 'https://omni-socket.onrender.com').replace(/\/+$/, '');
    this.appId = options?.appId ?? config.omnisocket?.appId ?? '';
    this.apiKey = options?.apiKey ?? config.omnisocket?.apiKey ?? '';
  }

  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.appId && this.apiKey);
  }

  public getPublicConfig(): RealtimePublicConfig {
    return {
      enabled: this.isConfigured(),
      serverUrl: this.baseUrl,
      applicationId: this.appId,
    };
  }

  /**
   * Check liveness with timeout to detect Render cold-start or health status
   */
  public async checkHealth(): Promise<{ status: 'healthy' | 'cold-starting' | 'offline'; latencyMs: number }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${this.baseUrl}/health/live`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const latencyMs = Date.now() - start;

      if (res.ok) {
        return { status: 'healthy', latencyMs };
      }
      return { status: 'cold-starting', latencyMs };
    } catch {
      return { status: 'offline', latencyMs: Date.now() - start };
    }
  }

  /**
   * Mint a short-lived ephemeral client connection token for an authenticated user.
   * Includes retry logic to handle Render free-tier cold starts.
   */
  public async getClientToken(userId: string, options?: TokenMintOptions): Promise<RealtimeTokenResponse> {
    if (!this.isConfigured()) {
      throw new AppError('Realtime service is not configured with OmniSocket credentials', 503);
    }

    const ttlSeconds = options?.ttlSeconds || 3600;
    const body = {
      userId,
      ttlSeconds,
      grants: {
        allowedRooms: options?.allowedRooms || ['*'],
        canPublish: options?.canPublish ?? true,
      },
      metadata: {
        username: options?.username,
        role: options?.role || 'user',
      },
    };

    // Retry once with extended timeout if Render is cold-starting
    const maxAttempts = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutMs = attempt === 1 ? 15000 : 35000;
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(`${this.baseUrl}/api/v1/auth/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-application-id': this.appId,
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errData = (await response.json().catch(() => ({}))) as Record<string, any>;
          throw new AppError(
            errData.message || `OmniSocket token mint failed with status ${response.status}`,
            response.status === 401 ? 502 : response.status
          );
        }

        const data = (await response.json()) as Record<string, any>;
        const token = data.token || data.data?.token;

        if (!token) {
          throw new InternalServerError('OmniSocket did not return a valid client connection token');
        }

        return {
          token,
          expiresInSeconds: ttlSeconds,
          serverUrl: this.baseUrl,
          applicationId: this.appId,
          userId,
        };
      } catch (err: any) {
        lastError = err;
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    throw lastError || new InternalServerError('Failed to connect to OmniSocket realtime service');
  }

  /**
   * Lazily initialize or retrieve server-mode OmniSocketClient
   */
  public async getServerClient(): Promise<OmniSocketClient | null> {
    if (!this.isConfigured()) return null;
    if (this.serverClient?.isConnected()) return this.serverClient;

    if (!this.serverClient) {
      this.serverClient = new OmniSocketClient({
        type: CONNECTION_TYPE.SERVER,
        url: this.baseUrl,
        applicationId: this.appId,
        apiKey: this.apiKey,
        userId: 'pending_push_backend',
        autoHeartbeat: true,
      });
    }

    if (!this.serverClient.isConnected() && !this.isConnecting) {
      this.isConnecting = true;
      try {
        await this.serverClient.connect();
      } catch {
        // Will retry on next broadcast attempt
      } finally {
        this.isConnecting = false;
      }
    }

    return this.serverClient.isConnected() ? this.serverClient : null;
  }

  /**
   * Broadcast an event to all readers in a post room (e.g., 'post:<id>')
   */
  public async broadcastToPost(postId: string, event: string, payload: any): Promise<void> {
    try {
      const client = await this.getServerClient();
      if (client?.isConnected()) {
        await client.broadcastToRoom(`post:${postId}`, event, payload, true);
      }
    } catch {
      // Fail-safe: realtime broadcast failures never block REST responses
    }
  }

  /**
   * Send a targeted notification event directly to a user
   */
  public async notifyUser(targetUserId: string, event: string, payload: any): Promise<void> {
    try {
      const client = await this.getServerClient();
      if (client?.isConnected()) {
        await client.emitToUser(targetUserId, event, payload);
      }
    } catch {
      // Fail-safe
    }
  }

  public disconnect(): void {
    if (this.serverClient) {
      this.serverClient.disconnect();
      this.serverClient = null;
    }
  }
}
