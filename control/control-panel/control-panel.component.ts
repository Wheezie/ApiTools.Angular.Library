import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { HttpService } from '../../http.service';
import { AuthStatus } from '../../auth-status.enum';
import { Router } from '@angular/router';

import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'apitools-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss', '../../fontawesome.scss']
})
export class ControlPanelComponent implements OnInit, OnDestroy {
  @Input()
  logo: string = environment.config.apiTools.logo;

  @Input()
  platformName: string = environment.config.apiTools.platformName;

  @Input()
  private signoutRedirect: string = environment.config.apiTools.redirections.signout;

  menuVisible = false;

  private authSub: Subscription;
  constructor(public _http: HttpService, private _router: Router) {}

  ngOnInit() {
    this.authSub = this._http.Status.subscribe(x => {
      switch (x) {
        case AuthStatus.Blocked:
        case AuthStatus.InvalidCredentials:
        case AuthStatus.NotFound:
        case AuthStatus.SignedOut:
        case AuthStatus.Unauthorized:
          if (this.signoutRedirect)
            this._router.navigateByUrl(this.signoutRedirect);
          break;
      }
    });

    this._http.Verify();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  signOut() {
    this._http.Signout(this.signoutRedirect);
  }
}
