import { Routes } from "@angular/router";
import { AccountsComponent } from './accounts/accounts.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { RolesComponent } from './roles/roles.component';

export const CONTROL_ROUTES: Routes = [
  {
    path: '',
    component: ControlPanelComponent,
    children: [
      { path: 'accounts', component: AccountsComponent },
      { path: 'roles', component: RolesComponent },
    ]
  }
];
