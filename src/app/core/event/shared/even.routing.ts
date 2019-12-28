import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlyAdminUsersGuard } from '../../../admin/admin-user-guard';
// import { CustomersComponent } from '../customers.component';
// import { CustomerTypeModel } from './customer.model';
import { AuthGuard } from '../../../auth/auth-guard.service';
import { EventTypeComponent } from '../event-type/event-type.component';
import { EventOrganizerComponent } from '../event-organizer/event-organizer.component';
import { MarketingMaterialComponent } from '../marketing-material/marketing-material.component';
import { EventMainComponent } from '../event-main/event-main.component';
import { EventLeadComponent } from '../event-lead/event-lead.component';
import { EventCalenderComponent } from '../event-calender/event-calender.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
// import { DistirbutorComponent } from '../distirbutor/distirbutor.component';
// import { SectorComponent } from '../sector/sector.component';
const routes: Routes = [
  {
    path: 'eventtype', children: [{ path: '', component: EventTypeComponent }],
    canActivate: [AuthGuard]
  },
  {
    path: 'eventorganizer', children: [{ path: '', component: EventOrganizerComponent }],
    canActivate: [AuthGuard]
  },
  {
    path: 'marketingmaterial', children: [{ path: '', component: MarketingMaterialComponent }],
    canActivate: [AuthGuard]
  },
  {
    path: 'eventmain', children: [{ path: '', component: EventMainComponent }],
    canActivate: [AuthGuard]
  },
  {
    path: 'lead', children: [{ path: '', component: EventLeadComponent }],
    canActivate: [AuthGuard]
  },
  {
    path: 'eventcalender', children: [{ path: '', component: EventCalenderComponent }],
    canActivate: [AuthGuard]
  },
  {
    path: 'eventdashboard', children: [{ path: '', component: DashboardComponent }],
    canActivate: [AuthGuard]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class EventRoutingModule { }
