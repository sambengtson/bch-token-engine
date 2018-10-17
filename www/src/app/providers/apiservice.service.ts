import { Injectable } from '@angular/core';
import { Token, CreateTokenResponse } from '../models/token';
import { HttpClient, HttpResponse } from '@angular/common/http';
import * as env from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  serverHost = 'https://whctokens.cash';

  constructor(private http: HttpClient) {
    if (!env.environment.production) {
      this.serverHost = 'http://localhost:8080';
    } else {
      if (location.protocol === 'http:') {
        location.href = location.href.replace(/^http:/, 'https:')
      }
    }
  }

  CreateTokenRequest(req: Token): Promise<CreateTokenResponse> {

    return new Promise<CreateTokenResponse>((success, fail) => {
      this.http.post<CreateTokenResponse>(`${this.serverHost}/token/fixed`, req)
        .subscribe(response => {
          success(response);
        }, err => {
          fail(err);
        });
    });
  }
}
