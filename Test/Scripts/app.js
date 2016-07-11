var app = angular.module('myApp', ['ui.grid', 'chart.js']);

app.service('numberService', ['$http', '$q', '$sce', numberService]);

/**
  * Random Number Data Service    
  * remote data service call(s).
  * 
  */
function numberService($http, $q, $sce) {

    // define interface
    var service = {
        numbers: [],
        getMaxNumbers: getMaxNumbers,
        capacity: 100, //Default to 100
        getLatestNumbers: getLatestNumbers,
        setCapacity: setCapacity
    };
    return service;

    //------------------Define service methods------------------//

    /**
    * Set max stories for Get 
    */
    function setCapacity(max) {
        service.capacity = max;
    }

    /**
     * Return stories
     */
    function getLatestNumbers() {
        return service.numbers;
    }

    /**
     * Get max stories based on the capacity
     */
    function getMaxNumbers() {
        
        //Empty sevice number array
        service.numbers = [];

        //Get random numbers 
        var def = $q.defer();
        $http.get('http://qrng.anu.edu.au/API/jsonI.php?length=' + service.capacity + '&type=uint8&size=6')
          .success(function (result) {
              service.numbers = result.data;
              def.resolve(result);
              console.log(result.length + ' random numbers retrieved.');
          })
          .error(function () {
              def.reject("Failed to retrieve numbers.");
          });
        return def.promise;
    }
}


//----------------Define Client Controller ---------------------------------//
app.controller('NumberController', function (numberService,$scope) {

    var self = this;
    
    //Set default values
    $scope.maxNumber = 100;
    $scope.numberArray = [];
    $scope.numberIndexArray = [];
    $scope.numberObjects = [];

    //---------- Set up the number chart -----------------------------//
    $scope.series = ['Value: '];

    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    $scope.options = {
        tooltips: {
            display: false
        },
        scales: {
            xAxes: [{
                display: false
            }],
            yAxes: [
              {
                  id: 'y-axis-1',
                  type: 'linear',
                  display: true,
                  position: 'left'
              }
            ]
        },
        colours: [{ // default
            "fillColor": "rgba(224, 108, 112, 1)",
            "strokeColor": "rgba(207,100,103,1)",
            "pointColor": "rgba(220,220,220,1)",
            "pointStrokeColor": "#fff",
            "pointHighlightFill": "#fff",
            "pointHighlightStroke": "rgba(151,187,205,0.8)"
        }]
    };
    //End Chart


    //Event handlerfor max number change
    $scope.maxNumberchange = function () {
        self.setLengthOfNumberArray($scope.maxNumber);
    };

    //Refresh
    self.refresh = function () {
        self.loadNumbers();
    };

    //Empty current numbers
    self.emptyNumbers = function () {
        $scope.numberArray = [];
        $scope.numberIndexArray = [];
        $scope.numberObjects = [];
    };

    //Update numbers
    self._updateNumberObject = function (numArray) {
        //Empty numbers
        self.emptyNumbers();

        for(var i = 0; i < numArray.length; i++) {
            var tempObj = {
                Index: i,
                Value: numArray[i]
            }

            $scope.numberIndexArray.push(tempObj.Index);
            $scope.numberArray.push(tempObj.Value);
            $scope.numberObjects.push(tempObj);
        }
        
    };

    //Load numbers from number service
    self.loadNumbers = function () {

        //Get News
        numberService.getMaxNumbers().then(function (data) {

            //Get new random numbers
            var numberArray = numberService.getLatestNumbers();
            //Update number objects
            self._updateNumberObject(numberArray);

            console.log(self.numberObjects);
            console.log('Random Numbers received!');
            
        }, function () {
            console.log('Numbers failed to load!');
        });

    };

    //Set the max length of number array
    self.setLengthOfNumberArray = function (num)
    {
        //Set service capacity
        numberService.setCapacity(num);

        //refresh the data source
        self.refresh();
    };
    
    //Start load numbers
    self.loadNumbers();
  
});


