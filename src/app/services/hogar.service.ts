// src/app/services/hogar.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { RespuestaHogar } from '../bienvenida/bienvenida.interface';

@Injectable({ providedIn: 'root' })


export class HogarService {
  private apiUrl = 'http://localhost:5000/bienvenida'; 
  private apiconsultarhogar = 'http://localhost:5000/consultarHogar';
  private apisalirHogar = 'http://localhost:5000/salirHogar';
  private apiresidentes = 'http://localhost:5000';
  private apicategoriashogar = 'http://localhost:5000/categorias-hogar/agregar';
  private apicategoriasdisponibles = 'http://localhost:5000/categorias/disponible/';

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

//
// // METODOS DE GESTIONAR HOGAR
//
agregarCategoriaAHogar(datos: any): Observable<any> {
  return this.http.post(this.apicategoriashogar, datos);
}

obtenerCategoriasDisponibles(idHogar: number): Observable<any> {
  return this.http.get(`${this.apicategoriasdisponibles}${idHogar}`);
}

obtenerCategoriasSeleccionadas(idHogar: number): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:5000/categorias/seleccionadas/${idHogar}`);
}

getResidentes(idHogar: number) {  
  return this.http.get<{ status: string, residentes: any[] }>(
    `${this.apiresidentes}/hogar/residentes/${idHogar}`
  );
}


//
// // METODOS PARA ENVIAR DATOS DESDE BIENVENIDA A GESTIONAR HOGAR
//
  private nombreHogarSubject = new BehaviorSubject<string>('');
  nombreHogar$ = this.nombreHogarSubject.asObservable();

  private idHogarSubject = new BehaviorSubject<number | null>(null);
  idHogar$ = this.idHogarSubject.asObservable();

  private esCreadorSubject = new BehaviorSubject<boolean>(false);
  esCreador$ = this.esCreadorSubject.asObservable();

  setNombreHogar(nombre: string) {
    this.nombreHogarSubject.next(nombre);
  }

  getNombreHogar(): string {
    return this.nombreHogarSubject.value;
  }

  setIdHogar(id: number) {
    this.idHogarSubject.next(id);
  }

  getIdHogar(): number | null {
    return this.idHogarSubject.value;
  }

  setEsCreador(esCreador: boolean) {
    this.esCreadorSubject.next(esCreador);
  }

  getEsCreador(): boolean {
    return this.esCreadorSubject.value;
  }
}


