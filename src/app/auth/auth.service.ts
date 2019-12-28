import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { TokenStorage } from './token.storage';
import { UserModel } from '../core/user/shared/user.model';

@Injectable()
export class AuthService {

  error: any;
  user: UserModel;
  userData: any = [];
  constructor(private http: HttpClient, private token: TokenStorage) { }

  public $userSource = new Subject<any>();

  login(email: string, password: string): Observable<any> {
    return Observable.create(observer => {
      this.http.post('/api/auth/login', {
        email,
        password
      }).subscribe((data: any) => {
        this.userData = data;
        console.log(this.userData);
        observer.next({ user: data.data.user });
        this.setUser(data.data.user);
        this.token.saveToken(data.data.token);
        observer.complete();
      }, (error: HttpErrorResponse) => {
        observer.next({ error: error });
        observer.complete();
      });
    });
  }

  register(user): Observable<any> {
    console.log(user);
    return Observable.create(observer => {
      this.http.post('/api/auth/register', user
      ).subscribe((data: any) => {
        observer.next({ user: data.user });
        this.setUser(data.user);
        this.token.saveToken(data.token);
        observer.complete();
      });
    });
  }

  setUser(user): void {
    // if (user) user.isAdmin = (user.position.indexOf('admin') > -1);
    this.$userSource.next(user);
    this.user = user;
    (<any>window).user = user;
  }

  getUser(): Observable<any> {
    // console.log(this.$userSource)
    return this.$userSource.asObservable();
  }

  me(): Observable<any> {
    return Observable.create(observer => {
      const tokenVal = this.token.getToken();
      if (!tokenVal) { return observer.complete(); }
      this.http.get('/api/auth/me').subscribe((data: any) => {
        observer.next({ user: data.user });
        this.setUser(data.user);
        observer.complete();
      });
    });
  }

  signOut(): void {
    this.token.signOut();
    this.setUser(null);
    delete (<any>window).user;
  }

  isAuthenticated() {
    if (this.token.getToken()) {
      return true;
    } return false;
  }
}
