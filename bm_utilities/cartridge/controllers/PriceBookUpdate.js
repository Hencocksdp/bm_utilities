/**
 * Shop System Plugins:
 * - Terms of Use can be found under:
 * https://github.com/wirecard/salesforce-ee/blob/master/_TERMS_OF_USE
 * - License can be found under:
 * https://github.com/wirecard/salesforce-ee/blob/master/LICENSE
 */
 'use strict';

 var app = require('~/cartridge/scripts/app');
 var guard = require('~/cartridge/scripts/guard');
 var URLUtils = require('dw/web/URLUtils');
 var Site = require('dw/system/Site');
 /**
  * Display form 
  */
 exports.Show = guard.ensure(['get', 'https'], function () {
     var currentSite = Site.getCurrent();
     var allowedCurrencies = currentSite.allowedCurrencies;
     var parameterMap = request.httpParameterMap;
     var msg = JSON.parse(session.privacy.paymentGatewaySupport) || {}; 
     var displayMsg;
     delete session.privacy.paymentGatewaySupport;
     if (Object.prototype.hasOwnProperty.call(msg, 'message')) {
         displayMsg = msg.message;
     }
     app.getView({
         Message: displayMsg,
         isSuccess: Object.prototype.hasOwnProperty.call(msg, 'success'),
         Currencies: allowedCurrencies
     }).render('pricebook/indexForm');
 });
 
 exports.SupportFormPost = guard.ensure(['post', 'https'], function () {
     var PriceBookMgr = require('dw/catalog/PriceBookMgr');
     var Status = require('dw/system/Status');
     var Logger = require('dw/system/Logger');
     var decode = require('dw/crypto/Encoding');
     var Resource = require('dw/web/Resource');
 
     var parameterMap = request.httpParameterMap;
     var base64string = parameterMap.productData.value;
     var bufferObj = decode.fromBase64(base64string);
     var string = bufferObj.toString("utf8");
     var formData = JSON.parse(string);
 
     var onlineFlag = formData[0].online_Flag;
     var currency = formData[1].currency;
     formData = formData.slice(2);
 
     var pricebookAvailable = PriceBookMgr.getPriceBook(parameterMap.pricebookId); //to get pricebook is exist or not?
     if (pricebookAvailable) {
         var prodTable = '';
         var priceBookId = '';
         var xmlHead = '<?xml version="1.0" encoding="UTF-8"?><pricebooks xmlns="http://www.demandware.com/xml/impex/pricebook/2006-10-31"><pricebook>';
 
         var header = '<header pricebook-id="' + parameterMap.pricebookId + '">' +
             '<currency>' + currency + '</currency>' +
             '<display-name xml:lang="x-default">' + parameterMap.displayName + '</display-name>' +
             '<online-flag>' + onlineFlag + '</online-flag>' +
             '</header>';
 
         var priceTableStart = '<price-tables>'
 
         for (var obj of formData) {
             var products = '<price-table product-id="' + obj.productId + '">' +
                 '<amount quantity="' + obj.quantity + '">' + obj.amount + '</amount>' +
                 '</price-table>';
             prodTable = prodTable + products;
         }
 
         var priceTableEnd = '</price-tables>'
 
         var xmlEnd = '</pricebook></pricebooks>';
 
         var resultXml = xmlHead + header + priceTableStart + prodTable + priceTableEnd + xmlEnd;
         try {
             var File = require('dw/io/File');
             var FileWriter = require('dw/io/FileWriter');
             var dir = File.IMPEX + '/src/export/order/';
             var file = new File(dir + 'PriceBook.xml');
 
             if (!file.exists()) {
                 file.createNewFile();
                 Logger.info('orderJsonConversion: File does not exists ...created new file myfile.json')
             }
             var fileWriter = new FileWriter(file);
             Logger.info('orderJsonConversion: string written into file.');
             fileWriter.writeLine(resultXml.toString());
             fileWriter.flush();
             fileWriter.close();
 
             var svcresult = {};
             var BearerToken;
             var sampleService = require('*/cartridge/scripts/svc/service.js')
             var token = sampleService.createToken();
             var tokenResponce = token.call();
             if (tokenResponce.ok) {
                 var tokenData = JSON.parse(tokenResponce.object.text);
                 BearerToken = tokenData.token_type + ' ' + tokenData.access_token;
             }
             var obj = {
                 Token: BearerToken,
                 payload: "parameters"[
                     {
                         "name": "WorkingFolder",
                         "value": "export/order"
                     },
                     {
                         "name": "fileName",
                         "value": "PriceBook.xml"
                     }
                 ]
             }
             var svc = sampleService.priceBookUpdate();
             var svcResponse = svc.call(obj);
             if (svcResponse.ok) {
                 svcresult.msg = svcResponse.object.statusMessage;
                 var text = svcResponse.object.statusMessage;
                 var textArray = text.split(",");   
                 svcresult.gender = svcResponse.object.text;
                 Logger.getLogger('SampleService').error('Service Successful, response: ' + svcResponse.errorMessage);
                 var msg = { message: Resource.msg('lable.message_sucess', 'getDetails', null) };
                 msg.success = 1;
             } else {
                 Logger.getLogger('SampleService').error('Service Failed, response: ' + svcResponse.errorMessage);
                 var msg = { message: Resource.msg('lable.message_error', 'getDetails', null) };
                 svcresult.msg = svcResponse.errorMessage;
                 svcresult.gender = null;
             }
         }
         catch (err) {  
             var msg = { message: Resource.msg('lable.message_error', 'getDetails', null) };
             msg.message = err.message;
             Logger.error('orderJsonConversion: Error occured' + err.message);
         }
     }
     else {
         var msg = { message: Resource.msg('lable.invalid_pricebook', 'getDetails', null) };
     }
     session.privacy.paymentGatewaySupport = JSON.stringify(msg);
     response.redirect(URLUtils.https('PriceBookUpdate-Show'));
 });