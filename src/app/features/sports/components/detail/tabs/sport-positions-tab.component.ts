import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';
import { PositionStoreService } from '../../../services/position-store.service';
import { withDeleteConfirm } from '../../../../../core/utils/alert-helper.util';
import { Position, PositionCreate, PositionUpdate } from '../../../models/position.model';

@Component({
  selector: 'app-sport-positions-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiTextfield,
    TuiPagination
  ],
  templateUrl: './sport-positions-tab.component.html',
  styleUrl: './sport-positions-tab.component.less',
})
export class SportPositionsTabComponent {
  private positionStore = inject(PositionStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  sportId = input.required<number>();

  positions = signal<Position[]>([]);
  positionsLoading = signal(false);
  positionsError = signal<string | null>(null);
  positionSearchQuery = signal('');
  positionsCurrentPage = signal(1);
  positionsItemsPerPage = signal(10);
  positionsTotalPages = signal(0);
  positionFormOpen = signal(false);
  editingPosition = signal<Position | null>(null);
  positionTitle = signal('');

  readonly itemsPerPageOptions = [10, 20, 50];

  private loadPositionsOnSportChange = effect(() => {
    const sportId = this.sportId();
    if (sportId) {
      this.loadPositions();
    }
  });

  loadPositions(): void {
    const sportId = this.sportId();
    if (!sportId) return;

    this.positionsLoading.set(true);
    this.positionsError.set(null);

    this.positionStore.getPositionsBySportId(sportId).subscribe({
      next: (positions) => {
        this.positions.set(positions);
        this.positionsLoading.set(false);
      },
      error: () => {
        this.positionsError.set('Failed to load positions');
        this.positionsLoading.set(false);
      }
    });
  }

  filteredPositions = computed(() => {
    const query = this.positionSearchQuery().toLowerCase();
    if (!query) return this.positions();
    return this.positions().filter(p =>
      p.title.toLowerCase().includes(query)
    );
  });

  paginatedPositions = computed(() => {
    const start = (this.positionsCurrentPage() - 1) * this.positionsItemsPerPage();
    const end = start + this.positionsItemsPerPage();
    return this.filteredPositions().slice(start, end);
  });

  positionsTotalPagesComputed = computed(() =>
    Math.ceil(this.filteredPositions().length / this.positionsItemsPerPage())
  );

  onPositionSearchChange(query: string): void {
    this.positionSearchQuery.set(query);
    this.positionsCurrentPage.set(1);
  }

  clearPositionSearch(): void {
    this.positionSearchQuery.set('');
    this.positionsCurrentPage.set(1);
  }

  onPositionsPageChange(pageIndex: number): void {
    this.positionsCurrentPage.set(pageIndex + 1);
  }

  onPositionsItemsPerPageChange(itemsPerPage: number): void {
    this.positionsItemsPerPage.set(itemsPerPage);
    this.positionsCurrentPage.set(1);
  }

  openPositionForm(position: Position | null = null): void {
    this.editingPosition.set(position);
    this.positionTitle.set(position?.title || '');
    this.positionFormOpen.set(true);
  }

  closePositionForm(): void {
    this.positionFormOpen.set(false);
    this.editingPosition.set(null);
    this.positionTitle.set('');
  }

  savePosition(): void {
    const sportId = this.sportId();
    if (!sportId) return;

    const title = this.positionTitle().trim();

    if (!title) return;

    const editing = this.editingPosition();

    if (editing) {
      const updateData: PositionUpdate = {
        title,
        sport_id: sportId,
      };
      this.positionStore.updatePosition(editing.id, updateData).subscribe({
        next: () => {
          this.loadPositions();
          this.closePositionForm();
          this.alerts.open('Position updated successfully', { label: 'Success', appearance: 'positive', autoClose: 3000 });
        },
        error: () => {
          this.alerts.open('Failed to update position', { label: 'Error', appearance: 'negative' });
        }
      });
    } else {
      const createData: PositionCreate = {
        title,
        sport_id: sportId,
      };
      this.positionStore.createPosition(createData).subscribe({
        next: () => {
          this.loadPositions();
          this.closePositionForm();
          this.alerts.open('Position created successfully', { label: 'Success', appearance: 'positive', autoClose: 3000 });
        },
        error: () => {
          this.alerts.open('Failed to create position', { label: 'Error', appearance: 'negative' });
        }
      });
    }
  }

  deletePosition(position: Position): void {
    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete position "${position.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.positionStore.deletePosition(position.id),
      () => this.loadPositions(),
      'Position'
    );
  }
}
