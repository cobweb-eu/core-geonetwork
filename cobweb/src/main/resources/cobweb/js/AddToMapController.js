(function() {
  goog.provide('add_to_map_controller');

  goog.require('gn_mdview_service');

  var module = angular.module('add_to_map_controller', []);

  module.controller('AddToMapController', [
      '$http', '$attrs', '$scope', 'gnMdView',
      'Metadata', 'gnSearchManagerService',
      function($http, $attrs, $scope, gnMdView,
          Metadata, gnSearchManagerService) {

        $scope.$watch($attrs, function() {
          gnSearchManagerService.gnSearch({
            uuid : $attrs.uuid,
            fast : 'index',
            _content_type : 'json'
          }).then(function(data) {
            angular.forEach(data.metadata, function(md){
              md = new Metadata(md);
              $scope.links = md.getLinksByType('OGC', 'kml');
            });

          });
        });
      }
  ]);

})();
