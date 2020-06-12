import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../http.service';
import { AccessService } from '../access.service';

@Component({
  selector: 'apitools-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss', '../control.scss']
})
export class AccountsComponent implements OnInit {

  constructor(private _http: HttpService, private _access: AccessService) { }

  ngOnInit(): void {
    // this._access.HasAccess("ACCOUNT_VIEW");
  }

}
