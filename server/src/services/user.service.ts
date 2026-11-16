import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { NotFoundError } from '../errors/app-error.js';
import { UserConfig, DEFAULT_USER_CONFIG } from '../types/index.js';
import {
  UpdateUserConfigInput,
  UpdateUserProfileInput,
  userConfigSchema,
} from '../validators/user.validator.js';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async getProfileByUsername(targetUsername: string, viewerUserId?: string) {
    const user = await this.userRepository.findByUsername(targetUsername);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isOwner = Boolean(viewerUserId && viewerUserId === user.id);
    const isPrivate = user.config.privacy.isPrivate;

    // If profile is private and viewer is not the owner, return minimal private profile
    if (isPrivate && !isOwner) {
      return {
        isPrivate: true,
        isOwner: false,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        message: 'This developer profile is private',
      };
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isPrivate,
      isOwner,
      privacy: {
        showActivityHeatmap: isOwner || user.config.privacy.showActivityHeatmap,
        showFollowersList: isOwner || user.config.privacy.showFollowersList,
        showReadingList: isOwner || user.config.privacy.showReadingList,
      },
      config: isOwner ? user.config : undefined,
      createdAt: user.createdAt,
    };
  }

  public async getUserPreferences(userId: string): Promise<UserConfig> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.config;
  }

  public async updateUserPreferences(userId: string, input: UpdateUserConfigInput): Promise<UserConfig> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Merge nested config strictly with existing values
    const mergedConfig: UserConfig = {
      privacy: {
        ...(user.config.privacy || DEFAULT_USER_CONFIG.privacy),
        ...(input.privacy || {}),
      },
      appearance: {
        ...(user.config.appearance || DEFAULT_USER_CONFIG.appearance),
        ...(input.appearance || {}),
      },
      notifications: {
        ...(user.config.notifications || DEFAULT_USER_CONFIG.notifications),
        ...(input.notifications || {}),
      },
    };

    // Strict validation check against Zod schema
    const validatedConfig = userConfigSchema.parse(mergedConfig);

    const updated = await this.userRepository.update(userId, {
      config: validatedConfig,
    });

    if (!updated) {
      throw new NotFoundError('User not found during preferences update');
    }

    return updated.config;
  }

  public async updateUserProfile(userId: string, input: UpdateUserProfileInput) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await this.userRepository.update(userId, input);
    if (!updated) {
      throw new NotFoundError('User not found during profile update');
    }

    const { passwordHash: _, ...publicProfile } = updated;
    return publicProfile;
  }
}
