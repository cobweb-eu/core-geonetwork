(function() {

  goog.provide('gn_search_controller');
  
  goog.require('gn_search_manager');
  goog.require('gn_searchsuggestion_service');
  
  goog.require('gn_home_service');
  
  goog.require('join_survey');
  
  var module = angular.module('gn_search_controller',[
    'ui.bootstrap.typeahead',
    'gn_searchsuggestion_service',
    'gn_home_service',
    'gn_search_manager',
    'ngRoute',
    'join_survey'
  ]);

  
	//Temporal solution until we have the final gn3 solution for md view


	module.controller("MetadataViewController", 
			['$scope',
			 '$http',
			 'gnSearchManagerService',
             'homeService',
         	 '$routeParams',
			function($scope, $http, gnSearchManagerService, homeService, $routeParams) {
		 
		 if ($routeParams.uuid!=''){
		 gnSearchManagerService.gnSearch({
	            _uuid: $routeParams.uuid,
	            _isTemplate: 'y or n or s',
	            fast: 'index'
	          }).then(function(data) {
	            $scope.metadataFound = data.count !== '0';
	            $scope.metadataNotFoundId = $routeParams.id;
	            $scope.permalink = window.location.href;

	            $scope.mdSchema = data.metadata[0]['geonet:info'].schema;
	            $scope.groupOwner = data.metadata[0].groupOwner;
	            $scope.mdTitle = data.metadata[0].title ||
	                data.metadata[0].defaultTitle;
	            $scope.md = homeService.extract(data.metadata[0]);

		  // now get all group list
		  $http.get('admin.group.list?_content_type=json').
		  success(function(data, status, headers, config) {	

		  if (data){
			   $scope.groups = data;
			   
			   angular.forEach($scope.groups, function(group, key) 
			   	{ 
			   	if(group["id"] == $scope.md.groupOwner) 
			   		$scope.md.groupName = group["name"];
			   	});
			}
		  }).
		  error(function(data, status, headers, config) {
			console.log("error groups: "+ status);
		  });
	   
		$scope.relations = [];
	    // now get relations of this md
	    $http.get('xml.relation@json?type=service|children|related|parent|dataset&fast=false&uuid='+$scope.md.geonet.uuid).
	    success(function(data, status, headers, config) {	
		
	  if (data.relation){
		if (!angular.isArray(data.relation)) data.relation = [data.relation];
		for (i=0;i<data.relation.length;i++){
			//if type=service, then add the url
			if (data.relation[i].metadata.type && data.relation[i].metadata.type == 'service'){
				try {
					var link = data.relation[i].metadata.link.split("|");
					if (link[3].toUpperCase().indexOf('WMS')>0){
						if (!$scope.md) $scope.md = {};
						$scope.md.wmsLayer = {url:link[2]};
					}

				} catch (e) {  }
			}
			$scope.relations.push(data.relation[i].metadata);
		}
		}
	  }).
	  error(function(data, status, headers, config) {
		console.log("error relations: "+ status);
	  });
	   
	    $scope.tabToggle("md_container");
		
	  });
	 };
	}]);
	module.config([ '$routeProvider', function($routeProvider) {
		$routeProvider.when('/mdView=:uuid', {
			templateUrl : '../../catalog/templates/search/community/detail.html',
			controller : 'MetadataViewController'
		}).otherwise({
			redirectTo : '/'
		});
	} ]);
	// End of temporal solution. Remove also templates associated to this
  /**
	 * Main search controller attached to the first element of the included html
	 * file from the base-layout.xsl output.
	 */
  module.controller('GnSearchController', [
    '$scope',
	'$http',
    'suggestService',
	'gnOwsCapabilities',
	'gnMap',
	'$route',
	'homeService',
    'gnSearchSettings',
    function($scope, $http, suggestService, gnOwsCapabilities, gnMap, $route, homeService, gnSearchSettings) {

      /** Object to be shared through directives and controllers */
      $scope.searchObj = {
        params: {},
        permalink: true 
      };

		$scope.getIcon = function(type){
 
 
		   var icon = "fa fa-file";
		   try {
		   switch (type){
		   case "fieldSession":  icon="fa fa-calendar";  break;
		   case "dataset":  icon="fa fa-download";  break;
		   case "service":  icon="fa fa-cog";  break;
		   case "survey":  icon="fa fa-sitemap";  break;
		   case "software": icon="fa fa-android";  break;
		   case "sensor":  icon="fa fa-mobile-phone";  break;
		   case "map":  icon="fa fa-globe";  break;
		   }
		   } catch (e){}
 
		   return icon;
 }
	  
	  $scope.tabToggle = function(tab) {
		var target = "#" + tab;
		// hide all tabs
		$(".gntab").not(target).hide();
		// if target not available, load it
		$(target).show();
		if (tab=='map_container'){
			$("#siteBanner").hide();
			gnSearchSettings.viewerMap.updateSize();
		} else $("#siteBanner").show();
	}
	  
	  $scope.addToMap = function(url,name,id, source) {
	 
		gnOwsCapabilities.getCapabilities(url).then(function(capObj) {
		try {
		  var layerInfo;
		  if (name && name != ''){
			layerInfo = gnOwsCapabilities.getLayerInfoFromCap(name, capObj);
		  }
		  if (!layerInfo && id && id != ''){
			layerInfo = gnOwsCapabilities.getLayerInfoFromCapById(id, capObj);
		  }
		  //if (!layerInfo && source && source != ''){ //some use 'source' as identifier in capabilities
		//	layerInfo = gnOwsCapabilities.getLayerInfoFromCapById(source, capObj);
		//	
		//  }
		  if (layerInfo){
			$scope.tabToggle('map_container');
		    gnMap.addWmsToMapFromCap(gnSearchSettings.viewerMap, layerInfo);
		    gnSearchSettings.viewerMap.updateSize();
		  } else {
			alert('Layer not found'); //todo: present a dropdown with available layers, so a user can choose a layer to display
		  }
		  } catch (e) { 
			alert('Error while retrieving layer'); }
		});
	  };
		
	  $scope.authorise = function(level,profile) {
		  // loop over profiles, if object-level matches before user-level
			// matches, then the user is not authorised
		  var authorised = false;
		  if(profile) {
		    profile = profile.toUpperCase();
		  }
		  if(level) {
		    level = level.toUpperCase();
		  }
		  try{
		  if ($scope.info.env.node=='public') return false;
		  } catch (e) {}
		  var profiles=["ADMINISTRATOR","USERADMIN",
		                "REVIEWER","EDITOR",
		                "REGISTEREDUSER","GUEST"];
			  for (var u = 0;u<profiles.length;u++){
				if (profile==profiles[u]) authorised = true;
				if (level==profiles[u]) break;
			  }
		  return authorised;
	  }

	$scope.surveysOrder = "relevance";
	  
	  $scope.doSurveys = function(){
		  var sb = "relevance";
		  if ($("#ddSort") && $("#ddSort").val() !='') sb=$("#ddSort").val();
		  var tb = "";
		  if ($("#tbSearch")) tb="any="+$("#tbSearch").val();
		  homeService.getMD($scope,'surveys',tb,'survey',25,sb,'desc');
	  }
	  
	  $scope.surveys = [];
	  homeService.getMD($scope,'surveys','','survey',25,'relevance','desc');
	  
	  $scope.leaderFrom = 1;	
	  $scope.doLeader = function(direction){ 
		 var nxt = 3;
		 if (direction && direction=='prev') nxt = -3
		 homeService.getMD($scope,'leader','','survey',3,'popularity','desc',$scope.leaderFrom+nxt);
	 }

	  $scope.leader = [];
	  homeService.getMD($scope,'leader','','survey',3,'popularity','desc');
	  
	  //$scope.popular = [];
	  //homeService.getMD($scope,'popular','','',7,'relevance','desc');
	  
	  //$scope.recent = [];
	  //homeService.getMD($scope,'recent','','',7,'changeDate','desc');
	  
	  $scope.events = [];
	  homeService.getMD($scope,'events','','fieldSession',7,'changeDate','asc'); // should
																					// add
																					// where
																					// >
																					// today,
																					// soonest
																					// first

	  $scope.layout = 'community';

	  $scope.relations = [];

	  $scope.md={};
	  	  
      /** Facets configuration */
      $scope.facetsConfig = gnSearchSettings.facetsConfig;

      /* Pagination configuration */
      $scope.paginationInfo = gnSearchSettings.paginationInfo;

      /* Default result view template */
      $scope.resultTemplate = gnSearchSettings.resultViewTpls[1].tplUrl;

      $scope.getAnySuggestions = function(val) {
        return suggestService.getAnySuggestions(val);
      };

      $scope.reloadPage=$route.reload();
      
      $http.get('info@json?type=site').
	  success(function(data, status, headers, config) {	
		  if (data.info){
			   $scope.info = data.info;
		  }
	  }).
	  error(function(data, status, headers, config) {
	  });

    }]);

})();
