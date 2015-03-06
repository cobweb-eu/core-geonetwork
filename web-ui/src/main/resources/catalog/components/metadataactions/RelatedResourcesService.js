(function() {
  goog.provide('gn_relatedresources_service');

  var module = angular.module('gn_relatedresources_service', []);

  /**
   * Standarizes the way to handle resources. Given a type of resource, you get
   * an icon class and an action.
   *
   * To extend this, use the configure function. For example:
   *
   * $gnRelatedResources.configure({ "PDF" : { iconClass: "pdfClassIcon",
   * action: myCustomFunctionForPDF}, "XLS" : { iconClass: "xlsClassIcon",
   * action: myCustomFunctionForXLS}});
   *
   */
  module
      .service(
          'gnRelatedResources',
          [
        'gnMap',
        'gnOwsCapabilities',
        'gnSearchSettings',
        'ngeoDecorateLayer',
        'gnSearchLocation',
        function(gnMap, gnOwsCapabilities, gnSearchSettings, 
            ngeoDecorateLayer, gnSearchLocation) {

          this.configure = function(options) {
            angular.extend(this.map, options);
          };

          var addWMSToMap = function(link,uuid) {		  
			//see if a uuid is provided, this is the uuid of the source record
			if (!uuid) uuid="none";
			//a link can have a wms url directly in link.url or as a md.link (name||url|protocol)
			if (!link.url && link.link && link.link.split('|').length > 2) link.url = link.link.split('|')[2];
			if (!link.url || link.url == ""){
				alert('No WMS service to add');
				return;
			}
			//make sure the name param exists and is an array
		    if (!link.name || link.name == "") link.name = [uuid];
			if (!angular.isArray(link.name)) link.name = [link.name];
		  
              angular.forEach(link.name, function(name) {
                gnOwsCapabilities.getWMSCapabilities(link.url).then(
                   function(capObj) {
                     var layerInfo = gnOwsCapabilities.getLayerInfoFromCap(name, capObj, uuid);
					 if (layerinfo){ //layer found
                       gnMap.addWmsToMapFromCap(gnSearchSettings.viewerMap, layerInfo, capObj);
					 } else { //add service
					   gnMap.addOwsServiceToMap(link.url, 'WMS');
					 }
                   });
				   gnSearchLocation.setMap();
              });    
			
          };


          var addWMTSToMap = function(link,uuid) {
			//see if a uuid is provided, this is the uuid of the source record
			if (!uuid) uuid="none";
			//a link can have a wms url directly in link.url or as a md.link (name||url|protocol)
			if (!link.url && link.link && link.link.split('|').length > 2) link.url = link.link.split('|')[2];
			if (!link.url || link.url == ""){
				alert('No WMTS service to add');
				return;
			}
			//make sure the name param exists and is an array
		    if (!link.name || link.name == "") link.name = [uuid];
			if (!angular.isArray(link.name)) link.name = [link.name];
		  
              angular.forEach(link.name, function(name) {
                gnOwsCapabilities.getWMTSCapabilities(link.url).then(
                   function(capObj) {
                     var layerInfo = gnOwsCapabilities.getLayerInfoFromCap(name, capObj, uuid);
					 if (layerinfo){ //layer found
                       gnMap.addWmtsToMapFromCap(gnSearchSettings.viewerMap, layerInfo, capObj);
					 } else { //add service
					   gnMap.addOwsServiceToMap(link.url, 'WMTS');
					 }
                   });
				   gnSearchLocation.setMap();
              });    
			
          };

          var addWFSToMap = function(md) {
            //TODO open dialog to download features
            gnSearchLocation.setMap();
          };

          var addKMLToMap = function(md) {
            gnMap.addKmlToMap(md.name, md.url, gnSearchSettings.viewerMap);
            gnSearchLocation.setMap();
          };

          var openMd = function(md) {
            return window.location.hash = '#/metadata/' +
                (md.uuid || md['geonet:info'].uuid);
          };

          var openLink = function(link) {
            if (link.url.indexOf('http') == 0 ||
                link.url.indexOf('ftp') == 0) {
              return window.open(link.url, '_blank');
            } else {
              return window.location.assign(link.title);
            }
          };

          this.map = {
            'WMS' : {
              iconClass: 'fa-globe',
              label: 'addToMap',
              action: addWMSToMap
            },
            'WMTS' : {
              iconClass: 'fa-globe',
              label: 'addToMap',
              action: addWMTSToMap
            },
            'WFS' : {
              iconClass: 'fa-link',
              label: 'webserviceLink',
              action: openLink
            },
            'KML' : {
              iconClass: 'fa-globe',
              label: 'addToMap',
              action: addKMLToMap
            },
            'MDFCATS' : {
              iconClass: 'fa-table',
              label: 'openRecord',
              action: openMd
            },
            'MDFAMILY' : {
              iconClass: 'fa-sitemap',
              label: 'openRecord',
              action: openMd
            },
            'MDSIBLING' : {
              iconClass: 'fa-sign-out',
              label: 'openRecord',
              action: openMd
            },
            'MDSOURCE' : {
              iconClass: 'fa-sitemap fa-rotate-180',
              label: 'openRecord',
              action: openMd
            },
            'MD' : {
              iconClass: 'fa-file',
              label: 'openRecord',
              action: openMd
            },
            'LINKDOWNLOAD' : {
              iconClass: 'fa-download',
              label: 'download',
              action: openLink
            },
            'LINK' : {
              iconClass: 'fa-link',
              label: 'openPage',
              action: openLink
            },
            'DEFAULT' : {
              iconClass: 'fa-fw',
              label: 'openPage',
              action: openLink
            }
          };

          this.getClassIcon = function(type) {
            return this.map[type].iconClass ||
                this.map['DEFAULT'].iconClass;
          };

          this.getLabel = function(type) {
            return this.map[type].label ||
               this.map['DEFAULT'].label;
          };
          this.getAction = function(type) {
            return this.map[type].action || this.map['DEFAULT'].action;
          };

          this.doAction = function(type, parameters, uuid) {
            var f = this.getAction(type);
            f(parameters, uuid);
          };

          this.getType = function(resource) {
            if ((resource.protocol && resource.protocol.contains('WMS')) ||
                (resource.serviceType && resource.serviceType
                          .contains('WMS'))) {
              return 'WMS';
            } else if ((resource.protocol &&
                        resource.protocol.contains('WMTS')) ||
                (resource.serviceType && resource.serviceType
                    .contains('WMTS'))) {
              return 'WMTS';
            } else if ((resource.protocol && resource.protocol
                      .contains('WFS')) ||
               (resource.serviceType && resource.serviceType
                          .contains('WFS'))) {
              return 'WFS';
            } else if ((resource.protocol && resource.protocol
                      .contains('KML')) ||
               (resource.serviceType && resource.serviceType
                          .contains('KML'))) {
              return 'KML';
            } else if (resource.protocol &&
               resource.protocol.contains('DOWNLOAD')) {
              return 'LINKDOWNLOAD';
            } else if (resource.protocol &&
                    resource.protocol.contains('LINK')) {
              return 'LINK';
            } else if (resource['@type'] &&
                (resource['@type'] === 'parent' ||
                    resource['@type'] === 'children')) {
              return 'MDFAMILY';
            } else if (resource['@type'] &&
               (resource['@type'] === 'sibling')) {
              return 'MDSIBLING';
            } else if (resource['@type'] &&
               (resource['@type'] === 'sources')) {
              return 'MDSOURCE';
            } else if (resource['@type'] &&
               (resource['@type'] === 'associated' ||
               resource['@type'] === 'hasfeaturecat' ||
               resource['@type'] === 'datasets')) {
              return 'MD';
            } else if (resource['@type'] && resource['@type'] === 'fcats') {
              return 'MDFCATS';
            }

            return 'DEFAULT';
          };
        }
          ]);
})();
