//=============================================================================
//===	Copyright (C) 2001-2007 Food and Agriculture Organization of the
//===	United Nations (FAO-UN), United Nations World Food Programme (WFP)
//===	and United Nations Environment Programme (UNEP)
//===
//===	This program is free software; you can redistribute it and/or modify
//===	it under the terms of the GNU General Public License as published by
//===	the Free Software Foundation; either version 2 of the License, or (at
//===	your option) any later version.
//===
//===	This program is distributed in the hope that it will be useful, but
//===	WITHOUT ANY WARRANTY; without even the implied warranty of
//===	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
//===	General Public License for more details.
//===
//===	You should have received a copy of the GNU General Public License
//===	along with this program; if not, write to the Free Software
//===	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
//===
//===	Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
//===	Rome - Italy. email: geonetwork@osgeo.org
//==============================================================================

package org.fao.geonet.services.main;

import static org.springframework.data.jpa.domain.Specifications.where;
import groovy.json.JsonBuilder;
import groovy.json.JsonParser;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import javax.servlet.http.Cookie;

import jeeves.interfaces.Service;
import jeeves.server.ServiceConfig;
import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;
import net.sf.json.JSON;
import net.sf.json.util.JSONBuilder;
import net.sf.json.util.JSONUtils;

import org.fao.geonet.GeonetContext;
import org.fao.geonet.Util;
import org.fao.geonet.constants.Geonet;
import org.fao.geonet.domain.Profile;
import org.fao.geonet.domain.User;
import org.fao.geonet.domain.UserGroup;
import org.fao.geonet.kernel.SelectionManager;
import org.fao.geonet.kernel.search.LuceneIndexField;
import org.fao.geonet.kernel.search.MetaSearcher;
import org.fao.geonet.kernel.search.SearchManager;
import org.fao.geonet.repository.MetadataRepository;
import org.fao.geonet.repository.UserGroupRepository;
import org.fao.geonet.repository.UserRepository;
import org.fao.geonet.repository.specification.UserGroupSpecs;
import org.fao.geonet.kernel.search.SearcherType;
import org.fao.geonet.services.util.SearchDefaults;
import org.jdom.Element;
import org.json.JSONArray;
import org.json.JSONWriter;
import org.springframework.data.jpa.domain.Specifications;

//=============================================================================

public class XmlSearch implements Service
{
	private ServiceConfig _config;
	private String _searchFast; //true, false, index

	//--------------------------------------------------------------------------
	//---
	//--- Init
	//---
	//--------------------------------------------------------------------------

	public void init(Path appPath, ServiceConfig config) throws Exception
	{
		_config = config;
		_searchFast = config.getValue(Geonet.SearchResult.FAST, "true");
	}

	/**
	 * Run a search and return results as XML.
	 *
	 * @param params	All search parameters defined in {@link LuceneIndexField}.
	 * <br/>
	 * To return only results summary, set summaryOnly parameter to 1.
	 * Default is 0 (ie.results and summary).
	 *
	 */
	public Element exec(Element params, ServiceContext context) throws Exception {
		GeonetContext gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);

		SearchManager searchMan = gc.getBean(SearchManager.class);
		
        // Cobweb - search my surveys
        List<String> participants = new LinkedList<String>();
        for (Object o : params.getChildren("_participant")) {
            Element e = (Element) o;
            participants.add(e.getText());
        }

        params.removeChildren("_participant");

        UserGroupRepository userGroupRepo = gc
                .getBean(UserGroupRepository.class);
        UserRepository userRepo = gc.getBean(UserRepository.class);
        List<Integer> groups = new LinkedList<Integer>();

        for (String s : participants) {
            User u = userRepo.findOneByUsername(s);
            if (u != null) {
                groups.addAll(userGroupRepo.findGroupIds(
                        Specifications.where(
                                UserGroupSpecs.hasProfileOrEquivalent(
                                        Profile.RegisteredUser))
                                .and(UserGroupSpecs.hasUserId(u.getId()))));
   
            }
        }

        if (groups.size() > 0) {
            String g = null;
            for (Integer id : groups) {
                if(g == null) {
                    g = id.toString();
                } else {
                    g = g + " or " + id;
                }
            }
            Element el = new Element("_groupOwner");
            el.setText(g);
            params.addContent(el);
        } else if(!participants.isEmpty()) {
            Element el = new Element("_groupOwner");
            el.setText("1"); //all group
            params.addContent(el);
        }
        // Cobweb - search my surveys

		Element elData  = SearchDefaults.getDefaultSearch(context, params);
		String  sRemote = elData.getChildText(Geonet.SearchResult.REMOTE);
		boolean remote  = sRemote != null && sRemote.equals(Geonet.Text.ON);

		// possibly close old searcher
		UserSession  session     = context.getUserSession();
		
		// perform the search and save search result into session
		MetaSearcher searcher;
		context.info("Creating searchers");
		
        if(remote) {
			searcher = searchMan.newSearcher(SearcherType.Z3950,  Geonet.File.SEARCH_Z3950_CLIENT);
        } else {
			searcher = searchMan.newSearcher(SearcherType.LUCENE, Geonet.File.SEARCH_LUCENE);
        }
        
        // Cobweb - cookie with list of surveys
        Cookie cookie = new Cookie("surveys", "{}");
        cookie.setMaxAge(60 * 60 * 24 * 365); //set expire time to 1 year

        EntityManager em = gc.getBean(EntityManagerFactory.class).createEntityManager();

        
        Query query = em.createNativeQuery("select distinct m.uuid from Metadata m, "
                + "UserGroups ug where m.groupowner = ug.groupid "
                + " and ug.userid = " + context.getUserSession().getUserId()
                + " and ug.profile < 5;");
        
        List<Object> cookieContent = query.getResultList(); 
        StringBuilder array = null;
        for(Object tmp : cookieContent) {
            if(array == null) {
                array = new StringBuilder();
                array.append(tmp);
            } else {
                array.append("," + tmp.toString());
            }
        }
        
        em.close();
        
        cookie.setPath("/");
        cookie.setSecure(true);
        cookie.setValue((array != null? array.toString() : ""));
        
        context.addOrUpdateCookie(cookie);
        // Cobweb - cookie with list of surveys!
		
		try {
			
			// Check is user asked for summary only without building summary
			String summaryOnly = Util.getParam(params, Geonet.SearchResult.SUMMARY_ONLY, "0");
			String sBuildSummary = params.getChildText(Geonet.SearchResult.BUILD_SUMMARY);
            if(sBuildSummary != null && sBuildSummary.equals("false") && ! "0".equals(summaryOnly)) {
				elData.getChild(Geonet.SearchResult.BUILD_SUMMARY).setText("true");
            }
			
			session.setProperty(Geonet.Session.SEARCH_REQUEST, elData.clone());
			searcher.search(context, elData, _config);
	
			if (!"0".equals(summaryOnly)) {
				return searcher.getSummary();
			} else {

				elData.addContent(new Element(Geonet.SearchResult.FAST).setText(_searchFast));
				elData.addContent(new Element("from").setText("1"));
				// FIXME ? from and to parameter could be used but if not
				// set, the service return the whole range of results
				// which could be huge in non fast mode ? 
				elData.addContent(new Element("to").setText(searcher.getSize() +""));
		
				Element result = searcher.present(context, elData, _config);
				
				// Update result elements to present
				SelectionManager.updateMDResult(context.getUserSession(), result);
		
				return result;
			}
		} finally {
			searcher.close();
		}
	}
}

//=============================================================================

