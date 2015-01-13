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
import org.fao.geonet.events.user.UserDeleted;
import org.fao.geonet.utils.Log;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;

/**
 * Warns PCAPI when a user is removed.
 * 
 * @author delawen
 * 
 *
 */
public class PCAPIUserRemoved implements ApplicationListener<UserDeleted> {
    @Value("#{cobweb.PCAPI_URL}")
    private String PCAPI_URL;

    // TODO
    private String endpoint = "/";

    private org.fao.geonet.Logger log = Log.createLogger("cobweb");

    @Override
    public void onApplicationEvent(UserDeleted event) {
        CloseableHttpClient httpclient = HttpClients.createDefault();

        CloseableHttpResponse resp = null;
        try {
            URIBuilder builder = new URIBuilder(PCAPI_URL + endpoint);

            builder.setParameter("uuid", event.getUser().getUsername());
            builder.setParameter("action", "REMOVE");

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
