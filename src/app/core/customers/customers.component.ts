import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from './shared/customers.service';
import { CustomerModel, CustomerTypeModel, DistirbutorModel, SectorModel, CustomerClass } from './shared/customer.model';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ResponseModel } from '../../shared/shared.model';
import { AuthService } from '../../auth/auth.service';
import { SupportService } from '../Support/Shared/support.service';
import { ProductsService } from '../products/shared/products.service';
import * as moment from 'moment';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { OptionsInput } from '@fullcalendar/core';
import { EventSesrvice } from '../../event.service';
import * as swal from 'sweetalert';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  registerCustomer: CustomerClass;
  jQuery: any;
  allregisterCustomer: any[] = []
  allcustomers: any[] = [];
  currentcustomer: CustomerClass;
  currentcustomerId: string;
  current_customer_index: number;
  customerForm: FormGroup;
  customer_type_form: FormGroup;
  customerStatus: Boolean = false;
  CSV: File = null;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  fileReader: FileReader = new FileReader();
  parsedCSV;
  uploading: Boolean = false;
  editing: Boolean = false;
  submitted = false;
  registerForm: FormGroup;
  subscriptionForm: FormGroup;
  viewArray: any = [];
  orderHistory: any[] = [];
  custometTickets: any[] = []
  ticketInformation: any = []
  orderHistoryNumberInformation: any = [];
  imageURL = "https://binsar.s3.ap-south-1.amazonaws.com/";
  showProfileImage: boolean = false;
  image: string;
  callType: any;
  customerConcernMedia: any;
  Products: any;
  showTicketPructProblem: boolean = false;
  showTicketServiceProblem: boolean = false;
  showTicketSubscriptionProblem: boolean = false;
  showResponses: boolean = false;
  followUpForm: FormGroup
  currentTicketIndex: any;
  allProducts: any[] = []
  selectedEvent: any;
  totalDatesArray: any[] = [];
  allSubscriptions: any[] = [];
  viewPerticularSubscription: any[] = []
  showSubform: boolean = false;
  showSubscriptionButton: boolean = false;
  calendarPlugins = [dayGridPlugin]; // important!
  options: OptionsInput;
  eventsModel: any;
  displayEvent: any;
  events = null;
  allEvents2: any[] = []
  allEvents: any[] = [];
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;


  constructor(protected eventService: EventSesrvice, private productService: ProductsService,
    private customerService: CustomersService, private supportService: SupportService,
    private formBuilder: FormBuilder, private toastr: ToastrService, private authService: AuthService,
    private titleService: Title) {
    this.titleService.setTitle('Customer Management');
    this.currentcustomer = new CustomerClass();
    this.registerCustomer = new CustomerClass();
    this.initForm();
  }

  ngOnInit() {
    this.initDatatable();
    this.getProducts();
    this.subscriptionForm = this.formBuilder.group({
      user: [''],
      product: [''],
      quantity: [''],
      frequencyDates: this.formBuilder.array([]),
      startDate: ['']
    });
    this.followUpForm = this.formBuilder.group({
      followUpComments: [''],
      actionTaken: ['']
    });
    this.registerForm = this.formBuilder.group({
      full_name: ['', Validators.required],
      mobile_number: ['', Validators.required],
      landmark: ['', Validators.required],
      street_address: ['', Validators.required],
      city: ['', Validators.required],
      dob: ['', Validators.required]
    });

    this.get_customers();
    this.options = {
      editable: true,
      header: {
        left: 'prev,next today ',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listMonth'
      },
      defaultView: 'dayGridMonth',
      plugins: [dayGridPlugin],
      events: []
    };
  }

  initDatatable() {
    $('#mainTable').DataTable().clear().destroy();
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu: [
        [10, 15, 25, -1],
        [10, 15, 25, 'All']
      ],
      destroy: true,
      retrive: true,
      // dom: '<"html5buttons"B>lTfgitp',
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
      },
      initComplete: function (settings, json) {
        $('.button').removeClass('dt-button');
      },
      dom: "l <'col-sm-12 col-md-6'B> f r t i p",
      // dom:"B<'#colvis row'><'row'><'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-4'i>><'row'p>",
      buttons: [
        {
          text: 'Excel',
          extend: 'excel',
          className: 'table-button btn btn-sm button btn-danger '
        },
        {
          extend: 'print',
          text: 'Print',
          className: 'table-button btn-sm button btn btn-danger '
        },
        {
          extend: 'pdf',
          text: 'PDF',
          className: 'table-button btn-sm button btn btn-danger '
        }
      ]
    };
  }
  
  loadevents() {
    this.eventService.getEvents().subscribe(data => {
      this.events = data;
    });
  }
  clickButton(model: any) {
    console.log(model);

  }
  dayClick(model: any) {
    console.log(this.calendarComponent);
    console.log(model);
  }

  eventClick(model) {
    console.log(model);
  }

  get f() { return this.registerForm.controls; }
  get f2() { return this.followUpForm.controls; }
  get f3() { return this.subscriptionForm.controls; }

  onSubmitFollowUpForm() {
    this.supportService.sendTicketFollowUp(this.custometTickets[this.currentTicketIndex]._id,
      this.followUpForm.value).subscribe((res: ResponseModel) => {
        this.custometTickets.splice(this.currentTicketIndex, 1, res.data)
        this.toastr.info('Follow up is successfull!', 'Succcess!!');
        jQuery('#ticketModal').modal('hide');
        console.log(res.data);
        this.followUpForm.reset();
      });
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.registerForm)
    // stop here if form is invalid
    if (this.registerForm.invalid) { return; }
    this.registerCustomer = this.registerForm.value;
    if (this.editing) {
      this.updateCustomer(this.registerCustomer);
    } else {
      this.addCustomer(this.registerCustomer);
    }
    // this.registerForm.reset();
  }
  // get f() { return this.customerForm.controls; }

  submit() {
    this.submitted = true;
    if (this.customerForm.get('district').value == null) {
      this.customerForm.removeControl('district');
    }
    if (this.customerForm.invalid) { return; }
    this.currentcustomer = this.customerForm.value;
    if (this.editing) {
      this.updateCustomer(this.currentcustomer);

    } else {
      this.addCustomer(this.currentcustomer);
    }
  }
  closeModal() {
    this.registerForm.reset();
  }

  addCustomer(customer) {
    console.log(customer);
    this.customerService.addCustomer(customer).subscribe((res: ResponseModel) => {
      console.log(res);
      jQuery('#modal3').modal('hide');
      this.toastr.success('Customer Added', 'Success!');
      this.allcustomers.push(res);
      console.log(this.allcustomers);
      this.allregisterCustomer.push(res);
      this.resetForm();
      window.location.reload();
    });
  }

  editCustomer(i) {
    this.editing = true;
    this.currentcustomer = this.allcustomers[0][i];
    this.currentcustomerId = this.allcustomers[0][i]._id;
    this.current_customer_index = i;
    this.setFormValue();
  }

  deleteCustomer(i) {
    if (confirm('You Sure you want to delete this customer')) {
      this.customerService.deleteCustomer(this.allcustomers[0][i]._id).toPromise().then(() => {
        this.allcustomers[0].splice(i, 1);
        this.toastr.warning('Customer Deleted!', 'Deleted!');
      }).catch((err) => console.log(err));
    }
  }

  get_customers() {
    this.allcustomers.length = 0;
    this.customerService.getAllCustomers().subscribe((res: ResponseModel) => {
      console.log(res);
      if (res.errors) {
        if (res.status === 403) {
          this.toastr.warning('ACCESS DENIED', 'Error!');
        }
      } else {
        console.log(res);
        this.allcustomers.push(res.data);
        console.log('All Customers', this.allcustomers);
        this.dtTrigger.next();
      }
    });
  }

  updateCustomer(customer) {
    console.log(customer);
    console.log(this.allcustomers[0][this.current_customer_index]._id, customer);
    this.customerService.updateCustomer(this.allcustomers[0][this.current_customer_index]._id, customer).subscribe(res => {
      console.log(res);
      this.toastr.info('Customer Updated Successfully!', 'Updated!');
      jQuery('#modal3').modal('hide');
      this.allcustomers[0].splice(this.current_customer_index, 1, res);
      this.resetForm();
      window.location.reload();
    });
  }

  viewCustomer(i) {
    this.viewArray = this.allcustomers[0][i];
    console.log(this.viewArray);
    if (this.viewArray) {
      if (this.viewArray.profile_picture) {
        this.image = this.imageURL + this.viewArray.profile_picture;
        this.showProfileImage = true;
      } else {
        this.showProfileImage = false;
      }
    }
    if (this.viewArray) {

      this.customerService.getSpecificCustomerOrder(this.viewArray._id).subscribe((res: ResponseModel) => {
        this.orderHistory.length = 0;
        console.log(res.data);
        this.orderHistory = res.data;
      });

      this.customerService.getSpecificCustomerTickets(this.viewArray._id).subscribe((res: ResponseModel) => {
        this.custometTickets.length = 0;
        console.log(res.data);
        this.custometTickets = res.data;
      });

      this.customerService.getAllSubscriptionspecificCustomer(this.viewArray._id).subscribe((res: ResponseModel) => {
        this.allSubscriptions.length = 0;
        console.log(res.data);
        this.allSubscriptions = res.data;
      });
    }
  }



  seeCustomerFullOrderDetail(i) {
    if (this.orderHistory) {
      this.orderHistoryNumberInformation = this.orderHistory[i]
      console.log(this.orderHistoryNumberInformation)
    }
  }

  seeCustomerFullTicketDetail(i) {
    if (this.custometTickets) {
      this.currentTicketIndex = i;
      this.ticketInformation = this.custometTickets[i]
      console.log(this.ticketInformation)
      if (this.ticketInformation.callType.inbound == true) {
        this.callType = "inbound";
      }
      else {
        this.callType = "inbound"
      }

      if (this.ticketInformation.customerConcernMedia.hub == true) {
        this.customerConcernMedia = "hub"
      }
      else if (this.ticketInformation.customerConcernMedia.mobile == true) {
        this.customerConcernMedia = "mobile"
      }
      else {
        this.customerConcernMedia = "whatsapp"
      }

      if (this.ticketInformation.products.butter == true) {
        this.Products = "butter"
      }
      else if (this.ticketInformation.products.cheese == true) {
        this.Products = "cheese"
      }
      else if (this.ticketInformation.products.ghee == true) {
        this.Products = "ghee"
      }
      else {
        this.Products = "milk"
      }

      if (this.ticketInformation.responses.length > 0) {
        this.showResponses = true
      }
      else {
        this.showResponses = false
      }

    }
  }

  showPerticularSubscrition(i) {
    console.log(this.calendarComponent)

    this.viewPerticularSubscription = this.allSubscriptions[i]

    if (this.allSubscriptions[i].frequencyDates) {

      console.log(this.allSubscriptions[i].frequencyDates);
      this.allEvents2.length = 0;
      var arr: any[] = []
      for (var index = 0; index < this.allSubscriptions[i].frequencyDates.length; index++) {
        arr.push({ title: 'subscribed', start: this.allSubscriptions[i].frequencyDates[index].slice(0, 10), color: '#4285F4' });
      }
      this.allEvents2 = arr
      console.log(arr, this.allEvents2)
    }
  }

  showTicketProductConcern() {
    this.showTicketPructProblem = true;
    this.showTicketServiceProblem = false;
    this.showTicketSubscriptionProblem = false;
  }

  showTicketServiceConcern() {
    this.showTicketPructProblem = false;
    this.showTicketServiceProblem = true;
    this.showTicketSubscriptionProblem = false;
  }

  showTicketSubscriptionConcern() {
    this.showTicketSubscriptionProblem = true;
    this.showTicketPructProblem = false;
    this.showTicketServiceProblem = false;
  }
  resetForm() {
    this.editing = false;
    this.submitted = false;
    this.registerForm.reset();
    // this.initForm();
  }

  resetFrom2() {
    this.customer_type_form.reset();
    this.initForm();
  }

  initForm() {
    this.customerForm = this.formBuilder.group({
      city: ['', Validators.required],
      customer_name: ['', Validators.required],
      is_active: [true, Validators.required],
      notes: [''],
      region: ['', Validators.required],
      sector: ['', Validators.required],
      customer_type: ['', Validators.required],
    });

    this.customer_type_form = this.formBuilder.group({
      is_active: ['', Validators.required],
      customer_type: ['', Validators.required],
      customer_id: ['', Validators.required]
    });
  }

  setFormValue() {

    console.log(this.registerForm.controls)
    const customer = this.allcustomers[0][this.current_customer_index];
    console.log(customer);
    var dob = customer.dob.substring(0, 10)
    this.registerForm.controls['city'].setValue(customer.city);
    this.registerForm.controls['mobile_number'].setValue(customer.mobile_number);
    this.registerForm.controls['full_name'].setValue(customer.full_name);
    this.registerForm.controls['dob'].setValue(dob);
    this.registerForm.controls['landmark'].setValue(customer.landmark);
    this.registerForm.controls['street_address'].setValue(customer.street_address);
    console.log(this.registerForm.controls)
  }

  setform2Value(customerType) {
    this.customer_type_form.controls['customer_id'].setValue(customerType.customer_id);
    this.customer_type_form.controls['customer_type'].setValue(customerType.customer_type);
    this.customer_type_form.controls['is_active'].setValue(customerType.is_active);
  }


  public uploadCSV(files: FileList) {
    if (files && files.length > 0) {
      const file: File = files.item(0);
      const reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        this.parsedCSV = reader.result;
      };
    }
  }

  checkRegion(region) {
    if (region.region === this.customerForm.get('region').value) {
      console.log(region.region, this.customerForm.get('region').value);
      return true;
    }
    return false;
  }

  checkDistrict(district) {
    if (district.district === this.customerForm.get('district').value) {
      return true;
    }
    return false;
  }

  checkCity(city) {
    if (city.city === this.customerForm.get('city').value) {
      return true;
    }
    return false;
  }

  public extractData() {
    this.uploading = true;
    const lines = this.parsedCSV.split(/\r\n|\n/);
    const result = [];
    const headers: any[] = lines[0].split(',');
    if (
      headers[0] === 'city' && headers[1] === 'is_active' && headers[2] === 'customer_name'
      && headers[3] === 'distirbutor_1_name' && headers[4] === 'distirbutor_2_name' && headers[5] === 'distirbutor_3_name'
      && headers[6] === 'share_1' && headers[7] === 'share_2' && headers[8] === 'share_3' && headers[9] === 'district'
      && headers[10] === 'notes' && headers[11] === 'region' && headers[12] === 'sector' && headers[13] === 'type') {
      for (let i = 1; i < lines.length - 1; i++) {
        const obj = {};
        const currentline = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        result.push(obj);
      }
      this.customerService.importCustomer(result).subscribe(res => {
        setTimeout(() => {
          this.uploading = false;
          console.log(res);
          this.toastr.success('Customers Imported successfully', 'Upload Success');
          jQuery('#modal2').modal('hide');
        }, 1000);
        this.uploading = false;
      });
      // this.newproduct = result;
    } else {
      this.toastr.error('Try Again', 'Upload Failed');
      // this.reset();
      this.uploading = false;
    }
  }

  fillSubscriptionForm() {
    // console.log(this.subscriptionForm.value)
    this.subscriptionForm.reset();
  }

  onSubmitSubscriptionForm() {
    if (this.viewArray) {
      this.subscriptionForm.value.user = this.viewArray._id;
    }

    let subscriptionStatDate = moment(this.subscriptionForm.value.startDate).toDate();
    const arr = [];
    const totalDays = 60;
    let days = 0;
    switch (this.selectedEvent) {
      case 'daily': days = 1;
        break;
      case 'alternate': days = 2;
        break;
      case 'in3days': days = 3;
        break;
    }
    for (let i = 0; i < totalDays / days; i++) {
      arr.push(subscriptionStatDate);
      subscriptionStatDate = moment(subscriptionStatDate).add(days, 'days').toDate();
    }
    console.log(arr);
    this.subscriptionForm.value.startDate = subscriptionStatDate;
    this.subscriptionForm.value.frequencyDates = arr;
    console.log(this.subscriptionForm.value);
    this.customerService.addSubscriptionn(this.subscriptionForm.value).subscribe((res: ResponseModel) => {
      console.log(res.data)
      this.allSubscriptions.push(res.data);
      this.showSubform = false;
    });
  }



  selectPlan(event) {
    this.selectedEvent = event.target.value;
  }

  getProducts() {
    this.allProducts.length = 0;
    this.productService.getAllProduct().subscribe((res: ResponseModel) => {
      this.allProducts = res.data;
    });
  }

  showSubscriptionForm() {
    this.showSubform = true;
    this.showSubscriptionButton = false;
    this.subscriptionForm.reset();
  }

  changeCustomerStatus(i) {
    const r = confirm('Sure You Want to Change Its Status');
    const status = !this.allcustomers[0][i].is_active;
    console.log(status)
    if (r === true) {
      this.customerService.changeCustomerStatus({ id: this.allcustomers[0][i]._id, is_active: status })
        .subscribe((res: ResponseModel) => {
          console.log(res);
          if (res.errors) {
            this.toastr.error('Error While Changing Status', 'Error');
          } else {
            this.allcustomers[0].splice(i, 1, res.data);
            this.toastr.success('Status Updated', 'Success');
          }
        });
    } else {
      console.log("You pressed Cancel!");
    }
  }
}
