function sendMail(obj) {
    
    var Mail = require('dw/net/Mail');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var mail = new Mail();
    var template = "inventory/sendEmail.isml";
    mail.addTo(obj.mail_receiver);
    mail.setFrom("JobStatus");
    mail.setSubject("Job Status");
    mail.setContent(renderTemplateHelper.getRenderedHtml(obj,template));
    mail.send();//returns either Status.ERROR or Status.OK, mail might not be sent yet, when this method returns
}
module.exports = {
    sendMail:sendMail
}
