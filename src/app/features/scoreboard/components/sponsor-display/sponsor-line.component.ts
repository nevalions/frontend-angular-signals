import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Sponsor, SponsorLine } from '../../../../shared/types';
import { SponsorDisplayFlatComponent } from './sponsor-display-flat.component';

@Component({
  selector: 'app-sponsor-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SponsorDisplayFlatComponent],
  templateUrl: './sponsor-line.component.html',
  styleUrl: './sponsor-line.component.less',
})
export class SponsorLineComponent {
  line = input<SponsorLine | null>(null);
  sponsor = input<Sponsor | null>(null);
  scale = input<number | null>(null);
  label = input<string | null>(null);

  protected readonly lineTitle = computed(() => this.label() ?? '');
  protected readonly isVisible = computed(() => this.line()?.is_visible ?? true);
  protected readonly hasContent = computed(() => Boolean(this.lineTitle() || this.sponsor()));
}
