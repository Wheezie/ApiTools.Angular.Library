import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { Permission } from '../permission';
import { Role } from '../role';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private _rolesLastUpdate: Date;
  private _roles: Map<number, Role>;

  constructor(private _http: HttpService) {

  }

  HasAccess(permission: string, targetId: number = null): Permission {
    if (targetId == null || isNaN(targetId))
      return null;

    return this._http.Identity.role.permissions.find(p => (p.permission == permission || p.permission == "*") && this.CanTarget(targetId))
  }

  async CanTarget(targetId: number): Promise<boolean> {
    if (this._rolesLastUpdate < new Date()) {
      (await this._http.Get<Role[]>("role", 1).toPromise()).forEach(r => this._roles[r.id] = r);
      this._rolesLastUpdate = moment().add('5', 'm')
        .toDate();
    }

    return this.canTargetRole(targetId);
  }

  private canTargetRole(targetId: number): boolean {
    if (targetId === null || targetId == this._http.Identity.role.canTargetId)
      return true;

    let canTargetId = this._roles.get(targetId).canTargetId;
    while (canTargetId !== null) {
      if (targetId == canTargetId)
        return true;

      canTargetId = this._roles.get(canTargetId).canTargetId;
    }
    return false;
  }
}
