import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger,
  keyframes,
  AnimationTriggerMetadata,
} from '@angular/animations';

/**
 * Score Change Animation
 * Scale up briefly on score change with highlight color flash
 * Usage: [@scoreChange]="scoreValue"
 */
export const scoreChangeAnimation: AnimationTriggerMetadata = trigger('scoreChange', [
  transition('* => *', [
    animate(
      '300ms ease-out',
      keyframes([
        style({ transform: 'scale(1)', backgroundColor: '*', offset: 0 }),
        style({ transform: 'scale(1.2)', backgroundColor: 'rgba(255, 215, 0, 0.4)', offset: 0.3 }),
        style({ transform: 'scale(1.1)', backgroundColor: 'rgba(255, 215, 0, 0.2)', offset: 0.6 }),
        style({ transform: 'scale(1)', backgroundColor: '*', offset: 1 }),
      ])
    ),
  ]),
]);

/**
 * Fade In/Out Animation
 * Smooth fade for visibility toggles
 * Usage: [@fadeInOut]="isVisible"
 */
export const fadeInOutAnimation: AnimationTriggerMetadata = trigger('fadeInOut', [
  state('void', style({ opacity: 0 })),
  state('true', style({ opacity: 1 })),
  state('false', style({ opacity: 0 })),
  transition('void => *', [animate('200ms ease-in')]),
  transition('* => void', [animate('200ms ease-out')]),
  transition('true <=> false', [animate('200ms ease-in-out')]),
]);

/**
 * Breathing Animation
 * Pulsating effect for indicators (goal/touchdown)
 * Usage: [@breathing]="isActive"
 * Note: Animation loops continuously when state is 'active'
 */
export const breathingAnimation: AnimationTriggerMetadata = trigger('breathing', [
  state('inactive', style({ opacity: 1, transform: 'scale(1)' })),
  state(
    'active',
    style({ opacity: 1, transform: 'scale(1)' })
  ),
  transition('inactive => active', [
    animate(
      '1000ms ease-in-out',
      keyframes([
        style({ opacity: 1, transform: 'scale(1)', offset: 0 }),
        style({ opacity: 0.6, transform: 'scale(1.05)', offset: 0.5 }),
        style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
      ])
    ),
  ]),
  transition('active => inactive', [animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
]);

/**
 * Dissolve Animation
 * Smooth fade for lower third displays with cross-fade support
 * Usage: [@dissolve]="displayState" where displayState can be 'visible', 'hidden', or content identifier
 */
export const dissolveAnimation: AnimationTriggerMetadata = trigger('dissolve', [
  state('void', style({ opacity: 0 })),
  state('hidden', style({ opacity: 0 })),
  state('visible', style({ opacity: 1 })),
  transition('void => visible', [animate('400ms ease-in')]),
  transition('visible => void', [animate('400ms ease-out')]),
  transition('visible => hidden', [animate('400ms ease-out')]),
  transition('hidden => visible', [animate('400ms ease-in')]),
  transition('* => visible', [style({ opacity: 0 }), animate('400ms ease-in')]),
  transition('visible => *', [animate('400ms ease-out', style({ opacity: 0 }))]),
]);

/**
 * Slide In Left Animation
 * Slide from left for home team roster
 * Usage: [@slideInLeft]="isVisible"
 */
export const slideInLeftAnimation: AnimationTriggerMetadata = trigger('slideInLeft', [
  state('void', style({ transform: 'translateX(-100%)', opacity: 0 })),
  state('false', style({ transform: 'translateX(-100%)', opacity: 0 })),
  state('true', style({ transform: 'translateX(0)', opacity: 1 })),
  transition('void => true, false => true', [animate('300ms ease-out')]),
  transition('true => void, true => false', [animate('300ms ease-in')]),
]);

/**
 * Slide In Right Animation
 * Slide from right for away team roster
 * Usage: [@slideInRight]="isVisible"
 */
export const slideInRightAnimation: AnimationTriggerMetadata = trigger('slideInRight', [
  state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
  state('false', style({ transform: 'translateX(100%)', opacity: 0 })),
  state('true', style({ transform: 'translateX(0)', opacity: 1 })),
  transition('void => true, false => true', [animate('300ms ease-out')]),
  transition('true => void, true => false', [animate('300ms ease-in')]),
]);

/**
 * Staggered List Animation
 * Staggered animation for roster player cards
 * Usage: [@staggeredList]="items.length" on parent, [@listItem] on each child
 */
export const staggeredListAnimation: AnimationTriggerMetadata = trigger('staggeredList', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger('50ms', [animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [stagger('30ms', [animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))])],
      { optional: true }
    ),
  ]),
]);

/**
 * List Item Animation (companion to staggeredList)
 * Individual item animation state
 */
export const listItemAnimation: AnimationTriggerMetadata = trigger('listItem', [
  state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
  state('*', style({ opacity: 1, transform: 'translateY(0)' })),
  transition('void => *', [animate('200ms ease-out')]),
  transition('* => void', [animate('150ms ease-in')]),
]);

/**
 * Clock Warning Animation
 * Color change and flash when clock is under threshold
 * Usage: [@clockWarning]="isWarning"
 */
export const clockWarningAnimation: AnimationTriggerMetadata = trigger('clockWarning', [
  state('normal', style({ color: '*' })),
  state(
    'warning',
    style({ color: '#ff4444' })
  ),
  transition('normal => warning', [
    animate(
      '500ms ease-in-out',
      keyframes([
        style({ color: '*', offset: 0 }),
        style({ color: '#ff4444', offset: 0.25 }),
        style({ color: '#ff6666', offset: 0.5 }),
        style({ color: '#ff4444', offset: 0.75 }),
        style({ color: '#ff4444', offset: 1 }),
      ])
    ),
  ]),
  transition('warning => normal', [animate('200ms ease-out')]),
]);

/**
 * Clock Flash Animation
 * Optional flash effect for critical time warnings
 * Usage: [@clockFlash]="flashState" where flashState toggles rapidly
 */
export const clockFlashAnimation: AnimationTriggerMetadata = trigger('clockFlash', [
  state('on', style({ opacity: 1 })),
  state('off', style({ opacity: 0.3 })),
  transition('on <=> off', [animate('150ms ease-in-out')]),
]);

/**
 * Slide Up Animation
 * Generic slide up animation for lower thirds
 * Usage: [@slideUp]="isVisible"
 */
export const slideUpAnimation: AnimationTriggerMetadata = trigger('slideUp', [
  state('void', style({ transform: 'translateY(100%)', opacity: 0 })),
  state('false', style({ transform: 'translateY(100%)', opacity: 0 })),
  state('true', style({ transform: 'translateY(0)', opacity: 1 })),
  transition('void => true, false => true', [animate('350ms ease-out')]),
  transition('true => void, true => false', [animate('300ms ease-in')]),
]);

/**
 * Slide Down Animation
 * Generic slide down animation for top overlays
 * Usage: [@slideDown]="isVisible"
 */
export const slideDownAnimation: AnimationTriggerMetadata = trigger('slideDown', [
  state('void', style({ transform: 'translateY(-100%)', opacity: 0 })),
  state('false', style({ transform: 'translateY(-100%)', opacity: 0 })),
  state('true', style({ transform: 'translateY(0)', opacity: 1 })),
  transition('void => true, false => true', [animate('350ms ease-out')]),
  transition('true => void, true => false', [animate('300ms ease-in')]),
]);

// Export all animations as a collection for easy import
export const SCOREBOARD_ANIMATIONS = [
  scoreChangeAnimation,
  fadeInOutAnimation,
  breathingAnimation,
  dissolveAnimation,
  slideInLeftAnimation,
  slideInRightAnimation,
  staggeredListAnimation,
  listItemAnimation,
  clockWarningAnimation,
  clockFlashAnimation,
  slideUpAnimation,
  slideDownAnimation,
];
