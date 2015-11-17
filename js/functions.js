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

                        //alert(DtatURL);  
                        //adb logcat *:E		 
                        // alert(obj.data.image.image_src);
                        b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                            var ImgFullUrl = '';
                            ImgFullUrl = theFile.toURI();
                            //alert(ImgFullUrl);
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

//load agenda item
function loadagendaitem()
{
    jQuery(document).ready(function($) {
        loadcommonthings();
        
        db.transaction(function(tx) {                                                
              tx.executeSql("SELECT * FROM OCEVENTS_agenda where user_id = '" + localStorage.user_id + "' and agenda_id = '"+localStorage.agenda_id+"'", [], function(tx, results) {
              var len_ag = results.rows.length;
              $(".green-text").html(results.rows.item(0).title+' '+results.rows.item(0).speaker_name); 
              $(".agenda-item-img-info h5").html(results.rows.item(0).title);
              $(".date p").html(results.rows.item(0).group_title);
              $(".future-title").html(results.rows.item(0).speaker_name); 
              $(".future-info").html(results.rows.item(0).description); 
              $(".agenda-main-img").attr("style", "background-image:url(" + results.rows.item(0).speaker_image + ")");  
         });
         });       
                        
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
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_ticket (id integer primary key autoincrement,user_id,ticketCode,ticketSrc)');
            tx.executeSql('delete from OCEVENTS_ticket');
        });
        $(".ticketing-container").hide();
        var main_url = server_url + 'ticketing/-/100041/?gvm_json=1';
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
                tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_points (id integer primary key autoincrement,user_id,name,position integer,userTotal,green_count,hideTeamScores,label)');                                
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
                                tx.executeSql("insert into OCEVENTS_points (user_id,name,position,userTotal,green_count,hideTeamScores,label) values ('" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.userTotal+ "','" + green_count+ "','" + hideTeamScores+ "','" + label+ "' )");
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
                $(".table-striped tbody").append('<tr><td><a href="#"><span class="num">'+results.rows.item(i).position+'.</span>'+icon+'<span class="icon"></span>&nbsp;'+results.rows.item(i).name+'</a></td><td class="point"><a href="#">'+green_count_html+results.rows.item(i).userTotal+'<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to fetch team points
function loadteampoints()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
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
                tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_teampoints (id integer primary key autoincrement,user_id,name,position integer,userTotal,green_count,label)');                                
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
                                tx.executeSql("insert into OCEVENTS_teampoints (user_id,name,position,userTotal,green_count,label) values ('" + localStorage.user_id + "','" + val.name + "','" + val.index + "','" + val.points+ "','" + green_count+ "','" + label+ "' )");
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
                $(".table-striped tbody").append('<tr><td><a href="#"><span class="num">'+results.rows.item(i).position+'.</span>'+icon+'<span class="icon"></span>&nbsp;'+results.rows.item(i).name+'</a></td><td class="point"><a href="#">'+green_count_html+results.rows.item(i).userTotal+'<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}



//function to fetch your team points
function loadyourpoints()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
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
                tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_yourteampoints (id integer primary key autoincrement,user_id,name,position integer,userTotal,green_count,label)');                                
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
                                tx.executeSql("insert into OCEVENTS_yourteampoints (user_id,name,position,userTotal,green_count,label) values ('" + localStorage.user_id + "','" + val.name + "','" + val.index + "','" + val.points+ "','" + green_count+ "','" + label+ "' )");
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
                $(".table-striped tbody").append('<tr><td><a href="#"><span class="num">'+results.rows.item(i).position+'.</span>'+icon+'<span class="icon"></span>&nbsp;'+results.rows.item(i).name+'</a></td><td class="point"><a href="#">'+green_count_html+results.rows.item(i).userTotal+'<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to fetch agenda items
function loadagenda() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        $(".agenda-container").hide();
        //showAgendaData();
        
        var main_url = server_url + 'api/index.php/main/agendaItems?XDEBUG_SESSION_START=PHPSTORM';
        // alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               // alert(obj.status+'---'+obj.data.page_title+'---'+obj.data.presentations)
                var imagedatalength = obj.data.presentations_count;
                db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_agenda (id integer primary key autoincrement,group_title,user_id,agenda_id,event_id,title,speaker_name,speaker_image,start_time,end_time,description LONGTEXT,embeded_html,event_time)');                                
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
                                                    tx.executeSql("insert into OCEVENTS_agenda (group_title,user_id,agenda_id,event_id,title,speaker_name,speaker_image,start_time,end_time,description,embeded_html,event_time) values ('"+val.group_title+"','" + localStorage.user_id + "','" + val1.id + "','" + val1.event_id + "','" + val1.title + "','" + val1.speaker_name + "','" + ImgFullUrl + "','" + val1.start_time + "','" + val1.end_time + "', '" + descr + "','" + val1.embeded_html + "','" + val1.time + "')");
                                                
                                                  
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
                });
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
                
                
                
                $("#presentations-list").append('<div class="row"><div class="agenda-content"><div class="agenda-item col-xs-12"><a href="#" onclick="gotoagenda('+results.rows.item(i).agenda_id+')"><div class="agenda-info"><div class="agenda-img" style="background-image: url(' + results.rows.item(i).speaker_image + ');"><svg class="agenda-item-progress" version="1.1" xmlns="http://www.w3.org/2000/svg" data-duration="" data-eta=""><circle class="agenda-item-progress-bg" r="47.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="298.45130209103036" stroke-dashoffset="0"></circle><circle class="agenda-item-progress-eta" r="49.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="311.01767270538954" stroke-dashoffset="0"></circle></svg></div><div class="agenda-wrapper"><span class="agenda-slogan">' + results.rows.item(i).title + '</span><i class="fa fa-angle-right"></i><div class="agenda-person-info"><span class="name">' + results.rows.item(i).speaker_name + '</span></div></div></div></a><div class="agenda-footer">&nbsp;<div class="meeting-location">' + results.rows.item(i).event_time + '</div></div></div></div></div>');
            }
            jQuery(".agenda-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//Load profile page variables
function loadprofile() {
    //var db = openDatabase('OCEVENTS', '1.0', 'OCEVENTS', 2 * 1024 * 1024);


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
            if (results.rows.item(0).type == 'content') {
                $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);
            }


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

//function to delete entries all tables
function truncatealltables()
{
  db.transaction(function(tx) {
    tx.executeSql('delete from OCEVENTS_user');
    tx.executeSql('delete from OCEVENTS_ticket');
    tx.executeSql('delete from OCEVENTS_points');
    tx.executeSql('delete from OCEVENTS_agenda');
    tx.executeSql('delete from OCEVENTS_qa');
    tx.executeSql('delete from OCEVENTS_homepage');
  });        
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