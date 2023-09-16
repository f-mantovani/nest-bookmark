import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
  constructor(private databse: DatabaseService) {}
  login() {
    return { message: `I'm login ` };
  }

  signup() {
    return { message: `I'm sign up` };
  }
}
