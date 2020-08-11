/*
## Copyright:  ©2003 MBH Solutions, Inc., All rights reserved.
## Filename: About.js

Summary:  Opens the "About this application" dialog box

Assumes that the client bulletin board is loaded

*/

function ffAboutDialog()
{
	var docpath= jjEngine + "/Version/Version.htm"
	window.open(docpath,'Version','toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=no,resizable=yes,width=400,height=475,top=150,left=150')
}

