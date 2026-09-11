import { Component } from '@angular/core';
import { JiraboardComponent } from './jira-board/jira-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JiraboardComponent],
  template: `
    <app-jira-board></app-jira-board>
  `
})
export class AppComponent {}