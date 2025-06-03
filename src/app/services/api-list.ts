import { environment } from "../../../src/environments/environment";

const baseUrl = environment.base_url;

export const api_list = {
    "Organisation" : {
        "Company" : {
            "Grid" : baseUrl + 'companies/LoggedInUser',
        },
        "Cusotmer": {
            "Grid" : baseUrl + 'accounts/Customer/LoggedInUser'
        }      
    },
    "Location" : {
        "Location" : {
            "Grid" : baseUrl + 'companylocations/LoggedInUserData',
            "getLocationPeople" : baseUrl + 'companylocations/{id}/Peoples',
            "peoplesLoggedInUserData" : baseUrl + 'peoples/LoggedInUserData',
            "locationNotesLocation" : baseUrl + 'locationnotes/Location',
        }
    },
    "People" : {
        "People" : {
            "Grid" : baseUrl + 'peoples/LoggedInUserData',
        }
    },
    "Vendor" : {
        "Vendor" : {
            "Grid" : baseUrl + 'vendoraccounts/LoggedInUser',
            "dataretrievalTemplate" : baseUrl + 'dataretrieval/templates/{id}'
        },
        "BillingAlias" : {
            "Grid" : baseUrl + 'vendorbillingalias/LoggedInUser',
        }
    },
    "Contract" : {
        "Contract" : {
            "Grid" : baseUrl + 'contracts/LoggedInUser',
            "ContractDetail" : baseUrl + 'contracts/{ContractId}/{Type}',
        },
        "ReplaceContractGrid" : baseUrl + 'contracts/ReplaceContractGrid/{id}'
    },
    "Inventory": {
        "Grid": baseUrl + 'inventories/LoggedInUser',
        "GridData": baseUrl + 'inventories/LoggedInUserData',
        "SubBillingAccounts" : baseUrl + 'billingaccounts/SubBillingAccounts/{Id}',
        "inventoryorigins" : baseUrl + 'inventoryorigins',
        "inventoryoriginsName" : baseUrl + 'inventoryorigins/Name',
        "getServiceDetail" : baseUrl + 'vendorproductinventories/{Id}/details',
        "addServiceTypeAttributes" : baseUrl + 'inventoryattributes/VendorProductInventory/{Id}',
        "getServicetypeattributes" : baseUrl + 'servicetypeattributes/ServiceType/{Id}',
        "inventoryattributesAssign" : baseUrl + 'inventoryattributes/Assign',
        "inventorycontacts": baseUrl + 'inventorycontacts/VendorProductInventory',
        "inventorylocations": baseUrl + 'inventorylocations/VendorProductInventory',
        "inventorycontactsAssign": baseUrl + 'inventorycontacts/Assign',
        "inventorylocationsAssign": baseUrl + 'inventorylocations/Assign',
        "inventorynotes": baseUrl + 'inventorynotes/Inventory',
        "addInventoryNote": baseUrl + 'inventorynotes',
        "childinventories": baseUrl + 'childinventories/VendorProductInventory',
        "getchildInventoriesDetail": baseUrl + 'childinventories',
        "makeIndividual": baseUrl + 'childinventories/MakeIndividual',
        "updateParent": baseUrl + 'childinventories/UpdateParent',
        "inventorynotesStatus": baseUrl + 'inventorynotes/Status',
        "downloadinventoryNote": baseUrl + 'inventorynotes/{Id}/DownloadInventoryNoteAttachment',
        "inventorylocationsPrimary": baseUrl + 'inventorylocations/Primary/{Id}/{LId}',
        "makeChild": baseUrl + 'inventories/MakeChild',
        "associatedInventory": baseUrl + 'inventoryassociations/VendorProductInventory',
        "inventoryassociatedAssign": baseUrl + 'inventoryassociations/Assign',
        "saveChildinventories": baseUrl + 'childinventories',
        "getInvoiceSummryBillingMobilityUrl": baseUrl + 'invoice/InvoiceServiceSummary',
        "getInvoiceSummryBillingNew": baseUrl + 'invoice/InvoiceServiceSummaryNew',
        "getCostCenterStructureUrl": baseUrl + 'invoice/CostAllocations/CostCenterStructure',
        "childinventoriesData": baseUrl + 'childinventories/VendorProductInventory/{Id}'
    },
    "SandBox": {
        "sandBoxGrid" : baseUrl + 'sandbox',
        "refreshGrid": baseUrl + 'sandbox/RefreshGridData/{Id}',
        "Status": baseUrl + 'sandbox/{Id}/Status/{SId}',
        "Publish": baseUrl + 'sandbox/{Id}/Publish',
        "sandboxstatuses": baseUrl + 'sandboxstatuses',
        "InvoiceOverview" : baseUrl + 'sandbox/{id}/InvoiceOverview',
        "InvoiceProcesingStep" : baseUrl + 'sandbox/{id}/InvoiceProcesingStep',
        "downloadDataFiles": baseUrl + 'sandbox/{Id}/DownloadDataFiles',
        "downloadBDFFiles": baseUrl + 'sandbox/{Id}/DownloadBdfOrEdiData',
        "changeSBRepName": baseUrl + 'sandbox/{sbInvoiceId}/Rep/{temUserId}',
        "invoiceRetreival": baseUrl + 'sandbox/{sbInvoiceId}/InvoiceRetrieval/{expectedInvoiceId}',
        "step_1" : {
            "validationtotalsummary": baseUrl + 'sandbox/validationtotalsummary/{Id}',
        },
        "step_2" : {
            "VBAbyChargeCode": baseUrl + 'sandbox/VBAbyChargeCode/{Id}',
        },
        "step_3" : {
            "ChargeCodeAssignment" : baseUrl + 'sandbox/ChargeCodeAssignment/{Id}',
            "ChargeCodeContextDetails" : baseUrl + 'sandbox/ChargeCodeContext/details/{Id}',
            "ChargeCodeContextBlank" : baseUrl + 'sandbox/ChargeCodeContext/{Id}/Blank',
            "ChargeCode": baseUrl + 'sandbox/ChargeCode',
            "AssignBlankChangeCode": baseUrl + 'sandbox/AssignToBlankChangeCode/{Id}',
            "ChargeCodeContextId" : baseUrl + 'sandbox/ChargeCodeContext/{Id}/SBChargeDetail/{sbChargeDetailId}',
            "ParentChargeCode" : baseUrl + 'sandbox/ParentChargeCode',
            "ChargeCodeContext": baseUrl + 'sandbox/ChargeCodeContext/{id}/ChargeCode'
        },
        "step_4": {
            "VendorProductAssignment": baseUrl + 'sandbox/VendorProductAssignment/{Id}',
            "VPABySBInvoiceInventory": baseUrl + 'sandbox/VPABySBInvoiceInventory',
            "VPChargeCodeGroups": baseUrl + 'sandbox/VPChargeCodeGroups/{Id}',
            "ChargeValidation" : baseUrl + 'sandbox/{Id}/ChargeValidation',
            "ChargeValidationByAccount" : baseUrl + 'sandbox/{Id}/ChargeValidationByAccount',
            "ChargeValidationByBillingId" : baseUrl + 'sandbox/{Id}/ChargeValidationByBillingId',
            "ChargeValidationByChargeLocations" : baseUrl + 'sandbox/{Id}/ChargeValidationByChargeLocations',
            "distributionOriginLevelTypes" : baseUrl + 'sandbox/{Id}/distributionOriginLevelTypes',
            "ChargeValidationDetails": baseUrl + 'sandbox/{Id}/ChargeValidationDetails'
        },
        "step_4_3": {
            "ChargeCodeNeedRules": baseUrl + 'sandbox/{Id}/CostDistribution/ChargeCodeNeedRules',
            "CostDistributionRules": baseUrl + 'sandbox/{Id}/CostDistributionRules/Event',
            "distributionAccountLocationTypes": baseUrl + 'distributionAccountLocationTypes',
            'distributionRuleTypes': baseUrl + 'distributionRuleTypes',
            'distributionOriginLevelType': baseUrl + 'distributionOriginLevelTypes',
            'distributionMethodTypes': baseUrl + 'distributionMethodTypes',
            'billingIds': baseUrl + 'sandbox/{Id}/BillingIds/ChargeCodes',
            'subaccounts': baseUrl + 'sandbox/{Id}/SubAccounts',
            'distributionRulesOptions': baseUrl +'distributionRulesOptions',
            'PreDistributionDetails': baseUrl + 'sandbox/{Id}/DistributionEvent/{distributionEventId}/PreDistributionDetails',
            'DistributionDetails': baseUrl + 'sandbox/DistributionEvent/DistributionDetails',
            'ruleApply': baseUrl + 'sandbox/{Id}/Distribution/Apply'
        },
        "step_5": {
            "ChargeCodeGroupAndVendorProduct": baseUrl + 'sandbox/ChargeCodeGroupAndVendorProduct',
            "VPABySBInvoiceInventory": baseUrl + 'sandbox/VPABySBInvoiceInventory',
            "VPChargeCodeGroupsView": baseUrl + 'sandbox/VPChargeCodeGroups/{Id}/View',
            "FromOtherSBInvoice" : baseUrl + 'sandbox/FromOtherSBInvoice/{Id}',
            "FromOtherSBInvoiceData" : baseUrl + 'sandbox/FromOtherSBInvoiceData/{Id}',
            "FromOtherSBInvoiceSave": baseUrl + 'sandbox/FromOtherSBInvoiceData/{Id}/Save',
            "refreshButtonUrl": baseUrl + 'sandbox/{Id}/VendorProductInventoryAsync'
        },
        "step_6": {
            "DistributionRules": baseUrl + 'sandbox/DistributionRules/{Id}'
        },
        
        "add_correction": {
            "unitOfMeasures": baseUrl + 'unitOfMeasures',
            "SubAccountDropDown":  baseUrl + 'sandbox/{Id}/SubAccountDropDown',
            "chargeLocationTypes": baseUrl + 'chargeLocationTypes',
            "correction": baseUrl + 'sandbox/{Id}/correction'
        },
        "step_7": {
            "finalReview": baseUrl + 'sandbox/{Id}/FinalReview',
            "unPublish": baseUrl + 'sandbox/{Id}/UnPublish',
            "InvoiceServiceSummaryNew": baseUrl + 'sandbox/InvoiceServiceSummaryNew',
        },
        'distributionRuleLog': baseUrl + 'sandbox/DistributionRulesLog/{Id}',
        'MarkCloseInvoice': baseUrl + 'sandbox/MarkCloseInvoice',
        'invoiceChangeLog': baseUrl + 'invoice/DistributionRulesLog/{Id}',
        'invoiceApply': baseUrl + 'invoice/{Id}/Distribution/Apply'
    },
    "vendorproductType": baseUrl + 'vendorproducttypes/vendorAccountId/{Id}/DropDown',
    "vendorproductTypeDetail": baseUrl + 'vendorproducttypes/{Id}',
    "Invoice_retrieval": {
        "dataRetrievalSource":baseUrl + 'dataRetrievalSource',
        "dataRetrievalMethods": baseUrl + 'dataRetrievalMethods',
        "dataRetrievalProcessingMethods": baseUrl + 'dataRetrievalProcessingMethods',
        "dataRetrievalTemplateType": baseUrl + 'dataRetrievalTemplateType',
        "invoiceRetrievalMethods": baseUrl + 'invoiceRetrievalMethods',
        "InvoiceAndDataRetrieval": baseUrl + 'vendoraccounts/{Id}/InvoiceAndDataRetrieval',
        "InvoiceAndDataRetrievalUpload": baseUrl + 'dataretrieval/InvoiceAndDataRetrievalUpload'
    },
    "Recon": {
        "reconLoggedInUser": baseUrl + 'Recon/LoggedInUser',
        'reconLocation': baseUrl + 'Recon/Location',
        'reconLocationPrimary': baseUrl + 'Recon/Location/Primary',
        'reconPeoples': baseUrl + 'Recon/User',
        'reconPeoplesPrimary': baseUrl + 'Recon/User/Primary',
        'reconSummary': baseUrl + 'Recon/LoggedInUser/Summary',
        'InvoiceOverviewUrl': baseUrl + 'invoice/{InvoiceId}/InvoiceOverview'
    },
    "Invoice": {
        "InvoiceChargeCodeNeedRules": baseUrl + 'invoice/{Id}/Distribution/ChargeCodeNeedRules',
        "InvoiceCostDistributionRules": baseUrl + 'invoice/{Id}/CostDistributionRules/Event',
        "InvoicePreDistributionDetails": baseUrl +'invoice/{Id}/DistributionEvent/{distributionEventId}/PreDistributionDetails',
        "InvoiceDistributionDetails": baseUrl + 'invoice/DistributionEvent/DistributionDetails',
        "ChargeCodeContext": baseUrl + 'invoice/ChargeCodeContext/{Id}/details',
        "billingIds": baseUrl + 'invoice/{Id}/BillingIds/ChargeCodes',
        "subaccounts":  baseUrl + 'invoice/{Id}/SubAccounts',
        "DistributionRules": baseUrl +'invoice/{Id}/DistributionRules',
        "ruleDetail": baseUrl + 'DistributionRules/{Id}/details',
        "costAllocationVendorProduct": baseUrl + 'invoice/{Id}/CostAllocations/VendorProduct',
        "costAllocationStructure": baseUrl + 'invoice/{Id}/CostAllocations/CostCenterStructure',
        "costAllocationExport": baseUrl + 'invoice/{Id}/CostAllocations/Export',
        "costAllocationRerun": baseUrl + 'invoice/{Id}/CostAllocations/ReRun'
    },
    "finance_invoice": {
        "getInvoiceGridUrl": baseUrl + 'invoice',
        "getInvoiceOverviewUrl": baseUrl + 'invoice/{InvoiceId}/InvoiceOverview',
        "getInvoiceCostOverviewUrl": baseUrl + 'invoice/{InvoiceId}/InvoiceCostOverview',
        "getInvoiceServiceSummeryUrl": baseUrl + 'invoice/{invoiceId}/InvoiceServiceSummery',
        "saveInvoiceNotesUrl": baseUrl + 'InvoiceNotes',
        "getInoviceNotesUrl": baseUrl + 'InvoiceNotes/Invoice'
    },
    "distribution": {
        "getDistributionRules": baseUrl + 'DistributionRules/LoggedInUser',
        "distributionDetail": baseUrl + 'DistributionRules/{Id}/detailsData',
        "distributionStatus": baseUrl + 'DistributionRules/Status'
    },
    "coststructure": {
        "costcenterDropdown" : baseUrl + 'costcenters/LoggedInUser/DropDown',
        "ccStructureTypes": baseUrl + 'ccStructureTypes',
        "ccStructuresRule": baseUrl + 'ccStructures/Rule',
        "getCCstructures": baseUrl + 'ccStructures/LoggedInUser',
        "getCCstructureDetail": baseUrl + 'ccStructures/{Id}/details',
        "getApproverDropdown": baseUrl + 'peoples/Approver/DropDown'
    },
    "dashboard": {
        "spendOverview": baseUrl + 'Dashboard/SpendOverview',
        "invoiceprocessing": baseUrl + 'Dashboard/InvoiceProcessing',
        "spendVendor": baseUrl + 'Dashboard/SpendByVendor',
        "inventoryOverview": baseUrl + 'Dashboard/InventoryOverview',
        "expiredContracts": baseUrl + 'Dashboard/ExpiredContracts',
        "disconnectedProduct": baseUrl + 'Dashboard/DisconnectedVendorProduct',
        "inactiveLocation": baseUrl + 'Dashboard/InactiveLocationData',
        "inactivePeople": baseUrl + 'Dashboard/InactivePeopleData',
        "spendSummarybyVendor": baseUrl + 'Dashboard/SpendBySummary',
        "invoiceSumByVendor": baseUrl + 'Dashboard/InvoiceSumByVendor',
        "spendSumByService": baseUrl + 'Dashboard/SpendSumByService',
        "SpendSummary": baseUrl + 'Dashboard/SpendSummary',
        "invoiceMonitor": baseUrl + 'Dashboard/InvoiceMonitor',
        "VendorChartUrl": baseUrl + 'Dashboard/InventoryByVendor',
        "InventoryByStatusUrl": baseUrl + 'Dashboard/InventoryByStatus',
        "SpendSumByProductUrl": baseUrl + 'Dashboard/InventoryByProduct',
        "SpendSumByProductTypeUrl": baseUrl + 'Dashboard/InventoryByProductType'
    }
}


export const common = {
    "DropDown" : {
        "TEM" : baseUrl + 'accounts/TEM'    
    }
}