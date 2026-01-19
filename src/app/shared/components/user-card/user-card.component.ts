import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { UserList } from '../../../features/settings/models/settings.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiCardLarge,
    TuiBadge,
    TuiButton,
    TuiIcon,
  ],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.less',
})
export class UserCardComponent {
  user = input.required<UserList>();
  
  showOnlineStatus = input(true);
  showAccountStatus = input(true);
  showMemberSince = input(true);
  showLastOnline = input(true);
  
  showEditButton = input(false);
  showRemoveButton = input(false);
  
  cardClick = output<number>();
  editClick = output<UserList>();
  removeClick = output<UserList>();

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  onCardClick(): void {
    this.cardClick.emit(this.user().id);
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit(this.user());
  }

  onRemoveClick(event: Event): void {
    event.stopPropagation();
    this.removeClick.emit(this.user());
  }
}
