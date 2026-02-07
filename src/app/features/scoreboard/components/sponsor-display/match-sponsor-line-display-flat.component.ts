import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Sponsor, SponsorLine } from '../../../../shared/types';
import { SponsorDisplayFlatComponent } from './sponsor-display-flat.component';

@Component({
  selector: 'app-match-sponsor-line-display-flat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SponsorDisplayFlatComponent],
  templateUrl: './match-sponsor-line-display-flat.component.html',
  styleUrl: './match-sponsor-line-display-flat.component.less',
})
export class MatchSponsorLineDisplayFlatComponent {
  line = input<SponsorLine | null>(null);
  scale = input<number | null>(null);

  protected readonly lineTitle = computed(() => this.line()?.title ?? '');
  protected readonly isVisible = computed(() => this.line()?.is_visible ?? true);
  protected readonly sponsors = computed<Sponsor[]>(() => {
    const line = this.line();
    if (!line?.sponsors || line.sponsors.length === 0) return [];
    return line.sponsors
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((item) => item.sponsor);
  });
}
