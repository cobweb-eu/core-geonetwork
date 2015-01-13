package org.fao.geonet.events.listeners;

import java.io.IOException;
import java.net.URISyntaxException;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.fao.geonet.domain.Group;
import org.fao.geonet.events.md.MetadataUpdate;
import org.fao.geonet.repository.GroupRepository;
import org.fao.geonet.utils.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class PCAPISecurity implements ApplicationListener<MetadataUpdate> {
    @Value("#{cobweb.PCAPI_URL}")
    private String PCAPI_URL;

    @Autowired
    private GroupRepository groupRepo;

    // TODO
    private String endpoint = "/";

    private org.fao.geonet.Logger log = Log.createLogger("cobweb");

    @Override
    public void onApplicationEvent(MetadataUpdate event) {
        CloseableHttpClient httpclient = HttpClients.createDefault();

        CloseableHttpResponse resp = null;
        try {
            URIBuilder builder = new URIBuilder(PCAPI_URL + endpoint);
            Integer groupId = event.getMd().getSourceInfo().getGroupOwner();
            Group g = groupRepo.findOne(groupId);
            builder.setParameter("survey", g.getName());
            builder.setParameter("action", "JOIN");

            // TODO
            // builder.setParameter("coordinator",
            // event.getUserGroup().getUser()
            // .getUsername());
            HttpGet httpGet = new HttpGet(builder.build());
            resp = httpclient.execute(httpGet);
            HttpEntity entity1 = resp.getEntity();

            EntityUtils.consume(entity1);
        } catch (IOException e) {
            log.error(e);
        } catch (URISyntaxException e) {
            log.error(e);
        } finally {
            try {
                if (resp != null) {
                    resp.close();
                }
            } catch (IOException e) {
                log.error(e);
            }
            try {
                if (httpclient != null) {
                    httpclient.close();
                }
            } catch (IOException e) {
                log.error(e);
            }
        }
    }

}
