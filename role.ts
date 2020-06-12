import { Permission } from './permission';

export class Role {
  id: number;
  canTargetId: number;
  name: string;
  description: string;
  disabled: boolean;

  permissions: Permission[];
}
