function addFields() {
    var inventory = '';
    inventory = '<div class="row container_form"><div class="ind_labels col"><input type="text" placeholder="Enter valid Product Id" id="product_id" class="product_id"name="product_id" required></div><div class="ind_labels col"><input type="text" placeholder="Enter valid Quatity" id="quantity" class="quantity" name="quantity" pattern= "[0-9]+" minlength="1" maxlength="9" required></div><div class="ind_labels perpetual col" ><input type="checkbox" id="isperpetual" class="isperpetual" name="isperpetual" value="isperpetual"/></div><div class="cols"> <button type="button" class="cancel_btn" value="button" onclick="removeRow(this);">X</button> </div></div></div>';
    jQuery('.add_item').append(inventory); //Add field html
}

function removeRow(element) {
    element.closest('.row').remove(); //Remove field
}
function formsubmit() {
    //removing warning for Invemtory field if corrected
    jQuery('.inventory_id').removeClass("invalid_id");
    jQuery('.product_id').removeClass("invalid_id");
    jQuery('.invalid_inv_id').addClass('d-none');
    jQuery('.error_msg').addClass('d-none');

    console.log('inside formsubmit.')
    var inventory_id = jQuery('.inventory_id').val();
    var email_Id = jQuery('.email_Id').val();
    var inv_validated = true;
    var email_validated = true;
    if (inventory_id === '') {
        alert("Please input a valid Inventory ID");
        inv_validated = false;
    }
    if (email_Id === '' && inv_validated) {
        alert("Please input a valid Email ID");
        email_validated = false;
    }
    if (inv_validated && email_validated) {
        var productData = [];
        var validated = true;

        productData.push(inventory_id);
        productData.push(email_Id);

        jQuery('.add_item .row').each(function (item) {
            var isperpetual = false;
            if (jQuery(this).find('.isperpetual').is(":checked")) {
                isperpetual = true;
                console.log(isperpetual);
            }
            productData.push({
                productId: jQuery(this).find('.product_id').val().trim(),
                quantity: jQuery(this).find('.quantity').val().trim(),
                isperpetual: isperpetual
            });
        });
        for (let i = 0; i < productData.length; i++) {
            var count = 1;
            if (productData[i].productId === '' || productData[i].quantity === '') {
                if (count == 1) {
                    alert("Please fill all the fields for the quantity and productID");
                }
                validated = false;
                count++;
            }

        }

        if (validated) {
            jQuery.ajax({
                url: jQuery('.inv_form').data('action'),
                type: 'post',
                dataType: 'json',
                data: {
                    data: JSON.stringify(productData)
                },
                success: function (data) {
                    if (data.flag) {
                        // jQuery('.message').empty().append(data.msg.message);

                        jQuery('.add_item .row').each(function (item) {
                            //Highlighting Product fields
                            if (data.invalid_pid) {
                                for (let i = 0; i < data.len; i++) {
                                    if (data.invalid_pid[i] === jQuery(this).find('.product_id').val()) {
                                        console.log(data.invalid_pid[i]);
                                        jQuery(this).find('.product_id').addClass("invalid_id");
                                        jQuery(this).find('.product_id').parent().append('<div class="error_msg">Please input a valid product Id</div>');

                                    }
                                    else{
                                        jQuery(this).find('.product_id').removeClass("invalid_id");
                                        jQuery(this).find('.error_msg').addClass('d-none');
                                        jQuery(this).find('.error_msg').remove();
                                    }
                                }
                            }

                            else if(data.master_pids){
                                for (let i = 0; i < data.len; i++) {
                                    if (data.master_pids[i] === jQuery(this).find('.product_id').val()) {
                                        console.log(data.master_pids[i]);
                                        jQuery(this).find('.product_id').addClass("invalid_id");
                                        jQuery(this).find('.product_id').parent().append('<div class="error_msg">Please input a variant product Id</div>');

                                    }
                                    else{
                                        jQuery(this).find('.product_id').removeClass("invalid_id");
                                        jQuery(this).find('.error_msg').addClass('d-none');
                                        jQuery(this).find('.error_msg').remove();
                                    }
                                }

                            }

                            else if(data.duplicate_pid){
                                for (let i = 0; i < data.len; i++) {
                                    if (data.duplicate_pid[i] === jQuery(this).find('.product_id').val()) {
                                        console.log(data.duplicate_pid[i]);
                                        jQuery(this).find('.product_id').addClass("invalid_id");
                                        jQuery(this).find('.product_id').parent().append('<div class="error_msg">Please input unique product ids</div>');

                                    }
                                    else{
                                        jQuery(this).find('.product_id').removeClass("invalid_id");
                                        jQuery(this).find('.error_msg').addClass('d-none');
                                        jQuery(this).find('.error_msg').remove();
                                    }
                                }
                            }
                            //Highlighting Inventory field
                            else {
                                jQuery('.inventory_id').removeClass("invalid_id");
                                jQuery('.invalid_inv_id').addClass('d-none');

                                jQuery('.inventory_id').addClass("invalid_id");
                                jQuery('.inventory_id').parent().append('<div class="invalid_inv_id">Please input a valid Inventory Id</div>')
                            }


                        });

                    }
                    else {

                        console.log(data);
                        window.location.reload();
                    }

                },

                error: function (err) {
                    // jQuery('.message').empty().append(err.msg);
                    window.location.reload()
                }
            });

        }


    }


};
jQuery('.success').delay(5000).fadeOut('slow');
jQuery('.error').delay(5000).fadeOut('slow');
jQuery('hr').delay(5000).fadeOut('slow');



