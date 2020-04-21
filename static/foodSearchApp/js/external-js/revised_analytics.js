(function($){
  $(function(){
    $('.sidenav').sidenav();
    $('.dropdown-trigger').dropdown();
    $('.tooltipped').tooltip();
    $('.collapsible').collapsible();
    $('.modal').modal();
    $('.tooltipped').tooltip({
        position:"top"
    });
    $('.tabs').tabs();
    $('select').select2({width: "100%"});
    $('.datepicker').datepicker();
  }); // end of document ready
})(jQuery); // end of jQuery name space

var most_frequenct_intent_page = 0;
var least_frequenct_intent_page = 0;
var recently_unanswered_message_page = 0;
var trending_website_page = 0;

function reset_charts(){
    Chart.helpers.each(Chart.instances, function(instance){
       instance.destroy()
    })   
}

$(document).on("change", "#selected-bot-for-analytics", function(e){
    load_analytics();
    load_user_analytics();
    load_message_analytics();
    load_channel_analytics();
    load_session_analytics();
});

// A $( document ).ready() block.
$(document).ready(function() {
    load_analytics();
    load_user_analytics();
    load_message_analytics();
    load_channel_analytics();
    load_session_analytics();
    // setInterval(load_analytics, );
});

function load_analytics(){
    most_frequenct_intent_page = 0;
    least_frequenct_intent_page = 0;
    recently_unanswered_message_page = 0;
    trending_website_page=0;
    load_basic_analytics();
    load_next_most_frequenct_intent();
    load_next_least_frequenct_intent();
    load_next_recently_unanswered_messages();    
    load_next_most_frequenct_website_url();
    load_wordcloud_analytics();
}

function get_selected_bot_id(){
    bot_pk = $("#selected-bot-for-analytics").val();
    return bot_pk;
}

function load_basic_analytics(bot_pk){

    bot_pk = get_selected_bot_id();
    document.getElementById("bot-nps-scode").innerHTML="...";
    document.getElementById("bot-no-answered-query").innerHTML="...";
    document.getElementById("bot-no-messages-today").innerHTML="...";
    document.getElementById("bot-no-users-today").innerHTML="...";
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-basic-analytics/?bot_pk="+bot_pk, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                document.getElementById("bot-no-messages-today").innerHTML=response["number_of_messages_today"];
                document.getElementById("bot-no-users-today").innerHTML=response["number_of_users_today"];
                document.getElementById("bot-no-answered-query").innerHTML=response["number_of_answered_queries"];
                positive_feedback = response["promoter_feedback"];
                negative_feedback = response["demoter_feedback"];
                total_sentences = response["total_feedback"];
                if(total_sentences!=0){
                    positive_feedback = Math.round(((positive_feedback-negative_feedback)*100)/total_sentences);              
                }
                if(positive_feedback<2){
                    document.getElementById("bot-nps-scode").innerHTML="<span style='font-size:12px;'>insufficient data</span>";
                }else{
                    document.getElementById("bot-nps-scode").innerHTML=positive_feedback;
                }
            }
        }
    }
    xhttp.send(params);
}

function load_next_most_frequenct_intent(){
    bot_pk = get_selected_bot_id();
    most_frequenct_intent_page+=1;
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-frequent-intent/?bot_pk="+bot_pk+"&reverse=true&page="+most_frequenct_intent_page, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                intent_html="";
                var i=0;
                for(i=0;i<response["intent_frequency_list"].length;i++){
                    intent_html += '<li>'+response["intent_frequency_list"][i]["intent_name"].substring(0, 40)+'<span class="right"><b>'+response["intent_frequency_list"][i]["frequency"]+'</b> <medium>mes</medium></span></li>';
                }

                if(i<6){
                    for(i;i<5;i++){
                        intent_html += '<li>...<span class="right"><b> </b> <medium> </medium></span></li>';                        
                    }
                }

                if(response["is_last_page"]==false){
                    intent_html += '<li>\
                        <a href="javascript:void(0)" class="right purple-text text-darken-3" onclick="load_next_most_frequenct_intent()">\
                            <i class="material-icons">chevron_right</i>\
                        </a>';                    
                }else{
                    intent_html += '<li>';
                }

                intent_html += '<a href="javascript:void(0)" class="right purple-text text-darken-3" onclick="load_previous_most_frequenct_intent()">\
                        <i class="material-icons">chevron_left</i>\
                    </a>\
                </li>';
                document.getElementById("most-frequenct-intents").innerHTML=intent_html;
            }
        }
    }
    xhttp.send(params);    
}

function load_previous_most_frequenct_intent(){
    bot_pk = get_selected_bot_id();
    most_frequenct_intent_page-=1;
    if(most_frequenct_intent_page<=0){
        most_frequenct_intent_page=1;
    }
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-frequent-intent/?bot_pk="+bot_pk+"&reverse=true&page="+most_frequenct_intent_page, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                intent_html="";
                var i=0;
                for(i=0;i<response["intent_frequency_list"].length;i++){
                    intent_html += '<li>'+response["intent_frequency_list"][i]["intent_name"].substring(0, 40)+'<span class="right"><b>'+response["intent_frequency_list"][i]["frequency"]+'</b> <medium>mes</medium></span></li>';
                }

                if(i<6){
                    for(i;i<5;i++){
                        intent_html += '<li>...<span class="right"><b> </b> <medium> </medium></span></li>';                        
                    }
                }

                intent_html += '<li>\
                    <a href="javascript:void(0)" class="right purple-text text-darken-3" onclick="load_next_most_frequenct_intent()">\
                        <i class="material-icons">chevron_right</i>\
                    </a>\
                    <a href="javascript:void(0)" class="right purple-text text-darken-3" onclick="load_previous_most_frequenct_intent()">\
                        <i class="material-icons">chevron_left</i>\
                    </a>\
                </li>';
                document.getElementById("most-frequenct-intents").innerHTML=intent_html;
            }
        }
    }
    xhttp.send(params);    
}

function load_next_least_frequenct_intent(){
    bot_pk = get_selected_bot_id();
    least_frequenct_intent_page+=1;
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-frequent-intent/?bot_pk="+bot_pk+"&reverse=false&page="+least_frequenct_intent_page, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                intent_html="";
                var i=0;
                for(i=0;i<response["intent_frequency_list"].length;i++){
                    intent_html += '<li>'+response["intent_frequency_list"][i]["intent_name"].substring(0, 40)+'<span class="right"><b>'+response["intent_frequency_list"][i]["frequency"]+'</b> <medium>mes</medium></span></li>';
                }

                if(i<6){
                    for(i;i<5;i++){
                        intent_html += '<li>...<span class="right"><b> </b> <medium> </medium></span></li>';                        
                    }
                }

                if(response["is_last_page"]==false){
                    intent_html += '<li>\
                        <a href="javascript:void(0)" class="right cyan-text text-darken-4" onclick="load_next_least_frequenct_intent()">\
                            <i class="material-icons">chevron_right</i>\
                        </a>';
                }else{
                    intent_html += '<li>';
                }

                intent_html += '<a href="javascript:void(0)" class="right cyan-text text-darken-4" onclick="load_previous_least_frequenct_intent()">\
                        <i class="material-icons">chevron_left</i>\
                    </a>\
                </li>';
                document.getElementById("least-frequenct-intents").innerHTML=intent_html;
            }
        }
    }
    xhttp.send(params);    
}

function load_previous_least_frequenct_intent(){
    bot_pk = get_selected_bot_id();
    least_frequenct_intent_page-=1;
    if(least_frequenct_intent_page<=0){
        least_frequenct_intent_page=1;
    }
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-frequent-intent/?bot_pk="+bot_pk+"&reverse=false&page="+least_frequenct_intent_page, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                intent_html="";
                var i=0;
                for(i=0;i<response["intent_frequency_list"].length;i++){
                    intent_html += '<li>'+response["intent_frequency_list"][i]["intent_name"].substring(0, 40)+'<span class="right"><b>'+response["intent_frequency_list"][i]["frequency"]+'</b> <medium>mes</medium></span></li>';
                }

                if(i<6){
                    for(i;i<5;i++){
                        intent_html += '<li>...<span class="right"><b> </b> <medium> </medium></span></li>';                        
                    }
                }

                intent_html += '<li>\
                    <a href="javascript:void(0)" class="right cyan-text text-darken-4" onclick="load_next_least_frequenct_intent()">\
                        <i class="material-icons">chevron_right</i>\
                    </a>\
                    <a href="javascript:void(0)" class="right cyan-text text-darken-4" onclick="load_previous_least_frequenct_intent()">\
                        <i class="material-icons">chevron_left</i>\
                    </a>\
                </li>';
                document.getElementById("least-frequenct-intents").innerHTML=intent_html;
            }
        }
    }
    xhttp.send(params);    
}

function load_next_recently_unanswered_messages(){
    bot_pk = get_selected_bot_id();
    recently_unanswered_message_page+=1;
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-recently-unanswered-message/?bot_pk="+bot_pk+"&page="+recently_unanswered_message_page, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                intent_html="";
                var i=0;
                for(i=0;i<response["unanswered_message_list"].length;i++){
                    intent_html += '<li>'+response["unanswered_message_list"][i].substring(0, 40)+'</li>';
                }

                if(i<6){
                    for(i;i<5;i++){
                        intent_html += '<li>...<span class="right"><b> </b> <medium> </medium></span></li>';                        
                    }
                }

                if(response["is_last_page"]==false){
                    intent_html += '<li>\
                        <a href="javascript:void(0)" class="right brown-text text-darken-4" onclick="load_next_recently_unanswered_messages()">\
                            <i class="material-icons">chevron_right</i>\
                        </a>';                    
                }else{
                    intent_html += '<li>';
                }

                intent_html+='<a href="javascript:void(0)" class="right brown-text text-darken-4" onclick="load_previous_recently_unanswered_messages()">\
                        <i class="material-icons">chevron_left</i>\
                    </a>\
                </li>';
                document.getElementById("recently-unanswered-messages").innerHTML=intent_html;
            }
        }
    }
    xhttp.send(params);    
}

function load_previous_recently_unanswered_messages(){
    bot_pk = get_selected_bot_id();
    recently_unanswered_message_page-=1;
    if(recently_unanswered_message_page<=0){
        recently_unanswered_message_page=1;
    }
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-recently-unanswered-message/?bot_pk="+bot_pk+"&page="+recently_unanswered_message_page, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                intent_html="";
                var i=0;
                for(i=0;i<response["unanswered_message_list"].length;i++){
                    intent_html += '<li>'+response["unanswered_message_list"][i].substring(0, 40)+'</li>';
                }
                if(i<6){
                    for(i;i<5;i++){
                        intent_html += '<li>...<span class="right"><b> </b> <medium> </medium></span></li>';                        
                    }
                }
                intent_html += '<li>\
                    <a href="javascript:void(0)" class="right brown-text text-darken-4" onclick="load_next_recently_unanswered_messages()">\
                        <i class="material-icons">chevron_right</i>\
                    </a>\
                    <a href="javascript:void(0)" class="right brown-text text-darken-4" onclick="load_previous_recently_unanswered_messages()">\
                        <i class="material-icons">chevron_left</i>\
                    </a>\
                </li>';
                document.getElementById("recently-unanswered-messages").innerHTML=intent_html;
            }
        }
    }
    xhttp.send(params);    
}

function load_trending_website_analytics(){
    trending_website_page=0;
    load_next_most_frequenct_website_url();
}

function load_next_most_frequenct_website_url(){
    bot_pk = get_selected_bot_id();
    start_date = document.getElementById("trending-analytics-start-date").value;
    end_date = document.getElementById("trending-analytics-end-date").value;
    trending_website_page+=1;
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-frequent-window-location/?bot_pk="+bot_pk+"&reverse=true&page="+trending_website_page+"&start_date="+start_date+"&end_date="+end_date, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                website_html="";
                var i=0;
                for(i=0;i<response["window_location_frequency_list"].length;i++){
                    window_location = response["window_location_frequency_list"][i]["window_location"];
                    website_html += '<li><a href="'+window_location+'" target="_blank" class="black-text">'+window_location.substring(0, 50)+'<span class="right"><!--<i class="material-icons">trending_up</i>--></span></li>';
                }
                if(i<6){
                    for(i;i<5;i++){
                        website_html += '<li>...</li>';                        
                    }
                }
                website_html += '<li>\
                    <a href="javascript:void(0)" class="right" onclick="load_next_most_frequenct_website_url()">\
                        <i class="material-icons">chevron_right</i>\
                    </a>\
                    <a href="javascript:void(0)" class="right" onclick="load_previous_most_frequenct_website_url()">\
                        <i class="material-icons">chevron_left</i>\
                    </a>\
                </li>';
                document.getElementById("trending-website").innerHTML=website_html;
                document.getElementById("trending-time-range").innerHTML="<medium>"+response["start_date"]+" to "+response["end_date"]+"</medium>";
            }
        }
    }
    xhttp.send(params);    
}

function load_wordcloud_analytics(){
    bot_pk = get_selected_bot_id();
    start_date = document.getElementById("wordcloud-analytics-start-date").value;
    end_date = document.getElementById("wordcloud-analytics-end-date").value;
    var xhttp = new XMLHttpRequest();
    var params = 'bot_pk='+bot_pk+'&start_date='+start_date+'&end_date='+end_date;
    xhttp.open("POST", "/chat/get-word-cloud/", true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                make_wordcloud(response["wordcloud_data"])
                               $("#download-word-cloud-data").show()
                document.getElementById("wordcloud-time-range").innerHTML="<medium>"+response["start_date"]+" to "+response["end_date"]+"</medium>";
                document.getElementById("wordcloud-big-time-range").innerHTML="<medium style='font-size:large'><b>Time Period: </b>"+response["start_date"]+" to "+response["end_date"]+"</medium>";
            }
        }
    }
    xhttp.send(params); 
}

function make_wordcloud(data_list) {
    if (data_list.length ==0){
        var canvas_small = document.getElementById("word_cloud_small_no_data"),
        ctx = canvas_small.getContext("2d")

        ctx.fillStyle = "#003300";
        ctx.font = '20px san-serif';

        var textString = "Insufficient Data",
            textWidth = ctx.measureText(textString ).width;


        ctx.fillText(textString , (canvas_small.width/2) - (textWidth / 2), 100);
        $("#word_cloud_small_no_data").show()
        $("#word_cloud_small").hide()
        $("#open-modal-wordcloud-full-window").hide()
        return
    }
    $("#word_cloud_small_no_data").hide()
    $("#word_cloud_small").show()
    $("#open-modal-wordcloud-full-window").show()
    list = [];
    for (var i in data_list) {
      list.push([data_list[i]["word"], data_list[i]["freq"]])
    }

        WordCloud.minFontSize = "15px"
    WordCloud(document.getElementById('word_cloud_small'), { list: list,
      gridSize: 16,
      weightFactor: 32,
      fontFamily: 'Finger Paint, cursive, sans-serif',
      color: '#2E7D32   ',
      hover: window.drawBox,
      hover: function(item) {
        try {
            document.getElementById("wordcloud-freq-info").innerHTML="<medium style='font-size:medium'>"+item[0] + ': ' + item[1]+"</medium>";
            // $("#wordcloud-freq-info").show()
        }
        catch(err) {
            $("#wordcloud-freq-info").hide()
        }
      },
      backgroundColor: '#C8E6C9'
    } );
    WordCloud(document.getElementById('word_cloud_big'), { list: list,
      gridSize: 16,
      weightFactor: 32,
      fontFamily: 'Finger Paint, cursive, sans-serif',
      color: '#000000',
      hover: window.drawBox,
      hover: function(bigitem) {
        try {
            document.getElementById("wordcloud-big-freq-info").innerHTML="<medium style='font-size:large'><b>Word: </b>"+bigitem[0] + '<br><b>Freq: </b>' + bigitem[1]+"</medium>";
            $("#wordcloud-big-freq-info").show()
        }
        catch(err) {
            document.getElementById("wordcloud-big-freq-info").innerHTML="<medium style='font-size:large'><b>Word: </b>-<br><b>Freq: </b>-</medium>";
        }
      },
      backgroundColor: 'transparent'
    } );
}

function load_previous_most_frequenct_website_url(){
    bot_pk = get_selected_bot_id();
    start_date = document.getElementById("trending-analytics-start-date").value;
    end_date = document.getElementById("trending-analytics-end-date").value;

    trending_website_page-=1;
    if(trending_website_page<=0){
        trending_website_page=1;
    }
    var xhttp = new XMLHttpRequest();
    var params = '';
    xhttp.open("GET", "/chat/get-frequent-window-location/?bot_pk="+bot_pk+"&reverse=true&page="+trending_website_page+"&start_date="+start_date+"&end_date="+end_date, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                website_html="";
                var i=0;
                for(i=0;i<response["window_location_frequency_list"].length;i++){
                    window_location = response["window_location_frequency_list"][i]["window_location"];
                    website_html += '<li><a href="'+window_location+'" target="_blank" class="black-text">'+window_location.substring(0, 40)+'</li>';
                }

                if(i<7){
                    for(i;i<6;i++){
                        website_html += '<li>...</li>';                        
                    }
                }

                website_html += '<li>\
                    <a href="javascript:void(0)" class="right" onclick="load_next_most_frequenct_website_url()">\
                        <i class="material-icons">chevron_right</i>\
                    </a>\
                    <a href="javascript:void(0)" class="right" onclick="load_previous_most_frequenct_website_url()">\
                        <i class="material-icons">chevron_left</i>\
                    </a>\
                </li>';
                document.getElementById("trending-website").innerHTML=website_html;
                document.getElementById("trending-time-range").innerHTML="<medium>"+response["start_date"]+" to "+response["end_date"]+"</medium>";
            }
        }
    }
    xhttp.send(params);    
}

var dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
};


function load_channel_analytics(){
    // reset_charts();
    Chart.helpers.each(Chart.instances, function(instance){
        if(instance.chart.canvas.id=="channel-analytics"){
            instance.destroy();
        }
    });

    bot_pk = get_selected_bot_id();
    start_date = document.getElementById("channel-analytics-start-date").value;
    end_date = document.getElementById("channel-analytics-end-date").value;
    var xhttp = new XMLHttpRequest();
    var params = 'bot_pk='+bot_pk+'&start_date='+start_date+'&end_date='+end_date;
    xhttp.open("POST", "/chat/get-channel-analytics/", true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){

                channel_list = [];
                message_count_list = [];
                for(var channel in response["channel_dict"]){
                    channel_list.push(channel);
                    message_count_list.push(response["channel_dict"][channel]);
                }

                label = "Channel Usage ("+response["start_date"]+" to "+response["end_date"]+")";

                channel_pie_data = {
                    datasets: [{
                        fill: true,
                        backgroundColor: ["#23BCD4", "#FE9A3D", "#309688", "#5F7D8B", "#EA4463"],
                        data: message_count_list
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: channel_list
                };

                var options = {
                    title: {
                              display: true,
                              text: label,
                              position: 'top'
                          }
                    }

                var canvas = document.getElementById("channel-analytics");

                var piechart = new Chart(canvas.getContext('2d'),{
                    type: 'doughnut',
                    data: channel_pie_data,
                    options: options
                });
            }

        }
    }
    xhttp.send(params);    
}

function load_user_analytics(){
    // reset_charts();
    Chart.helpers.each(Chart.instances, function(instance){
        if(instance.chart.canvas.id=="user-analytics"){
            instance.destroy();
        }
    });

    bot_pk = get_selected_bot_id();
    filter_type = document.getElementById("user-analytics-select-type").value;
    start_date = document.getElementById("user-analytics-start-date").value;
    end_date = document.getElementById("user-analytics-end-date").value;
    var xhttp = new XMLHttpRequest();
    var params = 'bot_pk='+bot_pk+'&start_date='+start_date+'&end_date='+end_date+'&filter_type='+filter_type;
    xhttp.open("POST", "/chat/get-user-analytics/", true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                label_list = [];
                no_users_list = [];
                min_users = 1;
                max_users = 1;
                for(var i=0;i<response["user_analytics_list"].length;i++){
                    label_list.push(response["user_analytics_list"][i]["label"]);
                    count = response["user_analytics_list"][i]["count"];
                    no_users_list.push(count);
                    min_users = Math.min(min_users, count);
                    max_users = Math.max(max_users, count);
                }                

                min_step_size = Math.max(5, Math.ceil((max_users-min_users)/5));
                start_date = response["start_date"];
                end_date = response["end_date"];
                label = "Number of users";
                document.getElementById("user-analytics-datetime-range").innerHTML="("+start_date+" to "+end_date+")";

                new Chart(document.getElementById("user-analytics"), {
                    type: 'line',
                    data:{
                      labels: label_list,
                      datasets: [{
                          label: label,
                          fill: true,
                          lineTension: 0.1,
                          backgroundColor: "#20b2c9",
                          // borderColor: "#4527a0",
                          borderCapStyle: 'butt',
                          borderDash: [],
                          borderDashOffset: 0.0,
                          borderJoinStyle: 'miter',
                          pointBorderColor: "white",
                          pointBackgroundColor: "black",
                          pointBorderWidth: 1,
                          pointHoverRadius: 8,
                          pointHoverBackgroundColor: "brown",
                          pointHoverBorderColor: "yellow",
                          pointHoverBorderWidth: 2,
                          pointRadius: 4,
                          pointHitRadius: 10,
                          // notice the gap in the data and the spanGaps: false
                          data: no_users_list,
                          spanGaps: false,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: { display: true },
                        // title: {
                        //     display: true,
                        //     text: "Daily User analytics"
                        // },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    display: true,
                                    labelString: "No of users",
                                    beginAtZero:true,
                                    stepSize: min_step_size,
                                }
                            }]
                        }
                    }
                });
            }
        }
    }
    xhttp.send(params);
}


function load_message_analytics(){
    // reset_charts();
    Chart.helpers.each(Chart.instances, function(instance){
        if(instance.chart.canvas.id=="message-analytics"){
            instance.destroy();
        }
    });

    bot_pk = get_selected_bot_id();
    filter_type = document.getElementById("message-analytics-select-type").value;
    start_date = document.getElementById("message-analytics-start-date").value;
    end_date = document.getElementById("message-analytics-end-date").value;
    var xhttp = new XMLHttpRequest();
    var params = 'bot_pk='+bot_pk+'&start_date='+start_date+'&end_date='+end_date+'&filter_type='+filter_type;
    xhttp.open("POST", "/chat/get-message-analytics/", true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                label_list = [];
                total_messages_list = [];
                total_answered_messages_list = [];
                total_unanswered_messages_list = [];

                min_messages = 1;
                max_messages = 1;

                for(var i=0;i<response["message_analytics_list"].length;i++){
                    label_list.push(response["message_analytics_list"][i]["label"]);
                    total_messages = response["message_analytics_list"][i]["total_messages"];
                    total_answered_messages = response["message_analytics_list"][i]["total_answered_messages"];
                    total_unanswered_messages = response["message_analytics_list"][i]["total_unanswered_messages"];

                    total_messages_list.push(total_messages);
                    total_answered_messages_list.push(total_answered_messages);
                    total_unanswered_messages_list.push(total_unanswered_messages);
                    min_messages = Math.min(min_messages, total_messages);
                    max_messages = Math.max(max_messages, total_messages);
                }

                min_step_size = Math.max(5, Math.ceil((max_messages-min_messages)/5));
                start_date = response["start_date"];
                end_date = response["end_date"];
                label = "Number of messages";
                document.getElementById("message-analytics-datetime-range").innerHTML="("+start_date+" to "+end_date+")";

                new Chart(document.getElementById("message-analytics"), {
                    type: 'line',
                    data:{
                      labels: label_list,
                      datasets: [{
                          label: "No. of answered messages",
                          fill: true,
                          lineTension: 0.1,
                          backgroundColor: "#8bc349",
                          // borderColor: "#609b1b",
                          borderCapStyle: 'butt',
                          borderDash: [],
                          borderDashOffset: 0.0,
                          borderJoinStyle: 'miter',
                          pointBorderColor: "white",
                          pointBackgroundColor: "black",
                          pointBorderWidth: 1,
                          pointHoverRadius: 8,
                          pointHoverBackgroundColor: "brown",
                          pointHoverBorderColor: "yellow",
                          pointHoverBorderWidth: 2,
                          pointRadius: 4,
                          pointHitRadius: 10,
                          // notice the gap in the data and the spanGaps: false
                          data: total_answered_messages_list,
                          spanGaps: false,
                        },{
                          label: "Total number of messages",
                          fill: true,
                          lineTension: 0.1,
                          backgroundColor: "#ff9700",
                          // borderColor: "#609b1b",
                          borderCapStyle: 'butt',
                          borderDash: [],
                          borderDashOffset: 0.0,
                          borderJoinStyle: 'miter',
                          pointBorderColor: "white",
                          pointBackgroundColor: "black",
                          pointBorderWidth: 1,
                          pointHoverRadius: 8,
                          pointHoverBackgroundColor: "brown",
                          pointHoverBorderColor: "yellow",
                          pointHoverBorderWidth: 2,
                          pointRadius: 4,
                          pointHitRadius: 10,
                          // notice the gap in the data and the spanGaps: false
                          data: total_messages_list,
                          spanGaps: false,
                        }
                        // },{
                        //   label: "No of unanswered messages",
                        //   fill: false,
                        //   lineTension: 0.1,
                        //   backgroundColor: "#FFFDE7",
                        //   borderColor: "#ef6c00",
                        //   borderCapStyle: 'butt',
                        //   borderDash: [],
                        //   borderDashOffset: 0.0,
                        //   borderJoinStyle: 'miter',
                        //   pointBorderColor: "white",
                        //   pointBackgroundColor: "black",
                        //   pointBorderWidth: 1,
                        //   pointHoverRadius: 8,
                        //   pointHoverBackgroundColor: "brown",
                        //   pointHoverBorderColor: "yellow",
                        //   pointHoverBorderWidth: 2,
                        //   pointRadius: 4,
                        //   pointHitRadius: 10,
                        //   // notice the gap in the data and the spanGaps: false
                        //   data: total_unanswered_messages_list,
                        //   spanGaps: false,
                        // }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: { display: true },
                        title: {
                            display: true,
                            text: label
                        },
                        scales: {
                            yAxes: [{
                                // stacked: true,
                                ticks: {
                                    display: true,
                                    labelString: "No of messages",
                                    beginAtZero:true,
                                    stepSize: min_step_size,
                                }
                            }]
                        }
                    }
                });
            }
        }
    }
    xhttp.send(params);
}


function capture_screenshot(element){
    element.style.display="none";
    M.toast({"html":"Exporting pdf..."}, 2000);
    html2canvas(document.querySelector("#capture-html-to-canvas")).then(canvas => {
        var imgData = canvas.toDataURL('image/png');
        width = window.outerWidth;
        height = window.outerHeight;
        var doc = new jsPDF('p', 'px', [height, width]); //210mm wide and 297mm high
        doc.addImage(imgData, 'PNG', 10, 10);
        doc.save('sample.pdf');        
        element.style.display="block";
    });
}


function export_most_frequent_questions(){
    bot_pk = get_selected_bot_id();
    url= "/chat/export-frequent-intent/?bot_pk="+bot_pk+"&reverse=true";
    window.location = url;
}

function export_least_frequent_questions(){
    bot_pk = get_selected_bot_id();
    url= "/chat/export-frequent-intent/?bot_pk="+bot_pk+"&reverse=false";
    window.location = url;    
}

function export_unanswered_questions(){
    bot_pk = get_selected_bot_id();
    url="/chat/export-unanswered-intent/?bot_pk="+bot_pk+"&reverse=false";
    window.location = url;    
}

function load_session_analytics(){
    bot_pk = get_selected_bot_id();
    start_date = document.getElementById("session-analytics-start-date").value;
    end_date = document.getElementById("session-analytics-end-date").value;
    document.getElementById("ave-no-of-messages-per-session").innerHTML="...";
    document.getElementById("ave-session-time").innerHTML="...";
    document.getElementById("no-of-likes").innerHTML="...";
    document.getElementById("percentage-of-likes").innerHTML="...";
    var xhttp = new XMLHttpRequest();
    var params = 'bot_pk='+bot_pk+'&start_date='+start_date+'&end_date='+end_date;
    xhttp.open("POST", "/chat/get-session-analytics/", true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            if(response["status"]==200){
                document.getElementById("ave-no-of-messages-per-session").innerHTML="<b>"+response["ave_number_of_messages_per_session"]+"</b> <medium>mes</medium> <i class='material-icons red-text text-darken-3 inline-icon'>message</i>";
                if(response["ave_time_spent_time_user"]>60){
                    ave_time_spent_time_user = Math.round((response["ave_time_spent_time_user"])/60);
                    document.getElementById("ave-session-time").innerHTML="<b>"+ave_time_spent_time_user+"</b> <medium>min</medium> <i class='material-icons red-text text-darken-3 inline-icon'>timer</i>";
                }else{
                    document.getElementById("ave-session-time").innerHTML="<b>"+response["ave_time_spent_time_user"]+"</b> <medium>sec</medium> <i class='material-icons red-text text-darken-3 inline-icon'>timer</i>"; 
                }

                total_messages = response["total_messages"];
                no_of_likes =response["no_of_likes"];
                no_of_dislikes = response["no_of_dislikes"];
                percentage_likes = 0;
                if(total_messages!=0){
                    percentage_likes = Math.round(((total_messages-no_of_dislikes)*100)/total_messages);              
                }
                if(no_of_likes==0){
                    percentage_likes = 0;
                }
                document.getElementById("no-of-likes").innerHTML="<b>"+response["no_of_likes"]+"</b> <i class='material-icons red-text text-darken-3 inline-icon'>thumb_up</i> <medium></medium>";
                document.getElementById("percentage-of-likes").innerHTML="<b>"+percentage_likes+"</b> <medium>%</medium>";
                document.getElementById("session-time-range").innerHTML=response["start_date"]+" to "+response["end_date"];
            }
        }
    }
    xhttp.send(params);    
}