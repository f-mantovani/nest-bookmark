import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BookmarkService {
  constructor(private database: DatabaseService) {}
  async createBookmark(userId: number, bookmarkDto: CreateBookmarkDto) {
    const bookmark = await this.database.bookmark.create({
      data: {
        userId,
        ...bookmarkDto,
      },
    });

    return bookmark;
  }

  getBookmarks(userId: number) {
    return this.database.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.database.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId,
      },
    });
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    bookmarkDto: EditBookmarkDto,
  ) {
    const bookmark = await this.database.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (!bookmark) throw new ForbiddenException('Access to resource denied');

    const updatedBookmark = await this.database.bookmark.update({
      where: {
        id: bookmarkId,
        userId,
      },
      data: {
        ...bookmarkDto,
      },
    });

    return updatedBookmark;
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.database.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (!bookmark) throw new ForbiddenException('Access to resource denied');

    await this.database.bookmark.delete({
      where: {
        userId,
        id: bookmarkId,
      },
    });
  }
}
