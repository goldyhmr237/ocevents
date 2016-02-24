/**


Copyright (c) 2014 torrmal:Jorge Torres, jorge-at-turned.mobi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

try{
	var tmp = LocalFileSystem.PERSISTENT;
	var tmp = null;
}
catch(e){

	var LocalFileSystem= {PERSISTENT : window.PERSISTENT,
						TEMPORARY: window.TEMPORARY}; 
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;


}






var DirManager = function(){
	
	this.cache = {};

	var current_object = this;
	// recursive create
	this.create_r =function(path, callback, fail, position)
	{
		position = (typeof position == 'undefined')? 0: position;

		
		
		var path_split 		= path.split('/');
		var new_position 	= position+1;
		var sub_path 		= path_split.slice(0,new_position).join('/');

		Log('DirManager','mesg')('path:'+sub_path,'DirManager');
		
		
		
		var inner_callback = function(obj){
			return function(){
				Log('DirManager','mesg')('inner_callback:'+path);

				obj.create_r(path, callback, fail, new_position);
			}
		}

		
		if(new_position == path_split.length){
			this.create(sub_path, callback, fail);
		}
		else
		{
			this.create(sub_path, inner_callback(this), fail);
		}
		

	};

	this.list = function(path, success, fail){

		fail = (typeof fail == 'undefined')? Log('DirManager','crete fail'): fail;

		var template_callback = function(success){

			return 	function(entries) {
			        var i;
			        var ret = [];
			        
			        limit=entries.length;
			        	
			        
			        for (i=0; i<limit; i++) {
			            //console.log(entries[i].name);
			            ret.push(entries[i].name);

			        }
			        // console.log('LIST: '+ret);
			        success(ret);
				}
		}

		if(current_object.cache[path]){
			
			current_object.cache[path].readEntries(
			            	template_callback(success)
			            );
			return;
		}

		fileSystemSingleton.load(
			function(fileSystem){
				var entry=fileSystem.root; 
				
	        	entry.getDirectory(path,

	        		{create: true, exclusive: false}, 
	        		function(entry){
	        			var directoryReader = entry.createReader();
	        			current_object.cache[path] = directoryReader;
			            directoryReader.readEntries(
			            	template_callback(success)
			            );
	        		}, 
	        		function(err){
	        			current_object.create_r(path,function(){success([]);},fail);
	        			Log('DirManager','crete fail')('error creating directory');
	        			//fail(err);
	        		}
	        	);
			}
		);		
	}

	this.create = function(path, callback, fail){
		fail = (typeof fail == 'undefined')? Log('DirManager','crete fail'): fail;
		fileSystemSingleton.load(
			function(fileSystem){
				var entry=fileSystem.root; 
				
	        	entry.getDirectory(path,
	        		{create: true, exclusive: false}, 
	        		function(entry){
	        			Log('FileSystem','msg')('Directory created successfuly');
	        			callback(entry);
	        		}, 
	        		function(err){
	        			Log('DirManager','crete fail')('error creating directory');
	        			fail(err);
	        		}
	        	);
			}
		);
	};

	this.remove = function(path, success, fail){
		fail = (typeof fail == 'undefined')? Log('DirManager','crete fail'): fail;
		success = (typeof success == 'undefined')? Log('DirManager','crete fail'): success;
		
		//console.log(current_object.cache);
		delete current_object.cache[path];
		//console.log(current_object.cache);
		this.create(
			path,
			function(entry){
				
				
				entry.removeRecursively(success, fail);
			}
		);
	}
	
};

var Log = function(bucket, tag){
  return function(message){
    if(typeof bucket != 'undefined')
    {
      console.log(' '+bucket+':');
    }
    if(typeof tag != 'undefined')
    {
      console.log(' '+tag+':');
    }
    if(typeof message != 'object'){
      console.log('       '+message);
    }
    else
    {
      console.log(message);
    }
  };
}


var fileSystemSingleton = {
	fileSystem: false,

	load : function(callback, fail){
		fail = (typeof fail == 'undefined')? Log('FileSystem','load fail'): fail;
		if(fileSystemSingleton.fileSystem){
			callback(fileSystemSingleton.fileSystem);
			return; 
		}

		if(!window.requestFileSystem){
			return fail();
		}


		window.requestFileSystem(
			LocalFileSystem.PERSISTENT,
			0, 
			function(fileSystem){
				fileSystemSingleton.fileSystem = fileSystem;
				callback(fileSystemSingleton.fileSystem);
			}, 
			function(err){
				Log('FileSystem','load fail')('error loading file system');
				fail(err);
			}
		);
	}
};


var Log = function(bucket, tag){
  return function(message){
    if(typeof bucket != 'undefined')
    {
      console.log(' '+bucket+':');
    }
    if(typeof tag != 'undefined')
    {
      console.log(' '+tag+':');
    }
    if(typeof message != 'object'){
      console.log('       '+message);
    }
    else
    {
      console.log(message);
    }
  };
}


var fileSystemSingleton = {
	fileSystem: false,

	load : function(callback, fail){
		fail = (typeof fail == 'undefined')? Log('FileSystem','load fail'): fail;
		if(fileSystemSingleton.fileSystem){
			callback(fileSystemSingleton.fileSystem);
			return; 
		}

		if(!window.requestFileSystem){
			return fail();
		}


		window.requestFileSystem(
			LocalFileSystem.PERSISTENT,
			0, 
			function(fileSystem){
				fileSystemSingleton.fileSystem = fileSystem;
				callback(fileSystemSingleton.fileSystem);
			}, 
			function(err){
				Log('FileSystem','load fail')('error loading file system');
				fail(err);
			}
		);
	}
};

var FileManager = function(){

	

	this.get_path = function(todir,tofilename, success){
		fail = (typeof fail == 'undefined')? Log('FileManager','read file fail'): fail;
		this.load_file(
			todir,
			tofilename,
			function(fileEntry){

					var sPath = fileEntry.toURL();
					
					
					success(sPath);
			},
			Log('fail')
		);


		
	}

	this.load_file = function(dir, file, success, fail, dont_repeat){
		if(!dir || dir =='')
		{
			Log('error','msg')('No file should be created, without a folder, to prevent a mess');
			fail();
			return;
		}
		fail = (typeof fail == 'undefined')? Log('FileManager','load file fail'): fail;
		var full_file_path = dir+'/'+file;
		var object = this;
		// well, here it will be a bit of diharrea code, 
		// but, this requires to be this chain of crap, thanks to phonegap file creation asynch stuff
		// get fileSystem
		fileSystemSingleton.load(
			function(fs){
				var dont_repeat_inner = dont_repeat;
				// get file handler
				console.log(fs.root);
				fs.root.getFile(
					full_file_path, 
					{create: true, exclusive: false}, 
					success, 

					function(error){
						
						if(dont_repeat == true){
							Log('FileManager','error')('recurring error, gettingout of here!');
							return;
						}
						// if target folder does not exist, create it
						if(error.code == 3){
							Log('FileManager','msg')('folder does not exist, creating it');
							var a = new DirManager();
      						a.create_r(
      							dir, 
      							function(){
      								Log('FileManager','mesg')('trying to create the file again: '+file);
      								object.load_file(dir,file,success,fail,true);
      							},
      							fail
      						);
							return;
						}
						fail(error);
					}
				);
			}
		);
	};

	this.download_file = function(url, todir, tofilename, success, fail){

		fail = (typeof fail == 'undefined')? Log('FileManager','read file fail'): fail;
		this.load_file(
			todir,
			tofilename,
			function(fileEntry){

					var sPath = fileEntry.toURL();

		            var fileTransfer = new FileTransfer();
		            fileEntry.remove();
		           
		            fileTransfer.download(
		                encodeURI(url),
		                sPath,
		                function(theFile) {
		                    console.log("download complete: " + theFile.toURI()); 
		                    success(theFile);
		                },
		                function(error) {
		                    console.log("download error source " + error.source);
		                    console.log("download error target " + error.target);
		                    console.log("upload error code: " + error.code);
		                    fail(error);
		                }
		            );


				

			},
			fail
		);

		
	};

	this.read_file = function(dir, filename, success, fail){
		// console.log(dir);
		fail = (typeof fail == 'undefined')? Log('FileManager','read file fail'): fail;
		this.load_file(
			dir,
			filename,
			function(fileEntry){
				fileEntry.file(
					function(file){
						var reader = new FileReader();

						reader.onloadend = function(evt) {
						    
						    success(evt.target.result);
						};

						reader.readAsText(file);
					}, 
					fail
				);

			},
			fail
		);
	};

	this.write_file = function(dir, filename, data, success, fail){
		fail = (typeof fail == 'undefined')? Log('FileManager','write file fail'): fail;
		this.load_file(
			dir,
			filename,
			function(fileEntry){
				fileEntry.createWriter(
					function(writer){
						Log('FileManager','mesg')('writing to file: '+filename);
						writer.onwriteend = function(evt){
							Log('FileManager','mesg')('file write success!');
							success(evt);
						}
				        writer.write(data);
					}, 
					fail
				);
			},			
			fail
		);

		//
	};


	this.remove_file = function(dir, filename, success, fail){
		var full_file_path = dir+'/'+filename;
		fileSystemSingleton.load(
			function(fs){
				
				// get file handler
				fs.root.getFile(full_file_path, {create: false, exclusive: false}, function(fileEntry){fileEntry.remove(success, fail);}, fail);
			}

		);
		//
	};
};




var ParallelAgregator = function(count, success, fail, bucket)
{
  ////System.log('success: aggregator count:'+count);
  var success_results = [];
  var fail_results = [];
  var success_results_labeled = {};
  var ini_count = 0;
  var log_func= function(the_data){
    //console.log(the_data)
  }
  var object = this;
  current_bucket = (typeof bucket == 'undefined')? 'aggregator' : bucket;
  var success_callback =  (typeof success == 'undefined')? log_func : success;
  var fail_callback = (typeof fail == 'undefined')? log_func: fail;

  

  this.success = function(label){
    return function(result){
      //System.log('one aggregator success!',current_bucket);
      ini_count++;
      success_results.push(result);
      if(!success_results_labeled[label]){
        success_results_labeled[label] = [];
      }
      success_results_labeled[label].push(result);
      //System.log('success: aggregator count:'+ini_count,current_bucket);
      object.call_success_or_fail();
    }
  };

  this.call_success_or_fail = function(){
    if(ini_count == count){
      //System.log('aggregator complete',current_bucket);
      if(success_results.length == count)
      {
        //System.log('aggregator success',current_bucket);
        success_callback(success_results_labeled);
      }
      else{
        //System.log('aggregator fail',current_bucket);
        fail_callback({success:success_results,fail:fail_results});
      }
    }
  };

  this.fail = function(result){
    //System.log('one aggregator fail!',current_bucket);
    ini_count++;
    fail_results.push(result);
    //System.log('fail: aggregator count:'+ini_count, current_bucket);
    this.call_success_or_fail();
  }
}

/**

//TEST CODE:
var start=	function(){
		

		//
		//CREATE A DIRECTORY RECURSEVLY
		var a = new DirManager(); // Initialize a Folder manager
        a.create_r('folder_a/folder_b',Log('complete/jorge'));

		//LIST A DIRECTORY 
		a.list('cosa', Log('List'));

        //REMOVE A DIRECTORY RECURSEVLY
        a.remove('folder_a/folder_b',Log('complete delte'), Log('delete fail'));

		//
		//FILES MANAGEMENT:
		//
        var b = new FileManager();
        // create an empty  FILE (simialr unix touch command), directory will be created recursevly if it doesnt exist
        b.load_file('dira/dirb/dirc','demofile.txt',Log('file created'),Log('something went wrong'));
        
        // WRITE TO A FILE
        b.write_file('dira/dirb/dirc/dird','demofile_2.txt','this is demo content',Log('wrote sucessful!'));

        // READ A FILE
        b.read_file('dira/dirb/dirc/dird','demofile_2.txt',Log('file contents: '),Log('something went wrong'));
        
        // download a file from a remote location and store it localy
        b.download_file('http://www.greylock.com/teams/42-Josh-Elman','filder_a/dwonloads_folder/','target_name.html',Log('downloaded sucess'));
       

		
}
document.addEventListener('deviceready', start, false);
*/





function getFileNameFromPath(path) {
    var ary = path.split("/");
    return ary[ary.length - 1];
}

//function to check internet connection on device
function checkNetworkConnection()
{
        var networkState = navigator.connection.type;
			
				var states = {};
				states[Connection.UNKNOWN]  = 'Unknown connection';
				states[Connection.ETHERNET] = 'Ethernet connection';
				states[Connection.WIFI]     = 'WiFi connection';
				states[Connection.CELL_2G]  = 'Cell 2G connection';
				states[Connection.CELL_3G]  = 'Cell 3G connection';
				states[Connection.CELL_4G]  = 'Cell 4G connection';
				states[Connection.CELL]     = 'Cell generic connection';
				states[Connection.NONE]     = 'No network connection';  
				 //alert(states[networkState]);
				if(states[networkState]=='No network connection'){
            return 'no';
        }
        else
        {
          return 'yes';
        }
}

//function to check if user is logged in or not
function isLoggedIn()
{
    var main_url = localStorage.url + 'api/index.php/auth/isLoggedIn?XDEBUG_SESSION_START=PHPSTORM';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(resp) {
            if (resp.data.logged_in == false || resp.data.logged_in == 'false') {
               localStorage.user_id = '';
               window.location.href = 'index.html';
            }
          } 
      });
}


//Reset Password
function resetpassword() {
    //alert("asdas");
  event.preventDefault();
  var email = jQuery("#fld_rp_email").val();
  var fld_l_url = jQuery("#fld_l_url").val();
    
  if (fld_l_url == '') {
      alert("Please Enter Url");
      return false;
  }
  else if (email == '') {
      alert("Please Enter Email");
      return false;
  }
  else
   {
    var main_url = fld_l_url + 'gamification/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
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
}



function removeprofileimage() {
    var main_url = localStorage.url + 'api/index.php/auth/removeUserImage?XDEBUG_SESSION_START=PHPSTORM';
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
                                tx.executeSql('update OCEVENTS_user set image_src = "' + ImgFullUrl + '",is_user_image="false"');
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
        var main_url = localStorage.url + 'api/index.php/auth/updateUser?XDEBUG_SESSION_START=PHPSTORM';
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
                        tx.executeSql("update OCEVENTS_user set email = '" + obj.data.email + "',first_name = '" + obj.data.first_name + "',last_name = '" + obj.data.last_name + "',mobile = '" + obj.data.mobile + "'");
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


function checkURL(value) {
    var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    if (urlregex.test(value)) {
        return (true);
    }
    return (false);
}

function createTables()
{
   db.transaction(function(tx) {
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_user (id integer primary key autoincrement,team,position,fb_user_id,fb_email,birthday_date,website, user_id, email, first_name, last_name,mobile, image_src, is_user_image, created,gender,player_code)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_ticket (id integer primary key autoincrement,user_id,ticketCode,ticketSrc)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_points (id integer primary key autoincrement,alias,user_id,name,position integer,userTotal,green_count,hideTeamScores,label,instance_id)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_qa (id integer primary key autoincrement,user_id, question,answer)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id,main_logo_small_image,main_banner_image,main_title,main_text,main_link,type,iframe_url)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_teampoints (id integer primary key autoincrement,alias,user_id,name,position integer,userTotal,green_count,label,instance_id)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_yourteampoints (id integer primary key autoincrement,alias,user_id,name,position integer,userTotal,green_count,label,instance_id)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_footerlinks (id integer primary key autoincrement,name,icon,friends_requests_count,menu_text)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_footermorelinks (id integer primary key autoincrement,name,icon,friends_requests_count,menu_text)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_events (id integer primary key autoincrement,event_id,user_id,title,description,logo,image, short_url)'); 
 }); 
}


function loginme() {

 //alert('log');

    jQuery(document).ready(function($) {
        //adb logcat *:E
        event.preventDefault();
       
        
        var fld_l_email = $("#fld_l_email").val();
        var fld_l_url = $("#fld_l_url").val();
        var fld_l_password = $("#fld_l_password").val();
        if (fld_l_email == '') {
            alert("Please Enter Your Email");
            return false;
        } else if (fld_l_password == '') {
            alert("Please Enter Your Password");
            return false;
        } else if (fld_l_url == '') {
            alert("Please Enter Url");
            return false;
        } else if(!checkURL(fld_l_url)){
              alert("Please Enter A Valid Url");
            return false;
        } else {
         $("#login_submit").hide();
         $(".loading").show();
            var email = base64_encode(fld_l_email);
            var pwd = base64_encode(fld_l_password);
            localStorage.url = fld_l_url + '/';
            //alert(email)
            var main_url = localStorage.url + 'api/index.php/auth/login?XDEBUG_SESSION_START=PHPSTORM';
             //alert('here');
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
                        createTables();

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
                                b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {

                                    var ImgFullUrl = '';
                                    ImgFullUrl = theFile.toURI();
                                    // alert(ImgFullUrl);
                                    db.transaction(function(tx) {
                                        
                                        tx.executeSql("delete from OCEVENTS_user");
                                        tx.executeSql('INSERT INTO OCEVENTS_user (team,position,fb_user_id,fb_email,birthday_date,website,user_id,email,first_name,last_name,mobile,image_src,is_user_image,created,gender,player_code) VALUES ("' + obj.data.team + '","' + obj.data.position + '","' + obj.data.fb_user_id + '","' + obj.data.fb_email + '","' + obj.data.birthday_date + '","' + obj.data.website + '","' + obj.data.id + '","' + obj.data.email + '","' + obj.data.first_name + '","' + obj.data.last_name + '","' + obj.data.mobile + '","' + ImgFullUrl + '","' + obj.data.image.is_user_image + '","' + obj.data.created + '","' + obj.data.gender + '","' + obj.data.player_code + '")');
                                        localStorage.user_id = obj.data.id;
                                        localStorage.event_id = obj.data.event_id;
                                        //alert(localStorage.event_id)
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


        var main_url = localStorage.url + 'api/index.php/auth/FBRemoveData?XDEBUG_SESSION_START=PHPSTORM';
        jQuery.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
                event_id: localStorage.event_id
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
                var main_url = localStorage.url + 'api/index.php/auth/FBUpdateData?XDEBUG_SESSION_START=PHPSTORM';
                jQuery.ajax({
                    url: main_url,
                    dataType: "json",
                    method: "POST",
                    data: {
                        fb_access_token: encoded_access_token,
                        fb_user_id: encoded_newstr,
                        event_id: localStorage.event_id
                    },
                    success: function(obj) {
                        //alert(obj.status);
                        //alert(obj.message);
                        if (obj.status == "success") {
                            //alert(obj.message);
                            var fb_uid = obj.data.fb_user_id;
                            db.transaction(function(tx) {
                                tx.executeSql('update OCEVENTS_user set fb_user_id = "' + fb_uid + '"');

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

            var main_url = localStorage.url + 'api/index.php/auth/FBRemoveData?XDEBUG_SESSION_START=PHPSTORM';
            jQuery.ajax({
                url: main_url,
                dataType: "json",
                method: "POST",
                data: {
                    fb_access_token: encoded_access_token,
                    fb_user_id: encoded_newstr,
                    event_id: localStorage.event_id
                },
                success: function(obj) {
                    //alert(obj.status);
                    if (obj.status == "success") {

                        db.transaction(function(tx) {
                            tx.executeSql('update OCEVENTS_user set fb_user_id = ""');

                            window.location.href = "profile.html";

                        });
                    }
                }
            });

            
        },
        function(response) {
            //alert(JSON.stringify(response));
        });
       
       
}


var login = function() {
    //alert('here');
    jQuery(document).ready(function($) {

        if (!window.cordova) {
            var appId = prompt("Enter FB Application ID", "");
            facebookConnectPlugin.browserInit(appId);
        }
        var fld_l_url = jQuery("#fld_l_url").val();
          if(fld_l_url == '')
          {
             alert('Please Enter Url');
          }
          else if(!checkURL(fld_l_url)){
              alert("Please Enter A Valid Url");
            return false;
        }
           else {
           localStorage.url = fld_l_url + '/';
        facebookConnectPlugin.login(["email"],
            function(response) {

                //alert('here 1');
                var newstr = JSON.stringify(response.authResponse.userID).replace(/\"/g, '');
                var access_token = JSON.stringify(response.authResponse.accessToken).replace(/\"/g, '');

                var encoded_newstr = base64_encode(newstr);
                var encoded_access_token = base64_encode(access_token);
                // $("#login_submit").hide();
                //   $(".loading").show();
                //alert(localStorage.url);
                createTables();
                var main_url = localStorage.url + 'api/index.php/auth/FBlogin?XDEBUG_SESSION_START=PHPSTORM';
                jQuery.ajax({
                    url: main_url,
                    dataType: "json",
                    method: "POST",
                    data: {
                        fb_access_token: encoded_access_token,
                        fb_user_id: encoded_newstr,
                        event_id: localStorage.event_id
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
                                            localStorage.event_id = obj.data.event_id;
                                            
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
               // alert(JSON.stringify(response));
            });
            }
    });
}

function logout() {
    //alert('here')
    truncatealltables();
    var main_url = localStorage.url + 'api/index.php/auth/logout?XDEBUG_SESSION_START=PHPSTORM';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        success: function(obj) {
            //alert(obj.status);                       
            if (obj.status == 'success') {

                
                localStorage.user_id = '';
                localStorage.instance_id = '';
                localStorage.event_id = '';
                localStorage.short_url = '';
                localStorage.url = '';
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
    loadcommonthings(); isLoggedIn(); 
    importfooter('g-homepage', 'home');

    db.transaction(function(tx) {

        //alert("SELECT * FROM OCEVENTS_homepage ");
        tx.executeSql("SELECT * FROM OCEVENTS_homepage", [], function(tx, results) {
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
            }
            else if (results.rows.item(0).type == 'module') {
                    localStorage.agenda_id = results.rows.item(0).main_title;
                    //alert(localStorage.agenda_id)
                    window.location.href = 'agenda_item.html';
            } else { 
                
                $(".main-container").html("No Module Found");
            }



        });
    });
}

function onFail(message) {
    //alert('Failed because: ' + message);
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
    ft.upload(imageURI, encodeURI(localStorage.url + "api/index.php/auth/updateUserImage"), win, fail, options);

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
                            tx.executeSql('update OCEVENTS_user set image_src = "' + ImgFullUrl + '",is_user_image="true"');

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
function captureVideo() {
var options = { limit: 1 };

navigator.device.capture.captureVideo(onVideoCapURISuccess, onFail, options);

}


function getVideo(source) {
    navigator.camera.getPicture(onVideoURISuccess, onFail, { quality: 50, 
    destinationType: destinationType.FILE_URI,
    sourceType: source,
    mediaType: 1 });
}

function onVideoURISuccess(videoURI) {

jQuery('.swiper-container').show();
jQuery('.preview').html('<img src ="img/dummy_video.gif" width="80" height="80" />');
$('.ui-widget-overlay').hide();
$('#footerSlideContainer').slideUp('fast');
jQuery(".main-questions-form-container").show();
localStorage.imageURI = videoURI;
localStorage.mime = 'video/mp4';
}

function onVideoCapURISuccess(videoURI) {
 
var video = videoURI[0].fullPath;
//alert(video) 
jQuery('.swiper-container').show();
jQuery('.preview').html('<img src ="img/dummy_video.gif" width="80" height="80" />');
$('.ui-widget-overlay').hide();
$('#footerSlideContainer').slideUp('fast');
jQuery(".main-questions-form-container").show();
localStorage.imageURI = video;
localStorage.mime = 'video/mp4';
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
$('.ui-widget-overlay').hide();
$('#footerSlideContainer').slideUp('fast');
jQuery(".main-questions-form-container").show();
localStorage.imageURI = imageURI;
localStorage.mime = 'image/jpeg';
    
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
    //jQuery('.captureimage').show();
    //jQuery('.uploadimage').show();
    jQuery('.ui-widget-overlay').show();
    jQuery('#footerSlideContainer').slideDown('fast');
    jQuery(".main-questions-form-container").hide();   
     var buttons_html = '<div><a href="#" onclick="captureImage()">Take a Photo</a></div>';
     buttons_html += '<div><a href="#" onclick="uploadImage(pictureSource.PHOTOLIBRARY);">Choose a Photo</a></div>';
     buttons_html += '<div><a href="#" onclick="captureVideo();">Take a Video</a></div>';
     buttons_html += '<div><a href="#" onclick="getVideo(pictureSource.PHOTOLIBRARY);">Choose a Video</a></div>';
     buttons_html += '<div><a href="#" onclick="canceloptions()">Cancel</a></div>';
     jQuery('#footerSlideContainer').html(buttons_html);
     //alert(buttons_html)
}

function canceloptions(){
  
   $('.ui-widget-overlay').hide();
   $('#footerSlideContainer').slideUp('fast');
   jQuery(".main-questions-form-container").show();
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
        isLoggedIn();
        importfooter('View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda-item');
        var main_url = localStorage.url + 'View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '?gvm_json=1';
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
                    var imgurl = localStorage.url + 'resources/files/images/' + data.presentation.speaker_image.__extra.medium_file_name;
                    $(".agenda-main-img").attr("style", "background-image:url(" + imgurl + ")");
                }
                //alert(data.presentation.time)
                if (checkdefined(data.presentation.time) == 'yes') {
                    $('.fa-clock-o').after(data.presentation.time)
                }
                //alert(checkundefined(data.videoSrc));
                if (checkdefined(data.videoSrc) == 'yes') {
                    $('.future-video').show();
                    $('.future-video').attr('onclick', 'playvideo("' + localStorage.url + data.videoSrc + '")');
                    $('.playme').attr('src', localStorage.url + data.videoPoster);
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
                    
                   
                    
                    $(".presentation-modules").append('<li><a href="#" '+onclick+'><i class="' + icon_class + '"></i>' + text + '</a></li>')

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
        loadcommonthings(); isLoggedIn();
        importfooter('ticketing', 'home');
        db.transaction(function(tx) {
            
            tx.executeSql('delete from OCEVENTS_ticket');
        });
        $(".ticketing-container").hide();
        var main_url = localStorage.url + 'ticketing/-/' + localStorage.event_id + '/?gvm_json=1';
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
                var img_src = localStorage.url + obj.ticketSrc;
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
        tx.executeSql("SELECT * FROM OCEVENTS_ticket", [], function(tx, results) {
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
        loadcommonthings(); isLoggedIn();  
        importfooter('user-points', 'points');
        $(".leaderboards-container").hide();
        //jQuery(".loading_agenda_items").hide();
        var main_url = localStorage.url + 'user-points/?gvm_json=1';
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
                    
                    tx.executeSql('delete from OCEVENTS_points');
                    tx.executeSql("SELECT * FROM OCEVENTS_points", [], function(tx, results) {
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
                                    tx.executeSql("insert into OCEVENTS_points (alias,user_id,name,position,userTotal,green_count,hideTeamScores,label,instance_id) values ('" + val.alias + "','" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.userTotal + "','" + green_count + "','" + hideTeamScores + "','" + label + "' ,'" + val.instance_id + "' )");
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
        tx.executeSql("SELECT * FROM OCEVENTS_points", [], function(tx, results) {
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
                var val = results.rows.item(i);
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
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
        loadcommonthings(); isLoggedIn();
        $(".leaderboards-container").hide();
        importfooter('user-points/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id, 'points');
        var main_url = localStorage.url + 'user-points/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';
         //alert(main_url)
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
                $.each(obj.topScoresViewVars.items, function(key, val) {
                    var classcss = "";
                    //alert(localStorage.user_id)
                    if(val.is_current_user == true || val.is_current_user == 'true')
                    {
                        classcss= 'current-user';
                    }
                    if (val.image != '') {
                        var newtd = '<td class="avatar-col"><span class="avatar"><div class="img img-circle" style="background-image:url(' + val.image + ');"></div></span></td>';
                    } else {
                        var newtd = '<td class="avatar-col"></td>';
                    }
                    i++;
                     var id = val.points ;
                     var user_total = formatpoints(id);
                     $(".team-points-table table tbody").append('<tr class=' + classcss + '><td class="num-col"><span class="num">' + i + '</span></td>' + newtd + '<td><span class="name">' + val.name + '</span></td><td class="point">' + user_total + '</td></tr>');

                });
                
                $(".user-points-table table tbody").html('');
                $.each(obj.categories, function(key, val) {
                    if (val.instance_id == localStorage.instance_id) {
                        var classcss = "active";
                    } else {
                        var classcss = "";
                    }

                    var icon = '';
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
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
        loadcommonthings(); isLoggedIn();
        importfooter('team-points', 'team-points');
        $(".leaderboards-container").hide();
        var main_url = localStorage.url + 'team-points/?gvm_json=1';

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
                    
                    tx.executeSql('delete from OCEVENTS_teampoints');
                    tx.executeSql("SELECT * FROM OCEVENTS_teampoints", [], function(tx, results) {
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
                                    tx.executeSql("insert into OCEVENTS_teampoints (alias,user_id,name,position,userTotal,green_count,label,instance_id) values ('" + val.alias + "','" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.points + "','" + green_count + "','" + label + "','" + val.instance_id + "' )");
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
        tx.executeSql("SELECT * FROM OCEVENTS_teampoints", [], function(tx, results) {
            var len = results.rows.length;
            $(".table-striped tbody").html('&nbsp;');
            var label = results.rows.item(0).label;

            $(".green-text").html(label);
            var group_title = '';

            for (i = 0; i < len; i++) {
                
                var icon = '';
                var val = results.rows.item(i);
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                    }
                
                
               /* var icon = '';
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
                }                                                                       */
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
        loadcommonthings(); isLoggedIn();
        $(".leaderboards-container").hide();
        importfooter('team-points/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id, 'your-team');
        var main_url = localStorage.url + 'team-points/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';

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
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
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
        loadcommonthings(); isLoggedIn();
        $(".leaderboards-container").hide();
        importfooter('Your-team/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id, 'your-team');
        var main_url = localStorage.url + 'Your-team/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';

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
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
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
        loadcommonthings(); isLoggedIn();
        $(".leaderboards-container").hide();
        importfooter('Your-team', 'your-team');
        var main_url = localStorage.url + 'your-team/?gvm_json=1';

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
                    
                    tx.executeSql('delete from OCEVENTS_yourteampoints');
                    tx.executeSql("SELECT * FROM OCEVENTS_yourteampoints", [], function(tx, results) {
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
                                    tx.executeSql("insert into OCEVENTS_yourteampoints (alias,user_id,name,position,userTotal,green_count,label,instance_id) values ('" + val.alias + "','" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.points + "','" + green_count + "','" + label + "','" + val.instance_id + "'  )");
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
        tx.executeSql("SELECT * FROM OCEVENTS_yourteampoints", [], function(tx, results) {
            var len = results.rows.length;
            $(".table-striped tbody").html('&nbsp;');
            var label = results.rows.item(0).label;

            $(".green-text").html(label);
            var group_title = '';

            for (i = 0; i < len; i++) {
               /* var icon = '';
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
                } */
                var val = results.rows.item(i);
                var icon = '';
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
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
        loadcommonthings(); isLoggedIn();
        importfooter('agenda', 'agenda');
        $(".agenda-container").hide();
        //showAgendaData();
        //http://www.oceventmanager.com/agenda/-/'+localStorage.short_url+'-100041/?ajax=1&all=1&gvm_json=1
        var main_url = localStorage.url + 'agenda/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?ajax=1&all=1&gvm_json=1';
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
        loadcommonthings(); isLoggedIn();
        importfooter('agenda', 'agenda');
        $(".agenda-container").hide();
        var main_url = localStorage.url + 'api/index.php/main/agendaItems?XDEBUG_SESSION_START=PHPSTORM';
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
        loadcommonthings(); isLoggedIn();
        importfooter('sponsors/-/'+localStorage.short_url+'-' + localStorage.event_id, 'sponsors');
        $(".agenda-container").hide();
        //showAgendaData();

        var main_url = localStorage.url + 'sponsors/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?gvm_json=1&ajax=1&all=1';
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
        loadcommonthings(); isLoggedIn();
        importfooter('sponsors/-/'+localStorage.short_url+'-' + localStorage.event_id, 'sponsors');
        $(".agenda-container").hide();
        //showAgendaData();

        var main_url = localStorage.url + 'sponsors/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?gvm_json=1';
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
        tx.executeSql("SELECT * FROM OCEVENTS_agenda order by start_time asc", [], function(tx, results) {
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
        loadcommonthings(); isLoggedIn();
        $(".add-friends-container").hide();
        importfooter('user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/view/' + localStorage.friend_id, 'friends');
        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/view/' + localStorage.friend_id + '?gvm_json=1';

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
    var download_url = localStorage.url + url;
    //alert(download_url)
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
        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/cancel/' + player_code + '?gvm_json=1';

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
        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/approve/' + player_code + '?gvm_json=1';

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
        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/add/' + player_code + '?gvm_json=1';

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
        loadcommonthings(); isLoggedIn();
        importfooter('user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/', 'friends');
        $(".add-friends-container").hide();
        //showAgendaData();

        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?gvm_json=1';

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
        loadcommonthings(); isLoggedIn();
        importfooter('user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/friends', 'friends');
        $(".add-friends-container").hide();
        //showAgendaData();

        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/friends?gvm_json=1';
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

        tx.executeSql("SELECT * FROM OCEVENTS_qa", [], function(tx, results) {
            var len = results.rows.length;
            $(".qa-list").html('<dt>Registration</dt>');
            for (i = 0; i < len; i++) {
                //alert(results.rows.item(i).answer);
                $('.qa-list').append('<h4 class="qa-item-title">' + results.rows.item(i).question + '</h4><p class="answer_me">' + results.rows.item(i).answer + '</p></dd>');
            }
        });

        tx.executeSql("SELECT * FROM OCEVENTS_user", [], function(tx, results) {
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

        tx.executeSql("SELECT * FROM OCEVENTS_homepage", [], function(tx, results) {
            var len = results.rows.length;

            $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);



        });
    });
}

function loadcommonthings() {
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_user", [], function(tx, results) {
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

        tx.executeSql("SELECT * FROM OCEVENTS_homepage", [], function(tx, results) {
            var len = results.rows.length;
            $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);
        });
        tx.executeSql("SELECT * FROM OCEVENTS_events", [], function(tx, results) {
            var len = results.rows.length;
            //alert(len)
            if(len>0)
            {
                $('.events').html('<p class="my-events-title">My networks</p>');
            }
            for (i = 0; i < len; i++) {                
                    
                    var event_id = results.rows.item(i).event_id;
                    var title = results.rows.item(i).title; 
                    //alert(title)
                    var current = '';
                    if(localStorage.event_id == event_id)
                    {
                       current = 'active';
                    }
                    $('.events').append('<p><a href="javascript:changecurrentevent('+event_id+')" class="'+current+'">'+title+'</a></p>');              
                
                }            
        });    
    });
}

function getLoggedInUser()
{
   var main_url = localStorage.url + 'api/index.php/auth/user?gvm_json=1';
    jQuery.ajax({
      url: main_url,
      dataType: "json",
      method: "GET",
      success: function(obj) {
          db.transaction(function(tx) {                                        
            tx.executeSql('update OCEVENTS_user set position = "' + obj.data.position + '"');
            //alert('done')
            login_process();
          });                                
      }
    }); 
}

function changecurrentevent(event_id)
{
    jQuery("footer .container").before('<div class="ui-widget-overlay"></div>');
    jQuery(".my-events-title").before('<div id="footerSlideContainer_loading"><img src="img/ajax-loader.gif" /></div>');
    jQuery(".ui-widget-overlay").show();
    jQuery("#footerSlideContainer_loading").show();
    var main_url = localStorage.url + 'api/index.php/main/changeEvent?gvm_json=1';
    jQuery.ajax({
      url: main_url,
      dataType: "json",
      method: "POST",
      data:{eventId:event_id},
      success: function(obj) {
          //alert(obj.data.event_id)
          //alert(obj.data.short_url)
          localStorage.event_id = obj.data.event_id;
          localStorage.short_url = obj.data.short_url;
          getLoggedInUser();
          
      }
    });
}

function login_process() {
    db.transaction(function(tx) {
        tx.executeSql('delete from OCEVENTS_qa');
    });
    
    var main_url = localStorage.url + 'user-profile/?gvm_json=1';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(obj) {
            $.each(obj.userQA, function(i, dataVal) {
                if (i != 0 && dataVal.question != undefined && dataVal.answer != undefined) {
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

    var main_url = localStorage.url + 'api/index.php/main/homepageSettings?XDEBUG_SESSION_START=PHPSTORM&event_id=' + localStorage.event_id;
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(obj) {
            if (obj.status == 'error') {
                alert(obj.message);
                window.location.href = "index.html";
            } else {
                 db.transaction(function(tx) {
                 tx.executeSql("SELECT * FROM OCEVENTS_events", [], function(tx, results) {
                  var len = results.rows.length;
                  //alert(len)
               if(len == 0)
               {
                   tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_events (id integer primary key autoincrement,event_id,user_id,title,description,logo,image, short_url)');
                   tx.executeSql("delete from OCEVENTS_events");                            
                         
                  $.each( obj.data._extra.userEvents, function( key, val ) {
                   
                              //document.write(val.event_id+'<br />');
                              if(val.event_id == localStorage.event_id)
                              {
                                  localStorage.event_id = val.event_id;
                                  localStorage.short_url = val.short_url;
                                  // alert(localStorage.short_url)
                                  //alert(localStorage.event_id)
                              }
                             
                              //db.transaction(function(tx) {
                                  tx.executeSql('INSERT INTO OCEVENTS_events (event_id,user_id,title,description,logo,image, short_url) VALUES ("' + val.event_id + '","' + val.user_id + '","' + val.title + '","' + val.description + '","' + val.logo + '","' + val.image + '","' + val.short_url + '")');
                             // });                
                      }); 
                }
                  });
                  });
            
                 
                   // alert(obj.data.type)         
                if (obj.data.type == 'content') {
                     //alert('here content')
                    db.transaction(function(tx) {

                        
                        tx.executeSql("delete from OCEVENTS_homepage");
                        tx.executeSql("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('','','" + localStorage.user_id + "','" + obj.data.content.main_title + "','" + obj.data.content.main_text + "','" + obj.data.content.main_link + "','" + obj.data.type + "')");
                        //alert("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('','','"+localStorage.user_id+"','"+obj.data.content.main_title+"','"+obj.data.content.main_text+"','"+obj.data.content.main_link+"','"+obj.data.type+"')");
                        //alert("SELECT * FROM OCEVENTS_homepage");

                    });
                    var DIR_Name = 'oc_photos';
                    var a = new DirManager();
                    a.create_r(DIR_Name, Log('created successfully'));
                    var b = new FileManager();
                    // alert(obj.data.main_logo_image.small_url);
                    // alert(obj.data.content.main_banner_image.medium_url);
                    if (obj.data.main_logo_image != null) {
                        var img_src = obj.data.main_logo_image.small_url;
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
                                    //alert(ImgFullUrl);
                                    db.transaction(function(tx) {
                                        tx.executeSql('update OCEVENTS_homepage set main_logo_small_image = "' + ImgFullUrl + '"');
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

                                        tx.executeSql('update OCEVENTS_homepage set main_banner_image = "' + BannerImgFullUrl + '"');

                                        window.location.href = "gamification.html";
                                    });
                                });
                            }
                        });
                    }

                    if (obj.data.content.main_banner_image == null && obj.data.main_logo_image == null) {
                        window.location.href = "gamification.html";
                    }

                } else if (obj.data.type == 'url') {
                   // alert('here url')
                    downloadLogoFile(obj.data.url, obj.data.type, obj.data.main_logo_image.small_url);

                }
                else if (obj.data.type == 'module') {
                    downloadmoduleLogoFile(obj.data.module, obj.data.type, obj.data.main_logo_image.small_url);                    
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

//function to download logo from module
function downloadmoduleLogoFile(url, type, img_src)
{   //document.write('<scr'+'ipt type="text/javascript" src="painlessfs.js" ></scr'+'ipt>'); 
    var DIR_Name = 'oc_photos';
   /* alert(url);
    alert(type);
    alert(img_src); */
    var a = new DirManager();
    a.create_r(DIR_Name, Log('created successfully'));
    var b = new FileManager();
    var image_name = getFileNameFromPath(img_src);
    var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;
    //alert(STR)
    jQuery.ajax({
        url: STR,
        dataType: "html",
        success: function(DtatURL) {
            b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {
                var img_uri = theFile.toURI();
               // alert(img_uri);
                db.transaction(function(tx) {

        tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id,main_logo_small_image,main_banner_image,main_title,main_text,main_link,type,iframe_url)');
        tx.executeSql("delete from OCEVENTS_homepage");
        tx.executeSql("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('"+img_uri+"','','','"+url+"','','','" + type + "')");
       //alert(url); 
        window.location.href = "gamification.html";

  });
            });
        }
    }); 
    
    
    
}

//function to download logo from server
function downloadLogoFile(url, type, img_src) {
   //document.write('<scr'+'ipt type="text/javascript" src="painlessfs.js" ></scr'+'ipt>'); 
    var DIR_Name = 'oc_photos';
   /* alert(url);
    alert(type);
    alert(img_src); */
    var a = new DirManager();
    a.create_r(DIR_Name, Log('created successfully'));
    var b = new FileManager();
    var image_name = getFileNameFromPath(img_src);
    var STR = server_url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;
    //alert(STR)
    jQuery.ajax({
        url: STR,
        dataType: "html",
        success: function(DtatURL) {
            b.download_file(DtatURL, DIR_Name + '/', image_name, function(theFile) {
                var img_uri = theFile.toURI();
               // alert(img_uri);
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
    var main_url = localStorage.url + page + '/?gvm_json=1&event_id=' + localStorage.event_id;
    db.transaction(function(tx) {

        
        tx.executeSql("delete from OCEVENTS_footerlinks");

        
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
        loadcommonthings(); isLoggedIn();        
        $(".notes-container").hide();
        $(".loading_agenda_items").show(); 
        importfooter('Add-note/-/'+localStorage.short_url+'-' + localStorage.event_id, 'notes'); 
        var main_url = localStorage.url + 'Add-note/-/'+localStorage.short_url+'-' + localStorage.event_id +'/?gvm_json=1';
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
                     remstr = ' <div class="clearfix"><a class="pull-right delete-note" href="javascript:removenote('+val.instance_id+')" data-url="/Add-note/-/'+localStorage.short_url+'-100041/delete/28"><i class="fa fa-times"></i>Remove</a></div>'; 
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
       
      var main_url = localStorage.url + 'Add-note/-/'+localStorage.short_url+'-'+localStorage.event_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
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
    var main_url = localStorage.url + 'Add-note/-/'+localStorage.short_url+'-' + localStorage.event_id +'/delete/'+id+'/?gvm_json=1';
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
        loadcommonthings(); isLoggedIn();        
        $(".seeker-game-container").hide();
        $(".loading_agenda_items").show(); 
        importfooter('seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id+'/'+ur, 'agenda'); 
        var main_url = localStorage.url + 'seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/' + ur + '/?gvm_json=1';
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
    var main_url = localStorage.url + 'seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/reset_seeker?gvm_json=1';

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
        loadcommonthings(); isLoggedIn();
        
        $(".seeker-game-container").hide(); 
          importfooter('seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');
        
        
        var main_url = localStorage.url + 'seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
              $('.show-hint').click(function()
              {
                var seeker_id = obj.currentFloormapInstance.seeker_session_a_i_id.value;
                var get_seeker_hint = 'get_seeker_hint';
                var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';
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
                     $('.seeker-description').append('<img src='+localStorage.url+'resources/files/images/'+obj.currentFloormapInstance.floormap_image.__extra.large_file_name+' />'); 
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
      var main_url = localStorage.url + 'seeker/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
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
        loadcommonthings(); isLoggedIn();
        $(".voting-page-container").hide();
        
        //alert('hi')
        importfooter('Add-vote/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = localStorage.url + 'Add-vote/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

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
    var main_url = localStorage.url + 'Add-vote/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/'+instance_id+'/?gvm_json=1';

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
        loadcommonthings(); isLoggedIn();
        $(".quiz-container").hide();
        
        //alert('hi')
        importfooter('Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

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
                      $('.quiz-question-container').prepend('<img src="'+localStorage.url+'resources/files/images/'+val.__extra.large_file_name+'" class="img-responsive" />')
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
        loadcommonthings(); isLoggedIn();
        $(".leaderboards-container").hide();
        
        //alert('hi')
        importfooter('Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id+'/scorecard', 'agenda');
                                    
        var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/scoreboard/?gvm_json=1';

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
    var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/reset_quiz/?gvm_json=1';

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
    var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

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
  var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

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
    var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

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
        loadcommonthings(); isLoggedIn();
        $(".questions-container").hide();
        
        //alert('hi')
        importfooter('Add-question/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = localStorage.url + 'Add-question/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

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
              var image_url = localStorage.url+'resources/gamification/img/avatar-placeholder.png';
              if(checkdefined(val.image) == "yes")
              {
                  image_url = localStorage.url+'resources/files/event/images/thumb_'+val.image+'.jpg';
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
    var main_url = localStorage.url + 'Add-question/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
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
  var main_url = localStorage.url + 'Add-question/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/?action=like&gvm_json=1&like='+like+'&c_id='+id;
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
        loadcommonthings(); isLoggedIn();
        $(".questions-container").hide();
        
        //alert('hi')
        importfooter('Add-comment/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/sort/timestamp/asc/?gvm_json=1';

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
              var image_url = localStorage.url+'resources/gamification/img/avatar-placeholder.png';
              if(checkdefined(val.image) == "yes")
              {
                  image_url = localStorage.url+'resources/files/event/images/thumb_'+val.image+'.jpg';
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
                   comment_image = '<div class="images-container clearfix"><div class="col-xs-6 col-md-4 col-lg-2 image-container"><span data-mfp-src="'+localStorage.url+'resources/files/images/'+val.images[0].large+'" class="mfp-image"><img alt="" src="'+localStorage.url+'resources/files/images/'+val.images[0].small+'" class="resize-img"></span></div></div>';
              }
              var comment_video = '';
              if(checkdefined(val.video_filename) == 'yes')
              {
                  comment_video = '<div style=background-image:url("'+ localStorage.url+'resources/files/videos/'+val.thumb_filename+'") class="video-item"><div class="video-wrapper"><div class="video-container"><div class="future-video video" style="display:block;" onclick=playvideo("' + localStorage.url+ 'resources/files/videos/' + val.video_filename + '");><img src="img/bigplay.png" class="video_comment" /></div></div></div></div>';
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
      var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/delete/'+instance_id+'/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
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
    
    if(localStorage.mime == 'video/mp4')
    {
       if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
          var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
      } else {
          var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.mp4';
      }
    }
    else
    {
    
      if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
          var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
      } else {
          var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.jpg';
      }
    }
    options.fileName = newfname;
   // alert(newfname);
    options.mimeType = localStorage.mime;
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
    var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
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
  var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
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
  var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/?action=like&gvm_json=1&like='+like+'&c_id='+id;
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
        tx.executeSql('delete from OCEVENTS_qa');
        tx.executeSql('delete from OCEVENTS_homepage');
        tx.executeSql('delete from OCEVENTS_teampoints');
        tx.executeSql('delete from OCEVENTS_yourteampoints');
        tx.executeSql('delete from OCEVENTS_footerlinks');
        tx.executeSql('delete from OCEVENTS_footermorelinks');
        tx.executeSql('delete from OCEVENTS_events');
        
    });
}

//Done this week:
//OCEM-1727
//OCEM-1728