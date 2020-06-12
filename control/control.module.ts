import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CONTROL_ROUTES } from './control.routes';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { AccountsComponent } from './accounts/accounts.component';
import { ApiToolsModule } from '../api-tools.module';
import { RolesComponent } from './roles/roles.component';



@NgModule({
  declarations: [
    ControlPanelComponent,
    AccountsComponent,
    RolesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(CONTROL_ROUTES)
  ],
  exports: [
    ControlPanelComponent
  ]
})
export class ControlModule { }
