import { AnimationStyleMetadata } from '@angular/animations';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { SessionStorageService } from './session-storage.service';
import { LocalStorageService } from './local-storage.service';
import { VariableManageService } from './variable-manage.service';
import { UrlToolsService } from './url-tools.service';
import { environment } from 'src/environments/environment';
import { api_list } from './api-list';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  navCollapseEvent: EventEmitter<any> = new EventEmitter(); loginUser: any;


  baseUrl = environment.base_url;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  getGeoLocationUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
  googleApiKey = 'AIzaSyD3BufvPkW6Ta5dr2iLwef-6s0xW5I6izI';

  getAPSystemsUrl = this.baseUrl + "apSystems/DtosList";
  getAPSystemExportsBySystemIdUrl = this.baseUrl + "apSystems/";
  getStateUrl = this.baseUrl + "states/country/";
  getContactByIdUrl = this.baseUrl + "people/";
  getCountriesUrl = this.baseUrl + "countries";
  attributesUrl = this.baseUrl + "attributes/";
  getContactLogsUrl = this.baseUrl + "importlog/";
  exportPeopleUrl = this.baseUrl + "export/people";
  importPeopleUrl = this.baseUrl + "import/people";
  getLocationTypesUrl = this.baseUrl + "locationtypes";
  inventorystatuses = this.baseUrl + 'inventorystatuses';
  getLocationStatusUrl = this.baseUrl + "locationstatuses";
  getLocationTermUrl = this.baseUrl + "locationterms";
  chargeCodeGroupsUrl = this.baseUrl + "chargecodegroups/";
  vendorxindustriesUrl = this.baseUrl + "vendorxindustries/";
  getcustomercontacttypes = this.baseUrl + "customercontacttypes";
  getCompanyLocationByCompanyLocationUrl = this.baseUrl + "CompanyXLocation/";

  addBillingAccountUrl = this.baseUrl + "billingaccounts";
  getBillingAccountUrl = this.baseUrl + "billingaccounts/LoggedInUser";

  getIndustriesUrl = this.baseUrl + "industries";
  addIndustryUrl = this.baseUrl + "industries";
  updateIndustryUrl = this.baseUrl + "industries/";
  getIndustryLoggedUrl = this.baseUrl + "industries/LoggedInUser";

  addServiceUrl = this.baseUrl + "services";
  getServicesUrl = this.baseUrl + "services";
  updateServiceUrl = this.baseUrl + "services/";
  getServiceslist = this.baseUrl + "services/DropDown";

  getChargecodeUrl = this.baseUrl + "chargecodes";
  getChargecodeLoggedUrl = this.baseUrl + "chargecodes/LoggedInUser";
  getChargeCodetypeLoggedUrl = this.baseUrl + "chargecodes/ChargeCodeTypes/LoggedInUser";

  addChargeCodeUrl = this.baseUrl + "chargecodes";
  addChargeCodeBulkUrl = this.baseUrl + "sandbox/ChargeCode/Bulk";
  VendorAccountChargeCodeURL = this.baseUrl + 'chargecodes/VendorAccount/{id}';
  VendorAccountChargeCodeURLNew = this.baseUrl + 'chargecodes/VendorAccountForGroup/{id}';
  getChargeCodeGroupDetailURL = this.baseUrl + 'chargecodes/{id}/ChargeCodeGroupDetails';
  groupActiveInactiveUrl = this.baseUrl + 'chargecodegroups/{id}/Status';

  vendorProductChargeCodeGroupsUrl = this.baseUrl + "vendorproductchargecodegroups/LoggedInUser";

  getProductsUrl = this.baseUrl + "products";
  addProductDataUrl = this.baseUrl + "products";
  updateProductDataUrl = this.baseUrl + "products/";
  getProductsServiceTypeURL = this.baseUrl + "products/ServiceType/{id}";
  getProductsLoggedUrl = this.baseUrl + "products/LoggedInUser";
  getServicesLoggedUrl = this.baseUrl + "services/LoggedInUser";
  getProductlist = this.baseUrl + "products/DropDown";

  addServiceTypeUrl = this.baseUrl + "servicetypes";
  getServiceTypesUrl = this.baseUrl + "servicetypes";
  updateServiceTypeUrl = this.baseUrl + "servicetypes/";
  servicetypes = this.baseUrl + 'servicetypes/Service';
  servicetypesUrl = this.baseUrl + 'servicetypes/Service/{Id}';
  getServiceServicetypesURL = this.baseUrl + "servicetypes/Service/{id}";
  getServiceTypelist = this.baseUrl + "servicetypes/DropDown";

  getServicesIndustryURL = this.baseUrl + "services/Industry/{id}";

  addChargeTypeUrl = this.baseUrl + "chargetypes";
  updateChargeTypeUrl = this.baseUrl + "chargetypes/";
  ccrepoUsedUnUsedURL = this.baseUrl + "costcenters/CCRepo/UsedUnUsed";
  getTaxRegulatoryTypesUrl = this.baseUrl + "chargetypes/chargeCodeTypeId/";

  customerVendorBillingAccountUrl = this.baseUrl + 'billingaccounts/CustomerVendor';
  SubBillingAccounts = this.baseUrl + 'billingaccounts/SubBillingAccounts/{billingAccountHierarchyId}';

  inventories = this.baseUrl + 'inventories';
  saveInventoriesURL = this.baseUrl + 'inventories/{Id}';
  getVoiceTableURL = this.baseUrl + 'inventories/voice/LoggedInUser';

  CostCentersUrl = this.baseUrl + "costcenters/";
  costcentersTemAccountURL = this.baseUrl + 'costcenters/TEMAccount/{Id}';
  costcentersCCRepoTemAccountURL = this.baseUrl + 'costcenters/CCRepo/TEMAccount/{Id}';

  addChargeCodeTypeUrl = this.baseUrl + "chargecodetypes";
  updateChargeCodeTypeUrl = this.baseUrl + "chargecodetypes/";
  getChargeCodeTypeUrl = this.baseUrl + "chargecodetypes/LoggedInUser";
  getChargeCodeTypeLoggedUrl = this.baseUrl + "chargecodes/ChargeTypes/LoggedInUser";

  saveCompanyUrl = this.baseUrl + "companies";
  getCompaniesUrl = this.baseUrl + "companies";
  updateCompanyUrl = this.baseUrl + "companies/";
  getCompanyByIdUrl = this.baseUrl + "companies/";
  getCompanysListByTEMId = this.baseUrl + "companies/accountId/";
  getCompanyByCustomerIdUrl = this.baseUrl + "companies/accountId/{Id}/DropDown";
  getCompanyByCustomerIdUrlNew = this.baseUrl + "companies/accountId/{Id}/DropDownNew";

  companyIsPrimaryUrl = this.baseUrl + "companies/GetCompanyIsPrimary";
  getCompanyByTem = this.baseUrl + "companies/LoggedInUser/DropDown"
  getGL_Jobrefurl = this.baseUrl + "companies/{id}/";

  addProductTypeUrl = this.baseUrl + "producttypes";
  getProductTypesUrl = this.baseUrl + "producttypes";
  getProductTypesLoggedIn = this.baseUrl + "producttypes/LoggedInUser";
  getServicesTypesLoggedIn = this.baseUrl + "servicetypes/LoggedInUser";

  updateProductTypeUrl = this.baseUrl + "producttypes/";
  getproductmapp = this.baseUrl + "producttypes/Mapped";
  producttypes = this.baseUrl + 'producttypes/ServiceType';
  getProducttypesURL = this.baseUrl + "producttypes/Product/{id}";
  getProductTypeUrlDropDown = this.baseUrl + "producttypes/Unmapped";
  producttypesUrlNew = this.baseUrl + 'producttypes/ServiceType/{Id}';
  getProductTypelist = this.baseUrl + "producttypes/DropDown";

  getVendorProductUrl = this.baseUrl + "vendorproducttypes";
  getVendorProductLoggedUrl = this.baseUrl + "vendorproducttypes/LoggedInUser";
  addVendorProductUrl = this.baseUrl + "vendorproducttypes";
  getVendorProductByIdUrl = this.baseUrl + "vendorproducttypes/";
  updateVendorProductByIdUrl = this.baseUrl + "vendorproducttypes/";
  vendorproducttypes = this.baseUrl + 'vendorproducttypes/VendorAndProductTypeId';
  getChargeCodedetailsURL = this.baseUrl + 'vendorproducttypes/{id}/ChargeCodedetails';
  getChargeCodeGroupDetailsURL = this.baseUrl + 'vendorproducttypes/{id}/ChargeCodeGroupDetails';
  getVendorProductTypelist = this.baseUrl + "vendorproducttypes/DropDown";

  vendorProductTypesVendorAccountIdURL = this.baseUrl + 'vendorproducttypes/vendorAccountId/{id}';
  vendorProductTypesVendorIdURL = this.baseUrl + 'vendorproducttypes/vendorAccountId/{id}/DropDown';
  vendorProductTypesDetailsURL = this.baseUrl + 'vendorproducttypes/{id}/details';
  vendorProductTypesChargeCodeGroupsURL = this.baseUrl + 'vendorproducttypes/{id}/ChargeCodeGroups';
  vendorproducttypesChangeLogsUrl = this.baseUrl + 'vendorproducttypes/ChangeLogs/{id}';
  chargecodesChangeLogUrl = this.baseUrl + 'chargecodes/{id}/ChangeLogs';
  getChargeCodeGroupDetailURLNew = this.baseUrl + 'chargecodes/{id}/DetailsData';
  getchargecodesHierarchyUrl = this.baseUrl + 'chargecodes/{id}/Hierarchy';

  phonenumberrequirements = this.baseUrl + 'phonenumberrequirements';
  phonenumberrequirementsID = this.baseUrl + 'phonenumberrequirements/{Id}';
  phonenumberrequirementsIDDetail = this.baseUrl + 'phonenumberrequirements/{Id}/details';
  phonenumberrequirementsCountry = this.baseUrl + 'phonenumberrequirements/country/{countryId}';

  addProductUrl = this.baseUrl + "productstructure";
  getProductByIdUrl = this.baseUrl + "productstructure/";
  updateProductByIdUrl = this.baseUrl + "productstructure/";
  getProductStructureUrl = this.baseUrl + "productstructure";
  getProductUrl = this.baseUrl + "productstructure/LoggedInUser";
  getProductsListByTEMId = this.baseUrl + "productstructure/products/";
  productStructureDetail = this.baseUrl + "productstructure/details";

  getProductStructureServicesIndustryURL = this.baseUrl + "productstructure/Services/Industry/{id}";
  getProductStructureServiceServicetypesURL = this.baseUrl + "productstructure/ServiceTypes/Service/{id}";
  getProductStructureProductsServiceTypeURL = this.baseUrl + "productstructure/Products/ServiceType/{id}";


  addVendorUrl = this.baseUrl + "vendoraccounts";
  updateVendorUrl = this.baseUrl + "vendoraccounts/";
  getVendorByIdUrl = this.baseUrl + "vendoraccounts/";
  vendoraccountsDetailWithIdURL = this.baseUrl + "vendoraccounts/{Id}/Settings";
  getVendorListByTEMId = this.baseUrl + "vendoraccounts/";
  getVendorUrl = this.baseUrl + "vendoraccounts/LoggedInUser";
  vendorDropdownURL = this.baseUrl + "vendoraccounts/LoggedInUser/DropDown";
  vendorAccountDropdownURL = this.baseUrl + "vendoraccounts/{id}/VendorAccountDetails/DropDown";
  vendorDetailGetURL = this.baseUrl + "billingaccounts/{BId}/DataInvoiceRetrieval/PopulateVendor/{VId}";

  getDataretrieval = this.baseUrl + "dataretrieval/templates/{id}";
  getRequiredUrl = this.baseUrl + "dataretrieval/filetyperequiredvalue";
  getFileTypeUrl = this.baseUrl + "dataretrieval/filetypes";
  downloadBlankTemplateUrl = this.baseUrl + "dataretrieval/blanktemplate";
  getdataRetrievalMethodsUrl = this.baseUrl + "dataRetrievalMethods";
  saveDataRetrievalUrl = this.baseUrl + "dataretrieval/vendor";
  getFileMonitoringUrl = this.baseUrl + "FileMonitoring/LoggedInUser";

  saveCompanyLocationUrl = this.baseUrl + "companylocations";
  updateCompanyLocationUrl = this.baseUrl + "companylocations/";
  getCompanyLocationUrl = this.baseUrl + "companylocations/LoggedInUser";
  companylocationsURL = this.baseUrl + "companylocations/LoggedInUserData";
  companylocationdetailsURL = this.baseUrl + "companylocations/{Id}/details";
  getLocationListByTEMId = this.baseUrl + "companylocations/{temAccountId}/CompanyLocationDetails";
  updateCompanyLocationContactsURL = this.baseUrl + "companylocations/{Id}/Contacts";

  getLocationUrl = this.baseUrl + "locations";
  saveLocationUrl = this.baseUrl + "locations";
  updateLocationUrl = this.baseUrl + "locations/";
  updateGPSLocationUrl = this.baseUrl + "locations/GPS/update/";
  getMapForTemUsersUrl = this.baseUrl + "locations/Map/LoggedInUser/";
  getMapForOtherUsersUrl = this.baseUrl + "locations/Map/LoggedInUser";
  getAllLocationInventoriesUrl = this.baseUrl + "inventories/LoggedInUser";
  getAllLocationInventory = this.baseUrl + "inventories/Hierarchy/LoggedInUser";

  saveLocationInventoriesUrl = this.baseUrl + "companylocations/{Id}/VendorProductInventory";
  getLocationInventoriesUrl = this.baseUrl + "companylocations/{Id}/VendorProductInventory/Hierarchy";

  getCustomerUrl = this.baseUrl + "accounts";
  getAccountByIdUrl = this.baseUrl + "accounts/";
  getTEMForUserUrl = this.baseUrl + "accounts/TEM";
  saveTemUrl = this.baseUrl + "accounts/TEM/create";
  getTEMAccountByIdUrl = this.baseUrl + "accounts/";
  updateTemUrl = this.baseUrl + "accounts/TEM/Update/";
  addAccountUrl = this.baseUrl + "accounts/Customer/Create";
  customerDropdownByTEMURL = this.baseUrl + "accounts/TEM/{id}/Customer/Dropdown";
  customerDropdownByTemNewURL = this.baseUrl + "accounts/TEM/{id}/Customer/DropdownNew";
  getTemAccounts = this.baseUrl + "accounts/TEM/LoggedInUserData";
  updateAccountUrl = this.baseUrl + "accounts/Customer/Update/";
  getCustomersListByTEMId = this.baseUrl + "accounts/TEM/Customer/";
  getCustomerDropDownUrl = this.baseUrl + "accounts/Customer/LoggedInUser/DropDown?Active=true";
  getServiceTypeattributesUrl = this.baseUrl + "servicetypeattributes";
  getTEMLoggedInUserDropDownURL = this.baseUrl + "accounts/TEM/LoggedInUser/DropDown";
  getVendoraccountsDetailsUrl = this.baseUrl + "vendoraccounts/{id}/details";
  saveAccountNotesUrl = this.baseUrl + 'billingAccountNotes';
  getbillingAccountNotesUrl = this.baseUrl + 'billingAccountNotes/BillingAccount';
  downloadNoteAttachmentForAccount = this.baseUrl + 'billingAccountNotes/{Id}/DownloadNoteAttachment';
  changeAccountNoteStatusUrl = this.baseUrl + 'billingAccountNotes/Status';

  addContactUrl = this.baseUrl + "contacts";
  getContactUrl = this.baseUrl + "contacts";
  saveContactUrl = this.baseUrl + "contacts";
  editContactUrl = this.baseUrl + "contacts/";
  updateContactUrl = this.baseUrl + "contacts/";
  getContactsByIdUrl = this.baseUrl + "contacts/";
  getContactsListByTEMId = this.baseUrl + "contacts/";
  getContactsUrl = this.baseUrl + "contacts/CompanyContacts";
  setContactsPrimaryLocationUrl = this.baseUrl + 'contacts/Primary/';
  getCountryByCustomerIdUrl = this.baseUrl + "contacts/LocationCountries/";
  getStateByCustomerCountryUrl = this.baseUrl + "contacts/LocationStates/";
  getLocationByCustomerStateUrl = this.baseUrl + "contacts/ContactLocations/";
  getAllStateLocationsByCustomerIdUrl = this.baseUrl + "contacts/ContactLocations/";
  getContactsDetailsURL = this.baseUrl + 'contacts/CustomerAccount/{Id}/ContactsDetails';
  getLocationByCustomerUrl = this.baseUrl + 'contacts/ContactLocations/';

  getLocationPeopleUrl = this.baseUrl + 'companylocations/{id}/Peoples';

  addUserUrl = this.baseUrl + "identity/users";
  editUserUrl = this.baseUrl + "identity/users";
  loginUrl = this.baseUrl + "identity/userauths/Login";
  twoStepVerificationUrl = this.baseUrl + "identity/userauths/TwoStepVerification";
  resendOtpUrl = this.baseUrl + "identity/userauths/RequestOtp";
  supportEmailUrl = this.baseUrl + "identity/userauths/SupportURL";
  checkPasswordExpirationUrl = this.baseUrl + "identity/users/checkPasswordExpiration";

  getTemuser = this.baseUrl + "identity/users/TEMUsers";
  lockUserUrl = this.baseUrl + "identity/users/LockUser";
  getUsersUrl = this.baseUrl + "identity/users/CompanyUsers";
  unlockUserUrl = this.baseUrl + "identity/users/UnlockUser";
  verifyUserUrl = this.baseUrl + "identity/users/VerifyUser";
  getVendorUserListByTEMId = this.baseUrl + "identity/users/";
  getUserByEmailUrl = this.baseUrl + "identity/users/AppUser/{id}";
  resetpwdUrl = this.baseUrl + "identity/userauths/ResetPassword";
  getVendorUsersUrl = this.baseUrl + "identity/users/VendorUsers";
  userResetPwdUrl = this.baseUrl + "identity/users/ChangePassword";
  forgetPwdUrl = this.baseUrl + "identity/userauths/ForgotPassword";
  getUserRolesUrl = this.baseUrl + "identity/userRoles/LoggedInUser";
  assumeIdentityUrl = this.baseUrl + "identity/users/AssumeIdentity/";
  getCustomerForUserUrl = this.baseUrl + "identity/users/UserCustomers";
  getCustomerUsersListByTEMId = this.baseUrl + "identity/users/Filter/";
  getAPResponsibleUsersUrl = this.baseUrl + "identity/users/APResponsible/";
  uploadProfileImageUrl = this.baseUrl + "identity/users/Upload/ProfileImage";
  emailVerificationUrl = this.baseUrl + "identity/users/ResendUserVerifyEamil";
  getLoggedinUserInfoUrl = this.baseUrl + "identity/users/AppUser/LoggedInUser";
  getUserCompaniesByAccountIdUrl = this.baseUrl + "identity/users/UserCompanies/";

  getCurrenciesUrl = this.baseUrl + "currencies";
  getInvoicefrequenciesUrl = this.baseUrl + "invoicefrequencies";
  getRemitaddressLoggedUrl = this.baseUrl + "remitaddresses/LoggedInUser";
  getaddRemitaddressesUrl = this.baseUrl + "remitaddresses/DropDown";
  addRemitaddressesUrl = this.baseUrl + "remitaddresses";
  getRemitaddressesUrl = this.baseUrl + "remitaddresses";
  getInvoiceRetrievalMethodsUrl = this.baseUrl + "invoiceretrievalmethods";
  getdataRetrievalSourceUrl = this.baseUrl + "dataRetrievalSource";
  dataRetrievalTemplateTypeURL = this.baseUrl + "dataRetrievalTemplateType";
  getDataRetrievalProcessiongUrl = this.baseUrl + "DataRetrievalProcessingMethods";
  getDataretrievalBatemplatesIdUrl = this.baseUrl + "dataretrieval/batemplates/{id}";
  getDataretrievalFiletyperequiredvalueURL = this.baseUrl + "dataretrieval/filetyperequiredvalue";

  dataretrievalVatemplatesURL = this.baseUrl + 'dataretrieval/vatemplates/{id}';
  dataretrievalVaimporttemplateURL = this.baseUrl + 'dataretrieval/vaimporttemplate/';
  downloadtemplateURL = this.baseUrl + 'dataretrieval/vaimporttemplate/{id}/Download';


  getPaymenttypesUrl = this.baseUrl + "paymenttypes";

  getPaymentmethodsUrl = this.baseUrl + "paymentmethods";

  getVendorBillingAliasUrl = this.baseUrl + "vendorbillingalias/";
  getChargeCodeOriginsUrl = this.baseUrl + "chargecodeorigins";

  copyChargeCode = this.baseUrl + 'chargecodes/Copy';

  getChargeTypeUrl = this.baseUrl + "chargetype/LoggedInUser";

  getChargeCodeOccurrenceUrl = this.baseUrl + "ChargeCodeOccurrence";

  InvoicesUrl = this.baseUrl + "invoices/";
  getInvoiceRetrievalUrl = this.baseUrl + "invoices/InvoiceRetrieval/{id}";
  getInvoiceFetchDateUrl = this.baseUrl + "invoices/InvoiceRetrieval/FetchDates";
  UpdateInvoiceRetrieval = this.baseUrl + "invoices/InvoiceRetrieval/Update/{id}";
  uploadAttachmentURL = this.baseUrl + "invoices/UploadInvoiceAttachment/{id}";
  removeInvoiceAttachmentURL = this.baseUrl + "invoices/{id}/RemoveInvoiceAttachment";
  mainBillingAccountDDUrl = this.baseUrl + "billingaccounts/MainBillingAccount/DropDown";
  IsAnyPayableBillingAccountUrl = this.baseUrl + 'billingaccounts/IsPayableAndInvoiceAttached';
  mainBillingAccountsDDUrl = this.baseUrl + 'billingaccounts/MainBillingAccounts/DropDown';
  billingAccountStatus = this.baseUrl + 'billingaccounts/BillingAccountStatus';
  processBillingData = this.baseUrl + 'billingaccounts/GetParenctChildBillingAccountData';

  billingTEMAccountsWiseUrl = this.baseUrl + 'billingaccounts/TEMAccount/{Id}';
  dataretrievalBaimporttemplateUrl = this.baseUrl + 'dataretrieval/baimporttemplate';
  getDataretrievalBatemplatesURL = this.baseUrl + 'dataretrieval/batemplates/{vId}/{bId}';
  vendorproducttypesDropDownURL = this.baseUrl + 'vendorproducttypes/ProductType/{Id}/DropDown';
  expectedinvoicestatusesURL = this.baseUrl + 'expectedinvoicestatuses';
  getDataRetrievalFilesUrl = this.baseUrl + 'invoices/InvoiceRetrieval/{id}/DataRetrievalFiles';
  DownloadInvoiceAttachmentURL = this.baseUrl + 'invoices/DownloadInvoiceAttachment/{id}';
  getInvoiceRetrievalDataUrl = this.baseUrl + 'invoices/InvoiceRetrieval/{id}/details';
  terminateInvoiceRetrievalUrl = this.baseUrl + 'invoices/InvoiceRetrieval/{id}/Terminate';
  inventorystatusesCode = this.baseUrl + 'inventorystatuses/Code';
  getInvoiceRetrievalNotesUrl = this.baseUrl + 'InvoiceRetrievalNotes/InvoiceRetrieval/{id}';
  saveInvoiceRetrievalNotesUrl = this.baseUrl + 'InvoiceRetrievalNotes';

  vendorproductinventoryorigins = this.baseUrl + 'vendorproductinventoryorigins';
  vendorproductinventoryoriginsName = this.baseUrl + 'vendorproductinventoryorigins/Name';

  contactUrl = this.baseUrl + 'contacts/LoggedInUser';

  addPeopleUrl = this.baseUrl + 'peoples'
  peopleUrl = this.baseUrl + 'peoples/LoggedInUserData';
  peopleManagerUrl = this.baseUrl + 'peoples/Manager/DropDown';
  updatePeopleUrl = this.baseUrl + 'peoples/';

  getPeoplenotesUrl = this.baseUrl + 'peoplenotes/People';
  savePeopleNotesUrl = this.baseUrl + 'peoplenotes';
  makePeopleNotesStatusActiveUrl = this.baseUrl + 'peoplenotes/Status';
  downloadPeopleNotesUrl = this.baseUrl + 'peoplenotes/{Id}/DownloadPeopleNoteAttachment';

  getLocationnotesUrl = this.baseUrl + 'locationnotes/Location';
  saveLocationNotesUrl = this.baseUrl + 'locationnotes';
  makeLocationNotesStatusActiveUrl = this.baseUrl + 'locationnotes/Status';
  downloadLocationNotesUrl = this.baseUrl + 'locationnotes/{Id}/DownloadLocationNoteAttachment';

  //Sandbox Urls

  getChargeCodeAssignmentUrl = this.baseUrl + 'sandbox/ChargeCodeAssignment/{id}';
  /////  //  ====

  DownloadFilesURL = this.baseUrl + 'dataretrieval/InvoiceRetrieval/{Id}/DownloadFiles';
  DownloadNewAPIFilesURL = this.baseUrl + 'dataretrieval/DownloadInvoiceUploadTemplateByImport/{Id}';
  getReportsURL = this.baseUrl + 'reports';
  getInvoicePreiodURL = this.baseUrl + 'reports/InvoicePeriod';
  getDownloadReportURL = this.baseUrl + 'reports/{Id}/Download';
  getInvoicePeriodURL = this.baseUrl + 'reports/InvoicePeriod/Data';


  InvoiceRetrievalDownloadFileURL = this.baseUrl + 'dataretrieval/InvoiceRetrieval/{expectedInvoiceId}/DownloadFile/{importFileNameId}';
  reconAssigments = this.baseUrl + 'ReconAssigments';
  reportsInvoiceMonthsURL = this.baseUrl + 'reports/InvoiceMonths';
  billingaccountsLoggedURL = this.baseUrl + 'billingaccounts/LoggedInUserData';
  customerChangelogUrl = this.baseUrl + 'accounts/ChangeLogs/{Id}';
  companyChangelogUrl = this.baseUrl + 'companies/ChangeLogs/{Id}';
  billingaccountsChangelogUrl = this.baseUrl + 'billingaccounts/ChangeLogs/{Id}';
  costcenterChangelogUrl = this.baseUrl + 'costcenters/ChangeLogs/{Id}';
  costCenterStructureChangelogUrl = this.baseUrl + 'ccStructures/ChangeLogs/{Id}';
  peopleChangelogUrl = this.baseUrl + 'peoples/ChangeLogs/{Id}';
  getWirelineMobileChangelogsURL = this.baseUrl + 'inventories/ChangeLogs/{inventoryId}/{child}';
  temUserChangelogUrl = this.baseUrl + 'identity/users/ChangeLogs/{Id}';
  invoiceRetrievalChangelogUrl = this.baseUrl + 'invoices/ChangeLogs/{Id}';
  locationChangelogUrl = this.baseUrl + 'companylocations/ChangeLogs/{Id}';

  getInventoryTypesUrl = this.baseUrl + 'inventoryTypes';

  SAMLSSOURL = this.baseUrl + 'SAML/sso';

  chargecodegroupsChangeLogsURL = this.baseUrl + 'chargecodegroups/{Id}/ChangeLogs';

  getBillingPeroidForUserUrl = this.baseUrl + "invoice/BillingPeriods/DropDown";
  getCCImportUrl = this.baseUrl + "costcenters/CCImport/LoggedInUser";
  getCCblanktemplateUrl = this.baseUrl + "costcenters/blanktemplate";
  uploadCCFileUrl = this.baseUrl + "costcenters/CCRepo/Import";
  downloadCCFileUrl = this.baseUrl + "costcenters/file/{fileId}/{accountId}";
  private statusValue: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  value$: Observable<string | null> = this.statusValue.asObservable();

  private stepData: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  stepValue$: Observable<string | null> = this.stepData.asObservable();

  private replacedData: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  replacedValue$: Observable<string | null> = this.replacedData.asObservable();

  private setPaddingClass: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  getPaddingValue$: Observable<string | null> = this.setPaddingClass.asObservable();

  private accNotesValue: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  accNotesValue$: Observable<string | null> = this.accNotesValue.asObservable();

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json,text/plain',
      // 'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      //'Access-Control-Allow-Origin': '*'
    })
  };
  tokenExpdialogRef: any;
  constructor(private http: HttpClient,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private variableService: VariableManageService,
    private urlTools: UrlToolsService) {
  }

  tokenExpired(err: { status: number; }) {
    if (err && err.status === 401 && !this.variableService.isLoggedinPopup) {
      this.variableService.isLoggedinPopup = true;
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-circle",
        iconClass: "text-c-blue f-70",
        message: 'Login Required'
      };

      if (this.tokenExpdialogRef == 'undefined' || this.tokenExpdialogRef == undefined) {
        this.tokenExpdialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        this.tokenExpdialogRef.afterClosed().subscribe((result: any) => {
        });
        this.sessionStorageService.clearSessionObjects();
        this.localStorageService.clearSessionObjects();
        this.router.navigate(['/auth/signin']);
      } else {
        this.tokenExpdialogRef.close();
      }
    }
  }


  emitNavCollapseEvent(isNavCollapsed: any) {
    this.navCollapseEvent.emit(isNavCollapsed);
  }

  getNavCollapseEmitter() {
    return this.navCollapseEvent;
  }

  getCompanyLocations(queryParams: any): Observable<any> { // this is old URL
    return this.http.get(this.urlTools.addDynamicURL(this.getCompanyLocationUrl), this.urlTools.addQueryParams(queryParams)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  // DownloadBdfOrEdiData(sbInvoiceId: string, isEdiOrBDF: boolean): Observable<any> {
  //   const url = `${this.ViewSBDataUrl}?sbInvoiceId=${sbInvoiceId}&isEdiOrBDF=${isEdiOrBDF}`;

  //   return this.http.get(url, { responseType: 'blob' }).pipe(
  //     catchError((err) => {
  //       this.tokenExpired(err);
  //       return throwError(err);
  //     })
  //   );
  // }
  vendorproducttypesDropDown(Id: any, queryParams: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorproducttypesDropDownURL, { Id: Id }), this.urlTools.addQueryParams(queryParams)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendoraccountsDetails(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getVendoraccountsDetailsUrl, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLocations(): Observable<any> {
    return this.http.get(this.getLocationUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getContacts(): Observable<any> {
    return this.http.get(this.getContactUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getContactsById(id: any): Observable<any> {
    return this.http.get(this.getContactByIdUrl + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInventoryTypes(): Observable<any> {
    return this.http.get(this.getInventoryTypesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLinkedPeopleLocation(id: any, value: any): Observable<any> {
    return this.http.post(this.updatePeopleUrl + id + '/CompanyLocations', value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  peopleAssign(value: any): Observable<any> {
    return this.http.put(this.updatePeopleUrl + 'Assign', value).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getStates(id: any): Observable<any> {
    return this.http.get(this.getStateUrl + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCompanies(): Observable<any> {
    return this.http.get(this.getCompaniesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLocationTypes(): Observable<any> {
    return this.http.get(this.getLocationTypesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCustomers(): Observable<any> {
    return this.http.get(this.getCustomerUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLocationTerm(): Observable<any> {
    return this.http.get(this.getLocationTermUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getLocationStatus(): Observable<any> {
    return this.http.get(this.getLocationStatusUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateCompanyLocation(id: string, data: any): Observable<any> {
    return this.http.put(this.updateCompanyLocationUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  putChargecodeUrl(id: string, data: any): Observable<any> {
    return this.http.put(this.getChargecodeUrl + '/' + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCompanyLocationDetail(id: string): Observable<any> {
    return this.http.get(this.updateCompanyLocationUrl + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateLocation(id: string, data: any): Observable<any> {
    return this.http.put(this.updateLocationUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCompanyByCustomerId(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getCompanyByCustomerIdUrl, { Id: Id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  
  getCompanyByCustomerIdNew(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getCompanyByCustomerIdUrlNew, { Id: Id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  saveCompanyLocation(data: any): Observable<any> {
    return this.http.post(this.saveCompanyLocationUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  saveLocation(data: any): Observable<any> {
    return this.http.post(this.saveLocationUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getAllLocationInventories(data: any): Observable<any> {
    return this.http.post(this.getAllLocationInventoriesUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  inventoryHierarchy(data: any): Observable<any> {
    return this.http.post(this.getAllLocationInventory, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  setLocationInventories(Id: any, data: any): Observable<any> {

    return this.http.put(this.urlTools.addDynamicURL(this.saveLocationInventoriesUrl, { Id: Id }), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLocationInventories(Id: any, data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getLocationInventoriesUrl, { Id: Id }), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLocationInventoriesExcel(Id: any, data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getLocationInventoriesUrl, { Id: Id }), data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  /* getCompanyLocationById(id: any): Observable<any> {
     return this.http.get(this.getCompanyLocationByIdUrl + id);
   }*/

  saveContact(data: any): Observable<any> {
    return this.http.post(this.saveContactUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateContact(id: string, data: any): Observable<any> {
    return this.http.put(this.updateContactUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCompanyLocationByCompanyLocationId(cId: any, lId: any): Observable<any> {
    return this.http.get(this.getCompanyLocationByCompanyLocationUrl + 'companyId/' + cId + '/locationId/' + lId).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  openSnackBar(message: any) {
    this._snackBar.open(message, '', {
      duration: 6000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  getGeoLocation(address: any) {
    return this.http.get(this.getGeoLocationUrl + 'address=' + address + '&key=' + this.googleApiKey);
  }

  getCountries(): Observable<any> {
    return this.http.get(this.getCountriesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getInvoicefrequencies(): Observable<any> {
    return this.http.get(this.getInvoicefrequenciesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getStateDetails(id: any): Observable<any> {
    return this.http.get(this.getCountriesUrl + "/" + id + "/details").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCurrencies(): Observable<any> {
    return this.http.get(this.getCurrenciesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  checkCompanyIsPrimary(data: any) {
    return this.http.post(this.companyIsPrimaryUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );

  }

  login(data: any): any {
    return this.http.post(this.loginUrl, data).pipe(

      catchError((err) => {
        // this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  twoStepVerification(data: any): any {
    return this.http.post(this.twoStepVerificationUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  resendOtp(logon: any): any {
    const data = {
      userName: logon
    };

    return this.http.post(this.urlTools.addDynamicURL(this.resendOtpUrl), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  supportEmail(logon: any): any {
    const data = {
      userName: logon
    };

    return this.http.post(this.urlTools.addDynamicURL(this.supportEmailUrl), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  
  checkPasswordExpiration(logon: any): any {
    const data = {
      userName: logon
    };

    return this.http.post(this.checkPasswordExpirationUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  forgetPwd(data: any): Observable<any> {
    return this.http.post(this.forgetPwdUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  resetPwd(data: any): any {
    return this.http.post(this.resetpwdUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getUsers(): Observable<any> {
    return this.http.get(this.getUsersUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    )
  }

  getUserCompaniesByAccountId(id: any): Observable<any> {
    return this.http.get(this.getUserCompaniesByAccountIdUrl + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }



  getUserRoles(): Observable<any> {
    return this.http.get(this.getUserRolesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addUser(data: any): Observable<any> {
    return this.http.post(this.addUserUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getUserByEmail(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getUserByEmailUrl + "?IsGetLog=true", { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  unlockUser(email: any): Observable<any> {
    const data = {
      userName: email
    };

    return this.http.post(this.unlockUserUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  editUser(data?: any): Observable<any> {
    return this.http.put(this.editUserUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  assumeIdentity(email: any): Observable<any> {
    return this.http.post(this.assumeIdentityUrl + email, null);
  }

  getAllContacts(): Observable<any> {
    return this.http.get(this.getContactsUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getcontacttypes(): Observable<any> {
    return this.http.get(this.getcustomercontacttypes).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  verifyUser(email: any): Observable<any> {
    const data = {
      userName: email
    };

    return this.http.post(this.verifyUserUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  emailVerficiationSend(email: any): Observable<any> {
    const data = {
      userName: email
    };

    return this.http.post(this.emailVerificationUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getCountryByCustomerId(customerId: any): Observable<any> {
    return this.http.get(this.getCountryByCustomerIdUrl + customerId).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getStateByCustomerCountry(customerId: any, countryId: any): Observable<any> {
    return this.http.get(this.getStateByCustomerCountryUrl + customerId + '/' + countryId).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getLocationByCustomerState(customerId: any, countryId: any, stateId: any): Observable<any> {
    return this.http.get(this.getLocationByCustomerStateUrl + customerId + '/' + countryId + '/' + stateId).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getAllStateLocationsByCustomerId(customerId: any, countryId: any): Observable<any> {
    return this.http.get(this.getAllStateLocationsByCustomerIdUrl + customerId + '/' + countryId).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  addContact(data: any): Observable<any> {
    return this.http.post(this.addContactUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  editContact(id: string, data: any): Observable<any> {
    return this.http.put(this.editContactUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getContactDataById(id: any): Observable<any> {
    return this.http.get(this.getContactsByIdUrl + id + "/details").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getLoggedinUserInfo(): Observable<any> {
    return this.http.get(this.getLoggedinUserInfoUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  userResetPwd(data: any): any {
    return this.http.post(this.userResetPwdUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  uploadProfileImage(data: any): Observable<any> {
    return this.http.post<any>(this.uploadProfileImageUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addAccount(data: any): Observable<any> {
    return this.http.post(this.addAccountUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  saveTEM(data: any): Observable<any> {
    return this.http.post<any>(this.saveTemUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateTEM(id: any, data: any): Observable<any> {
    return this.http.put<any>(this.updateTemUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getTemAccountById(id: any): Observable<any> {
    return this.http.get(this.getTEMAccountByIdUrl + id + "/details").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getAccountById(id: any): Observable<any> {
    return this.http.get(this.getAccountByIdUrl + id + "/details").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  updateAccount(id: any, data: any): Observable<any> {
    return this.http.put<any>(this.updateAccountUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getAPSystems(): Observable<any> {
    return this.http.get(this.getAPSystemsUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getAPSystemExportsBySystemId(id: any): Observable<any> {
    return this.http.get(this.getAPSystemExportsBySystemIdUrl + id + '/exporttypes').pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  saveCompany(data: any): Observable<any> {
    return this.http.post<any>(this.saveCompanyUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateCompany(id: any, data: any): Observable<any> {
    return this.http.put<any>(this.updateCompanyUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCompanyById(id: any): Observable<any> {
    return this.http.get(this.getCompanyByIdUrl + id + "/dtoDetails").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  addBillingAccount(data: any) {
    return this.http.post<any>(this.addBillingAccountUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  dataretrievalVatemplates(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.dataretrievalVatemplatesURL, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  dataretrievalVaImporttemplate(id: any, data: any): Observable<any> {
    return this.http.put(this.dataretrievalVaimporttemplateURL + id, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  editBillingAccount(value: any, Id: any) {
    return this.http.put<any>(this.addBillingAccountUrl + '/' + Id, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getBillingAccountsDetails(id: any): Observable<any> {
    return this.http.get(this.addBillingAccountUrl + '/' + id + "/Details").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getBillingAccountsSettingsDetails(id: any): Observable<any> {
    return this.http.get(this.addBillingAccountUrl + '/BillingSettings/' + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getRemitaddressesDD(): Observable<any> {
    return this.http.get(this.getaddRemitaddressesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getRemitaddressesGrid(value: any): Observable<any> {
    return this.http.post(this.getRemitaddressLoggedUrl, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getRemitaddressesExcelData(value: any): Observable<any> {
    return this.http.post(this.getRemitaddressLoggedUrl, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addRemitaddresses(data: any): Observable<any> {
    return this.http.post(this.addRemitaddressesUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  updateRemitaddresses(data: any, Id: any): Observable<any> {
    return this.http.put(this.addRemitaddressesUrl + '/' + Id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateautoApprovalSettings(value: any, Id: any): Observable<any> {
    return this.http.put<any>(this.addBillingAccountUrl + '/' + Id + "/AutoApprovalSettings/Save", value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateDataInvoiceRetrieval(value: any, Id: any): Observable<any> {
    return this.http.put<any>(this.addBillingAccountUrl + '/' + Id + "/DataInvoiceRetrieval/Save", value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getInvoiceRetrievalMethods(): Observable<any> {
    return this.http.get(this.getInvoiceRetrievalMethodsUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getNewInvoiceRetrievalMethods(): Observable<any> {
    return this.http.get(this.getInvoiceRetrievalMethodsUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getdataRetrievalSource(): Observable<any> {
    return this.http.get(this.getdataRetrievalSourceUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getDataretrievalFiletyperequiredvalue(): Observable<any> {
    return this.http.get(this.getDataretrievalFiletyperequiredvalueURL).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  dataRetrievalTemplateType(): Observable<any> {
    return this.http.get(this.dataRetrievalTemplateTypeURL).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getDataRetrievalProcessiongMethods(): Observable<any> {
    return this.http.get(this.getDataRetrievalProcessiongUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getAPResponsibleUsers(Id: any): Observable<any> {
    return this.http.get(this.getAPResponsibleUsersUrl + Id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getPaymenttypes(): Observable<any> {
    return this.http.get(this.getPaymenttypesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getPaymentmethods(): Observable<any> {
    return this.http.get(this.getPaymentmethodsUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  savePaymentSetting(value: any, Id: any): Observable<any> {
    return this.http.put<any>(this.addBillingAccountUrl + '/' + Id + "/Payment/Save", value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getCustomerVendorBillingAccounts(keys: any = ''): Observable<any> {
    return this.http.get(this.addBillingAccountUrl + '/CustomerVendor' + keys).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  mainBillingAccountsDD(keys: any = ''): Observable<any> {
    return this.http.get(this.mainBillingAccountsDDUrl + keys).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getCCRepo(data: any): Observable<any> {
    return this.http.post(this.CostCentersUrl + 'CCRepo/LoggedInUser', data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
 
  getCCRepoExcelData(data: any): Observable<any> {
    return this.http.post(this.CostCentersUrl + 'CCRepo/LoggedInUser', data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  updateCCRepoUsedUnused(data: any): Observable<any> {
    return this.http.put<any>(this.CostCentersUrl + 'CCRepo/UsedUnUsed', data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getCostCenters(value: any): Observable<any> {
    return this.http.post(this.CostCentersUrl + 'LoggedInUser', value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getCostCentersExcel(value: any): Observable<any> {
    return this.http.post(this.CostCentersUrl + 'LoggedInUser', value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  addCostCenter(data: any): Observable<any> {
    return this.http.post(this.CostCentersUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateCostCenter(id: string, data: any): Observable<any> {
    return this.http.put(this.CostCentersUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateCostCenterActiveInActive(data: any): Observable<any> {
    return this.http.put(this.CostCentersUrl + 'ActiveInActive', data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addChargeCodeGroups(data: any): Observable<any> {
    return this.http.post(this.chargeCodeGroupsUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargeCodeGroupsDetails(id: string): Observable<any> {
    return this.http.get(this.chargeCodeGroupsUrl + 'GroupId/' + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  updateChargeCodeGroups(data: any, id: string): Observable<any> {
    return this.http.put(this.chargeCodeGroupsUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  importPeople(data: any, jsonData: { fileType: string; AccountId: string; }): Observable<any> {
    return this.http.post(this.importPeopleUrl + '?fileType=' + jsonData.fileType + '&accountId=' + jsonData.AccountId, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  exportPeople(AccountId: string): Observable<any> {
    return this.http.post(this.exportPeopleUrl + '?customerAccountId=' + AccountId, {}, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getImportcontacTempDownload(): Observable<any> {
    return this.http.get(this.baseUrl + 'template/people', { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  
  lockUser(email: any): Observable<any> {
    const data = {
      userName: email,
    };

    return this.http.post(this.lockUserUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  setGroupActiveInactiveUrl(id: any, type: any, vpId: any): Observable<any> {

    let key = `?Status=${type}`;
    if (vpId !== undefined) {
      key = key + `&groupXVendorProductTypeId=${vpId}`;
    }
   
    return this.http.put(this.urlTools.addDynamicURL(this.groupActiveInactiveUrl + key, { id: id }), '').pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  setContactsPrimaryLocation(contactId: string, LocationId: string): Observable<any> {
    return this.http.put(this.setContactsPrimaryLocationUrl + contactId + '/' + LocationId, '').pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getAllCustomerUrl(value: any): any {
    return this.http.post(this.urlTools.addDynamicURL(api_list.Organisation.Cusotmer.Grid), value).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }
  getAllCustomerExportUrl(value: any): any {
    return this.http.post(this.urlTools.addDynamicURL(api_list.Organisation.Cusotmer.Grid), value, { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    );
  }
  getAllCompanysUrl(value: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(api_list.Organisation.Company.Grid), value).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }
  getCompanyExportUrl(value: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(api_list.Organisation.Company.Grid), value, { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getAllTemaccountUrl(data: any): Observable<any> {
    return this.http.post(this.getTemAccounts, data).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getTemExcelData(data: any): Observable<any> {
    return this.http.post(this.getTemAccounts, data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getTemusers(data: any): Observable<any> {
    return this.http.post(this.getTemuser, data).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getTemUserExcelData(data: any): Observable<any> {
    return this.http.post(this.getTemuser, data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }


  getProducts(value: any): Observable<any> {
    return this.http.post(this.getProductUrl, value).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getProductsExcelData(value: any): Observable<any> {
    return this.http.post(this.getProductUrl, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getChargecodes(): Observable<any> {
    return this.http.get(this.getChargecodeUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }
  getChargecodesLogged(data: any): Observable<any> {
    return this.http.post(this.getChargecodeLoggedUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }
  getChargecodesExcelData(data: any): Observable<any> {
    return this.http.post(this.getChargecodeLoggedUrl, data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getChargeCodetypeLogged(value: any): Observable<any> {
    return this.http.post(this.getChargeCodetypeLoggedUrl, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargeCodetypeExcel(value: any): Observable<any> {
    return this.http.post(this.getChargeCodetypeLoggedUrl, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendorProducts(): Observable<any> {
    return this.http.get(this.getVendorProductUrl).pipe(

      catchError((err) => {

        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }


  getVendorProductLogged(data: any) {
    return this.http.post(this.getVendorProductLoggedUrl, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendorProductExcelData(data: any) {
    return this.http.post(this.getVendorProductLoggedUrl, data, { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendors(value: any): Observable<any> {
    return this.http.post(this.getVendorUrl, value).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getDataretrievalData(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getDataretrieval, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getRequiredDR(): Observable<any> {
    return this.http.get(this.getRequiredUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getFileTypeDR(): Observable<any> {
    return this.http.get(this.getFileTypeUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  downloadBlankTemplate(queryParams?: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.downloadBlankTemplateUrl), { params: queryParams, responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  downloadExistingTemplate(id: any): Observable<any> {
    return this.http.get((this.urlTools.addDynamicURL(this.downloadtemplateURL, { id: id })), { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getdataRetrievalMethods(): Observable<any> {
    return this.http.get(this.getdataRetrievalMethodsUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  saveDataRetrieval(data: any): Observable<any> {
    return this.http.post(this.saveDataRetrievalUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getFileMonitoring(data: any): Observable<any> {
    return this.http.post(this.getFileMonitoringUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getFileMonitoringExcel(data: any): Observable<any> {
    return this.http.post(this.getFileMonitoringUrl, data, { responseType: 'blob' });
  }

  getVendorExportData(value: any): Observable<any> {
    return this.http.post(this.getVendorUrl, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  getVendorUsers(): Observable<any> {
    return this.http.get(this.getVendorUsersUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  addVendor(data: any): Observable<any> {
    return this.http.post(this.addVendorUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  geVendorById(id: any): Observable<any> {
    return this.http.get(this.getVendorByIdUrl + id + "/details").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }



  updateVendor(id: any, data: any): Observable<any> {
    return this.http.put<any>(this.updateVendorUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getMapForOtherUsers(): Observable<any> {
    return this.http.get(this.getMapForOtherUsersUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getMapForTemUsers(params: any): Observable<any> {
    return this.http.get(this.getMapForTemUsersUrl, { params }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getIndustries(): Observable<any> {
    return this.http.get(this.getIndustriesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getServices(): Observable<any> {
    return this.http.get(this.getServicesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductsLoggedData(value: any): Observable<any> {
    return this.http.post(this.getProductsLoggedUrl, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductsExportData(value: any): Observable<any> {
    return this.http.post(this.getProductsLoggedUrl, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getServicesLoggedUrlData(value: any): Observable<any> {
    return this.http.post(this.getServicesLoggedUrl, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getServiceExcelData(value: any): Observable<any> {
    return this.http.post(this.getServicesLoggedUrl, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getServiceTypes(): Observable<any> {
    return this.http.get(this.getServiceTypesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getServiceTypeattributes(): Observable<any> {
    return this.http.get(this.getServiceTypeattributesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  addServiceTypeattributes(data: any): Observable<any> {
    return this.http.post(this.getServiceTypeattributesUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductsForVendor(): Observable<any> {
    return this.http.get(this.getProductsUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductStructure(): Observable<any> {
    return this.http.get(this.getProductStructureUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getBillingAccount(data: any): Observable<any> {
    return this.http.post(this.getBillingAccountUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getBillingAccountExcel(data: any): Observable<any> {
    return this.http.post(this.billingaccountsLoggedURL, data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getProductTypes(bool = false): Observable<any> {
    const key = '?GetAll=' + bool;
    return this.http.get(this.urlTools.addDynamicURL(this.getProductTypesUrl + key, {})).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductTypeLoggedData(value: any): Observable<any> {
    return this.http.post(this.getProductTypesLoggedIn, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductTypeExcelData(value: any): Observable<any> {
    return this.http.post(this.getProductTypesLoggedIn, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getServicesTypesLoggedData(value: any): Observable<any> {
    return this.http.post(this.getServicesTypesLoggedIn, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getServicesTypesExcelData(value: any): Observable<any> {
    return this.http.post(this.getServicesTypesLoggedIn, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductTypeUrlDropDowns(): Observable<any> {
    return this.http.get(this.getProductTypeUrlDropDown).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductmapp(): Observable<any> {
    return this.http.get(this.getproductmapp).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addProduct(data: any): Observable<any> {
    return this.http.post(this.addProductUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getProductById(id: any): Observable<any> {
    return this.http.get(this.getProductByIdUrl + id + "/details").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateProduct(id: any, data: any): Observable<any> {
    return this.http.put(this.updateProductByIdUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addVendorProduct(data: any): Observable<any> {
    return this.http.post(this.addVendorProductUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendorProductById(id: any): Observable<any> {
    return this.http.get(this.getVendorProductByIdUrl + id + "/details").pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateVendorProduct(id: any, data: any): Observable<any> {
    return this.http.put(this.updateVendorProductByIdUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addIndustry(data: any): Observable<any> {
    return this.http.post(this.addIndustryUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addService(data: any): Observable<any> {
    return this.http.post(this.addServiceUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addServiceType(data: any): Observable<any> {
    return this.http.post(this.addServiceTypeUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addProductData(data: any): Observable<any> {
    return this.http.post(this.addProductDataUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addProductType(data: any): Observable<any> {
    return this.http.post(this.addProductTypeUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateIndustry(id: any, data: any): Observable<any> {
    return this.http.put(this.updateIndustryUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getIndustryLogged(value: any): Observable<any> {
    return this.http.post(this.getIndustryLoggedUrl, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getIndustryExcelData(value: any): Observable<any> {
    return this.http.post(this.getIndustryLoggedUrl, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateService(id: any, data: any): Observable<any> {
    return this.http.put(this.updateServiceUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateServiceType(id: any, data: any): Observable<any> {
    return this.http.put(this.updateServiceTypeUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateProductData(id: any, data: any): Observable<any> {
    return this.http.put(this.updateProductDataUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateProductType(id: any, data: any): Observable<any> {
    return this.http.put(this.updateProductTypeUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  addVendorBillingAlias(data: any) {
    return this.http.post(this.getVendorBillingAliasUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getVendorBillingAliasList(value: any): Observable<any> {
    return this.http.post(this.getVendorBillingAliasUrl + 'LoggedInUser', value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getVendorBillingAliasExportData(value: any): Observable<any> {
    return this.http.post(this.getVendorBillingAliasUrl + 'LoggedInUser', value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getVendorBillingAlias(id: any): Observable<any> {
    return this.http.get(this.getVendorBillingAliasUrl + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getVendorBillingAliasDetails(id: string): Observable<any> {
    return this.http.get(this.getVendorBillingAliasUrl + id + '/details').pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  updateVendorBillingAlias(id: any, data: any): Observable<any> {
    return this.http.put(this.getVendorBillingAliasUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  dataretrievalBaimporttemplate(id: any, data: any): Observable<any> {
    return this.http.put(this.dataretrievalBaimporttemplateUrl + '/' + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getChargeCodeLogged(value: any): Observable<any> {
    return this.http.post(this.getChargeCodeTypeLoggedUrl, value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getChargeCodeExcelData(value: any): Observable<any> {
    return this.http.post(this.getChargeCodeTypeLoggedUrl, value, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getChargeCodeTypes(queryParams ?: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getChargeCodeTypeUrl), queryParams ? this.urlTools.addQueryParams(queryParams) : {}).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargeCodeOccurrence(): Observable<any> {
    return this.http.get(this.getChargeCodeOccurrenceUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateChageCode(id: any, data: any): Observable<any> {
    return this.http.put(this.addChargeCodeUrl + '/' + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getTaxRegulatoryTypes(id: any, queryParams ?: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getTaxRegulatoryTypesUrl + id), queryParams ? this.urlTools.addQueryParams(queryParams) : {}).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargeCodeOrigins(): Observable<any> {
    return this.http.get(this.getChargeCodeOriginsUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addChargeCode(data: any, isMultipleCreate = false): Observable<any> {

    if (isMultipleCreate) {
      return this.http.post(this.addChargeCodeBulkUrl, data).pipe(
  
        catchError((err) => {
          this.tokenExpired(err)
          return throwError(err);
        })
      );
    } else {

      return this.http.post(this.addChargeCodeUrl, data).pipe(
  
        catchError((err) => {
          this.tokenExpired(err)
          return throwError(err);
        })
      );
    }
  }

  getChargeType(): Observable<any> {
    return this.http.get(this.getChargeTypeUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  addChargeCodeType(data: any): Observable<any> {
    return this.http.post(this.addChargeCodeTypeUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addChargeType(data: any): Observable<any> {
    return this.http.post(this.addChargeTypeUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateChargeType(id: any, data: any): Observable<any> {
    return this.http.put(this.updateChargeTypeUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  ccrepoUsedUnUsed(data: any): Observable<any> {
    return this.http.put(this.ccrepoUsedUnUsedURL, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getChargeCodeDetails(id: any): Observable<any> {
    return this.http.get(this.addChargeCodeUrl + '/' + id + '/details').pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  updateChargeCodeType(id: any, data: any): Observable<any> {
    return this.http.put(this.updateChargeCodeTypeUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateGPSLocation(id: any, data: AnimationStyleMetadata): Observable<any> {
    return this.http.put(this.updateGPSLocationUrl + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInvoiceRetrieval(months: any, data: any): Observable<any> {
    return this.http.post(this.InvoicesUrl + months + '/InvoiceRetrievalData', data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInvoiceRetrievalExcel(months: any, data: any): Observable<any> {
    return this.http.post(this.InvoicesUrl + months + '/InvoiceRetrievalData', data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addInvoiceRetrieval(data: any): Observable<any> {
    return this.http.post(this.InvoicesUrl + 'InvoiceRetrieval/Create', data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  invoiceRetrievalDeactive(id: any): Observable<any> {
    return this.http.put(this.InvoicesUrl + 'InvoiceRetrieval/Deactivate/' + id, {}).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addAttributes(data: any): Observable<any> {
    return this.http.post(this.attributesUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getVendorxindustries() {
    return this.http.get(this.vendorxindustriesUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getTemLists(): Observable<any> {
    return this.http.get(this.getTEMForUserUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getTEMLoggedInUserDropDown(): Observable<any> {
    return this.http.get(this.getTEMLoggedInUserDropDownURL).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getContactLogs(id: string): Observable<any> {
    return this.http.get(this.getContactLogsUrl + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getAllCustomerListByTEMId(temid: string): Observable<any> {
    return this.http.get(this.getCustomersListByTEMId + temid).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getAllCompanyListByTEMId(temid: string): Observable<any> {
    return this.http.get(this.getCompanysListByTEMId + temid).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getAllContactListByTEMId(temid: string): Observable<any> {
    return this.http.get(this.getContactsListByTEMId + temid + "/ContactsDetails").pipe(

      catchError((err) => {
        if (err && err.status === 404) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Not found any contact that is assigned to selected TEM'
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        } else if (err && err.status === 401) {
          this.tokenExpired(err);
        }
        return throwError(err);
      })
    )
  }

  getAllCustomerUsersListByTEMId(temid: string): Observable<any> {
    return this.http.get(this.getCustomerUsersListByTEMId + temid).pipe(

      catchError((err) => {
        if (err && err.status === 404) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Not found any user that is assigned to selected TEM'
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        }
        else if (err && err.status === 401) {
          this.tokenExpired(err);
        }
        return throwError(err);
      })
    )
  }

  getAllLocationListByTEMId(temAccountId: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getLocationListByTEMId, { temAccountId: temAccountId })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getAllVendorListByTEMId(temid: string): Observable<any> {
    return this.http.get(this.getVendorListByTEMId + temid + "/VendorAccountDetails").pipe(

      catchError((err) => {
        if (err && err.status === 404) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Not found any vendor that is assigned to selected TEM'
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        }
        else if (err && err.status === 401) {
          this.tokenExpired(err);
        }
        return throwError(err);
      })
    )
  }

  getAllVendorUserListByTEMId(temid: string): Observable<any> {
    return this.http.get(this.getVendorUserListByTEMId + temid + "/VendorUsersDetails").pipe(

      catchError((err) => {
        if (err && err.status === 404) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Not found any vendor user that is assigned to selected TEM'
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        }
        else if (err && err.status === 401) {
          this.tokenExpired(err);
        }
        return throwError(err);
      })
    )
  }

  getAllProductsListByTEMId(temid: string): Observable<any> {
    return this.http.get(this.getProductsListByTEMId + temid).pipe(

      catchError((err) => {
        if (err && err.status === 404) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'No any Product found under this account'
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
        }
        else if (err && err.status === 401) {
          this.tokenExpired(err);
        }
        return throwError(err);
      })
    )
  }

  getproductStructureDetail(data: any): Observable<any> {
    return this.http.post(this.productStructureDetail, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getServicesList(data: any): Observable<any> {
    return this.http.post(this.getServiceslist, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getServiceTypeList(data: any): Observable<any> {
    return this.http.post(this.getServiceTypelist, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getProductList(data: any): Observable<any> {
    return this.http.post(this.getProductlist, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getProductTypeList(data: any): Observable<any> {
    return this.http.post(this.getProductTypelist, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendorProductTypeList(data: any): Observable<any> {
    return this.http.post(this.getVendorProductTypelist, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  isDisableTemDD() {
    if (this.isUserCustomerAdmin() || this.isUserCompanyAdmin() || this.isUserCompanyManager() || this.isUserCompanyUser()) {
      return true;
    } else {
      return false;
    }
  }

  isUserVendor() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'VendorUser'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserCustomerAdmin() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'CustomerAdmin'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserCompanyAdmin() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'CompanyAdmin'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserCompanyManager() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'CompanyManager'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserCompanyUser() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'CompanyUser'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }


  isUserHasTEMRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return (o == 'SuperTEM' || o == 'TEMAdmin' || o == 'TEMUser' || o === 'TEMManager'); });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasSuperTEMRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'SuperTEM'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasSuperTEMOrAdminRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'SuperTEM' || o == 'TEMAdmin'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasTEMAdminRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'TEMAdmin'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasTEMManagerOrUserRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o == 'TEMUser' || o === 'TEMManager'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasTEMManagerRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o === 'TEMManager'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasTEMUserRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o === 'TEMUser'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasTEMUsersRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o === 'TEMAdmin' || o === 'TEMManager' || o === 'TEMUser'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasSuperTEMUsersRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o === 'SuperTEMAdmin' || o === 'SuperTEMManager' || o === 'SuperTEMUser'; });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasSuperTEMAdminRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o === 'SuperTEMAdmin' });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasSuperTEMManagerRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o === 'SuperTEMManager' });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isUserHasSuperTEMUserRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return o === 'SuperTEMUser' });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  isuserHasInAllTEMRole() {
    const roles: any = this.sessionStorageService.getObjectValue('userRoles') ? this.sessionStorageService.getObjectValue('userRoles') : this.localStorageService.getObjectValue('userRoles') ? this.localStorageService.getObjectValue('userRoles') : [];
    const index = roles.findIndex((o: string) => { return (o == 'SuperTEMAdmin' || o == 'SuperTEMUser' || o == 'SuperTEMManager' || o == 'TEMAdmin' || o == 'TEMUser' || o === 'TEMManager'); });
    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  }

  getCustomerVendorBillingAccountFn(queryParams: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.customerVendorBillingAccountUrl), this.urlTools.addQueryParams(queryParams)).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getSubBillingAccounts(billingAccountHierarchyId: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.SubBillingAccounts, { billingAccountHierarchyId: billingAccountHierarchyId }), {}).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getphonenumberrequirements(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.phonenumberrequirements, {})).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getphonenumberrequirementsCountry(countryId: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.phonenumberrequirementsCountry, { countryId: countryId })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getphonenumberrequirementsID(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.phonenumberrequirementsID, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getServicetypesWithId(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.servicetypesUrl, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getProducttypesUrlNew(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.producttypesUrlNew, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getphonenumberrequirementsIDDetail(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.phonenumberrequirementsIDDetail, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getservicetypes(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.servicetypes, {})).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getproducttypes(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.producttypes, {})).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInventories(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.inventories, {})).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  saveInventories(Id: any, value: any): Observable<any> {
    return this.http.put(this.urlTools.addDynamicURL(this.saveInventoriesURL, { Id: Id }), value).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getvendorproducttypes(queryParams: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorproducttypes, {}), this.urlTools.addQueryParams(queryParams)).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCompanylocationsURL(params: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(api_list.Location.Location.Grid, {}), params).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCompanylocationsExportData(params: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(api_list.Location.Location.Grid), params, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInventorystatuses(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.inventorystatuses, {})).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVoiceTable(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getVoiceTableURL, {})).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendorDropdown(Parent = false, CustomerAccountId = ''): Observable<any> {
    let key = `?Parent=${Parent}`;
    if (CustomerAccountId !== '') {
      key = key + `&CustomerAccountId=${CustomerAccountId}`;
    }
    return this.http.get(this.urlTools.addDynamicURL(this.vendorDropdownURL + key, {})).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getCompanylocationDetailsURL(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.companylocationdetailsURL, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCostcentersCCRepoTemAccount(Id: any, data?: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.costcentersCCRepoTemAccountURL, { Id: Id }), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getCostcentersTemAccountURL(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.costcentersTemAccountURL, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInvoiceRetrievalWithID(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getInvoiceRetrievalUrl, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInvoiceRetrievalData(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getInvoiceRetrievalDataUrl, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getDataRetrievalFiles(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getDataRetrievalFilesUrl, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInvoiceRetrievalNotes(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getInvoiceRetrievalNotesUrl, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  saveInvoiceRetrievalNotes(data: any): Observable<any> {
    return this.http.post(this.saveInvoiceRetrievalNotesUrl, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  uploadInvoiceAttachment(id: any, data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.uploadAttachmentURL, { id: id }), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  downloadInvoiceAttachment(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.DownloadInvoiceAttachmentURL, { id: id }), { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  InvoiceRetrievalIDetails(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getInvoiceRetrievalDataUrl, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  InvoiceRetrievalDataRetrievalFiles(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getDataRetrievalFilesUrl, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err);
        return throwError(err);
      })
    )
  }

  terminateInvoiceRetrieval(id: any, isInactive?: any): Observable<any> {
    if (isInactive) {
      let params = new HttpParams().set('inactivePayableAccount', isInactive)
      return this.http.put(this.urlTools.addDynamicURL(this.terminateInvoiceRetrievalUrl + '?inactivePayableAccount=' + isInactive, { id: id }), {}).pipe(
        catchError((err) => {
          this.tokenExpired(err)
          return throwError(err);
        })
      );
    } else {
      return this.http.put(this.urlTools.addDynamicURL(this.terminateInvoiceRetrievalUrl, { id: id }), {}).pipe(
        catchError((err) => {
          this.tokenExpired(err)
          return throwError(err);
        })
      );
    }
  }

  getChargeCodedetails(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getChargeCodedetailsURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargeCodeGroupDetails(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getChargeCodeGroupDetailsURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getChargeCodeGroupDetail(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getChargeCodeGroupDetailURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargeCodeDetailNew(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getChargeCodeGroupDetailURLNew, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargecodesHierarchy(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getchargecodesHierarchyUrl, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendorProductTypesVendorAccountId(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorProductTypesVendorAccountIdURL, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendorproducttypesChangeLogs(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorproducttypesChangeLogsUrl, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  chargecodesChangeLog(id: any, data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.chargecodesChangeLogUrl, { id: id }), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendorProductTypesVendorId(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorProductTypesVendorIdURL, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendorProductTypesDetails(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorProductTypesDetailsURL, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendorProductTypesDetailsPOST(id: any, data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.vendorProductTypesDetailsURL, { id: id }), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  VendorAccountChargeCode(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.VendorAccountChargeCodeURL, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  VendorAccountChargeCodeNew(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.VendorAccountChargeCodeURLNew, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendorProductTypesChargeCodeGroups(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorProductTypesChargeCodeGroupsURL, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInvoiceRetrievalWithTEM(months: any, temId: string): Observable<any> {
    return this.http.get(this.InvoicesUrl + months + '/InvoiceRetrieval/TEMAccount/' + temId).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInvoiceFetchDate(data?: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getInvoiceFetchDateUrl, {}), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  uploadAttachment(id?: any, data?: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.uploadAttachmentURL, { id: id }), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getServicesIndustry(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getServicesIndustryURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getProductStructureServicesIndustry(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getProductStructureServicesIndustryURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getServiceServicetypes(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getServiceServicetypesURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getProductStructureServiceServicetypes(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getProductStructureServiceServicetypesURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductsServiceType(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getProductsServiceTypeURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProductStructureProductsServiceType(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getProductStructureProductsServiceTypeURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getProducttypes(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getProducttypesURL, { id: id })).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  DownloadInvoiceAttachment(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.DownloadInvoiceAttachmentURL, { id: id }), { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  invoiceRetrievalUpdate(id: any, data: any): Observable<any> {
    return this.http.put(this.urlTools.addDynamicURL(this.UpdateInvoiceRetrieval, { id: id }), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  removeInvoiceAttachment(id: any): Observable<any> {
    return this.http.delete(this.urlTools.addDynamicURL(this.removeInvoiceAttachmentURL, { id: id }),).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendorAccountDropdown(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorAccountDropdownURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCustomersForUser(): Observable<any> {
    return this.http.get(this.getCustomerForUserUrl).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  
  getCustomerDropDown(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getCustomerDropDownUrl)).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCustomerDropdownByTEM(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.customerDropdownByTEMURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getCustomerDropdownByNewTEM(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.customerDropdownByTemNewURL, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendorProductChargeCodeGroups(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.vendorProductChargeCodeGroupsUrl), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendorProductChargeCodeGroupsExcel(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.vendorProductChargeCodeGroupsUrl), data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  IsAnyPayableBillingAccount(KeyString: string): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.IsAnyPayableBillingAccountUrl + KeyString)).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  mainBillingAccountDD(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.mainBillingAccountDDUrl)).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  expectedinvoicestatuses(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.expectedinvoicestatusesURL)).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  vendoraccountsDetailWithId(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendoraccountsDetailWithIdURL, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  billingTEMAccountsWise(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.billingTEMAccountsWiseUrl, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getDataretrievalBatemplates(vId: any, bId: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getDataretrievalBatemplatesURL, { vId: vId, bId: bId })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getContactsDetails(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getContactsDetailsURL, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  updateCompanyLocationContacts(Id: any, data: any): Observable<any> {

    return this.http.put(this.urlTools.addDynamicURL(this.updateCompanyLocationContactsURL, { Id: Id }), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getInventorystatusesCode(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.inventorystatusesCode)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendorproductinventoryorigins(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorproductinventoryorigins)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getVendorproductinventoryoriginsName(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorproductinventoryoriginsName)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addInventories(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.inventories), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getContactList(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.contactUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getPeopleNotes(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getPeoplenotesUrl), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  savePeopleNotes(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.savePeopleNotesUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  downloadPeopleNote(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.downloadPeopleNotesUrl, { Id: Id }), { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  makePeopleNotesStatusActive(data: any): Observable<any> {
    return this.http.put(this.makePeopleNotesStatusActiveUrl, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLocationnotes(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getLocationnotesUrl), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  saveLocationNotes(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.saveLocationNotesUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  saveAccountNotes(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.saveAccountNotesUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getbillingAccountNotes(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getbillingAccountNotesUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  downloadBillingAccountNotes(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.downloadNoteAttachmentForAccount, { Id: Id }), { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  accountNoteStatus(value: any): Observable<any> {
    return this.http.put(this.changeAccountNoteStatusUrl, value);
  }

  makeLocationNotesStatusActive(data: any): Observable<any> {
    return this.http.put(this.makeLocationNotesStatusActiveUrl, data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  downloadLocationNotes(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.downloadLocationNotesUrl, { Id: Id }), { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getPeopleList(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.peopleUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getExportPeopleData(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.peopleUrl), data, { responseType: 'blob' }).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getManagerList(queryParams: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.peopleManagerUrl, queryParams), this.urlTools.addQueryParams(queryParams)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  addPeople(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.addPeopleUrl), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  billingaccountsLogged(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.billingaccountsLoggedURL), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargeCodeGrouplogs(Id: any) {
    return this.http.post(this.urlTools.addDynamicURL(this.chargecodegroupsChangeLogsURL, { Id: Id }), {});
  }

  updatePeople(id: string, data: any): Observable<any> {
    return this.http.put(this.urlTools.addDynamicURL(this.updatePeopleUrl) + id, data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLocationByCustomer(id: string): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getLocationByCustomerUrl) + id).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getBillingPeroidForUser(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getBillingPeroidForUserUrl) ).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getLocationPeople(id: any, data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getLocationPeopleUrl, { id: id }), data).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }


  getLocationPeopleExport(id: any, data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.getLocationPeopleUrl, { id: id }), data, { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getPeopleDetail(id: string): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.addPeopleUrl) + '/' + id + '/details').pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getManagerByPeople(KeyString: string, queryParams: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.peopleManagerUrl + KeyString), this.urlTools.addQueryParams(queryParams)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getChargeCodeAssignment(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getChargeCodeAssignmentUrl, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getDataretrievalBatemplatesId(id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getDataretrievalBatemplatesIdUrl, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  vendorDetailGet(BId: any, VId: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.vendorDetailGetURL, { BId: BId, VId: VId })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  DownloadFiles(Id: any, data: string): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.DownloadFilesURL + data, { Id: Id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  DownloadFilesNewAPI(Id: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.DownloadNewAPIFilesURL, { Id: Id }), { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  InvoiceRetrievalDownloadFile(expectedInvoiceId: any, importFileNameId: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.InvoiceRetrievalDownloadFileURL, { expectedInvoiceId: expectedInvoiceId, importFileNameId: importFileNameId }), { responseType: 'blob' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getTemCompany(queryParams: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getCompanyByTem, queryParams), this.urlTools.addQueryParams(queryParams)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getAllCompany(): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getCompanyByTem)).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
  getGL_Jobref(id: any, ComapnyId: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.getGL_Jobrefurl + 'GLandJobRefNumberDropDown?ComapnyId=' + ComapnyId, { id: id })).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );

    
  }

  copyChargeCodeData(data: any): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.copyChargeCode), data).pipe(
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  ReconAssigments() {
    return this.http.get(this.urlTools.addDynamicURL(this.reconAssigments));
  }
  getReports() {
    return this.http.get(this.urlTools.addDynamicURL(this.getReportsURL));
  }
  getInvoicePreiod() {
    return this.http.get(this.urlTools.addDynamicURL(this.getInvoicePreiodURL));
  }
  getInvoicePeriod(queryParams: string) {
    return this.http.get(this.urlTools.addDynamicURL(this.getInvoicePeriodURL + queryParams,));
  }

  getDownloadReport(Id: any, data: any) {
    return this.http.post(this.urlTools.addDynamicURL(this.getDownloadReportURL, { Id: Id }), data, { responseType: 'blob', observe: 'response' });
  }
  reportsInvoiceMonths(data: any) {
    return this.http.post(this.urlTools.addDynamicURL(this.reportsInvoiceMonthsURL), data);
  }

  openSSO(): Observable<any> {
    return this.http.post(this.urlTools.addDynamicURL(this.SAMLSSOURL), {}, { responseType: 'text' }).pipe(

      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  getBillingAccountStatus() {
    return this.http.get(this.urlTools.addDynamicURL(this.billingAccountStatus));
  }

  getProcessBillingData(queryParams: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.processBillingData), this.urlTools.addQueryParams(queryParams));
  }

  getCustomerChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.customerChangelogUrl, { Id: Id }));
  }

  getCompanyChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.companyChangelogUrl, { Id: Id }));
  }

  getAccountChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.billingaccountsChangelogUrl, { Id: Id }));
  }

  getCostCenterChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.costcenterChangelogUrl, { Id: Id }));
  }

  getCCSChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.costCenterStructureChangelogUrl, { Id: Id }));
  }

  getPeopleChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.peopleChangelogUrl, { Id: Id }));
  }

  getWirelineMobileChangelogs(inventoryId: any, child = false) {
    return this.http.get(this.urlTools.addDynamicURL(this.getWirelineMobileChangelogsURL, { inventoryId: inventoryId, child: child }));
  }

  getUserChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.temUserChangelogUrl, { Id: Id }));
  }

  getInvoiceRetrievalChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.invoiceRetrievalChangelogUrl, { Id: Id }));
  }

  getLocationChangelogs(Id: any) {
    return this.http.get(this.urlTools.addDynamicURL(this.locationChangelogUrl, { Id: Id }));
  }

  getStatusValue() {
    return this.statusValue.getValue();
  }

  setStatusValue(value: string | null) {
    this.statusValue.next(value);
  }

  getStepData() {
    return this.stepData.getValue();
  }

  setStepData(value: string | null) {
    this.stepData.next(value);
  }

  getReplacedData() {
    return this.replacedData.getValue();
  }

  setReplacedData(value: string | null) {
    this.replacedData.next(value);
  }

  getPadding() {
    return this.setPaddingClass.getValue();
  }

  setPadding(value: string | null) {
    this.setPaddingClass.next(value);
  }

  getAccountsNoteValue() {
    return this.accNotesValue.getValue();
  }

  setAccountsNoteValue(value: string | null) {
    this.accNotesValue.next(value);
  }

  getCCImportGrid(): Observable<any> {
    return this.http.get(this.getCCImportUrl).pipe(
 
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }

  uploadCCFile( cId?: any, data?: FormData): Observable<any> {
 
    let uploadCCFileUrlI = this.uploadCCFileUrl+'?accountId='+cId;
    return this.http.post(this.urlTools.addDynamicURL(uploadCCFileUrlI, {} ), data).pipe(
 
      catchError((err) => {
        this.tokenExpired(err)
        return throwError(err);
      })
    );
  }
 
  getCCblanktemplate() {
    return this.http.get(this.urlTools.addDynamicURL(this.getCCblanktemplateUrl), { responseType: 'blob', observe: 'response' });
  }
  
  downloadCCFile(fileId: any,accountId: any): Observable<any> {
    return this.http.get(this.urlTools.addDynamicURL(this.downloadCCFileUrl, { fileId: fileId , accountId: accountId}), { responseType: 'blob', observe: 'response'});
  }

}