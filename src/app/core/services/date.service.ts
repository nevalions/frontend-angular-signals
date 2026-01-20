import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type TimeFormat = '12h' | '24h';

export interface DateOptions {
  showDate?: boolean;
  showTime?: boolean;
  showSeconds?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private timeFormat: TimeFormat = (environment.timeFormat as TimeFormat) || '24h';

  getTimeFormat(): TimeFormat {
    return this.timeFormat;
  }

  setTimeFormat(format: TimeFormat): void {
    this.timeFormat = format;
  }

  formatDate(date: string | Date | null | undefined, options: DateOptions = {}): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const dateParts: string[] = [];
    const timeParts: string[] = [];

    if (options.showDate !== false) {
      dateParts.push(
        d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    }

    if (options.showTime !== false) {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const seconds = d.getSeconds();

      if (this.timeFormat === '24h') {
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        if (options.showSeconds) {
          const formattedSeconds = seconds.toString().padStart(2, '0');
          timeParts.push(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
        } else {
          timeParts.push(`${formattedHours}:${formattedMinutes}`);
        }
      } else {
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        if (options.showSeconds) {
          const formattedSeconds = seconds.toString().padStart(2, '0');
          timeParts.push(`${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`);
        } else {
          timeParts.push(`${formattedHours}:${formattedMinutes} ${period}`);
        }
      }
    }

    if (dateParts.length === 0) return timeParts.join(' ');
    if (timeParts.length === 0) return dateParts.join(' ');

    return `${dateParts.join(' ')} ${timeParts.join(' ')}`;
  }

  formatDateTime(date: string | Date | null | undefined): string {
    return this.formatDate(date, { showDate: true, showTime: true });
  }

  formatTime(date: string | Date | null | undefined): string {
    return this.formatDate(date, { showDate: false, showTime: true });
  }

  formatDateOnly(date: string | Date | null | undefined): string {
    return this.formatDate(date, { showDate: true, showTime: false });
  }

  formatForInput(date: string | Date | null | undefined): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
