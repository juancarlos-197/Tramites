import { Injectable, signal, computed, effect } from '@angular/core';
import { CFT, FCT, CampoAsignadoFct, FiltroBuscadorCet, HistorialCambio, TipoDatoCampo, TipoAccesoCampo } from '../models/tramite.models';

const STORAGE_KEY_FCT = 'disenador_tramites_fct_v2';
const STORAGE_KEY_CFT = 'disenador_tramites_cft_v2';
const CURRENT_USER = 'jalban.dacompsc@gmail.com';

const INITIAL_CFTS: CFT[] = [
  {
    codigo: 'CFT-DOC-ID',
    tipo: 'Datos Ciudadano',
    nombre: 'Número de Identificación / Cédula / DNI',
    tipoDato: 'Texto',
    longDato: 15,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Alfanumérico estándar (8 a 15 caracteres sin guiones)',
    descripcion: 'Documento nacional de identidad del solicitante titular',
    estado: 'Activo',
    fechaCreacion: '2026-01-10T09:00:00Z',
    fechaModificacion: '2026-02-15T11:30:00Z',
    creadoPor: 'sistema@administracion.gob',
    modificadoPor: CURRENT_USER,
    historial: [
      {
        id: 'H-001',
        usuario: 'sistema@administracion.gob',
        fecha: '2026-01-10T09:00:00Z',
        accion: 'Creación',
        detalles: 'Alta inicial del elemento de catálogo para identificación ciudadana.'
      }
    ]
  },
  {
    codigo: 'CFT-NOM-COMP',
    tipo: 'Datos Ciudadano',
    nombre: 'Nombres y Apellidos Completos',
    tipoDato: 'Texto',
    longDato: 120,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Texto alfabético con tildes y espacios',
    descripcion: 'Razón social o nombres de la persona natural o jurídica solicitante',
    estado: 'Activo',
    fechaCreacion: '2026-01-10T09:05:00Z',
    fechaModificacion: '2026-01-10T09:05:00Z',
    creadoPor: 'sistema@administracion.gob',
    modificadoPor: 'sistema@administracion.gob',
    historial: [
      {
        id: 'H-002',
        usuario: 'sistema@administracion.gob',
        fecha: '2026-01-10T09:05:00Z',
        accion: 'Creación',
        detalles: 'Definición de nombre completo del ciudadano.'
      }
    ]
  },
  {
    codigo: 'CFT-CORR-ELEC',
    tipo: 'Datos Ciudadano',
    nombre: 'Correo Electrónico de Notificación',
    tipoDato: 'Email',
    longDato: 100,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Formato estándar email: usuario@dominio.com',
    descripcion: 'Buzón para recepción de actos administrativos y autos resolutivos',
    estado: 'Activo',
    fechaCreacion: '2026-01-10T09:10:00Z',
    fechaModificacion: '2026-01-10T09:10:00Z',
    creadoPor: 'sistema@administracion.gob',
    modificadoPor: 'sistema@administracion.gob',
    historial: [
      {
        id: 'H-003',
        usuario: 'sistema@administracion.gob',
        fecha: '2026-01-10T09:10:00Z',
        accion: 'Creación',
        detalles: 'Campo obligatorio para notificación electrónica vinculante.'
      }
    ]
  },
  {
    codigo: 'CFT-TEL-MOVIL',
    tipo: 'Datos Ciudadano',
    nombre: 'Teléfono Celular de Contacto',
    tipoDato: 'Teléfono',
    longDato: 15,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: false,
    dominio: 'Numérico estándar 10 a 15 dígitos con prefijo opcional',
    descripcion: 'Canal de mensajería SMS y comunicación urgente',
    estado: 'Activo',
    fechaCreacion: '2026-01-11T14:00:00Z',
    fechaModificacion: '2026-01-11T14:00:00Z',
    creadoPor: 'sistema@administracion.gob',
    modificadoPor: 'sistema@administracion.gob',
    historial: []
  },
  {
    codigo: 'CFT-DIR-PRED',
    tipo: 'Variables del Trámite',
    nombre: 'Dirección del Inmueble o Establecimiento',
    tipoDato: 'Texto',
    longDato: 160,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Nomenclatura catastral oficial (Calle/Cra/Av/Diag)',
    descripcion: 'Ubicación física donde operará la actividad o se realizará la intervención',
    estado: 'Activo',
    fechaCreacion: '2026-01-12T10:00:00Z',
    fechaModificacion: '2026-01-12T10:00:00Z',
    creadoPor: 'soporte.catastro@entidad.gob',
    modificadoPor: 'soporte.catastro@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-ACT-ECON',
    tipo: 'Variables del Trámite',
    nombre: 'Código y Actividad Económica CIIU',
    tipoDato: 'Catálogo',
    longDato: 50,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Catálogo Nacional CIIU Rev 4 (Comercio, Industria, Servicios, Hostelería)',
    descripcion: 'Clasificación tributaria de la actividad comercial a registrar',
    estado: 'Activo',
    fechaCreacion: '2026-01-15T08:20:00Z',
    fechaModificacion: '2026-01-15T08:20:00Z',
    creadoPor: 'soporte.tributario@entidad.gob',
    modificadoPor: 'soporte.tributario@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-VAL-ACTI',
    tipo: 'Variables del Trámite',
    nombre: 'Monto Estimado de Activos Comerciales',
    tipoDato: 'Moneda',
    longDato: 15,
    longDec: 2,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: '>= 0.00 COP/USD. Valores monetarios en moneda legal',
    descripcion: 'Declaración financiera para liquidación de tarifas administrativas',
    estado: 'Activo',
    fechaCreacion: '2026-01-15T08:25:00Z',
    fechaModificacion: '2026-01-15T08:25:00Z',
    creadoPor: 'soporte.tributario@entidad.gob',
    modificadoPor: 'soporte.tributario@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-SUP-CONS',
    tipo: 'Variables del Trámite',
    nombre: 'Superficie en Metros Cuadrados (m²)',
    tipoDato: 'Numérico',
    longDato: 8,
    longDec: 2,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Rango: 0.50 a 99999.99 m²',
    descripcion: 'Área construida o explotable sujeta a inspección técnica',
    estado: 'Activo',
    fechaCreacion: '2026-01-18T16:00:00Z',
    fechaModificacion: '2026-01-18T16:00:00Z',
    creadoPor: 'urbanismo@entidad.gob',
    modificadoPor: 'urbanismo@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-ADJ-RUT',
    tipo: 'Documentación',
    nombre: 'Registro Único Tributario (RUT) en PDF',
    tipoDato: 'Archivo',
    longDato: 50,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Archivos formato PDF legibles, tamaño máximo 10MB',
    descripcion: 'Constancia oficial de registro tributario con vigencia menor a 30 días',
    estado: 'Activo',
    fechaCreacion: '2026-01-20T11:00:00Z',
    fechaModificacion: '2026-01-20T11:00:00Z',
    creadoPor: 'archivo.digital@entidad.gob',
    modificadoPor: 'archivo.digital@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-ADJ-MEM',
    tipo: 'Documentación',
    nombre: 'Memoria Técnica Descriptiva del Proyecto',
    tipoDato: 'Archivo',
    longDato: 50,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: false,
    dominio: 'PDF o ZIP con planos e informes técnicos de ingeniería (máx 25MB)',
    descripcion: 'Documento firmado por profesional competente colegiado',
    estado: 'Activo',
    fechaCreacion: '2026-01-20T11:10:00Z',
    fechaModificacion: '2026-01-20T11:10:00Z',
    creadoPor: 'archivo.digital@entidad.gob',
    modificadoPor: 'archivo.digital@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-FEC-INIC',
    tipo: 'Variables del Trámite',
    nombre: 'Fecha Prevista de Inicio de Actividades',
    tipoDato: 'Fecha',
    longDato: 10,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Fecha futura o actual en formato YYYY-MM-DD',
    descripcion: 'Momento a partir del cual surte efectos la declaración responsable',
    estado: 'Activo',
    fechaCreacion: '2026-01-22T09:40:00Z',
    fechaModificacion: '2026-01-22T09:40:00Z',
    creadoPor: 'tramites@entidad.gob',
    modificadoPor: 'tramites@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-DEC-VERA',
    tipo: 'Firma Digital',
    nombre: 'Declaración Jurada de Veracidad de Datos',
    tipoDato: 'Booleano',
    longDato: 1,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Valores booleanos: true (Aceptado), false (Rechazado)',
    descripcion: 'Manifiesto bajo gravedad de juramento sobre la autenticidad documental',
    estado: 'Activo',
    fechaCreacion: '2026-01-22T09:45:00Z',
    fechaModificacion: '2026-01-22T09:45:00Z',
    creadoPor: 'juridica@entidad.gob',
    modificadoPor: 'juridica@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-FIR-DIGI',
    tipo: 'Firma Digital',
    nombre: 'Firma Electrónica Avanzada o Certificada',
    tipoDato: 'Archivo',
    longDato: 60,
    longDec: 0,
    acceso: 'Lectura/Escritura',
    visible: true,
    obligatorio: true,
    dominio: 'Certificado digital X.509 o firma biométrica tokenizada',
    descripcion: 'Evidencia criptográfica de autoría del formulario',
    estado: 'Activo',
    fechaCreacion: '2026-01-22T09:50:00Z',
    fechaModificacion: '2026-01-22T09:50:00Z',
    creadoPor: 'seguridad@entidad.gob',
    modificadoPor: 'seguridad@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-MET-RADIC',
    tipo: 'Metadatos',
    nombre: 'Número Consecutivo de Radicado Interno',
    tipoDato: 'Texto',
    longDato: 25,
    longDec: 0,
    acceso: 'Lectura',
    visible: true,
    obligatorio: false,
    dominio: 'Prefijo RAD-[AÑO]-[SECUENCIA NUMÉRICA]',
    descripcion: 'Identificador oficial del expediente en ventanilla única',
    estado: 'Activo',
    fechaCreacion: '2026-01-25T14:15:00Z',
    fechaModificacion: '2026-01-25T14:15:00Z',
    creadoPor: 'sistema@administracion.gob',
    modificadoPor: 'sistema@administracion.gob',
    historial: []
  },
  {
    codigo: 'CFT-OBS-INTE',
    tipo: 'Metadatos',
    nombre: 'Observaciones Internas del Revisor',
    tipoDato: 'Texto',
    longDato: 500,
    longDec: 0,
    acceso: 'Administrador',
    visible: false,
    obligatorio: false,
    dominio: 'Texto libre para anotaciones de auditoría interna',
    descripcion: 'Campo reservado exclusivamente para funcionarios evaluadores',
    estado: 'Activo',
    fechaCreacion: '2026-01-25T14:20:00Z',
    fechaModificacion: '2026-01-25T14:20:00Z',
    creadoPor: 'auditoria@entidad.gob',
    modificadoPor: 'auditoria@entidad.gob',
    historial: []
  },
  {
    codigo: 'CFT-LEG-INAC',
    tipo: 'Variables del Trámite',
    nombre: 'Registro de Folio de Archivo Físico (Desuso)',
    tipoDato: 'Texto',
    longDato: 30,
    longDec: 0,
    acceso: 'Lectura',
    visible: false,
    obligatorio: false,
    dominio: 'Numérico antiguo',
    descripcion: 'Identificador de archivo en papel reemplazado por expediente digital',
    estado: 'Inactivo',
    fechaCreacion: '2025-05-10T10:00:00Z',
    fechaModificacion: '2026-01-05T08:00:00Z',
    creadoPor: 'archivo.historico@entidad.gob',
    modificadoPor: CURRENT_USER,
    historial: [
      {
        id: 'H-LEG-01',
        usuario: CURRENT_USER,
        fecha: '2026-01-05T08:00:00Z',
        accion: 'Inactivación',
        detalles: 'Inactivado por transición total a cero papel y radicación digital.'
      }
    ]
  }
];

const INITIAL_FCTS: FCT[] = [
  {
    id: 'FCT-2026-001',
    nombre: 'Licencia Ambiental para Proyectos de Construcción y Obras Civiles',
    cdgEm: 'EMP-MINAMB-01',
    descripcion: 'Autorización técnica emitida por la autoridad ambiental que faculta la ejecución de obras que generen impacto sobre recursos naturales renovables.',
    categoria: 'Medio Ambiente y Territorio',
    plazoDias: 45,
    estado: 'Activo',
    solicitudesAsociadas: 142,
    fechaCreacion: '2026-01-15T10:00:00Z',
    fechaModificacion: '2026-02-18T15:20:00Z',
    usuarioCreador: 'planeacion@minambiente.gob',
    usuarioModificador: CURRENT_USER,
    camposAsignados: [
      {
        cftCodigo: 'CFT-DOC-ID',
        orden: 1,
        seccion: '1. Identificación del Titular',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura',
        instrucciones: 'Ingrese la cédula de ciudadanía o NIT sin dígito de verificación.'
      },
      {
        cftCodigo: 'CFT-NOM-COMP',
        orden: 2,
        seccion: '1. Identificación del Titular',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura',
        instrucciones: 'Nombre o razón social exacta como figura en el certificado de existencia.'
      },
      {
        cftCodigo: 'CFT-CORR-ELEC',
        orden: 3,
        seccion: '1. Identificación del Titular',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura',
        instrucciones: 'Buzón donde se enviará el expediente y número de radicado.'
      },
      {
        cftCodigo: 'CFT-DIR-PRED',
        orden: 4,
        seccion: '2. Localización y Parámetros de la Obra',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura',
        instrucciones: 'Dirección o coordenadas georreferenciadas del polígono.'
      },
      {
        cftCodigo: 'CFT-SUP-CONS',
        orden: 5,
        seccion: '2. Localización y Parámetros de la Obra',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura',
        instrucciones: 'Área total que será intervenida.'
      },
      {
        cftCodigo: 'CFT-ADJ-MEM',
        orden: 6,
        seccion: '3. Requisitos Técnicos y Anexos',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura',
        instrucciones: 'Estudio de impacto ambiental y memoria descriptiva en PDF.'
      },
      {
        cftCodigo: 'CFT-DEC-VERA',
        orden: 7,
        seccion: '4. Declaración y Firma',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura',
        instrucciones: 'Marque para manifestar veracidad legal.'
      },
      {
        cftCodigo: 'CFT-FIR-DIGI',
        orden: 8,
        seccion: '4. Declaración y Firma',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura',
        instrucciones: 'Firme electrónicamente con su certificado vigente.'
      }
    ],
    historial: [
      {
        id: 'HF-001',
        usuario: 'planeacion@minambiente.gob',
        fecha: '2026-01-15T10:00:00Z',
        accion: 'Creación',
        detalles: 'Aprobación y registro del trámite FCT para licencias ambientales 2026.'
      },
      {
        id: 'HF-002',
        usuario: CURRENT_USER,
        fecha: '2026-02-18T15:20:00Z',
        accion: 'Modificación',
        detalles: 'Se actualizó el plazo de resolución a 45 días hábiles conforme al decreto 2026.'
      }
    ]
  },
  {
    id: 'FCT-2026-002',
    nombre: 'Permiso de Apertura y Funcionamiento de Establecimiento Comercial',
    cdgEm: 'EMP-MUNIC-04',
    descripcion: 'Trámite obligatorio para locales y empresas que inicien actividades comerciales abiertas al público dentro de la jurisdicción municipal.',
    categoria: 'Comercio e Industria',
    plazoDias: 15,
    estado: 'Activo',
    solicitudesAsociadas: 389,
    fechaCreacion: '2026-01-20T11:30:00Z',
    fechaModificacion: '2026-02-10T09:15:00Z',
    usuarioCreador: 'secretaria.gobierno@municipio.gob',
    usuarioModificador: CURRENT_USER,
    camposAsignados: [
      {
        cftCodigo: 'CFT-DOC-ID',
        orden: 1,
        seccion: '1. Datos del Solicitante',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-NOM-COMP',
        orden: 2,
        seccion: '1. Datos del Solicitante',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-CORR-ELEC',
        orden: 3,
        seccion: '1. Datos del Solicitante',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-DIR-PRED',
        orden: 4,
        seccion: '2. Ubicación del Comercio',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-ACT-ECON',
        orden: 5,
        seccion: '2. Ubicación del Comercio',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-ADJ-RUT',
        orden: 6,
        seccion: '3. Anexos Obligatorios',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-FEC-INIC',
        orden: 7,
        seccion: '4. Declaración Responsable',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-DEC-VERA',
        orden: 8,
        seccion: '4. Declaración Responsable',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      }
    ],
    historial: [
      {
        id: 'HF-003',
        usuario: 'secretaria.gobierno@municipio.gob',
        fecha: '2026-01-20T11:30:00Z',
        accion: 'Creación',
        detalles: 'Registro de trámite estandarizado para ventanilla empresarial.'
      }
    ]
  },
  {
    id: 'FCT-2026-003',
    nombre: 'Certificado de Residencia y Vecindad Municipal',
    cdgEm: 'EMP-MUNIC-04',
    descripcion: 'Expedición del certificado oficial que acredita el tiempo de domicilio o permanencia continuada de un ciudadano en el municipio.',
    categoria: 'Identificación y Ciudadanía',
    plazoDias: 3,
    estado: 'Activo',
    solicitudesAsociadas: 924,
    fechaCreacion: '2026-01-22T08:00:00Z',
    fechaModificacion: '2026-01-22T08:00:00Z',
    usuarioCreador: 'atencion.ciudadano@municipio.gob',
    usuarioModificador: 'atencion.ciudadano@municipio.gob',
    camposAsignados: [
      {
        cftCodigo: 'CFT-DOC-ID',
        orden: 1,
        seccion: '1. Datos del Ciudadano',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-NOM-COMP',
        orden: 2,
        seccion: '1. Datos del Ciudadano',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-CORR-ELEC',
        orden: 3,
        seccion: '1. Datos del Ciudadano',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-DIR-PRED',
        orden: 4,
        seccion: '2. Domicilio Declarado',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-DEC-VERA',
        orden: 5,
        seccion: '3. Aceptación',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      }
    ],
    historial: []
  },
  {
    id: 'FCT-2026-004',
    nombre: 'Solicitud de Subsidio Productivo para Pequeñas y Medianas Empresas (PyME)',
    cdgEm: 'EMP-PROD-02',
    descripcion: 'Convocatoria y postulación financiera para fomento de innovación y modernización tecnológica en unidades de negocio locales.',
    categoria: 'Desarrollo Económico',
    plazoDias: 30,
    estado: 'Activo',
    solicitudesAsociadas: 0, // Cero solicitudes: permite demostrar borrado físico y validación
    fechaCreacion: '2026-02-01T14:00:00Z',
    fechaModificacion: '2026-02-01T14:00:00Z',
    usuarioCreador: CURRENT_USER,
    usuarioModificador: CURRENT_USER,
    camposAsignados: [
      {
        cftCodigo: 'CFT-DOC-ID',
        orden: 1,
        seccion: '1. Información de la Empresa',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-NOM-COMP',
        orden: 2,
        seccion: '1. Información de la Empresa',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-VAL-ACTI',
        orden: 3,
        seccion: '2. Balance Financiero',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      },
      {
        cftCodigo: 'CFT-ADJ-RUT',
        orden: 4,
        seccion: '3. Anexos',
        obligatorio: true,
        visible: true,
        acceso: 'Lectura/Escritura'
      }
    ],
    historial: [
      {
        id: 'HF-004',
        usuario: CURRENT_USER,
        fecha: '2026-02-01T14:00:00Z',
        accion: 'Creación',
        detalles: 'Formulario base creado para la convocatoria piloto de innovación.'
      }
    ]
  },
  {
    id: 'FCT-2026-005',
    nombre: 'Inscripción en el Registro de Proveedores en Papel Físico (Obsoleto)',
    cdgEm: 'EMP-COMPRAS-09',
    descripcion: 'Antiguo mecanismo de radicación física para contratistas del estado anterior a la ley de transformación digital.',
    categoria: 'Contratación Pública',
    plazoDias: 20,
    estado: 'Inactivo',
    solicitudesAsociadas: 64, // Inactivo pero con historial de solicitudes preservado
    fechaCreacion: '2025-03-01T10:00:00Z',
    fechaModificacion: '2026-01-02T12:00:00Z',
    usuarioCreador: 'compras@entidad.gob',
    usuarioModificador: CURRENT_USER,
    camposAsignados: [],
    historial: [
      {
        id: 'HF-005',
        usuario: CURRENT_USER,
        fecha: '2026-01-02T12:00:00Z',
        accion: 'Inactivación',
        detalles: 'Inactivación lógica ejecutada. Mantiene 64 solicitudes históricas de ciudadanos para consulta de auditoría.'
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class TramitesService {
  // Estado reactivo principal
  readonly fcts = signal<FCT[]>(this.loadFcts());
  readonly cfts = signal<CFT[]>(this.loadCfts());

  // Trámite actualmente seleccionado para diseño/asignación o detalle
  readonly fctSeleccionadoId = signal<string>('FCT-2026-001');

  // Computed signals
  readonly fctSeleccionado = computed(() => {
    const id = this.fctSeleccionadoId();
    return this.fcts().find(f => f.id === id) || this.fcts()[0] || null;
  });

  readonly fctsActivos = computed(() => {
    return this.fcts().filter(f => f.estado === 'Activo');
  });

  readonly cftsActivos = computed(() => {
    return this.cfts().filter(c => c.estado === 'Activo');
  });

  // Mapa de campos con su enriquecimiento de datos completos
  readonly cftMap = computed(() => {
    const map = new Map<string, CFT>();
    for (const cft of this.cfts()) {
      map.set(cft.codigo, cft);
    }
    return map;
  });

  // Campos asignados al FCT seleccionado con snapshot completo
  readonly camposFctSeleccionado = computed(() => {
    const fct = this.fctSeleccionado();
    if (!fct) return [];
    const map = this.cftMap();
    return fct.camposAsignados
      .map(campo => ({
        ...campo,
        cftSnapshot: map.get(campo.cftCodigo)
      }))
      .sort((a, b) => a.orden - b.orden);
  });

  constructor() {
    // Sincronización automática con localStorage (solo cliente)
    if (typeof window !== 'undefined' && window.localStorage) {
      effect(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY_FCT, JSON.stringify(this.fcts()));
        } catch {
          // Fallback silencioso en caso de quota excedida
        }
      });

      effect(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY_CFT, JSON.stringify(this.cfts()));
        } catch {
          // Fallback silencioso
        }
      });
    }
  }

  private loadFcts(): FCT[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY_FCT);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // En caso de parse error, usar iniciales
      }
    }
    return INITIAL_FCTS;
  }

  private loadCfts(): CFT[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY_CFT);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // En caso de parse error, usar iniciales
      }
    }
    return INITIAL_CFTS;
  }

  public seleccionarFct(id: string): void {
    this.fctSeleccionadoId.set(id);
  }

  // ==========================================
  // OPERACIONES CRUD FCT
  // ==========================================

  /**
   * 1. ➕ Crear FCT (Create)
   * Validación: El sistema no debe permitir duplicar nombres de FCT activos.
   */
  public crearFct(datos: {
    nombre: string;
    cdgEm: string;
    descripcion: string;
    categoria: string;
    plazoDias: number;
    codigoSugerido?: string;
  }): { exito: boolean; mensaje: string; nuevoFct?: FCT } {
    const nombreLimpio = datos.nombre.trim();
    const cdgEmLimpio = datos.cdgEm.trim().toUpperCase();

    if (!nombreLimpio) {
      return { exito: false, mensaje: 'El nombre del trámite es obligatorio.' };
    }
    if (!cdgEmLimpio) {
      return { exito: false, mensaje: 'El código de la empresa (CdgEm) es obligatorio.' };
    }

    // Regla de Negocio: No permitir duplicar nombres de FCT activos
    const existeNombreActivo = this.fcts().some(
      f => f.estado === 'Activo' && f.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    );

    if (existeNombreActivo) {
      return {
        exito: false,
        mensaje: `Ya existe un trámite activo registrado con el nombre "${nombreLimpio}". Por normativa institucional, los nombres de trámites activos deben ser únicos.`
      };
    }

    // Generar código único identificador
    let codigo = (datos.codigoSugerido || '').trim().toUpperCase();
    if (!codigo) {
      const year = new Date().getFullYear();
      const count = this.fcts().length + 1;
      codigo = `FCT-${year}-${String(count).padStart(3, '0')}`;
    }

    // Asegurar que el código no exista
    let intento = 1;
    let codigoFinal = codigo;
    while (this.fcts().some(f => f.id.toUpperCase() === codigoFinal.toUpperCase())) {
      codigoFinal = `${codigo}-${intento}`;
      intento++;
    }

    const fechaActual = new Date().toISOString();
    const nuevoFct: FCT = {
      id: codigoFinal,
      nombre: nombreLimpio,
      cdgEm: cdgEmLimpio,
      descripcion: datos.descripcion.trim() || 'Sin descripción detallada.',
      categoria: datos.categoria.trim() || 'General',
      plazoDias: Number(datos.plazoDias) || 15,
      estado: 'Activo',
      solicitudesAsociadas: 0,
      camposAsignados: [],
      fechaCreacion: fechaActual,
      fechaModificacion: fechaActual,
      usuarioCreador: CURRENT_USER,
      usuarioModificador: CURRENT_USER,
      historial: [
        {
          id: `HIST-${Date.now()}`,
          usuario: CURRENT_USER,
          fecha: fechaActual,
          accion: 'Creación',
          detalles: `Trámite registrado exitosamente bajo la empresa/entidad ${cdgEmLimpio}.`
        }
      ]
    };

    this.fcts.update(lista => [nuevoFct, ...lista]);
    this.seleccionarFct(nuevoFct.id);

    return {
      exito: true,
      mensaje: `Trámite "${nuevoFct.nombre}" creado exitosamente con código ${nuevoFct.id}.`,
      nuevoFct
    };
  }

  /**
   * 3. 📝 Actualizar FCT (Update)
   * Restricción: El código identificador único del FCT no debe ser modificable.
   * Validación: Si cambia el nombre, no duplicar con otro activo.
   */
  public actualizarFct(
    id: string,
    datos: {
      nombre: string;
      cdgEm: string;
      descripcion: string;
      categoria: string;
      plazoDias: number;
    },
    motivoCambio?: string
  ): { exito: boolean; mensaje: string } {
    const fctActual = this.fcts().find(f => f.id === id);
    if (!fctActual) {
      return { exito: false, mensaje: `El trámite con código "${id}" no existe.` };
    }

    const nombreLimpio = datos.nombre.trim();
    const cdgEmLimpio = datos.cdgEm.trim().toUpperCase();

    if (!nombreLimpio) {
      return { exito: false, mensaje: 'El nombre del trámite no puede quedar vacío.' };
    }
    if (!cdgEmLimpio) {
      return { exito: false, mensaje: 'El código de empresa (CdgEm) es obligatorio.' };
    }

    // Validación de nombre duplicado con otro FCT activo
    const existeOtroActivo = this.fcts().some(
      f => f.id !== id && f.estado === 'Activo' && f.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    );

    if (existeOtroActivo) {
      return {
        exito: false,
        mensaje: `Ya existe otro trámite activo con el nombre "${nombreLimpio}". Debe ingresar un nombre único.`
      };
    }

    const fechaActual = new Date().toISOString();
    const cambios: string[] = [];
    if (fctActual.nombre !== nombreLimpio) cambios.push(`Nombre: "${fctActual.nombre}" ➔ "${nombreLimpio}"`);
    if (fctActual.cdgEm !== cdgEmLimpio) cambios.push(`CdgEm: "${fctActual.cdgEm}" ➔ "${cdgEmLimpio}"`);
    if (fctActual.plazoDias !== Number(datos.plazoDias)) cambios.push(`Plazo: ${fctActual.plazoDias}d ➔ ${datos.plazoDias}d`);
    if (fctActual.categoria !== datos.categoria) cambios.push(`Categoría: "${fctActual.categoria}" ➔ "${datos.categoria}"`);

    const detalleHistorial = cambios.length > 0 
      ? cambios.join(' | ') + (motivoCambio ? ` [Motivo: ${motivoCambio}]` : '')
      : (motivoCambio || 'Actualización de especificaciones generales del trámite.');

    const nuevoItemHistorial: HistorialCambio = {
      id: `HIST-${Date.now()}`,
      usuario: CURRENT_USER,
      fecha: fechaActual,
      accion: 'Modificación',
      detalles: detalleHistorial
    };

    this.fcts.update(lista =>
      lista.map(item => {
        if (item.id === id) {
          return {
            ...item,
            // Restricción: El id permanece inalterable
            id: item.id,
            nombre: nombreLimpio,
            cdgEm: cdgEmLimpio,
            descripcion: datos.descripcion.trim(),
            categoria: datos.categoria.trim(),
            plazoDias: Number(datos.plazoDias) || item.plazoDias,
            fechaModificacion: fechaActual,
            usuarioModificador: CURRENT_USER,
            historial: [nuevoItemHistorial, ...item.historial]
          };
        }
        return item;
      })
    );

    return { exito: true, mensaje: `Trámite "${id}" actualizado con éxito en el sistema.` };
  }

  /**
   * 4. ❌ Eliminar / Inactivar FCT (Delete)
   * Regla de negocio (Eliminación Lógica):
   * Se recomienda no borrar físicamente el registro si ya tiene solicitudes asociadas por ciudadanos.
   * En su lugar, se debe cambiar su estado a "Inactivo" para que no esté disponible para nuevas solicitudes, manteniendo el histórico.
   */
  public inactivarFct(id: string, motivo: string): { exito: boolean; mensaje: string } {
    const fct = this.fcts().find(f => f.id === id);
    if (!fct) {
      return { exito: false, mensaje: 'Trámite no encontrado.' };
    }

    const fechaActual = new Date().toISOString();
    const nuevoItemHistorial: HistorialCambio = {
      id: `HIST-${Date.now()}`,
      usuario: CURRENT_USER,
      fecha: fechaActual,
      accion: 'Inactivación',
      detalles: `Inactivación lógica aplicada: ${motivo.trim() || 'Baja operativa del trámite. Se conservan solicitudes ciudadanas asociadas.'}`
    };

    this.fcts.update(lista =>
      lista.map(item => {
        if (item.id === id) {
          return {
            ...item,
            estado: 'Inactivo',
            fechaModificacion: fechaActual,
            usuarioModificador: CURRENT_USER,
            historial: [nuevoItemHistorial, ...item.historial]
          };
        }
        return item;
      })
    );

    return {
      exito: true,
      mensaje: `Trámite "${fct.nombre}" (${fct.id}) inactivado exitosamente. No estará disponible para nuevas solicitudes ciudadanas.`
    };
  }

  public reactivarFct(id: string): { exito: boolean; mensaje: string } {
    const fct = this.fcts().find(f => f.id === id);
    if (!fct) {
      return { exito: false, mensaje: 'Trámite no encontrado.' };
    }

    // Verificar que no choque con otro activo que tenga el mismo nombre
    const choqueNombre = this.fcts().some(
      f => f.id !== id && f.estado === 'Activo' && f.nombre.trim().toLowerCase() === fct.nombre.trim().toLowerCase()
    );

    if (choqueNombre) {
      return {
        exito: false,
        mensaje: `No se puede reactivar: ya existe otro trámite activo con el nombre "${fct.nombre}". Modifique el nombre antes de reactivar.`
      };
    }

    const fechaActual = new Date().toISOString();
    const nuevoItemHistorial: HistorialCambio = {
      id: `HIST-${Date.now()}`,
      usuario: CURRENT_USER,
      fecha: fechaActual,
      accion: 'Reactivación',
      detalles: 'El trámite ha sido reactivado y vuelve a estar disponible para recepción de solicitudes.'
    };

    this.fcts.update(lista =>
      lista.map(item => {
        if (item.id === id) {
          return {
            ...item,
            estado: 'Activo',
            fechaModificacion: fechaActual,
            usuarioModificador: CURRENT_USER,
            historial: [nuevoItemHistorial, ...item.historial]
          };
        }
        return item;
      })
    );

    return {
      exito: true,
      mensaje: `Trámite "${fct.id}" reactivado correctamente.`
    };
  }

  public eliminarFctFisico(id: string): { exito: boolean; mensaje: string } {
    const fct = this.fcts().find(f => f.id === id);
    if (!fct) {
      return { exito: false, mensaje: 'Trámite no encontrado.' };
    }

    if (fct.solicitudesAsociadas > 0) {
      return {
        exito: false,
        mensaje: `Operación bloqueada por integridad institucional: El trámite "${fct.id}" posee ${fct.solicitudesAsociadas} solicitudes ciudadanas en histórico. Aplique Inactivación Lógica en lugar de borrado físico.`
      };
    }

    this.fcts.update(lista => lista.filter(item => item.id !== id));
    
    // Si era el seleccionado, reasignar al primero
    if (this.fctSeleccionadoId() === id) {
      const restantes = this.fcts();
      this.fctSeleccionadoId.set(restantes.length > 0 ? restantes[0].id : '');
    }

    return {
      exito: true,
      mensaje: `Trámite "${fct.id}" eliminado físicamente de la base de datos (0 solicitudes registradas).`
    };
  }

  // ==========================================
  // OPERACIONES CRUD CFT / CET
  // ==========================================

  /**
   * 1. ➕ Crear CFT / CET (Create)
   * Campos requeridos: Código, Tipo, Nombre.
   * Validación: El sistema no debe permitir duplicar nombres de CFT activos.
   */
  public crearCft(datos: {
    codigo: string;
    tipo: string;
    nombre: string;
    tipoDato: TipoDatoCampo;
    longDato: number;
    longDec: number;
    acceso: TipoAccesoCampo;
    visible: boolean;
    obligatorio: boolean;
    dominio: string;
    descripcion: string;
  }): { exito: boolean; mensaje: string; nuevoCft?: CFT } {
    const codigoLimpio = datos.codigo.trim().toUpperCase();
    const tipoLimpio = datos.tipo.trim();
    const nombreLimpio = datos.nombre.trim();

    if (!codigoLimpio) return { exito: false, mensaje: 'El Código del campo es requerido.' };
    if (!tipoLimpio) return { exito: false, mensaje: 'El Tipo del campo es requerido.' };
    if (!nombreLimpio) return { exito: false, mensaje: 'El Nombre del campo es requerido.' };

    // Verificar código único
    const existeCodigo = this.cfts().some(c => c.codigo.toUpperCase() === codigoLimpio);
    if (existeCodigo) {
      return { exito: false, mensaje: `Ya existe un elemento en el catálogo con el código "${codigoLimpio}".` };
    }

    // Validación: No duplicar nombres de CFT activos
    const existeNombreActivo = this.cfts().some(
      c => c.estado === 'Activo' && c.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    );
    if (existeNombreActivo) {
      return {
        exito: false,
        mensaje: `Ya existe un campo activo con el nombre "${nombreLimpio}". El nombre debe ser único entre campos activos.`
      };
    }

    const fechaActual = new Date().toISOString();
    const nuevoCft: CFT = {
      codigo: codigoLimpio,
      tipo: tipoLimpio,
      nombre: nombreLimpio,
      tipoDato: datos.tipoDato || 'Texto',
      longDato: Number(datos.longDato) || 50,
      longDec: Number(datos.longDec) || 0,
      acceso: datos.acceso || 'Lectura/Escritura',
      visible: datos.visible !== false,
      obligatorio: datos.obligatorio === true,
      dominio: datos.dominio.trim() || 'Sin restricción de dominio específica',
      descripcion: datos.descripcion.trim() || 'Definición estándar de catálogo.',
      estado: 'Activo',
      fechaCreacion: fechaActual,
      fechaModificacion: fechaActual,
      creadoPor: CURRENT_USER,
      modificadoPor: CURRENT_USER,
      historial: [
        {
          id: `HCFT-${Date.now()}`,
          usuario: CURRENT_USER,
          fecha: fechaActual,
          accion: 'Creación',
          detalles: `Alta de campo en catálogo general: Tipo ${tipoLimpio}, Dato ${datos.tipoDato}.`
        }
      ]
    };

    this.cfts.update(lista => [nuevoCft, ...lista]);

    return {
      exito: true,
      mensaje: `Campo "${nuevoCft.codigo}" registrado exitosamente en el catálogo CFT/CET.`,
      nuevoCft
    };
  }

  /**
   * 3. 📝 Actualizar CFT (Update)
   * Restricción: El código identificador único del CFT no debe ser modificable.
   * Validación: Si cambia el nombre, no duplicar con otro activo.
   */
  public actualizarCft(
    codigo: string,
    datos: {
      tipo: string;
      nombre: string;
      tipoDato: TipoDatoCampo;
      longDato: number;
      longDec: number;
      acceso: TipoAccesoCampo;
      visible: boolean;
      obligatorio: boolean;
      dominio: string;
      descripcion: string;
    },
    motivo?: string
  ): { exito: boolean; mensaje: string } {
    const cftActual = this.cfts().find(c => c.codigo === codigo);
    if (!cftActual) {
      return { exito: false, mensaje: `El campo "${codigo}" no existe en el catálogo.` };
    }

    const nombreLimpio = datos.nombre.trim();
    if (!nombreLimpio) {
      return { exito: false, mensaje: 'El nombre del campo es requerido.' };
    }

    // Validación de nombre activo único
    const existeOtroActivo = this.cfts().some(
      c => c.codigo !== codigo && c.estado === 'Activo' && c.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    );
    if (existeOtroActivo) {
      return {
        exito: false,
        mensaje: `Ya existe otro campo activo con el nombre "${nombreLimpio}". Ingrese una denominación distinta.`
      };
    }

    const fechaActual = new Date().toISOString();
    const nuevoHistorial: HistorialCambio = {
      id: `HCFT-${Date.now()}`,
      usuario: CURRENT_USER,
      fecha: fechaActual,
      accion: 'Modificación',
      detalles: motivo?.trim() || `Actualización de parámetros técnicos del campo (Tipo: ${datos.tipo}, TipoDato: ${datos.tipoDato}).`
    };

    this.cfts.update(lista =>
      lista.map(item => {
        if (item.codigo === codigo) {
          return {
            ...item,
            // Restricción: Código inmutable
            codigo: item.codigo,
            tipo: datos.tipo.trim(),
            nombre: nombreLimpio,
            tipoDato: datos.tipoDato,
            longDato: Number(datos.longDato) || 50,
            longDec: Number(datos.longDec) || 0,
            acceso: datos.acceso,
            visible: datos.visible,
            obligatorio: datos.obligatorio,
            dominio: datos.dominio.trim(),
            descripcion: datos.descripcion.trim(),
            fechaModificacion: fechaActual,
            modificadoPor: CURRENT_USER,
            historial: [nuevoHistorial, ...item.historial]
          };
        }
        return item;
      })
    );

    return { exito: true, mensaje: `Campo "${codigo}" actualizado correctamente.` };
  }

  /**
   * 4. ❌ Eliminar / Inactivar CFT (Delete)
   * Regla de negocio (Eliminación Lógica): Si está en uso en trámites o solicitudes, cambiar a Inactivo.
   */
  public inactivarCft(codigo: string, motivo: string): { exito: boolean; mensaje: string } {
    const cft = this.cfts().find(c => c.codigo === codigo);
    if (!cft) return { exito: false, mensaje: 'Campo no encontrado.' };

    const fechaActual = new Date().toISOString();
    const nuevoHistorial: HistorialCambio = {
      id: `HCFT-${Date.now()}`,
      usuario: CURRENT_USER,
      fecha: fechaActual,
      accion: 'Inactivación',
      detalles: `Inactivación lógica: ${motivo.trim() || 'Baja técnica del elemento de catálogo.'}`
    };

    this.cfts.update(lista =>
      lista.map(item => {
        if (item.codigo === codigo) {
          return {
            ...item,
            estado: 'Inactivo',
            fechaModificacion: fechaActual,
            modificadoPor: CURRENT_USER,
            historial: [nuevoHistorial, ...item.historial]
          };
        }
        return item;
      })
    );

    return { exito: true, mensaje: `Campo "${codigo}" inactivado lógicamente en el catálogo.` };
  }

  public reactivarCft(codigo: string): { exito: boolean; mensaje: string } {
    const cft = this.cfts().find(c => c.codigo === codigo);
    if (!cft) return { exito: false, mensaje: 'Campo no encontrado.' };

    // Validar nombre único entre activos
    const choque = this.cfts().some(
      c => c.codigo !== codigo && c.estado === 'Activo' && c.nombre.trim().toLowerCase() === cft.nombre.trim().toLowerCase()
    );
    if (choque) {
      return {
        exito: false,
        mensaje: `No se puede reactivar: existe otro campo activo con el nombre "${cft.nombre}".`
      };
    }

    const fechaActual = new Date().toISOString();
    this.cfts.update(lista =>
      lista.map(item => {
        if (item.codigo === codigo) {
          return {
            ...item,
            estado: 'Activo',
            fechaModificacion: fechaActual,
            modificadoPor: CURRENT_USER,
            historial: [
              {
                id: `HCFT-${Date.now()}`,
                usuario: CURRENT_USER,
                fecha: fechaActual,
                accion: 'Reactivación',
                detalles: 'Campo reactivado para disponibilidad en diseño de trámites.'
              },
              ...item.historial
            ]
          };
        }
        return item;
      })
    );

    return { exito: true, mensaje: `Campo "${codigo}" reactivado exitosamente.` };
  }

  public eliminarCftFisico(codigo: string): { exito: boolean; mensaje: string } {
    // Verificar si está asignado a algún FCT
    const tramitesQueLoUsan = this.fcts().filter(f =>
      f.camposAsignados.some(c => c.cftCodigo === codigo)
    );

    if (tramitesQueLoUsan.length > 0) {
      const nombres = tramitesQueLoUsan.map(f => f.id).join(', ');
      return {
        exito: false,
        mensaje: `No es posible eliminar físicamente el campo "${codigo}": está asignado a los trámites (${nombres}). Debe usar Eliminación Lógica (Inactivar).`
      };
    }

    this.cfts.update(lista => lista.filter(c => c.codigo !== codigo));
    return { exito: true, mensaje: `Campo "${codigo}" eliminado permanentemente del catálogo.` };
  }

  // ==========================================
  // ASIGNACIÓN DE CAMPOS AL FCT (DISEÑADOR)
  // ==========================================

  public asignarCampoAFct(
    fctId: string,
    campo: {
      cftCodigo: string;
      seccion?: string;
      obligatorio?: boolean;
      visible?: boolean;
      instrucciones?: string;
    }
  ): { exito: boolean; mensaje: string } {
    const fct = this.fcts().find(f => f.id === fctId);
    if (!fct) return { exito: false, mensaje: 'Trámite destino no encontrado.' };

    const cft = this.cfts().find(c => c.codigo === campo.cftCodigo);
    if (!cft) return { exito: false, mensaje: 'Campo de catálogo no encontrado.' };

    // Verificar si ya está asignado
    const yaAsignado = fct.camposAsignados.some(c => c.cftCodigo === campo.cftCodigo);
    if (yaAsignado) {
      return {
        exito: false,
        mensaje: `El campo "${cft.nombre}" (${campo.cftCodigo}) ya forma parte del trámite "${fct.id}".`
      };
    }

    const nuevoOrden = fct.camposAsignados.length + 1;
    const nuevoAsignado: CampoAsignadoFct = {
      cftCodigo: campo.cftCodigo,
      cftSnapshot: cft,
      orden: nuevoOrden,
      seccion: campo.seccion?.trim() || '1. Datos Generales de la Solicitud',
      obligatorio: campo.obligatorio !== undefined ? campo.obligatorio : cft.obligatorio,
      visible: campo.visible !== undefined ? campo.visible : cft.visible,
      acceso: cft.acceso,
      instrucciones: campo.instrucciones || cft.descripcion
    };

    const fechaActual = new Date().toISOString();
    const historialItem: HistorialCambio = {
      id: `HF-${Date.now()}`,
      usuario: CURRENT_USER,
      fecha: fechaActual,
      accion: 'Asignación de Campos',
      detalles: `Campo agregado: ${cft.codigo} - ${cft.nombre} en sección "${nuevoAsignado.seccion}".`
    };

    this.fcts.update(lista =>
      lista.map(item => {
        if (item.id === fctId) {
          return {
            ...item,
            fechaModificacion: fechaActual,
            usuarioModificador: CURRENT_USER,
            camposAsignados: [...item.camposAsignados, nuevoAsignado],
            historial: [historialItem, ...item.historial]
          };
        }
        return item;
      })
    );

    return {
      exito: true,
      mensaje: `Campo "${cft.nombre}" asignado correctamente al trámite "${fct.nombre}".`
    };
  }

  public removerCampoDeFct(fctId: string, cftCodigo: string): { exito: boolean; mensaje: string } {
    const fct = this.fcts().find(f => f.id === fctId);
    if (!fct) return { exito: false, mensaje: 'Trámite no encontrado.' };

    const fechaActual = new Date().toISOString();
    const historialItem: HistorialCambio = {
      id: `HF-${Date.now()}`,
      usuario: CURRENT_USER,
      fecha: fechaActual,
      accion: 'Modificación',
      detalles: `Campo retirado de la configuración del trámite: ${cftCodigo}.`
    };

    this.fcts.update(lista =>
      lista.map(item => {
        if (item.id === fctId) {
          const filtrados = item.camposAsignados
            .filter(c => c.cftCodigo !== cftCodigo)
            .map((c, index) => ({ ...c, orden: index + 1 }));
          return {
            ...item,
            fechaModificacion: fechaActual,
            usuarioModificador: CURRENT_USER,
            camposAsignados: filtrados,
            historial: [historialItem, ...item.historial]
          };
        }
        return item;
      })
    );

    return { exito: true, mensaje: `Campo "${cftCodigo}" retirado del trámite.` };
  }

  public actualizarConfiguracionCampoFct(
    fctId: string,
    cftCodigo: string,
    cambios: Partial<CampoAsignadoFct>
  ): { exito: boolean; mensaje: string } {
    this.fcts.update(lista =>
      lista.map(item => {
        if (item.id === fctId) {
          const actualizados = item.camposAsignados.map(c => {
            if (c.cftCodigo === cftCodigo) {
              return { ...c, ...cambios };
            }
            return c;
          });
          return {
            ...item,
            fechaModificacion: new Date().toISOString(),
            usuarioModificador: CURRENT_USER,
            camposAsignados: actualizados
          };
        }
        return item;
      })
    );
    return { exito: true, mensaje: 'Configuración de campo en trámite guardada.' };
  }

  public moverCampoFct(fctId: string, cftCodigo: string, direccion: 'arriba' | 'abajo'): void {
    const fct = this.fcts().find(f => f.id === fctId);
    if (!fct) return;

    const campos = [...fct.camposAsignados].sort((a, b) => a.orden - b.orden);
    const index = campos.findIndex(c => c.cftCodigo === cftCodigo);
    if (index === -1) return;

    if (direccion === 'arriba' && index > 0) {
      const temp = campos[index];
      campos[index] = campos[index - 1];
      campos[index - 1] = temp;
    } else if (direccion === 'abajo' && index < campos.length - 1) {
      const temp = campos[index];
      campos[index] = campos[index + 1];
      campos[index + 1] = temp;
    } else {
      return;
    }

    const normalizados = campos.map((c, i) => ({ ...c, orden: i + 1 }));
    this.fcts.update(lista =>
      lista.map(item => (item.id === fctId ? { ...item, camposAsignados: normalizados } : item))
    );
  }

  // ==========================================
  // BUSCADOR AVANZADO CET / CFT
  // Filtros: Código, Tipo, Nombre, Obligatorio, TipoDato, LongDato, LongDec, Acceso, Visible, Dominio
  // ==========================================
  public buscarCamposCet(filtros: FiltroBuscadorCet, soloActivos = false): CFT[] {
    return this.cfts().filter(c => {
      if (soloActivos && c.estado !== 'Activo') return false;

      // Filtro Código
      if (filtros.codigo && filtros.codigo.trim() !== '') {
        const cod = filtros.codigo.trim().toLowerCase();
        if (!c.codigo.toLowerCase().includes(cod)) return false;
      }

      // Filtro Tipo
      if (filtros.tipo && filtros.tipo !== 'Todos') {
        if (c.tipo.toLowerCase() !== filtros.tipo.toLowerCase()) return false;
      }

      // Filtro Nombre
      if (filtros.nombre && filtros.nombre.trim() !== '') {
        const nom = filtros.nombre.trim().toLowerCase();
        if (!c.nombre.toLowerCase().includes(nom) && !c.descripcion.toLowerCase().includes(nom)) {
          return false;
        }
      }

      // Filtro Obligatorio ('Todos' | 'Si' | 'No')
      if (filtros.obligatorio && filtros.obligatorio !== 'Todos') {
        const debeSerObligatorio = filtros.obligatorio === 'Si';
        if (c.obligatorio !== debeSerObligatorio) return false;
      }

      // Filtro TipoDato
      if (filtros.tipoDato && filtros.tipoDato !== 'Todos') {
        if (c.tipoDato.toLowerCase() !== filtros.tipoDato.toLowerCase()) return false;
      }

      // Filtro LongDato
      if (filtros.longDato !== undefined && filtros.longDato !== null && filtros.longDato > 0) {
        if (c.longDato > filtros.longDato) return false;
      }

      // Filtro LongDec
      if (filtros.longDec !== undefined && filtros.longDec !== null) {
        if (c.longDec !== Number(filtros.longDec)) return false;
      }

      // Filtro Acceso
      if (filtros.acceso && filtros.acceso !== 'Todos') {
        if (c.acceso.toLowerCase() !== filtros.acceso.toLowerCase()) return false;
      }

      // Filtro Visible ('Todos' | 'Si' | 'No')
      if (filtros.visible && filtros.visible !== 'Todos') {
        const debeSerVisible = filtros.visible === 'Si';
        if (c.visible !== debeSerVisible) return false;
      }

      // Filtro Dominio
      if (filtros.dominio && filtros.dominio.trim() !== '') {
        const dom = filtros.dominio.trim().toLowerCase();
        if (!c.dominio.toLowerCase().includes(dom)) return false;
      }

      return true;
    });
  }

  /**
   * Conteo de trámites en los que un CFT está asignado
   */
  public conteoUsoCft(codigo: string): number {
    return this.fcts().filter(f => f.camposAsignados.some(c => c.cftCodigo === codigo)).length;
  }

  public reiniciarDatosPredeterminados(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY_FCT);
      window.localStorage.removeItem(STORAGE_KEY_CFT);
    }
    this.fcts.set(INITIAL_FCTS);
    this.cfts.set(INITIAL_CFTS);
    this.fctSeleccionadoId.set('FCT-2026-001');
  }
}
