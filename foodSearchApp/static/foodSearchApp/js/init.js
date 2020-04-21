
window.onload = function() {
if(window.location.pathname=="/"){
  setCookie("current_user_query","")
  googleAutocomplete.autocompleteField("address-input");
  initMap();
  var user_latitude =   getCookie("user_latitude");
  var user_longitude =  getCookie("user_longitude");
  if ((user_latitude !="") && (user_longitude !="")){
  setMapLocation(user_latitude,user_longitude)
  }
  var addressInfo = getCookie("addressInfo");
  if (addressInfo != ""){  
      document.getElementById('address-input').value = addressInfo;
      document.getElementById("ask-location-modal-clear").style.display ="block"    
  }
}
if(window.location.pathname=="/search-results/"){
  var addressInfo = getCookie("addressInfo");
  var addressName = getCookie("addressName");
  document.getElementsByTagName('body')[0].style.overflow = "hidden"
  if (addressName ==""){
      document.getElementsByClassName("mobile-location-info")[0].style.display = "none"
  }
  else{
      document.getElementById("address-short").innerHTML = addressName +'<i class="material-icons">expand_more</i>'
  }
  if (addressInfo == ""){
      document.getElementsByClassName("mobile-location-info")[0].style.display = "none"
  }
  else{
      document.getElementById('address-input').value = addressInfo;
      document.getElementById("ask-location-modal-clear").style.display ="none"
      if (addressInfo.length>35){
	      addressInfo = addressInfo.substr(0,35)+"..."
      }
      document.getElementsByClassName("mobile-location-info")[0].children[1].innerText = addressInfo
  }
  infinte_search();
  googleAutocomplete.autocompleteField("address-input");
  initMap();
  var user_latitude =   getCookie("user_latitude");
  var user_longitude =  getCookie("user_longitude");
  if ((user_latitude !="") && (user_longitude !="")){
  setMapLocation(user_latitude,user_longitude)
  }
}
};

function infinte_search() {  
  var search_results_div = document.getElementsByClassName('search-results')[0]

  // Detect when scrolled to bottom.
  console.log(search_results_div)
  search_results_div.addEventListener('scroll', function() {
    if (search_results_div.scrollTop + search_results_div.clientHeight >= search_results_div.scrollHeight) {
      load_more_search_data();
    }
  });

}

function getPlaceInfofromLatLong(lat,lng){
      var xhttp = new XMLHttpRequest();
      var params = "latlng="+lat+","+lng+"&key=AIzaSyBl1Wwgdhv4XFl1nHNvCH-2QyD7ltJaueM"
      xhttp.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?"+params, true);
      xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              response = JSON.parse(this.responseText);
              if(response["status"]=="OK"){
		 setCookie("addressInfo",response["results"][0]["formatted_address"]);
                 setCookie("addressName",response["results"][0]["formatted_address"].split(",")[0]);
              }
	      else{
	         return
	      }
          }
          else{
	       return
          }
      }
      xhttp.send(null);

}

var loading_data_flag = false;

function load_more_search_data() {
    var current_user_query = getCookie("current_user_query");
    if (current_user_query==""){
      return
    }
    var unique_search_id = getCookie("unique_search_id")
    if (unique_search_id==""){
      return
    }
    var user_latitude =   getCookie("user_latitude");
    var user_longitude =  getCookie("user_longitude");
    if ((user_latitude !="") && (user_longitude !="") && (!loading_data_flag)){
      loading_data_flag= true
      document.getElementsByClassName('search-results-loader')[0].style.display = 'flex'
      search_page_no +=1;
      var csrf_token = getCsrfToken();
      var xhttp = new XMLHttpRequest();
      var params = 'user_query='+current_user_query+'&latitude='+user_latitude+'&longitude='+user_longitude+'&page_no='+search_page_no+'&unique_search_id='+unique_search_id
      xhttp.open("POST", "/get-food-list/", true);
      xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhttp.setRequestHeader('x-csrf-token', csrf_token);
      xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              response = JSON.parse(this.responseText);
              if(response["status"]==200){
                unique_search_id = response["unique_search_id"]
                search_page_no = response["page_no"]
                setCookie("unique_search_id",unique_search_id)
                loading_data_flag = false
		var search_results_div_scroll_height = document.getElementsByClassName('search-results')[0].scrollTop
                render_search_results(response['food_detail_data'])
		document.getElementsByClassName('search-results')[0].scrollTop = search_results_div_scroll_height
                document.getElementsByClassName('search-results-loader')[0].style.display = 'none'
              }
          }
          else{
                document.getElementsByClassName('search-results-loader')[0].style.display = 'none'
          }
      }
      xhttp.send(params);
    }
  }

function render_search_results(food_detail_data) {
  for (var i = 0; i < food_detail_data.length; i++) {
    var price_bif_div_no = document.getElementsByClassName("price-bifurcation-modal").length +1
    food_detail_dict = food_detail_data[i]
    vendor = food_detail_dict["vendor"]
    logo_src = ""
    total_price = "NaN"
    if (vendor=="swiggy"){
      logo_src = "/files/images/swiggy.jpg"
      total_price = food_detail_dict['grand_total']
    }
    if (vendor=="zomato"){
      logo_src = "/files/images/zomato.png"
      total_price = food_detail_dict['total_price']+"*"
    }
    if (vendor=="u_eats"){
      logo_src = "/files/images/uber_eats.png"
      total_price = food_detail_dict['grand_total']
    }
    html_string = '<div class="result-container">\
       <div class="mobile-logo">\
            <img src="'+logo_src+'">\
       </div>\
        <div class="item-info-div">\
           <div class="logo">\
                <img src="'+logo_src+'">\
           </div>\
           <div class="item-img-wrapper">\
	         <img src="'+food_detail_dict['item_img_url']+'" onerror="this.onerror=null; this.src='+"'/files/images/image-not-found.jpg'"+'" alt="">\
           </div>\
            <div class="item-detail-wrapper">\
                <div class="item-name">\
                    <h1>'+(food_detail_dict['menu_item_name']).substring(0,25)+'</h1>\
                </div>\
                <div class="restaurant-details">\
                    <div class="restaurant-info-wrapper">\
                        <h5 class="res-name">'+(food_detail_dict['restaurant_name']).substring(0,25)+'</h5>\
                        <p class="res-address">'+food_detail_dict['restaurant_address']+'</p>\
                    </div>\
                    <div class="item-rating-wrapper">\
                        <span class="rating-string">'+ get_rate_strng(parseFloat(food_detail_dict['restaurant_rating']))+'</span>\
                        <div class="star-ratings">\
                            <div class="fill-ratings" style="width:'+get_rate_prec(parseFloat(food_detail_dict['restaurant_rating']))+'%;">\
                                <span>★★★★★</span>\
                            </div>\
                            <div class="empty-ratings">\
                                <span>★★★★★</span>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
        <div class="final-price-div">\
            <div class="final-price-del-wrapper">\
                <div class="final-price-info">\
                    <span>\
                        '+total_price+'\
                    </span>\
                    <i class="material-icons" style="color: #888888" onclick="show_price_bif_modal('+price_bif_div_no+')">info</i>\
                </div>\
                <div class="res-delivery-time">\
                    <img src="/files/images/del-scooter.png">\
                    <span class="del-time-string">\
                        '+get_numric_value(food_detail_dict['del_time'])+'\
                    </span>\
                    <span>\
                        mins\
                    </span>\
                </div>\
            </div>\
            <div class="select-item-btn" onclick="window.open('+"'"+food_detail_dict['res_url'] +"','_blank'"+')">\
                <a href="javascript:void(0)">\
                    Select\
                    <i class="material-icons">arrow_forward</i>\
                </a>\
            </div>\
        </div>\
        <div class="select-item-btn-wrapper" onclick="window.open('+"'"+food_detail_dict['res_url'] +"','_blank'"+')">\
            <a href="javascript:void(0)">\
                Select\
                <i class="material-icons">arrow_forward</i>\
            </a>\
        </div>\
    </div>'
    document.getElementsByClassName('search-results')[0].innerHTML += html_string
    price_bif_html = '<div class="price-bifurcation-modal" id="price-bifurcation-modal-'+price_bif_div_no+'">\
    <div class="price-bifurcation-content">\
        <div class="modal-title">\
            Price Breakdown\
        </div>\
        <div class="close-modal" onclick="close_price_bif_modal('+price_bif_div_no+')">\
            X\
        </div>\
        <div class="price-bif-div">'+get_price_bifurcation(food_detail_dict)+'</div>\
    </div>\
</div>'
    document.getElementById('body-content').innerHTML += price_bif_html

  }
  infinte_search()
  var elem = document.getElementsByClassName('search-results-loader')[0];
  elem.parentNode.removeChild(elem);
  loader_html ='<div class="search-results-loader">\
        <div></div>\
    </div>'
  document.getElementsByClassName('search-results')[0].innerHTML += loader_html

}
  // Prepare location info object.
var locationInfo = {
  geo: null,
  country: null,
  state: null,
  city: null,
  postalCode: null,
  street: null,
  streetNumber: null,
  reset: function() {
    this.geo = null;
    this.country = null;
    this.state = null;
    this.city = null;
    this.postalCode = null;
    this.street = null;
    this.streetNumber = null;
  }
};

googleAutocomplete = {
  autocompleteField: function(fieldId) {
    var options = {
      componentRestrictions: {country: "in"}
     };
    (autocomplete = new google.maps.places.Autocomplete(
      document.getElementById(fieldId),options
    )),
      { types: ["geocode"] };
    google.maps.event.addListener(autocomplete, "place_changed", function() {
      // Segment results into usable parts.
      var place = autocomplete.getPlace(),
        address = place.address_components,
        lat = place.geometry.location.lat(),
        lng = place.geometry.location.lng();

      // Reset location object.
      locationInfo.reset();

      // Save the individual address components.
      locationInfo.geo = [lat, lng];
      for (var i = 0; i < address.length; i++) {
        var component = address[i].types[0];
        switch (component) {
          case "country":
            locationInfo.country = address[i]["long_name"];
            break;
          case "administrative_area_level_1":
            locationInfo.state = address[i]["long_name"];
            break;
          case "locality":
            locationInfo.city = address[i]["long_name"];
            break;
          case "postal_code":
            locationInfo.postalCode = address[i]["long_name"];
            break;
          case "route":
            locationInfo.street = address[i]["long_name"];
            break;
          case "street_number":
            locationInfo.streetNumber = address[i]["long_name"];
            break;
          default:
            break;
        }
      }
      setCookie("addressInfo",place.formatted_address);
      setCookie("addressName",place.name);
      setCookie("user_latitude",lat);
      setCookie("user_longitude",lng);
      get_user_search_results();
      // Preview map.
      var src =
          "https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBl1Wwgdhv4XFl1nHNvCH-2QyD7ltJaueM&center=" +
          lat +
          "," +
          lng +
          "&zoom=14&size=480x125&maptype=roadmap&sensor=false",
      preview_map_img = document.getElementById('preview-map-img')  
      preview_map_img.src = src;      console.log(locationInfo)
      setMapLocation(lat,lng)
    });
  }
};
function toggel_location_btns(input_elmt){
  if (input_elmt.value !=""){
      document.getElementById("ask-location-modal-clear").style.display = "block";
  }
  else{
    document.getElementById("ask-location-modal-clear").style.display = "none";
  }
}

function clear_address_input() {
    document.getElementById("address-input").value = "";
    document.getElementById("ask-location-modal-clear").style.display = "none";
    document.getElementById("address-input").focus(); 
}

document.getElementsByTagName("body")[0].addEventListener("mousedown",function(e){
    if(e.target.id=="ask-location-modal-clear"){
      document.getElementById("address-input").value = "";
      document.getElementById("ask-location-modal-clear").style.display = "none";
      document.getElementById("address-input").focus(); 
      e.preventDefault();
    }
});
document.getElementsByTagName("body")[0].addEventListener("keyup",function(e){
    if(e.target.id=="food-search-input"){
        if (e.keyCode === 13) {
	    var user_query = (document.getElementById("food-search-input").value).trim()
            if (user_query==""){
               return;
             }
            setCookie("current_user_query",user_query)
            get_user_search_results()
         }
     }
});


function showLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;	
  setCookie("user_latitude",latitude);
  setCookie("user_longitude",longitude);
  getPlaceInfofromLatLong(latitude,longitude)
  get_user_search_results();
  setMapLocation(latitude,longitude)
}

function errorHandler(err) {
  if(err.code == 1) {
     alert("Error: Access is denied!");
  } else if( err.code == 2) {
     alert("Error: Position is unavailable!");
  }
}

function getLocation() {

  if(navigator.geolocation) {
     
     // timeout at 60000 milliseconds (60 seconds)
     var options = {maximumAge:10000, timeout:5000, enableHighAccuracy: true};
     navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
  } else {
     alert("Sorry, browser does not support geolocation!");
  }
}

function setMapLocation(lat,lng){
  if (!lat || !lng) {
    alert('no location data given');
    return false;
  }
  // create latlng object
  var latlng = new google.maps.LatLng(lat, lng);
  // reset marker
  homeMarker.setPosition(latlng);
  // center map
  preview_map.setCenter(latlng);
}
var homeMarker;
var preview_map;
function initMap() {
      // default location - beatuiflul vienna
      var lat = 48.2081743;
      var lng = 16.3738189;
        // create initial latlng object
      var  latlng = new google.maps.LatLng(lat, lng);
        // map options
      var  myOptions = {
          center: latlng,
          keyboardShortcuts: false,
          mapTypeControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          scrollwheel: false,
          zoom: 15,
          zoomControl: false,
          fullscreenControl:false,
        };

      // init map
    preview_map = new google.maps.Map(
        document.getElementsByClassName("preview-map")[0],
        myOptions
      );
      
      // set marker on start-position
    homeMarker = new google.maps.Marker({
        map: preview_map,
        position: latlng,
        title: 'Home'
      });
  }

function hide_other_modal_content(){
  document.getElementsByClassName("preview-map")[0].style.display = "none";
  document.getElementsByClassName("location-modal-auto-detect-wrapper")[0].style.display = "none";
  document.getElementById("location-option-text").style.display = "none";
}

function show_other_modal_content(){
  document.getElementsByClassName("preview-map")[0].style.display = "block";
  document.getElementsByClassName("location-modal-auto-detect-wrapper")[0].style.display = "block";
  document.getElementById("location-option-text").style.display = "block";
}

function hide_by_class_name(class_name){
  var clas_elements = document.getElementsByClassName(class_name);

  for (var i = 0; i < clas_elements.length; i ++) {
      clas_elements[i].style.display = 'none';
  }
}
function start_animation(class_name){
  var clas_elements = document.getElementsByClassName(class_name);

  for (var i = 0; i < clas_elements.length; i ++) {
      clas_elements[i].style.animation = '';
  }
}
function stop_animation(class_name){
  var clas_elements = document.getElementsByClassName(class_name);

  for (var i = 0; i < clas_elements.length; i ++) {
      clas_elements[i].style.animation = 'none';
  }
}
var stop_location_gif = false;
var location_gif_index = 0;

function run_location_loader(){
  if (!stop_location_gif){
    document.getElementsByClassName('location-loader')[0].style.display = 'block'
    hide_by_class_name('pin-wrapper')
    document.getElementsByClassName('pin-wrapper')[location_gif_index%4].style.display='block';
    location_gif_index+=1;
    setTimeout(run_location_loader, 300);
  }
}

function stop_location_loader(){
  stop_location_gif = true;
  document.getElementsByClassName('location-loader')[0].style.display = 'none'
}

function run_food_search_loader(){
    stop_animation('anim-item')
    document.getElementsByClassName('search-loader')[0].style.display = 'block'
    start_animation('anim-item')
}

function stop_food_search_loader(){
    document.getElementsByClassName('search-loader')[0].style.display = 'none'
    stop_animation('anim-item')
}

function setCookie(cookiename,cookievalue) {
  document.cookie = cookiename + "=" + cookievalue+";path=/";
}

function getCookie(cookiename) {
  var cookie_name = cookiename + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookie_array = decodedCookie.split(';');
  for(var i = 0; i < cookie_array.length; i++) {
    var c = cookie_array[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(cookie_name) == 0) {
      return c.substring(cookie_name.length, c.length);
    }
  }
  return "";
}

function get_user_search_results(){
  var current_user_query = getCookie("current_user_query");
  if (current_user_query==""){
    document.getElementsByClassName('ask-location-modal')[0].style.display = 'none'
    return
  }
  var user_latitude =   getCookie("user_latitude");
  var user_longitude =  getCookie("user_longitude");
  if ((user_latitude !="") && (user_longitude !="")){
    run_food_search_loader()
    call_food_search_api(current_user_query, user_latitude, user_longitude)
  }
  else{
    stop_location_gif = false;
    run_location_loader();
    setTimeout(stop_location_loader, 1000);
    document.getElementsByClassName('ask-location-modal')[0].style.display = 'block'
  }
}

function getCsrfToken() {
    var CSRF_TOKEN = "";
    try{
     CSRF_TOKEN = getCookie('csrftoken')
    }
    catch(e){}
    return CSRF_TOKEN;
}
function call_food_search_api(user_query,latitude,longitude){
  var csrf_token = getCsrfToken();
  var xhttp = new XMLHttpRequest();
  var params = 'user_query='+user_query+'&latitude='+latitude+'&longitude='+longitude+'&page_no=1&unique_search_id='
  xhttp.open("POST", "/get-food-list/", true);
  xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhttp.setRequestHeader('x-csrf-token', csrf_token);
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          response = JSON.parse(this.responseText);
          if(response["status"]==200){
            unique_search_id = response["unique_search_id"]
            setCookie("unique_search_id",unique_search_id)
            window.location = "/search-results/";
            // console.log(response)
          }
      }
  }
  xhttp.send(params);
}


function get_price_bifurcation(food_detail_dict){
    vendor = food_detail_dict["vendor"]
    total_price = ""

    if (vendor == "swiggy"){
        total_price = '<p><span>'
        total_price += "Item Price"
        total_price += '</span><span>'
        total_price += food_detail_dict["menu_item_price"]
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Delivery Charges"
        total_price += '</span><span>'
        total_price += food_detail_dict["delivery_charges"]
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Packaging Charges"
        total_price += '</span><span>'
        total_price += food_detail_dict["total_packing_charges"]
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Tax"
        total_price += '</span><span>'
        total_price += food_detail_dict["total_tax"]
        total_price += '</span></p>'
        
        total_price += '<p class="total-price-div"><span>'
        total_price += "Grand total"
        total_price += '</span><span>'
        total_price += food_detail_dict["grand_total"]
        total_price += '</span></p>'
      }
    if (vendor == "zomato"){
        charges_detail_dict = food_detail_dict["charges_detail_dict"]
        for(var key in charges_detail_dict) {
            if (key.toLocaleLowerCase() == "grand total")
                continue;
            total_price += '</span></p>'
            total_price += '<p><span>'
            total_price += (key)
            total_price += '</span><span>'
            total_price += charges_detail_dict[key]
            total_price += '</span></p>'
          }
        total_price += '<p class="total-price-div"><span>'
        total_price += "Grand total"
        total_price += '</span><span>'
        total_price += food_detail_dict['total_price']
        total_price += '</span></p><p>*may have additional delivery charges</p>'
      }
    if (vendor == "u_eats"){
        total_price = '<p><span>'
        total_price += "Item Price"
        total_price += '</span><span>'
        total_price += food_detail_dict["menu_item_price"]
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Delivery Charges"
        total_price += '</span><span>'
        total_price += food_detail_dict["delivery_charges"]
        total_price += '</span></p>'
        total_price += '<p><span>'
        total_price += "Tax"
        total_price += '</span><span>'
        total_price += food_detail_dict["total_tax"]
        total_price += '</span></p>'
        
        total_price += '<p class="total-price-div"><span>'
        total_price += "Grand total"
        total_price += '</span><span>'
        total_price += food_detail_dict["grand_total"]
        total_price += '</span></p>'
        }
    return total_price
  }

function get_rate_prec(rating_no) {
  if (isNaN(rating_no))
    return 0
  return (rating_no/5)*100
}

function get_rate_strng(rating_no){
  if (isNaN(rating_no))
    return "NEW"
  return rating_no

}

function get_numric_value(input_string) {
  try{
    num_string = input_string.match(/\d+/)[0]
    return num_string
  }
  catch(e){
    return input_string
  }
}

function show_price_bif_modal(div_no){
  hide_by_class_name("price-bifurcation-modal")
  document.getElementById("price-bifurcation-modal-"+div_no).style.display="block"
}
function close_price_bif_modal(div_no){
  document.getElementById("price-bifurcation-modal-"+div_no).style.display="none"
}


window.onclick = function(event) {
      if (event.target.classList.contains('price-bifurcation-modal')) {
        hide_by_class_name("price-bifurcation-modal");
      }
    }
document.getElementsByTagName("body")[0].addEventListener("click",function(e){
      if (e.target.classList.contains('mobile-location-info') ||( e.target.id=="address-short") ){
	      stop_location_gif = false;
              run_location_loader();
	      var user_latitude =   getCookie("user_latitude");
              var user_longitude =  getCookie("user_longitude");
              if ((user_latitude !="") && (user_longitude !="")){
                    setMapLocation(user_latitude,user_longitude)
               }
              var addressInfo = getCookie("addressInfo");
              if (addressInfo != ""){
                    document.getElementById('address-input').value = addressInfo;
	      }
              setTimeout(stop_location_loader, 1000);
              document.getElementsByClassName('ask-location-modal')[0].style.display = 'block'
      }
      if (e.target.classList.contains('search-btn')){
	      var user_query = (document.getElementById("food-search-input").value).trim()
              if (user_query==""){
                return;
              }
              setCookie("current_user_query",user_query)
              get_user_search_results()

      }
      if ( e.target.id=="gps-input-bar-icon"){
              stop_location_gif = false;
              run_location_loader();
	      var user_latitude =   getCookie("user_latitude");
              var user_longitude =  getCookie("user_longitude");
              if ((user_latitude !="") && (user_longitude !="")){
                    setMapLocation(user_latitude,user_longitude)
               }
              var addressInfo = getCookie("addressInfo");
              if (addressInfo != ""){
                    document.getElementById('address-input').value = addressInfo;
              }
              setTimeout(stop_location_loader, 1000);
              document.getElementsByClassName('ask-location-modal')[0].style.display = 'block'
      }
});
