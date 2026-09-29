import { Request } from 'express';
import { UserEntity } from 'src/modules/user/user.entity';

export interface Payload {
    sub: string
}

export interface RequestWithUser extends Request {
  user: UserEntity;
}
