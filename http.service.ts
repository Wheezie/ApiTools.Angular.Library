import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthResponse } from './responses/auth-response';

import { AuthStatus } from './auth-status.enum';
import { StorageService } from './storage.service';
import { BadRequestResponse } from './responses/bad-request-response';

import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { retry, share } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Identity } from './identity';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private static readonly STORAGE_TOKEN = 'APITOOLS_TOKEN';

  private _authStatus: AuthStatus = AuthStatus.NotChecked;
  private _identity: Identity;
  private _authSubject: Subject<AuthStatus> = new BehaviorSubject<AuthStatus>(this._authStatus);
  private _authObservable: Observable<AuthStatus> = this._authSubject.asObservable();
  private _options = {
    headers: new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'}),
  };

  constructor(private _http: HttpClient, private _storage: StorageService, private _router: Router) {}

  Get<T>(uri: string, retries = 2) {
    return this._http.get<T>(this.url(uri), this._options)
      .pipe(retry(retries), share());
  }

  Post<T>(uri: string, body: any, retries = 1) {
    return this._http.post<T>(this.url(uri), body, this._options)
      .pipe(retry(retries));
  }

  Authenticate(username: string, password: string) {
    this.Post<AuthResponse>('auth/login', { username: username, password: password }, 0)
      .subscribe((response: AuthResponse) => {
        if (response.token == null || response.token == '')
          return;

        this._identity = response.identity;
        this.setAuthentication(response.token);
        this._authSubject.next(AuthStatus.Success);
      }, (error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this.clearAuthentication(AuthStatus.Unauthorized);
            break;
          case 400:
            const response: BadRequestResponse = error.error;
            for(const f of response.fields) {
              if (f.field == 'account' && f.error == 'not_confirmed') {
                this.clearAuthentication(AuthStatus.NotConfirmed);
                return;
              }
            }
            this.clearAuthentication(AuthStatus.InvalidCredentials);
            break;
          default:
          case 0:
            this.clearAuthentication(AuthStatus.InternalError);
            break;
        }
      });
  }

  Verify(token: string = null, storeToDisk: boolean = token != null) {
    if (!token)
      token = this._storage.Get(HttpService.STORAGE_TOKEN);

    if (this._authStatus === AuthStatus.Checking)
      return;

    if (token) {
      this.setAuthenticationStatus(AuthStatus.Checking);
      this.setAuthentication(token, storeToDisk);
      this.Get<Identity>(`auth/verify`, 0)
        .subscribe(i => {
            this._identity = i;
            this.setAuthenticationStatus(AuthStatus.Success);
          },
          _ => this.setAuthenticationStatus(AuthStatus.Unauthorized));
    } else
      this.setAuthenticationStatus(AuthStatus.Unauthorized);
  }

  Signout(redirectRoute: string = null) {
    this._authSubject.next(AuthStatus.SigningOut);
    this.Post(`auth/signout`, null, 0)
      .subscribe(
        _ => this.clearAuthentication(),
        (x: HttpErrorResponse) => this.clearAuthentication(
          (x.status != 401 && x.status != 403) ? AuthStatus.InternalError : AuthStatus.SigningOut),
        () => {
          if (redirectRoute != null)
            this._router.navigateByUrl(redirectRoute);
        });
  }

  get Status(): Observable<AuthStatus> {
    return this._authObservable;
  }

  get Identity(): Identity {
    return this._identity;
  }

  private setAuthentication(token: string, storeToDisk: boolean = true) {
    if (!token)
      return;
    this._options.headers = this._options.headers.set('Authorization', token);

    if (storeToDisk)
      this._storage.Set(HttpService.STORAGE_TOKEN, token);
  }
  private clearAuthentication(status: AuthStatus = AuthStatus.SignedOut) {
    this._options.headers = this._options.headers.delete('Authorization');
    this._storage.Delete(HttpService.STORAGE_TOKEN);
    this.setAuthenticationStatus(status);
  }

  private setAuthenticationStatus(status: AuthStatus) {
    this._authStatus = status;
    this._authSubject.next(this._authStatus);
  }

  private url(uri: string) {
    return `${environment.config.apiTools.endpoint}${uri}`;
  }
}
