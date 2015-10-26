function getFileNameFromPath(path) {
  var ary = path.split("/");
  return ary[ary.length - 1];
}

//Reset Password
function resetpassword()
{
  //alert("asdas");
  event.preventDefault();
  var email = jQuery("#fld_rp_email").val();
  var main_url = server_url+'gamification/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
          jQuery.ajax({
             url:main_url,
             dataType:"json",
             method:"POST",
             data:{email_sms_reset:email},
             success:function(resp){ 
                //alert(resp)
                if(resp.login_success != '')
                {
                   alert(resp.login_success);
                }
                else
                {
                  alert(resp.login_error);
                }
          }
          
          });      
}

function removeprofileimage()
{
    var main_url = server_url+'api/index.php/auth/removeUserImage?XDEBUG_SESSION_START=PHPSTORM';
          jQuery.ajax({
             url:main_url,
             dataType:"json",
             method:"POST",
             success:function(resp){ 
                if(resp.status == 'success')
                {
                   var DIR_Name ='oc_photos';
                    var a = new DirManager();
                    a.create_r(DIR_Name,Log('created successfully'));  
                    var b = new FileManager(); 
                        
                        var img_src = resp.data.image.image_src;		
                        //alert(img_src);		
              				  //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                         var image_name = getFileNameFromPath(img_src);
                        
                       var STR = server_url+"api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image="+img_src;
							        
							     
    							      jQuery.ajax({
    										 url:STR,
    										 dataType:"html",
    										 success:function(DtatURL){ 
    										
                         //alert(DtatURL);  
    								//adb logcat *:E		 
    										 // alert(obj.data.image.image_src);
    							  b.download_file(DtatURL,DIR_Name+'/',image_name,function(theFile){ 
                     
                          var ImgFullUrl =  '';
                          ImgFullUrl = theFile.toURI();  
                            //alert(ImgFullUrl);
                          db.transaction(function (tx) { 
                            tx.executeSql('update OCEVENTS_user set image_src = "'+ImgFullUrl+'",is_user_image="false" where user_id = "'+localStorage.user_id+'"');
                            
                               window.location.href="profile.html";
                            
                          }); 
                          
                          });
                          }
                          }); 
                }
             }
             
             });
}

//function to update profile
function saveprofile()
{
   jQuery(document).ready(function($)
  {
   // event.preventDefault();
   
    var fname =  $("#fname_edit").val(); 
    var lname =  $("#lname_edit").val();
    var email =  $("#email_edit").val();
    var repeat_email =  $("#emailrepeat_edit").val();
    var mobile =  $("#mobile_edit").val();
    var password =  $("#pwd_edit").val();
    var password_repeat =  $("#pwdrepeat_edit").val();
    if(fname == '')
    {
      alert("Please Enter First Name");
      $("#fname_edit").focus();
      return false;
    }
    if(lname == '')
    {
      alert("Please Enter Last Name");
      $("#lname_edit").focus();
      return false;
    }
    
    if(email == '')
    {
      alert("Please Enter Your Email Address");
      $("#email_edit").focus();
      return false;
    }
    if(repeat_email != '')
    {
        if(email != repeat_email)
        {
            alert("Emails Don't Match");
            $("#emailrepeat_edit").focus();
            return false;
        }
    }
    if(mobile == '')
    {
        alert("Please Enter Mobile Number");
        $("#mobile_edit").focus();
        return false;         
    }
    if(password != '')
    {
        if(password !== password_repeat)
        {
            alert("Passwords Don't Match");
            $("#pwdrepeat_edit").focus();
            return false;  
        }
    }
     email = base64_encode(email);
     repeat_email = base64_encode(repeat_email);
     password = base64_encode(password);
     password_repeat = base64_encode(password_repeat);
    //alert(mobile);
    var main_url = server_url+'api/index.php/auth/updateUser?XDEBUG_SESSION_START=PHPSTORM';
       // alert('here');
        $.ajax({
           url:main_url,
           dataType:"json",
           method:"POST",
           data:{first_name : fname,last_name : lname,mobile : mobile,password : password,password_repeat : password_repeat,email : email,email_repeat : repeat_email},
           success:function(obj){ 
               //alert(obj.status);
               if(obj.status == 'success')
               {
                  db.transaction(function (tx) { 
                 tx.executeSql("update OCEVENTS_user set email = '"+obj.data.email+"',first_name = '"+obj.data.first_name+"',last_name = '"+obj.data.last_name+"',mobile = '"+obj.data.mobile+"' where user_id = '"+obj.data.id+"'");
                    $(".success_message").show();
                     $('#edited_success').focus();
                     setTimeout(function() {
                        $('.success_message').fadeOut('slow');
                    }, 4000);
                   
                     $(".myname").html(obj.data.first_name+" "+obj.data.last_name); 
                      $(".myemail").html(obj.data.email);
                      $(".mymobile").html(obj.data.mobile); 
                      //$(".log-info p").html("<p>"+obj.data.first_name+" "+obj.data.last_name+"<br><strong>&lt; "+obj.data.team+" &gt; </strong><br></p>");
            $(".firstname a").html(obj.data.first_name);
            $(".lastname a").html(obj.data.last_name);
            $(".edit_info_user").addClass('hidden'); 
                     $(".show_info_user").removeClass('hidden'); 
                  //$(".user-info-cancel-btn").trigger("click");  
                  });          
               }
               else
               {
                 alert(obj.message);
               }
               //alert(obj.message);
           }
           
       });    
    
    
  });
}

   
function loginme()
{
  jQuery(document).ready(function($)
  {
      //adb logcat *:E
      event.preventDefault();
      $("#login_submit").hide();
      $(".loading").show();
      var fld_l_email = $("#fld_l_email").val();
      var fld_l_password = $("#fld_l_password").val();
      if(fld_l_email == '')
      {
        alert("Please Enter Your Email");
        return false;
      }
      else if(fld_l_password == '')
      {
        alert("Please Enter Your Password");
        return false;
      }
      else
      {
        var email = base64_encode(fld_l_email);
        var pwd = base64_encode(fld_l_password);
        var main_url = server_url+'api/index.php/auth/login?XDEBUG_SESSION_START=PHPSTORM';
       // alert('here');
        $.ajax({
           url:main_url,
           dataType:"json",
           method:"POST",
           data:{email : email,password : pwd},
           success:function(obj){                
              //alert(obj.status);
              if(obj.status == 'error')
              {
                alert(obj.message);
                $("#login_submit").show();
                $(".loading").hide();
              }
              else
              {
          
                var DIR_Name ='oc_photos';
                var a = new DirManager();
                a.create_r(DIR_Name,Log('created successfully'));  
                         
                     var b = new FileManager();  
                     //alert(obj.data.image.image_src);	
                     var img_src = 	obj.data.image.image_src;				
              				
                     //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                     var image_name = getFileNameFromPath(img_src);
                    // alert(img_src);
                    //  alert(image_name);
                       var STR = server_url+"api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image="+img_src;
							        
							     
							      $.ajax({
										 url:STR,
										 dataType:"html",
										 success:function(DtatURL){ 
										// DtatURL ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOYAAADmCAMAAAD2tAmJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAG9QTFRF29vb/Pz8/v7+/f39+/v7+vr68fHx8vLy+fn58/Pz9fX19vb29PT08PDw+Pj49/f3////7+/v7u7u7e3t7Ozs6+vr3Nzc4uLi5+fn6urq4ODg5eXl6enp4+Pj5ubm3t7e39/f6Ojo4eHh3d3d5OTk7uBouAAABQtJREFUeNrs3Amy2jgQBuCeZGI/sIHgRba8L9z/jOElVTMJAQNWN3RL+k/QX2m3ZcN3JwKe6Zme6ZlvZH5xIp7pmZ7pmZ7pmZ7pmZ5pM/OrE/FMz/RMz/RMz/RMz3SU+Y8T8UzP9EzP9EzP9EzP9Eybmf86Ec/0TM/0TKeYGweY23yAX2nL49ZG5scmr2f4I3OdHqxiHpoJrmcogw9LmNsWFtOSNyp8I09Uwv0MTT6lEVkN9Eyt4OEUoVBmWMFTKfYSmRqejYrFMeMKgIeTkpkoWBO1F8UcYWVOgpj7DlYnFMPcV+uVUERCmEZKgH4vgmmo/JyHtACmsRKgw2V+EKQDhFQbxIoomBpwkrJmBoCVkTHzoNCYkPNlFoCYI1dmiqkEdeDJxOyyP/e3PJkdICfgyNxiK6HgyERvTIANPyZ+YyItnsC9MUGhMPeIiYEiIUJlqMyGhNlwY/YkzIIZMyRRgmLGrGmYEPFi9kTMHSsmUZ/lxsypmA0rZuEGE5xghqyZB6xkdEzz4vCYjRtMshkIEjeYOzeYgRvMgxPM3g1mwYpZM15PJKybCSumpmJuMZgRVo5EyhajODxmTMRMeTEjmmckKmLGbEmYHTcmzRy048YkOVdXETdmVBEwNT8mxaO9mB8zZrpoIjMjposmLjOumS6aqMxdz3aePTO3WJlIdnpIxaExA5LNQc+NmRCdwpxgKm7MDQlz4sbckpzDGnbME8mTaHZMijdiw5Ydk6LXNgyZBBf2EobMEZ+Zu8Ec0ZgxWgim2hKrNkTm5JkWMQk6bcOQuSM4bjJkEjRnzJEZIn9RBAVLZlwiMzVPJnJzqpgnM9Y8lxNsZox5ShkQ64INatIBy1iUIWJdyMwzFOV+UIFcFTpzs8HouCV/JsarlJE/E2P1TN1gJm4wN04wBzeYkxvMUgAT4T8WGp0ZogfhhW6CXRMBMzTf7oUSmMb3pAcRzJ3p6boVwQxNr5w2Mpimc20qgxmaHa5VKIRptkOopDDNvmLopDDD2YSZiWFWvIYmFdNkcBYUzIAkJm/HGoJ6iJiBwbWSRBDzuHrDVwWCmMHa1ykqE8UMVk62ZSCLeeLTZQmZK/9dX8piHtfu3jtRzPVHzlYQ0+Rg3Yphmj0+GGUwj6ZfOGp85g492WyoPG8RsGvCZ2K8xUV3YjM1zl0SpTkzE7z/r5wSrsykxrzlNY8smbhIZCiwRf6E1gknZkr2TyRVp1yYegLKYExG5syxB+Io864LpkNyhhdE1abMo0HSk4IXZR5NCj0aMLMCXpm5zt/A1BW8Pn1Vl1rrVzCzsa5meHNUVXQ5HXNs3y78zTqVKQEzaxVwyzQiM98yGB+ZmkpEJlfkg9DHmNkErDNrDGangHum1JSZVSAgSpsxtQIZaZeYyZ10ICZVelNxj1mAoPTZSqYo5ecAXcUUprztBKuUZ2f+NFOg8tb4XGDWIDL9c8wGhKZ9hpkpqUwYn2AOYpXXpiGwa2D+yvA3M72aXElmQnfpucGcRCvP3fYh5gjCUzzEHKQzQT/AFN+Yn08T7jPlN+Zlc15jNhYo4XSXOdnAVPeYwtfMq2vnFWZnhRKqO8zKDibki8zcEuUfvRayy3S2MKffUH8zC1uYapHZ28KEcYlpjRLqBWZpD7NYYJ7sYQ4LzNYe5rzAHOxhgiNMfZvZW8QsbzPBTmZ+EZuY3f+qC2VjE7O9ySw9U94Z5Saztok5/Mf6IcAA9XRtorhYvhYAAAAASUVORK5CYII=';
                     //alert(DtatURL);  
								//adb logcat *:E		 
										 // alert(obj.data.image.image_src);
							  b.download_file(DtatURL,DIR_Name+'/',image_name,function(theFile){ 
                 
                      var ImgFullUrl =  '';
                      ImgFullUrl = theFile.toURI();
                     // alert(ImgFullUrl);
                      db.transaction(function (tx) { 
                            tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_user (id integer primary key autoincrement,team,position,fb_user_id,fb_email,birthday_date,website, user_id, email, first_name, last_name,mobile, image_src, is_user_image, created,gender,player_code)');
                  				tx.executeSql("delete from OCEVENTS_user");
                          tx.executeSql('INSERT INTO OCEVENTS_user (team,position,fb_user_id,fb_email,birthday_date,website,user_id,email,first_name,last_name,mobile,image_src,is_user_image,created,gender,player_code) VALUES ("'+obj.data.team+'","'+obj.data.position+'","'+obj.data.fb_user_id+'","'+obj.data.fb_email+'","'+obj.data.birthday_date+'","'+obj.data.website+'","'+obj.data.id+'","'+obj.data.email+'","'+obj.data.first_name+'","'+obj.data.last_name+'","'+obj.data.mobile+'","'+ImgFullUrl+'","'+obj.data.image.is_user_image+'","'+obj.data.created+'","'+obj.data.gender+'","'+obj.data.player_code+'")');
                      localStorage.user_id = obj.data.id; 
                      login_process();
                      });
                });
                
							 }	 
							});
                
                           
              
              
           }
           
      }
   });
   }
   });
   }
   
      
 
function base64_encode(data) {

  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = '',
    tmp_arr = [];

  if (!data) {
    return data;
  }

  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1 << 16 | o2 << 8 | o3;
                                                   
    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  var r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}
//Link your facebook account
function linkwithfacebook()
{
  jQuery(document).ready(function($)
  {
      
      if (!window.cordova) {
          var appId = prompt("Enter FB Application ID", "");
          facebookConnectPlugin.browserInit(appId);
      }
      facebookConnectPlugin.login( ["email"],
         function (response) { 
            
           
             var newstr=JSON.stringify(response.authResponse.userID).replace(/\"/g,'');
             var access_token=JSON.stringify(response.authResponse.accessToken).replace(/\"/g,'');
            
             var encoded_newstr =  base64_encode(newstr);
             var encoded_access_token =  base64_encode(access_token);
             //alert(encoded_access_token);
             //alert(encoded_newstr);
            // $("#login_submit").hide();
            // $(".loading").show();
             var main_url = server_url+'api/index.php/auth/FBUpdateData?XDEBUG_SESSION_START=PHPSTORM';
                  jQuery.ajax({
                     url:main_url,
                     dataType:"json",
                     method:"POST",
                     data:{fb_access_token : encoded_access_token,fb_user_id : encoded_newstr,event_id : "100000"},
                     success:function(obj){
                       //alert(obj.status);
                       //alert(obj.message);
                       if(obj.status == "success")
                       {
                         //alert(obj.message);
                         var fb_uid = obj.data.fb_user_id;
                          db.transaction(function (tx) { 
                            tx.executeSql('update OCEVENTS_user set fb_user_id = "'+fb_uid+'" where user_id = "'+localStorage.user_id+'"');
                            
                               window.location.href="profile.html";
                            
                          }); 
                       }
                       else
                       {
                         localStorage.user_fid = ''; 
                         
                         alert("Error in Fb Login");
                        
                          
                       }
                     }
                     });
                     
                  
             },
              function (response) { alert(JSON.stringify(response)); });
              });
}

var fbLoginSuccess = function () {
		facebookConnectPlugin.login( ["email"],
         function (response) { 
            
           
             var newstr=JSON.stringify(response.authResponse.userID).replace(/\"/g,'');
             var access_token=JSON.stringify(response.authResponse.accessToken).replace(/\"/g,'');
            
             var encoded_newstr =  base64_encode(newstr);
             var encoded_access_token =  base64_encode(access_token);
            
             var main_url = server_url+'api/index.php/auth/FBRemoveData?XDEBUG_SESSION_START=PHPSTORM';
                  jQuery.ajax({
                     url:main_url,
                     dataType:"json",
                     method:"POST",
                     data:{fb_access_token : encoded_access_token,fb_user_id : encoded_newstr,event_id : "100000"},
                     success:function(obj){
                       //alert(obj.status);
                       if(obj.status == "success")
                       {
                            
                          db.transaction(function (tx) { 
                            tx.executeSql('update OCEVENTS_user set fb_user_id = "" where user_id = "'+localStorage.user_id+'"');
                            
                               window.location.href="profile.html";
                            
                          });
                          }
                        }
                        }); 
                     
                  
             },
              function (response) { alert(JSON.stringify(response)); });
        }


var login = function () {
jQuery(document).ready(function($)
  {
      
      if (!window.cordova) {
          var appId = prompt("Enter FB Application ID", "");
          facebookConnectPlugin.browserInit(appId);
      }
      facebookConnectPlugin.login( ["email"],
         function (response) { 
            
           
             var newstr=JSON.stringify(response.authResponse.userID).replace(/\"/g,'');
             var access_token=JSON.stringify(response.authResponse.accessToken).replace(/\"/g,'');
            
             var encoded_newstr =  base64_encode(newstr);
             var encoded_access_token =  base64_encode(access_token);
             $("#login_submit").hide();
             $(".loading").show();
             var main_url = server_url+'api/index.php/auth/FBlogin?XDEBUG_SESSION_START=PHPSTORM';
                  jQuery.ajax({
                     url:main_url,
                     dataType:"json",
                     method:"POST",
                     data:{fb_access_token : encoded_access_token,fb_user_id : encoded_newstr,event_id : "100000"},
                     success:function(obj){
                      // alert(obj.message);
                       if(obj.status == "success")
                       {
                            
                          						
                        			var DIR_Name ='oc_photos';
                              var a = new DirManager();
                              a.create_r(DIR_Name,Log('created successfully'));  
                              var b = new FileManager();  
                     //alert(obj.data.image.image_src);	
                     var img_src = 	obj.data.image.image_src;				
              				
                     //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                     var image_name = getFileNameFromPath(img_src);
                    // alert(img_src);
                    //  alert(image_name);
                       var STR = server_url+"api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image="+img_src;
							        
							     
    							      $.ajax({
    										 url:STR,
    										 dataType:"html",
    										 success:function(DtatURL){ 
    										
                         //alert(DtatURL);  
    								//adb logcat *:E		 
    										 // alert(obj.data.image.image_src);
    							  b.download_file(DtatURL,DIR_Name+'/',image_name,function(theFile){ 
                     
                          var ImgFullUrl =  '';
                          ImgFullUrl = theFile.toURI();
                         // alert(ImgFullUrl);
                          db.transaction(function (tx) { 
                          tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_user (id integer primary key autoincrement,team,position,fb_user_id,fb_email,birthday_date,website, user_id, email, first_name, last_name,mobile, image_src, is_user_image, created,gender,player_code)');
                  				tx.executeSql("delete from OCEVENTS_user");
                          tx.executeSql('INSERT INTO OCEVENTS_user (team,position,fb_user_id,fb_email,birthday_date,website,user_id,email,first_name,last_name,mobile,image_src,is_user_image,created,gender,player_code) VALUES ("'+obj.data.team+'","'+obj.data.position+'","'+obj.data.fb_user_id+'","'+obj.data.fb_email+'","'+obj.data.birthday_date+'","'+obj.data.website+'","'+obj.data.id+'","'+obj.data.email+'","'+obj.data.first_name+'","'+obj.data.last_name+'","'+obj.data.mobile+'","'+ImgFullUrl+'","'+obj.data.image.is_user_image+'","'+obj.data.created+'","'+obj.data.gender+'","'+obj.data.player_code+'")');
                          localStorage.user_id = obj.data.id; 
                          login_process();
                          });
                    });
                
							 }	 
							});
                                
                               
                         
                         
                       }
                       else
                       {
                         localStorage.user_fid = ''; 
                         
                         alert("Error in Fb Login");
                        
                          
                       }
                     }
                     });
                     
                  
             },
              function (response) { alert(JSON.stringify(response)); });
              });
            }
            
            function logout() {
            //alert('here')
               var main_url = server_url+'api/index.php/auth/logout?XDEBUG_SESSION_START=PHPSTORM';
          jQuery.ajax({
             url:main_url,
             dataType:"json",
             method:"POST",
             success:function(obj){ 
             //alert(obj.status);                       
                if(obj.status == 'success')
                {
                 
                  
                  localStorage.user_id = ''; 
                   if(localStorage.fid != '' && localStorage.fid != undefined && localStorage.fid != null)
                    {
                      facebookConnectPlugin.logout( 
                    function (response) { 
                      //window.location.href="index.html"; 
                    },
                    function (response) { 
                    //alert(JSON.stringify(response)) 
                    });
                    localStorage.fid = '';
                    }
                    
                  
                    window.location.href="index.html"; 
                }
                else
                {
                    localStorage.user_id = '';
                    alert(obj.message);
                    window.location.href="index.html";
                }              
            }
              });
                
            }
        
        
function loadgamification()
{
   //var db = openDatabase('OCEVENTS', '1.0', 'OCEVENTS', 2 * 1024 * 1024);
   db.transaction(function(tx) {  
            tx.executeSql("SELECT * FROM OCEVENTS_user where user_id = '"+localStorage.user_id+"'",[],function (tx, results) {
            var len = results.rows.length;              
            //alert(results.rows.item(0).image_src);
            $("#profile_pic").attr("style","background-image:url("+results.rows.item(0).image_src+")");
            //$("#profile_pic").html("<img src="+results.rows.item(0).image_src+" />");
            $("#medium_profile_pic").attr("style","background-image:url("+results.rows.item(0).image_src+")");
            
            $(".log-info p").html("<p>"+results.rows.item(0).first_name+" "+results.rows.item(0).last_name+"<br><strong>&lt; "+results.rows.item(0).team+" &gt; </strong><br></p>");
            $(".firstname a").html(results.rows.item(0).first_name);
            $(".team-name").html("&lt; "+results.rows.item(0).team+" &gt;")
            $(".lastname a").html(results.rows.item(0).last_name);  
            $(".fa-trophy").html("<span>#</span>"+ results.rows.item(0).position);                
        });
             //alert("SELECT * FROM OCEVENTS_homepage where user_id = '"+localStorage.user_id+"'");
         tx.executeSql("SELECT * FROM OCEVENTS_homepage where user_id = '"+localStorage.user_id+"'",[],function (tx, results) {
            var len = results.rows.length;  
//            alert(results.rows.item(0).main_logo_small_image);
            if(results.rows.item(0).type == 'content')
            {            
              if(results.rows.item(0).main_logo_small_image != undefined && results.rows.item(0).main_logo_small_image != null && results.rows.item(0).main_logo_small_image != '')
              {
                  $(".logo_inner").attr('src',results.rows.item(0).main_logo_small_image);
              }
              if(results.rows.item(0).main_banner_image != undefined && results.rows.item(0).main_banner_image != null && results.rows.item(0).main_banner_image != '')
              {
                $(".main_banner_image").attr('src',results.rows.item(0).main_banner_image);
              }
              
              $(".welcome-title h1").html(results.rows.item(0).main_title); 
              $(".welcome-content").html(results.rows.item(0).main_text); 
            }
            else if (results.rows.item(0).type == 'url')
            {
              // var ref = window.open('http://apache.org', '_system', 'location=yes');
              
               $(".main-container").html('<iframe src='+results.rows.item(0).iframe_url+' id="homepage-content" />'); 
            }
            else
            {
                $(".main-container").html("No Module Found");
            }          
        });        
      });
}
function onFail(message) {
      alert('Failed because: ' + message);
    }

function getPhoto(source) {
      // Retrieve image file location from specified source
		navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,destinationType: destinationType.NATIVE_URI,sourceType: source });
    }
    // Called when a photo is successfully retrieved
    function onPhotoURISuccess(imageURI) {
     
      var imageData = imageURI;
     
    //  alert(imageData);          
      var photo_ur = imageData;                  
      var options = new FileUploadOptions();
      var imageURI = photo_ur;
      options.fileKey="image";
      if (imageURI.substr(imageURI.lastIndexOf('/')+1).indexOf(".") >= 0){
                      var newfname = imageURI.substr(imageURI.lastIndexOf('/')+1);
      }
      else
      {
          var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/')+1))+'.jpg';
      }
      options.fileName=newfname;
     // alert(newfname);
      options.mimeType="image/jpeg";
      var params = new Object();
      options.params = params;
      options.headers = "Content-Type: multipart/form-data; boundary=38516d25820c4a9aad05f1e42cb442f4";
      options.chunkedMode = false;
                  var ft = new FileTransfer();
                  //alert(imageURI);
                  ft.upload(imageURI, encodeURI(server_url+"api/index.php/auth/updateUserImage"), win, fail, options);
                  
                  function win(r) {
                        //alert("Code = " + r.responseCode.toString());
                        //alert("Response = " + r.response.message);
                        var resp = JSON.parse(r.response);
                        //alert(resp.status);
                       if(resp.status == 'success')
                       {
                        // alert('here')
                        // alert(resp.data.image.image_src)
                         var DIR_Name ='oc_photos';
                    var a = new DirManager();
                    a.create_r(DIR_Name,Log('created successfully'));  
                    var b = new FileManager(); 
                        
                        var img_src = resp.data.image.image_src;		
                        //alert(img_src);		
              				  //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                         var image_name = getFileNameFromPath(img_src);
                        
                       var STR = server_url+"api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image="+img_src;
							        
							     
    							      jQuery.ajax({
    										 url:STR,
    										 dataType:"html",
    										 success:function(DtatURL){ 
    										
                         //alert(DtatURL);  
    								//adb logcat *:E		 
    										 // alert(obj.data.image.image_src);
    							  b.download_file(DtatURL,DIR_Name+'/',image_name,function(theFile){ 
                     
                          var ImgFullUrl =  '';
                          ImgFullUrl = theFile.toURI();  
                            //alert(ImgFullUrl);
                          db.transaction(function (tx) { 
                            tx.executeSql('update OCEVENTS_user set image_src = "'+ImgFullUrl+'",is_user_image="true" where user_id = "'+localStorage.user_id+'"');
                            
                               window.location.href="profile.html";
                            
                          }); 
                          
                          });
                          }
                          }); 
                       }
                        //alert("Response = " + r.response.status.toString());
                        //alert("Response = " + r.status);
                         
                        //alert(r.response.status);
                        //alert("Sent = " + r.bytesSent.toString());
                  } 
                  function fail(error) { 
                     alert("An error has occurred: Code = " + error.code);
   alert("upload error source " + error.source);
    alert("upload error target " + error.target);
                  }           
    }


//load agenda items
function loadagenda()
{
    jQuery(document).ready(function($)
  {
  var main_url = server_url+'api/index.php/main/agendaItems?XDEBUG_SESSION_START=PHPSTORM';
       // alert('here');
        $.ajax({
           url:main_url,
           dataType:"json",
           method:"POST",
           success:function(obj){ 
          // alert(obj[pageTitle]);
           //alert(obj)
           $.each( obj.presentations, function( key, val ) {
               //alert(key);
              //if(key == '2307' && key == '2308' && key == '2309' && key == '2309'){
              
              $.each( val, function( k, v ) {
                 
                 if(k == 'location' || k == 'group_item')
                 {
                    localStorage.location = v;
                 }
                 if( typeof v == 'object')
                 {
                    //var arr = new Array();
                    $.each( v, function( k1, v1 ) {  
                    if( typeof v1 == 'object' && v1 != null)
                    {
                        //alert(localStorage.location)
                        $.each( v1, function( k2, v2 ) { 
                             if(k2 == 'medium_file_name')
                             {
                                localStorage.file_name = v2;
                             }                              
                        }); 
                    }
                    //alert(localStorage.location)
                    //alert(localStorage.file_name) 
                    if(k1 == 'value' && (k == 'title' || k == 'description' || k == 'speaker_name')){
                          //arr[k] = v1;
                          alert(key+'--'+k+'--'+v1+'--'+localStorage.location+localStorage.file_name+'<br />') ;
                          //insert(38,titel)
                          
                       }
                    });
                   // alert(arr);
                }
                else
                {
                 // document.write(v+'<br />');
                }
                 //document.write(key+'--'+k+'--'+k1+'--'+v1+v+'<br />') ;
                                 
              }); 
             // }
            }); 
           }
           });
           });
}    
    
//Load profile page variables
function loadprofile()
{
   //var db = openDatabase('OCEVENTS', '1.0', 'OCEVENTS', 2 * 1024 * 1024);
   
   
   db.transaction(function(tx) { 
   
          tx.executeSql("SELECT * FROM OCEVENTS_qa where user_id = '"+localStorage.user_id+"'",[],function (tx, results) {
              var len = results.rows.length;
              $(".qa-list").html('<dt>Registration</dt>');
              for (i = 0; i < len; i++) { 
              //alert(results.rows.item(i).answer);
                  $('.qa-list').append('<h4 class="qa-item-title">'+results.rows.item(i).question+'</h4><p class="answer_me">'+results.rows.item(i).answer+'</p></dd>');                  
              }
          });
    
            tx.executeSql("SELECT * FROM OCEVENTS_user where user_id = '"+localStorage.user_id+"'",[],function (tx, results) {
            var len = results.rows.length;              
            //alert(results.rows.item(0).image_src);
            $("#profile_pic").attr("style","background-image:url("+results.rows.item(0).image_src+")");
            $(".main-img").attr("style","background-image:url("+results.rows.item(0).image_src+")");
            $("#medium_profile_pic").attr("style","background-image:url("+results.rows.item(0).image_src+")");
            //var image_source = getFileNameFromPath(image_src);  
            //alert(results.rows.item(0).is_user_image);
            if(results.rows.item(0).is_user_image == 'true')
            {
              $(".selfie_button").html('<button class="pic-remove" onclick="removeprofileimage();" type="button" name="remove_pic" value="1">Remove Selfie From Your Profile</button>');
            }
            $(".user-facebook-link").show();
            //alert(results.rows.item(0).fb_user_id);
            if(results.rows.item(0).fb_user_id != null && results.rows.item(0).fb_user_id != '' && results.rows.item(0).fb_user_id != undefined)
            {
               $(".user-facebook-link").hide();
              // $("#unlinkfacebook").show(); 
            }
           
     
            
            
            $(".myname").html(results.rows.item(0).first_name+" "+results.rows.item(0).last_name); 
            $(".myemail").html(results.rows.item(0).email);
            $(".mymobile").html(results.rows.item(0).mobile); 
            if(results.rows.item(0).gender == 'm')
            {
              $(".mygender").html('Male');
            }
            else if(results.rows.item(0).gender == 'f')
            {
              $(".mygender").html('Female');
            }
            else
            {
               $(".mygender").html('N/A');
            }           
            $(".log-info p").html("<p>"+results.rows.item(0).first_name+" "+results.rows.item(0).last_name+"<br><strong>&lt; "+results.rows.item(0).team+" &gt; </strong><br></p>");
            $(".firstname a").html(results.rows.item(0).first_name);
            $(".lastname a").html(results.rows.item(0).last_name);
            $("#fname_edit").val(results.rows.item(0).first_name); 
            $("#lname_edit").val(results.rows.item(0).last_name);
            $("#email_edit").val(results.rows.item(0).email);
            $("#mobile_edit").val(results.rows.item(0).mobile);
            $(".team-name").html("&lt; "+results.rows.item(0).team+" &gt;")
              
            $(".fa-trophy").html("<span>#</span>"+ results.rows.item(0).position);                
        });
        
         tx.executeSql("SELECT * FROM OCEVENTS_homepage where user_id = '"+localStorage.user_id+"'",[],function (tx, results) {
            var len = results.rows.length; 
            if(results.rows.item(0).type == 'content')
            {
               $(".logo_inner").attr('src',results.rows.item(0).main_logo_small_image);
            }             
            
                    
        });        
      });
}

function login_process()
{
     db.transaction(function (tx) {
       tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_qa (id integer primary key autoincrement,user_id, question,answer)');
     }); 
     var main_url = server_url+'user-profile/?gvm_json=1';
         // alert('here');
          jQuery.ajax({
             url:main_url,
             dataType:"json",
             method:"GET",
             success:function(obj){    
             $.each(obj.userQA,function(i,dataVal){
            // alert(dataVal.question);
               if(i != 0 && dataVal.question != undefined && dataVal.answer != undefined)
               {
                // alert(dataVal.question);
                 //alert(dataVal.answer);
                 if(dataVal.question != undefined && dataVal.question != null && dataVal.question != '')
                 {
                 db.transaction(function (tx) {
                      tx.executeSql("insert into OCEVENTS_qa (user_id,question,answer) values('"+localStorage.user_id+"','"+dataVal.question+"','"+dataVal.answer+"')");
                 });
                 }
               }
            });
             }
             
             }); 
      var main_url = server_url+'api/index.php/main/homepageSettings?XDEBUG_SESSION_START=PHPSTORM&event_id=100000';
         // alert('here');
          jQuery.ajax({
             url:main_url,
             dataType:"json",
             method:"GET",
             success:function(obj){                
                //alert(obj.status);
                if(obj.status == 'error')
                {
                   alert(obj.message); 
                   window.location.href="index.html";
                }
                else
                {
                 if (obj.data.type == 'content')
                 {
                    
                    db.transaction(function (tx) {  
                 						
            				tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id,main_logo_small_image,main_banner_image,main_title,main_text,main_link,type)');
            				tx.executeSql("delete from OCEVENTS_homepage");
                    tx.executeSql("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('','','"+localStorage.user_id+"','"+obj.data.content.main_title+"','"+obj.data.content.main_text+"','"+obj.data.content.main_link+"','"+obj.data.type+"')");
                    //alert("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('','','"+localStorage.user_id+"','"+obj.data.content.main_title+"','"+obj.data.content.main_text+"','"+obj.data.content.main_link+"','"+obj.data.type+"')");
                       //alert("SELECT * FROM OCEVENTS_homepage");
                  
                    }); 
                     var DIR_Name ='oc_photos';
                    var a = new DirManager();
                    a.create_r(DIR_Name,Log('created successfully'));  
                    var b = new FileManager();  
                     
                     if(obj.data.content.main_logo_image != null)
                     {
                        var img_src = obj.data.content.main_logo_image.small_url;				
              				  //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                        var image_name = getFileNameFromPath(img_src);
                        
                       var STR = server_url+"api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image="+img_src;
							        
							     
    							      jQuery.ajax({
    										 url:STR,
    										 dataType:"html",
    										 success:function(DtatURL){ 
    										
                        // alert(DtatURL);  
    								//adb logcat *:E		 
    										  //alert(obj.data.image.image_src);
                          //alert(image_name);
    							  b.download_file(DtatURL,DIR_Name+'/',image_name,function(theFile){ 
                     
                          var ImgFullUrl =  '';
                          ImgFullUrl = theFile.toURI();  
                           //alert(ImgFullUrl);
                          db.transaction(function (tx) { 
                            tx.executeSql('update OCEVENTS_homepage set main_logo_small_image = "'+ImgFullUrl+'" where user_id = "'+localStorage.user_id+'"');
                            if(obj.data.content.main_banner_image == null)
                            {
                               //alert(obj.data.content.main_banner_image);
                               window.location.href="gamification.html";
                            }
                          }); 
                          
                          });
                          }
                          });
                     }
                         if(obj.data.content.main_banner_image != null)
                          {
                              var img_src = obj.data.content.main_banner_image.medium_url;	
                              //var img_src = 'https://www.google.ro/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
                             var image_name = getFileNameFromPath(img_src);
                             //alert(img_src);
                            //  alert(image_name);
                       var STR = server_url+"api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image="+img_src;
							        
							     
    							      jQuery.ajax({
    										 url:STR,
    										 dataType:"html",
    										 success:function(DtatURL){ 
    								
                         //alert(DtatURL);  
    								//adb logcat *:E		 
    										 // alert(obj.data.image.image_src);
    							  b.download_file(DtatURL,DIR_Name+'/',image_name,function(theFile){ 
                     
                          var BannerImgFullUrl =  '';
                          //ImgFullUrl = localStorage.ImgFullUrl; 
                          //alert(localStorage.ImgFullUrl);
                          BannerImgFullUrl = theFile.toURI(); 
                          //alert(BannerImgFullUrl);                          
                          db.transaction(function (tx) {  
                         						     
                    			 tx.executeSql('update OCEVENTS_homepage set main_banner_image = "'+BannerImgFullUrl+'" where user_id = "'+localStorage.user_id+'"');
                         
                            window.location.href="gamification.html";
                        });                        
                    });                 
							     }	 
							   }); 
                          }
                          
                         if(obj.data.content.main_banner_image == null && obj.data.content.main_logo_image == null)
                          {
                             window.location.href="gamification.html";
                          }                   
                     
                 } 
                 else if(obj.data.type == 'url')
                  {
                     db.transaction(function (tx) {
                       tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id, iframe_url,type)');
                       tx.executeSql("delete from OCEVENTS_homepage");
                       tx.executeSql("INSERT INTO OCEVENTS_homepage (user_id,iframe_url,type) VALUES ('"+localStorage.user_id+"','"+obj.data.url+"','"+obj.data.type+"')");
                       window.location.href="gamification.html";
                     });  
                  }
                   else
                  {
                    db.transaction(function (tx) {
                      tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id, iframe_url,type)');
                      tx.executeSql("delete from OCEVENTS_homepage");
                      tx.executeSql("INSERT INTO OCEVENTS_homepage (user_id,type) VALUES ('"+localStorage.user_id+"','"+obj.data.type+"')");
                      window.location.href="gamification.html";
                     }); 
                  }       
                }
             }
             });
}

 var pictureSource;   // picture source
    var destinationType; // sets the format of returned value

    // Wait for device API libraries to load
    //
    document.addEventListener("deviceready",onDeviceReady,false);

    // device APIs are available
    //
    function onDeviceReady() {
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;
    }