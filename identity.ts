import { Picture } from './picture';
import { Role } from './role';

export class Identity {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;

  picture: Picture;
  role: Role;
}
