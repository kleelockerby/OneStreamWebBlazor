(function() {
if (typeof(pssscript1)!='undefined') return;

pssscript1="true";
var scriptVersion = "v9.0";

/* if connectToCC != 0 - the js will send it's information to the tomcat client collector.
else - it will send it's data back to the originating web server */
var connectToCC=0;

/*the domain or ip of the collector. 
   e.g: www.symantec.collector.com or 192.12.45.2*/
var conHost="";

/* the HTTP and HTTPS ports of the collector in the format --> :port
  e.g: :443 */
var sPort="";
var sPortSSL="";

var instance="3750";

/*activate signed applet could be 0 or 1*/
var extraData="0";

/* these are the used values:
	 TECH_WEB_NUM = "0";
	 TECH_SAP_NUM = "1";
	 TECH_ORACLE_APPLICATIONS_NUM = "2";
	 TECH_SIEBEL_NUM = "4";
	 TECH_PEOPLESOFT_NUM = "5";
*/
var technology="0";

var sIgnoreTextInURI=";jsessionid=";
var sParamsSeparators = "?&";
var UUID_COOKIE_NAME = "I4Web_uuid";
var hex_chr = "0123456789abcdef";
var connectiontypecode = '<HTML xmlns:IE><STYLE>@media all {IE\\:CLIENTCAPS {behavior:url(#default#clientCaps)}}</STYLE><IE:CLIENTCAPS ID="oClientCaps"/>';
var sI4WSessionCookieName = "eBS";
var IE_ONLOAD_EVENT = "false";
var CO_OBJ; 
var CH_OBJ;
var	PS_OBJ = null;
var sServlet = "servlet";
var sClientDataExt=".js";
var sClientDataReq = AgentLocation+"i4web_client_data"+sClientDataExt;
var doc_obj=document;
var nav_obj=navigator;
var loc_obj=location;
var win_obj=window;
var ua=nav_obj.userAgent;
var s_id;
var JavaEnabled = nav_obj.javaEnabled();
var isFrameSet = false;
var session_cookie_name = "JSESSIONID";
var IsAbandon = "0";
var PageKey = "";
var onBeforeUnloadEventTimeStamp = 0;
var onLoadEventTimeStamp = 0; 
var md5 = null;
var forceProtocol = "";
var siebelViewParamName = "SWEView";
var sCleanURI;

//reserved for custom collection, do not remove
/*custom-start*//*custom-end*/

/*
 * User Collection
 * (These variables are updated each time the configuration is changed). 
 */
var LOGIN_TYPE = 1;
var LOGOUT_TYPE = 2;
var AUN_COOKIE_NAME = "I4W_AUN";
var AUN_SERVER_COOKIE_NAME = "I4WU";

// "disabled", "automatic","forms","user defined client","siebel","oracle applications","peoplesoft","sap" or other server options
var userCollectionMethod = /*userCollectionMethod-start*/"automatic"/*userCollectionMethod-end*/; 

// [ {url: <value>, type: <value>, formname: <value> , field: <value>}, ... ] //field can be comma separated and each item may contain form name
var userCollectionForms = /*userCollectionForms-start*/null/*userCollectionForms-end*/; 

//array[0-1] of (type, name), see CollectUserDefinedDataByType
var userCollectionUserDefined = /*userCollectionUserDefined-start*/null/*userCollectionUserDefined-end*/; 

//array of strings for field names
var userCollectionAutomatic = /*userCollectionAutomatic-start*/'user,User,username,Username,login,Login,j_username,j_user,loginuidfield,SWEUserName,txtUsername,userid,userId,userID,UserId,UserID,textUser,usernameField'/*userCollectionAutomatic-end*/; 

// This value should be filled from registry.
var userCollectionPkgAppUserFieldDomPath = /*userCollectionPkgAppUserFieldDomPath-start*/null/*userCollectionPkgAppUserFieldDomPath-end*/; 

var userCollectionPkgAppUserFieldDomPathDelimiter = "##"; // if more than one dom path should be checked put this between them.
var aun = ""; // this will hold the collected user
var collectedBy = ""; //this will hold the final collection method used (on automatic it can change to any ERP or to forms)
var userCollectionMethods = {disabled: false, automatic: true, forms: true,'user defined client': true,siebel: true,'oracle applications': true,peoplesoft: true,sap: true};
var userCollectionEnabled = (userCollectionMethod in userCollectionMethods && userCollectionMethods[userCollectionMethod] == true); 
var technologyToCollectionMethodMap = {"1": "sap", "2": "oracle applications", "4": "siebel", "5": "peoplesoft"};

/*
 * Sap iViews
 */
var defaultTechnicalIViewExcludList = new Array(/*"terminator", "loading", "launcher"*/);
var emptySapTitles = new Array( "sap enterprise portal",    
								"sap netweaver portal");
var pssDebug = false;

/*
Supported browsers list and a function to decide if a browser is supported.
*/
var Supported_Browsers_Object = {
    isBrowserSupported: function () {
       for (i4w_index = 0 ; i4w_index < this.browsers.length ; i4w_index++)
       {
            if (DU_OBJ.browser == this.browsers[i4w_index].name)
            {
				var minVersion = this.browsers[i4w_index].version;
				if (typeof(minVersion) == 'undefined')
				{
					return true;
				}
				return (DU_OBJ.version >= minVersion);
            }
		}
   		return false;
	},
	browsers : [
		{name: "Inquire"},
		{name: "Explorer",version: 5.5},
		{name: "Firefox",version: 1.1},
		{name: "Netscape",version: 8},
		{name: "Opera",version: 8.51},
		{name: "Mozilla",version: 1.7},
		{name: "Safari"},
		{name: "Chrome",versions: 3.0}
	]
};
/*
Browser detector object. detect the browser the version and the OS.
*/
var DU_OBJ = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(ua)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i4w_index=0;i4w_index<data.length;i4w_index++)	{
			var dataString = data[i4w_index].string;
			var dataProp = data[i4w_index].prop;
			this.versionSearchString = data[i4w_index].versionSearch || data[i4w_index].identity;
			if (dataString) {
				if (dataString.indexOf(data[i4w_index].subString) != -1)
					return data[i4w_index].identity;
			}
			else if (dataProp)
				return data[i4w_index].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{string: ua,subString: "Insight Inquire",identity: "Inquire"},
		{string: navigator.vendor,subString: "Apple",identity: "Safari"},
		{prop: window.opera,identity: "Opera"},
		{string: navigator.vendor,subString: "iCab",identity: "iCab"},
		{string: navigator.vendor,subString: "KDE",identity: "Konqueror"},
		{string: ua,subString: "Firefox",identity: "Firefox"},
		{string: ua,subString: "Chrome",identity: "Chrome",versionSearch: "Chrome"},
		/* for newer Netscapes (6+)*/
		{string: ua,subString: "Netscape",identity: "Netscape"},
		{string: ua,subString: "MSIE",identity: "Explorer",versionSearch: "MSIE"},
		{string: ua,subString: "Gecko",identity: "Mozilla",versionSearch: "rv"},
		/* for older Netscapes (4-)*/
        {string: ua,subString: "Mozilla",identity: "Netscape",	versionSearch: "Mozilla"}
	],
	dataOS : [
		{string: navigator.platform,subString: "Win",identity: "Windows"},
		{string: navigator.platform,subString: "Mac",identity: "Mac"},
		{string: navigator.platform,subString: "Linux",identity: "Linux"},
		{string: navigator.platform,subString: "SunOS",identity: "Solaris"}
	]

};

    function I4W_addEventListener(evType, fn){
		if (window.addEventListener){
            window.addEventListener(evType, fn, false);
            return true;
        } else if (window.attachEvent){
            var r = window.attachEvent("on"+evType, fn);
            return r;
        }
        return false; 
    }

/* start MD5 functions */
    function rhex(num) {
        var str = "";
		for(var i4w_j = 0; i4w_j <= 3; i4w_j++)
		{
			str += hex_chr.charAt((num >> (i4w_j * 8 + 4)) & 0x0F) + 
            hex_chr.charAt((num >> (i4w_j * 8)) & 0x0F);
        }
		return str;
	}

	function str2blks_MD5(str) {
		var nblk = ((str.length + 8) >> 6) + 1;
		var blks = new Array(nblk * 16);
        for(var i4w_index1 = 0; i4w_index1 < nblk * 16; i4w_index1++) blks[i4w_index1] = 0;
		for(var i4w_index = 0; i4w_index < str.length; i4w_index++)
			blks[i4w_index >> 2] |= str.charCodeAt(i4w_index) << ((i4w_index % 4) * 8);
		blks[i4w_index >> 2] |= 0x80 << ((i4w_index % 4) * 8);
		blks[nblk * 16 - 2] = str.length * 8;
		return blks;
	}

	function add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    	return (msw << 16) | (lsw & 0xFFFF);
	}

	function rol(num, cnt)
	{
    	return (num << cnt) | (num >>> (32 - cnt));
	}

/*
 * These functions implement the basic operation for each round of the
 * algorithm.
 */
    function cmn(q, a, b, x, s, t)
    {
        return add(rol(add(add(a, q), add(x, t)), s), b);
    }
    function ff(a, b, c, d, x, s, t)
    {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t)
    {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t)
    {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t)
    {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Take a string and return the hex representation of its MD5.
    */
	function calcMD5(str)
	{
		var x = str2blks_MD5(str);
		var a =  1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d =  271733878;

		for(i4w_index = 0; i4w_index < x.length; i4w_index += 16)
		{
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;

			a = ff(a, b, c, d, x[i4w_index+ 0], 7 , -680876936);
			d = ff(d, a, b, c, x[i4w_index+ 1], 12, -389564586);
			c = ff(c, d, a, b, x[i4w_index+ 2], 17,  606105819);
			b = ff(b, c, d, a, x[i4w_index+ 3], 22, -1044525330);
			a = ff(a, b, c, d, x[i4w_index+ 4], 7 , -176418897);
			d = ff(d, a, b, c, x[i4w_index+ 5], 12,  1200080426);
			c = ff(c, d, a, b, x[i4w_index+ 6], 17, -1473231341);
			b = ff(b, c, d, a, x[i4w_index+ 7], 22, -45705983);
			a = ff(a, b, c, d, x[i4w_index+ 8], 7 ,  1770035416);
			d = ff(d, a, b, c, x[i4w_index+ 9], 12, -1958414417);
			c = ff(c, d, a, b, x[i4w_index+10], 17, -42063);
			b = ff(b, c, d, a, x[i4w_index+11], 22, -1990404162);
			a = ff(a, b, c, d, x[i4w_index+12], 7 ,  1804603682);
			d = ff(d, a, b, c, x[i4w_index+13], 12, -40341101);
			c = ff(c, d, a, b, x[i4w_index+14], 17, -1502002290);
			b = ff(b, c, d, a, x[i4w_index+15], 22,  1236535329);    

			a = gg(a, b, c, d, x[i4w_index+ 1], 5 , -165796510);
			d = gg(d, a, b, c, x[i4w_index+ 6], 9 , -1069501632);
			c = gg(c, d, a, b, x[i4w_index+11], 14,  643717713);
			b = gg(b, c, d, a, x[i4w_index+ 0], 20, -373897302);
			a = gg(a, b, c, d, x[i4w_index+ 5], 5 , -701558691);
			d = gg(d, a, b, c, x[i4w_index+10], 9 ,  38016083);
			c = gg(c, d, a, b, x[i4w_index+15], 14, -660478335);
			b = gg(b, c, d, a, x[i4w_index+ 4], 20, -405537848);
			a = gg(a, b, c, d, x[i4w_index+ 9], 5 ,  568446438);
			d = gg(d, a, b, c, x[i4w_index+14], 9 , -1019803690);
			c = gg(c, d, a, b, x[i4w_index+ 3], 14, -187363961);
			b = gg(b, c, d, a, x[i4w_index+ 8], 20,  1163531501);
			a = gg(a, b, c, d, x[i4w_index+13], 5 , -1444681467);
			d = gg(d, a, b, c, x[i4w_index+ 2], 9 , -51403784);
			c = gg(c, d, a, b, x[i4w_index+ 7], 14,  1735328473);
			b = gg(b, c, d, a, x[i4w_index+12], 20, -1926607734);

			a = hh(a, b, c, d, x[i4w_index+ 5], 4 , -378558);
			d = hh(d, a, b, c, x[i4w_index+ 8], 11, -2022574463);
			c = hh(c, d, a, b, x[i4w_index+11], 16,  1839030562);
			b = hh(b, c, d, a, x[i4w_index+14], 23, -35309556);
			a = hh(a, b, c, d, x[i4w_index+ 1], 4 , -1530992060);
			d = hh(d, a, b, c, x[i4w_index+ 4], 11,  1272893353);
			c = hh(c, d, a, b, x[i4w_index+ 7], 16, -155497632);
			b = hh(b, c, d, a, x[i4w_index+10], 23, -1094730640);
			a = hh(a, b, c, d, x[i4w_index+13], 4 ,  681279174);
			d = hh(d, a, b, c, x[i4w_index+ 0], 11, -358537222);
			c = hh(c, d, a, b, x[i4w_index+ 3], 16, -722521979);
			b = hh(b, c, d, a, x[i4w_index+ 6], 23,  76029189);
			a = hh(a, b, c, d, x[i4w_index+ 9], 4 , -640364487);
			d = hh(d, a, b, c, x[i4w_index+12], 11, -421815835);
			c = hh(c, d, a, b, x[i4w_index+15], 16,  530742520);
			b = hh(b, c, d, a, x[i4w_index+ 2], 23, -995338651);

			a = ii(a, b, c, d, x[i4w_index+ 0], 6 , -198630844);
			d = ii(d, a, b, c, x[i4w_index+ 7], 10,  1126891415);
			c = ii(c, d, a, b, x[i4w_index+14], 15, -1416354905);
			b = ii(b, c, d, a, x[i4w_index+ 5], 21, -57434055);
			a = ii(a, b, c, d, x[i4w_index+12], 6 ,  1700485571);
			d = ii(d, a, b, c, x[i4w_index+ 3], 10, -1894986606);
			c = ii(c, d, a, b, x[i4w_index+10], 15, -1051523);
			b = ii(b, c, d, a, x[i4w_index+ 1], 21, -2054922799);
			a = ii(a, b, c, d, x[i4w_index+ 8], 6 ,  1873313359);
			d = ii(d, a, b, c, x[i4w_index+15], 10, -30611744);
			c = ii(c, d, a, b, x[i4w_index+ 6], 15, -1560198380);
			b = ii(b, c, d, a, x[i4w_index+13], 21,  1309151649);
			a = ii(a, b, c, d, x[i4w_index+ 4], 6 , -145523070);
			d = ii(d, a, b, c, x[i4w_index+11], 10, -1120210379);
			c = ii(c, d, a, b, x[i4w_index+ 2], 15,  718787259);
			b = ii(b, c, d, a, x[i4w_index+ 9], 21, -343485551);

			a = add(a, olda);
			b = add(b, oldb);
			c = add(c, oldc);
			d = add(d, oldd);
		}
		return rhex(a) + rhex(b) + rhex(c) + rhex(d);
	}
    /*end MD5 functions*/
    
    /*
    collect people soft specific data (menu,page,component,ps user)
    the data is collected from a comment in the people soft dynamic page 
    e.g. <!-- IE/6.0/WINNT; ToolsRel=8.44.17; Page=INV_ITEMS_DEFIN1; Component=ITEMS_INQUIRY; Menu=DEFINE_ITEMS; User=VP1; DB=PSFT844/ORACLE; AppServ=//INSIGHTVMPS2:9000; -->
    if the user is not defined in the specified comment in the page the user will be taken from a cookie called "SignOnDefault"
    */
    function PeopleSoftObject()
	{
		this.page="";
		this.component="";
		this.menu="";
		this.userApplication="";

		var collection;
		var col_len; 
		var found = false;
		var str;
		// different collection for firefox
		if (DU_OBJ.browser == "Firefox")
		{
			var heads = document.getElementsByTagName("head");
			if (heads.length >0)
			{
				var head = heads[0]; // assuming one head in page 
				collection = head.childNodes ;
				col_len = collection.length;
				for (var i = 0; i < col_len; i++)
				{
					var node = collection[i];
					if (node.nodeType == 8 ) // 8 is comment, you can check that the nodeName is #COMMENT
					{
						str = node.textContent;
						if (extractPsoftVars(str, this))
						{
							found = true;
							break;
						}
					}
				}
			}
		} 
		else
		{
			collection = document.getElementsByTagName("!");
			col_len = collection.length;
			for (var i = 0; i < col_len; i++)
			{
				str = collection[i].innerHTML;
				if (extractPsoftVars(str, this))
				{
					found = true;
					 break;
				}
			}
		}

		// if comment doesn't exist and it's .GBL file, extract component and menu from url. pattern is .../Menu.Component.GBL
		if (!found)
		{
			found = extractPsoftVarsFromUrl(this);
		}


		if (this.userApplication=="")
		{
			this.userApplication=GetCookieFunc("SignOnDefault");
			if (this.userApplication==null)
			{
				this.userApplication="";
			}
		}
	}
	
	function extractPsoftVars(str, obj)
	{
        var index1 , index2;
		if (str.indexOf("Page=") != -1	|| str.indexOf("Component=") != -1 || str.indexOf("Menu=") != -1)
		{
			 /* Get PS page*/
			 index1 = str.indexOf("Page=") ;
			 if (index1 != -1)
			 {
				 index2 = str.indexOf(";",index1) ;
				 if (index2 != -1)
				 {
						obj.page=str.substring(index1 + 5,index2);	 
				 }
					
			 }
			index1=-1;
			index2=-1;
			/* Get PS component*/
			 index1 = str.indexOf("Component=") ;
			 if (index1 != -1)
			 {
				  index2 = str.indexOf(";",index1) ;
				 if (index2 != -1)
				 {
						obj.component=str.substring(index1 + 10,index2);	 
				 }
					
			 }
			index1=-1;
			index2=-1;
			/* Get PS menu*/
			 index1 = str.indexOf("Menu=") ;
			 if (index1 != -1)
			 {
				  index2 = str.indexOf(";",index1) ;
				 if (index2 != -1)
				 {
						obj.menu=str.substring(index1 + 5,index2);	 
				 }							
			 }
			 index1=-1;
			index2=-1;
			/* Get PS user*/
			 index1 = str.indexOf("User=") ;
			 if (index1 != -1)
			 {
				  index2 = str.indexOf(";",index1) ;
				 if (index2 != -1)
				 {
						obj.userApplication=str.substring(index1 + 5,index2);	 
				 }							
			 }
			 return true;
		}
		return false;

	}

	 //Extract component and menu from url. pattern is .../Menu.Component.GBL
	function extractPsoftVarsFromUrl(obj)
	{
		try
		{
			var path = location.pathname;
			var ext = getExtenssion(path);
			if (ext == "GBL" || ext == "gbl")
			{
				var noExtStr ,  lastDotInd;
				var menuFound = false, componentFound = false;
				noExtStr = path.substring(0, path.length-4) // remove .gbl
				lastDotInd = noExtStr.lastIndexOf(".");
				if (lastDotInd != -1 && lastDotInd +1 < noExtStr.length)
				{
					obj.component=noExtStr.substring(lastDotInd + 1);
					if (obj.component.length > 30)
					{
						obj.component = obj.component.substring(0,27) + "..."; // truncate to the db field size
					}
					componentFound = true;
					noExtStr = noExtStr.substring(0, lastDotInd) // remove .component
					lastDotInd = noExtStr.lastIndexOf("/");
					if (lastDotInd != -1 && lastDotInd +1 < noExtStr.length)
					{
						obj.menu=noExtStr.substring(lastDotInd + 1);	 
						if (obj.menu.length > 30)
						{
							obj.menu = obj.menu.substring(0,27) + "..."; // truncate to the db field size
						}
						menuFound = true;
					}
				}
				return componentFound && menuFound;
			}
		}
		catch (e)
		{
			return false;
		}

		return false;
	}

  
    /*
    collect the page static data
    */
    function CollectObject() {
        var name = (win_obj.name == "" ? "Page" : win_obj.name);
        this.R  = "&R=" + encodeURIComponent(unescape(doc_obj.referrer));
        this.U  = "&U=" + encodeURIComponent(unescape(removeQuestionMarkFromEnd(removeRefFromURI(loc_obj.href))));
        this.D  = "&D=" + escape(unescape(doc_obj.domain));
        this.M  = "&M=" + encodeURIComponent(unescape(navigator.userAgent));
        this.Q  = "&Q=" + encodeURIComponent(unescape(name));
        this.V = "&V=" + escape(unescape(scriptVersion));
        this.CS = "&CS=" + escape(unescape(doc_obj.charset));
        this.DCS = "&DCS=" + escape(unescape(doc_obj.defaultCharset));
        this.CT = "&CT=2"; // + escape(unescape(getConnectionType())); // hardcoded due to slowness and redundant feature.
	 
    }
    
    /*
    create an object with all needed connection details (collector and applet)
    */
    function ConnectHost() {
		if(connectToCC != 0)
		{
			if ((typeof(forceProtocol)!='undefined') && 
				((forceProtocol == "http:") || (forceProtocol == "https:"))) 
			{
				this.portString = ( forceProtocol.indexOf("https") == -1 ? sPort : sPortSSL );
				this.protocol = forceProtocol;	
			}
			else {
				this.portString = ( loc_obj.protocol.indexOf("https") == -1 ? sPort : sPortSSL );
				this.protocol = loc_obj.protocol;
			}
			
			this.connectString = "/" + sServlet + "/com.precise.ifweb.Collection.ServerCollector.eBWServer";
			this.connectionHost = this.protocol + "//" + conHost +  this.portString;
			this.dataConnect = this.connectionHost + this.connectString;
			this.appletbase = this.connectionHost +  "/com/precise/ifweb/Collection/ClientCollector/";	
		}
		else
		{
			this.dataConnect = sClientDataReq;
			// this.appletbase ?
		}
    }

	function GetCookieRaw(name) {
		var cook = doc_obj.cookie;
		var arg = name + "=";
		var argIndex = cook.indexOf(arg);
        var found = false;
        if (argIndex != -1)
		{
            found = true;
            // make sure it's not the end of a longer name
            if (argIndex != 0 && cook.charAt(argIndex -1) != ' ')
            {
                found = false;
                argIndex = cook.indexOf(" " + arg , argIndex ) +1; // for the space
                if (argIndex != 0) // 0 is actually -1, not found.
                    found = true;
            }
        }
        if (found)
            return GetCookieValFunc (argIndex + arg.length);

		return null;
	}

	function GetCookieFunc (name) {
		var r = GetCookieRaw(name);
		return r == null ? null : unescape(r);
	}
   
	function GetUuidFromMd5Val (md5ValFromCookie) {
		if(md5ValFromCookie === null) {
			return null;
		}
		var seperatorIndex = md5ValFromCookie.indexOf('#');
		if( seperatorIndex == -1) {
		  return md5ValFromCookie;
		}
		else {
		  return md5ValFromCookie.substring(seperatorIndex + 1);
		}
	}
   
	function GetMd5ValFromCookie (name) {
		var cookie = doc_obj.cookie;
		var arg = name + "@";
		var alen = arg.length;
		var clen = cookie.length;
		var i4w_index = cookie.indexOf(arg);
		if (i4w_index != -1)
		{
			var i4w_j = cookie.indexOf("*",i4w_index);
			if (i4w_j != -1)
			{
				return cookie.substring(i4w_index + arg.length,i4w_j);
			}
		}
		return null;
	}

	function GetCookieValFunc (offset) {
		var cook = doc_obj.cookie;
		var endstr = cook.indexOf (";", offset);
		if (endstr == -1)
			endstr = cook.length;
		return cook.substring(offset, endstr);
	}
    /*
    delete a cookie by its name.
    */ 
	function DeleteCookieFunc (name) {
		var exp = new Date();
		exp.setTime (exp.getTime() - 1);
		var cval = GetCookieFunc (name);
		doc_obj.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
	}
    /*
    delete a cookie that has a path / (visible to all page in a site) by its name.
    */    
	function DeleteRootCookieFunc (name) {
		var exp = new Date();
		exp.setTime (exp.getTime() - 1);
		var cval = GetCookieFunc (name);
		doc_obj.cookie = name + "=" + cval + ";path=/ ; expires=" + exp.toGMTString();
	}
	
	/*
	delete the specific key:value from the uuid cookie that is in the format i4web_uuid=<key>@<value>*<key>@<value>....
	*/
	function DeleteUuidRootCookieFunc (name) {
		var cval = GetCookieFunc (UUID_COOKIE_NAME);
		if (cval == null) // can happen if 2 frames have the same url loaded.
		    return;
		var idx1 = cval.indexOf(name);
		var newCookie = cval.substring(0,idx1);
		var idx2 = cval.indexOf("*",idx1);
		newCookie = newCookie + cval.substring(idx2 + 1,cval.length);
		if (newCookie == "")
		{
			DeleteRootCookieFunc(UUID_COOKIE_NAME);
		}
		else {
			doc_obj.cookie = "I4Web_uuid=" + newCookie + ";path=/ ;";
		}
	}
    /*
    check if session cookie is enabled on the browser. if not we can't work.
    the way to check it is to try to create a simple cookie and then check if it is created.
    */
    function isCookieEnabled() {
        if ( doc_obj.cookie.indexOf("ps_scookie=cookieId") != -1) {
            DeleteCookieFunc("ps_scookie");
            return true; // if it was there, no need to readd it
        }
        doc_obj.cookie = "ps_scookie=cookieId";	
        if ( doc_obj.cookie.indexOf("ps_scookie=cookieId") != -1) {
            DeleteCookieFunc("ps_scookie");
            return true;	
        }
        else {
            return false;
        }
    }	
    /*
	this function escapes only the unicode chars in the given string. 
	It does so by initially escaping all the string and then unescaping all parts that do not contain a unicode 
	escaped sequence (%uXXXX). 
    */
/*
	function escapeUnicode (uri)
	{
		var newURI = "";
		var escapedURI;
		var startOfStr = 0;
		var index = 0;
		var len = 0;
		escapedURI = escape(uri);
		while (index < escapedURI.length)
		{
			if (escapedURI.charAt(index) == '%'){
				if (index + 1 < escapedURI.length){
					if (escapedURI.charAt(index + 1) == 'u'){
						len = index - startOfStr;
						if (len != 0)
						{
							  newURI += unescape(escapedURI.substr(startOfStr,len));
						}
						
						if (index + 6 < escapedURI.length)
						{
							newURI += escapedURI.substr(index,6).toLowerCase();
							index += 6;
							startOfStr = index;
							continue;
						} else {
							//stop iterating the string.
							index = escapedURI.length;
							break;
						}
					}
				}
			}
			index++;
		}
		len = index - startOfStr;
		newURI += unescape(escapedURI.substr(startOfStr,len));
		return newURI;
	}
*/


String.prototype.pssTrim = function()
{	return (this.toString().replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "")) }

String.prototype.pssStartsWith = function(str)
{return (this.toString().match("^"+str)==str)}

String.prototype.pssEndsWith = function(str)
{return (this.toString().match(str+"$")==str)}


	//////////////////////////
	// sap iviews methods
	//////////////////////////

	function logFrame(f)
	{
		var win = null;
		if (f.contentWindow)
		{
			win =  f.contentWindow;
		}
		else if (f.window)
		{
			win = f.window;
		}
		if (f.frames && f.frames.length >0)
		{
			for (var i=0; i< f.frames.length ; i++)
			{
				 logFrame(f.frames[i]);
			}
		}
	}

	function findFrameForWin(f, w)
	{
	    try // frames sometimes throw access denied
	    {
		var wind = null;
		if (f.contentWindow)
		{
			wind =  f.contentWindow;
		}
		else if (f.window)
		{
			wind = f.window;
		}
		if (wind == w)
			return f;
		if (f.frames && f.frames.length >0)
		{
			for (var i=0; i< f.frames.length ; i++)
			{
				 var fm =  findFrameForWin(f.frames[i] , w);
				 if( fm != null)
					return fm;
			}
		}
		}
		catch(e)
		{}
		   
		return null;
	}

	// navigate the frames from the top down till we find a frame that its window is our win.
	function getFrameName(win)
	{
		
		var n = "";
		var f =  findFrameForWin(top,win);
		if ( f != null && f && f.name)
		{
			n = f.name;
		}

		return n;
	}

	function uriEndsWithClassName(uri) {
		var indexOfLastSlash = uri.lastIndexOf("/");
		if(indexOfLastSlash == -1 || (indexOfLastSlash+1) >= uri.length) {
			return false;
		}

		var subStr = uri.substring(indexOfLastSlash + 1);
		return subStr.pssStartsWith("com\.");
	}

	function uriContainsIViewChars(unescapeduri) {
		unescapeduri = unescapeduri.toLowerCase();
		return (unescapeduri.indexOf("%2f") != -1 ||
				unescapeduri.indexOf("!2f") != -1 ||
				unescapeduri.indexOf("%3f") != -1 ||
				unescapeduri.indexOf("!3f") != -1)
	}

	function getIViewFromURI(unescapeduri) {
		
        if( uriContainsIViewChars(unescapeduri)) {

			var uri = unescape(unescapeduri.replace(/!2[fF]/g, "%2f").replace(/!3[fF]/g, "%3f"));
			var queryStringIndex = uri.indexOf("?");

			if(queryStringIndex != -1) {
				uri = uri.substring(0, queryStringIndex);
			}
			
			return getTextAfterLastDotOrSlash(uri);
        }
        
        return null;
	}

	function getTextAfterLastDotOrSlash(uri)
	{
			var slashLastIndex = uri.lastIndexOf("/") + 1;
            
            var indexOfLastDot = uri.lastIndexOf(".") + 1;
			var iViewIndex = Math.max(slashLastIndex, indexOfLastDot);
			

            if (iViewIndex < uri.length) {
				return uri.substring(iViewIndex);
            }
			return null;
	}

	function isInTechnicalIViewExclude(iview) {

		if(iview != null) {
		  for (var i4w_index=0 ; i4w_index < defaultTechnicalIViewExcludList.length ; i4w_index++) {
			  if(defaultTechnicalIViewExcludList[i4w_index] == iview.toLowerCase()) {
				  return true;
			   }
		  }
		}
		return false;
	}

	function getExtenssion(uri){
		var indexOfLastDot = uri.lastIndexOf(".") + 1;		
		
		if(indexOfLastDot == 0) {
			return null;
		}

		if (indexOfLastDot < uri.length) {
			return uri.substring(indexOfLastDot);
		}
	}


	function isEmptySapTitle(title) {

		if(title == null) {
			return true;
		}

		title = title.pssTrim().toLowerCase();

		if(title == "") {
			return true;
		}

		for (var i4w_index=0 ; i4w_index < emptySapTitles.length ; i4w_index++) {
		  if( title.pssStartsWith(emptySapTitles[i4w_index]) ) {
			  return true;
		   }
		}
		
		return false;
	}

	function collectSapTitle(title) {
		var technicalIView = getIViewFromURI(location.pathname);
		var origLogicalView = null;
		var logicalIView = null;
		var newTitle = null;
		var f =  findFrameForWin(top,window);

		// special case - when technical name is "Launcher", the real name can be found at a loadingStr varaible.
		// we placed it here since the URL doesn't contain "iview chars" like %2f and !2f.
		var endOfPathname = getTextAfterLastDotOrSlash(location.pathname);
		if("launcher" == endOfPathname) {
				var iViewIdStr = CollectUserDefinedParameter("sap-bw-iViewID");
				if (iViewIdStr != null && iViewIdStr != "") {
					// take only the last part
					iViewIdStr = getTextAfterLastDotOrSlash(iViewIdStr);
					return iViewIdStr;
				}
				
		}


		if( !isInTechnicalIViewExclude(technicalIView) ) {

			if(uriContainsIViewChars(location.pathname) || (location.pathname.pssEndsWith("IviewModeProxy"))) {

				origLogicalView = f.name;
				// for cases of redirect iframes
				if (origLogicalView && origLogicalView.indexOf("iframe_Redirect") != -1 && "title" in f )
				{
					origLogicalView = f.title ;
				}
				
				// collect logical iview name from DOM
				if(uriContainsIViewChars(origLogicalView)) {
					logicalIView = getIViewFromURI(origLogicalView);
				}
				else {
					logicalIView = origLogicalView;
				}	
				
				// set newTitle varaible
				if(logicalIView != null && logicalIView != "" && !logicalIView.pssStartsWith("WID")) {
					newTitle = logicalIView.pssTrim();
				}
				else {

					newTitle = technicalIView;
				}
			}
			else if(uriEndsWithClassName(location.pathname)) {
				newTitle = getExtenssion(location.pathname);
			}
			
			// special case - when technical name is "tabcontent", the real name can be found at a display name varaible
			if("tabcontent" == newTitle) {
				var displayName = CollectUserDefinedParameter("displayName");
				if (displayName != null && displayName != "") {
					newTitle = "Tab Content - " + displayName;
				}
			}
			// special case - when technical name is "loading", the real name can be found at a loadingStr varaible
			else if("loading" == newTitle) {
				var loadingStr = CollectUserDefinedParameter("loadingStr");
				if (loadingStr != null && loadingStr != "") {
					newTitle = loadingStr;
				}
			}
			// special case - when logical name is 'isolatedWorkArea' but the real meaning is in the URL (technical iview)
			else if("isolatedWorkArea" == newTitle && technicalIView != null && technicalIView != "") {
				newTitle = technicalIView;
			}

			if(newTitle != null && newTitle != "") {
				title = newTitle;
				if(pssDebug) {
					alert("url='" + location.pathname + "'\n\nold Title='" + doc_obj.title + "'\nTechName = '" + technicalIView + 
						"'\norig frame name='" + origLogicalView + "'\nframe name='" + logicalIView + "'\n\ntitle='" + title + 
						"'\n\n outerHTML=" + (f?f.frameElement.outerHTML:""));
				}
			}		
		}

		return title;
	}

	////////////////////////////


    function getTitle() {
		var endOfPathname = getTextAfterLastDotOrSlash(location.pathname);

		var title = doc_obj.title;
		// if this is SAP &
		// if there is no title or the title is general "SAP Enterprise Portal 6.0" for example,
		// we will replace the title with the iview information from the URL
		if (technology ==  "1")
		{
			if (isEmptySapTitle(title) && "/irj/portal" != location.pathname) {
				title = collectSapTitle(title);
			}
			if ( "launcher" == endOfPathname)
			{
				// check the location of the iview title: (used to use evel and try-catch. this way we avoid both.
				if ((typeof QUERY_TITLE_TextItem != 'undefined') && ("innerText" in QUERY_TITLE_TextItem))
				{
					title = QUERY_TITLE_TextItem.innerText;
				}
				else // no iview title, try the technical name.
				{
					var iViewIdStr = CollectUserDefinedParameter("sap-bw-iViewID");
					if (iViewIdStr != null && iViewIdStr != "") {
						// take only the last part
						iViewIdStr = getTextAfterLastDotOrSlash(iViewIdStr);

						// if we have Title for the document, combine the doc title with the technical name
						if (title && title != "" && title != null)
						{
							title = title + " - " + iViewIdStr ;
						}
						else // use only technical name
						{
							title = iViewIdStr;
						}
					}
				}

			}

		}
			
		return "&T=" + encodeURIComponent(unescape(title));
    }

    /*
    returns the static data as string that can be passed to the collector.
    get the uuid value for client server correlation and set the instance id by the uuid value.
    */
    function GetDataString() {
		var tmpInstance = GetCookieFunc("I4WEB_IID");
		if (tmpInstance != null)
		{
			instance = tmpInstance;
		}
        // use the I4Web_md5_value instead of the md5 from the cookie.
        var md5Val = getMd5Value();
		var uuidValue = GetUuidFromMd5Val(md5Val);
		if(md5Val == null) {
			md5Val = "";
		}
		if ( uuidValue == null ) {
			uuidValue = "0";	
		}
		else {
			
			if (tmpInstance == null)
			{
				instance = getInstanceFromUUID(uuidValue);	
			}			
		}

		return new Array("W=" , escape(MoTextTime) , CO_OBJ.R ,
        CO_OBJ.U , CO_OBJ.D , CO_OBJ.M , CO_OBJ.V ,
        CO_OBJ.Q , CO_OBJ.CS , CO_OBJ.DCS ,
        CO_OBJ.CT , "&UUID=" , uuidValue , "&I=" , instance ,
        "&TEC=" , technology , "&STC=" , escape(unescape(md5Val))).join("");
    }  
	
    /*
    collect all dynamic data (data that is collected only after the page is rendered) and append i to the static data collected during init. 
    */
    function appendDynamicData(){
		I4w_DataString = new Array(
			I4w_DataString ,
			getFrameSetStr() ,
			getIsIFrame() ,
			getTitle() ,
			GetTechData() ,
			GetClientData() ,
			CollectUserDefinedData()).join("");
    }
    /*
    onload eventhandler. take a time stamp then collect the dynamic data then send the data to the collector.
    */
    function I4W_OnLoad(){
		
        if (IE_ONLOAD_EVENT == "true") 
			return;
		IE_ONLOAD_EVENT = "true";
		onLoadEventTimeStamp = (new Date()).getTime();
		if (onLoadEventTimeStamp <= MoTextTime ) 
			onLoadEventTimeStamp = MoTextTime + 1;
		setFrameSetFlag();
        if (!isFrameSet)
        {
            LoadApplet();
        }
        // collect the signed in user
        handleApplicationUser();
        // register for the onSubmit of forms to capture username
        I4W_registerOnSubmit();
        
		if (extraData == "1")
		{
			setTimeout("sendOnLoadToCollector()", 1000);
		}
		else
		{
			sendOnLoadToCollector();
		}
        
    }

	function sendOnLoadToCollector() {
		appendDynamicData();
/*		str = "E=1&K=" + PageKey + "&A=" + onLoadEventTimeStamp + "&" + DataString; */
		var str = "E=1&A=" + onLoadEventTimeStamp + "&" + I4w_DataString;
		SendByScript(s_id,str);		
	}


    /*
    onbeforeunload event handler. happens when a user is leaving a specific page (click a link, close the browser, enter a new url in the adress bar etc...)
    */
    function I4W_OnBeforeUnLoad() {
      
		/*
        delete the uuid cookie of the page before leaving the page. this is importent so we will have enough space for new cookies.
        */
		if ( doc_obj.cookie.indexOf(md5) != -1) {
			DeleteUuidRootCookieFunc(md5);
		}
		
		
		/*
		this time stamp will be the start time of the next page (if there is a next page)
		*/
		onBeforeUnloadEventTimeStamp = (new Date()).getTime();

        // collect the signed in user
	    handleApplicationUser();
		
		/*
		if the onbeforeunload happens before the onload event it means that the page was abandoned.
		
		*/
        if (IE_ONLOAD_EVENT == "false") {
			IsAbandon = "1";
			IE_ONLOAD_EVENT = "true";	  	
			if (onBeforeUnloadEventTimeStamp <= MoTextTime ){
				onBeforeUnloadEventTimeStamp = MoTextTime + 1;
			}
			appendDynamicData();
		}
		else {
			if (onBeforeUnloadEventTimeStamp <= onLoadEventTimeStamp ){
                onBeforeUnloadEventTimeStamp = onLoadEventTimeStamp + 1;
            }
		}

		if (onBeforeUnloadEventTimeStamp != 0 )
		{
			var str = "E=2&B=" + onBeforeUnloadEventTimeStamp + "&N=" + IsAbandon + "&" + I4w_DataString;
			SendByScript(s_id,str);			
		}
    }

	function SendByScript(session_id , data_string) {
		var tmp = [CH_OBJ.dataConnect, "?EBS=" , session_id , "&S=1&" , data_string].join("");
		// if the length is longer than 2048, the url will not be sent in IE. we drop the referer so at least we'll have client server correlation,
		// and first byte will probably be fixed by the server record.
		var len = tmp.length;
		if (len > 2048 && (DU_OBJ.browser == "Explorer" || DU_OBJ.browser == "Inquire") )
		{
			var R_ind = tmp.indexOf("&R=");
			var U_ind = tmp.indexOf("&U=");
			if (R_ind != -1 && U_ind != -1 && U_ind > R_ind)
			{
				tmp = tmp.substring(0,R_ind+3 ) + tmp.substring(U_ind);
			}
		}
		var DataImg = new Image();
		DataImg.src = tmp;

        if(DU_OBJ.browser == "Inquire") {
            try
            {
                DataImg.style.visibility = 'hidden';
                document.documentElement.insertAdjacentElement("beforeEnd", DataImg);
            }
            catch (e)
            {
            }
        }
    }

	function CollectUserDefinedData() {
		var tmp = "";
		var ret  = "";
		if (typeof(i4w_user_defined_1) !='undefined')
		{
			tmp = CollectUserDefinedDataByType(	i4w_user_defined_1);
			if (tmp != "" && tmp != null)
			{
				ret += "&UD1=" + tmp;
			}
		}
		if (typeof(i4w_user_defined_2)!='undefined')
		{
			tmp = "";
			tmp = CollectUserDefinedDataByType(	i4w_user_defined_2);
			if (tmp != "" && tmp != null)
			{
				ret += "&UD2=" + tmp;
			}	
		}
		return ret;
	}
	
	/*
	 * Handle application user - find the signed in user and put it in cookie
	 */
	function handleApplicationUser()
	{
	    // if current url is configured as a logout url, delete the aun cookie
	    if (isLogoffUrl())
	    {
	        DeleteRootCookieFunc(AUN_COOKIE_NAME);
	        return ;
	    }
	    if (!userCollectionEnabled)
	        return;
	        
	    // Exclude list
	    //todo.
	    
		if (collectedBy == "")
			collectedBy = userCollectionMethod; //will be added to the cookie
	    if (userCollectionMethod == "user defined client" && userCollectionUserDefined != null) // user configured specific collection from cookie/url/domElement
	    {
	        var udUser = CollectUserDefinedDataByType(userCollectionUserDefined);
	        if (udUser && udUser != "") // don't override aun, unless we've got a value.
	        {
	            aun = udUser;
	        }
	    }
	    else if (
	        userCollectionMethod == "siebel" ||
	         userCollectionMethod == "oracle applications" ||
	          userCollectionMethod == "peoplesoft" ||
	           userCollectionMethod == "sap" ||
	            userCollectionMethod == "automatic") // check this also in automatic, in case it is pkgApp, without cfg
	    {
	        /* packaged applications collection */
	        var appUser = getPkgAppUserFromLoginForm(); // collect from the known dom path
	        if (appUser == "" && aun == "" && GetCookieRaw(AUN_COOKIE_NAME) == null) // user was not set in previous page
	        {
	            // put here specific collections for packaged applications (other than taking from the login form)
	            if (technology ==  "1") {	 //sap
	                // we use this only if didn't find any user with form collection, as this one is not accurate.
	                // it bring bad results in hebrew, or when the user and display name are different.
	                appUser = GetSAPUser(this);			
	            }
	            else if (technology == "2") {// Oracle Applications
	            }
	            else if (technology == "4") {// siebel
	            }
	            else if (technology == "5") {//peoplesoft	
                    // use this only if we didn't find any user with form collection, as this one is not accurate.
                    // it bring bad results in hebrew, or when the user and display name are different.
                    if (PS_OBJ == null)
	                    PS_OBJ = new PeopleSoftObject();
                    appUser = PS_OBJ.userApplication;			
	            }
	        }
	        
	        if (appUser != "") // don't override aun, unless we've got a value.
	        {
	            aun = appUser;
	            // if the collection method is automatic and we collected from pkg apps, put the right one in collectedBy.
	            if (userCollectionMethod == "automatic")
	                collectedBy = technologyToCollectionMethodMap[technology]||"automatic";
	        }
	    }
	    
	    if (userCollectionMethod == "forms" ||
	        userCollectionMethod == "automatic" && (aun == "" || collectedBy=="forms")) // check this option if former collection didn't bring anything or brought from forms.
            {
                //search in forms
                var formsUser = collectAppUserInForms ();
                if (formsUser != "") // don't override aun, unless we've got a value.
                    aun = formsUser ;
                // if the collection method is automatic and we collected from forms, put "forms" in collectedBy.
                if (userCollectionMethod == "automatic")
                    collectedBy = "forms";
            }
	    // put the found user in cookie
	    if ("" != aun)
	    {
            doc_obj.cookie = [AUN_COOKIE_NAME , "=" , encodeURIComponent(aun), ":" , collectedBy , ";path=/"].join("");
        }
	}

    function I4W_registerOnSubmit()
    {
        var fullySucceeded = true;
        var frms = document.forms;
        // loop over forms and attach the onsubmit event.
        for (var formInd=0; formInd<frms.length ; formInd++) 
        {
            var form = frms[formInd];
		    if (form.addEventListener){
                form.addEventListener("submit", I4W_OnSubmit, false);
            } else if (form.attachEvent){
                var r = form.attachEvent("onsubmit", I4W_OnSubmit);
                fullySucceeded = fullySucceeded && r;
            }
        }
        return fullySucceeded; 
	}
	
	// called when form is about to submit. the user is probably filled here, and if not - the form will most likely won't submit.
	function I4W_OnSubmit()
	{
	    handleApplicationUser();
	}
	
	// check if this url is configured as logoff url, where we delete the user cookie.
	function isLogoffUrl()
	{
	    if (userCollectionMethod != "forms" || userCollectionForms == null)
	        return false;
	        
	    for (var i=0 ; i < userCollectionForms.length ; i++)
	    {
	        var item = userCollectionForms[i];
	        if (LOGOUT_TYPE != item.type)
	            continue;
	            
	        //type is LOGOFF, check the URL
	        if ("url" in item && currentUriMatches(item.url))
	        {
                return true;
	        }
	    }
	    
	    return false;
	}

    /*
        returns the value in the user field or empty string if not found.
    */
    function collectAppUserInForms ()
    {
        var formsConfig ;
		if (userCollectionMethod == "automatic")
		{
			if(userCollectionAutomatic != null)
			{
				// use automatic fields (if we'll use the same structure for automatic, just assign it to formsConfig)
				formsConfig = [{field: userCollectionAutomatic , type: LOGIN_TYPE}];
			}
            else
			{
                return ""; // no automatic, do nothing.
			}
		}
		else if (userCollectionForms != null)
        {
			formsConfig = userCollectionForms; // change this but leave it working for both forms and auto.
        }
		else
		{
			return ""; // no forms config, do nothing.
		}

	    var frms = document.forms ;
	    // each item is in the format
        // {url: <value>, type: <value>, field: <value>} //field can be comma separated and each item may contain form name.
        for(var configInd = 0; configInd <formsConfig.length ; configInd++) 
        {
            var item = formsConfig[configInd];
            if (("url" in item && !currentUriMatches(item.url)) || item.type != LOGIN_TYPE)
                continue;
            var possibleUserFieldNames = item.field.split(",");
            // iterate forms and check each possibleUserFieldNames value.
		    for (var formInd=0 ; formInd <frms.length ; formInd++)  
		    {
		        var form = frms[formInd];
		        if ("formName" in item && item.formName != form.name)
		            continue;
		        //todo: can check here the standard J2ee form authentication:
		        //      form.action == "j_security_check, form.j_username has value.
			    for (var key=0; key<possibleUserFieldNames.length ; key++ )
			    {
			        var fieldName = possibleUserFieldNames[key];
				    if (fieldName in form && form[fieldName].type == "text" )
				    {
					    var userValue = form[fieldName].value;
					    if (userValue != null && userValue.length >0)
					    {
    //    					alert(["found user field: form=",form.name , " name=" , fieldName , ", value=" , userValue].join(""));
					        return userValue ;  
					    }
				    }
			    }
		    }
		}
		return "";
    
    }
    
    // checks the uri against parameter that might be a wildcard.
    function currentUriMatches(urlWildcard)		
    {   
        try
    {   
        var urlPattern = new RegExp(wildcardToRegexp(urlWildcard))
        urlPattern.ignoreCase = true;
        if (sCleanURI.match(urlPattern))
            return true;
            //handle case of uri not starting with slash
		if (!urlWildcard.pssStartsWith("/"))
		{
			urlPattern = new RegExp(wildcardToRegexp("/" + urlWildcard))
			urlPattern.ignoreCase = true;
			if (sCleanURI.match(urlPattern))
				return true;
		}
    }
        catch(e) {}
        return false;
    }
    
    // user used wildcard with * to specify url for login/logout, convert it to RegExp, to use in the match method
	function wildcardToRegexp (wild)
	{
		// escape special chars like: $&.- which are special chars for regexp language
		// but we won't put here * which is our search character.
		var pattern = /[{}\(\)\^$&.\/\+\|\[\]\?]/g;
		var regexp = wild.replace( pattern, // second param is a function that gets the found string as $1
		function ($1)  { return "\\" + $1;});
		// we transform wildcards to regexp like this:
		//   * = .*
		regexp = regexp.replace(new RegExp("\\*", "g"),".*");
		// the string is from the beginning to the end
		regexp = "^" + regexp + "$";
		return regexp;
	}
    
	function CollectUserDefinedDataByType(ud) {
		try
		{
			
			if (ud[0] == "cookie-name")
			{
				return CollectUserDefinedCookie(ud[1]);
			}	
			else if (ud[0] == "parameter-name")
			{
				return CollectUserDefinedParameter(ud[1]);
			}
			else if (ud[0] == "dom-element")
			{
				return CollectUserDefinedDom(ud[1]);
			}	
		}
		catch (e)
		{
			return "";	
		}
		return "";
	}

	function CollectUserDefinedCookie(val) {
		var tmp = "";
		if (val != "")
		{
			tmp = GetCookieFunc(val);	
			if (tmp == null)
			    tmp = "";
		}
		return tmp;
	}

	function CollectUserDefinedParameter(val) {
		var tmp = "";
		if (val != "")
		{
			tmp = GetQueryVariable(val);
					
		}
		return tmp;
	}

	function CollectUserDefinedDom(val) {
		var tmp = "";
		try
		{
			if (val != "")
			{
				var value;
				if (typeof((value= eval(val))) == 'string')
				{
					tmp = value;
				}			
			}	
		}
		catch (e)
		{
			return tmp;
		}		
		return tmp;
	}

	// for dom values like myForm.username.value, no need to use eval - performance consuming. we can just use document["myForm"]["username"]["value"]
	function getValueFromSimpleDOM(val) {
		var value;
		if (val != "")
		{
			var obj = doc_obj;
			var valElements = val.split(".");
			for (var i=0; i<valElements.length  && typeof obj != 'undefined'; i++ )
			{
				 obj = obj[valElements[i]];
			}
		}

		if (typeof obj != 'undefined')
			return obj

		return "";

	}

function GetQueryVariable(variable) {
		  var query = window.location.search.substring(1);
		  var vars = query.split("&");
		  for (var i4w_index=0;i4w_index<vars.length;i4w_index++) {
			var pair = vars[i4w_index].split("=");
			if (pair[0] == variable) {
			  return pair[1];
			}
		  }
		  return "";		  
	}
	
    /*
    get the user connection type (Lan or Modem). currently only works on IE 5 and up and on win OS.
    */
    function getConnectionType(){
        var ConnectionType = "undefined";
		if (DU_OBJ.OS == "Windows" && DU_OBJ.browser == "Explorer" && DU_OBJ.version >= 5) {
			doc_obj.writeln(connectiontypecode);
			if (typeof(oClientCaps)!='undefined') {
				ConnectionType = oClientCaps.connectionType;
			}						
		}
		ConnectionType = ConnectionType.toLowerCase(); 
		if (ConnectionType == "lan")
		{
			ConnectionType = "2";
		}
		else if (ConnectionType == "offline")
		{
			ConnectionType = "1";
		}
		else if (ConnectionType == "modem")			
		{
			ConnectionType = "3";
		}
		else
		{
			ConnectionType = "0";
		}
		return ConnectionType;
    }
    
	
    /*
    get i3 instance id from server side uuid cookie. we are doing this to handle the problem of load balanced application when the js file is cached in the browser and will always report the same instance id no metter the actual server that handled the request. 
    */
    function getInstanceFromUUID (uuid) {
		var tmp = "";
		var tmpID = 0;
		if (uuid != null)
		{
			tmp = uuid.substring(uuid.length - 4);
			tmpID = parseInt(tmp,16);
			if (tmpID == "NaN" || tmpID <= 0)
			{
				tmpID = 0;
			}			
		}
		return tmpID;
	}
	
	/*
	get the application session id from the cookie (default cookie name is JSESSIONID) for SmartLink correlation.
	*/
	function GetTACSessionID() {
		var sessionid;
		var cookiestr = document.cookie;
		var arr = cookiestr.split(";");
		for (var index=0;index<arr.length ;index++ ){
			if ( arr[index].indexOf(session_cookie_name) != -1 ){
				var ar = arr[index].split("=");
				sessionid = ar[1];
				if ( sessionid != null ) {
					if (sessionid.length > 60) {
						sessionid = sessionid.substring(0,60);
					}
				}
				return sessionid;
			}
		}
		return null;
	}

    /* getPkgAppUserFromLoginForm
     * 
     * Try to take the username from the appropriate field in packaged applications.
     * In those applications we know the form name and the field name, so we can access it directly, with no need to search all forms.
     * Returns: the value of the field or "" if empty or not found.
     */    
    function getPkgAppUserFromLoginForm()
    {
        var appUser = "";
		var useEval = false;
		var defaultUserCollectionPkgAppUserFieldDomPath = "";
		//These are the values that are probably in the registry. for these values we can use a different approach than eval, so if the value in reg equals
		// to the default, we save the bad performance of eval.
		if (technology ==  "1") {//sap
			defaultUserCollectionPkgAppUserFieldDomPath = "logonForm.j_user.value";
		}
		else if (technology == "2") {// Oracle Applications
			defaultUserCollectionPkgAppUserFieldDomPath = "myForm.username.value##DefaultFormName.usernameField.value";
		}
		else if (technology == "4") {// siebel
			defaultUserCollectionPkgAppUserFieldDomPath = "SWEEntryForm.SWEUserName.value";
		}
		else if (technology == "5") {//peoplesoft	
			defaultUserCollectionPkgAppUserFieldDomPath = "login.userid.value";
		}

		// When the userCollectionPkgAppUserFieldDomPath is not filled from registry take this default
        if (userCollectionPkgAppUserFieldDomPath == null)
			userCollectionPkgAppUserFieldDomPath = defaultUserCollectionPkgAppUserFieldDomPath; 

	   // value from cfg is different than default, use eval. (good for cases that more complicated code is needed to fetch the user)
	   if (userCollectionPkgAppUserFieldDomPath != defaultUserCollectionPkgAppUserFieldDomPath)
		   useEval = true;

        // support multi values
        var domPaths = userCollectionPkgAppUserFieldDomPath.split(userCollectionPkgAppUserFieldDomPathDelimiter);
        for (var i=0 ; i < domPaths.length && appUser == "" ; i++)
        {
			if (useEval)
			{
	            appUser = CollectUserDefinedDom(domPaths[i]);
			}
			else
			{
				appUser = getValueFromSimpleDOM(domPaths[i]);
			}
			if (appUser != "")
				break;
        }
        return appUser;
    
    }


    /*
    prepare a string with SmartLink session id and specific technology data.
    currently the technology data is only for PeopleSoft but 
    the function can handle all other technologies.
    */
	function GetTechData() {
		var techdata="";
		// handleApplicationUser has already tried to collect the user and placed it in a cookie. 
		// The server side can decide to collect the user in a different way. we just use it if it's there.
		var appUser= GetCookieRaw(AUN_SERVER_COOKIE_NAME);
		
		if( appUser != null){
			if( appUser.length > 2 &&
				  ((appUser.charAt(0)=="'" && appUser.charAt(appUser.length-1)=="'") || 
				   (appUser.charAt(0)=="\"" && appUser.charAt(appUser.length-1)=="\""))  
			   )	
			{
				appUser=appUser.substring(1,appUser.length-1);			
			}
		}	
		
		var tacSessionID = GetTACSessionID();
		if (tacSessionID != null) {
			techdata += "&TAC=" + tacSessionID
		}
		if (technology ==  "1") {	 //sap
		}
        else if (technology == "2") {// Oracle Applications
        }
		else if (technology == "4") {// siebel
			techdata+= "&SIBView=" + escape(unescape(GetQueryVariable(siebelViewParamName)));
		}
		else if (technology == "5") {//peoplesoft	
            if (PS_OBJ == null) // it might be constructed on handleApplicationUser() called before.
    			PS_OBJ = new PeopleSoftObject();
			techdata+= "&PSDATAPage=" + PS_OBJ.page;
			techdata+= "&PSDATAComponent=" + PS_OBJ.component; 
			techdata+= "&PSDATAMenu=" + PS_OBJ.menu; 
		}

		if (appUser != null)
		{
	        techdata+= "&AUN=" + appUser;			
		}
		
		return techdata;
	}

	function GetSAPUser(element) {
		var user = "";
		try
		{
			var sapMessage = "";
			if ("welcome_message" in top)
			{
				sapMessage = top.welcome_message;
			}
			if (sapMessage == "" && element != null)
			{
				sapMessage = element.document.getElementById("welcome_message");
				if (sapMessage == null && element.parent && element.parent != element)
				{
					return GetSAPUser(element.parent);
				}
				
			}
			
			if (sapMessage != null && sapMessage != "")
			{
				var tmp = sapMessage.innerHTML;
				
				var idx = tmp.indexOf(" ");
				
				if (idx != -1)
				{
					
					user = tmp.substring(idx + 1);
				}
			}
			
			// remove the comma at the end
			user = user.pssTrim();
			if (user.pssEndsWith(","))
			    user = user.substring(0,user.length-1);
			
			return user;
			
		}
		catch (e)
		{
			
			return user;
		}
		
	}
    /*
    activate the signed applet function that collect the extended data 
    (real ip, machine name, OS login). and return a string ready to be passed to the collector.
    */
    function GetClientData() {
		var ret = "";
		try
		{
			
			if ( extraData == "1" ) {
				var applet = document.getElementById("i4web_applet");
				
				if (applet != null)
				{
					ret = applet.getInfo();
				}
			}		
			return ret;		
		}
		catch (e)
		{
			return ret;	
		}
	}

     /*
    write the signed applet code into the document only if 
    extended collection was selected during the installation and java is enabled in the browser. 
    */
    function LoadApplet() {
	
		if ( extraData == "1" ) 
        {
			if (JavaEnabled) 
            {
				try
				{
					var i4w_applet = document.createElement("APPLET");
					i4w_applet.height = '1';
					i4w_applet.width = '1';
					i4w_applet.codeBase =  CH_OBJ.appletbase;
					i4w_applet.archive = "ClientCGetInfo.jar";
					i4w_applet.code = "ClientC.class";
					i4w_applet.id = "i4web_applet";
					i4w_applet.name = "cxc";
					i4w_applet.Name = "cxc";
					i4w_applet.setAttribute("MAYSCRIPT","MAYSCRIPT");
					i4w_applet.appendChild(makeParam("CABBASE","ClientCGetInfo.cab"));
					document.body.appendChild(i4w_applet);
					if (DU_OBJ.browser == "Explorer" && typeof(doc_obj.cxc) == 'object'){
						document.cxc.style.display="none";
					}	
				}
				catch (e)
				{
				}
				
			}
		}
    }

	function makeParam(name, value)
	{
		var p = document.createElement("param");
		p.name = name;
		p.value = value;
		return p;
	}

	function CleanCache() {
		
	}

	function CleanCachePU() {
		
	}

    /*
    check if the page is a frameset page.
    create a string for passing this information to the collector 
    and set a boolean so we will know if we want to load the signed applet.
    the collector will not generate a record on frameset pages
    */
    function setFrameSetFlag(){
        if (document.body.tagName.toLowerCase() == 'frameset')
        {
            isFrameSet = true;
            return "&FS=1";    
        }
        else 
        {   
            isFrameSet = false;
            return "&FS=0"; 
        }
    }
    
    function getFrameSetStr() {
        if (isFrameSet)
            return "&FS=1";
        else
            return "&FS=0";     
    }
    
    /*
    check if the page contain iframes and create a string for passing this information to the collector.
    */ 
    function getIsIFrame(){
       if (typeof(doc_obj.frames) != 'undefined' )
		{
		   try
		   {
			   var fElem = doc_obj.frames.frameElement;
				if ((fElem != null) && (fElem != 'null'))
				{
					if (fElem.tagName.toLowerCase() == "iframe" )
					{
						return "&IFR=" + fElem.id;
					}
				}
			
		   }
		   catch (e)
		   {
		   }
		}        
		return "";
    }
        
    /*
    the function create a unique id (time in milli + random number + md5 of the userAgent).
    then set this id as a session cookie (only once a seesion on the first page.
    the purpose of the cookie creation is that the client collector will be able 
    to better manage sessions.
    */ 
    function setI4WSeesionCookie(){
        var r = (Math.round(Math.random()*899)+100);
        PageKey = MoTextTime + "-" + r;
        s_id = GetCookieFunc(sI4WSessionCookieName);
        if (s_id == null) 
        {
            var hashedUserAgent = calcMD5(nav_obj.userAgent);
            s_id = PageKey + hashedUserAgent;
            doc_obj.cookie = sI4WSessionCookieName + "=" + s_id + ";path=/";
        }	
    }
    
   
    /*
    remove unwanted pieces (;jsessionid=...) from the URI
    */
    function removeTextFromURI (uri, sIgnoreTextInURI){
        var separatorPos;
        var textPos = uri.indexOf(sIgnoreTextInURI);
        var cleanURI;
        if (-1 == textPos)
        {
            return uri;
        }

        /*
        separatorPos marks the end of the string to remove, for example, if the URI is:
        index.html;jsessionid=12345?what=ma&who=mi
        and the text to remove is initially ";jsessionid=" I will remove ";jsessionid=12345"
        */
        for (var i = 0; i < sParamsSeparators.length; i++)
        {
            separatorPos = uri.indexOf(sParamsSeparators.charAt(i), textPos);
            if (-1 != separatorPos)
            {
                break;
            }
        }
        if (-1 == separatorPos)
        {
            /*
            text is at the end of the URI - remove it
            */
            cleanURI = uri.substring(0, textPos);
        } else {
            /*
            text is before the params separator - remove it
            */
            cleanURI =  uri.substring(0, textPos);
            cleanURI += uri.substring(separatorPos);
        }
        return cleanURI;
    }

	function removeRefFromURI(uri)
	{
		var i = uri.lastIndexOf('#');
		if (i == -1)
			return uri;
		var s = uri.substr(0, i);
		return s;
	}

	function removeQuestionMarkFromEnd(uri)
	{
		var len = uri.length;
			
		if(uri.charAt(len-1) != '?')		
			return uri;

		var s = uri.substr(0, len-1);
		return s;
	}
	

    function I4W_Init () {
        /*
        Detect browser type, browser version and OS type
        */
        DU_OBJ.init();
        if (!Supported_Browsers_Object.isBrowserSupported()) {
            return;    
        }
        if (location.host == "") 
        {
		  return;	
        }	
	    var CookieEnabled = isCookieEnabled();
        if (CookieEnabled == false ) 
        {
		  return;
        }
        
        /* 
        Collect all the static data of the current page
        */
        CO_OBJ = new CollectObject();
        /*
        Create the connection string for connecting to the collector
        and loading the signed applet.
        */
        CH_OBJ = new ConnectHost();
		
        var uri = document.URL.substring(document.URL.indexOf("/",document.URL.indexOf("://")+3),document.URL.length);
        /*
        remove unwanted peices (by default ";jsessionid=") from the URI
        */
        var cleanURI = removeTextFromURI (uri, sIgnoreTextInURI);
		cleanURI = removeRefFromURI(cleanURI);
		sCleanURI = cleanURI;
        /*
        hash the page uri for client-server correlation
        */    
        md5 = getUriMD5(cleanURI);

        ///////////////////////////////////////////////////////////////////
        // This code  appends the pageUUID to the cookie "I4Web_uuid" that is
        // in the format i4web_uuid=<key>@<value>*<key>@<value>...
        // It is done first thing when the page loads so
        // all the sub components will go to the server with the cookie
        ///////////////////////////////////////////////////////////////////
        var foundInCookie = false;
        if ('I4Web_md5_value' in window && "" != I4Web_md5_value)
        {
            var newCookieVal = new Array(md5 , "@" , I4Web_md5_value , "*").join(""); // join is better than +
            var cookieVal = GetCookieFunc (UUID_COOKIE_NAME);
            var addedCookieLength = 0;
            if (cookieVal != null)
            {
                if (cookieVal.indexOf(md5 + "@") == -1)
                {
                    addedCookieLength = newCookieVal.length;
                    newCookieVal = cookieVal + newCookieVal; // append curr page uuid to cookie
                }
                else
                {
                    // @@@@
                    // The key is already in the cookie; this may be because we use the old correlation, where the server puts the cookie, or
                    // another frame had the same URL.
                    // A correction action should be taken here to distinguish between the pages.
                    // till then we leave the cookie value as is.
                    //in case it came from the cookie, don't stay with the zero value
                    foundInCookie = true;
                }

            }
            else
            {
                // we add the cookie the first time, the added length includes the cookie name
                addedCookieLength = UUID_COOKIE_NAME.length + newCookieVal.length + 1; // 1 for the = sign
				cookieVal = ""; // not to fail on NPE in cookieVal.length
            }
		    if (!foundInCookie )
		    {
		        if(typeof maxI4WebCookieSize != 'number' || cookieVal.length + addedCookieLength <= maxI4WebCookieSize)
			        document.cookie = UUID_COOKIE_NAME + "=" + newCookieVal+ ";path=/ ;" ;
		    }
        }

        /*
        set I4W session cookie the first page in the session for better
        session tracking. especially on frams
        */
        setI4WSeesionCookie();
        /*
        get initial static collected data as string that can be passed to the collector
        */	
		I4w_DataString = GetDataString();
		/*
        register I4W functions to the browser events
		*/
		I4W_addEventListener("load",I4W_OnLoad);
		I4W_addEventListener("beforeunload",I4W_OnBeforeUnLoad);
	}

	/*
	encode URI without encoding the "%" char
	*/
	function encodeURIWithExceptions(uri){
		var encURI = encodeURI(uri);
		return encURI.replace(/%25/g,"%");
	}

	/*
    create md5 representation from the page uri (the url without protocol,domain and port)
    */
    function getUriMD5(uri){
		 if ('I4Web_md5' in window && I4Web_md5.length > 0)
            return I4Web_md5;
        var uriForMd5 = encodeURIWithExceptions(uri);
        return calcMD5(uriForMd5);
    }

    function getMd5Value()
    {
        if ('I4Web_md5_value' in window && I4Web_md5_value.length > 0)
            return I4Web_md5_value;
        return GetMd5ValFromCookie(md5);
    }
    /*
    Entry point for the I4W code.
    */
    I4W_Init();	
})();
