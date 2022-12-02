'use strict';

var app = require('~/cartridge/scripts/app');
var guard = require('~/cartridge/scripts/guard');

exports.Show = guard.ensure(['get', 'https'], function () {
    var value = dw.system.Site.getCurrent().getPreferences();
    var sampleService = require('*/cartridge/scripts/svc/service.js');
    var groupId = [];
    var token = sampleService.createToken();

    var tokenResponce = token.call();
    if (tokenResponce.ok) {
        var tokenData = JSON.parse(tokenResponce.object.text);
        var BearerToken = tokenData.token_type + ' ' + tokenData.access_token;
        var svc = sampleService.getPreferenceGroup(BearerToken);
        var svcResponse = svc.call();
        if (svcResponse.ok) {
            var bodyData = JSON.parse(svcResponse.object.text);
            for (let i = 0; i < bodyData.count; i++) {
                var grpOrigianal= bodyData.data[i].id;
                var grp = bodyData.data[i].id;
                if (grp.replace(/\s/g, "")) {
                    grp=grp.replace(/\s/g, "%20");
                }
                var svcResult = sampleService.getPreferenceId(grp, BearerToken)
                var payload = {
                    "query": {
                        "match_all_query": {}
                    }
                };
                var svcResponse = svcResult.call(payload);
                if (svcResponse.ok) {
                    var a = [];
                    var pId = JSON.parse(svcResponse.object.text);
                    for (let j = 0; j < pId.count; j++) {
                        var obj = {};
                        var PreferenceName = sampleService.getPreferenceName(grp, pId.hits[j].id, BearerToken);
                        var pNameData = PreferenceName.call();
                        if (pNameData.ok) {
                            var name = JSON.parse(pNameData.object.text);
                            obj.preferenceId = pId.hits[j].id;
                            obj.gId = grpOrigianal;
                            obj.preferenceName = name.display_name.default;
                        }
                        groupId.push(obj);
                    }
                }
            }
        }
    }

    app.getView({
        groupId: groupId,
        value: value
    }).render('customPref/form');
});