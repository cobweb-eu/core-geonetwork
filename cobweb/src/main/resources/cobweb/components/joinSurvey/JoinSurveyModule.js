(function() {
	goog.provide('join_survey');

	goog.require('join_survey_controller');
	goog.require('join_survey_directive');

	var module = angular.module('join_survey', [
			'join_survey_controller', 'join_survey_directive' ]);

})();
