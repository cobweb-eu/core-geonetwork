package org.fao.geonet.events.listeners;

import org.fao.geonet.events.md.MetadataUpdate;
import org.fao.geonet.repository.GroupRepository;
import org.fao.geonet.utils.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

//@Component
public class PCAPISecurity implements ApplicationListener<MetadataUpdate> {
    @Value("#{cobweb.PCAPI_URL}")
    private String PCAPI_URL;

    @Autowired
    private GroupRepository groupRepo;


    private org.fao.geonet.Logger log = Log.createLogger("cobweb");

    @Override
    public void onApplicationEvent(MetadataUpdate event) {
       
    }

}
