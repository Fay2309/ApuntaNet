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
    this.http.post<any>(this.apiUrl, body).subscribe({
      next: (response) => {
        if (response && response.status === "Correcto") {
          const token = response.token;
          const tokenPayload = this.decodeToken(token);

          const usuarioGuardado = {
            id: tokenPayload?.id_usuario || 0,
            nombre: usuario 
          };

          localStorage.setItem('token', token);
          localStorage.setItem('usuario', JSON.stringify(usuarioGuardado));

          console.log("Token guardado en localStorage:", token);
          console.log("Usuario guardado en localStorage:", usuarioGuardado);
          
          observer.next(response);
          observer.complete();
        } else {
          console.error("Respuesta de login inesperada:", response);
          observer.error("Formato de respuesta inválido");
        }
      },
      error: (err) => {
        console.error("Error en login:", err);
        observer.error(err);
      }
    });
  });
}

private decodeToken(token: string): any {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

obtenerUsuarioActual(): { id: number; nombre: string } | null {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}
  

  registro(usuario: string, password: string, correo: string, telefono: string): Observable<any> {
    const body = { usuario, password, correo, telefono }

    return this.http.post(this.apiregistro, body);
  }
}

