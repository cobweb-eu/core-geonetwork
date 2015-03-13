//=============================================================================
//===   Copyright (C) 2001-2013 Food and Agriculture Organization of the
//===   United Nations (FAO-UN), United Nations World Food Programme (WFP)
//===   and United Nations Environment Programme (UNEP)
//===
//===   This program is free software; you can redistribute it and/or modify
//===   it under the terms of the GNU General Public License as published by
//===   the Free Software Foundation; either version 2 of the License, or (at
//===   your option) any later version.
//===
//===   This program is distributed in the hope that it will be useful, but
//===   WITHOUT ANY WARRANTY; without even the implied warranty of
//===   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
//===   General Public License for more details.
//===
//===   You should have received a copy of the GNU General Public License
//===   along with this program; if not, write to the Free Software
//===   Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
//===
//===   Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
//===   Rome - Italy. email: geonetwork@osgeo.org
//==============================================================================
package org.fao.geonet.guiservices.csw.virtual;

import jeeves.server.JeevesEngine;
import org.fao.geonet.constants.Params;
import org.fao.geonet.domain.Service;
import org.fao.geonet.domain.responses.OkResponse;
import org.fao.geonet.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;


/**
 * Update the virtual CSW server informations
 */

@Controller("admin.config.virtualcsw.update")
public class Update {

    @Autowired
    private ConfigurableApplicationContext jeevesApplicationContext;

    @Autowired
    private ServiceRepository serviceRepository;

    private static String[] noneFilterParameters = {
            Params.ID,
            Params.OPERATION,
            Params.SERVICENAME,
            Params.CLASSNAME,
            Params.SERVICEDESCRIPTION,
            "_content_type"
    };

    @RequestMapping(value = "/{lang}/admin.config.virtualcsw.update", produces = {
            MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public @ResponseBody
    OkResponse exec(@RequestParam String operation,
                 @RequestParam(Params.ID)  String serviceId,
                 @RequestParam(Params.SERVICENAME) String serviceName,
                 @RequestParam(Params.CLASSNAME) String className,
                 @RequestParam(value=Params.SERVICEDESCRIPTION, defaultValue="", required=false) String serviceDescription,
                 @RequestParam Map<String, String> filters
                 )
            throws Exception {

        for (String p : noneFilterParameters) {
            filters.remove(p);
        }

        if (operation.equals(Params.Operation.NEWSERVICE)) {
            Service service = serviceRepository.findOneByName(serviceName);

            if (service != null) {
                throw new IllegalArgumentException("Service with name "
                        + serviceName + " already exists");
            }

            service = new org.fao.geonet.domain.Service();
            service.setDescription(serviceDescription);
            service.setClassName(className);
            service.setName(serviceName);


            for (Map.Entry<String, String> filter : filters.entrySet()) {
                if (filter.getValue() != null && !filter.getValue().equals("")) {
                    service.getParameters().put(filter.getKey(), filter.getValue());
                }
            }
            serviceRepository.save(service);
            serviceId = String.valueOf(service.getId());
        } else if (operation.equals(Params.Operation.UPDATESERVICE)) {
            final Service service = serviceRepository.findOne(Integer.valueOf(serviceId));
            service.setClassName(className);
            service.setName(serviceName);
            service.setDescription(serviceDescription);
            service.getParameters().clear();
            for (Map.Entry<String, String> filter : filters.entrySet()) {
                service.getParameters().put(filter.getKey(), filter.getValue());
            }

            serviceRepository.save(service);
        }

        // launching the service on the fly
        jeevesApplicationContext.getBean(JeevesEngine.class).loadConfigDB(jeevesApplicationContext, Integer.valueOf(serviceId));

        return new OkResponse();
    }
}