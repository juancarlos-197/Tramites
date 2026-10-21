import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../../services/tramites.service';

@Component({
  selector: 'app-simulador-tramite',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './simulador-tramite.html'
})
export class SimuladorTramiteComponent {
  private readonly tramitesService = inject(TramitesService);

  readonly fcts = this.tramitesService.fcts;
  readonly fctSeleccionado = this.tramitesService.fctSeleccionado;
  readonly camposFctSeleccionado = this.tramitesService.camposFctSeleccionado;

  // Estado del formulario dinámico de prueba
  readonly valoresFormulario = signal<Record<string, unknown>>({});
  readonly erroresValidacion = signal<Record<string, string>>({});
  readonly radicadoGenerado = signal<string | null>(null);
  readonly mensajeToast = signal<{ tipo: 'exito' | 'error' | 'aviso'; texto: string } | null>(null);

  // Campos visibles asignados al trámite
  readonly camposVisibles = computed(() => {
    return this.camposFctSeleccionado().filter(c => c.visible);
  });

  // Agrupados por sección
  readonly seccionesFormulario = computed(() => {
    const campos = this.camposVisibles();
    const mapa = new Map<string, typeof campos>();

    for (const c of campos) {
      const sec = c.seccion || '1. Datos Principales';
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

  cambiarFct(id: string): void {
    this.tramitesService.seleccionarFct(id);
    this.valoresFormulario.set({});
    this.erroresValidacion.set({});
    this.radicadoGenerado.set(null);
  }

  actualizarValor(cftCodigo: string, valor: unknown): void {
    this.valoresFormulario.update(v => ({ ...v, [cftCodigo]: valor }));
    // Limpiar error del campo
    if (this.erroresValidacion()[cftCodigo]) {
      this.erroresValidacion.update(e => {
        const copia = { ...e };
        delete copia[cftCodigo];
        return copia;
      });
    }
  }

  simularRadicacion(): void {
    const campos = this.camposVisibles();
    const valores = this.valoresFormulario();
    const errores: Record<string, string> = {};

    for (const c of campos) {
      const val = valores[c.cftCodigo];
      const snapshot = c.cftSnapshot;

      // Validación de obligatoriedad
      if (c.obligatorio) {
        if (val === undefined || val === null || val === '' || val === false) {
          errores[c.cftCodigo] = `El campo "${snapshot?.nombre || c.cftCodigo}" es obligatorio.`;
          continue;
        }
      }

      // Validación de tipo de dato y longitud
      if (val && snapshot) {
        if (typeof val === 'string' && val.length > snapshot.longDato) {
          errores[c.cftCodigo] = `Excede la longitud máxima permitida (${snapshot.longDato} caracteres).`;
        }
        if (snapshot.tipoDato === 'Email' && typeof val === 'string' && !val.includes('@')) {
          errores[c.cftCodigo] = 'Debe ingresar una dirección de correo electrónico válida.';
        }
      }
    }

    if (Object.keys(errores).length > 0) {
      this.erroresValidacion.set(errores);
      this.mostrarToast('error', 'Por favor complete todos los campos obligatorios antes de radicar.');
      return;
    }

    // Generar radicado y actualizar solicitudes asociadas en el FCT (probando regla de negocio)
    const fct = this.fctSeleccionado();
    if (!fct) return;

    const numRad = `RAD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    this.radicadoGenerado.set(numRad);

    // Incrementar solicitudes asociadas del FCT
    this.tramitesService.fcts.update(lista =>
      lista.map(item => {
        if (item.id === fct.id) {
          return {
            ...item,
            solicitudesAsociadas: item.solicitudesAsociadas + 1,
            fechaModificacion: new Date().toISOString(),
            historial: [
              {
                id: `RAD-${Date.now()}`,
                usuario: 'ciudadano.portal@ventanilla.gob',
                fecha: new Date().toISOString(),
                accion: 'Modificación',
                detalles: `Nueva solicitud ciudadana radicada bajo el número ${numRad}. Total solicitudes asociadas: ${item.solicitudesAsociadas + 1}.`
              },
              ...item.historial
            ]
          };
        }
        return item;
      })
    );

    this.mostrarToast('exito', `¡Solicitud radicada con éxito! Número de expediente oficial: ${numRad}.`);
  }

  reiniciarSimulacion(): void {
    this.valoresFormulario.set({});
    this.erroresValidacion.set({});
    this.radicadoGenerado.set(null);
  }

  mostrarToast(tipo: 'exito' | 'error' | 'aviso', texto: string): void {
    this.mensajeToast.set({ tipo, texto });
    setTimeout(() => {
      this.mensajeToast.set(null);
    }, 5000);
  }
}
