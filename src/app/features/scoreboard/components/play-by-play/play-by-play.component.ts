import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../../../core/services/websocket.service';

@Component({
  selector: 'app-play-by-play',
  standalone: true,
  imports: [CommonModule],
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
      'touchdown': '#4ade80',
      'fieldgoal': '#60a5fa',
      'penalty': '#fbbf24',
      'turnover': '#f87171',
      'safety': '#a78bfa',
      'kickoff': '#9ca3af',
      'punt': '#9ca3af',
      'extra_point': '#60a5fa',
      'two_point_conversion': '#60a5fa',
    };
    return colors[eventType] || '#9ca3af';
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
