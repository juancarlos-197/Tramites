import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FctCrudComponent } from './components/fct-crud/fct-crud';
import { CftCrudComponent } from './components/cft-crud/cft-crud';
import { BuscadorCetComponent } from './components/buscador-cet/buscador-cet';
import { SimuladorTramiteComponent } from './components/simulador-tramite/simulador-tramite';
import { TramitesService } from './services/tramites.service';

type VistaActiva = 'fct' | 'buscador-cet' | 'cft' | 'simulador';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatIconModule,
    FctCrudComponent,
    CftCrudComponent,
    BuscadorCetComponent,
    SimuladorTramiteComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly tramitesService = inject(TramitesService);

  readonly vistaActiva = signal<VistaActiva>('fct');

  readonly fctSeleccionado = this.tramitesService.fctSeleccionado;
  readonly fcts = this.tramitesService.fcts;
  readonly cfts = this.tramitesService.cfts;

  setVista(vista: VistaActiva): void {
    this.vistaActiva.set(vista);
  }

  reiniciarDatos(): void {
    if (confirm('¿Desea restaurar los datos iniciales de prueba para FCT y CFT?')) {
      this.tramitesService.reiniciarDatosPredeterminados();
    }
  }
}
