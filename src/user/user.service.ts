import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private database: DatabaseService) {}

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.database.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    return user;
  }
}
