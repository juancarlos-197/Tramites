import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../../services/tramites.service';
import { FCT } from '../../models/tramite.models';

@Component({
  selector: 'app-fct-crud',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fct-crud.html'
})
export class FctCrudComponent {
  private readonly tramitesService = inject(TramitesService);

  readonly fcts = this.tramitesService.fcts;

  // Filtros de búsqueda (Read)
  readonly filtroTexto = signal<string>('');
  readonly filtroEstado = signal<'Todos' | 'Activo' | 'Inactivo'>('Todos');
  readonly filtroEmpresa = signal<string>('Todas');

  // Estado de modales y drawers
  readonly modalCrearAbierto = signal<boolean>(false);
  readonly modalEditarAbierto = signal<boolean>(false);
  readonly drawerDetalleAbierto = signal<boolean>(false);
  readonly modalInactivarAbierto = signal<boolean>(false);
  readonly modalEliminarFisicoAbierto = signal<boolean>(false);

  // FCT enfocado para ver/editar/eliminar
  readonly fctSeleccionado = signal<FCT | null>(null);

  // Mensaje de notificación / toast
  readonly mensajeToast = signal<{ tipo: 'exito' | 'error' | 'aviso'; texto: string } | null>(null);

  // Formulario Crear FCT
  readonly formCrear = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] }),
    cdgEm: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    codigoSugerido: new FormControl('', { nonNullable: true }),
    categoria: new FormControl('Comercio e Industria', { nonNullable: true, validators: [Validators.required] }),
    plazoDias: new FormControl(15, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(365)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] })
  });

  // Formulario Editar FCT (Restricción: id inmutable)
  readonly formEditar = new FormGroup({
    id: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] }),
    cdgEm: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    categoria: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    plazoDias: new FormControl(15, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(365)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    motivoCambio: new FormControl('', { nonNullable: true })
  });

  // Formulario Inactivación (Eliminación Lógica)
  readonly formInactivar = new FormGroup({
    motivo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] })
  });

  // Lista de empresas únicas detectadas para filtro
  readonly empresasDisponibles = computed(() => {
    const set = new Set<string>();
    for (const f of this.fcts()) {
      if (f.cdgEm) set.add(f.cdgEm);
    }
    return Array.from(set).sort();
  });

  // Lista de FCT filtrada
  readonly fctsFiltrados = computed(() => {
    const texto = this.filtroTexto().trim().toLowerCase();
    const estado = this.filtroEstado();
    const empresa = this.filtroEmpresa();

    return this.fcts().filter(f => {
      // Filtro texto (nombre o código FCT)
      if (texto) {
        const coincideNombre = f.nombre.toLowerCase().includes(texto);
        const coincideCodigo = f.id.toLowerCase().includes(texto);
        const coincideDesc = f.descripcion.toLowerCase().includes(texto);
        if (!coincideNombre && !coincideCodigo && !coincideDesc) {
          return false;
        }
      }

      // Filtro estado
      if (estado !== 'Todos' && f.estado !== estado) {
        return false;
      }

      // Filtro empresa
      if (empresa !== 'Todas' && f.cdgEm !== empresa) {
        return false;
      }

      return true;
    });
  });

  // Métricas de estado
  readonly totalFct = computed(() => this.fcts().length);
  readonly activosFct = computed(() => this.fcts().filter(f => f.estado === 'Activo').length);
  readonly inactivosFct = computed(() => this.fcts().filter(f => f.estado === 'Inactivo').length);
  readonly totalSolicitudes = computed(() => this.fcts().reduce((acc, f) => acc + (f.solicitudesAsociadas || 0), 0));

  // ============================
  // MÉTODOS CRUD
  // ============================

  abrirCrear(): void {
    const year = new Date().getFullYear();
    const nextSeq = String(this.fcts().length + 1).padStart(3, '0');
    this.formCrear.reset({
      nombre: '',
      cdgEm: 'EMP-MUNIC-04',
      codigoSugerido: `FCT-${year}-${nextSeq}`,
      categoria: 'Comercio e Industria',
      plazoDias: 15,
      descripcion: ''
    });
    this.modalCrearAbierto.set(true);
  }

  cerrarCrear(): void {
    this.modalCrearAbierto.set(false);
  }

  guardarNuevoFct(): void {
    if (this.formCrear.invalid) {
      this.formCrear.markAllAsTouched();
      return;
    }

    const val = this.formCrear.getRawValue();
    const res = this.tramitesService.crearFct({
      nombre: val.nombre,
      cdgEm: val.cdgEm,
      descripcion: val.descripcion,
      categoria: val.categoria,
      plazoDias: val.plazoDias,
      codigoSugerido: val.codigoSugerido
    });

    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      this.modalCrearAbierto.set(false);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  abrirDetalle(fct: FCT): void {
    this.fctSeleccionado.set(fct);
    this.drawerDetalleAbierto.set(true);
  }

  cerrarDetalle(): void {
    this.drawerDetalleAbierto.set(false);
  }

  abrirEditar(fct: FCT): void {
    this.fctSeleccionado.set(fct);
    this.formEditar.reset({
      id: fct.id, // Inmutable
      nombre: fct.nombre,
      cdgEm: fct.cdgEm,
      categoria: fct.categoria,
      plazoDias: fct.plazoDias,
      descripcion: fct.descripcion,
      motivoCambio: ''
    });
    this.modalEditarAbierto.set(true);
  }

  cerrarEditar(): void {
    this.modalEditarAbierto.set(false);
  }

  guardarEdicionFct(): void {
    const fct = this.fctSeleccionado();
    if (!fct) return;

    if (this.formEditar.invalid) {
      this.formEditar.markAllAsTouched();
      return;
    }

    const val = this.formEditar.getRawValue();
    const res = this.tramitesService.actualizarFct(
      fct.id,
      {
        nombre: val.nombre,
        cdgEm: val.cdgEm,
        descripcion: val.descripcion,
        categoria: val.categoria,
        plazoDias: val.plazoDias
      },
      val.motivoCambio
    );

    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      this.modalEditarAbierto.set(false);
      // Actualizar detalle si está abierto
      const actualizado = this.fcts().find(f => f.id === fct.id);
      if (actualizado) this.fctSeleccionado.set(actualizado);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  abrirInactivar(fct: FCT): void {
    this.fctSeleccionado.set(fct);
    this.formInactivar.reset({
      motivo: fct.solicitudesAsociadas > 0
        ? `Inactivación preventiva: Se conservan ${fct.solicitudesAsociadas} solicitudes ciudadanas en histórico institucional.`
        : 'Baja operativa del trámite administrativo.'
    });
    this.modalInactivarAbierto.set(true);
  }

  cerrarInactivar(): void {
    this.modalInactivarAbierto.set(false);
  }

  confirmarInactivacion(): void {
    const fct = this.fctSeleccionado();
    if (!fct) return;

    const motivo = this.formInactivar.getRawValue().motivo;
    const res = this.tramitesService.inactivarFct(fct.id, motivo);

    if (res.exito) {
      this.mostrarToast('aviso', res.mensaje);
      this.modalInactivarAbierto.set(false);
      const actualizado = this.fcts().find(f => f.id === fct.id);
      if (actualizado) this.fctSeleccionado.set(actualizado);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  reactivarFct(fct: FCT): void {
    const res = this.tramitesService.reactivarFct(fct.id);
    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      const actualizado = this.fcts().find(f => f.id === fct.id);
      if (actualizado) this.fctSeleccionado.set(actualizado);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  abrirEliminarFisico(fct: FCT): void {
    this.fctSeleccionado.set(fct);
    this.modalEliminarFisicoAbierto.set(true);
  }

  cerrarEliminarFisico(): void {
    this.modalEliminarFisicoAbierto.set(false);
  }

  confirmarEliminacionFisica(): void {
    const fct = this.fctSeleccionado();
    if (!fct) return;

    const res = this.tramitesService.eliminarFctFisico(fct.id);
    if (res.exito) {
      this.mostrarToast('exito', res.mensaje);
      this.modalEliminarFisicoAbierto.set(false);
      this.drawerDetalleAbierto.set(false);
      this.fctSeleccionado.set(null);
    } else {
      this.mostrarToast('error', res.mensaje);
    }
  }

  seleccionarParaDiseno(fct: FCT): void {
    this.tramitesService.seleccionarFct(fct.id);
    // Disparar evento hacia el componente contenedor mediante servicio
    this.mostrarToast('exito', `Trámite "${fct.id}" seleccionado como espacio de trabajo activo.`);
  }

  mostrarToast(tipo: 'exito' | 'error' | 'aviso', texto: string): void {
    this.mensajeToast.set({ tipo, texto });
    setTimeout(() => {
      this.mensajeToast.set(null);
    }, 5000);
  }

  trackByFctId(index: number, fct: FCT): string {
    return fct.id;
  }
}
