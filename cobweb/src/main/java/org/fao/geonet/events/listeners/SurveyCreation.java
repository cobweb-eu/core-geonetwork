package org.fao.geonet.events.listeners;

import java.io.StringReader;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.fao.geonet.domain.Metadata;
import org.fao.geonet.domain.MetadataType;
import org.fao.geonet.domain.OperationAllowed;
import org.fao.geonet.domain.OperationAllowedId;
import org.fao.geonet.domain.ReservedGroup;
import org.fao.geonet.domain.ReservedOperation;
import org.fao.geonet.events.md.MetadataUpdate;
import org.fao.geonet.kernel.DataManager;
import org.fao.geonet.kernel.SvnManager;
import org.fao.geonet.repository.GroupRepository;
import org.fao.geonet.repository.OperationAllowedRepository;
import org.fao.geonet.utils.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import com.google.common.base.Optional;

/**
 * When a survey is created, it gets published automatically to internal groups
 * so all authenticated users can see it
 * 
 * @author delawen
 * 
 *
 */
@Component
public class SurveyCreation implements ApplicationListener<MetadataUpdate> {

    @Autowired
    private DataManager dm;
    @Autowired
    private OperationAllowedRepository opAllowedRepo;
    @Autowired
    private SvnManager svnManager;
    @Autowired
    private GroupRepository groupRepo;
    @PersistenceContext
    private EntityManager entityManager;

    private org.fao.geonet.Logger log = Log.createLogger("cobweb");

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onApplicationEvent(MetadataUpdate event) {
        Metadata md = event.getMd();
        log.debug("Metadata " + md.getDataInfo().getTitle() + " ["
                + md.getUuid() + "] created");

        try {
            // Check type of metadata
            XPathFactory xPathfactory = XPathFactory.newInstance();
            XPath xpath = xPathfactory.newXPath();
            XPathExpression expr = xpath
                    .compile("/*[local-name()='MD_Metadata']/hierarchyLevel/MD_ScopeCode[@codeListValue='survey']");

            String xml = md.getData();
            DocumentBuilderFactory factory = DocumentBuilderFactory
                    .newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder
                    .parse(new InputSource(new StringReader(xml)));

            Boolean isSurvey = (Boolean) expr.evaluate(doc,
                    XPathConstants.BOOLEAN);
            if (isSurvey && md.getDataInfo().getType() == MetadataType.METADATA) {
                // First, set up privileges on all groups except special ones:
                // TODO: this should be improved with specific groups
                int opId = ReservedOperation.view.getId();
                List<Integer> groupIds = groupRepo.findIds();
                for (Integer grpId : groupIds) {
                    if (!(ReservedGroup.isReserved(grpId) || md.getSourceInfo()
                            .getGroupOwner().equals(grpId))) {
                        Optional<OperationAllowed> opAllowed = Optional
                                .of(new OperationAllowed(
                                        new OperationAllowedId()
                                                .setGroupId(grpId)
                                                .setMetadataId(md.getId())
                                                .setOperationId(opId)));

                        // Set operation
                        if (opAllowed.isPresent()) {
                            opAllowedRepo.save(opAllowed.get());
                            // svnManager.setHistory(mdId + "", context);
                        }
                    }
                }
            }
            entityManager.flush();
            log.debug("Finish SurveyCreation");
        } catch (XPathExpressionException e) {
            log.error(e.getMessage());
            log.error(e);
        } catch (Throwable e) {
            log.error(e.getMessage());
            log.error(e);
        }

    }
}
