import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Sponsor, SponsorLine } from '../../../../shared/types';
import { SponsorLineComponent } from './sponsor-line.component';

@Component({
  selector: 'app-match-sponsor-line-display-flat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SponsorLineComponent],
  templateUrl: './match-sponsor-line-display-flat.component.html',
  styleUrl: './match-sponsor-line-display-flat.component.less',
})
export class MatchSponsorLineDisplayFlatComponent {
  line = input<SponsorLine | null>(null);
  sponsor = input<Sponsor | null>(null);
  scale = input<number | null>(null);

  protected readonly matchLabel = computed(() => this.line()?.title ?? 'Match Sponsor');
}
