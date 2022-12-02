/*  function addRows() {
        var maxField = 10; //Input fields increment limitation 
        var count = 1;//Initial field counter is 1

        if(count < maxField){ 
            var rowDetail = document.querySelector('.product-detail > .row');
            var copiedRow = rowDetail.cloneNode(true);
            document.querySelector('.product-detail').appendChild(copiedRow); //Add field html
            var input = document.querySelector('.product-detail .row:last-child .col input');
            document.querySelectorAll('.product-detail .row:last-child .col input').forEach(input => {    input.value = '';  });
            //Increment field counter
            count++;
        }
        else{
            alert("Row count reached at max value(10)");
        }
    }    */

function addRow(){
    var product='';
    var quantity='';
    var amount='';
    var blanker ='';
    product = '<div class="row">'+
                    '<div class="col">'+
                    '<div class="form-group">'+
                    '<input type="text" class="form-control productId required" id="productId" name="productId" value=""  placeholder="Product id" required/>'+
                    '</div>'+
                    '</div>';

    quantity = '<div class="col">'+
                    '<div class="form-group">'+
                    '<input type="text" class="form-control quantity required" id="quantity" name="quantity" value="" required/>'+
                    '</div>'+
                    '</div>';
    
    amount =    '<div class="col">'+
                '<div class="form-group searchmain ">'+
                '<input type="text" class="form-control amount required" id="amount" name="amount" value="" required/>'+
                '</div>'+
                '</div>';

    blanker =   '<div class="col"> <button type="button" class="remover remove_button btn" value="button" onclick="removeRow(this);">X</button> </div></div>';

    var newRow = product + quantity + amount + blanker; 
    jQuery('.product-detail').append(newRow); //Add field html
};
    
//Once remove button is clicked
function removeRow(element){
    element.closest('.row').remove(); //Remove field
};

function getData(){
    var productData =[];
    var onlineFlag = false;
    if (jQuery('.online_flag').is(":checked"))
    {
        onlineFlag = true;
    }
    productData.push({online_Flag : onlineFlag});
    productData.push({currency : jQuery('.select-currency').val()});
    console.log("Kuch baad");

    jQuery('.product-detail .row').each(function(item){
        productData.push({
            productId : jQuery(this).find('.productId').val(),
            quantity : jQuery(this).find('.quantity').val(),
            amount : jQuery(this).find('.amount').val()
        });
    });
    productData = JSON.stringify(productData);
    let encoded = window.btoa(productData);
    jQuery('#productData').val(encoded);
    jQuery('form .DemoTest').submit();
}

jQuery('.success').delay(5000).fadeOut('slow');
jQuery('.error').delay(5000).fadeOut('slow');
jQuery('hr').delay(5000).fadeOut('slow');