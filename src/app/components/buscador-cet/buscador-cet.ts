import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../../services/tramites.service';
import { CFT, CampoAsignadoFct, FiltroBuscadorCet } from '../../models/tramite.models';

@Component({
  selector: 'app-buscador-cet',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './buscador-cet.html'
})
export class BuscadorCetComponent {
  private readonly tramitesService = inject(TramitesService);

  readonly fcts = this.tramitesService.fcts;
  readonly cfts = this.tramitesService.cfts;
  readonly fctSeleccionado = this.tramitesService.fctSeleccionado;
  readonly camposFctSeleccionado = this.tramitesService.camposFctSeleccionado;

  // Filtros reactivos para el buscador CET
  readonly formFiltros = new FormGroup({
    codigo: new FormControl('', { nonNullable: true }),
    tipo: new FormControl('Todos', { nonNullable: true }),
    nombre: new FormControl('', { nonNullable: true }),
    obligatorio: new FormControl<'Todos' | 'Si' | 'No'>('Todos', { nonNullable: true }),
    tipoDato: new FormControl('Todos', { nonNullable: true }),
    longDato: new FormControl<number | null>(null),
    longDec: new FormControl<number | null>(null),
    acceso: new FormControl('Todos', { nonNullable: true }),
    visible: new FormControl<'Todos' | 'Si' | 'No'>('Todos', { nonNullable: true }),
    dominio: new FormControl('', { nonNullable: true })
  });

  // Modal para configurar y confirmar asignación del campo
  readonly modalAsignarAbierto = signal<boolean>(false);
  readonly campoParaAsignar = signal<CFT | null>(null);

  // Formulario de asignación específica en el FCT
  readonly formAsignacion = new FormGroup({
    seccion: new FormControl('1. Datos Generales de la Solicitud', { nonNullable: true }),
    nuevaSeccionTexto: new FormControl('', { nonNullable: true }),
    obligatorio: new FormControl(false, { nonNullable: true }),
    visible: new FormControl(true, { nonNullable: true }),
    instrucciones: new FormControl('', { nonNullable: true })
  });

  // Notificación Toast
  readonly mensajeToast = signal<{ tipo: 'exito' | 'error' | 'aviso'; texto: string } | null>(null);

  // Filtros aplicados actuales (con trigger de búsqueda)
  readonly filtrosActivos = signal<FiltroBuscadorCet>({
    codigo: '',
    tipo: 'Todos',
    nombre: '',
    obligatorio: 'Todos',
    tipoDato: 'Todos',
    longDato: null,
    longDec: null,
    acceso: 'Todos',
    visible: 'Todos',
    dominio: ''
  });

  // Búsqueda ejecutada en tiempo real o por botón
  readonly resultadosBusqueda = computed(() => {
    return this.tramitesService.buscarCamposCet(this.filtrosActivos(), false);
  });

  // Agrupación de campos del FCT por sección
  readonly camposPorSeccion = computed(() => {
    const campos = this.camposFctSeleccionado();
    const mapa = new Map<string, typeof campos>();

    for (const c of campos) {
      const sec = c.seccion || 'General';
      if (!mapa.has(sec)) {
        mapa.set(sec, []);
      }
      mapa.get(sec)!.push(c);
    }

    return Array.from(mapa.entries()).map(([seccion, items]) => ({
      seccion,
      campos: items
    }));
  });

  // Secciones sugeridas
  readonly seccionesSugeridas = [
    '1. Identificación y Contacto del Solicitante',
    '2. Datos Específicos del Trámite y Localización',
    '3. Requisitos Técnicos y Documentación Soporte',
    '4. Declaración Jurada, Firma y Notificación'
  ];

  // Ejecutar búsqueda explícita
  ejecutarBusqueda(): void {
    const val = this.formFiltros.getRawValue();
    this.filtrosActivos.set({
      codigo: val.codigo,
      tipo: val.tipo,
      nombre: val.nombre,
      obligatorio: val.obligatorio,
      tipoDato: val.tipoDato,
      longDato: val.longDato ? Number(val.longDato) : null,
      longDec: val.longDec !== null && val.longDec !== undefined && String(val.longDec) !== '' ? Number(val.longDec) : null,
      acceso: val.acceso,
      visible: val.visible,
      dominio: val.dominio
    });
  }

  limpiarFiltros(): void {
    this.formFiltros.reset({
      codigo: '',
      tipo: 'Todos',
      nombre: '',
      obligatorio: 'Todos',
      tipoDato: 'Todos',
      longDato: null,
      longDec: null,
      acceso: 'Todos',
      visible: 'Todos',
      dominio: ''
    });
    this.ejecutarBusqueda();
  }

  cambiarFctDestino(id: string): void {
    this.tramitesService.seleccionarFct(id);
  }

  // Comprobar si el campo ya está asignado al FCT activo
  estaAsignadoAlFct(codigo: string): boolean {
    const fct = this.fctSeleccionado();
    if (!fct) return false;
    return fct.camposAsignados.some(c => c.cftCodigo === codigo);
  }

  // Flujo: 3. Selección del Evento y 4. Asignación de Campos al FCT
  iniciarAsignacion(cft: CFT): void {
    const fct = this.fctSeleccionado();
    if (!fct) {
      this.mostrarToast('error', 'Seleccione primero un trámite FCT destino.');
      return;
    }

    if (this.estaAsignadoAlFct(cft.codigo)) {
      this.mostrarToast('aviso', `El campo "${cft.codigo}" ya está asignado al trámite "${fct.nombre}".`);
      return;
    }

    this.campoParaAsignar.set(cft);
    this.formAsignacion.reset({
      seccion: '2. Datos Específicos del Trámite y Localización',
      nuevaSeccionTexto: '',
      obligatorio: cft.obligatorio,
      visible: cft.visible,
      instrucciones: cft.descripcion
    });
    this.modalAsignarAbierto.set(true);
  }

  confirmarAsignacion(): void {
    const fct = this.fctSeleccionado();
    const cft = this.campoParaAsignar();
    if (!fct || !cft) return;

    const val = this.formAsignacion.getRawValue();
    const seccionFinal = val.nuevaSeccionTexto.trim() !== '' ? val.nuevaSeccionTexto.trim() : val.seccion;

    const res = this.tramitesService.asignarCampoAFct(fct.id, {
      cftCodigo: cft.codigo,
      seccion: seccionFinal,
      obligatorio: val.obligatorio,
      visible: val.visible,
      instrucciones: val.instrucciones
    });

    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      this.modalAsignarAbierto.set(false);
      this.campoParaAsignar.set(null);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  cerrarModalAsignar(): void {
    this.modalAsignarAbierto.set(false);
    this.campoParaAsignar.set(null);
  }

  removerCampo(cftCodigo: string): void {
    const fct = this.fctSeleccionado();
    if (!fct) return;

    const res = this.tramitesService.removerCampoDeFct(fct.id, cftCodigo);
    if (res.exito) {
      this.mostrarToast('aviso', res.mensaje);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  moverCampo(cftCodigo: string, direccion: 'arriba' | 'abajo'): void {
    const fct = this.fctSeleccionado();
    if (!fct) return;
    this.tramitesService.moverCampoFct(fct.id, cftCodigo, direccion);
  }

  toggleObligatorioCampo(campo: CampoAsignadoFct): void {
    const fct = this.fctSeleccionado();
    if (!fct) return;
    this.tramitesService.actualizarConfiguracionCampoFct(fct.id, campo.cftCodigo, {
      obligatorio: !campo.obligatorio
    });
  }

  toggleVisibleCampo(campo: CampoAsignadoFct): void {
    const fct = this.fctSeleccionado();
    if (!fct) return;
    this.tramitesService.actualizarConfiguracionCampoFct(fct.id, campo.cftCodigo, {
      visible: !campo.visible
    });
  }

  mostrarToast(tipo: 'exito' | 'error' | 'aviso', texto: string): void {
    this.mensajeToast.set({ tipo, texto });
    setTimeout(() => {
      this.mensajeToast.set(null);
    }, 4500);
  }

  trackByCodigo(index: number, cft: CFT): string {
    return cft.codigo;
  }
}
