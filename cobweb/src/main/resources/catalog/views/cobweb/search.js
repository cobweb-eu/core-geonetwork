(function() {

  goog.provide('gn_search_cobweb');

  goog.require('cookie_warning');
  goog.require('gn_mdactions_directive');
  goog.require('gn_related_directive');
  goog.require('gn_search_manager');
  goog.require('gn_search');
  goog.require('gn_search_cobweb_config');
  goog.require('gn_search_default_directive');
  goog.require('join_survey');  

  var module = angular.module('gn_search_cobweb',
      ['gn_search', 'gn_search_cobweb_config',
       'gn_search_default_directive', 'gn_related_directive',
       'cookie_warning', 'gn_mdactions_directive','join_survey']);


  module.controller('gnsSearchPopularController', [
    '$scope', 'gnSearchSettings',
    function($scope, gnSearchSettings) {
      $scope.searchObj = {
        permalink: false,
        params: {
          sortBy: 'popularity',
          from: 1,
          to: 9
        }
      };
    }]);


  module.controller('gnsSearchLatestController', [
    '$scope',
    function($scope) {
      $scope.searchObj = {
        permalink: false,
        params: {
          sortBy: 'changeDate',
          from: 1,
          to: 9
        }
      };
    }]);
	   
  /**
   * @ngdoc controller
   * @name gn_search_cobweb.controller:gnsCobweb
   *
   * @description
   * cobweb view root controller
   * its $scope inherits from gnSearchController scope.
   *
   */
  module.controller('gnsCobweb', [
    '$scope',
    '$location',
    'suggestService',
    '$http',
    '$translate',
    'gnUtilityService',
    'gnSearchSettings',
    'gnViewerSettings',
    'gnMap',
    'gnMdView',
    'gnMdViewObj',
    'gnWmsQueue',
    'gnSearchLocation',
    'gnOwsContextService',
    'hotkeys',
	  'Metadata',
	  'gnSearchManagerService',
    'gnGlobalSettings',
    function($scope, $location, suggestService, $http, $translate,
             gnUtilityService, gnSearchSettings, gnViewerSettings,
             gnMap, gnMdView, mdView, gnWmsQueue,
             gnSearchLocation, gnOwsContextService,
             hotkeys,Metadata,gnSearchManagerService, 
             gnGlobalSettings) {

      var viewerMap = gnSearchSettings.viewerMap;
      var searchMap = gnSearchSettings.searchMap;


      $scope.modelOptions = angular.copy(gnGlobalSettings.modelOptions);
      $scope.modelOptionsForm = angular.copy(gnGlobalSettings.modelOptions);
      $scope.gnWmsQueue = gnWmsQueue;
      $scope.$location = $location;
      $scope.activeTab = '/home';
      $scope.resultTemplate = gnSearchSettings.resultTemplate;
      $scope.location = gnSearchLocation;

	  //used for display surveys on homepage
	  $scope.searchResults = { records: [] };
	  $scope.surveys_split = [];

	  $scope.updateSurveys = function(any,order){
	    if (!any) any="";
		if (!order) order="popularity";
		
		  gnSearchManagerService.gnSearch({
		  _isTemplate: 'n',
		  _content_type:'json',
		  fast: 'index',
		  type: 'survey',
		  from: 1,
		  any: any,
		  sortBy:order,
		  to: 12
		}).then(function(data) {
		  var searchResults = { records: []};
		  for (var i = 0; i < data.metadata.length; i++) {
			searchResults.records.push(new Metadata(data.metadata[i]));
		  }
		  
		  $scope.searchResults = searchResults;
		  
		  var surveys_split = [];
		  for(i = 0; i < 4 && data.metadata.length > 3 * i; i++) {
			surveys_split[i] = [
									   new Metadata(data.metadata[3 * i]), 
									   new Metadata(data.metadata[3 * i + 1]), 
									   new Metadata(data.metadata[3 * i + 2])];
		  }
		  $scope.surveys_split=surveys_split;
		  
		});
	  }
	  
	  $scope.updateSurveys();
	  
      hotkeys.bindTo($scope)
        .add({
            combo: 'h',
            description: $translate('hotkeyHome'),
            callback: function(event) {
              $location.path('/home');
            }
          }).add({
            combo: 't',
            description: $translate('hotkeyFocusToSearch'),
            callback: function(event) {
              event.preventDefault();
              var anyField = $('#gn-any-field');
              if (anyField) {
                gnUtilityService.scrollTo();
                $location.path('/search');
                anyField.focus();
              }
            }
          }).add({
            combo: 'enter',
            description: $translate('hotkeySearchTheCatalog'),
            allowIn: 'INPUT',
            callback: function() {
              $location.search('tab=search');
            }
            //}).add({
            //  combo: 'r',
            //  description: $translate('hotkeyResetSearch'),
            //  allowIn: 'INPUT',
            //  callback: function () {
            //    $scope.resetSearch();
            //  }
          }).add({
            combo: 'm',
            description: $translate('hotkeyMap'),
            callback: function(event) {
              $location.path('/map');
            }
          });


      // TODO: Previous record should be stored on the client side
      $scope.mdView = mdView;
      gnMdView.initMdView();
      $scope.goToSearch = function (any) {
        $location.path('/search').search({'any': any});
      };
      $scope.canEdit = function(record) {
        // TODO: take catalog config for harvested records
        if (record && record['geonet:info'] &&
            record['geonet:info'].edit == 'true') {
          return true;
        }
        return false;
      };
      $scope.openRecord = function(index, md, records) {
        gnMdView.feedMd(index, md, records);
      };
      
      $http.get('admin.group.list?_content_type=json').
        success(function(data, status) {
          $scope.groups = {};
          angular.forEach(data, function(g) {
            $scope.groups[g.id] = g.name;
            });
        }).
        error(function(data, status) {
          $scope.groups = {};
        });

      $scope.closeRecord = function() {
        gnMdView.removeLocationUuid();
      };
      $scope.nextRecord = function() {
        // TODO: When last record of page reached, go to next page...
        $scope.openRecord(mdView.current.index + 1);
      };
      $scope.previousRecord = function() {
        $scope.openRecord(mdView.current.index - 1);
      };

      $scope.infoTabs = {
        lastRecords: {
          title: 'lastRecords',
          titleInfo: '',
          active: true
        },
        preferredRecords: {
          title: 'preferredRecords',
          titleInfo: '',
          active: false
        }};
		
	   $scope.iFrameUrl = function(){
	   if (mdView && mdView.current && mdView.current.record && mdView.current.record['geonet:info'].uuid && mdView.current.record.type=="survey"){
	    //if logged in
		var mapUrl = "/viewer";

		if (mdView.current.record['geonet:info'].isPublishedToAll != 'true'){
			mapUrl = "/secure/viewer"
		}
		
		return mapUrl + '/pcapi.html?sid='+mdView.current.record['geonet:info'].uuid+'&pos=' + mdView.current.record.getBoundsYX().replace(' ','');
	   
	     }
	   }
	  
      $scope.resultviewFns = {
        addMdLayerToMap: function (link, md) {

          if (gnMap.isLayerInMap(viewerMap,
              link.name, link.url)) {
            return;
          }
          gnMap.addWmsFromScratch(viewerMap, link.url, link.name, false, md);
      },
        addAllMdLayersToMap: function (layers, md) {
          angular.forEach(layers, function (layer) {
            $scope.resultviewFns.addMdLayerToMap(layer, md);
          });
        },
        loadMap: function (map, md) {
          gnOwsContextService.loadContextFromUrl(map.url, viewerMap);
        }
      };

      // Manage route at start and on $location change
      if (!$location.path()) {
        $location.path('/home');
      }
      $scope.activeTab = $location.path().
          match(/^(\/[a-zA-Z0-9]*)($|\/.*)/)[1];

      $scope.$on('$locationChangeSuccess', function(next, current) {
        $scope.activeTab = $location.path().
            match(/^(\/[a-zA-Z0-9]*)($|\/.*)/)[1];

        if (gnSearchLocation.isSearch() && (!angular.isArray(
            searchMap.getSize()) || searchMap.getSize().indexOf(0) >= 0)) {
          setTimeout(function() {
            searchMap.updateSize();

            // TODO: load custom context to the search map
            //gnOwsContextService.loadContextFromUrl(
            //  gnViewerSettings.defaultContext,
            //  searchMap);

          }, 0);
        }
        if (gnSearchLocation.isMap() && (!angular.isArray(
            viewerMap.getSize()) || viewerMap.getSize().indexOf(0) >= 0)) {
          setTimeout(function() {
            viewerMap.updateSize();
          }, 0);
        }
      });

      angular.extend($scope.searchObj, {
        advancedMode: false,
        from: 1,
        to: 30,
        viewerMap: viewerMap,
        searchMap: searchMap
      }, gnSearchSettings.sortbyDefault);

    }]);


})();
