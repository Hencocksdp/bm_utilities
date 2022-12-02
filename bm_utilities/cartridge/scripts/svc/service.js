var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
/**
* @returns {dw.svc.Service} -
* */
var System = require('dw/system');
var Site = require('dw/system/Site').getCurrent();
var hostName = System.Site.current.httpHostName;
var JobExecution = require('dw/job/JobExecution');


function createToken() {
    var service = LocalServiceRegistry.createService('Create_Token', {
        createRequest: function (svc,params) {
            var token = (params.client_Id+':'+params.client_pass);
            var config = svc.getConfiguration();
            var credential = config.getCredential();
            var url = credential.getURL();
            url = url + 'client_id='+params.client_Id+'&client_secret='+params.client_pass+'&grant_type=client_credentials';
            svc = svc.setURL(url);
            svc = svc.setRequestMethod('POST');
            svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
            svc.addHeader('grant_type', 'client_credentials');
            svc.addHeader('Authorization', token);
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    return service;
}

function priceBookUpdate(name) {
    var service = LocalServiceRegistry.createService('PriceBookUpdate', {
        createRequest: function (svc, params) {
            var config = svc.getConfiguration();
            var credential = config.getCredential();
            var url = credential.getURL() + '/UpdatePricebook/executions';
            svc = svc.setURL(url);
            svc = svc.setRequestMethod('POST');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.addHeader('Authorization', params.Token);
            return JSON.stringify(params.payload);
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    return service;
}

function getPreferenceGroup(BearerToken) {
    var service = LocalServiceRegistry.createService('Get_ocapi_data', {
        createRequest: function (svc) {
            var url = "https://"+hostName+"/s/-/dw/data/v22_8/system_object_definitions/SitePreferences/attribute_groups"
            svc = svc.setURL(url);
            svc = svc.setRequestMethod('GET');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.addHeader('Authorization', BearerToken);
            svc.addHeader('x-dw-client-id', 'f6c42b70-d247-4ff8-a1ab-65c90c1379ac')    
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    return service;
}

function getPreferenceId(groupId, BearerToken) {
    
    var service = LocalServiceRegistry.createService('Post_ocapi_data', {
        createRequest: function (svc, params) {
            var url = "https://"+hostName+"/s/-/dw/data/v22_8/site_preferences/preference_groups/" + groupId + "/development/preference_search"
            svc = svc.setURL(url);
            svc = svc.setRequestMethod('POST');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.addHeader('Authorization', BearerToken);
            return JSON.stringify(params);
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    return service;
}

function getPreferenceName(groupId,preferenceId,BearerToken) {
    var service = LocalServiceRegistry.createService('Get_Name', {
        createRequest: function (svc) {
            var url = "https://"+hostName+"/s/-/dw/data/v22_8/site_preferences/preference_groups/"+groupId+"/development/preferences/"+preferenceId;
            svc = svc.setURL(url);
            svc = svc.setRequestMethod('GET');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.addHeader('Authorization', BearerToken);
            svc.addHeader('x-dw-client-id', 'f6c42b70-d247-4ff8-a1ab-65c90c1379ac')          
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    return service;
}

function Inventory_update(name) {
    var service = LocalServiceRegistry.createService('ocapi_job_automation', {
        createRequest: function (svc, params) {
            var url = 'https://'+ hostName +'/s/-/dw/data/v22_8/jobs/Inventory_update/executions';
         
            svc = svc.setURL(url);
            svc = svc.setRequestMethod('POST');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.addHeader('Authorization', params.Token);
            return JSON.stringify(params.payload);
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    return service;
}
function Inventory_status(exec_id) {
    var service = LocalServiceRegistry.createService('ocapi_job_status', {
        createRequest: function (svc, params) {
            var url = 'https://'+ hostName + '/s/-/dw/data/v22_8/jobs/Inventory_update/executions/'+exec_id;
            svc = svc.setURL(url);
            svc = svc.setRequestMethod('GET');
            svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Accept', 'application/json');
            svc.addHeader('Authorization', params);
        },
        parseResponse: function (svc, response) {
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    return service;
}

 

module.exports = {
    createToken: createToken,
    priceBookUpdate: priceBookUpdate,
    getPreferenceGroup: getPreferenceGroup,
    getPreferenceId: getPreferenceId,
    getPreferenceName: getPreferenceName,
    Inventory_update: Inventory_update,
    Inventory_status: Inventory_status
};