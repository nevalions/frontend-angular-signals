import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-connection-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="connection-indicator" [class]="quality()">
      <span class="dot"></span>
      @if (showLabel()) {
        <span class="label">{{ qualityLabel() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .connection-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .good .dot {
        background: #22c55e;
      }
      .fair .dot {
        background: #eab308;
      }
      .poor .dot {
        background: #ef4444;
      }
      .unknown .dot {
        background: #6b7280;
      }
      .label {
        font-size: 0.875rem;
        color: inherit;
      }
    `,
  ],
})
export class ConnectionIndicatorComponent {
  private wsService = inject(WebSocketService);

  showLabel = input(false);

  quality = computed(() => this.wsService.connectionQuality());

  qualityLabel = computed(() => {
    switch (this.quality()) {
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      default:
        return 'Connecting...';
    }
  });
}
