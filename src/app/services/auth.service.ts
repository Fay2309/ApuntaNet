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
    const body = { usuario, password };
  
    return new Observable(observer => {
      this.http.post(this.apiUrl, body).subscribe({
        next: (response) => {
          localStorage.setItem('usuario', usuario); 
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }
  obtenerUsuarioActual(): string | null {
    return localStorage.getItem('usuario');
  }
  logout() {
    localStorage.removeItem('usuario');
  }
  

  registro(usuario: string, password: string, correo: string, telefono: string): Observable<any> {
    const body = { usuario, password, correo, telefono }

    return this.http.post(this.apiregistro, body);
  }
}

