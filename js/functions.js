function getFileNameFromPath(path) {
    var ary = path.split("/");
    return ary[ary.length - 1];
}

//Reset Password
function resetpassword() {
    //alert("asdas");
    event.preventDefault();
    var email = jQuery("#fld_rp_email").val();
    var main_url = server_url + 'gamification/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        data: {
            email_sms_reset: email
        },
        success: function(resp) {
            //alert(resp)
            if (resp.login_success != '') {
                alert(resp.login_success);
            } else {
                alert(resp.login_error);
            }
        }
    });
}

function removeprofileimage() {
    var main_url = server_url + 'api/index.php/auth/removeUserImage?XDEBUG_SESSION_START=PHPSTORM';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        success: function(resp) {
            if (resp.status == 'success') {
                var DIR_Name = 'oc_photos';
                var a = new DirManager();
                a.create_r(DIR_Name, Log('created successfully'));
                var b = new FileManager();

                var img_src = resp.data.image.image_src;
                //alert(img_src);		
                //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                var image_name = getFileNameFromPath(img_src);

                var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


                jQuery.ajax({
                    url: STR,
                    dataType: "html",
                    success: function(DtatURL) {

                        b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                            var ImgFullUrl = '';
                            ImgFullUrl = theFile.toURI();
                            
                            db.transaction(function(tx) {
                                tx.executeSql('update OCEVENTS_user set image_src = "' + ImgFullUrl + '",is_user_image="false" where user_id = "' + localStorage.user_id + '"');
                                window.location.href = "profile.html";
                            });
                        });
                    }
                });
            }
        }

    });
}

//function to update profile
function saveprofile() {
    jQuery(document).ready(function($) {
        // event.preventDefault();

        var fname = $("#fname_edit").val();
        var lname = $("#lname_edit").val();
        var email = $("#email_edit").val();
        var repeat_email = $("#emailrepeat_edit").val();
        var mobile = $("#mobile_edit").val();
        var password = $("#pwd_edit").val();
        var password_repeat = $("#pwdrepeat_edit").val();
        if (fname == '') {
            alert("Please Enter First Name");
            $("#fname_edit").focus();
            return false;
        }
        if (lname == '') {
            alert("Please Enter Last Name");
            $("#lname_edit").focus();
            return false;
        }

        if (email == '') {
            alert("Please Enter Your Email Address");
            $("#email_edit").focus();
            return false;
        }
        if (repeat_email != '') {
            if (email != repeat_email) {
                alert("Emails Don't Match");
                $("#emailrepeat_edit").focus();
                return false;
            }
        }
        if (mobile == '') {
            alert("Please Enter Mobile Number");
            $("#mobile_edit").focus();
            return false;
        }
        if (password != '') {
            if (password !== password_repeat) {
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
        var main_url = server_url + 'api/index.php/auth/updateUser?XDEBUG_SESSION_START=PHPSTORM';
        // alert('here');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
                first_name: fname,
                last_name: lname,
                mobile: mobile,
                password: password,
                password_repeat: password_repeat,
                email: email,
                email_repeat: repeat_email
            },
            success: function(obj) {
                //alert(obj.status);
                if (obj.status == 'success') {
                    db.transaction(function(tx) {
                        tx.executeSql("update OCEVENTS_user set email = '" + obj.data.email + "',first_name = '" + obj.data.first_name + "',last_name = '" + obj.data.last_name + "',mobile = '" + obj.data.mobile + "' where user_id = '" + obj.data.id + "'");
                        $(".success_message").show();
                        $('#edited_success').focus();
                        setTimeout(function() {
                            $('.success_message').fadeOut('slow');
                        }, 4000);

                        $(".myname").html(obj.data.first_name + " " + obj.data.last_name);
                        $(".myemail").html(obj.data.email);
                        $(".mymobile").html(obj.data.mobile);
                        //$(".log-info p").html("<p>"+obj.data.first_name+" "+obj.data.last_name+"<br><strong>&lt; "+obj.data.team+" &gt; </strong><br></p>");
                        $(".firstname a").html(obj.data.first_name);
                        $(".lastname a").html(obj.data.last_name);
                        $(".edit_info_user").addClass('hidden');
                        $(".show_info_user").removeClass('hidden');
                        //$(".user-info-cancel-btn").trigger("click");  
                    });
                } else {
                    alert(obj.message);
                }
                //alert(obj.message);
            }
        });
    });
}


function loginme() {
    jQuery(document).ready(function($) {
        //adb logcat *:E
        event.preventDefault();
        $("#login_submit").hide();
        $(".loading").show();
        var fld_l_email = $("#fld_l_email").val();
        var fld_l_password = $("#fld_l_password").val();
        if (fld_l_email == '') {
            alert("Please Enter Your Email");
            return false;
        } else if (fld_l_password == '') {
            alert("Please Enter Your Password");
            return false;
        } else {
            var email = base64_encode(fld_l_email);
            var pwd = base64_encode(fld_l_password);
            var main_url = server_url + 'api/index.php/auth/login?XDEBUG_SESSION_START=PHPSTORM';
            // alert('here');
            $.ajax({
                url: main_url,
                dataType: "json",
                method: "POST",
                data: {
                    email: email,
                    password: pwd
                },
                success: function(obj) {
                    //alert(obj.status);
                    if (obj.status == 'error') {
                        alert(obj.message);
                        $("#login_submit").show();
                        $(".loading").hide();
                    } else {

                        var DIR_Name = 'oc_photos';
                        var a = new DirManager();
                        a.create_r(DIR_Name, Log('created successfully'));

                        var b = new FileManager();
                        //alert(obj.data.image.image_src);	
                        var img_src = obj.data.image.image_src;

                        //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                        var image_name = getFileNameFromPath(img_src);
                        // alert(img_src);
                        //  alert(image_name);
                        var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


                        $.ajax({
                            url: STR,
                            dataType: "html",
                            success: function(DtatURL) {
                                // DtatURL ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOYAAADmCAMAAAD2tAmJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAG9QTFRF29vb/Pz8/v7+/f39+/v7+vr68fHx8vLy+fn58/Pz9fX19vb29PT08PDw+Pj49/f3////7+/v7u7u7e3t7Ozs6+vr3Nzc4uLi5+fn6urq4ODg5eXl6enp4+Pj5ubm3t7e39/f6Ojo4eHh3d3d5OTk7uBouAAABQtJREFUeNrs3Amy2jgQBuCeZGI/sIHgRba8L9z/jOElVTMJAQNWN3RL+k/QX2m3ZcN3JwKe6Zme6ZlvZH5xIp7pmZ7pmZ7pmZ7pmZ5pM/OrE/FMz/RMz/RMz/RMz3SU+Y8T8UzP9EzP9EzP9EzP9Eybmf86Ec/0TM/0TKeYGweY23yAX2nL49ZG5scmr2f4I3OdHqxiHpoJrmcogw9LmNsWFtOSNyp8I09Uwv0MTT6lEVkN9Eyt4OEUoVBmWMFTKfYSmRqejYrFMeMKgIeTkpkoWBO1F8UcYWVOgpj7DlYnFMPcV+uVUERCmEZKgH4vgmmo/JyHtACmsRKgw2V+EKQDhFQbxIoomBpwkrJmBoCVkTHzoNCYkPNlFoCYI1dmiqkEdeDJxOyyP/e3PJkdICfgyNxiK6HgyERvTIANPyZ+YyItnsC9MUGhMPeIiYEiIUJlqMyGhNlwY/YkzIIZMyRRgmLGrGmYEPFi9kTMHSsmUZ/lxsypmA0rZuEGE5xghqyZB6xkdEzz4vCYjRtMshkIEjeYOzeYgRvMgxPM3g1mwYpZM15PJKybCSumpmJuMZgRVo5EyhajODxmTMRMeTEjmmckKmLGbEmYHTcmzRy048YkOVdXETdmVBEwNT8mxaO9mB8zZrpoIjMjposmLjOumS6aqMxdz3aePTO3WJlIdnpIxaExA5LNQc+NmRCdwpxgKm7MDQlz4sbckpzDGnbME8mTaHZMijdiw5Ydk6LXNgyZBBf2EobMEZ+Zu8Ec0ZgxWgim2hKrNkTm5JkWMQk6bcOQuSM4bjJkEjRnzJEZIn9RBAVLZlwiMzVPJnJzqpgnM9Y8lxNsZox5ShkQ64INatIBy1iUIWJdyMwzFOV+UIFcFTpzs8HouCV/JsarlJE/E2P1TN1gJm4wN04wBzeYkxvMUgAT4T8WGp0ZogfhhW6CXRMBMzTf7oUSmMb3pAcRzJ3p6boVwQxNr5w2Mpimc20qgxmaHa5VKIRptkOopDDNvmLopDDD2YSZiWFWvIYmFdNkcBYUzIAkJm/HGoJ6iJiBwbWSRBDzuHrDVwWCmMHa1ykqE8UMVk62ZSCLeeLTZQmZK/9dX8piHtfu3jtRzPVHzlYQ0+Rg3Yphmj0+GGUwj6ZfOGp85g492WyoPG8RsGvCZ2K8xUV3YjM1zl0SpTkzE7z/r5wSrsykxrzlNY8smbhIZCiwRf6E1gknZkr2TyRVp1yYegLKYExG5syxB+Io864LpkNyhhdE1abMo0HSk4IXZR5NCj0aMLMCXpm5zt/A1BW8Pn1Vl1rrVzCzsa5meHNUVXQ5HXNs3y78zTqVKQEzaxVwyzQiM98yGB+ZmkpEJlfkg9DHmNkErDNrDGangHum1JSZVSAgSpsxtQIZaZeYyZ10ICZVelNxj1mAoPTZSqYo5ecAXcUUprztBKuUZ2f+NFOg8tb4XGDWIDL9c8wGhKZ9hpkpqUwYn2AOYpXXpiGwa2D+yvA3M72aXElmQnfpucGcRCvP3fYh5gjCUzzEHKQzQT/AFN+Yn08T7jPlN+Zlc15jNhYo4XSXOdnAVPeYwtfMq2vnFWZnhRKqO8zKDibki8zcEuUfvRayy3S2MKffUH8zC1uYapHZ28KEcYlpjRLqBWZpD7NYYJ7sYQ4LzNYe5rzAHOxhgiNMfZvZW8QsbzPBTmZ+EZuY3f+qC2VjE7O9ySw9U94Z5Saztok5/Mf6IcAA9XRtorhYvhYAAAAASUVORK5CYII=';
                                //alert(DtatURL);  
                                //adb logcat *:E		 
                                // alert(obj.data.image.image_src);
                                b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                                    var ImgFullUrl = '';
                                    ImgFullUrl = theFile.toURI();
                                    // alert(ImgFullUrl);
                                    db.transaction(function(tx) {
                                        tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_user (id integer primary key autoincrement,team,position,fb_user_id,fb_email,birthday_date,website, user_id, email, first_name, last_name,mobile, image_src, is_user_image, created,gender,player_code)');
                                        tx.executeSql("delete from OCEVENTS_user");
                                        tx.executeSql('INSERT INTO OCEVENTS_user (team,position,fb_user_id,fb_email,birthday_date,website,user_id,email,first_name,last_name,mobile,image_src,is_user_image,created,gender,player_code) VALUES ("' + obj.data.team + '","' + obj.data.position + '","' + obj.data.fb_user_id + '","' + obj.data.fb_email + '","' + obj.data.birthday_date + '","' + obj.data.website + '","' + obj.data.id + '","' + obj.data.email + '","' + obj.data.first_name + '","' + obj.data.last_name + '","' + obj.data.mobile + '","' + ImgFullUrl + '","' + obj.data.image.is_user_image + '","' + obj.data.created + '","' + obj.data.gender + '","' + obj.data.player_code + '")');
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

//UnLink your facebook account
function unlinkwithfacebook() {
    if(confirm('Are you sure you want to unlink facebook from your account?')){
                
    
    var main_url = server_url + 'api/index.php/auth/FBRemoveData?XDEBUG_SESSION_START=PHPSTORM';
                jQuery.ajax({
                    url: main_url,
                    dataType: "json",
                    method: "POST",
                    data: {
                        event_id: static_event_id
                    },
                    success: function(obj) {
                        alert("Facebook Account Unlinked Successfully");
                        jQuery(".facebook-link").show();
                        jQuery("#unlinkfacebook").hide();
                    }
                    
                    });
      }
}

//Link your facebook account
function linkwithfacebook() {
    jQuery(document).ready(function($) {

        if (!window.cordova) {
            var appId = prompt("Enter FB Application ID", "");
            facebookConnectPlugin.browserInit(appId);
        }
        facebookConnectPlugin.login(["email"],
            function(response) {


                var newstr = JSON.stringify(response.authResponse.userID).replace(/\"/g, '');
                var access_token = JSON.stringify(response.authResponse.accessToken).replace(/\"/g, '');

                var encoded_newstr = base64_encode(newstr);
                var encoded_access_token = base64_encode(access_token);
                //alert(encoded_access_token);
                //alert(encoded_newstr);
                // $("#login_submit").hide();
                // $(".loading").show();
                var main_url = server_url + 'api/index.php/auth/FBUpdateData?XDEBUG_SESSION_START=PHPSTORM';
                jQuery.ajax({
                    url: main_url,
                    dataType: "json",
                    method: "POST",
                    data: {
                        fb_access_token: encoded_access_token,
                        fb_user_id: encoded_newstr,
                        event_id: static_event_id
                    },
                    success: function(obj) {
                        //alert(obj.status);
                        //alert(obj.message);
                        if (obj.status == "success") {
                            //alert(obj.message);
                            var fb_uid = obj.data.fb_user_id;
                            db.transaction(function(tx) {
                                tx.executeSql('update OCEVENTS_user set fb_user_id = "' + fb_uid + '" where user_id = "' + localStorage.user_id + '"');

                                window.location.href = "profile.html";

                            });
                        } else {
                            localStorage.user_fid = '';

                            alert("Error in Fb Login");


                        }
                    }
                });


            },
            function(response) {
                alert(JSON.stringify(response));
            });
    });
}

var fbLoginSuccess = function() {
    facebookConnectPlugin.login(["email"],
        function(response) {


            var newstr = JSON.stringify(response.authResponse.userID).replace(/\"/g, '');
            var access_token = JSON.stringify(response.authResponse.accessToken).replace(/\"/g, '');

            var encoded_newstr = base64_encode(newstr);
            var encoded_access_token = base64_encode(access_token);

            var main_url = server_url + 'api/index.php/auth/FBRemoveData?XDEBUG_SESSION_START=PHPSTORM';
            jQuery.ajax({
                url: main_url,
                dataType: "json",
                method: "POST",
                data: {
                    fb_access_token: encoded_access_token,
                    fb_user_id: encoded_newstr,
                    event_id: static_event_id
                },
                success: function(obj) {
                    //alert(obj.status);
                    if (obj.status == "success") {

                        db.transaction(function(tx) {
                            tx.executeSql('update OCEVENTS_user set fb_user_id = "" where user_id = "' + localStorage.user_id + '"');

                            window.location.href = "profile.html";

                        });
                    }
                }
            });


        },
        function(response) {
            alert(JSON.stringify(response));
        });
}


var login = function() {
//alert('here');
    jQuery(document).ready(function($) {

        if (!window.cordova) {
            var appId = prompt("Enter FB Application ID", "");
            facebookConnectPlugin.browserInit(appId);
        }
        facebookConnectPlugin.login(["email"],
            function(response) {

                //alert('here 1');
                var newstr = JSON.stringify(response.authResponse.userID).replace(/\"/g, '');
                var access_token = JSON.stringify(response.authResponse.accessToken).replace(/\"/g, '');

                var encoded_newstr = base64_encode(newstr);
                var encoded_access_token = base64_encode(access_token);
                // $("#login_submit").hide();
                //   $(".loading").show();
                var main_url = server_url + 'api/index.php/auth/FBlogin?XDEBUG_SESSION_START=PHPSTORM';
                jQuery.ajax({
                    url: main_url,
                    dataType: "json",
                    method: "POST",
                    data: {
                        fb_access_token: encoded_access_token,
                        fb_user_id: encoded_newstr,
                        event_id: static_event_id
                    },
                    success: function(obj) {
                        // alert(obj.message);
                        if (obj.status == "success") {


                            var DIR_Name = 'oc_photos';
                            var a = new DirManager();
                            a.create_r(DIR_Name, Log('created successfully'));
                            var b = new FileManager();
                            //alert(obj.data.image.image_src);	
                            var img_src = obj.data.image.image_src;

                            //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                            var image_name = getFileNameFromPath(img_src);
                            // alert(img_src);
                            //  alert(image_name);
                            var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


                            $.ajax({
                                url: STR,
                                dataType: "html",
                                success: function(DtatURL) {

                                    //alert(DtatURL);  
                                    //adb logcat *:E		 
                                    // alert(obj.data.image.image_src);
                                    b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                                        var ImgFullUrl = '';
                                        ImgFullUrl = theFile.toURI();
                                        // alert(ImgFullUrl);
                                        db.transaction(function(tx) {
                                            tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_user (id integer primary key autoincrement,team,position,fb_user_id,fb_email,birthday_date,website, user_id, email, first_name, last_name,mobile, image_src, is_user_image, created,gender,player_code)');
                                            tx.executeSql("delete from OCEVENTS_user");
                                            tx.executeSql('INSERT INTO OCEVENTS_user (team,position,fb_user_id,fb_email,birthday_date,website,user_id,email,first_name,last_name,mobile,image_src,is_user_image,created,gender,player_code) VALUES ("' + obj.data.team + '","' + obj.data.position + '","' + obj.data.fb_user_id + '","' + obj.data.fb_email + '","' + obj.data.birthday_date + '","' + obj.data.website + '","' + obj.data.id + '","' + obj.data.email + '","' + obj.data.first_name + '","' + obj.data.last_name + '","' + obj.data.mobile + '","' + ImgFullUrl + '","' + obj.data.image.is_user_image + '","' + obj.data.created + '","' + obj.data.gender + '","' + obj.data.player_code + '")');
                                            localStorage.user_id = obj.data.id;
                                            login_process();
                                        });
                                    });

                                }
                            });




                        } else {
                            localStorage.user_fid = '';

                            alert(obj.message);


                        }
                    }
                });


            },
            function(response) {
                alert(JSON.stringify(response));
            });
    });
}

function logout() {
    //alert('here')
    var main_url = server_url + 'api/index.php/auth/logout?XDEBUG_SESSION_START=PHPSTORM';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        success: function(obj) {
            //alert(obj.status);                       
            if (obj.status == 'success') {

                truncatealltables();
                localStorage.user_id = '';
                if (localStorage.fid != '' && localStorage.fid != undefined && localStorage.fid != null) {
                    facebookConnectPlugin.logout(
                        function(response) {
                            //window.location.href="index.html"; 
                        },
                        function(response) {
                            //alert(JSON.stringify(response)) 
                        });
                    localStorage.fid = '';
                }


                window.location.href = "index.html";
            } else {
                localStorage.user_id = '';
                alert(obj.message);
                window.location.href = "index.html";
            }
        }
    });

}


function loadgamification() {
    //var db = openDatabase('OCEVENTS', '1.0', 'OCEVENTS', 2 * 1024 * 1024);
    loadcommonthings();
    importfooter('g-homepage','home');
    
    db.transaction(function(tx) {

        //alert("SELECT * FROM OCEVENTS_homepage where user_id = '"+localStorage.user_id+"'");
        tx.executeSql("SELECT * FROM OCEVENTS_homepage where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;
            //            alert(results.rows.item(0).main_logo_small_image);
            if (results.rows.item(0).type == 'content') {
                if (results.rows.item(0).main_logo_small_image != undefined && results.rows.item(0).main_logo_small_image != null && results.rows.item(0).main_logo_small_image != '') {
                    $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);
                }
                if (results.rows.item(0).main_banner_image != undefined && results.rows.item(0).main_banner_image != null && results.rows.item(0).main_banner_image != '') {
                    $(".main_banner_image").attr('src', results.rows.item(0).main_banner_image);
                }

                $(".welcome-title h1").html(results.rows.item(0).main_title);
                $(".welcome-content").html(results.rows.item(0).main_text);
            } else if (results.rows.item(0).type == 'url') {
                // var ref = window.open('http://apache.org', '_system', 'location=yes');
                if (results.rows.item(0).main_logo_small_image != undefined && results.rows.item(0).main_logo_small_image != null && results.rows.item(0).main_logo_small_image != '') {
                    $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);
                }
                $(".main-container").html('<iframe src=' + results.rows.item(0).iframe_url + ' id="homepage-content" />');
            } else {
                $(".main-container").html("No Module Found");
            }
            
            
            
        });
    });
}

function onFail(message) {
    alert('Failed because: ' + message);
}

function capturePhoto() {
      // Take picture using device camera and retrieve image as base64-encoded string
        navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 100, allowEdit: true, destinationType: destinationType.FILE_URI, saveToPhotoAlbum: false });
    }


function getPhoto(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.NATIVE_URI,
        sourceType: source
    });
}

function showbuttons()
{
   jQuery('.hidden_button').attr('style','display:block !important');
   jQuery('.selfie_capture').hide();
}
// Called when a photo is successfully retrieved
function onPhotoURISuccess(imageURI) {

    var imageData = imageURI;

    //  alert(imageData);          
    var photo_ur = imageData;
    var options = new FileUploadOptions();
    var imageURI = photo_ur;
    options.fileKey = "image";
    if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
        var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    } else {
        var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.jpg';
    }
    options.fileName = newfname;
     //alert(newfname);
    options.mimeType = "image/jpeg";
    var params = new Object();
    options.params = params;
    //options.headers = "Content-Type: multipart/form-data; boundary=38516d25820c4a9aad05f1e42cb442f4";
    options.chunkedMode = false;
    var ft = new FileTransfer();
    //alert(imageURI);
    ft.upload(imageURI, encodeURI(server_url + "api/index.php/auth/updateUserImage"), win, fail, options);

    function win(r) {
        //alert("Code = " + r.responseCode.toString());
        //alert("Response = " + r.response.message);
        var resp = JSON.parse(r.response);
        //alert(resp.status);
        if (resp.status == 'success') {
            // alert('here')
            // alert(resp.data.image.image_src)
            var DIR_Name = 'oc_photos';
            var a = new DirManager();
            a.create_r(DIR_Name, Log('created successfully'));
            var b = new FileManager();

            var img_src = resp.data.image.image_src;
            //alert(img_src);		
            //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
            var image_name = getFileNameFromPath(img_src);

            var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


            jQuery.ajax({
                url: STR,
                dataType: "html",
                success: function(DtatURL) {

                    //alert(DtatURL);  
                    //adb logcat *:E		 
                    // alert(obj.data.image.image_src);
                    b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                        var ImgFullUrl = '';
                        ImgFullUrl = theFile.toURI();
                        //alert(ImgFullUrl);
                        db.transaction(function(tx) {
                            tx.executeSql('update OCEVENTS_user set image_src = "'+ImgFullUrl+'",is_user_image="true" where user_id = "' + localStorage.user_id + '"');

                            window.location.href = "profile.html";

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

//function to play video
function playvideo(videoUrl)
{
  var options = {
    successCallback: function() {
      console.log("Video was closed without error.");
    },
    errorCallback: function(errMsg) {
      console.log("Error! " + errMsg);
    }
  };
  window.plugins.streamingMedia.playVideo(videoUrl,options);
}

function checkdefined(str)
{
  //alert(str)
  if(str != '' && str != undefined && str != 'undefined' && str != null && str != 'null')
  {
    return 'yes';
  }
  else
  {
    return 'no';
  }
}

//load agenda item
function loadagendaitem()
{
    jQuery(document).ready(function($) {
        loadcommonthings();
        $(".agenda-item-container").hide();
        importfooter('View-presentation/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id,'agenda-item');
        var main_url = server_url + 'View-presentation/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id+'?gvm_json=1';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(data) {
            if(data.prevPresentation != false)
            {
                $('.prev').attr('onclick','gotoagenda("'+data.prevPresentation.instance_id+'")');
            }
            else
            {
                $('.prev i').hide();
            }
            if(data.nextPresentation != false)
            {
                $('.next').attr('onclick','gotoagenda("'+data.nextPresentation.instance_id+'")');
            }
            else
            {
                $('.next i').hide();
            }
                $(".green-text").html(data.presentation.title.value);
                $(".agenda-item-img-info h5").html(data.presentation.title.value);
                $(".date p").html(data.presentation.group_item);
                $(".future-title").html(data.presentation.speaker_name.value);
                $(".future-info").html(data.presentation.description.value);
                var imgurl = server_url + 'resources/files/images/'+ data.presentation.speaker_image.__extra.medium_file_name;
                $(".agenda-main-img").attr("style", "background-image:url("  +imgurl+ ")"); 
                //alert(checkundefined(data.videoSrc));
               if(checkdefined(data.videoSrc) == 'yes')
               {
                   $('.future-video').show();
                   $('.future-video').attr('onclick','playvideo("'+server_url+data.videoSrc+'")');
                   $('.playme').attr('src',server_url+data.videoPoster);
                   $('.playme').attr('style','width:100%;height:400px;');
                   $('.future-info').attr('style','position:relative;bottom:128px;');
               }
               if(checkdefined(data.presentation.embeded_html.value) == 'yes')
               {
                   $(".future-info").append('<div class="video-wrapper">'+data.presentation.embeded_html.value+'</div>');
               }
                  
               $.each( data.presentationModules, function( key, val ) {
                       
                        var container_class = val.container_class;
                        var icon_class = val.icon_class;
                        var text = val.text;
                        //alert(text)
                        $(".presentation-modules").append('<a href="#"><i class="'+icon_class+'"></i>'+text+'</a>')
                       
                    });
                    
                    if(data.hasRating == true)
                    {
                        $('.agenda-item-rating-container').show();                        
                        $('.item-interactions').html('<div class="item-interaction item-interaction-rate interaction-box" data-ratevalue="'+data.ratevalue+'" data-original-title="" title=""><a href="#" class="rate-star active" data-rate="1"><i class="fa fa-star"></i></a><a href="#" class="rate-star" data-rate="2"><i class="fa fa-star"></i></a><a href="#" class="rate-star" data-rate="3"><i class="fa fa-star"></i></a><a href="#" class="rate-star" data-rate="4"><i class="fa fa-star"></i></a><a href="#" class="rate-star" data-rate="5"><i class="fa fa-star"></i></a></div>');
                    }
                   
               $(".agenda-item-container").show(); 
               $(".loading_agenda_items").hide();
            }            
            }); 
        /*db.transaction(function(tx) {                                                
              tx.executeSql("SELECT * FROM OCEVENTS_agenda where user_id = '" + localStorage.user_id + "' and agenda_id = '"+localStorage.agenda_id+"'", [], function(tx, results) {
              var len_ag = results.rows.length;
              $(".green-text").html(results.rows.item(0).title+' '+results.rows.item(0).speaker_name); 
              $(".agenda-item-img-info h5").html(results.rows.item(0).title);
              $(".date p").html(results.rows.item(0).group_title);
              $(".future-title").html(results.rows.item(0).speaker_name); 
              $(".future-info").html(results.rows.item(0).description); 
              $(".agenda-main-img").attr("style", "background-image:url(" + results.rows.item(0).speaker_image + ")");  
         });
         }); */      
                        
    });  
}

//got to agenda item
function gotoagenda(agenda_id)
{
    localStorage.agenda_id = agenda_id;
    window.location.href= 'agenda_item.html';
}

//function to fetch user points
function loadticket()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('ticketing','home');
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_ticket (id integer primary key autoincrement,user_id,ticketCode,ticketSrc)');
            tx.executeSql('delete from OCEVENTS_ticket');
        });
        $(".ticketing-container").hide();
        var main_url = server_url + 'ticketing/-/'+static_event_id+'/?gvm_json=1';
        // alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
              var DIR_Name = 'oc_photos';
              var a = new DirManager();
              a.create_r(DIR_Name, Log('created successfully'));
              var b = new FileManager();
              var img_src = server_url+obj.ticketSrc;
              var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;
               // alert(img_src);
              var image_name = getFileNameFromPath(img_src);
              //alert(image_name);

          //alert(imagedatalength);
          jQuery.ajax({
              url: STR,
              dataType: "html",
              success: function(DtatURL) {    
                  b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {
                      //alert(DtatURL);
                      var ImgFullUrl = '';
                      ImgFullUrl = theFile.toURI();
                      
                     // alert(ImgFullUrl);
                      db.transaction(function(tx) {                       
                                            
                        tx.executeSql("insert into OCEVENTS_ticket (user_id,ticketCode,ticketSrc) values ('" + localStorage.user_id + "','" + obj.ticketCode + "','" + ImgFullUrl + "')");
                        showTicket();
                      });
                    });
                }
                });  
                                                  
            }
          });  
     });   
}

//function to show user ticket
function showTicket()
{
     db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_ticket where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            jQuery(".ticket_code").html(results.rows.item(0).ticketCode);
            jQuery(".qr_photo").attr("src",results.rows.item(0).ticketSrc);
            jQuery(".ticketing-container").show();
            jQuery(".loading_agenda_items").hide();
        });
    });
}        

//function to fetch user points
function loadpoints()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('user-points','points');
        $(".leaderboards-container").hide();
        //jQuery(".loading_agenda_items").hide();
        var main_url = server_url + 'user-points/?gvm_json=1';
        // alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            //alert(obj.hideTeamScores)
            var hideTeamScores =  obj.hideTeamScores;
            //var label =  obj.breadcrumbs.text;
            //alert(obj.breadcrumbs);
            //alert(label);
            var label = '';
            $.each(obj.breadcrumbs, function(key, val) {
                    //alert(val.text);
                    label =  val.text;
            }); 
           // alert(label);
              var imagedatalength = obj.categories.length;  
                db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_points (id integer primary key autoincrement,user_id,name,position integer,userTotal,green_count,hideTeamScores,label,instance_id)');                                
                    tx.executeSql('delete from OCEVENTS_points');
                    tx.executeSql("SELECT * FROM OCEVENTS_points where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
                        var len_ag = results.rows.length;
                       // alert(len_ag);
                        if (imagedatalength == len_ag && len_ag != 0) {                            
                            showPointsData();
                        }
                        else
                        {
                           db.transaction(function(tx) {
                                 tx.executeSql('delete from OCEVENTS_points');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                var green_count = 0;
                                if(val.count != null && val.count != undefined && val.count != 'null' && val.count != '')
                                {
                                    green_count =  val.count;
                                } 
                                tx.executeSql("insert into OCEVENTS_points (user_id,name,position,userTotal,green_count,hideTeamScores,label,instance_id) values ('" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.userTotal+ "','" + green_count+ "','" + hideTeamScores+ "','" + label+ "' ,'" + val.instance_id+ "' )");
                                //alert(val.position);
                                co++;
                                  // alert(co);
                                      //alert(imagedatalength); 
                                if (imagedatalength == co) {
                                      //alert(co);
                                      //alert(imagedatalength);
                                     // alert('going');
                                      showPointsData();
                                  }
                                });     
                            });
                        }
                        
                    });
                    
                    });    
            }
            
            });
    });    
}

//function to show user points
function showPointsData() {
    // alert('here');
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_points where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;
            $(".table-striped tbody").html('&nbsp;');
            var label = results.rows.item(0).label;
            var hideTeamScores = results.rows.item(0).hideTeamScores;            
            if(hideTeamScores == 'false')
            {
                $('.teampoints').show();
                $('.yourteam').show();
                $('.user-points-table-title tbody tr th').attr('class','col-xs-4');
            }
            $(".green-text").html(label);
            var group_title = '';
            
            //alert(results.rows.item(0).hideTeamScores);
            for (i = 0; i < len; i++) {
            //alert(results.rows.item(i).description);
                var icon = '';
                if(results.rows.item(i).name == 'Bonus')
                {
                  icon = '<span class="icon"><i class="social-icon"></i></span>';
                }
                else if(results.rows.item(i).name == 'Social')
                {
                  icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                }
                else if(results.rows.item(i).name == 'Seekergame')
                {
                  icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                }
                else if(results.rows.item(i).name == 'Course/Quiz')
                {
                  icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                }
                else if(results.rows.item(i).name == 'Communication')
                {
                  icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                }
                 else if(results.rows.item(i).name == 'Total')
                {
                  icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                 var green_count_html = '';
                if(results.rows.item(i).green_count != 0)
                { 
                  var green_count_html = '<span class="count">'+results.rows.item(i).green_count+'</span>';
                }
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gotopoints('+results.rows.item(i).instance_id+');"><span class="num">'+results.rows.item(i).position+'.</span>'+icon+'<span class="icon"></span>&nbsp;'+results.rows.item(i).name+'</a></td><td class="point"><a href="#" onclick="gotopoints('+results.rows.item(i).instance_id+');">'+green_count_html+results.rows.item(i).userTotal+'<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to go to user point detail page
function gotopoints(instance_id)
{
    localStorage.instance_id = instance_id;
    window.location.href = 'user_detail.html';
}

//function to fetch user detail 
function loaduserdetail()
{
  jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        importfooter('user-points/-/OCintranet-'+static_event_id+'/topscores/'+localStorage.instance_id,'points');
        var main_url = server_url + 'user-points/-/OCintranet-'+static_event_id+'/topscores/'+localStorage.instance_id+'?gvm_json=1';
        
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            
               var label = '';
            $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {
                    
                    if(key == 0)
                    {
                       $(".breadcrumbs a").html(val.text) 
                    }
                    if(key == 1)
                    {
                      $(".green-text").html(val.text)  
                    }
                    
            });
            $(".team-points-table table tbody").html('');
             var i = 0;
              var classcss = '';
            $.each(obj.topScoresViewVars.users, function(key, val) {
                 if(val.eventuser_id == localStorage.user_id)
                 {
                    var classcss="current-user" ;
                 } 
                 else
                 {
                    var classcss="" ;
                 } 
                 if(val.image != '')
                {
                  var newtd = '<td class="avatar-col"><span class="avatar"><div class="img img-circle" style="background-image:url('+val.image+');"></div></span></td>';
                }
                else
                {
                  var newtd = '<td class="avatar-col"></td>';
                }
                i++;               
                  $(".team-points-table table tbody").append('<tr class='+classcss+'><td class="num-col"><span class="num">'+i+'</span></td>'+newtd+'<td><span class="name">'+val.fName+' '+val.lName+'</span></td><td class="point">'+val.total+'</td></tr>');
            
               }); 
             var difference = Number(10) - Number(i);
             for(v = 0; v < difference; v++)
             {
                i++;
                $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">'+i+'</span></td><td class="avatar-col"></td><td><span class="name">-</span></td><td class="point">0</td></tr>'); 
             }
             $(".user-points-table table tbody").html('');
             $.each(obj.categories, function(key, val) {
                 if(val.instance_id == localStorage.instance_id)
                 {
                  var classcss="active" ;
                 } 
                 else
                 {
                    var classcss="" ;
                 }
                 
                 var icon = '';
                if(val.name == 'Bonus')
                {
                  icon = '<span class="icon"><i class="social-icon"></i></span>';
                }
                else if(val.name == 'Social')
                {
                  icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                }
                else if(val.name == 'Seekergame')
                {
                  icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                }
                else if(val.name == 'Course/Quiz')
                {
                  icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                }
                else if(val.name == 'Communication')
                {
                  icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                }
                 else if(val.name == 'Total')
                {
                  icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                if(val.count > 0)
                {
                  var cnt = '<span class="count">'+val.count+'</span>';
                }
                else
                {
                  var cnt = '';
                }
                     
                $(".user-points-table table tbody").append('<tr class='+classcss+'><td><a href="#" onclick="gotopoints('+val.instance_id+')"><span class="num">'+val.position+'.</span>'+icon+val.name+'</a></td><td class="point"><a href="#" onclick="gotopoints('+val.instance_id+')">'+cnt+val.userTotal+'<i class="fa fa-angle-right"></i></a></td></tr>');  
                 
             });
              jQuery(".leaderboards-container").show();
              jQuery(".loading_agenda_items").hide(); 
            }
        });
        
  });      
}

//function to fetch team points
function loadteampoints()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('team-points','team-points');
        $(".leaderboards-container").hide();
        var main_url = server_url + 'team-points/?gvm_json=1';
        
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            
            var label = '';
            $.each(obj.breadcrumbs, function(key, val) {
                    //alert(val.text);
                    label =  val.text;
            }); 
           // alert(label);
              var imagedatalength = obj.categories.length;  
                db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_teampoints (id integer primary key autoincrement,user_id,name,position integer,userTotal,green_count,label,instance_id)');                                
                    tx.executeSql('delete from OCEVENTS_teampoints');
                    tx.executeSql("SELECT * FROM OCEVENTS_teampoints where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
                        var len_ag = results.rows.length;
                       // alert(len_ag);
                        if (imagedatalength == len_ag && len_ag != 0) {                            
                            showTeamPointsData();
                        }
                        else
                        {
                           db.transaction(function(tx) {
                                 tx.executeSql('delete from OCEVENTS_teampoints');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                var green_count = 0;
                                if(val.count != null && val.count != undefined && val.count != 'null' && val.count != '')
                                {
                                    green_count =  val.count;
                                } 
                                tx.executeSql("insert into OCEVENTS_teampoints (user_id,name,position,userTotal,green_count,label,instance_id) values ('" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.points+ "','" + green_count+ "','" + label+ "','" + val.instance_id + "' )");
                                //alert(val.position);
                                co++;
                                  // alert(co);
                                      //alert(imagedatalength); 
                                if (imagedatalength == co) {
                                      //alert(co);
                                      //alert(imagedatalength);
                                     // alert('going');
                                      showTeamPointsData();
                                  }
                                });     
                            });
                        }
                        
                    });
                    
                    });    
            }
            
            });
    });    
}

//function to show team points
function showTeamPointsData() {
    // alert('here');
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_teampoints where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;
            $(".table-striped tbody").html('&nbsp;');
            var label = results.rows.item(0).label;
            
            $(".green-text").html(label);
            var group_title = '';
            
            for (i = 0; i < len; i++) {
                var icon = '';
                if(results.rows.item(i).name == 'Bonus')
                {
                  icon = '<span class="icon"><i class="social-icon"></i></span>';
                }
                else if(results.rows.item(i).name == 'Social')
                {
                  icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                }
                else if(results.rows.item(i).name == 'Seekergame')
                {
                  icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                }
                else if(results.rows.item(i).name == 'Course/Quiz')
                {
                  icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                }
                else if(results.rows.item(i).name == 'Communication')
                {
                  icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                }
                 else if(results.rows.item(i).name == 'Total')
                {
                  icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                 var green_count_html = '';
                if(results.rows.item(i).green_count != 0)
                { 
                  var green_count_html = '<span class="count">'+results.rows.item(i).green_count+'</span>';
                }
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gototeamdetail('+results.rows.item(i).instance_id+');"><span class="num">'+results.rows.item(i).position+'.</span>'+icon+'<span class="icon"></span>&nbsp;'+results.rows.item(i).name+'</a></td><td class="point"><a href="#" onclick="gototeamdetail('+results.rows.item(i).instance_id+');">'+green_count_html+results.rows.item(i).userTotal+'<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to go to team point detail page
function gototeamdetail(instance_id)
{
    localStorage.instance_id = instance_id;
    window.location.href = 'team_detail_point.html';
}

//function to fetch detail team point
function loaddetailteampoints()
{
  jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        importfooter('team-points/-/OCintranet-'+static_event_id+'/topscores/'+localStorage.instance_id,'your-team');
        var main_url = server_url + 'team-points/-/OCintranet-'+static_event_id+'/topscores/'+localStorage.instance_id+'?gvm_json=1';
        
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            
               var label = '';
            $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {
                    
                    if(key == 0)
                    {
                       $(".breadcrumbs a").html(val.text) 
                    }
                    if(key == 1)
                    {
                      $(".green-text").html(val.text)  
                    }
                    
            });
            $(".team-points-table table tbody").html('');
             var i = 0;
            $.each(obj.topScoresViewVars.teamPointsSel, function(key, val) {
                   if(key == obj.topScoresViewVars.currentUserTeam)
                   {
                      var classcss="current-user" ;
                   } 
                   else
                   {
                      var classcss="" ;
                   }            
                  $(".team-points-table table tbody").append('<tr class='+classcss+'><td class="num-col"><span class="num">'+val.pos+'</span></td><td><span class="name">'+key+'</span></td><td class="point">'+val.points+'</td></tr>');
            
                
               i++;
             }); 
             var difference = Number(10) - Number(i);
             for(v = 0; v < difference; v++)
             {
                i++;
                $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">'+i+'</span></td><td><span class="name">-</span></td><td class="point">0</td></tr>'); 
             }
             $(".user-points-table table tbody").html('');
             $.each(obj.categories, function(key, val) {
                 if(val.instance_id == localStorage.instance_id)
                 {
                  var classcss="active" ;
                 } 
                 else
                 {
                    var classcss="" ;
                 }
                 
                 var icon = '';
                if(val.name == 'Bonus')
                {
                  icon = '<span class="icon"><i class="social-icon"></i></span>';
                }
                else if(val.name == 'Social')
                {
                  icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                }
                else if(val.name == 'Seekergame')
                {
                  icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                }
                else if(val.name == 'Course/Quiz')
                {
                  icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                }
                else if(val.name == 'Communication')
                {
                  icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                }
                 else if(val.name == 'Total')
                {
                  icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                     
                $(".user-points-table table tbody").append('<tr class='+classcss+'><td><a href="#" onclick="gototeamdetail('+val.instance_id+')"><span class="num">'+val.position+'.</span>'+icon+val.name+'</a></td><td class="point"><a href="#" onclick="gototeamdetail('+val.instance_id+')">'+val.points+'<i class="fa fa-angle-right"></i></a></td></tr>');  
                 
             });
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide(); 
            }
        });
        
  });      
}


//function to go to  your team point detail page
function gotoyourteamdetail(instance_id)
{
    localStorage.instance_id = instance_id;
    window.location.href = 'your_detail_point.html';
}


//function to fetch your detail team point
function loadyourdetailteampoints()
{
  jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        importfooter('Your-team/-/OCintranet-'+static_event_id+'/topscores/'+localStorage.instance_id,'your-team');
        var main_url = server_url + 'Your-team/-/OCintranet-'+static_event_id+'/topscores/'+localStorage.instance_id+'?gvm_json=1';
        
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            
               var label = '';
            $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {
                    
                    if(key == 0)
                    {
                       $(".breadcrumbs a").html(val.text) 
                    }
                    if(key == 1)
                    {
                      $(".green-text").html(val.text)  
                    }
                    
            });
            $(".team-points-table table tbody").html('');
             var i = 0;
              var classcss = '';
            $.each(obj.topScoresViewVars.usersSel, function(key, val) {
                 if(key == localStorage.user_id)
                 {
                    var classcss="current-user" ;
                 } 
                 else
                 {
                    var classcss="" ;
                 } 
                i++; 
                if(val.image != '')
                {
                  var newtd = '<td class="avatar-col"><span class="avatar"><div class="img img-circle" style="background-image:url('+val.image+');"></div></span></td>';
                }
                else
                {
                  var newtd = '<td class="avatar-col"></td>';
                } 
                  //alert(newtd)        
                  $(".team-points-table table tbody").append('<tr class='+classcss+'><td class="num-col"><span class="num">'+i+'</span></td>'+newtd+'<td><span class="name">'+val.fName+' '+val.lName+'</span></td><td class="point">'+val.total+'</td></tr>');
            
               }); 
             var difference = Number(10) - Number(i);
             for(v = 0; v < difference; v++)
             {
                i++;
                $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">'+i+'</span></td><td class="avatar-col"></td><td><span class="name">-</span></td><td class="point">0</td></tr>'); 
             }
             $(".user-points-table table tbody").html('');
             $.each(obj.categories, function(key, val) {
                 if(val.instance_id == localStorage.instance_id)
                 {
                  var classcss="active" ;
                 } 
                 else
                 {
                    var classcss="" ;
                 }
                 
                 var icon = '';
                if(val.name == 'Bonus')
                {
                  icon = '<span class="icon"><i class="social-icon"></i></span>';
                }
                else if(val.name == 'Social')
                {
                  icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                }
                else if(val.name == 'Seekergame')
                {
                  icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                }
                else if(val.name == 'Course/Quiz')
                {
                  icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                }
                else if(val.name == 'Communication')
                {
                  icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                }
                 else if(val.name == 'Total')
                {
                  icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                
                    
                $(".user-points-table table tbody").append('<tr class='+classcss+'><td><a href="#" onclick="gotoyourteamdetail('+val.instance_id+')"><span class="num">'+val.position+'.</span>'+icon+val.name+'</a></td><td class="point"><a href="#" onclick="gotoyourteamdetail('+val.instance_id+')">'+val.points+'<i class="fa fa-angle-right"></i></a></td></tr>');  
                 
             });
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide(); 
            }
        });
        
  });      
}



//function to fetch your team points
function loadyourpoints()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        importfooter('Your-team','your-team');
        var main_url = server_url + 'your-team/?gvm_json=1';
        
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            
            var label = '';
            $.each(obj.breadcrumbs, function(key, val) {
                    //alert(val.text);
                    label =  val.text;
            }); 
           // alert(label);
              var imagedatalength = obj.categories.length;  
                db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_yourteampoints (id integer primary key autoincrement,user_id,name,position integer,userTotal,green_count,label,instance_id)');                                
                    tx.executeSql('delete from OCEVENTS_yourteampoints');
                    tx.executeSql("SELECT * FROM OCEVENTS_yourteampoints where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
                        var len_ag = results.rows.length;
                       // alert(len_ag);
                        if (imagedatalength == len_ag && len_ag != 0) {                            
                            showYourTeamPointsData();
                        }
                        else
                        {
                           db.transaction(function(tx) {
                                 tx.executeSql('delete from OCEVENTS_yourteampoints');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                var green_count = 0;
                                if(val.count != null && val.count != undefined && val.count != 'null' && val.count != '')
                                {
                                    green_count =  val.count;
                                } 
                                tx.executeSql("insert into OCEVENTS_yourteampoints (user_id,name,position,userTotal,green_count,label,instance_id) values ('" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.points+ "','" + green_count+ "','" + label+ "','" + val.instance_id+ "'  )");
                                //alert(val.position);
                                co++;
                                  // alert(co);
                                      //alert(imagedatalength); 
                                if (imagedatalength == co) {
                                      //alert(co);
                                      //alert(imagedatalength);
                                     // alert('going');
                                      showYourTeamPointsData();
                                  }
                                });     
                            });
                        }
                        
                    });
                    
                    });    
            }
            
            });
    });    
}

//function to show team points
function showYourTeamPointsData() {
    // alert('here');
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_yourteampoints where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;
            $(".table-striped tbody").html('&nbsp;');
            var label = results.rows.item(0).label;
            
            $(".green-text").html(label);
            var group_title = '';
            
            for (i = 0; i < len; i++) {
                var icon = '';
                if(results.rows.item(i).name == 'Bonus')
                {
                  icon = '<span class="icon"><i class="social-icon"></i></span>';
                }
                else if(results.rows.item(i).name == 'Social')
                {
                  icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                }
                else if(results.rows.item(i).name == 'Seekergame')
                {
                  icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                }
                else if(results.rows.item(i).name == 'Course/Quiz')
                {
                  icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                }
                else if(results.rows.item(i).name == 'Communication')
                {
                  icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                }
                 else if(results.rows.item(i).name == 'Total')
                {
                  icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                 var green_count_html = '';
                if(results.rows.item(i).green_count != 0)
                { 
                  var green_count_html = '<span class="count">'+results.rows.item(i).green_count+'</span>';
                }
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gotoyourteamdetail('+results.rows.item(i).instance_id+');"><span class="num">'+results.rows.item(i).position+'.</span>'+icon+'<span class="icon"></span>&nbsp;'+results.rows.item(i).name+'</a></td><td class="point"><a href="#" onclick="gotoyourteamdetail('+results.rows.item(i).instance_id+');">'+green_count_html+results.rows.item(i).userTotal+'<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to fetch agenda items
function loadallagenda() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('agenda','agenda');
        $(".agenda-container").hide();
        //showAgendaData();
        //http://www.oceventmanager.com/agenda/-/OCintranet-100041/?ajax=1&all=1&gvm_json=1
        var main_url = server_url + 'agenda/-/OCintranet-'+static_event_id+'/?ajax=1&all=1&gvm_json=1';
        // alert(main_url);
        $("#presentations-list").html('&nbsp;');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            $.each(obj.data.presentations, function(key, val) {
                if(val.group_title != null)
                {
                var group_title = '';
                if(val.group_title != group_title)
                {
                  $("#presentations-list").append('<div class="row"><div class="date-wrapper "><div class="date"><p>'+val.group_title+'</p></div></div></div>');
                }
                group_title = val.group_title;
                $.each(val.items, function(key1, val1) {
              var duration = val1.duration; //7903980 =====  11978580
              
              var eta = val1.eta;   //3593396 ====   8691056
              
               if (Number(eta) > Number(duration)) {
                // The event has not started yet.
                var progress = 0;
            } else {
                // The event has started and is in progress.
                var progress = ((duration - eta) / duration) * 100;
            } 
            
            var c = Math.PI * 49.5 * 2;
            var pct = ((100 - progress) / 100) * c;
            pct = pct.toFixed(3)+'px';
            //alert(pct);
              //54.5368
              //27.4450  
          $("#presentations-list").append('<div class="row"><div class="agenda-content"><div class="agenda-item col-xs-12"><a href="#" onclick="gotoagenda('+val1.id+')"><div class="agenda-info"><div class="agenda-img" style="background-image: url(' + val1.speaker_image.small_url + ');"><svg class="agenda-item-progress" version="1.1" xmlns="http://www.w3.org/2000/svg" data-duration="'+duration+'" data-eta="'+eta+'"><circle class="agenda-item-progress-bg" r="47.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="298.45130209103036" stroke-dashoffset="0"></circle><circle class="agenda-item-progress-eta" r="49.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="311.01767270538954" stroke-dashoffset="" style="stroke-dashoffset: '+pct+';"></circle></svg></div><div class="agenda-wrapper"><span class="agenda-slogan">' + val1.title + '</span><i class="fa fa-angle-right"></i><div class="agenda-person-info"><span class="name">' + val1.speaker_name + '</span></div></div></div></a><div class="agenda-footer">&nbsp;<div class="meeting-location"><i class="fa fa-clock-o"></i> ' + val1.time + '</div></div></div></div></div>');
           });
            }
            });
            jQuery(".agenda-container").show();
            jQuery(".loading_agenda_items").hide();
            }
        }); 
    }); 
}

//function to fetch agenda items
function loadagenda() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('agenda','agenda');
        $(".agenda-container").hide();
        //showAgendaData();
        
        var main_url = server_url + 'api/index.php/main/agendaItems?XDEBUG_SESSION_START=PHPSTORM';
        // alert(main_url);
        $("#presentations-list").html('&nbsp');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               $.each(obj.data.presentations, function(key, val) {
                if(val.group_title != null)
                {
                var group_title = '';
                if(val.group_title != group_title)
                {
                  $("#presentations-list").append('<div class="row"><div class="date-wrapper "><div class="date"><p>'+val.group_title+'</p></div></div></div>');
                }
                group_title = val.group_title;
                $.each(val.items, function(key1, val1) {
              var duration = val1.duration; //7903980 =====  11978580
              
              var eta = val1.eta;   //3593396 ====   8691056
              
               if (Number(eta) > Number(duration)) {
                // The event has not started yet.
                var progress = 0;
            } else {
                // The event has started and is in progress.
                var progress = ((duration - eta) / duration) * 100;
            } 
            
            var c = Math.PI * 49.5 * 2;
            var pct = ((100 - progress) / 100) * c;
            pct = pct.toFixed(3)+'px';
            //alert(pct);
              //54.5368
              //27.4450  
          $("#presentations-list").append('<div class="row"><div class="agenda-content"><div class="agenda-item col-xs-12"><a href="#" onclick="gotoagenda('+val1.id+')"><div class="agenda-info"><div class="agenda-img" style="background-image: url(' + val1.speaker_image.small_url + ');"><svg class="agenda-item-progress" version="1.1" xmlns="http://www.w3.org/2000/svg" data-duration="'+duration+'" data-eta="'+eta+'"><circle class="agenda-item-progress-bg" r="47.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="298.45130209103036" stroke-dashoffset="0"></circle><circle class="agenda-item-progress-eta" r="49.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="311.01767270538954" stroke-dashoffset="" style="stroke-dashoffset: '+pct+';"></circle></svg></div><div class="agenda-wrapper"><span class="agenda-slogan">' + val1.title + '</span><i class="fa fa-angle-right"></i><div class="agenda-person-info"><span class="name">' + val1.speaker_name + '</span></div></div></div></a><div class="agenda-footer">&nbsp;<div class="meeting-location"><i class="fa fa-clock-o"></i> ' + val1.time + '</div></div></div></div></div>');
           });
            }
            });
            jQuery(".agenda-container").show();
            jQuery(".loading_agenda_items").hide();
            
               /*
               // alert(obj.status+'---'+obj.data.page_title+'---'+obj.data.presentations)
                var imagedatalength = obj.data.presentations_count;
                db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_agenda (id integer primary key autoincrement,group_title,user_id,agenda_id,event_id,title,speaker_name,speaker_image,start_time,end_time,description LONGTEXT,embeded_html,event_time,duration,eta)');                                
                    tx.executeSql('delete from OCEVENTS_agenda');
                    tx.executeSql("SELECT * FROM OCEVENTS_agenda where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
                        var len_ag = results.rows.length;
                       // alert(len_ag);
                        if (imagedatalength == len_ag && len_ag != 0) {
                            //alert(imagedatalength);
                            //alert(len_ag);
                            showAgendaData();
                        } else {
                            db.transaction(function(tx) {
                                //tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_agenda (id integer primary key autoincrement,counter,user_id,agenda_id,event_id,title,speaker_name,speaker_image,start_time,end_time,description,embeded_html)');
                                tx.executeSql('delete from OCEVENTS_agenda');
                            });
                              var co = 0;
                            $.each(obj.data.presentations, function(key, val) {
                                if (val.group_title != null) {
                                    //localStorage.group_title = val.group_title;
                                
                                
                                $.each(val.items, function(key1, val1) {

                                    // alert(key1);
                                    var DIR_Name = 'oc_photos';
                                    var a = new DirManager();
                                    a.create_r(DIR_Name, Log('created successfully'));
                                    var b = new FileManager();
                                    var img_src = val1.speaker_image.medium_url;
                                    var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;

                                    var image_name = getFileNameFromPath(img_src);


                                    //alert(imagedatalength);
                                    jQuery.ajax({
                                        url: STR,
                                        dataType: "html",
                                        success: function(DtatURL) {

                                            //alert(DtatURL);  
                                            //adb logcat *:E		 
                                            //alert(obj.data.image.image_src);
                                            //alert(image_name);
                                            b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                                                var ImgFullUrl = '';
                                                ImgFullUrl = theFile.toURI();
                                                co++;
                                                //alert(val1.title);
                                                db.transaction(function(tx) {
                                                var descr = val1.description.replace(/'/g, "");
                                                //var descr = "<p>The comments here should flow freely, and can be about everything...<br /><br />Click the <a href=\"#\" target=\"_self\">Comments</a> below to get started&nbsp;</p>\r\n<p>General principles of making friends</p>\r\n<p>&nbsp;</p>\r\n<p>The basic structure of Meet People &gt; Hang Out With Them &gt; Keep Hanging Out &gt; Repeat. Now I'll go into some broader concepts that apply to making friends as a whole.&nbsp;</p>\r\n<p>&nbsp;</p>\r\n<p>If you want a social life, you've got to make it happen for yourself.</p>\r\n<p>&nbsp;</p>";
                                                descr = descr.replace(/'/g, "\\");
                                                    //alert(descr);
                                                    tx.executeSql("insert into OCEVENTS_agenda (group_title,user_id,agenda_id,event_id,title,speaker_name,speaker_image,start_time,end_time,description,embeded_html,event_time,duration,eta) values ('"+val.group_title+"','" + localStorage.user_id + "','" + val1.id + "','" + val1.event_id + "','" + val1.title + "','" + val1.speaker_name + "','" + ImgFullUrl + "','" + val1.start_time + "','" + val1.end_time + "', '" + descr + "','" + val1.embeded_html + "','" + val1.time + "','" + val1.duration + "','" + val1.eta + "')");
                                                
                                                  
                                                if (imagedatalength == co) {
                                                    //alert(co);
                                                    //alert(imagedatalength);
                                                    //alert(imagedatalength);
                                                    //alert(co);
                                                   // alert('going');
                                                    showAgendaData();
                                                }
                                                });

                                                 
                                            });
                                        }
                                    });
                                });
                              }
                            });
                        }
                    });
                }); */
            }
        }); 
    }); 
}

//function to show agenda items
function showAgendaData() {
    // alert('here');
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_agenda where user_id = '" + localStorage.user_id + "' order by start_time asc", [], function(tx, results) {
            var len = results.rows.length;
            //alert(len); 
            //$("#presentations-list").html('<div class="row"><div class="date-wrapper "><div class="date"><p>' + localStorage.group_title + '</p></div></div></div>');
            $("#presentations-list").html('&nbsp;');
            var group_title = '';
            for (i = 0; i < len; i++) {
            //alert(results.rows.item(i).description);
                if(results.rows.item(i).group_title != group_title)
                {
                  $("#presentations-list").append('<div class="row"><div class="date-wrapper "><div class="date"><p>'+results.rows.item(i).group_title+'</p></div></div></div>');
                }
                group_title = results.rows.item(i).group_title;
                
              var duration = results.rows.item(i).duration; //7903980 =====  11978580
              
              var eta = results.rows.item(i).eta;   //3593396 ====   8691056
              
               if (Number(eta) > Number(duration)) {
                // The event has not started yet.
                var progress = 0;
            } else {
                // The event has started and is in progress.
                var progress = ((duration - eta) / duration) * 100;
            } 
            
            var c = Math.PI * 49.5 * 2;
            var pct = ((100 - progress) / 100) * c;
            pct = pct.toFixed(3)+'px';
            //alert(pct);
              //54.5368
              //27.4450  
                $("#presentations-list").append('<div class="row"><div class="agenda-content"><div class="agenda-item col-xs-12"><a href="#" onclick="gotoagenda('+results.rows.item(i).agenda_id+')"><div class="agenda-info"><div class="agenda-img" style="background-image: url(' + results.rows.item(i).speaker_image + ');"><svg class="agenda-item-progress" version="1.1" xmlns="http://www.w3.org/2000/svg" data-duration="'+duration+'" data-eta="'+eta+'"><circle class="agenda-item-progress-bg" r="47.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="298.45130209103036" stroke-dashoffset="0"></circle><circle class="agenda-item-progress-eta" r="49.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="311.01767270538954" stroke-dashoffset="" style="stroke-dashoffset: '+pct+';"></circle></svg></div><div class="agenda-wrapper"><span class="agenda-slogan">' + results.rows.item(i).title + '</span><i class="fa fa-angle-right"></i><div class="agenda-person-info"><span class="name">' + results.rows.item(i).speaker_name + '</span></div></div></div></a><div class="agenda-footer">&nbsp;<div class="meeting-location">' + results.rows.item(i).event_time + '</div></div></div></div></div>');
            }
            jQuery(".agenda-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

function viewfriend(user_id)
{
    //alert(user_id)
    localStorage.friend_id = user_id;
    window.location.href = 'view_friend.html';
}

//function to fetch user detail 
function loadfrienddetail()
{
  jQuery(document).ready(function($) {
        loadcommonthings();
        $(".add-friends-container").hide();
        importfooter('user-add-friend/-/OCintranet-'+static_event_id+'/view/'+localStorage.friend_id,'friends');
        var main_url = server_url + 'user-add-friend/-/OCintranet-'+static_event_id+'/view/'+localStorage.friend_id+'?gvm_json=1';
        
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            
               var label = '';
            $.each(obj.breadcrumbs, function(key, val) {
                    
                    if(key == 0)
                    {
                       $(".breadcrumbs a").html(val.text) 
                    }
                    if(key == 1)
                    {
                      $(".green-text").html(val.text)  
                    }                    
            });
            if(checkdefined(obj.prevFriendLink) == 'yes')
            {
                var prev_link = obj.prevFriendLink;
                var split_it = prev_link.split('view/');
                var prev_friend_id = split_it[1];
              //  alert(prev_friend_id);
                $('.prev').attr('onclick','viewfriend("'+prev_friend_id+'")'); 
            }
            else
            {
              $('.prev').hide();
            }
            if(checkdefined(obj.nextFriendLink) == 'yes')
            {
                var next_link = obj.nextFriendLink;
                var split_it = next_link.split('view/');
                var next_friend_id = split_it[1];
                //  alert(next_friend_id);
               // $('.next').attr('onclick','viewfriend("'+next_friend_id+'")');
               $('.next').attr('onclick','viewfriend("'+next_friend_id+'")'); 
            }
            else
            {
              $('.nextFriendLink').hide();
            }
            $('.friends-item-img').attr('style','background-image: url('+obj.userImageSrc+');');
            $('.fa-user').after(obj.fullName);
            if(checkdefined(obj.userTeam) == 'yes')
            {
                $('.friends-item-inner h6').html('&lt;'+obj.userTeam+'&gt;');
            }
            if(checkdefined(obj.mobile) == 'yes')
            {
                $('.call_button').attr('href','tel:'+obj.mobile);
            }
            if(checkdefined(obj.eMail) == 'yes')
            {
                $('.email_button').attr('href','mailto:'+obj.eMail);
            }
                $(".add-friends-container").show();
                $(".loading_agenda_items").hide();
            }
            });
  });
}            

//function to load contacts
function loadcontacts()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('user-add-friend/-/OCintranet-'+static_event_id+'/','friends');
        $(".add-friends-container").hide();
        //showAgendaData();
        
        var main_url = server_url + 'user-add-friend/-/OCintranet-'+static_event_id+'/?gvm_json=1';
        $(".friends-items-container").html('&nbsp');
        var icon_class = '';
        var link = '';
        var team = '';
        var divider = '';
        var first_letter = '';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
             $.each( obj.eventUserFriends, function( key, val ) {
             icon_class = '';
             link = '';
             team = '';
             divider = '';
             
             if(first_letter != val.fName[0].toUpperCase())
             {
                   //alert(first_letter)
                  //alert(val.fName[0].toUpperCase())
                  divider = '<div class="friends-item-title"> '+val.fName[0].toUpperCase()+' </div>';
             }
             
             first_letter = val.fName[0].toUpperCase();
             
             if(key == 0 && val.fName[0] != 'A')
             {
                 divider = '<div class="friends-item-title"> </div>';
             }
             
              
             if(checkdefined(val.team) == 'yes')
             {
                team = '&lt;'+val.team+'&gt;';
             }
             
             if(val.is_friend == 1 && val.status == 1)
             {
                icon_class = 'pending';
                link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url('+val.image+');"></div><h2> '+val.fullName+'</h2><h6>'+team+'</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Keep waiting for response?</h4><div class="confirm-btn-wrapper"><a href="#" class="danger cancel-friend-request">No</a></div></div>';
             }
             if(val.is_friend == 1 && val.status == 2)
             {
                link = '<div class="friends-item"><a onclick="viewfriend('+val.event_user_id+')" href="#"><div class="friends-item-img" style="background-image: url('+val.image+');"></div><h2> '+val.fullName+'</h2><h6>'+team+'</h6><span><i class="fa fa-angle-right"></i></span></a></div>';
             }
             if(val.is_friend == 0)
             {
                 link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url('+val.image+');"></div><h2> '+val.fullName+'</h2><h6>'+team+'</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Send contact request?</h4><div class="confirm-btn-wrapper"><a href="" class="danger cancel">No</a><a href="#" class="success send-friend-request">Yes</a></div></div>';
             }
             
            $('.friends-items-container').append(divider+'<div class="friends-item-wrapper '+icon_class+'">  '+link+'  </div>');   
            $(".loading_agenda_items").hide();
            $(".add-friends-container").show();
             
             });
           }
           
           });
  });            
}

//function to load contacts
function loadyourcontacts()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('user-add-friend/-/OCintranet-'+static_event_id+'/friends','friends');
        $(".add-friends-container").hide();
        //showAgendaData();
        
        var main_url = server_url + 'user-add-friend/-/OCintranet-'+static_event_id+'/friends?gvm_json=1';
        $(".friends-items-container").html('&nbsp');
        var icon_class = '';
        var link = '';
        var team = '';
        var divider = '';
        var first_letter = '';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
             $.each( obj.eventUserFriends, function( key, val ) {
             icon_class = '';
             link = '';
             team = '';
             divider = '';
             
             if(first_letter != val.fName[0].toUpperCase())
             {
                   //alert(first_letter)
                  //alert(val.fName[0].toUpperCase())
                  divider = '<div class="friends-item-title"> '+val.fName[0].toUpperCase()+' </div>';
             }
             
             first_letter = val.fName[0].toUpperCase();
             
             if(key == 0 && val.fName[0] != 'A')
             {
                 divider = '<div class="friends-item-title"> </div>';
             }
             
              
             if(checkdefined(val.team) == 'yes')
             {
                team = '&lt;'+val.team+'&gt;';
             }
             
             if(val.is_friend == 1 && val.status == 1)
             {
                icon_class = 'pending';
                link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url('+val.image+');"></div><h2> '+val.fullName+'</h2><h6>'+team+'</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Keep waiting for response?</h4><div class="confirm-btn-wrapper"><a href="#" class="danger cancel-friend-request">No</a></div></div>';
             }
             if(val.is_friend == 1 && val.status == 2)
             {
                link = '<div class="friends-item"><a onclick="viewfriend('+val.event_user_id+')" href="#"><div class="friends-item-img" style="background-image: url('+val.image+');"></div><h2> '+val.fullName+'</h2><h6>'+team+'</h6><span><i class="fa fa-angle-right"></i></span></a></div>';
             }
             if(val.is_friend == 0)
             {
                 link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url('+val.image+');"></div><h2> '+val.fullName+'</h2><h6>'+team+'</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Send contact request?</h4><div class="confirm-btn-wrapper"><a href="" class="danger cancel">No</a><a href="#" class="success send-friend-request">Yes</a></div></div>';
             }
             
            $('.friends-items-container').append(divider+'<div class="friends-item-wrapper '+icon_class+'">  '+link+'  </div>');   
            $(".loading_agenda_items").hide();
            $(".add-friends-container").show();
             
             });
           }
           
           });
  });            
}

//Load profile page variables
function loadprofile() {
    //var db = openDatabase('OCEVENTS', '1.0', 'OCEVENTS', 2 * 1024 * 1024);

    importfooter('user-profile','profile');
    db.transaction(function(tx) {

        tx.executeSql("SELECT * FROM OCEVENTS_qa where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;
            $(".qa-list").html('<dt>Registration</dt>');
            for (i = 0; i < len; i++) {
                //alert(results.rows.item(i).answer);
                $('.qa-list').append('<h4 class="qa-item-title">' + results.rows.item(i).question + '</h4><p class="answer_me">' + results.rows.item(i).answer + '</p></dd>');
            }
        });

        tx.executeSql("SELECT * FROM OCEVENTS_user where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;
            //alert(results.rows.item(0).image_src);
            $("#profile_pic").attr("style", "background-image:url(" + results.rows.item(0).image_src + ")");
            $(".player_code").html(results.rows.item(0).player_code);
            $(".main-img").attr("style", "background-image:url(" + results.rows.item(0).image_src + ")");
            $("#medium_profile_pic").attr("style", "background-image:url(" + results.rows.item(0).image_src + ")");
            //var image_source = getFileNameFromPath(image_src);  
            //alert(results.rows.item(0).is_user_image);
            if (results.rows.item(0).is_user_image == 'true') {
                $(".selfie_button").html('<button class="pic-remove" onclick="removeprofileimage();" type="button" name="remove_pic" value="1">Remove Selfie From Your Profile</button>');
            }
            $(".facebook-link").show();
           // alert(results.rows.item(0).fb_user_id);
            if (results.rows.item(0).fb_user_id != null && results.rows.item(0).fb_user_id != 'null' && results.rows.item(0).fb_user_id != '' && results.rows.item(0).fb_user_id != undefined) {
                //alert('here')
                $(".facebook-link").hide();
                 $("#unlinkfacebook").show(); 
            }




            $(".myname").html(results.rows.item(0).first_name + " " + results.rows.item(0).last_name);
            $(".myemail").html(results.rows.item(0).email);
            $(".mymobile").html(results.rows.item(0).mobile);
            if (results.rows.item(0).gender == 'm') {
                $(".mygender").html('Male');
            } else if (results.rows.item(0).gender == 'f') {
                $(".mygender").html('Female');
            } else {
                $(".mygender").html('N/A');
            }
            $(".log-info p").html("<p>" + results.rows.item(0).first_name + " " + results.rows.item(0).last_name + "<br><strong>&lt; " + results.rows.item(0).team + " &gt; </strong><br></p>");
            $(".firstname a").html(results.rows.item(0).first_name);
            $(".lastname a").html(results.rows.item(0).last_name);
            $("#fname_edit").val(results.rows.item(0).first_name);
            $("#lname_edit").val(results.rows.item(0).last_name);
            $("#email_edit").val(results.rows.item(0).email);
            $("#mobile_edit").val(results.rows.item(0).mobile);
            $(".team-name").html("&lt; " + results.rows.item(0).team + " &gt;");

            $(".fa-trophy").html("<span>#</span>" + results.rows.item(0).position);
        });

        tx.executeSql("SELECT * FROM OCEVENTS_homepage where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;
            
                $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);
            
         

        });
    });
}

function loadcommonthings() {
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_user where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;
            $("#profile_pic").attr("style", "background-image:url(" + results.rows.item(0).image_src + ")");
            $("#medium_profile_pic").attr("style", "background-image:url(" + results.rows.item(0).image_src + ")");
            $(".log-info p").html(results.rows.item(0).first_name + " " + results.rows.item(0).last_name);
            if(results.rows.item(0).team != undefined && results.rows.item(0).team != '' && results.rows.item(0).team != null && results.rows.item(0).team != 'null')
            {
              $(".log-info p").append("<br><strong>&lt; " + results.rows.item(0).team + " &gt; </strong><br />");
            }            
            //$(".log-info p").append("</p>");
            $(".firstname a").html(results.rows.item(0).first_name);
            if(results.rows.item(0).team != undefined && results.rows.item(0).team != '' && results.rows.item(0).team != null && results.rows.item(0).team != 'null')
            {
              $(".team-name").html("&lt; " + results.rows.item(0).team + " &gt;");
            }
            
            $(".lastname a").html(results.rows.item(0).last_name);
            $(".fa-trophy").html("<span>#</span>" + results.rows.item(0).position);
        });

        tx.executeSql("SELECT * FROM OCEVENTS_homepage where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            var len = results.rows.length;            
                $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);            
        });
    });
}

function login_process() {
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_qa (id integer primary key autoincrement,user_id, question,answer)');
        tx.executeSql('delete from OCEVENTS_qa');
    });
    var main_url = server_url + 'user-profile/?gvm_json=1';
    // alert('here');
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(obj) {
            $.each(obj.userQA, function(i, dataVal) {
                // alert(dataVal.question);
                if (i != 0 && dataVal.question != undefined && dataVal.answer != undefined) {
                    // alert(dataVal.question);
                    //alert(dataVal.answer);
                    if (dataVal.question != undefined && dataVal.question != null && dataVal.question != '') {
                        db.transaction(function(tx) {
                            tx.executeSql("insert into OCEVENTS_qa (user_id,question,answer) values('" + localStorage.user_id + "','" + dataVal.question + "','" + dataVal.answer + "')");
                        });
                    }
                }
            });
            importhomepage();
        }

    });
    
}

function importhomepage()
{
    
         
    
    var main_url = server_url + 'api/index.php/main/homepageSettings?XDEBUG_SESSION_START=PHPSTORM&event_id='+static_event_id;
    // alert('here');
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(obj) {
            //alert(obj.status);
            if (obj.status == 'error') {
                alert(obj.message);
                window.location.href = "index.html";
            } else {
                if (obj.data.type == 'content') {

                    db.transaction(function(tx) {

                        tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id,main_logo_small_image,main_banner_image,main_title,main_text,main_link,type,iframe_url)');
                        tx.executeSql("delete from OCEVENTS_homepage");
                        tx.executeSql("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('','','" + localStorage.user_id + "','" + obj.data.content.main_title + "','" + obj.data.content.main_text + "','" + obj.data.content.main_link + "','" + obj.data.type + "')");
                        //alert("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('','','"+localStorage.user_id+"','"+obj.data.content.main_title+"','"+obj.data.content.main_text+"','"+obj.data.content.main_link+"','"+obj.data.type+"')");
                        //alert("SELECT * FROM OCEVENTS_homepage");

                    });
                    var DIR_Name = 'oc_photos';
                    var a = new DirManager();
                    a.create_r(DIR_Name, Log('created successfully'));
                    var b = new FileManager();

                    if (obj.data.content.main_logo_image != null) {
                        var img_src = obj.data.content.main_logo_image.small_url;
                        //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                        var image_name = getFileNameFromPath(img_src);

                        var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


                        jQuery.ajax({
                            url: STR,
                            dataType: "html",
                            success: function(DtatURL) {

                                // alert(DtatURL);  
                                //adb logcat *:E		 
                                //alert(obj.data.image.image_src);
                                //alert(image_name);
                                b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                                    var ImgFullUrl = '';
                                    ImgFullUrl = theFile.toURI();
                                    //alert(ImgFullUrl);
                                    db.transaction(function(tx) {
                                        tx.executeSql('update OCEVENTS_homepage set main_logo_small_image = "' + ImgFullUrl + '" where user_id = "' + localStorage.user_id + '"');
                                        if (obj.data.content.main_banner_image == null) {
                                            //alert(obj.data.content.main_banner_image);
                                            window.location.href = "gamification.html";
                                        }
                                    });

                                });
                            }
                        });
                    }
                    if (obj.data.content.main_banner_image != null) {
                        var img_src = obj.data.content.main_banner_image.medium_url;
                        //var img_src = 'https://www.google.ro/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
                        var image_name = getFileNameFromPath(img_src);
                        //alert(img_src);
                        //  alert(image_name);
                        var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


                        jQuery.ajax({
                            url: STR,
                            dataType: "html",
                            success: function(DtatURL) {

                                //alert(DtatURL);  
                                //adb logcat *:E		 
                                // alert(obj.data.image.image_src);
                                b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                                    var BannerImgFullUrl = '';
                                    //ImgFullUrl = localStorage.ImgFullUrl; 
                                    //alert(localStorage.ImgFullUrl);
                                    BannerImgFullUrl = theFile.toURI();
                                    //alert(BannerImgFullUrl);                          
                                    db.transaction(function(tx) {

                                        tx.executeSql('update OCEVENTS_homepage set main_banner_image = "' + BannerImgFullUrl + '" where user_id = "' + localStorage.user_id + '"');

                                        window.location.href = "gamification.html";
                                    });
                                });
                            }
                        });
                    }

                    if (obj.data.content.main_banner_image == null && obj.data.content.main_logo_image == null) {
                        window.location.href = "gamification.html";
                    }

                } else if (obj.data.type == 'url') {
                      
                      downloadLogoFile(obj.data.url,obj.data.type,obj.data.main_logo_image.small_url);
                      
                } else {
                    db.transaction(function(tx) {
                        tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id, iframe_url,type,main_logo_small_image)');
                        tx.executeSql("delete from OCEVENTS_homepage");
                        tx.executeSql("INSERT INTO OCEVENTS_homepage (user_id,type) VALUES ('" + localStorage.user_id + "','" + obj.data.type + "')");
                        window.location.href = "gamification.html";
                    });
                }
            }
        }
    });
    
}

var pictureSource; // picture source
var destinationType; // sets the format of returned value

// Wait for device API libraries to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// device APIs are available
//
function onDeviceReady() {
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;
}

//function to download logo from server
function downloadLogoFile(url,type,img_src)
{
  var DIR_Name = 'oc_photos';
  //alert(img_src);
  var a = new DirManager();
  a.create_r(DIR_Name, Log('created successfully'));
  var b = new FileManager();
  var image_name = getFileNameFromPath(img_src);
  var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src; 
  jQuery.ajax({
      url: STR,
      dataType: "html",
      success: function(DtatURL) {
      b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {      
        var img_uri = theFile.toURI();
        //alert(img_uri);
        db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id, iframe_url,type,main_logo_small_image)');
        tx.executeSql("delete from OCEVENTS_homepage");
        tx.executeSql("INSERT INTO OCEVENTS_homepage (user_id,iframe_url,type,main_logo_small_image) VALUES ('" + localStorage.user_id + "','" + url + "','" + type + "','" + img_uri + "')");
        window.location.href = "gamification.html";
      });
      });
    }
  });
}

//function to import footer links
function importfooter(page,active)
{
  //alert(page);
  //alert(active);
  var main_url = server_url + page + '/?gvm_json=1&event_id='+static_event_id;
    db.transaction(function(tx) {

            tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_footerlinks (id integer primary key autoincrement,name,icon,friends_requests_count,menu_text)');
            tx.executeSql("delete from OCEVENTS_footerlinks");
            
            tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_footermorelinks (id integer primary key autoincrement,name,icon,friends_requests_count,menu_text)');
            tx.executeSql("delete from OCEVENTS_footermorelinks");
     });                   
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(data) {
        if(data._footerMenuData != undefined && data._footerMenuData != 'undefined')
        {
           var getdata =   data._footerMenuData;
        }
        else
        {
           var getdata =   data.data._footerMenuData;
        }
            jQuery.each( getdata.mainButtons, function( key, val ) {
                       //alert(val.name);
                     db.transaction(function(tx) {
                     var friend_count = 0;
                         if(val.friends_requests_count != '' && val.friends_requests_count != undefined && val.friends_requests_count != null && val.friends_requests_count != 'null' && val.friends_requests_count != 'undefined')
                         {
                            friend_count = val.friends_requests_count;
                         }
                         tx.executeSql("insert into OCEVENTS_footerlinks (name,icon,friends_requests_count,menu_text) values ('"+val.name+"','"+val.icon_class+"','"+friend_count+"','"+val.text+"')");
                         //alert("insert into OCEVENTS_footerlinks (name,icon,friends_requests_count,menu_text) values ('"+val.name+"','"+val.icon_class+"','"+friend_count+"','"+val.text+"')");
                     });
            });
             jQuery.each( getdata.moreButtons, function( key, val ) {
             
                    db.transaction(function(tx) {
                         var mfriend_count = 0;
                         if(val.friends_requests_count != '' && val.friends_requests_count != undefined && val.friends_requests_count != null && val.friends_requests_count != 'null' && val.friends_requests_count != 'undefined')
                         {
                            mfriend_count = val.friends_requests_count;
                         }
                         tx.executeSql("insert into OCEVENTS_footermorelinks (name,icon,friends_requests_count,menu_text) values ('"+val.name+"','"+val.icon_class+"','"+mfriend_count+"','"+val.text+"')");
                    });
              });
              showfooter(active);
            }
        });
}

//function to show footer links
function showfooter(active)
{
    db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM OCEVENTS_footerlinks", [], function(tx, results) {
          var len = results.rows.length;
          //alert(len)
          if(len > 0)
          {
            jQuery('.footer-menu').html('');
            var link = '';
            var name = '';
            var menu_text = '';
            var icon = '';
            var active_class = '';            
            for (i = 0; i < len; i++) {
              name = results.rows.item(i).name;
              if(name == active)
              {
                 active_class = 'active'; 
              }
              else
              {
                active_class = '';  
              }
              if(name == 'home')
              {
                link = 'gamification.html';
              }
              else if(name == 'agenda')
              {
                link = 'agenda.html';
              }
              else if(name == 'friends')
              {
                link = 'contacts.html';
              }
              else if(name == 'points')
              {
                link = 'points.html';
              }
              
              var friends_requests_count = results.rows.item(i).friends_requests_count;
              if(friends_requests_count > 0)
              {
                var count_label = '<span class="count-label">'+friends_requests_count+'</span>';
              }
              else
              {
                var count_label = '';
              }
              menu_text = results.rows.item(i).menu_text;
              
              icon = results.rows.item(i).icon;            
              jQuery('.footer-menu').append("<div class='label-container "+active_class+"'><a href="+link+"><label>"+count_label+"<i class="+icon+"></i><p>"+menu_text+"</p></label></a></div>");  
            }
          }          
      });
      tx.executeSql("SELECT * FROM OCEVENTS_footermorelinks", [], function(tx, results) {
          var len = results.rows.length; 
          //alert(len)          
           if(len > 0)
           {
              jQuery('.footer-menu').append('<div class="more-btn label-container"><label><i class="gicon-more"></i><p>More</p></label></div> ');
           
              var more_wrapper = '<div class="more-wrapper"><div class="footer-menu-opened"><ul><li><label><a id="home" href="gamification.html"><i class="gicon-welcome"></i><span>Home</span></a></label></li></ul><ul class="divider"><li><i class="gicon-gamification"></i><span class="line"></span></li></ul><ul>';
              //jQuery('.footer-menu').html('');
            var link = '';
            var name = '';
            var menu_text = '';
            var icon = '';
            var active_class = '';            
            for (i = 0; i < len; i++) {
              name = results.rows.item(i).name;
              if(name == active)
              {
                 active_class = 'active'; 
              }
              else
              {
                active_class = '';  
              }
              if(name == 'home')
              {
                link = 'gamification.html';
              }
              else if(name == 'agenda')
              {
                link = 'agenda.html';
              }
              else if(name == 'friends')
              {
                link = 'contacts.html';
              }
              else if(name == 'points')
              {
                link = 'points.html';
              }
              menu_text = results.rows.item(i).menu_text;               
              icon = results.rows.item(i).icon; 
              more_wrapper += '<li><label><a href='+link+'><i class='+icon+'></i><span>'+menu_text+'</span></a></label></li>';
          }    
              
              
              more_wrapper += '</ul></div></div>';
               //more_wrapper += '';
              // alert(more_wrapper);
              
              jQuery('.footer-menu').prepend(more_wrapper); 
              jQuery('.more-btn').on('click', function ()
              {	
          		  jQuery('.footer-menu').toggleClass('footer-menu-open');
          	  });
           }
      });    
    });
}

//function to delete entries from all the tables
function truncatealltables()
{
  db.transaction(function(tx) {
    tx.executeSql('delete from OCEVENTS_user');
    tx.executeSql('delete from OCEVENTS_ticket');
    tx.executeSql('delete from OCEVENTS_points');
    tx.executeSql('delete from OCEVENTS_agenda');
    tx.executeSql('delete from OCEVENTS_qa');
    tx.executeSql('delete from OCEVENTS_homepage');
    tx.executeSql('delete from OCEVENTS_teampoints');
    tx.executeSql('delete from OCEVENTS_yourteampoints');
    tx.executeSql('delete from OCEVENTS_footerlinks');
    tx.executeSql('delete from OCEVENTS_footermorelinks');
  });        
}


