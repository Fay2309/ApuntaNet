// src/app/services/hogar.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaHogar } from '../bienvenida/bienvenida.interface';

@Injectable({ providedIn: 'root' })


export class HogarService {
  private apiUrl = 'http://localhost:5000/bienvenida'; 
  private apiconsultarhogar = 'http://localhost:5000/consultarHogar';
  private apisalirHogar = 'http://localhost:5000/salirHogar';

  constructor(private http: HttpClient) {}

crearHogar(datos: any) {
  return this.http.post(`${this.apiUrl}`, datos);
}

obtenerHogarActual(token: string): Observable<RespuestaHogar> {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  const body = { token: token };

  return this.http.post<RespuestaHogar>(this.apiconsultarhogar, body, { headers });
}

salirseDelHogar(token: string) {
  return this.http.post(`${this.apisalirHogar}`, {
    token: `Bearer ${token}`
  });
}

}
