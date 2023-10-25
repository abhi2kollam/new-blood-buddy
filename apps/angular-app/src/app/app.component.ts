import { ApplicationRef, Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, first, interval } from 'rxjs';
import { DialogService } from './shared/services/dialog-service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-loader></app-loader>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    private updates: SwUpdate,
    appRef: ApplicationRef,
    private dialogService: DialogService
  ) {
    updates.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(
            `New app version ready for use: ${evt.latestVersion.hash}`
          );
          this.dialogService
            .openConfirmation('New app version is available. restart ?')
            .then((confirmed: boolean) => {
              if (confirmed) {
                document.location.reload();
              }
            });
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(
            `Failed to install app version '${evt.version.hash}': ${evt.error}`
          );
          break;
      }
    });
    this.checkForUpdatesPeriodically(updates, appRef);
  }
  ngOnInit(): void {
    let beforeInstallPrompt: any = null;
    const eventHandler = (event: any) => {
      beforeInstallPrompt = event;
    };
    window.addEventListener('beforeinstallprompt', eventHandler);

    document.addEventListener('Check-For-Update', () => {
      if (this.updates.isEnabled) {
        this.updates.checkForUpdate();
      }
    });
    document.addEventListener('Install-App', () => {
      if (beforeInstallPrompt) {
        beforeInstallPrompt.prompt();
      }
    });
  }

  private checkForUpdatesPeriodically(
    updates: SwUpdate,
    appRef: ApplicationRef
  ) {
    if (!this.updates.isEnabled) {
      return;
    }
    // Allow the app to stabilize first, before starting
    // polling for updates with `interval()`.
    const appIsStable$ = appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await updates.checkForUpdate();
        console.log(
          updateFound
            ? 'A new version is available.'
            : 'Already on the latest version.'
        );
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }
}
