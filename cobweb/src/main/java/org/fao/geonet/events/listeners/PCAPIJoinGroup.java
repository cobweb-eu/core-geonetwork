package org.fao.geonet.events.listeners;

import static org.fao.geonet.repository.specification.UserGroupSpecs.hasGroupId;
import static org.fao.geonet.repository.specification.UserGroupSpecs.hasProfile;
import static org.fao.geonet.repository.specification.UserGroupSpecs.hasUserId;

import java.io.IOException;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.fao.geonet.domain.Group;
import org.fao.geonet.domain.Profile;
import org.fao.geonet.domain.User;
import org.fao.geonet.domain.UserGroup;
import org.fao.geonet.events.user.GroupJoined;
import org.fao.geonet.repository.UserGroupRepository;
import org.fao.geonet.utils.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.data.jpa.domain.Specifications;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Warns PCAPI when a user has joined a survey. If the user joins as
 * coordinator, it also warns PCAPI.
 * 
 * @author delawen
 * 
 *
 */
@Component
public class PCAPIJoinGroup implements ApplicationListener<GroupJoined> {
    @Value("#{cobweb.PCAPI_URL}")
    private String PCAPI_URL;

    @Autowired
    private UserGroupRepository userGroupRepo;
    @PersistenceContext
    private EntityManager entityManager;

    private org.fao.geonet.Logger log = Log.createLogger("cobweb");

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onApplicationEvent(GroupJoined event) {

        User user = event.getUserGroup().getUser();
        Group group = event.getUserGroup().getGroup();

        List<UserGroup> userGroups = userGroupRepo.findAll(Specifications
                .where(hasGroupId(group.getId())).and(hasUserId(user.getId()))
                .and(hasProfile(Profile.UserAdmin)));

        boolean isCoordinator = userGroups.size() > 0;

        if (isCoordinator) {
            // We have to remove all previous coordinators and make them
            // normal reviewers
            userGroupRepo.deleteAll(Specifications
                    .where(hasGroupId(group.getId()))
                    .and(Specifications.not(hasUserId(user.getId())))
                    .and(hasProfile(Profile.UserAdmin)));
            entityManager.flush();
            entityManager.clear();

        }

        User coordinator = null;

        userGroups = userGroupRepo.findAll(Specifications.where(
                hasGroupId(group.getId())).and(hasProfile(Profile.UserAdmin)));

        if (userGroups.size() == 0) {
            log.error("Survey " + group.getName() + " corrupted!");
            log.error("Assign a coordinator as soon as possible!");
            log.error("User " + user.getUsername() + " can't join survey "
                    + group.getName());
        } else if (userGroups.size() > 1) {
            log.error("Survey " + group.getName() + " corrupted!");
            log.error("Assign a coordinator as soon as possible!");
            log.error("User " + user.getUsername() + " can't join survey "
                    + group.getName());
        } else {
            coordinator = userGroups.get(0).getUser();
        }

        if (coordinator != null) {
            String params = " " + user.getUsername() + " "
                    + coordinator.getUsername() + " JOIN";

            try {
                Process exec = Runtime.getRuntime().exec(PCAPI_URL + params);
                exec.waitFor();
                log.debug("Executed '" + PCAPI_URL + params + "' -> "
                        + exec.exitValue());
            } catch (IOException e) {
                log.error(e);
            } catch (InterruptedException e) {
                log.error(e);
            }
        }

        // if (isCoordinator) {
        // try {
        // URIBuilder builder = new URIBuilder(PCAPI_URL
        // + endpoint_coordinator);
        //
        // builder.setParameter("coordinator", user.getUsername());
        // builder.setParameter("action", "CHANGE_COORDINATOR");
        // builder.setParameter("survey", group.getName());
        // HttpGet httpGet = new HttpGet(builder.build());
        // resp = httpclient.execute(httpGet);
        // HttpEntity entity1 = resp.getEntity();
        //
        // EntityUtils.consume(entity1);
        // } catch (IOException e) {
        // log.error(e);
        // } catch (URISyntaxException e) {
        // log.error(e);
        // } finally {
        // try {
        // if (resp != null) {
        // resp.close();
        // }
        // } catch (IOException e) {
        // log.error(e);
        // }
        // }
        // }
        //
        // try {
        // if (httpclient != null) {
        // httpclient.close();
        // }
        // } catch (IOException e) {
        // log.error(e);
        // }
    }
}
