import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/login'; 

  constructor(private http: HttpClient) {}

  login(usuario: string, password: string): Observable<any> {
    const body = { usuario, password }

    return this.http.post(this.apiUrl, body);
  }
}

