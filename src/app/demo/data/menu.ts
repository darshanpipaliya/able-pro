// type
import { Navigation } from 'src/app/@theme/types/navigation';
import { Role } from 'src/app/@theme/types/role';

export const menus: Navigation[] = [
  {
    id: 'navigation',
    title: '',
    type: 'group',
    icon: 'feather icon-monitor',
    url: '/dashboard/home',
    children: [
      {
        id: 'home',
        title: 'Home',
        type: 'item',
        icon: 'fa fa-home',
        url: '/dashboard/home',
        role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin', 'VendorUser', 'TEMAdmin', 'TEMManager', 'TEMUser'],
      },
      {
        id: 'accounts',
        title: 'My Organization',
        type: 'collapse',
        icon: 'fa fa-layer-group',
        role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager', 'CompanyUser', 'VendorUser','TEMAdmin', 'TEMManager', 'TEMUser'],
        children: [
          {
            id: 'organization',
            title: 'Organization',
            type: 'item',
            url: '/organization/customer',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager', 'VendorUser','TEMAdmin', 'TEMManager', 'TEMUser']
          },
          {
            id: 'locations',
            title: 'Locations',
            type: 'item',
            url: '/locations',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager','VendorUser','TEMAdmin', 'TEMManager', 'TEMUser']
          },
          {
            //id: 'peoples',
            id: 'PeoContacts',
            title: 'People',
            // type: 'collapse',
            type: 'item',
            url: '/people/users',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager', 'CompanyUser','TEMAdmin', 'TEMManager']
          },
          {
            id: 'vendors',
            title: 'Vendors',
            type: 'collapse',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin','CompanyAdmin', 'CompanyManager', 'VendorUser','TEMAdmin', 'TEMManager', 'TEMUser'],
            children: [
              {
                id: 'users',
                title: 'Vendors',
                type: 'item',
                url: '/vendors/vendors',
                role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin','CompanyAdmin', 'CompanyManager', 'VendorUser','TEMAdmin', 'TEMManager', 'TEMUser']
              },
              {
                id: 'vendors2',
                title: 'Contracts',
                type: 'item',
                url: '/organization/contracts',
                role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin','CompanyAdmin', 'CompanyManager', 'VendorUser','TEMAdmin', 'TEMManager', 'TEMUser']
              }
            ]
          },
          
        ]
      },
      {
        id: 'finances',
        title: 'Finances',
        type: 'collapse',
        icon: 'fa fa-dollar-sign',
        url: '/finances/dashboard',
        role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser','CompanyAdmin', 'CompanyManager', 'CustomerAdmin','TEMAdmin', 'TEMManager', 'TEMUser'],
        children: [
          {
            id: 'accounting',
            title: 'Accounts',
            type: 'item',
            url: '/finances/accounting',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin','CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser']
          },
          {
            id: 'financescostcenter',
            title: 'Cost Centers',
            type: 'item',
            url: '/finances/cost-centers',
            role: ['SuperTEMAdmin', 'SuperTEMManager','CustomerAdmin','CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser']
          },
         
          {
            id: 'invoices-main',
            title: 'Invoices',
            type: 'collapse',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin','TEMAdmin', 'TEMManager', 'TEMUser'],
            children: [
              {
                id: 'invoices',
                title: 'Invoices',
                type: 'item',
                url: '/invoices/invoice',
                role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser','TEMAdmin', 'TEMManager', 'TEMUser','CustomerAdmin','TEMAdmin', 'TEMManager', 'TEMUser']
              },
              {
                id: 'invoices',
                title: 'Invoices Retrievals',
                type: 'item',
                url: '/invoices/invoice-retrievals',
                role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser','TEMAdmin', 'TEMManager', 'TEMUser','CustomerAdmin','TEMAdmin', 'TEMManager', 'TEMUser']
              },
              
            ]
          },
        ]
      },
      {
        id: 'inventory',
        title: 'Inventory',
        type: 'collapse',
        icon: 'fa fa-tools',
        url: '/dashboard/inventory',
        role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin','CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser'],
        children: [
          {
            id: 'AllInventory',
            title: 'All Inventory',
            type: 'item',
            url: '/inventory/allinventory',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser']
          },
          {
            id: 'wireline',
            title: 'Wireline',
            type: 'item',
            url: '/inventory/wireline',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser']
          },
          {
            id: 'mobility',
            title: 'Mobility',
            type: 'item',
            url: '/inventory/mobility',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin','CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser']
          },
          {
            id: 'cloud',
            title: 'Cloud',
            type: 'item',
            url: '/inventory/cloud',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser']
          }
        ]
      },
      {
        id: 'analytics',
        title: 'Analytics',
        type: 'collapse',
        icon: 'fa fa-chart-bar',
        role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin','CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser'],
        children: [
          {
            id: 'reports',
            title: 'Reports',
            type: 'item',
            url: '/analytics/reports' ,
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'CustomerAdmin', 'CompanyAdmin', 'CompanyManager','TEMAdmin', 'TEMManager', 'TEMUser']
          }
        ]
      },
    
      {
        id: 'reconciliation',
        title: 'Reconciliation',
        type: 'collapse',
        icon: 'fa fa-smile',
        role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin','TEMAdmin', 'TEMManager', 'TEMUser'],
        children: [
          {
            id: 'reconciliationtem',
            title: 'Invoices',
            type: 'item',
            url: '/reconciliation/inventory',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'CustomerAdmin','TEMAdmin', 'TEMManager', 'TEMUser']
          },
          
        ]
      },
      {
        id: '',
        title: 'Administration',
        type: 'collapse',
        icon: 'fa fa-cog',
        role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'TEMAdmin', 'TEMManager'],
        children: [
          {
            id: '',
            title: 'TEM',
            type: 'item',
            url: '/management/tem',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'TEMAdmin', 'TEMManager']
          },
          {
            id: 'products',
            title: 'Products',
            type: 'collapse',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser'],
            children: [
              {
                id: 'administrationproducts',
                title: 'Products',
                type: 'item',
                url: '/management/products/products',
                role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']
              },
              {
                id: 'chargecode',
                title: 'Charge Type',
                type: 'item',
                url: '/management/products/charge-types',
                role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']
              }
            ]
          },
          {
            id: 'temProductsItem',
            title: 'Vendor Products',
            type: 'item',
            url: '/management/vendors/vendor-products',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']
          },
          {
            id: 'temInvoices',
            title: 'Invoices',
            type: 'collapse',
            role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser'],
            children: [
              {
                id: 'invoiceprocessing',
                title: 'Invoice Processing',
                type: 'item',
                url: '/invoices/invoice-retrieval',
                role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']
              },
              {
                id: 'invoiceprocessing',
                title: 'Distribution Rules',
                type: 'item',
                url: '/invoices/distribution-rule',
                role: ['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']
              },
            ]
          }
        ]
      },
 
    ]
  }
];
