/*****************************************************************************
 *
 *                      MiniMap 
 *
 *
External references:
#im_mm_toolbar

Need:
	imc_mm_action(
	callback im_mm_imageRebuilt


 *****************************************************************************/

var im_mm_currentTool;

var im_mm_north, im_mm_east, im_mm_south, im_mm_west;
var im_mm_width, im_mm_height;
var im_mm_ctrl_n,im_mm_ctrl_e, im_mm_ctrl_s, im_mm_ctrl_w; 

// Parse a response and set mm props accordingly
function im_mm_set(minimapResponse)
{
           // Image URL
           var mmurl = minimapResponse.getElementsByTagName('imgUrl')[0].textContent;
	$('im_mm_image').src = mmurl;
	
	// BBox
	var extent=minimapResponse.getElementsByTagName('extent')[0];
	var minx  = extent.getAttribute('minx');
	var maxx = extent.getAttribute('maxx');
	var miny  = extent.getAttribute('miny');
	var maxy = extent.getAttribute('maxy');

           // Image size
	var w = minimapResponse.getElementsByTagName('width')[0].textContent;
	var h = minimapResponse.getElementsByTagName('height')[0].textContent;

         im_mm_setMapProp(maxy, maxx, miny, minx, w, h);
}

// Set width, height and bounding box
function im_mm_setMapProp(n, e, s, w, width, height)
{
    im_mm_north=new Number(n);
    im_mm_east = new Number(e);
    im_mm_south = new Number(s);
    im_mm_west = new Number(w);
    
    im_mm_width=new Number(width);
    im_mm_height=new Number(height);
    
    im_mm_setTextCoords(n, e, s, w)
}

function im_mm_initTextControls(n, e, s, w)
{
    im_mm_ctrl_n = n;
    im_mm_ctrl_e = e;
    im_mm_ctrl_s = s;
    im_mm_ctrl_w = w;    
}


function im_mm_setTextCoords(north, east, south, west) 
{
    im_mm_ctrl_n.value = north;
    im_mm_ctrl_e.value = east;
    im_mm_ctrl_s.value = south;
    im_mm_ctrl_w.value = west;
}

function im_mm_setTextLenght(t,r,b,l) {

   var north = im_mm_getNS(t);
   var south = im_mm_getNS(b);
   var west =  im_mm_getWE(l);
   var east = im_mm_getWE(r);
   
   im_mm_setTextCoords(north, east, south, west);
}


function im_mm_getNS(y)
{
    return im_mm_south +  (im_mm_height - y) * (im_mm_north - im_mm_south) / im_mm_height; 
}

function im_mm_getWE(x)
{
    return im_mm_west +  x * (im_mm_east - im_mm_west) / im_mm_width; 
}

function im_mm_getURLbbox()
{
    return   "bbnorth="+im_mm_north+
                "&bbeast="+im_mm_east+
                "&bbsouth="+im_mm_south+
                "&bbwest="+im_mm_west;    
}

/* computes bb for mm from bm */
function im_dezoom(n, e, s, w)
{
    var dx = (e - w) / 2;
    var dy = (n - s) / 2;
    return im_urlizebb( n-dy, e+dx, s+dy, w-dx );
}

function im_urlizebb(n, e, s, w)
{
    return   "bbnorth="+n+
                "&bbeast="+e+
                "&bbsouth="+s+
                "&bbwest="+w;    
}

/*****************************************************************************
 *
 *                      MiniMap operations (zoom, pan, identify)
 *
 *****************************************************************************/

//DOC public function im_mm_setTool(tool)
function im_mm_setTool(tool) {
/*	im_mm_deleteAoi();*/
	im_mm_currentTool = tool;
	$('minimap_root').className = tool; 
}


var im_mm_startX, im_mm_startY; // start (mousedown) coordinates

function im_mm_mousedownEventListener(e)
{
        im_mm_deleteAoi();

	switch(im_mm_currentTool)
	{
		case 'zoomin':
			im_mm_startZoombox(e);
			break;
		case 'zoomout':
			im_mm_startZoombox(e);
			break;
		case 'pan':
			im_mm_startDrag(e);
			break;
		case 'aoi':
			im_mm_startAoi(e);
			break;
	}
}

//==================================================
// ZOOM
//==================================================

var im_mm_zoombox; // zoombox div

function im_mm_startZoombox(e)
{
	Event.stop(e); // prevents from dragging the map image (on Firefox)
	
	// add mousemove and mouseup listeners
	Event.observe(document, 'mousemove', im_mm_resizeZoombox);
	Event.observe(document, 'mouseup', im_mm_stopZoombox);
	
	// store starting cursor position
	im_mm_startX = Event.pointerX(e);
	im_mm_startY = Event.pointerY(e);
	
	// dynamically create the zoombox div
	im_mm_zoombox = document.createElement('div')
/*	im_mm_zoombox.setAttribute('id', 'im_mm_zoombox');*/
	im_mm_zoombox.id = 'im_mm_zoombox';
	document.body.appendChild(im_mm_zoombox);
	im_mm_drawBox($('im_mm_zoombox'), im_mm_startX, im_mm_startY, 0, 0);
}

// mousemove event listener
function im_mm_resizeZoombox(e)
{
	Event.stop(e); // prevents from dragging the map image (on Explorer)
	
	// get the current cursor position
	var pX = Event.pointerX(e);
	var pY = Event.pointerY(e);

	// get map image offset
	var offset = Position.cumulativeOffset($('im_mm_image'));
	var offsetX = offset[0];
	var offsetY = offset[1];

            var w = $('im_mm_image').clientWidth;
            var h = $('im_mm_image').clientHeight;

            // Prevents zoombox exiting from map area
            pX = Math.max(pX, offsetX+2);
            pY = Math.max(pY, offsetY+2);
            
            pX = Math.min(pX, offsetX + w - 2);
            pY = Math.min(pY, offsetY + h - 2);


	// set the zoom box position and size
	im_mm_drawBox ($('im_mm_zoombox'),
		Math.min(pX, im_mm_startX),  // left
		Math.min(pY, im_mm_startY),  // top
		Math.abs(pX - im_mm_startX), // width
		Math.abs(pY - im_mm_startY)  // height
	);
}

// mouseup event listener
function im_mm_stopZoombox(e)
{
	// get the current cursor position
	var pX = Event.pointerX(e);
	var pY = Event.pointerY(e);
	
	// get map image offset
	var offset = Position.cumulativeOffset($('im_mm_image'));
	var offsetX = offset[0];
	var offsetY = offset[1];

            var w = $('im_mm_image').clientWidth;
            var h = $('im_mm_image').clientHeight;

	im_mm_setStatus('busy');

	imc_mm_action(im_mm_currentTool, // may be zoomin or zoomout
		Math.min(pX, im_mm_startX) - offsetX, // xmin
		Math.max(pY, im_mm_startY) - offsetY, // ymax
		Math.max(pX, im_mm_startX) - offsetX, // xmax
		Math.min(pY, im_mm_startY) - offsetY,  // ymin
		w,h
	);
	
	// remove listeners and div
	Event.stopObserving(document, 'mousemove', im_mm_resizeZoombox);
	Event.stopObserving(document, 'mouseup', im_mm_stopZoombox);
	Element.remove($('im_mm_zoombox'));
}

/* // Draws the zoombox
function im_mm_drawZoombox(left, top, width, height)
{
	im_mm_zoombox.style.left = left + 'px';
	im_mm_zoombox.style.top = top + 'px';
	im_mm_zoombox.style.width = width + 'px';
	im_mm_zoombox.style.height = height + 'px';
}
*/
//==================================================
// AOI
//==================================================

var im_mm_aoibox; 

function im_mm_startAoi(e)
{
	Event.stop(e); // prevents from dragging the map image (on Firefox)
	
	// add mousemove and mouseup listeners
	Event.observe(document, 'mousemove', im_mm_resizeAoi);
	Event.observe(document, 'mouseup', im_mm_stopAoi);
	
	// store starting cursor position
	im_mm_startX = Event.pointerX(e);
	im_mm_startY = Event.pointerY(e);
	
	// dynamically create the zoombox div
	im_mm_aoibox = document.createElement('div')
	im_mm_aoibox.setAttribute('id', 'im_mm_aoibox');
	im_mm_drawBox(im_mm_aoibox, im_mm_startX, im_mm_startY, 0, 0);
	document.body.appendChild(im_mm_aoibox);
}

// mousemove event listener
function im_mm_resizeAoi(e)
{
	Event.stop(e); // prevents from dragging the map image (on Explorer)
	
	// get the current cursor position
	var pX = Event.pointerX(e);
	var pY = Event.pointerY(e);

	// get map image offset
	var offset = Position.cumulativeOffset($('im_mm_image'));
	var offsetX = offset[0];
	var offsetY = offset[1];

            var w = $('im_mm_image').clientWidth;
            var h = $('im_mm_image').clientHeight;
            
            pX = Math.max(pX, offsetX+2);
            pY = Math.max(pY, offsetY+2);
            
            pX = Math.min(pX, offsetX + w - 2);
            pY = Math.min(pY, offsetY + h - 2);

	im_mm_setTextLenght(
		Math.min(pY, im_mm_startY) - offsetY,  // top
		Math.max(pX, im_mm_startX) - offsetX,  // right
		Math.max(pY, im_mm_startY) - offsetY,  // bottom
		Math.min(pX, im_mm_startX) - offsetX // left
            );
            
	// set the zoom box position and size
	im_mm_drawBox ($('im_mm_aoibox'),
		Math.min(pX, im_mm_startX),  // left
		Math.min(pY, im_mm_startY),  // top
		Math.abs(pX - im_mm_startX), // width
		Math.abs(pY - im_mm_startY)  // height
	);
}

// mouseup event listener
function im_mm_stopAoi(e)
{
	// get the current cursor position
	var pX = Event.pointerX(e);
	var pY = Event.pointerY(e);
	
	// get map image offset
	var offset = Position.cumulativeOffset($('im_mm_image'));
	var offsetX = offset[0];
	var offsetY = offset[1];
	
	// remove listeners and div
	Event.stopObserving(document, 'mousemove', im_mm_resizeAoi);
	Event.stopObserving(document, 'mouseup', im_mm_stopAoi);
//	Element.remove($('im_mm_zoombox'));

            // We need this in case user starts drawing another AOI inside previous AOI: map wouldnt receive mouseclicks  
	Event.observe(im_mm_aoibox, 'mousedown', im_mm_mousedownEventListener);
}

function im_mm_deleteAoi()
{
    if(im_mm_aoibox)
    {
        Event.stopObserving(im_mm_aoibox, 'mousedown', im_mm_mousedownEventListener);
        Element.remove(im_mm_aoibox);    
        im_mm_aoibox = null;    
    }
}


//==================================================
function im_mm_zoomToAoi()
{
            if(! im_mm_aoibox)
            {
                alert("No AOI defined!");
                return
            }
            
	// get aoi coords
	var aoipos = Position.cumulativeOffset($('im_mm_aoibox'));
	var aoix = aoipos[0];
	var aoiy = aoipos[1];
	
	var aoidim = Element.getDimensions($('im_mm_aoibox'));
	var aoiw = aoidim.width;
	var aoih = aoidim.height;

	// get map image offset
	var mappos = Position.cumulativeOffset($('im_mm_image'));
	var mapx = mappos[0];
	var mapy = mappos[1];

            var mapw = $('im_mm_image').clientWidth;
            var maph = $('im_mm_image').clientHeight;

	im_mm_deleteAoi();

	im_mm_setStatus('busy');

	imc_mm_action('zoomin', 
		aoix- mapx, // xmin
		aoiy - mapy + aoih, // ymax
		aoix -mapx + aoiw, // xmax
		aoiy - mapy, // ymin
		mapw, maph
	);
		
}
    



//==================================================
// Draws the box

function im_mm_drawBox(box, left, top, width, height)
{
	box.style.left = left + 'px';
	box.style.top = top + 'px';
	box.style.width = width + 'px';
	box.style.height = height + 'px';
}

//==================================================
// DRAG
//==================================================

function im_mm_startDrag(e)
{
	Event.stop(e); // prevents from dragging the map image (on Firefox)
	
	// get map initial image offset
	var offset = Position.cumulativeOffset($('im_mm_image'));
	im_mm_startOffsetX = offset[0];
	im_mm_startOffsetY = offset[1];
	
	// add mousemove and mouseup listeners
	Event.observe(document, 'mousemove', im_mm_dragImage);
	Event.observe(document, 'mouseup', im_mm_stopDrag);
	
	// store starting cursor position
	im_mm_startX = Event.pointerX(e);
	im_mm_startY = Event.pointerY(e);
}

function im_mm_dragImage(e)
{
	window.status = Event.pointerX(e) + ' - ' + Event.pointerY(e); // DEBUG
	
	Event.stop(e); // prevents from dragging the map image (on Explorer)
	
	var vMapImg = $('im_mm_image');
	
	// get map image offset
	var offset = Position.cumulativeOffset(vMapImg);
	var offsetX = offset[0];
	var offsetY = offset[1];
	
	vMapImg.style.position = 'absolute';
	var t = Event.pointerX(e) - im_mm_startX;
	vMapImg.style.left = t + 'px';
	t = Event.pointerY(e) - im_mm_startY;
	vMapImg.style.top = t + 'px';
}

function im_mm_stopDrag(e)
{
	// get map image offset
	var offset = Position.cumulativeOffset($('im_mm_image'));
	var offsetX = offset[0];
	var offsetY = offset[1];
	
	// get the current cursor position
	im_mm_setStatus('busy');

            var w = $('im_mm_image').clientWidth;
            var h = $('im_mm_image').clientHeight;

	imc_mm_move(im_mm_startOffsetX - offsetX, offsetY - im_mm_startOffsetY, w, h)
	
	Event.stopObserving(document, 'mousemove', im_mm_dragImage);
	Event.stopObserving(document, 'mouseup', im_mm_stopDrag);
}



//==================================================
//==================================================
// updates the map image

function im_mm_imageRebuilt(req)
{
           im_mm_set(req.responseXML);

	var vMapImg = $('im_mm_image');
/*	
	// get the new values from response XML
	var imageSrc = req.responseXML.getElementsByTagName('imgUrl')[0].firstChild.nodeValue;
	
	// update the map image
	vMapImg.src = imageSrc;
*/	
	// set map image offset
	vMapImg.style.left = '0';
	vMapImg.style.top = '0';
	
//	Event.observe(vMapImg, 'load', function(e) { setStatus('idle') }); // better behaviour but needs debugging on explorer (newer version of prototype?)
	im_mm_setStatus('idle');
}


// AOI (Area Of Interest)
/*var im_mm_aoi = null;*/
var im_mm_ghostImg = null;


// called when the user clicks in the grayed area
function im_mm_restartAoi(e)
{
	im_mm_deleteAoi();
	im_mm_startAoi(e);
}


function im_mm_refreshNeeded()
{
	imc_mm_update(im_mm_width, im_mm_height, im_mm_getURLbbox());
}


function im_mm_setStatus(status)
{
/*	var refreshButton = $('im_refreshButton');*/
	
	switch(status)
	{
		case 'busy': // not allowed to refresh - wait for ajax transaction to finish
			// disable zoom, pan...
			
			// if(!$('map')) break; // ETj
			
			Event.stopObserving('im_mm_map', 'mousedown', im_mm_mousedownEventListener);
			Event.observe('im_mm_map', 'mousedown', noOp);
			
			// change cursor
			$('im_mm_map').style.cursor = 'wait'
			
			// change refresh button status
/*			refreshButton.className = 'im_disabled';
			refreshButton.disabled = true;
*/			
/*			$('im_pleaseWait').style.display = 'block';*/
			$('im_mm_wait').show(); //style.display='block';
			
			break;
		case 'idle': // all operations allowed
			// enable zoom, pan...
			Event.stopObserving('im_mm_map', 'mousedown', noOp);
			Event.observe('im_mm_map', 'mousedown', im_mm_mousedownEventListener);
			
			// change refresh button status
			$('im_mm_map').style.cursor = 'crosshair'
/*			refreshButton.className = 'im_disabled';
			refreshButton.disabled = true;
*/			
/*			$('im_pleaseWait').style.display = 'none';*/
			$('im_mm_wait').hide(); //style.display='none';
			
			break;
		case 'refresh': // refresh buton highlighted - means that refresh is needed after the user made some operations on layers
			// change refresh button status
/*			refreshButton.className = 'im_refresh';
			refreshButton.disabled = false;
*/			break;
	}
}


function im_mm_fullExtent()
{
    imc_mm_fullExtent(im_mm_width, im_mm_height);
}
