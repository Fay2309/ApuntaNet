// src/app/services/hogar.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HogarService {
  private apiUrl = 'http://localhost:5000/bienvenida'; 

  constructor(private http: HttpClient) {}

  crearHogar(datos: any) {
    return this.http.post(`${this.apiUrl}`, datos);
  }
}
