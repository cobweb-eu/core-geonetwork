package org.fao.geonet.events.listeners;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.fao.geonet.domain.Group;
import org.fao.geonet.domain.Profile;
import org.fao.geonet.domain.User;
import org.fao.geonet.domain.UserGroup;
import org.fao.geonet.domain.UserGroupId_;
import org.fao.geonet.domain.UserGroup_;
import org.fao.geonet.events.group.GroupCreated;
import org.fao.geonet.repository.GroupRepository;
import org.fao.geonet.repository.UserGroupRepository;
import org.fao.geonet.repository.UserRepository;
import org.fao.geonet.utils.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.core.Ordered;
import org.springframework.core.PriorityOrdered;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * When a group is created, the user that created it becomes useradmin of that
 * group
 * 
 * @author delawen
 * 
 *
 */
@Component
public class GroupCreation implements ApplicationListener<GroupCreated>,
        Ordered {

    @Autowired
    private UserGroupRepository userGroupRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private GroupRepository groupRepo;
    @PersistenceContext
    private EntityManager entityManager;

    private org.fao.geonet.Logger log = Log.createLogger("cobweb");

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onApplicationEvent(GroupCreated event) {
        final Group group = event.getGroup();
        log.debug("Group " + group.getName() + " [" + group.getId()
                + "] created");

        Authentication auth = SecurityContextHolder.getContext()
                .getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            final String username = auth.getName();
            final User user = userRepo.findOneByUsername(username);

            Specification<UserGroup> spec = new Specification<UserGroup>() {
                @Override
                public Predicate toPredicate(Root<UserGroup> root,
                        CriteriaQuery<?> query, CriteriaBuilder cb) {
                    Path<Integer> userIdAttributePath = root.get(UserGroup_.id)
                            .get(UserGroupId_.userId);
                    Predicate userIdEqualPredicate = cb.equal(
                            userIdAttributePath, cb.literal(user.getId()));

                    Path<Integer> groupIdAttributePath = root
                            .get(UserGroup_.id).get(UserGroupId_.groupId);
                    Predicate groupIdEqualPredicate = cb.equal(
                            groupIdAttributePath, cb.literal(group.getId()));

                    return cb.and(userIdEqualPredicate, groupIdEqualPredicate);
                }
            };

            if (userGroupRepo.count(spec) == 0) {
                UserGroup ug = new UserGroup();
                ug.setGroup(group);
                ug.setProfile(Profile.UserAdmin);
                ug.setUser(user);
                userGroupRepo.save(ug);
            }

            log.debug("Finish GroupCreation");
        }
    }

    /**
     * @see org.springframework.core.Ordered#getOrder()
     * @return
     */
    @Override
    public int getOrder() {
        return PriorityOrdered.LOWEST_PRECEDENCE;
    }
}
