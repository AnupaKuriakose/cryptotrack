import { Component, signal, effect, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <div class="toolbar-left">
        <span class="logo">📈 CryptoTrack</span>
      </div>
      <div class="toolbar-right">
        <button
          mat-icon-button
          (click)="toggleTheme()"
          [matTooltip]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
      </div>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
      
        <mat-nav-list>
          
            <mat-list-item
            routerLink="/market"
            routerLinkActive="active-link"
          > 
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Market</span></mat-list-item>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .toolbar {
      position: fixed;
      top: 0;
      z-index: 100;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .toolbar-left { display: flex; align-items: center; gap: 10px; }
    .toolbar-right { display: flex; align-items: center; gap: 4px; }
    .logo { font-size: 18px; font-weight: 600; letter-spacing: 0.3px; }
    .sidenav-container { position: fixed; top: 64px; bottom: 0; left: 0; right: 0; }
    .sidenav { width: 210px; border-right: 1px solid rgba(0,0,0,0.08); }
    .sidenav-header {
      padding: 20px 16px 8px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.5;
    }
    .content { padding: 24px; overflow-y: auto; }
    .active-link {
      background: rgba(63,81,181,0.1) !important;
      color: #3F51B5 !important;
      border-right: 3px solid #3F51B5;
      font-weight: 500;
    }
  `],
})
export class AppComponent {
  private document = inject(DOCUMENT);
  isDark = signal(false);

  toggleTheme() {
    this.isDark.update(v => !v);
    if (this.isDark()) {
      this.document.body.classList.add('dark-theme');
    } else {
      this.document.body.classList.remove('dark-theme');
    }
  }
}