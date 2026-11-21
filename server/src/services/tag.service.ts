import { ITagRepository } from '../repositories/interfaces/tag.repository.interface.js';
import { TagItem, PaginatedResult } from '../types/index.js';
import { NotFoundError } from '../errors/app-error.js';

export class TagService {
  constructor(private readonly tagRepository: ITagRepository) {}

  public async getAllTags(limit = 50, cursor?: string): Promise<PaginatedResult<TagItem>> {
    return this.tagRepository.findAll({ limit, cursor });
  }

  public async getTagBySlug(slug: string): Promise<TagItem> {
    const tag = await this.tagRepository.findBySlug(slug);
    if (!tag) {
      throw new NotFoundError(`Tag #${slug} not found`);
    }
    return tag;
  }
}
