function searchMenu(){
   var input,bodyData,tr,i,val;
   input = document.getElementById("myInput").value;
   bodyData =  document.getElementById("bodyData");
   tr = bodyData.getElementsByTagName("tr");
   for (i = 0; i < tr.length; i++){
      val = tr[i].childNodes[1].innerText;
      if (val.toUpperCase().indexOf(input.toUpperCase()) > -1) {
          tr[i].style.display = "";
      } else {
         tr[i].style.display = "none";
      }
   }
}