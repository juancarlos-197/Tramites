import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../../services/tramites.service';
import { CFT, TipoDatoCampo, TipoAccesoCampo } from '../../models/tramite.models';

@Component({
  selector: 'app-cft-crud',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cft-crud.html'
})
export class CftCrudComponent {
  private readonly tramitesService = inject(TramitesService);

  readonly cfts = this.tramitesService.cfts;
  readonly fcts = this.tramitesService.fcts;

  // Filtros (Read)
  readonly filtroTexto = signal<string>('');
  readonly filtroEstado = signal<'Todos' | 'Activo' | 'Inactivo'>('Todos');
  readonly filtroTipo = signal<string>('Todos');
  readonly filtroTipoDato = signal<string>('Todos');

  // Modales y Drawer
  readonly modalCrearAbierto = signal<boolean>(false);
  readonly modalEditarAbierto = signal<boolean>(false);
  readonly drawerDetalleAbierto = signal<boolean>(false);
  readonly modalInactivarAbierto = signal<boolean>(false);
  readonly modalEliminarFisicoAbierto = signal<boolean>(false);

  readonly cftSeleccionado = signal<CFT | null>(null);
  readonly mensajeToast = signal<{ tipo: 'exito' | 'error' | 'aviso'; texto: string } | null>(null);

  // Formulario Crear CFT (Campos requeridos: Código, Tipo, Nombre)
  readonly formCrear = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    tipo: new FormControl('Variables del Trámite', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    tipoDato: new FormControl<TipoDatoCampo>('Texto', { nonNullable: true, validators: [Validators.required] }),
    longDato: new FormControl(50, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    longDec: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    acceso: new FormControl<TipoAccesoCampo>('Lectura/Escritura', { nonNullable: true, validators: [Validators.required] }),
    visible: new FormControl(true, { nonNullable: true }),
    obligatorio: new FormControl(false, { nonNullable: true }),
    dominio: new FormControl('', { nonNullable: true }),
    descripcion: new FormControl('', { nonNullable: true })
  });

  // Formulario Editar CFT (Restricción: Código inmutable)
  readonly formEditar = new FormGroup({
    codigo: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    tipo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    tipoDato: new FormControl<TipoDatoCampo>('Texto', { nonNullable: true, validators: [Validators.required] }),
    longDato: new FormControl(50, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    longDec: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    acceso: new FormControl<TipoAccesoCampo>('Lectura/Escritura', { nonNullable: true, validators: [Validators.required] }),
    visible: new FormControl(true, { nonNullable: true }),
    obligatorio: new FormControl(false, { nonNullable: true }),
    dominio: new FormControl('', { nonNullable: true }),
    descripcion: new FormControl('', { nonNullable: true }),
    motivo: new FormControl('', { nonNullable: true })
  });

  // Formulario Inactivación (Eliminación Lógica)
  readonly formInactivar = new FormGroup({
    motivo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] })
  });

  // Tipos disponibles en el catálogo
  readonly tiposDisponibles = computed(() => {
    const set = new Set<string>();
    for (const c of this.cfts()) {
      if (c.tipo) set.add(c.tipo);
    }
    return Array.from(set).sort();
  });

  // Filtrado reactivo de la tabla CFT
  readonly cftsFiltrados = computed(() => {
    const texto = this.filtroTexto().trim().toLowerCase();
    const estado = this.filtroEstado();
    const tipo = this.filtroTipo();
    const tipoDato = this.filtroTipoDato();

    return this.cfts().filter(c => {
      if (texto) {
        const coincideNom = c.nombre.toLowerCase().includes(texto);
        const coincideCod = c.codigo.toLowerCase().includes(texto);
        const coincideDesc = c.descripcion.toLowerCase().includes(texto);
        const coincideDom = c.dominio.toLowerCase().includes(texto);
        if (!coincideNom && !coincideCod && !coincideDesc && !coincideDom) {
          return false;
        }
      }

      if (estado !== 'Todos' && c.estado !== estado) {
        return false;
      }

      if (tipo !== 'Todos' && c.tipo !== tipo) {
        return false;
      }

      if (tipoDato !== 'Todos' && c.tipoDato !== tipoDato) {
        return false;
      }

      return true;
    });
  });

  // Métricas
  readonly totalCft = computed(() => this.cfts().length);
  readonly activosCft = computed(() => this.cfts().filter(c => c.estado === 'Activo').length);
  readonly inactivosCft = computed(() => this.cfts().filter(c => c.estado === 'Inactivo').length);

  // Cuántos trámites usan el CFT seleccionado
  readonly tramitesQueUsanSeleccionado = computed(() => {
    const cft = this.cftSeleccionado();
    if (!cft) return [];
    return this.fcts().filter(f => f.camposAsignados.some(c => c.cftCodigo === cft.codigo));
  });

  // ============================
  // OPERACIONES CRUD
  // ============================

  abrirCrear(): void {
    const seq = String(this.cfts().length + 1).padStart(3, '0');
    this.formCrear.reset({
      codigo: `CFT-VAR-${seq}`,
      tipo: 'Variables del Trámite',
      nombre: '',
      tipoDato: 'Texto',
      longDato: 50,
      longDec: 0,
      acceso: 'Lectura/Escritura',
      visible: true,
      obligatorio: false,
      dominio: 'Texto alfanumérico estándar',
      descripcion: ''
    });
    this.modalCrearAbierto.set(true);
  }

  cerrarCrear(): void {
    this.modalCrearAbierto.set(false);
  }

  guardarNuevoCft(): void {
    if (this.formCrear.invalid) {
      this.formCrear.markAllAsTouched();
      return;
    }

    const val = this.formCrear.getRawValue();
    const res = this.tramitesService.crearCft({
      codigo: val.codigo,
      tipo: val.tipo,
      nombre: val.nombre,
      tipoDato: val.tipoDato,
      longDato: val.longDato,
      longDec: val.longDec,
      acceso: val.acceso,
      visible: val.visible,
      obligatorio: val.obligatorio,
      dominio: val.dominio,
      descripcion: val.descripcion
    });

    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      this.modalCrearAbierto.set(false);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  abrirDetalle(cft: CFT): void {
    this.cftSeleccionado.set(cft);
    this.drawerDetalleAbierto.set(true);
  }

  cerrarDetalle(): void {
    this.drawerDetalleAbierto.set(false);
  }

  abrirEditar(cft: CFT): void {
    this.cftSeleccionado.set(cft);
    this.formEditar.reset({
      codigo: cft.codigo, // Inmutable
      tipo: cft.tipo,
      nombre: cft.nombre,
      tipoDato: cft.tipoDato,
      longDato: cft.longDato,
      longDec: cft.longDec,
      acceso: cft.acceso,
      visible: cft.visible,
      obligatorio: cft.obligatorio,
      dominio: cft.dominio,
      descripcion: cft.descripcion,
      motivo: ''
    });
    this.modalEditarAbierto.set(true);
  }

  cerrarEditar(): void {
    this.modalEditarAbierto.set(false);
  }

  guardarEdicionCft(): void {
    const cft = this.cftSeleccionado();
    if (!cft) return;

    if (this.formEditar.invalid) {
      this.formEditar.markAllAsTouched();
      return;
    }

    const val = this.formEditar.getRawValue();
    const res = this.tramitesService.actualizarCft(
      cft.codigo,
      {
        tipo: val.tipo,
        nombre: val.nombre,
        tipoDato: val.tipoDato,
        longDato: val.longDato,
        longDec: val.longDec,
        acceso: val.acceso,
        visible: val.visible,
        obligatorio: val.obligatorio,
        dominio: val.dominio,
        descripcion: val.descripcion
      },
      val.motivo
    );

    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      this.modalEditarAbierto.set(false);
      const actualizado = this.cfts().find(c => c.codigo === cft.codigo);
      if (actualizado) this.cftSeleccionado.set(actualizado);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  abrirInactivar(cft: CFT): void {
    this.cftSeleccionado.set(cft);
    const conteo = this.tramitesService.conteoUsoCft(cft.codigo);
    this.formInactivar.reset({
      motivo: conteo > 0
        ? `Inactivación lógica requerida: El campo está asignado a ${conteo} trámite(s) institucionales.`
        : 'Inactivación preventiva del campo en catálogo.'
    });
    this.modalInactivarAbierto.set(true);
  }

  cerrarInactivar(): void {
    this.modalInactivarAbierto.set(false);
  }

  confirmarInactivacion(): void {
    const cft = this.cftSeleccionado();
    if (!cft) return;

    const motivo = this.formInactivar.getRawValue().motivo;
    const res = this.tramitesService.inactivarCft(cft.codigo, motivo);

    if (res.exito) {
      this.mostrarToast('aviso', res.mensaje);
      this.modalInactivarAbierto.set(false);
      const actualizado = this.cfts().find(c => c.codigo === cft.codigo);
      if (actualizado) this.cftSeleccionado.set(actualizado);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  reactivarCft(cft: CFT): void {
    const res = this.tramitesService.reactivarCft(cft.codigo);
    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      const actualizado = this.cfts().find(c => c.codigo === cft.codigo);
      if (actualizado) this.cftSeleccionado.set(actualizado);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  abrirEliminarFisico(cft: CFT): void {
    this.cftSeleccionado.set(cft);
    this.modalEliminarFisicoAbierto.set(true);
  }

  cerrarEliminarFisico(): void {
    this.modalEliminarFisicoAbierto.set(false);
  }

  confirmarEliminacionFisica(): void {
    const cft = this.cftSeleccionado();
    if (!cft) return;

    const res = this.tramitesService.eliminarCftFisico(cft.codigo);
    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      this.modalEliminarFisicoAbierto.set(false);
      this.drawerDetalleAbierto.set(false);
      this.cftSeleccionado.set(null);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  conteoUso(codigo: string): number {
    return this.tramitesService.conteoUsoCft(codigo);
  }

  mostrarToast(tipo: 'exito' | 'error' | 'aviso', texto: string): void {
    this.mensajeToast.set({ tipo, texto });
    setTimeout(() => {
      this.mensajeToast.set(null);
    }, 5000);
  }

  trackByCft(index: number, cft: CFT): string {
    return cft.codigo;
  }
}
