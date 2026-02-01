import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Sponsor } from '../../../../shared/types';
import { buildStaticUrl } from '../../../../core/config/api.constants';

@Component({
  selector: 'app-sponsor-display-flat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  templateUrl: './sponsor-display-flat.component.html',
  styleUrl: './sponsor-display-flat.component.less',
})
export class SponsorDisplayFlatComponent {
  sponsor = input<Sponsor | null>(null);
  title = input<string | null>(null);
  logoUrl = input<string | null>(null);
  scale = input<number | null>(null);

  protected readonly displayTitle = computed(() => '');
  protected readonly logoPath = computed(() => this.logoUrl() ?? this.sponsor()?.logo_url ?? null);
  protected readonly logoScale = computed(() => this.scale() ?? this.sponsor()?.scale_logo ?? 1);
  protected readonly logoSrc = computed(() => {
    const path = this.logoPath();
    return path ? buildStaticUrl(path) : '';
  });
  protected readonly hasContent = computed(() => Boolean(this.logoSrc() || this.displayTitle()));
}
