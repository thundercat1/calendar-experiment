var app = angular.module("app", ["firebase"]);
app.controller("AppCtrl", function($scope, $firebaseArray, $firebaseAuth) {
  var ref = new Firebase("https://calendar-experiment.firebaseio.com");
  $scope.timeSlots = $firebaseArray(ref.child('timeSlots'));
  $scope.hello="Hello!";
  $scope.currentDate = new Date();
  

var auth = $firebaseAuth(ref);
$scope.login = function(){
  console.log('attempting login');
  console.log(auth);
  auth.$authWithOAuthPopup("google").then(function(authData) {
    $scope.authData = ref.getAuth();
    console.log("Logged in as:", authData.uid);
    console.log("Authenticated successfully with payload:", authData);
  }).catch(function(error) {
    console.log("Authentication failed:", error);
  });
}

$scope.authData = ref.getAuth();

$scope.logout = function(){
  ref.unauth();
  $scope.authData = ref.getAuth();
}
//Automatically logout on refresh for dev purposes. REmove for production
$scope.logout();

  $scope.dateFromJSON = function(jsonDate){
    return(new Date(Date.parse(jsonDate)))
  }
  
  $scope.nearFuture = function(daysToInclude){
    return(function(timeSlot){
        JSONDate = timeSlot.time;
    	var day_length = 24*60*60*1000;
      var date = new Date(Date.parse(JSONDate))
      return (date > $scope.currentDate && 
        (date - $scope.currentDate)/day_length < daysToInclude)
    })
  }
  
  
  $scope.reserve = function(slot){
		slot.status = 'reserved';
	
          slot.user = $scope.authData.uid,
          slot.userName = $scope.authData.google.displayName
    $scope.timeSlots.$save(slot);
  }

  $scope.isOpen = function(slot){
    return (slot.status == 'open')
  }
  
  $scope.populateFirebase = function(){
  	var working_hours = function(){
     hours = [9,10,11,12,13,14,15,16];
     return(hours)
   };

   addTimeSlots = function(start_date, n){
     start_date.setMinutes(0);
     start_date.setSeconds(0);
     start_date.setMilliseconds(0);
     var hours = working_hours();
     slot = start_date;
     for (x=0;  x<n; x++) {
       for (i=0; i<hours.length; i++){
        slot.setHours(hours[i]);
        var timeSlotObj = {
          'time': slot.toJSON(),
          'status': 'open',
          };
        $scope.timeSlots.$add(timeSlotObj);
        $scope.timeSlots.$save(timeSlotObj);
        }
        s = new Date(slot);
        s.setDate(s.getDate()+1);
        slot = s;
      }
    }
   addTimeSlots(new Date(), 30);
}

})
