import { Component, OnInit } from '@angular/core';
import { AccessService } from '../access.service';

@Component({
  selector: 'apitools-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  constructor(private _access: AccessService) { }

  ngOnInit(): void {
    this._access.HasAccess("ROLE_VIEW");
  }

}
