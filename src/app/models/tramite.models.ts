export type EstadoRegistro = 'Activo' | 'Inactivo';

export type TipoDatoCampo = 
  | 'Texto'
  | 'Numérico'
  | 'Fecha'
  | 'Booleano'
  | 'Catálogo'
  | 'Archivo'
  | 'Moneda'
  | 'Email'
  | 'Teléfono';

export type TipoAccesoCampo = 
  | 'Lectura'
  | 'Lectura/Escritura'
  | 'Oculto'
  | 'Administrador';

export type CategoriaTipoCampo = 
  | 'Datos Ciudadano'
  | 'Variables del Trámite'
  | 'Metadatos'
  | 'Documentación'
  | 'Cabecera'
  | 'Firma Digital'
  | 'Tributario';

export interface HistorialCambio {
  id: string;
  usuario: string;
  fecha: string;
  accion: 'Creación' | 'Modificación' | 'Inactivación' | 'Reactivación' | 'Asignación de Campos';
  detalles: string;
}

export interface CFT {
  codigo: string; // Identificador único e inmutable
  tipo: string; // Tipo / Categoría
  nombre: string; // Nombre único entre activos
  tipoDato: TipoDatoCampo;
  longDato: number; // Longitud máxima
  longDec: number; // Longitud decimales
  acceso: TipoAccesoCampo;
  visible: boolean;
  obligatorio: boolean;
  dominio: string; // Valores permitidos, formato o catálogo
  descripcion: string;
  estado: EstadoRegistro;
  historial: HistorialCambio[];
  fechaCreacion: string;
  fechaModificacion: string;
  creadoPor: string;
  modificadoPor: string;
}

export interface CampoAsignadoFct {
  cftCodigo: string;
  cftSnapshot?: CFT; // referencia con datos del campo
  orden: number;
  seccion: string; // Ej: "1. Identificación y Contacto", "2. Datos de la Solicitud", "3. Documentación Soporte"
  obligatorio: boolean; // Sobrescribe o hereda
  visible: boolean; // Sobrescribe o hereda
  acceso: TipoAccesoCampo;
  instrucciones?: string;
  valorPorDefecto?: string;
}

export interface FCT {
  id: string; // Identificador único e inmutable (ej: FCT-2026-001)
  nombre: string; // Nombre del trámite (único entre activos)
  cdgEm: string; // Código de la empresa o entidad (ej: EMP-GOB-01)
  descripcion: string;
  categoria: string;
  plazoDias: number; // Plazo máximo de atención
  estado: EstadoRegistro;
  solicitudesAsociadas: number; // Solicitudes reales recibidas por ciudadanos
  camposAsignados: CampoAsignadoFct[];
  historial: HistorialCambio[];
  fechaCreacion: string;
  fechaModificacion: string;
  usuarioCreador: string;
  usuarioModificador: string;
}

export interface FiltroBuscadorCet {
  codigo: string;
  tipo: string;
  nombre: string;
  obligatorio: 'Todos' | 'Si' | 'No';
  tipoDato: string;
  longDato?: number | null;
  longDec?: number | null;
  acceso: string;
  visible: 'Todos' | 'Si' | 'No';
  dominio: string;
}
