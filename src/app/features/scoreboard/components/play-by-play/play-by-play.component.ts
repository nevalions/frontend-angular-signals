import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton } from '@taiga-ui/core';
import { WebSocketService } from '../../../../core/services/websocket.service';

@Component({
  selector: 'app-play-by-play',
  standalone: true,
  imports: [CommonModule, TuiButton],
  templateUrl: './play-by-play.component.html',
  styleUrl: './play-by-play.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayByPlayComponent {
  private readonly wsService = inject(WebSocketService);

  events = this.wsService.events;
  autoScroll = signal(true);

  constructor() {
    effect(() => {
      const eventCount = this.events().length;
      if (this.autoScroll() && eventCount > 0) {
        this.scrollToLatest();
      }
    });
  }

  getEventIcon(eventType: string): string {
    const icons: Record<string, string> = {
      'touchdown': '🏈',
      'fieldgoal': '🎯',
      'penalty': '🚩',
      'turnover': '🔄',
      'safety': '🛡️',
      'kickoff': '🏈',
      'punt': '🏈',
      'extra_point': '🎯',
      'two_point_conversion': '🎯',
    };
    return icons[eventType] || '📋';
  }

  getEventColor(eventType: string): string {
    const colors: Record<string, string> = {
      'touchdown': 'var(--tui-status-positive)',
      'fieldgoal': 'var(--tui-background-accent-1)',
      'penalty': 'var(--tui-status-warning)',
      'turnover': 'var(--tui-status-negative)',
      'safety': 'var(--tui-background-accent-1)',
      'kickoff': 'var(--tui-text-tertiary)',
      'punt': 'var(--tui-text-tertiary)',
      'extra_point': 'var(--tui-background-accent-1)',
      'two_point_conversion': 'var(--tui-background-accent-1)',
    };
    return colors[eventType] || 'var(--tui-text-tertiary)';
  }

  private scrollToLatest(): void {
    setTimeout(() => {
      const container = document.querySelector('.play-by-play-list');
      container?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  toggleAutoScroll(): void {
    this.autoScroll.set(!this.autoScroll());
  }
}
