import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, UserModule, BookmarksModule, DatabaseModule],
})
export class AppModule {}
