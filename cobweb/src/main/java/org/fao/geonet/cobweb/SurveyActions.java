package org.fao.geonet.cobweb;

import javax.servlet.http.HttpSession;

import jeeves.services.ReadWriteController;

import org.fao.geonet.domain.Group;
import org.fao.geonet.domain.Profile;
import org.fao.geonet.domain.User;
import org.fao.geonet.domain.UserGroup;
import org.fao.geonet.domain.UserGroupId;
import org.fao.geonet.repository.GroupRepository;
import org.fao.geonet.repository.UserGroupRepository;
import org.fao.geonet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Cobweb actions for surveys: join, reject, etc...
 */

@Controller("cobweb.survey")
@ReadWriteController
public class SurveyActions {

    @Autowired
    private UserGroupRepository userGroupRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ApplicationContext applicationContext;

    @RequestMapping(value = {"/{lang}/cobweb.survey.request"}, produces = {
            MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public @ResponseBody String request(HttpSession session,
            @RequestParam String groupName) {
        
        Authentication auth = SecurityContextHolder.getContext()
                .getAuthentication();
        final String username = auth.getName();
        final User user = userRepository.findOneByUsername(username);
        final Group group = groupRepository.findByName(groupName);
        if(group == null) {
            return "{\"success\": false, \"message\": \"No group found\"}";
        }
        
        //TODO this should add a request, not join directly
        UserGroupId id = new UserGroupId();
        id.setGroupId(group.getId());
        id.setUserId(user.getId());
        id.setProfile(Profile.RegisteredUser);
        if(userGroupRepository.exists(id)){
            return "{\"success\": false, \"message\": \"User has already joined\"}";
        }
        
        UserGroup ug = new UserGroup();
        ug.setGroup(group);
        ug.setUser(user);
        ug.setProfile(Profile.RegisteredUser);
        
        try{
            userGroupRepository.saveAndFlush(ug);
        } catch (Throwable t) {
            t.printStackTrace();
            return "{\"success\": false, \"message\": \"" + t.getMessage() + "\"}";
        }
       
        return "{\"success\": true}";
    }
    
    //TODO add the rest of the requests

}