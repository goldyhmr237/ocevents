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
    if (confirm('Are you sure you want to unlink facebook from your account?')) {


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
    importfooter('g-homepage', 'home');

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
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 100,
        allowEdit: true,
        destinationType: destinationType.FILE_URI,
        saveToPhotoAlbum: false
    });
}


function getPhoto(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.NATIVE_URI,
        sourceType: source
    });
}

// Called when a photo is successfully retrieved
function onPhotoURISuccess(imageURI) {

    var imageData = imageURI;
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
                            tx.executeSql('update OCEVENTS_user set image_src = "' + ImgFullUrl + '",is_user_image="true" where user_id = "' + localStorage.user_id + '"');

                            window.location.href = "profile.html";

                        });

                    });
                }
            });
        }
    }

    function fail(error) {
        alert("An error has occurred: Code = " + error.code);
        alert("upload error source " + error.source);
        alert("upload error target " + error.target);
    }
}

function captureImage() {
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onImageURISuccess, onFail, {
        quality: 100,
        allowEdit: true,
        destinationType: destinationType.FILE_URI,
        saveToPhotoAlbum: false
    });
}


function uploadImage(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onImageURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.NATIVE_URI,
        sourceType: source
    });
}

// Called when an image from comment is successfully retrieved
function onImageURISuccess(imageURI) {
//alert(imageURI);
jQuery('.swiper-container').show();
jQuery('.preview').html('<img src = '+imageURI+' width="80" height="80" />');
localStorage.imageURI = imageURI;
    
}

function hidethumb()
{
  localStorage.imageURI = '';
  jQuery('.swiper-container').hide();
}

function showbuttons() {
    jQuery('.hidden_button').attr('style', 'display:block !important');
    jQuery('.selfie_capture').hide();
}

function showimagebuttons()
{
    jQuery('.captureimage').show();
    jQuery('.uploadimage').show();
}


//function to play video
function playvideo(videoUrl) {
    var options = {
        successCallback: function() {
            console.log("Video was closed without error.");
        },
        errorCallback: function(errMsg) {
            console.log("Error! " + errMsg);
        }
    };
    window.plugins.streamingMedia.playVideo(videoUrl, options);
}

function checkdefined(str) {
    //alert(str)
    if (str != '' && str != undefined && str != 'undefined' && str != null && str != 'null') {
        return 'yes';
    } else {
        return 'no';
    }
}

//load agenda item
function loadagendaitem() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        //$(".agenda-item-container").hide();
        importfooter('View-presentation/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id, 'agenda-item');
        var main_url = server_url + 'View-presentation/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '?gvm_json=1';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(data) {
                if (data.prevPresentation != false) {
                    $('.prev').attr('onclick', 'gotoagenda("' + data.prevPresentation.instance_id + '")');
                } else {
                    $('.prev i').hide();
                }
                if (data.nextPresentation != false) {
                    $('.next').attr('onclick', 'gotoagenda("' + data.nextPresentation.instance_id + '")');
                } else {
                    $('.next i').hide();
                }
                $(".green-text").html(data.presentation.title.value);
                $(".agenda-item-img-info h5").html(data.presentation.title.value);
                if(checkdefined(data.presentation.location) == 'yes')
                {
                   $(".agenda-item-img-info h5").after('<p><i class="fa fa-map-marker"></i>'+data.presentation.location+'</p>');
                }
                
                $(".date p").html(data.presentation.group_item);
                $(".future-title").html(data.presentation.speaker_name.value);
                $(".future-info").html(data.presentation.description.value);
                if (checkdefined(data.presentation.speaker_image) == 'yes') {
                    var imgurl = server_url + 'resources/files/images/' + data.presentation.speaker_image.__extra.medium_file_name;
                    $(".agenda-main-img").attr("style", "background-image:url(" + imgurl + ")");
                }
                //alert(data.presentation.time)
                if (checkdefined(data.presentation.time) == 'yes') {
                    $('.fa-clock-o').after(data.presentation.time)
                }
                //alert(checkundefined(data.videoSrc));
                if (checkdefined(data.videoSrc) == 'yes') {
                    $('.future-video').show();
                    $('.future-video').attr('onclick', 'playvideo("' + server_url + data.videoSrc + '")');
                    $('.playme').attr('src', server_url + data.videoPoster);
                    $('.playme').attr('style', 'width:100%;height:400px;');
                    $('.future-info').attr('style', 'position:relative;bottom:128px;');
                }
                if (checkdefined(data.presentation.embeded_html.value) == 'yes') {
                    $(".future-info").append('<div class="video-wrapper">' + data.presentation.embeded_html.value + '</div>');
                }

                $.each(data.presentationModules, function(key, val) {

                    var container_class = val.container_class;
                    var icon_class = val.icon_class;
                    var text = val.text;
                    var onclick = '';
                    if(val.name == 'comments')
                    {
                        onclick = 'onclick=add_comments()';
                    }
                    if(val.name == 'q_and_a')
                    {
                        onclick = 'onclick=add_questions()';
                    }
                    if(val.name == 'quiz')
                    {
                        onclick = 'onclick=add_quiz()';
                    }
                    if(val.name == 'voting')
                    {
                        onclick = 'onclick=voting()';
                    }
                    if(val.name == 'seeker')
                    {
                      onclick = 'onclick=gotoseeker()';
                    }
                    //alert(text)
                    $(".presentation-modules").append('<a href="#" '+onclick+'><i class="' + icon_class + '"></i>' + text + '</a>')

                });

                if (data.hasRating == true) {
                    $('.agenda-item-rating-container').show();
                    $('.item-interactions').html('<div class="item-interaction item-interaction-rate interaction-box" data-ratevalue="' + data.ratevalue + '" data-original-title="" title=""><a href="#" class="rate-star active" data-rate="1"><i class="fa fa-star"></i></a><a href="#" class="rate-star" data-rate="2"><i class="fa fa-star"></i></a><a href="#" class="rate-star" data-rate="3"><i class="fa fa-star"></i></a><a href="#" class="rate-star" data-rate="4"><i class="fa fa-star"></i></a><a href="#" class="rate-star" data-rate="5"><i class="fa fa-star"></i></a></div>');
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
function gotoagenda(agenda_id) {
    localStorage.agenda_id = agenda_id;
    window.location.href = 'agenda_item.html';
}

//function to fetch user points
function loadticket() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('ticketing', 'home');
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_ticket (id integer primary key autoincrement,user_id,ticketCode,ticketSrc)');
            tx.executeSql('delete from OCEVENTS_ticket');
        });
        $(".ticketing-container").hide();
        var main_url = server_url + 'ticketing/-/' + static_event_id + '/?gvm_json=1';
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
                var img_src = server_url + obj.ticketSrc;
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
function showTicket() {
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_ticket where user_id = '" + localStorage.user_id + "'", [], function(tx, results) {
            jQuery(".ticket_code").html(results.rows.item(0).ticketCode);
            jQuery(".qr_photo").attr("src", results.rows.item(0).ticketSrc);
            jQuery(".ticketing-container").show();
            jQuery(".loading_agenda_items").hide();
        });
    });
}

//function to fetch user points
function loadpoints() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('user-points', 'points');
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
                var hideTeamScores = obj.hideTeamScores;
                //var label =  obj.breadcrumbs.text;
                //alert(obj.breadcrumbs);
                //alert(label);
                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {
                    //alert(val.text);
                    label = val.text;
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
                        } else {
                            db.transaction(function(tx) {
                                tx.executeSql('delete from OCEVENTS_points');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                    var green_count = 0;
                                    if (val.count != null && val.count != undefined && val.count != 'null' && val.count != '') {
                                        green_count = val.count;
                                    }
                                    tx.executeSql("insert into OCEVENTS_points (user_id,name,position,userTotal,green_count,hideTeamScores,label,instance_id) values ('" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.userTotal + "','" + green_count + "','" + hideTeamScores + "','" + label + "' ,'" + val.instance_id + "' )");
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
            if (hideTeamScores == 'false') {
                $('.teampoints').show();
                $('.yourteam').show();
                $('.user-points-table-title tbody tr th').attr('class', 'col-xs-4');
            }
            $(".green-text").html(label);
            var group_title = '';

            //alert(results.rows.item(0).hideTeamScores);
            for (i = 0; i < len; i++) {
                //alert(results.rows.item(i).description);
                var icon = '';
                if (results.rows.item(i).name == 'Bonus') {
                    icon = '<span class="icon"><i class="social-icon"></i></span>';
                } else if (results.rows.item(i).name == 'Social') {
                    icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                } else if (results.rows.item(i).name == 'Seekergame') {
                    icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                } else if (results.rows.item(i).name == 'Course/Quiz') {
                    icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                } else if (results.rows.item(i).name == 'Communication') {
                    icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                } else if (results.rows.item(i).name == 'Total') {
                    icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                var green_count_html = '';
                if (results.rows.item(i).green_count != 0) {
                    var green_count_html = '<span class="count">' + results.rows.item(i).green_count + '</span>';
                }
               var id = results.rows.item(i).userTotal ;
                var user_total = formatpoints(id);
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gotopoints(' + results.rows.item(i).instance_id + ');"><span class="num">' + results.rows.item(i).position + '.</span>' + icon + '<span class="icon"></span>&nbsp;' + results.rows.item(i).name + '</a></td><td class="point"><a href="#" onclick="gotopoints(' + results.rows.item(i).instance_id + ');">' + green_count_html + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to format points string
function formatpoints(id)
{
  if(id.length == 7)
   {
      var user_total = id[0]+id[1]+id[2]+id[3]+' '+id[4]+id[5]+id[6];
   }
   else if(id.length == 6)
   {
      var user_total = id[0]+id[1]+id[2]+' '+id[3]+id[4]+id[5];
   } 
   else if(id.length == 5)
   {
      var user_total = id[0]+id[1]+' '+id[2]+id[3]+id[4];
   } 
   else if(id.length == 4)
   {
      var user_total = id[0]+' '+id[1]+id[2]+id[3];
   }
   else
   {
      var user_total = id;
   }
   return user_total;
}

//function to go to user point detail page
function gotopoints(instance_id) {
    localStorage.instance_id = instance_id;
    window.location.href = 'user_detail.html';
}

//function to fetch user detail 
function loaduserdetail() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        importfooter('user-points/-/OCintranet-' + static_event_id + '/topscores/' + localStorage.instance_id, 'points');
        var main_url = server_url + 'user-points/-/OCintranet-' + static_event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".green-text").html(val.text)
                    }

                });
                $(".team-points-table table tbody").html('');
                var i = 0;
                var classcss = '';
                $.each(obj.topScoresViewVars.users, function(key, val) {
                    if (val.eventuser_id == localStorage.user_id) {
                        var classcss = "current-user";
                    } else {
                        var classcss = "";
                    }
                    if (val.image != '') {
                        var newtd = '<td class="avatar-col"><span class="avatar"><div class="img img-circle" style="background-image:url(' + val.image + ');"></div></span></td>';
                    } else {
                        var newtd = '<td class="avatar-col"></td>';
                    }
                    i++;
                     var id = val.total ;
                 var user_total = formatpoints(id);
                    $(".team-points-table table tbody").append('<tr class=' + classcss + '><td class="num-col"><span class="num">' + i + '</span></td>' + newtd + '<td><span class="name">' + val.fName + ' ' + val.lName + '</span></td><td class="point">' + user_total + '</td></tr>');

                });
                var difference = Number(10) - Number(i);
                for (v = 0; v < difference; v++) {
                    i++;
                    $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">' + i + '</span></td><td class="avatar-col"></td><td><span class="name">-</span></td><td class="point">0</td></tr>');
                }
                $(".user-points-table table tbody").html('');
                $.each(obj.categories, function(key, val) {
                    if (val.instance_id == localStorage.instance_id) {
                        var classcss = "active";
                    } else {
                        var classcss = "";
                    }

                    var icon = '';
                    if (val.name == 'Bonus') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.name == 'Social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.name == 'Seekergame') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.name == 'Course/Quiz') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.name == 'Communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.name == 'Total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                    }
                    if (val.count > 0) {
                        var cnt = '<span class="count">' + val.count + '</span>';
                    } else {
                        var cnt = '';
                    }
                    var id = val.userTotal ;
                 var user_total = formatpoints(id);
                    $(".user-points-table table tbody").append('<tr class=' + classcss + '><td><a href="#" onclick="gotopoints(' + val.instance_id + ')"><span class="num">' + val.position + '.</span>' + icon + val.name + '</a></td><td class="point"><a href="#" onclick="gotopoints(' + val.instance_id + ')">' + cnt + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');

                });
                jQuery(".leaderboards-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });

    });
}

//function to fetch team points
function loadteampoints() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('team-points', 'team-points');
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
                    label = val.text;
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
                        } else {
                            db.transaction(function(tx) {
                                tx.executeSql('delete from OCEVENTS_teampoints');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                    var green_count = 0;
                                    if (val.count != null && val.count != undefined && val.count != 'null' && val.count != '') {
                                        green_count = val.count;
                                    }
                                    tx.executeSql("insert into OCEVENTS_teampoints (user_id,name,position,userTotal,green_count,label,instance_id) values ('" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.points + "','" + green_count + "','" + label + "','" + val.instance_id + "' )");
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
                if (results.rows.item(i).name == 'Bonus') {
                    icon = '<span class="icon"><i class="social-icon"></i></span>';
                } else if (results.rows.item(i).name == 'Social') {
                    icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                } else if (results.rows.item(i).name == 'Seekergame') {
                    icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                } else if (results.rows.item(i).name == 'Course/Quiz') {
                    icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                } else if (results.rows.item(i).name == 'Communication') {
                    icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                } else if (results.rows.item(i).name == 'Total') {
                    icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                var green_count_html = '';
                if (results.rows.item(i).green_count != 0) {
                    var green_count_html = '<span class="count">' + results.rows.item(i).green_count + '</span>';
                }
                 var id = results.rows.item(i).userTotal ;
                 var user_total = formatpoints(id);
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gototeamdetail(' + results.rows.item(i).instance_id + ');"><span class="num">' + results.rows.item(i).position + '.</span>' + icon + '<span class="icon"></span>&nbsp;' + results.rows.item(i).name + '</a></td><td class="point"><a href="#" onclick="gototeamdetail(' + results.rows.item(i).instance_id + ');">' + green_count_html + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            jQuery(".leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to go to team point detail page
function gototeamdetail(instance_id) {
    localStorage.instance_id = instance_id;
    window.location.href = 'team_detail_point.html';
}

//function to fetch detail team point
function loaddetailteampoints() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        importfooter('team-points/-/OCintranet-' + static_event_id + '/topscores/' + localStorage.instance_id, 'your-team');
        var main_url = server_url + 'team-points/-/OCintranet-' + static_event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".green-text").html(val.text)
                    }

                });
                $(".team-points-table table tbody").html('');
                var i = 0;
                $.each(obj.topScoresViewVars.teamPointsSel, function(key, val) {
                    if (key == obj.topScoresViewVars.currentUserTeam) {
                        var classcss = "current-user";
                    } else {
                        var classcss = "";
                    }
                    var id = val.points ;
                 var user_total = formatpoints(id);
                    $(".team-points-table table tbody").append('<tr class=' + classcss + '><td class="num-col"><span class="num">' + val.pos + '</span></td><td><span class="name">' + key + '</span></td><td class="point">' + user_total + '</td></tr>');


                    i++;
                });
                var difference = Number(10) - Number(i);
                for (v = 0; v < difference; v++) {
                    i++;
                    $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">' + i + '</span></td><td><span class="name">-</span></td><td class="point">0</td></tr>');
                }
                $(".user-points-table table tbody").html('');
                $.each(obj.categories, function(key, val) {
                    if (val.instance_id == localStorage.instance_id) {
                        var classcss = "active";
                    } else {
                        var classcss = "";
                    }

                    var icon = '';
                    if (val.name == 'Bonus') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.name == 'Social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.name == 'Seekergame') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.name == 'Course/Quiz') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.name == 'Communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.name == 'Total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                    }
                    var id = val.points ;
                 var user_total = formatpoints(id);
                    $(".user-points-table table tbody").append('<tr class=' + classcss + '><td><a href="#" onclick="gototeamdetail(' + val.instance_id + ')"><span class="num">' + val.position + '.</span>' + icon + val.name + '</a></td><td class="point"><a href="#" onclick="gototeamdetail(' + val.instance_id + ')">' + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');

                });
                jQuery(".leaderboards-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });

    });
}


//function to go to  your team point detail page
function gotoyourteamdetail(instance_id) {
    localStorage.instance_id = instance_id;
    window.location.href = 'your_detail_point.html';
}


//function to fetch your detail team point
function loadyourdetailteampoints() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        importfooter('Your-team/-/OCintranet-' + static_event_id + '/topscores/' + localStorage.instance_id, 'your-team');
        var main_url = server_url + 'Your-team/-/OCintranet-' + static_event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".green-text").html(val.text)
                    }

                });
                $(".team-points-table table tbody").html('');
                var i = 0;
                var classcss = '';
                $.each(obj.topScoresViewVars.usersSel, function(key, val) {
                    if (key == localStorage.user_id) {
                        var classcss = "current-user";
                    } else {
                        var classcss = "";
                    }
                    i++;  
                    var id = val.total ;
                 var user_total = formatpoints(id);
                    if (val.image != '') {
                        var newtd = '<td class="avatar-col"><span class="avatar"><div class="img img-circle" style="background-image:url(' + val.image + ');"></div></span></td>';
                    } else {
                        var newtd = '<td class="avatar-col"></td>';
                    }
                    //alert(newtd)        
                    $(".team-points-table table tbody").append('<tr class=' + classcss + '><td class="num-col"><span class="num">' + i + '</span></td>' + newtd + '<td><span class="name">' + val.fName + ' ' + val.lName + '</span></td><td class="point">' + user_total + '</td></tr>');

                });
                var difference = Number(10) - Number(i);
                for (v = 0; v < difference; v++) {
                    i++;
                    $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">' + i + '</span></td><td class="avatar-col"></td><td><span class="name">-</span></td><td class="point">0</td></tr>');
                }
                $(".user-points-table table tbody").html('');
                $.each(obj.categories, function(key, val) {
                    if (val.instance_id == localStorage.instance_id) {
                        var classcss = "active";
                    } else {
                        var classcss = "";
                    }

                    var icon = '';
                    if (val.name == 'Bonus') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.name == 'Social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.name == 'Seekergame') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.name == 'Course/Quiz') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.name == 'Communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.name == 'Total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                    }
                    
                      var id = val.points ;
                 var user_total = formatpoints(id);
                    $(".user-points-table table tbody").append('<tr class=' + classcss + '><td><a href="#" onclick="gotoyourteamdetail(' + val.instance_id + ')"><span class="num">' + val.position + '.</span>' + icon + val.name + '</a></td><td class="point"><a href="#" onclick="gotoyourteamdetail(' + val.instance_id + ')">' + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');

                });
                jQuery(".leaderboards-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });

    });
}



//function to fetch your team points
function loadyourpoints() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        importfooter('Your-team', 'your-team');
        var main_url = server_url + 'your-team/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {
                    //alert(val.text);
                    label = val.text;
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
                        } else {
                            db.transaction(function(tx) {
                                tx.executeSql('delete from OCEVENTS_yourteampoints');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                    var green_count = 0;
                                    if (val.count != null && val.count != undefined && val.count != 'null' && val.count != '') {
                                        green_count = val.count;
                                    }
                                    tx.executeSql("insert into OCEVENTS_yourteampoints (user_id,name,position,userTotal,green_count,label,instance_id) values ('" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.points + "','" + green_count + "','" + label + "','" + val.instance_id + "'  )");
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
                if (results.rows.item(i).name == 'Bonus') {
                    icon = '<span class="icon"><i class="social-icon"></i></span>';
                } else if (results.rows.item(i).name == 'Social') {
                    icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                } else if (results.rows.item(i).name == 'Seekergame') {
                    icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                } else if (results.rows.item(i).name == 'Course/Quiz') {
                    icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                } else if (results.rows.item(i).name == 'Communication') {
                    icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                } else if (results.rows.item(i).name == 'Total') {
                    icon = '<span class="icon"><i class="gicon-points"></i></span>';
                }
                var green_count_html = '';
                if (results.rows.item(i).green_count != 0) {
                    var green_count_html = '<span class="count">' + results.rows.item(i).green_count + '</span>';
                }
                var id = results.rows.item(i).userTotal ;
                 var user_total = formatpoints(id);
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gotoyourteamdetail(' + results.rows.item(i).instance_id + ');"><span class="num">' + results.rows.item(i).position + '.</span>' + icon + '<span class="icon"></span>&nbsp;' + results.rows.item(i).name + '</a></td><td class="point"><a href="#" onclick="gotoyourteamdetail(' + results.rows.item(i).instance_id + ');">' + green_count_html + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');
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
        importfooter('agenda', 'agenda');
        $(".agenda-container").hide();
        //showAgendaData();
        //http://www.oceventmanager.com/agenda/-/OCintranet-100041/?ajax=1&all=1&gvm_json=1
        var main_url = server_url + 'agenda/-/OCintranet-' + static_event_id + '/?ajax=1&all=1&gvm_json=1';
        // alert(main_url);
        $("#presentations-list").html('&nbsp;');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommonagendalist(obj);
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
        importfooter('agenda', 'agenda');
        $(".agenda-container").hide();
        var main_url = server_url + 'api/index.php/main/agendaItems?XDEBUG_SESSION_START=PHPSTORM';
        $("#presentations-list").html('&nbsp');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommonagendalist(obj);
                jQuery(".agenda-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });
    });
}

//function to show common agenda list
function showcommonagendalist(obj) {
    $.each(obj.data.presentations, function(key, val) {
        //if(val.group_title != null)
        // {
        var group_title = '';
        if (val.group_title != group_title && val.group_title != null && val.group_title != '' && val.group_title != undefined) {
            $("#presentations-list").append('<div class="row"><div class="date-wrapper "><div class="date"><p>' + val.group_title + '</p></div></div></div>');
        }
        group_title = val.group_title;
        $.each(val.items, function(key1, val1) {
            var duration = val1.duration; //7903980 =====  11978580

            var eta = val1.eta; //3593396 ====   8691056

            if (Number(eta) > Number(duration)) {
                // The event has not started yet.
                var progress = 0;
            } else {
                // The event has started and is in progress.
                var progress = ((duration - eta) / duration) * 100;
            }

            var c = Math.PI * 49.5 * 2;
            var pct = ((100 - progress) / 100) * c;
            pct = pct.toFixed(3) + 'px';
            //alert(pct);
            //54.5368
            //27.4450  
            var img_str = '';
            if (checkdefined(val1.speaker_image) == 'yes') {
                img_str = '<div class="agenda-img" style="background-image: url(' + val1.speaker_image.small_url + ');">';
            } else {
                img_str = '<div class="agenda-img">';
            }

            $("#presentations-list").append('<div class="row"><div class="agenda-content"><div class="agenda-item col-xs-12"><a href="#" onclick="gotoagenda(' + val1.id + ')"><div class="agenda-info">' + img_str + '<svg class="agenda-item-progress" version="1.1" xmlns="http://www.w3.org/2000/svg" data-duration="' + duration + '" data-eta="' + eta + '"><circle class="agenda-item-progress-bg" r="42.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="267.0353755551324" stroke-dashoffset="0"></circle><circle class="agenda-item-progress-eta" r="44.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="279.6017461694916" stroke-dashoffset="" style="stroke-dashoffset: ' + pct + ';"></circle></svg></div><div class="agenda-wrapper"><span class="agenda-slogan">' + val1.title + '</span><i class="fa fa-angle-right"></i><div class="agenda-person-info"><span class="name">' + val1.speaker_name + '</span></div></div></div></a><div class="agenda-footer">&nbsp;<div class="meeting-location"><i class="fa fa-clock-o"></i> ' + val1.time + '</div></div></div></div></div>');
        });
        // }
    });
}

//function to load current sponsors
function loadallsponsors() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('sponsors/-/OCintranet-' + static_event_id, 'sponsors');
        $(".agenda-container").hide();
        //showAgendaData();

        var main_url = server_url + 'sponsors/-/OCintranet-' + static_event_id + '/?gvm_json=1&ajax=1&all=1';
        // alert(main_url);
        $("#presentations-list").html('&nbsp');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommonagendalist(obj);
                jQuery(".agenda-container").show();
                jQuery(".loading_agenda_items").hide();

            }
        });
    });
}

//function to load all sponsors
function loadsponsors() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('sponsors/-/OCintranet-' + static_event_id, 'sponsors');
        $(".agenda-container").hide();
        //showAgendaData();

        var main_url = server_url + 'sponsors/-/OCintranet-' + static_event_id + '/?gvm_json=1';
        // alert(main_url);
        $("#presentations-list").html('&nbsp');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommonagendalist(obj);
                jQuery(".agenda-container").show();
                jQuery(".loading_agenda_items").hide();

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
                
                if (results.rows.item(i).group_title != group_title) {
                    $("#presentations-list").append('<div class="row"><div class="date-wrapper "><div class="date"><p>' + results.rows.item(i).group_title + '</p></div></div></div>');
                }
                group_title = results.rows.item(i).group_title;

                var duration = results.rows.item(i).duration; //7903980 =====  11978580

                var eta = results.rows.item(i).eta; //3593396 ====   8691056

                if (Number(eta) > Number(duration)) {
                    // The event has not started yet.
                    var progress = 0;
                } else {
                    // The event has started and is in progress.
                    var progress = ((duration - eta) / duration) * 100;
                }

                var c = Math.PI * 49.5 * 2;
                var pct = ((100 - progress) / 100) * c;
                pct = pct.toFixed(3) + 'px';
                //alert(pct);
                //54.5368
                //27.4450  
                $("#presentations-list").append('<div class="row"><div class="agenda-content"><div class="agenda-item col-xs-12"><a href="#" onclick="gotoagenda(' + results.rows.item(i).agenda_id + ')"><div class="agenda-info"><div class="agenda-img" style="background-image: url(' + results.rows.item(i).speaker_image + ');"><svg class="agenda-item-progress" version="1.1" xmlns="http://www.w3.org/2000/svg" data-duration="' + duration + '" data-eta="' + eta + '"><circle class="agenda-item-progress-bg" r="47.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="298.45130209103036" stroke-dashoffset="0"></circle><circle class="agenda-item-progress-eta" r="49.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="311.01767270538954" stroke-dashoffset="" style="stroke-dashoffset: ' + pct + ';"></circle></svg></div><div class="agenda-wrapper"><span class="agenda-slogan">' + results.rows.item(i).title + '</span><i class="fa fa-angle-right"></i><div class="agenda-person-info"><span class="name">' + results.rows.item(i).speaker_name + '</span></div></div></div></a><div class="agenda-footer">&nbsp;<div class="meeting-location">' + results.rows.item(i).event_time + '</div></div></div></div></div>');
            }
            jQuery(".agenda-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

function viewfriend(user_id) {
    //alert(user_id)
    localStorage.friend_id = user_id;
    window.location.href = 'view_friend.html';
}

//function to fetch user detail 
function loadfrienddetail() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        $(".add-friends-container").hide();
        importfooter('user-add-friend/-/OCintranet-' + static_event_id + '/view/' + localStorage.friend_id, 'friends');
        var main_url = server_url + 'user-add-friend/-/OCintranet-' + static_event_id + '/view/' + localStorage.friend_id + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".green-text").html(val.text)
                    }
                });
                if (checkdefined(obj.prevFriendLink) == 'yes') {
                    var prev_link = obj.prevFriendLink;
                    var split_it = prev_link.split('view/');
                    var prev_friend_id = split_it[1];
                    //  alert(prev_friend_id);
                    $('.prev').attr('onclick', 'viewfriend(' + prev_friend_id + ')');
                } else {
                    $('.prev').hide();
                }
                if (checkdefined(obj.nextFriendLink) == 'yes') {
                    var next_link = obj.nextFriendLink;
                    var split_it = next_link.split('view/');
                    var next_friend_id = split_it[1];
                    //  alert(next_friend_id);
                    // $('.next').attr('onclick','viewfriend("'+next_friend_id+'")');
                    $('.next').attr('onclick', 'viewfriend(' + next_friend_id + ')');
                } else {
                    $('.nextFriendLink').hide();
                }
                $('.friends-item-img').attr('style', 'background-image: url(' + obj.userImageSrc + ');');
                $('.fa-user').after(obj.fullName);
                if (checkdefined(obj.userTeam) == 'yes') {
                    $('.friends-item-inner h6').html('&lt;' + obj.userTeam + '&gt;');
                }
                if (checkdefined(obj.mobile) == 'yes') {
                    $('.call_button').attr('href', 'tel:' + obj.mobile);
                    $('.em').html(obj.mob);
                }
                if (checkdefined(obj.eMail) == 'yes') {
                    $('.email_button').attr('href', 'mailto:' + obj.eMail);
                    $('.em').html(obj.eMail);
                }
                if (checkdefined(obj.downloadVCardLink) == 'yes') {
                    $('.vcard').attr('onclick', 'downloadVcard("' + obj.downloadVCardLink + '")');
                }
                if (checkdefined(obj.gender) == 'yes') {
                    $('.gender').html(obj.gender);
                }
                $.each(obj.userQA, function(i, dataVal) {

                    if (i != 0 && dataVal.question != undefined && dataVal.answer != undefined) {
                        $('.qa').append('<p>' + dataVal.question + '<span class="green-text">' + dataVal.answer + '</span></p>');
                    }

                });

                $(".add-friends-container").show();
                $(".loading_agenda_items").hide();
            }
        });
    });
}

//function to download vCard
function downloadVcard(url) {
    var download_url = server_url + url;
    alert(download_url)
    navigator.app.loadUrl(download_url, { openExternal:true });
    //window.open(download_url, '_system');
    //alert(download_url)
    /*var fileTransfer = new FileTransfer();
    var store = cordova.file.dataDirectory;
    fileTransfer.download(
        download_url,
        store + "theFile.vcf",
        function(theFile) {
            alert("File Downloaded Successfully on your device, check it here : " + theFile.toURI());
            //showLink(theFile.toURI());
        },
        function(error) {
            alert("download error source " + error.source);
            alert("download error target " + error.target);
            alert("upload error code: " + error.code);
        }
    ); */
}

function showLink(url) {
    //alert(url);
    /*var divEl = document.getElementById("ready");
    var aElem = document.createElement("a");
    aElem.setAttribute("target", "_blank");
    aElem.setAttribute("href", url);
    aElem.appendChild(document.createTextNode("Ready! Click To Open."))
    divEl.appendChild(aElem); */
    //jQuery('#ready').html('<a target="_blank" href='+url+' />Ready! Click To Open.</a>');

}


// function to cancel friend request
function cancelRequest(player_code) {
    jQuery(document).ready(function($) {
        $(".add-friends-container").hide();
        $(".loading_cancel").show();
        var main_url = server_url + 'user-add-friend/-/OCintranet-' + static_event_id + '/cancel/' + player_code + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommoncontacts(obj);
                $('.form-container').prepend('<div class="alert alert-success">Contact request canceled</div>');
                $(".add-friends-container").show();
                $(".loading_cancel").hide();
                $(".alert-success").fadeOut(5000);
            }

        });
    });
}


// function to approve friend request
function approveRequest(player_code) {
    jQuery(document).ready(function($) {
        $(".add-friends-container").hide();
        $(".loading_approve").show();
        var main_url = server_url + 'user-add-friend/-/OCintranet-' + static_event_id + '/approve/' + player_code + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommoncontacts(obj);
                $('.form-container').prepend('<div class="alert alert-success">Contact Request Approved</div>');
                $(".add-friends-container").show();
                $(".loading_approve").hide();
                $(".alert-success").fadeOut(5000);
            }

        });
    });
}


// function to send friend request
function sendRequest(player_code) {
    jQuery(document).ready(function($) {
        $(".add-friends-container").hide();
        $(".loading_send").show();
        var main_url = server_url + 'user-add-friend/-/OCintranet-' + static_event_id + '/add/' + player_code + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommoncontacts(obj);
                $('.form-container').prepend('<div class="alert alert-success">Contact Request Sent</div>');
                $(".add-friends-container").show();
                $(".loading_send").hide();
                $(".alert-success").fadeOut(5000);
            }

        });
    });
}

function showcommoncontacts(obj,checkhide) {
    var icon_class = '';
    var link = '';
    var team = '';
    var divider = '';
    var first_letter = '';
    if(checkhide != 'yes')
    {
       $(".all_conts").html('&nbsp');
    }
    
    var ficon_class = '';
    var flink = '';
    var fteam = '';
    var fdivider = '';
    var ffirst_letter = '';
    //alert(obj.receivedFriendsRequests.length)
    if (obj.receivedFriendsRequests.length > 0) {
        $('.contacts_request').show();
        $('.friends-requests-container').show();
    }
    $.each(obj.receivedFriendsRequests, function(key, val) {
        if (checkdefined(val.event_user_id) == 'yes') {

            ficon_class = '';
            flink = '';
            fteam = '';
            fdivider = '';
            // alert(val.fName[0].toUpperCase());
            if (ffirst_letter != val.fName[0].toUpperCase()) {
                fdivider = '<div class="friends-item-title"> ' + val.fName[0].toUpperCase() + ' </div>';
            }

            ffirst_letter = val.fName[0].toUpperCase();


            if (checkdefined(val.team) == 'yes') {
                fteam = '&lt;' + val.team + '&gt;';
            }
            ficon_class = 'pending';
            flink = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + val.fullName + '</h2><h6>' + fteam + '</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Incoming contact request</h4><div class="confirm-btn-wrapper"><a href="#" onclick=cancelRequest("' + val.player_code + '") class="danger cancel-friend-request">Decline</a><a href="#" onclick=approveRequest("' + val.player_code + '") class="success send-friend-request">Approve</a></div></div>';


            $('.friends-requests-container').append(fdivider + '<div class="friends-item-wrapper ' + ficon_class + '">  ' + flink + '  </div>');
            //alert(fdivider+'<div class="friends-item-wrapper '+ficon_class+'">  '+flink+'  </div>')  

        }
    });


    $.each(obj.eventUserFriends, function(key, val) {
        icon_class = '';
        link = '';
        team = '';
        divider = '';
        //alert(val.fName)
        if (first_letter != val.fName[0].toUpperCase()) {
            //alert(first_letter)
            //alert(val.fName[0].toUpperCase())
            divider = '<div class="friends-item-title"> ' + val.fName[0].toUpperCase() + ' </div>';
        }

        first_letter = val.fName[0].toUpperCase();
        //alert(first_letter)
        if(checkhide != 'yes')
        {
        if (key == 0 && val.fName[0] != 'A') {
            divider = '<div class="friends-item-title"> </div>';
        }
        }

        if (checkdefined(val.team) == 'yes') {
            team = '&lt;' + val.team + '&gt;';
        }

        if (val.is_friend == 1 && val.status == 1) {
            icon_class = 'pending';
            link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + val.fullName + '</h2><h6>' + team + '</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Keep waiting for response?</h4><div class="confirm-btn-wrapper"><a href="#" onclick=cancelRequest("' + val.player_code + '") class="danger cancel-friend-request">No</a></div></div>';
        }
        if (val.is_friend == 1 && val.status == 2) {
            link = '<div class="friends-item"><a onclick="viewfriend(' + val.event_user_id + ')" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + val.fullName + '</h2><h6>' + team + '</h6><span><i class="fa fa-angle-right"></i></span></a></div>';
        }
        if (val.is_friend == 0 && obj.enableFriendsRequests == true) {
            link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + val.fullName + '</h2><h6>' + team + '</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Send contact request?</h4><div class="confirm-btn-wrapper"><a href="" class="danger cancel">No</a><a href="#" onclick=sendRequest("' + val.player_code + '") class="success send-friend-request">Yes</a></div></div>';
        }

        if (val.is_friend == 0 && obj.enableFriendsRequests != true) {
            link = '<div class="friends-item"><a href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + val.fullName + '</h2><h6>' + team + '</h6><span><i class="gicon-friends"></i></span></a></div> ';
        }

        $('.all_conts').append(divider + '<div class="friends-item-wrapper ' + icon_class + '">  ' + link + '  </div>');
        $(".loading_agenda_items").hide();
        $(".add-friends-container").show();
        // alert(divider+'<div class="friends-item-wrapper '+icon_class+'">  '+link+'  </div>')
    });

}

//function to load contacts
function loadcontacts() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('user-add-friend/-/OCintranet-' + static_event_id + '/', 'friends');
        $(".add-friends-container").hide();
        //showAgendaData();

        var main_url = server_url + 'user-add-friend/-/OCintranet-' + static_event_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommoncontacts(obj);
            }

        });
    });
}

//function to load your friends
function loadyourcontacts() {
    jQuery(document).ready(function($) {
        loadcommonthings();
        importfooter('user-add-friend/-/OCintranet-' + static_event_id + '/friends', 'friends');
        $(".add-friends-container").hide();
        //showAgendaData();

        var main_url = server_url + 'user-add-friend/-/OCintranet-' + static_event_id + '/friends?gvm_json=1';
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
                $.each(obj.eventUserFriends, function(key, val) {
                    icon_class = '';
                    link = '';
                    team = '';
                    divider = '';

                    if (first_letter != val.fName[0].toUpperCase()) {
                        //alert(first_letter)
                        //alert(val.fName[0].toUpperCase())
                        divider = '<div class="friends-item-title"> ' + val.fName[0].toUpperCase() + ' </div>';
                    }

                    first_letter = val.fName[0].toUpperCase();

                    if (key == 0 && val.fName[0] != 'A') {
                        divider = '<div class="friends-item-title"> </div>';
                    }


                    if (checkdefined(val.team) == 'yes') {
                        team = '&lt;' + val.team + '&gt;';
                    }

                    if (val.is_friend == 1 && val.status == 1) {
                        icon_class = 'pending';
                        link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + val.fullName + '</h2><h6>' + team + '</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Keep waiting for response?</h4><div class="confirm-btn-wrapper"><a href="#" onclick=cancelRequest("' + val.player_code + '") class="danger cancel-friend-request">No</a></div></div>';
                    }
                    if (val.is_friend == 1 && val.status == 2) {
                        link = '<div class="friends-item"><a onclick="viewfriend(' + val.event_user_id + ')" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + val.fullName + '</h2><h6>' + team + '</h6><span><i class="fa fa-angle-right"></i></span></a></div>';
                    }
                    if (val.is_friend == 0) {
                        link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + val.fullName + '</h2><h6>' + team + '</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Send contact request?</h4><div class="confirm-btn-wrapper"><a href="" class="danger cancel">No</a><a href="#" onclick=sendRequest("' + val.player_code + '") class="success send-friend-request">Yes</a></div></div>';
                    }

                    $('.friends-items-container').append(divider + '<div class="friends-item-wrapper ' + icon_class + '">  ' + link + '  </div>');
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

    importfooter('user-profile', 'profile');
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

            $(".fa-trophy").html("<span> # </span>" + results.rows.item(0).position);
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
            if (results.rows.item(0).team != undefined && results.rows.item(0).team != '' && results.rows.item(0).team != null && results.rows.item(0).team != 'null') {
                $(".log-info p").append("<br><strong>&lt; " + results.rows.item(0).team + " &gt; </strong><br />");
            }
            //$(".log-info p").append("</p>");
            $(".firstname a").html(results.rows.item(0).first_name);
            if (results.rows.item(0).team != undefined && results.rows.item(0).team != '' && results.rows.item(0).team != null && results.rows.item(0).team != 'null') {
                $(".team-name").html("&lt; " + results.rows.item(0).team + " &gt;");
            }

            $(".lastname a").html(results.rows.item(0).last_name);
            $(".fa-trophy").html("<span> # </span>" + results.rows.item(0).position);
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

function importhomepage() {



    var main_url = server_url + 'api/index.php/main/homepageSettings?XDEBUG_SESSION_START=PHPSTORM&event_id=' + static_event_id;
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

                    downloadLogoFile(obj.data.url, obj.data.type, obj.data.main_logo_image.small_url);

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
function downloadLogoFile(url, type, img_src) {
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
function importfooter(page, active) {
    //alert(page);
    //alert(active);
    var main_url = server_url + page + '/?gvm_json=1&event_id=' + static_event_id;
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
            if (data._footerMenuData != undefined && data._footerMenuData != 'undefined') {
                var getdata = data._footerMenuData;
            } else {
                var getdata = data.data._footerMenuData;
            }
            jQuery.each(getdata.mainButtons, function(key, val) {
                //alert(val.name);
                db.transaction(function(tx) {
                    var friend_count = 0;
                    if (val.friends_requests_count != '' && val.friends_requests_count != undefined && val.friends_requests_count != null && val.friends_requests_count != 'null' && val.friends_requests_count != 'undefined') {
                        friend_count = val.friends_requests_count;
                    }
                    tx.executeSql("insert into OCEVENTS_footerlinks (name,icon,friends_requests_count,menu_text) values ('" + val.name + "','" + val.icon_class + "','" + friend_count + "','" + val.text + "')");
                    //alert("insert into OCEVENTS_footerlinks (name,icon,friends_requests_count,menu_text) values ('"+val.name+"','"+val.icon_class+"','"+friend_count+"','"+val.text+"')");
                });
            });
            jQuery.each(getdata.moreButtons, function(key, val) {

                db.transaction(function(tx) {
                    var mfriend_count = 0;
                    if (val.friends_requests_count != '' && val.friends_requests_count != undefined && val.friends_requests_count != null && val.friends_requests_count != 'null' && val.friends_requests_count != 'undefined') {
                        mfriend_count = val.friends_requests_count;
                    }
                    tx.executeSql("insert into OCEVENTS_footermorelinks (name,icon,friends_requests_count,menu_text) values ('" + val.name + "','" + val.icon_class + "','" + mfriend_count + "','" + val.text + "')");
                });
            });
            showfooter(active);
        }
    });
}

//function to show footer links
function showfooter(active) {
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_footerlinks", [], function(tx, results) {
            var len = results.rows.length;
            //alert(len)
            if (len > 0) {
                jQuery('.footer-menu').html('');
                var link = '';
                var name = '';
                var menu_text = '';
                var icon = '';
                var active_class = '';
                for (i = 0; i < len; i++) {
                    name = results.rows.item(i).name;
                    if (results.rows.item(i).icon == 'gicon-sponsors') {
                        name = 'sponsors';
                    }

                    if (name == active) {
                        active_class = 'active';
                    } else {
                        active_class = '';
                    }
                    if (name == 'home') {
                        link = 'gamification.html';
                    } else if (name == 'agenda') {
                        link = 'agenda.html';
                    } else if (name == 'friends') {
                        link = 'contacts.html';
                    } else if (name == 'points') {
                        link = 'points.html';
                    } else if (name == 'sponsors') {
                        link = 'sponsors.html';
                    } else if (name == 'notes') {
                        link = 'notes.html';
                    }

                    var friends_requests_count = results.rows.item(i).friends_requests_count;
                    if (friends_requests_count > 0) {
                        var count_label = '<span class="count-label">' + friends_requests_count + '</span>';
                    } else {
                        var count_label = '';
                    }
                    menu_text = results.rows.item(i).menu_text;

                    icon = results.rows.item(i).icon;
                    jQuery('.footer-menu').append("<div class='label-container " + active_class + "'><a href=" + link + "><label>" + count_label + "<i class=" + icon + "></i><p>" + menu_text + "</p></label></a></div>");
                }
            }
        });
        tx.executeSql("SELECT * FROM OCEVENTS_footermorelinks", [], function(tx, results) {
            var len = results.rows.length;
            //alert(len)          
            if (len > 0) {
                jQuery('.footer-menu').append('<div class="more-btn label-container"><label><i class="gicon-more"></i><p>More</p></label></div> ');

                var more_wrapper = '<div class="more-wrapper"><div class="footer-menu-opened"><ul><li><label><a id="home" href="gamification.html"><i class="gicon-welcome"></i><span>Home</span></a></label></li></ul><ul class="divider"><li><i class="gicon-gamification"></i><span class="line"></span></li></ul><ul>';
                //jQuery('.footer-menu').html('');
                var link = '';
                var name = '';
                var menu_text = '';
                var icon = '';
                var active_class = '';
                var onclick = '';
                for (i = 0; i < len; i++) {
                    name = results.rows.item(i).name;
                    if (name == active) {
                        active_class = 'active';
                    } else {
                        active_class = '';
                    }
                    if (name == 'home') {
                        link = 'gamification.html';
                    } else if (name == 'agenda') {
                        link = 'agenda.html';
                    } else if (name == 'friends') {
                        link = 'contacts.html';
                    } else if (name == 'points') {
                        link = 'points.html';
                    }else if (name == 'notes') {
                        link = 'notes.html';
                    }else
                    {
                      link = '#';
                    }
                    onclick = '';
                    if(name == 'comments')
                    {
                      onclick = 'onclick=add_comments()';
                    }
                    if(name == 'q_and_a')
                    {
                      onclick = 'onclick=add_questions()';
                    }
                    if(name == 'quiz')
                    {
                      onclick = 'onclick=add_quiz()';
                    }
                    if(name == 'voting')
                    {
                      onclick = 'onclick=voting()';
                    }
                    if(name == 'seeker')
                    {
                      onclick = 'onclick=gotoseeker()';
                    }
                    //alert(onclick);
                    menu_text = results.rows.item(i).menu_text;
                    icon = results.rows.item(i).icon;
                    more_wrapper += '<li><label><a href="' + link + '" '+onclick+'><i class=' + icon + '></i><span>' + menu_text + '</span></a></label></li>';
                }


                more_wrapper += '</ul></div></div>';
                //more_wrapper += '';
                 //alert(more_wrapper);

                jQuery('.footer-menu').prepend(more_wrapper);
                jQuery('.more-btn').on('click', function() {
                    jQuery('.footer-menu').toggleClass('footer-menu-open');
                });
            }
        });
    });
}

//function to redirect to seeker
function gotoseeker()
{
  window.location.href="seeker.html"
}

//function to load notes
function loadnotes()
{
    //alert(ur)
    jQuery(document).ready(function($) {
        loadcommonthings();        
        $(".notes-container").hide();
        $(".loading_agenda_items").show(); 
        importfooter('Add-note/-/OCintranet-' + static_event_id, 'agenda'); 
        var main_url = server_url + 'Add-note/-/OCintranet-' + static_event_id +'/?gvm_json=1';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               $('.header-title h1').html(obj.pageTitle);
               $('.questions-heading-title').hide();
               if(checkdefined(obj.countNoteInstances) == 'yes')
               {
                  $('.questions-heading-title').show();
                  $('.votes-count .green-text').html(obj.countNoteInstances);
                  $('#allnotes').html('');
                  $.each(obj.noteInstances, function(key, val) {
                  
                  var remstr = '';
                  if(obj.currentEventUserId == val.eventuser_id)
                  {
                     remstr = ' <div class="clearfix"><a class="pull-right delete-note" href="javascript:removenote('+val.instance_id+')" data-url="/Add-note/-/OCintranet-100041/delete/28"><i class="fa fa-times"></i>Remove</a></div>'; 
                  }
                      var str = '<div id="note_'+val.instance_id+'" class="questions-item-container row"><div class="clearfix"><div class="col-xs-12 question-item-info"><h3 class="clearfix">'+val.fName+' '+val.lName+'<span><i class="fa fa-clock-o"></i>'+val.time_since+'</span></h3><div class="question-inner"><div><i class="gicon-notes"></i></div><p>'+val.notes+'</p></div></div></div>'+remstr+'</div>';
                   $('#allnotes').append(str);   
                  });
                  
               } 
               localStorage.resubmit_code = obj.form.noResubmitCode;               
               $(".notes-container").show();
               $(".loading_agenda_items").hide();
            }
       });     
    });    
}

//function to add note
function addnote()
{
    var submit_form = 1;
    var form_noresubmit_code = localStorage.resubmit_code;
   //alert(form_noresubmit_code)
    var code = jQuery('#frmfld_note').val();
    if(checkdefined(code) != 'yes')
    {
        alert('Please enter note!');
        $('#frmfld_note').focus();
    }
    else
    {
       
      var main_url = server_url + 'Add-note/-/OCintranet-'+static_event_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
        jQuery.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
                submit_form: submit_form,
                form_noresubmit_code:form_noresubmit_code,
                note:code
            },
            success: function(resp) {
               window.location.href = 'notes.html';
            }
       });
    }        
}

//function to remove note
function removenote(id)
{
   if(confirm("Delete confirmation"))
  {
    var main_url = server_url + 'Add-note/-/OCintranet-' + static_event_id +'/delete/'+id+'/?gvm_json=1';
          $.ajax({
              url: main_url,
              dataType: "json",
              method: "GET",
              success: function(obj) {
                window.location.href = 'notes.html';
             }
        });
   }         
}

function showseekerresults(ur)
{
    //alert(ur)
    jQuery(document).ready(function($) {
        loadcommonthings();        
        $(".seeker-game-container").hide();
        $(".loading_agenda_items").show(); 
        importfooter('seeker/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id+'/'+ur, 'agenda'); 
        var main_url = server_url + 'seeker/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/' + ur + '/?gvm_json=1';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                $.each(obj.breadcrumbs, function(key, val) {
                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
                $('.congratsText').html(obj.congratsText);
                $('.table tbody').html('');
                $.each(obj.items, function(key, val) {
                var cssofclass = '';
                var tdcssofclass = '';
                if(val.is_current_user == 'true' || val.is_current_user == true)
                {
                   cssofclass = 'class="current-user"';
                   tdcssofclass = 'class="player-name"';
                } 
                
                if(val.correct_answers == '-')
                {
                    var str = '-';
                }
                else
                {
                    var str = val.correct_answers+'/'+obj.floormapsCount;
                }
                               
                    $('.table tbody').append('<tr '+cssofclass+'><td '+tdcssofclass+'><div class="player-name-wrapper"><span class="player-position">'+val.position+'.</span>'+val.name+'</div></td><td class="correct-answers">'+str+'</td><td class="seeker-hints-col"><span class="hints-count-label label label-danger">'+val.hints+'</span></td><td class="points">'+val.no_1_count+'</td><td class="points">'+val.no_2_count+'</td><td class="points">'+val.no_3_count+'</td><td>'+val.points+'</td></tr>');    
                });
                if(checkdefined(ur) == 'yes')
                {
                    $('.seeall').html('Top Scores');
                    $('.seeall').attr('href','javascript:showseekerresults();');
                }
                else
                {
                   $('.seeall').html('See All');
                   $('.seeall').attr('href','javascript:showseekerresults("l-full");');
                }
                $(".seeker-game-container").show();
                $(".loading_agenda_items").hide();  
           }
        });               
    });    
                    //4,981
}

//function to reset seeker game
function reset_seeker()
{                         
    var main_url = server_url + 'seeker/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/reset_seeker?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
              window.location.href = 'seeker.html';
            }
        });
}        

function showseeker()
{
    jQuery(document).ready(function($) {
        loadcommonthings();
        
        $(".seeker-game-container").hide(); 
          importfooter('seeker/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id, 'agenda');
        
        
        var main_url = server_url + 'seeker/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
              $('.show-hint').click(function()
              {
                var seeker_id = obj.currentFloormapInstance.seeker_session_a_i_id.value;
                var get_seeker_hint = 'get_seeker_hint';
                var main_url = server_url + 'modules/gamification/ajax/frontend_ws.php';
                //alert(main_url)
                $.ajax({
                  url: main_url,
                  dataType: "json",
                  method: "POST",
                  data: {
                    action: get_seeker_hint,
                    seekerId: seeker_id
                  },                 
                  success:function(datas) {
                      $('.seeker-hint').html(datas.hint);
                      $('.seeker-hint').show();
                  },
                  error: function(xhr, textStatus, errorThrown){
                         alert('Request Failed');                  
                  } 
                 
              });
              });              
               
               $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });  
                
                
                if(checkdefined(obj.congratsText) == 'yes')
                {
                   window.location.href = 'seeker_results.html';
                }              
                   
                  $('.oneof').html(obj.currentPosition);
                  $('.totalof').html(obj.floormapsCount);
                  $('.bordered').html(''); 
                  for(j = 1; j<=obj.floormapsCount; j++)
                  {
                     if(j == obj.userPositionForFloormap)
                     {
                         var classofcss = 'class="active"';
                     }
                     else
                     {
                         var classofcss = '';
                     }
                     $('.bordered').append('<li '+classofcss+'>'+j+'</li>'); 
                  }  
                  localStorage.correct_answer = obj.currentFloormapInstance.code.value;  
                  $('.seeker-description').html('');
                  if(checkdefined(obj.currentFloormapInstance.floormap_image.value) == 'yes')
                  {                                               
                     $('.seeker-description').append('<img src='+server_url+'resources/files/images/'+obj.currentFloormapInstance.floormap_image.__extra.large_file_name+' />'); 
                  }           
                  $('.seeker-description').append(obj.currentFloormapInstance.description.value+'<div class="seeker-hint"></div>');
                  $('.seeker-hint').html(obj.currentFloormapInstance.hint.value);
                  $(".seeker-game-container").show();
                  $(".loading_agenda_items").hide();
                  localStorage.resubmit_code = obj.form.noResubmitCode;
              }
           });        
        });
}

//function to submit answer for seeker
function submitseekeranswer()
{
    var submit_form = 1;
    var form_noresubmit_code = localStorage.resubmit_code;
   //alert(form_noresubmit_code)
    var code = jQuery('#frmfld_code').val();
    if(checkdefined(code) != 'yes')
    {
        alert('Please submit your answer!');
        $('#frmfld_code').focus();
    }
    else
    {
      //jQuery(".submit_com").hide();
      //jQuery(".loading_send").show(); 
      var main_url = server_url + 'seeker/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
        jQuery.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
                submit_form: submit_form,
                form_noresubmit_code:form_noresubmit_code,
                code:code
            },
            success: function(resp) {
                localStorage.resubmit_code = '';
                $('.seeker-description img').remove();
                $('.seeker-map-wrapper').show();
                if(localStorage.correct_answer == code)
                {
                  localStorage.correct_answer = '';
         $('.seeker-map-wrapper').html('<div class="seeker-bg-overlay"></div><a href="seeker.html" class="msg-wrapper"><div class="right-msg-container"><i class="fa fa-check"></i><h4><p>You got the <strong>correct</strong> code!</p></h4><p>New task starts in <span id="countdown" class="hasCountdown">05</span> seconds...</p></div></a>');
         
                    var c = 5;
                    setInterval(function(){
                		c--;
                		if(c>=0){
                			$('#countdown').text(c);
                		}
                    if(c==0){
                       window.location.href="seeker.html"
                    }
                	},1000);
                }
                else
                {
                 localStorage.correct_answer = '';
         $('.seeker-map-wrapper').html('<div class="seeker-bg-overlay"></div><a class="msg-wrapper" href="seeker.html"><div class="wrong-msg-container"><i class="fa fa-ban"></i><h5><p>The entered code is <strong>incorrect</strong>. <br>Try again!</p></h5><p>New task starts in <span id="countdown" class="hasCountdown">5</span> seconds...</p></div></a>');
         
              var c = 5;
              setInterval(function(){
          		c--;
          		if(c>=0){
          			$('#countdown').text(c);
          		}
                  if(c==0){
                      window.location.href="seeker.html"
                  }
          	},1000);
                }
                
                //
            }
        });
    }  
}

//function to redirect to voting
function voting()
{
    window.location.href="voting.html"
}



//function to show voting
function showvoting()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        $(".voting-page-container").hide();
        
        //alert('hi')
        importfooter('Add-vote/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = server_url + 'Add-vote/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               
               $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
                //$.each( obj.votesCount, function( k, v ) {
                   
                         $('.votes-count .green-text').html(obj.totalCount);
                    
                  
                   //});
                   $('.voting-content-item').html('<ul>');
                   var is_answer = 0;
                   $.each(obj.voteItems, function( key, val ) {
                    if(checkdefined(val.is_active) == 'yes')
                    {
                       is_answer = 1;
                    }
                   });
                   
                    $.each( obj.voteItems, function( key, val ) {
                    var classcss='';
                    var classcssli='';
                    
                    if(checkdefined(val.is_active) == 'yes')
                    {
                       classcss = 'style="background-color:#2c3139"';
                    }
                    if(is_answer == 1 && checkdefined(val.is_active) != 'yes')
                    {
                        classcssli = 'style="opacity:0.3"';                        
                    }
                                                            
                    
                      $('.voting-content-item ul').append('<li '+classcssli+'><a '+classcss+' href="#"><h4 class="vote-item-title">'+val.title.value+'</h4><p class="vote-item-subtitle"></p><div class="voting-item-count"><i class="icon-voting"></i>'+val.votes_count+' votes</div></a><div class="voting-confirm-wrapper"><h4>Give your vote!</h4><div class="confirm-btn-wrapper"><a href="" class="cancel">Cancel</a><a href="#" onclick="givevote('+val.instance_id.value+');" class="voting-toggle-btn">Yes</a></div></div></li>');
                          //alert('<li '+classcssli+'><a href="#"><h4 class="vote-item-title">'+val.title.value+'</h4><p class="vote-item-subtitle"></p><div class="voting-item-count"><i class="icon-voting"></i>'+val.votes_count+' votes</div></a><div class="voting-confirm-wrapper"><h4>Give your vote!</h4><div class="confirm-btn-wrapper"><a href="" class="cancel">Cancel</a><a href="#" onclick="givevote('+val.instance_id.value+');" class="voting-toggle-btn">Yes</a></div></div></li>')
                      });
                     
                     $('.voting-content-item').append('</ul>'); 
                     if(is_answer != 1)
                    {
                                         
                     $('.voting-content-item > ul > li > a, .voting-content-item > ul > li a.cancel , .voting-content-item > ul > li a.voting-toggle-btn').on('click', function (e)
                      {
                          e.preventDefault();
                          var btn = $(this);
                          var votingContentWrapper = $('.voting-content-wrapper');
                          var isInactiveWrapper = votingContentWrapper.hasClass('inactive');
                          var isClosedWrapper = votingContentWrapper.hasClass('closed');
                          var isDisabledItem = btn.closest('li').hasClass('disabled');
                              
                      		if (isInactiveWrapper || isClosedWrapper || isDisabledItem) {
                      			return false;
                      		}
                              
                      		btn.closest('li:not(.active)').toggleClass('opened');
                  	});
                    $('.voting-content-item > ul > li .voting-toggle-btn').on('click', function (e)
                    {
                		e.preventDefault();
                        
                        var btn = $(this);
                		btn.closest('li').toggleClass('active');
                        
                        setTimeout(function () 
                        {
                            window.location = btn.attr('href');
                        }, 500);
                	});
                  }                  
                $('#vote-items-filter').on('keyup', function () 
                {
                    var val = $(this).val().toLowerCase();
                    
                    $('.voting-content-item li').each(function () 
                    {
                        var el = $(this);
                        
                        var inTitle = el.find('.vote-item-title').text().toLowerCase().indexOf(val) != -1;
                        var inSubtitle = el.find('.vote-item-subtitle').text().toLowerCase().indexOf(val) != -1;
                        
                        if (inTitle || inSubtitle) {
                            el.removeClass('hidden');
                        } else {
                            el.addClass('hidden');
                        }
                    });
                });
         
                $(".voting-page-container").show();
                $(".loading_agenda_items").hide();
                $('.voting-countdown').countdown({
                  
            until: +obj.closesInTime, 
            onExpiry: refreshPresentationPage, 
            format: 'HMS', 
            compact: true
        });
             }
          });
          });      
}



//function to give vote
function givevote(instance_id)
{
    var main_url = server_url + 'Add-vote/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/'+instance_id+'/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
              window.location.href='voting.html';
            }
            });
}

//function to redirect to quiz
function add_quiz()
{
    window.location.href="add_quiz.html"
}
//function to show quiz
function showquiz()
{
     jQuery(document).ready(function($) {
        loadcommonthings();
        $(".quiz-container").hide();
        
        //alert('hi')
        importfooter('Quiz/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = server_url + 'Quiz/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               
               $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
                if(checkdefined(obj.results) == 'yes')
                {
                    $('.questionsdiv').hide();
                    $('.quiz-header-title').after('<div class="quiz-results-wrapper"><div class="quiz-results"><h3 class="green-text">Results</h3><p>'+obj.results+'</p><span class="score green-text">'+obj.quizPoints+'</span></div><div class="quiz-btn-wrapper"><a class="btn btn-primary" href="javascript:resetquiz();">Try again</a><a class="btn btn-primary scoreboard"  href="javascript:gotoscorecard();">Scoreboard</a></div></div>');
                }
                else
                { 
                $('.questionsdiv').show();
                $('.quiz-number').html(obj.questionNumber+' / '+obj.numQuestions);
                $('.quiz-question').html(obj.question.question);
                //alert(obj.question.answers);
                var arr = obj.question.answers.split('\r\n');
                $('.quiz-answer-container').html('');
                for(i=0; i < arr.length; i++)
                {
                    var label_class='';
                    var value = i + 1;
                    var dis = '';
                    
                    if(checkdefined(obj.correctAnswerPositions) == 'yes')
                    {
                       label_class = 'disabled';
                       dis = 'disabled';
                       var sp = obj.correctAnswerPositions.length;
                       //alert(sp)
                       if(sp == 1)
                       {                       
                         if(obj.correctAnswerPositions == value)
                         {
                            label_class = 'correct-answer disabled';
                         } 
                       }
                       if(sp > 1)
                       {
                          for(j = 0; j < sp; j++){
                            if(value == obj.correctAnswerPositions[j])
                            {
                               label_class = 'correct-answer disabled';
                               //alert(obj.correctAnswerPositions[j])
                            }
                            //document.write("<br /> Element " + i + " = " + obj.correctAnswerPositions[i]); 
                          }
                       }  
                    }
                   
                    
                    if(obj.questionMultipleAnswers == 'true' || obj.questionMultipleAnswers == true)
                    {
                        var radio_button = '<label class="'+label_class+'"><div class="poeng-options"><input type="checkbox" class="ipt_quiz_a"  name="answer_position" id="ipt_quiz_a_1" value="'+value+'"><span class="check"></span><div class="text">'+arr[i]+'</div></div></label>';
                        $('.quiz-btn-wrapper').html('<button class="btn btn-primary" type="button" onclick="submitmultipleanswers('+obj.question.instance_id+')" name="next_question" value="1">Submit</button>');  
                    }
                    else
                    {
                        var radio_button = '<label class="'+label_class+'"><div class="poeng-options"><input '+dis+' type="radio" class="ipt_quiz_a" onclick="submitanswer('+obj.question.instance_id+','+value+')" name="answer_position" id="ipt_quiz_a_1" value="'+value+'"><span class="check"></span><div class="text">'+arr[i]+'</div></div></label>';
                    }
                    if(checkdefined(obj.correctAnswerPositions) == 'yes' && obj.questionNumber != obj.numQuestions)
                {
                   $('.quiz-btn-wrapper').html('<button class="btn btn-primary" type="button" onclick="gotonextquestion('+obj.question.instance_id+')" name="next_question" value="1">Next question</button>'); 
                }
                   if(checkdefined(obj.correctAnswerPositions) == 'yes' && obj.questionNumber == obj.numQuestions)
                {
                   $('.quiz-btn-wrapper').html('<button class="btn btn-primary" type="button" onclick="gotonextquestion('+obj.question.instance_id+')" name="next_question" value="1">Results Page</button>'); 
                }  
                    
                     //alert(radio_button)
                    $('.quiz-answer-container').append(radio_button);
                    //alert(arr[i]);
                }
                var timer = Number(obj.question.question_time+'000');
                quizInit(timer);
                
                $.each( obj.questionData, function( key, val ) {
                  if(checkdefined(val.__extra) == 'yes')
                  {
                    if(checkdefined(val.__extra.large_file_name) == 'yes')
                    {
                      $('.quiz-question-container').prepend('<img src="'+server_url+'resources/files/images/'+val.__extra.large_file_name+'" class="img-responsive" />')
                    }
                  }
                
                });
                }
               $(".quiz-container").show(); 
               $(".loading_agenda_items").hide();  
            }
           });
      });      
}

//function to go to score card
function gotoscorecard()
{
  window.location.href = 'scorecard.html'
}

//function to load score card
function loadscorecard()
{
    jQuery(document).ready(function($) {
        loadcommonthings();
        $(".leaderboards-container").hide();
        
        //alert('hi')
        importfooter('Quiz/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id+'/scorecard', 'agenda');
                                    
        var main_url = server_url + 'Quiz/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/scoreboard/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs #b1").html(val.text);
                    }
                    if (key == 1) {
                        $(".breadcrumbs #b2").html(val.text);
                    }
                    if (key == 2) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
                $(".team-points-table table tbody").html('');
                
                $.each(obj.items, function(key, val) {
                
                      var cur_userclass = '';
                     if(val.is_current_user == 'true' || val.is_current_user == true)
                     {
                        cur_userclass = 'current-user';
                     }
                     var avatar = '';
                     if(val.image != 'false' && val.image != false)
                     {
                        avatar = '<div class="img img-circle" style="background-image:url('+val.image+');"></div>';
                     }
                   $(".team-points-table table tbody").append('<tr class='+cur_userclass+'><td class="num-col"><span class="num">'+val.position+'</span></td><td class="avatar-col"><span class="avatar">'+avatar+'</span></td><td><span class="name">'+val.name+'</span></td><td class="point">'+val.points+'</td></tr>');
                   
                });
               
                
                     
               /* var difference = Number(10) - Number(k);
                for (v = 0; v < difference; v++) {
                    k++;
                    $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">' + k + '</span></td><td class="avatar-col"></td><td><span class="name">-</span></td><td class="point">0</td></tr>');
                } */
                $(".leaderboards-container").show(); 
                $(".loading_agenda_items").hide();
            }
            });
            });
}



//function to reset the quiz
function resetquiz()
{
    var main_url = server_url + 'Quiz/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/reset_quiz/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
              window.location.href='add_quiz.html';
            }
            });
}

//function to submit multiple answers
function submitmultipleanswers(question_id)
{
    //alert(question_id)
    var arr = [];
    jQuery('input:checkbox:checked').each(function() {        
         //checkboxes += 'answer_position[]:'+jQuery(this).val();
          arr.push(jQuery(this).val());
          
    });
   // alert(checkboxes);
    
    var countdown_box = Number(jQuery('#countdown_box').html()+'000');
    var main_url = server_url + 'Quiz/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        jQuery.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
              submit_answer: 1,
              question_id:question_id, 
              answer_position: arr,            
              countdown:countdown_box,
              //checkboxes
          },
            success: function(obj) {
              window.location.href='add_quiz.html';
            }
            });
}

//function to submit answer
function submitanswer(question_id,answer)
{
  var countdown_box = Number($('#countdown_box').html()+'000');
  var main_url = server_url + 'Quiz/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
              submit_answer: 1,
              question_id:question_id,
              answer_position:answer,
              countdown:countdown_box
          },
            success: function(obj) {
              window.location.href='add_quiz.html';
            }
            });
}

//function to go to next question
function gotonextquestion(question_id)
{
    var main_url = server_url + 'Quiz/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
              question_id:question_id,
              next_question:'1'
              
          },
            success: function(obj) {
              window.location.href='add_quiz.html';
            }
            });
}

//function to redirect to questions
function add_questions()
{
    window.location.href="add_questions.html"
}

//function to show comments
function showquestions()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        $(".questions-container").hide();
        
        //alert('hi')
        importfooter('Add-question/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = server_url + 'Add-question/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
              $('.votes-count .green-text').html(obj.countQuestionInstances);
              $('.votes-count .small-text').html(obj.countAnswerInstances.answers+' add question answers');
              
              
                 localStorage.resubmit_code = obj.qForm.noResubmitCode;
              
              
              $.each(obj.questionInstances, function(key, val) {
              var image_url = server_url+'resources/gamification/img/avatar-placeholder.png';
              if(checkdefined(val.image) == "yes")
              {
                  image_url = server_url+'resources/files/event/images/thumb_'+val.image+'.jpg';
              }
              var name = 'anonymous';
              if(checkdefined(val.fName) == "yes")
              {
                  name = val.fName;
              }
              if(checkdefined(val.lName) == "yes")
              {
                  name += ' '+val.lName;
              }
              var like_string = '';
              var dislike_link = '<a href="#" onclick=likedislikequestion('+val.instance_id+',0)>dislike</a>';
              if(val.like == 1)
              {
                like_string = '<a class="liked-btn show"><i class="fa fa-heart"></i>Liked</a>';
                dislike_link = 'Dislikes';  
              }
              else if(val.like == 0)
              {
                like_string = '<a class="liked-btn show">Disliked</a>';
                dislike_link = 'Dislikes';
              }
              else
              {
                like_string = '<a class="like-btn" href="#" onclick=likedislikequestion('+val.instance_id+',1)><i class="fa fa-heart"></i>like</a>';
              } 
              
              if(val.event_user_id == localStorage.user_id)
              {
                 like_string = ''; 
                 dislike_link = 'Dislikes';
               
              }
              var answer = '';
              if(checkdefined(val.answer) == 'yes')
              {
                  answer = '<div class="answer-inner"><div>A:</div><p>'+val.answer+'</p></div>';
              }
              
              $('.comment_loop').prepend('<div id="question_'+val.instance_id+'" class="questions-item-container row"><div class="clearfix"><div class="col-xs-2 questions-item-img"><div class="img-wrapper" style="background-image:url('+image_url+')"></div></div><div class="col-xs-10 question-item-info"><h3 class="clearfix">'+name+'<span><i class="fa fa-clock-o"></i>'+val.time_since+'</span></h3><div class="question-inner"><div>Q:</div><p>'+val.question+' </p></div></div></div>'+answer+'<div class="clearfix"><div class="likes-container">'+like_string+'<div class="likes-count"><i class="fa fa-heart"></i>'+val.likes+' Likes</div><div class="dislikes-count">- '+val.dislikes+' '+dislike_link+'</div></div></div></div>');
             
              
             
        });
              $(".loading_agenda_items").hide();  
              $(".questions-container").show();
        if(checkdefined(localStorage.message) == 'yes')
        {
            $('.comment_loop').before('<div class="alert alert-success">Deleted</div>');
            $('.alert-success').fadeOut(3000);
            localStorage.message = '';
        }
            }
       }); 
   });             
}


//function to submit a question
function submitquestion(instance_id)
{
    var submit_form = 1;
    var form_noresubmit_code = localStorage.resubmit_code;
    var question = jQuery('#frmfld_question').val();
    jQuery(".submit_com").hide();
    jQuery(".loading_send").show(); 
    var main_url = server_url + 'Add-question/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
      jQuery.ajax({
          url: main_url,
          dataType: "json",
          method: "POST",
          data: {
              submit_form: submit_form,
              form_noresubmit_code:form_noresubmit_code,
              question:question
          },
          success: function(resp) {
              localStorage.resubmit_code = '';
              window.location.href="add_questions.html"
          }
      });
}

//function to like and dislike question
function likedislikequestion(id,like)
{
  jQuery(document).ready(function($)
  {
    $(".loading_cancel").show();  
    $(".questions-container").hide();
  var main_url = server_url + 'Add-question/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id+'/?action=like&gvm_json=1&like='+like+'&c_id='+id;
       //  alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            window.location.href = 'add_questions.html';
            }
            });
   });
}

//function to redirect to comments
function add_comments()
{
    window.location.href="add_comments.html"
}

//function to show comments
function showcomments()
{
   jQuery(document).ready(function($) {
        loadcommonthings();
        $(".questions-container").hide();
        
        //alert('hi')
        importfooter('Add-comment/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = server_url + 'Add-comment/-/OCintranet-' + static_event_id + '/' + localStorage.agenda_id + '/sort/timestamp/asc/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
              $('.votes-count .green-text').html(obj.countCommentInstances);
              //$('.comment_loop').html('&nbsp;'); 
              var prop = 'reply_to_comment_id';
        var asc = true;
        var element = obj.commentInstances.sort(function (a, b) {
        if (asc) {
          return (parseInt(a[prop]) > parseInt(b[prop])) ? 1 : ((parseInt(a[prop]) < parseInt(b[prop])) ? -1 : 0);
        } else {
          return (parseInt(b[prop]) > parseInt(a[prop])) ? 1 : ((parseInt(b[prop]) < parseInt(a[prop])) ? -1 : 0);
        }
      });
              //alert(element.length)
              $.each( obj.replyForms, function( key, val ) {
                 localStorage.resubmit_code = val.noResubmitCode;
              });
              
              $.each(element, function(key, val) {
              var image_url = server_url+'resources/gamification/img/avatar-placeholder.png';
              if(checkdefined(val.image) == "yes")
              {
                  image_url = server_url+'resources/files/event/images/thumb_'+val.image+'.jpg';
              }
              var name = 'anonymous';
              if(checkdefined(val.fName) == "yes")
              {
                  name = val.fName;
              }
              if(checkdefined(val.lName) == "yes")
              {
                  name += ' '+val.lName;
              }
              var like_string = '';
              var dislike_link = '<a href="#" onclick=likedislikecomment('+val.instance_id+',0)>dislike</a>';
              if(val.like == 1)
              {
                like_string = '<a class="liked-btn show"><i class="fa fa-heart"></i>Liked</a>';
                dislike_link = 'Dislikes';  
              }
              else if(val.like == 0)
              {
                like_string = '<a class="liked-btn show">Disliked</a>';
                dislike_link = 'Dislikes';
              }
              else
              {
                like_string = '<a class="like-btn" href="#" onclick=likedislikecomment('+val.instance_id+',1)><i class="fa fa-heart"></i>like</a>';
              } 
              var delete_button = '';
              if(val.event_user_id == localStorage.user_id)
              {
                 like_string = ''; 
                 dislike_link = 'Dislikes';
                 delete_button = '<div onclick="deletecomment('+val.instance_id+')" class="pull-right delete-comment"><i class="fa fa-times"></i>Delete</div>';
              }
              var comment_image = '';
              if(checkdefined(val.images) == 'yes')
              {
                  // alert(val.images.small)
                   //alert(val.images[0].small)
                   comment_image = '<div class="images-container clearfix"><div class="col-xs-6 col-md-4 col-lg-2 image-container"><span data-mfp-src="'+server_url+'resources/files/images/'+val.images[0].large+'" class="mfp-image"><img alt="" src="'+server_url+'resources/files/images/'+val.images[0].small+'" class="resize-img"></span></div></div>';
              }
              var comment_video = '';
              if(checkdefined(val.video_filename) == 'yes')
              {
                  comment_video = '<div style=background-image:url("'+ server_url+'resources/files/videos/'+val.thumb_filename+'") class="video-item"><div class="video-wrapper"><div class="video-container"><div class="future-video video" style="display:block;" onclick=playvideo("' + server_url+ 'resources/files/videos/' + val.video_filename + '");><img src="img/bigplay.png" class="video_comment" /></div></div></div></div>';
                 // alert(comment_video)
              }
              
              
              
              if(val.reply_to_comment_id == 0 || val.reply_to_comment_id == 'null' || val.reply_to_comment_id == null)
              {
                 $('.comment_loop').prepend('<div id="comment_'+val.instance_id+'" class="questions-item-container row"><div class="clearfix"><div class="col-xs-2 questions-item-img"><div class="img-wrapper" style="background-image:url('+image_url+')"></div></div><div class="col-xs-10 question-item-info"><h3 class="clearfix">'+name+'<span><i class="fa fa-clock-o"></i>'+val.time_since+'</span></h3><div class="question-inner"><div><i class="fa fa-comment"></i></div><p>'+val.comments+' </p></div></div></div>'+comment_image+comment_video+'<div class="clearfix">'+delete_button+'<div class="likes-container">'+like_string+'<div class="likes-count"><i class="fa fa-heart"></i>'+val.likes+' Likes</div><div class="dislikes-count">- '+val.dislikes+' '+dislike_link+'</div><div class="reply-to-comment"><i class="fa fa-reply"></i>Reply</div></div></div><div class="questions-filter-items reply-form clearfix hide"><div data-role="fieldcontain" class="form-group textarea c'+val.instance_id+'_comment"><textarea class="form-control" id="c'+val.instance_id+'_comment" name="comment" maxlength="4096" placeholder="Partisipate, write a post"></textarea><span><i class="fa fa-comment"></i></span></div><div class="success-status hide"><div class="success-icon-wrapper"><i class="icon-check"></i></div><p></p></div><div class="error-status hide"><div class="error-icon-wrapper"><i class="fa fa-ban"></i></div><p></p></div><div class="clearfix"><div data-role="fieldcontain" class="frm_field submit"><button type="submit" onclick="submitcomment('+val.instance_id+')" name="submit">Send</button><button type="submit" class="btn-danger reply-cancel" name="cancel">Cancel</button></div></div></div>');
             }
              if(val.reply_to_comment_id != 0 && val.reply_to_comment_id != 'null' && val.reply_to_comment_id != null)
             {
                 $('#comment_'+val.reply_to_comment_id).after('<div id="comment_'+val.instance_id+'" class="questions-item-container row comment-reply"><div class="clearfix"><div class="col-xs-2 questions-item-img"><div class="img-wrapper" style="background-image:url('+image_url+')"></div></div><div class="col-xs-10 question-item-info"><h3 class="clearfix">'+name+'<span><i class="fa fa-clock-o"></i>'+val.time_since+'</span></h3><div class="question-inner"><div><i class="fa fa-comment"></i></div><p>'+val.comments+' </p></div></div></div>'+comment_image+'<div class="clearfix">'+delete_button+'<div class="likes-container">'+like_string+'<div class="likes-count"><i class="fa fa-heart"></i>'+val.likes+' Likes</div><div class="dislikes-count">- '+val.dislikes+' '+dislike_link+'</div><div class="reply-to-comment"><i class="fa fa-reply"></i>Reply</div></div></div><div class="questions-filter-items reply-form clearfix hide"><div data-role="fieldcontain" class="form-group textarea c'+val.instance_id+'_comment"><textarea class="form-control" id="c'+val.instance_id+'_comment" name="comment" maxlength="4096" placeholder="Partisipate, write a post"></textarea><span><i class="fa fa-comment"></i></span></div><div class="success-status hide"><div class="success-icon-wrapper"><i class="icon-check"></i></div><p></p></div><div class="error-status hide"><div class="error-icon-wrapper"><i class="fa fa-ban"></i></div><p></p></div><div class="clearfix"><div data-role="fieldcontain" class="frm_field submit"><button type="submit" onclick="submitcomment('+val.instance_id+')" name="submit">Send</button><button type="submit" class="btn-danger reply-cancel" name="cancel">Cancel</button></div></div></div>');
              }
             
        });
              $(".loading_agenda_items").hide();  
              $(".questions-container").show();
        if(checkdefined(localStorage.message) == 'yes')
        {
            $('.comment_loop').before('<div class="alert alert-success">Deleted</div>');
            $('.alert-success').fadeOut(3000);
            localStorage.message = '';
        }
              $('.reply-to-comment,.reply-cancel').on('click', function (e) 
              {
                  e.preventDefault();
                  // alert('hi')
                  var container = $(this).parents('.questions-item-container');
                  container.find('.reply-form').toggleClass('hide');
                  $('#createdform').toggle();
                 
              });
            }
       }); 
   });             
}

//function to delete a comment
function deletecomment(instance_id)
{
  if(confirm("Delete confirmation"))
  {
      var main_url = server_url + 'Add-comment/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id+'/delete/'+instance_id+'/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
      jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(resp) {
            window.location.href="add_comments.html";
            localStorage.message = 'Deleted';
        }
      });
  }  
}

//function to submit a comment
function submitcomment(instance_id)
{
    var submit_form = 1;
    var form_noresubmit_code = localStorage.resubmit_code;
  //alert(form_noresubmit_code)
  var comment_id = 0;
  var comment = jQuery('#frmfld_comment').val();
  if(checkdefined(instance_id) == 'yes')
  {
    var comment_id = instance_id;  
    var comment = jQuery('#c'+instance_id+'_comment').val();
  } 
  //alert(comment); 
  var action = 'post_comment';
  
  jQuery(".submit_com").hide();
  jQuery(".loading_send").show(); 
  if(checkdefined(localStorage.imageURI) == 'yes')
  {
    var imageData = localStorage.imageURI;
   
    //  alert(imageData);          
    var photo_ur = imageData;
    var options = new FileUploadOptions();
    var imageURI = photo_ur;
    options.fileKey = "files[]";
    if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
        var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    } else {
        var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.jpg';
    }
    options.fileName = newfname;
    //alert(newfname);
    options.mimeType = "image/jpeg";
    var params = new Object();    
    params.submit_form = submit_form;
    params.form_noresubmit_code = form_noresubmit_code;
    params.comment_id = comment_id;
    params.action = action;
    params.comment = comment;
    //options.headers = "Content-Type: multipart/form-data; boundary=38516d25820c4a9aad05f1e42cb442f4";
    options.params = params;
    options.chunkedMode = false;
    var ft = new FileTransfer();
    //alert(imageURI);
    var main_url = server_url + 'Add-comment/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
    ft.upload(imageURI, encodeURI(main_url), win, fail, options);

    function win(r) {
      localStorage.imageURI = '';
      localStorage.resubmit_code = '';      
       window.location.href="add_comments.html"
    }

    function fail(error) {
        alert("An error has occurred: Code = " + error.code);
        alert("upload error source " + error.source);
        alert("upload error target " + error.target);
        jQuery(".submit_com").show();
        jQuery(".loading_send").hide();
    }
    
   }
   else
   { 
    
  //alert(comment)
  var main_url = server_url + 'Add-comment/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        data: {
            submit_form: submit_form,
            form_noresubmit_code:form_noresubmit_code,
            comment_id:comment_id,
            action:action,
            comment:comment
        },
        success: function(resp) {
            //alert(resp)
            localStorage.resubmit_code = '';            
            window.location.href="add_comments.html"
        }
    });
    }
} 

//function to like and dislike comment
function likedislikecomment(id,like)
{
  jQuery(document).ready(function($)
  {
    $(".loading_cancel").show();  
    $(".questions-container").hide();
  var main_url = server_url + 'Add-comment/-/OCintranet-'+static_event_id+'/'+localStorage.agenda_id+'/?action=like&gvm_json=1&like='+like+'&c_id='+id;
       //  alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            window.location.href = 'add_comments.html';
            }
            });
   });
}

function sortResults(prop, asc) {
    arr = arr.sort(function(a, b) {
        if (asc) return (a[prop] > b[prop]);
        else return (b[prop] > a[prop]);
    });
}

//function to delete entries from all the tables
function truncatealltables() {
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