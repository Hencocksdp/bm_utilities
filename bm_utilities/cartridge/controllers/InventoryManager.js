
'use strict';

//  @module controllers/PaymentGateway


var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');
var decode = require('dw/crypto/Encoding');
var Resource = require('dw/web/Resource');
var StringUtils = require('dw/util/StringUtils');
var Response = require('dw/system/Response');
exports.SupportForm = guard.ensure(['get', 'https'], function () {
    var msg = JSON.parse(session.privacy.paymentGatewaySupport) || {};
    var displayMsg;
    delete session.privacy.paymentGatewaySupport;
    if (Object.prototype.hasOwnProperty.call(msg, 'message')) {
        displayMsg = msg.message;
    }
    app.getView({
        Message: displayMsg,
        isSuccess: Object.prototype.hasOwnProperty.call(msg, 'success')
    }).render('inventory/inventoryForm');
});

exports.GetFormData = guard.ensure(['post', 'https'], function () {
    var pr = dw.system.System.getPreferences();
    var Site = require('dw/system/Site').getCurrent();
    var System = require('dw/system');
    var Logger = require('dw/system/Logger');
    var URLUtils = require('dw/web/URLUtils');
    var parameterMap = request.httpParameterMap;
    var ProductMgr = require('dw/catalog/ProductMgr');
    var ProductInventoryMgr = require('dw/catalog/ProductInventoryMgr');
    var File = require('dw/io/File');
    var FileWriter = require('dw/io/FileWriter');
    var XMLStreamWriter = require('dw/io/XMLStreamWriter');
    var dir = File.IMPEX + '/src/catalog/';
    var file = new File(dir + 'myInventoryBook.xml');
    var fw = new FileWriter(file, 'UTF-8');
    var xsw = new XMLStreamWriter(fw);
    var ArrayList = require('dw/util/ArrayList');
    var Response = require('~/cartridge/scripts/util/Response');
    var product_infos = new ArrayList(JSON.parse(parameterMap.data));
    product_infos = product_infos.toArray();
    var inventory_id = product_infos[0];
    var email_Id = product_infos[1];
    product_infos = product_infos.slice(2);
    // Checking valid productIDs and Inventory Ids
    var flag = false;
    var msg;
    var invalid_pid = [];
    var master_pids=[];
    var invalid_pid_pos = [];
    
    //If inventory fiels is wrong return with the error message
    if(ProductInventoryMgr.getInventoryList(inventory_id) === null){
        flag = true;
    }
    if(flag){
        return Response.renderJSON({
            flag:flag
        });
    }
    
    for (let i = 0; i < product_infos.length; i++){
        // Checking if all the product Ids are valid if not return with the error message
        if( ProductMgr.getProduct(product_infos[i].productId) === null){
            flag = true;
            invalid_pid.push(product_infos[i].productId);
            invalid_pid_pos.push(i+1);
        }
    }

    if(flag){
        return Response.renderJSON({
            flag:flag,
            invalid_pid: invalid_pid,
            len: invalid_pid.length
        });
    }
// Checking if array contains duplicate product Ids
    var obj = {};
    var result=[];

    product_infos.forEach(function (item) {
        if(!obj[item.productId])
            obj[item.productId] = 0;
        obj[item.productId] += 1;
    });

    for(var ele in obj){
        if(obj[ele] >= 2){
            result.push(ele);
            flag = true;
        }

    }

    if(flag){
        return Response.renderJSON({
            duplicate_pid: result,
            flag:flag,
            len: result.length
        });
    }

//Check if array contains any master pid
    for (let i = 0; i < product_infos.length; i++){
        let product =  ProductMgr.getProduct(product_infos[i].productId);
        if(product.master){
            flag = true;
            master_pids.push(product_infos[i].productId);
        }
    }

    if(flag){     
        return Response.renderJSON({
            flag:flag,     
            master_pids: master_pids,
            len: master_pids.length
              
        });
    }


    if (ProductInventoryMgr.getInventoryList(inventory_id) !== null) {
        if (product_infos.length > 0) {
            xsw.writeStartDocument('UTF-8', '1.0');
            xsw.writeStartElement("inventory");
            xsw.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/inventory/2007-05-31');
            xsw.writeStartElement("inventory-list");
            xsw.writeStartElement("header");

            xsw.writeAttribute('list-id', inventory_id);

            xsw.writeStartElement("default-instock");
            xsw.writeCharacters("false");
            xsw.writeEndElement();

            xsw.writeStartElement("use-bundle-inventory-only");
            xsw.writeCharacters("false");
            xsw.writeEndElement();

            xsw.writeStartElement("on-order");
            xsw.writeCharacters("false");
            xsw.writeEndElement();

            xsw.writeEndElement();

            xsw.writeStartElement("records");

           
            
            for (let i = 0; i < product_infos.length; i++) {
                var product = product_infos[i];
            
                    xsw.writeStartElement("record");
                    xsw.writeAttribute('product-id', product.productId);

                    xsw.writeStartElement("allocation");
                    xsw.writeCharacters(product.quantity);
                    xsw.writeEndElement();

                    xsw.writeStartElement("perpetual");
                    xsw.writeCharacters(product.isperpetual);
                    xsw.writeEndElement();

                    xsw.writeStartElement("preorder-backorder-handling");
                    xsw.writeCharacters("none");
                    xsw.writeEndElement();

                    xsw.writeStartElement("ats");
                    xsw.writeCharacters("100");
                    xsw.writeEndElement();

                    xsw.writeStartElement("on-order");
                    xsw.writeCharacters("0");
                    xsw.writeEndElement();

                    xsw.writeStartElement("turnover");
                    xsw.writeCharacters("0");
                    xsw.writeEndElement();

                    xsw.writeEndElement();  
            }
            
            
            xsw.writeEndElement();
            xsw.writeEndDocument();
            xsw.close();
            fw.close();

    
            var svcresult = {};
            var BearerToken;
            var sampleService = require('*/cartridge/scripts/svc/service.js')
            var token = sampleService.createToken();
            var tokenResponce = token.call(pr.custom);
            if (tokenResponce.ok) {
                var tokenData = JSON.parse(tokenResponce.object.text);
                BearerToken = tokenData.token_type + ' ' + tokenData.access_token;
            }

            var obj = {
                Token: BearerToken,
                payload: "parameters"[
                    {
                        "name": "WorkingFolder",
                        "value": "catalog"
                    },
                    {
                        "name": "FileName",
                        "value": "myInventoryBook.xml"
                    }
                ]
            }
            var svc = sampleService.Inventory_update();
            var svcResponse = svc.call(obj);
            if (svcResponse.ok) {
                msg = { message: Resource.msg('label.success.service', 'getDetails', null) };
                msg.success = 1;
                Logger.getLogger('SampleService').error('Service Successful, response: ' + svcResponse.errorMessage);
    
                    var job_exec = JSON.parse(svcResponse.object.bytes);
                    var job_exec_id = job_exec.id;
                    var svc_job_status = sampleService.Inventory_status(job_exec_id);
                    var svc_job_status_Response = svc_job_status.call(obj.Token);

    
                    if(svc_job_status_Response.ok){
                        var local_obj = JSON.parse(svc_job_status_Response.object.bytes);
                        var pids=[];
                        for(let i=0; i<product_infos.length; i++)
                            pids.push(product_infos[i].productId);
                        var obj = {
                            mail_receiver: email_Id,
                            Job_Id: local_obj.job_id,
                            product_infos : JSON.stringify(pids)
                            
                        }
                        var HookMgr = require('dw/system/HookMgr');
                        Logger.getLogger('SampleService').error('Service Failed, response: ' + svcResponse.errorMessage);
                        var email = HookMgr.callHook('app.send.email','sendMail',obj);
                        
                        
                    }
                    else{
                        Logger.getLogger('SampleService').error('Service Failed, response: ' + svcResponse.errorMessage);
                        msg = { message: Resource.msg('label.error.job', 'getDetails', null) };
                    }
            } else {
                Logger.getLogger('SampleService').error('Service Failed, response: ' + svcResponse.errorMessage);
                msg = { message: Resource.msg('label.error.service', 'getDetails', null) };
            }
        }
        else{
            msg = { message: Resource.msg('label.fill.fields', 'getDetails', null) };
            msg.success = 0;
            
        }

    }
    else {
        msg = { message: Resource.msg('label.valid.inventory', 'getDetails', null) };
        msg.success = 0;
        
    }

  
    if(!Object.prototype.hasOwnProperty.call(msg, 'message')){
     msg = { message: Resource.msg('label.success.service', 'getDetails', null) };
    }
    session.privacy.paymentGatewaySupport = JSON.stringify(msg);
    Response.renderJSON({
        msg:msg.message,
        flag:flag
    });
});
