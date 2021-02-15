//https://github.com/petermetz/cordova-plugin-ibeacon

// History of enter/exit events.
var mRegionEvents = [];

// Nearest ranged beacon.
var mNearestBeacon = null; 

// Timer that displays nearby beacons.
var mNearestBeacons = null;

// Timer that displays nearby beacons.
var mNearestBeaconTimer = null;

// Inteval in second to check nearby beacons.
var mNearestBeaconInterval = 0.5;

// Background notification id counter.
var mNotificationId = 0;

// Show local notifications if app is in background
var mNotifications = false;

//save current nearest beacon
var current_beacon_id = null;
var beacon_id=null;

var current_beacon_time = 0;

var beacon_done = [];

// Mapping of region event state names.
// These are used in the event display string.
var mRegionStateNames ={
	'CLRegionStateInside': 'Enter',
	'CLRegionStateOutside': 'Exit'
};

function beaconStart(){
	
	startMonitoringAndRanging();
	startNearestBeaconTimer();
	
	//Auto enable bluetooth - Android only?
	cordova.plugins.locationManager.isBluetoothEnabled()
    .then(function(isEnabled){
        //console.log("isEnabled: " + isEnabled);
        if (isEnabled) {
            //cordova.plugins.locationManager.disableBluetooth();
        } else {
            cordova.plugins.locationManager.enableBluetooth();        
        }
    })
    .fail(function(e){
    	//console.error(e); 
    }).done();
	
	//displayRegionEvents(); //display enter / exit beacon
}

function beaconStop(){
	stopNearestBeaconDisplayTimer();
}

function startNearestBeaconTimer(){
	if(mNearestBeaconTimer) clearInterval(mNearestBeaconTimer);
	mNearestBeaconTimer = setInterval(nearestBeacon, mNearestBeaconInterval*1000); //displayNearestBeacon
}

function stopNearestBeaconDisplayTimer()
{
	clearInterval(mNearestBeaconTimer);
	mNearestBeaconTimer = null;
}

function startMonitoringAndRanging()
{
	function onDidDetermineStateForRegion(result){
		saveRegionEvent(result.state, result.region.identifier);
		//ios does not work in background
		//displayRecentRegionEvent();
	}
	function onDidRangeBeaconsInRegion(result){
		updateNearestBeacon(result.beacons);
	}

	function onError(errorMessage){
		console.log('Monitoring beacons did fail: ' + errorMessage);
	}

	// Request permission from user to access location info.

	// required in iOS 8+
	//cordova.plugins.locationManager.requestWhenInUseAuthorization();
	//cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
	// or cordova.plugins.locationManager.requestAlwaysAuthorization()
	
	//cordova.plugins.locationManager.requestAlwaysAuthorization();
	//cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
	cordova.plugins.locationManager.requestAlwaysAuthorization();

	// Create delegate object that holds beacon callback functions.
	var delegate = new cordova.plugins.locationManager.Delegate();
	cordova.plugins.locationManager.setDelegate(delegate);

	// Set delegate functions.
	delegate.didDetermineStateForRegion = onDidDetermineStateForRegion;
	delegate.didRangeBeaconsInRegion = onDidRangeBeaconsInRegion;

	// Start monitoring and ranging beacons.
	//console.log('startMonitoringAndRanging '+ JSON.stringify(app_beacons));
	startMonitoringAndRangingRegions(app_beacons, onError);
}

function startMonitoringAndRangingRegions(regions, errorCallback)
{
	// Start monitoring and ranging regions.
	for (var i in regions){
		console.log('startMonitoringAndRangingRegions'+regions[i]);
		startMonitoringAndRangingRegion(regions[i], errorCallback);
	}
}

function startMonitoringAndRangingRegion(region, errorCallback){	
	console.log('id= '+region.id+ ' uuid= ' +region.uuid + ' major=' + region.major+ ' minor=' +region.minor);
	// Create a region object.
	var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
		region.id,
		region.uuid,
		region.major,
		region.minor);
	
	// Start ranging.
	cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
		.fail(errorCallback)
		.done();

	// Start monitoring.
	cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
		.fail(errorCallback)
		.done();
}

function saveRegionEvent(eventType, regionId){
	// Save event.
	mRegionEvents.push(
	{
		type: eventType,
		time: getTimeNow(),
		regionId: regionId
	});

	// Truncate if more than ten entries.
	if (mRegionEvents.length > 10){
		mRegionEvents.shift();
	}
}

function getBeaconId(beacon){
	return (beacon.uuid + ':' + beacon.major + ':' + beacon.minor).toLowerCase();
}

function isSameBeacon(beacon1, beacon2){
	return getBeaconId(beacon1) == getBeaconId(beacon2);
}

function isNearerThan(beacon1, beacon2){
	return beacon1.accuracy > 0
		&& beacon2.accuracy > 0
		&& beacon1.accuracy < beacon2.accuracy;
}

function updateNearestBeacon(beacons){
	for (var i = 0; i < beacons.length; ++i){
		var beacon = beacons[i];
		if (!mNearestBeacon){
			mNearestBeacon = beacon;
		}
		else{
			if (isSameBeacon(beacon, mNearestBeacon) ||
				isNearerThan(beacon, mNearestBeacon)){
				mNearestBeacon = beacon;
			}
		}
	}
}

function nearestBeacon(){
	//checks every second
	if (!mNearestBeacon) { return; }

	beacon_id = getBeaconId(mNearestBeacon);
	if (!current_beacon_id) current_beacon_id=beacon_id;
	//same beacon and not allready triggered?
	if(beacon_id == current_beacon_id && !beacon_done.includes(beacon_id)){		
		var current_beacon_props = app_beacons.find(o => o.beacon_id == beacon_id);
		/*		
		$.each(app_beacons, function(key, value){
			//$('#events').append(value.beacon_id +'=='+ beacon_id +' <br />');
			if(value.beacon_id == beacon_id){
				current_beacon_props=app_beacons[key];
			//	$('#events').append('[['+JSON.stringify(current_beacon_props, null, 2)+']]');				
			//	return false;
			}
		});
		*/

		if(typeof current_beacon_props == 'object'){
			var beacon_range_min = current_beacon_props['range_min'];
			var beacon_range_max = current_beacon_props['range_max'];
			var beacon_range_time = current_beacon_props['range_time'];

			if(beacon_range_min>=0 && beacon_range_max>=0 && beacon_range_time>=0){
				if(mNearestBeacon.accuracy>=beacon_range_min && mNearestBeacon.accuracy<=beacon_range_max){
					current_beacon_time+=mNearestBeaconInterval; //1 second interval
					if(current_beacon_time >= beacon_range_time){
						beacon_done.push(current_beacon_id);						
						
						if (app_in_background && typeof window.plugins.notification.local !== "undefined"){
							cordova.plugins.notification.local.schedule({
								//id: ++mNotificationId,
								title:'Zeggut',
								text:current_beacon_props['name'],
								icon: current_beacon_props['image'],								
								foreground:true
							});
						}

						alert(current_beacon_props['name']);						

						$.ajax({
							type: "POST",
							url: $siteUrl+"json/update.php",
							data: {'cmd':'beacon_activation', 'beacon_id': beacon_id, 'beacon_time':current_beacon_time, 'beacon_distance':mNearestBeacon.accuracy, 'app_id': app_id, 'user_id': user_id, 'user_token': user_token, 'app_version': app_version, 'device_id': device_id, 'device_model': device_model, 'device_platform': device_platform, 'device_version': device_version},
							dataType: "json"
						}).done(function(result){			
							app_reload();
							current_beacon_time=0;
							if(navigator.vibrate) //This returns false when there's no user interaction // press
								navigator.vibrate(1500);

						}).fail(function(jqXHR, textStatus){
						});
					}
				}else{
					current_beacon_time = 0;
					console.log('Reset current_beacon_time');
				}
			}
		}else{
			console.log('!current_beacon_props');
		}

	}else{
		current_beacon_id = beacon_id;
		current_beacon_time = 0;
	}
}

function displayNearestBeacon(){
	//checks every second

	if (!mNearestBeacon) { return; }

	// Clear element.
	$('#beacon').empty();

	// Update element.
	var element = $(
		'<li>'
		+	'<strong>Nearest Beacon</strong><br />'
		+	'UUID: ' + mNearestBeacon.uuid + '<br />'
		+	'Major: ' + mNearestBeacon.major + '<br />'
		+	'Minor: ' + mNearestBeacon.minor + '<br />'
		+	'Proximity: ' + mNearestBeacon.proximity + '<br />'
		+	'Distance: ' + mNearestBeacon.accuracy + '<br />'
		+	'RSSI: ' + mNearestBeacon.rssi + '<br />'
		+ '</li>'
		);
	$('#beacon').append(element);
}

function displayRecentRegionEvent(){
	//if (app_in_background){
	//	nearestBeacon();
		/*
			// Set notification title.
			var event = mRegionEvents[mRegionEvents.length - 1];
			if (!event) { return; }
			var title = getEventDisplayString(event);

			// Create notification.
			cordova.plugins.notification.local.schedule({
				id: ++mNotificationId,
				title: title });
		*/
	//}
	//else
	//{
		//displayRegionEvents();
	//}
	
}

function displayRegionEvents(){
	/*
	// Clear list.
	$('#events').empty();

	// Update list.
	for (var i = mRegionEvents.length - 1; i >= 0; --i)
	{
		var event = mRegionEvents[i];
		var title = getEventDisplayString(event);
		var element = $(
			'<li>'
			+ '<strong>' + title + '</strong>'
			+ '</li>'
			);
		$('#events').append(element);
	}

	// If the list is empty display a help text.
	if (mRegionEvents.length <= 0)
	{
		var element = $(
			'<li>'
			+ '<strong>'
			+	'Waiting for region events, please move into or out of a beacon region.'
			+ '</strong>'
			+ '</li>'
			);
		$('#events').append(element);
	}

	*/
}

function getEventDisplayString(event)
{
	var eventBeacon = app_beacons.find(o => o.id === event.regionId)
	var eventDisplayName = (typeof eventBeacon == 'object')?eventBeacon.name:'';
	return event.time + ': '
		+ mRegionStateNames[event.type] + ' ';
		+ eventDisplayName;
}

function getTimeNow()
{
	function pad(n)
	{
		return (n < 10) ? '0' + n : n;
	}

	function format(h, m, s)
	{
		return pad(h) + ':' + pad(m)  + ':' + pad(s);
	}

	var d = new Date();
	return format(d.getHours(), d.getMinutes(), d.getSeconds());
}