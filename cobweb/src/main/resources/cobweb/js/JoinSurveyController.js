(function() {
  goog.provide('join_survey_controller');

  var module = angular.module('join_survey_controller', []);

  module.controller('JoinSurveyController', [
      '$http',
      '$attrs',
      '$scope',
      function($http, $attrs, $scope) {
        $scope.alreadyJoined = false;
        
        $scope.setGroup = function(groupName) {
          $scope.groupName = groupName;

          $http.get('xml.info?type=groups&_content_type=json').success(
              function(data) {
                angular.forEach(data.group, function(g){
                  if(g.name == $scope.groupName) {
                    $scope.alreadyJoined = true;
                  }
                });

              }).error(function(data) {
                //TODO show something errorly
                $scope.alreadyJoined = false;
          });
          
        };       

        $attrs.$observe('ngGroupname', $scope.setGroup);

        $scope.requestJoin = function() {
          $http.get('cobweb.survey.request?groupName=' + $scope.groupName).success(
              function(data) {
                $scope.alreadyJoined = true;

              }).error(function(data) {
          });
        }
      }

  ]);

})();
