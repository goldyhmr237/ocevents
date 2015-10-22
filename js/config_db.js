//navigator.openDatabase = window.openDatabase = DroidDB_openDatabase;
//window.droiddb = new DroidDB();
var db = window.openDatabase('OCEVENTS', '1.0', 'OCEVENTS', 2 * 1024 * 1024);
var server_url = 'http://beta.oceventmanager.com/';