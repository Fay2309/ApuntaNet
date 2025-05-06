import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/login'; 

  private apiregistro = 'http://localhost:5000/registro'; 

  constructor(private http: HttpClient) {}

  login(usuario: string, password: string): Observable<any> {
    const body = { usuario, password }

    return this.http.post(this.apiUrl, body);
  }

  registro(usuario: string, password: string, correo: string, telefono: string): Observable<any> {
    const body = { usuario, password, correo, telefono }

    return this.http.post(this.apiregistro, body);
  }
}

