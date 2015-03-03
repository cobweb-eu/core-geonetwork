(function() {
	goog.provide('join_survey_directive');

	var module = angular.module('join_survey_directive', []);

	  module.directive('joinsurveybutton',
	       function() {
	         return {
	           restrict: 'AE',
	           replace: true,
	           templateUrl: '../../cobweb/components/joinSurvey/partials/joinSurveyButton.html'
	         };
	       });

})();