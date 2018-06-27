<%-- The following 2 lines are ASP.NET directives needed when using SharePoint components --%>
<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>


<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
	<style>
	    .ms-cui-tabContainer {
		    display: none;
			z-index: 9;
	    }
		#suiteBar, #s4-ribbonrow, #s4-titlerow {
			display: none;
		}
	</style>
    <link rel="stylesheet" href="form-styles.css">
	<script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.userprofiles.js"></script>
</asp:Content>


<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
	<span class="die">
		<SharePoint:ListProperty Property="LinkTitle" runat="server" id="ID_LinkTitle"/>
	</span>
</asp:Content>

<asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">
    <SharePoint:ScriptLink name="clienttemplates.js" runat="server" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink name="clientforms.js" runat="server" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink name="clientpeoplepicker.js" runat="server" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink name="autofill.js" runat="server" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink name="sp.js" runat="server" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink name="sp.runtime.js" runat="server" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink name="sp.core.js" runat="server" LoadAfterUI="true" Localizable="false" />


	 <style type="text/css" media="screen">
		.codeeditor {
			margin: 0;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}
		#formContainer {
			position: fixed;
			top:0px;
			left:0px;
			background-color: white;
			width: 100%;
			height: 100%;
			z-index: 100000;
		}
	</style>
	<div id="formpanel">	
		<div id="formHeader"  style="display:none;" class="ms-font-xxl ms-fontColor-themePrimary">
			<b><span id="headerFormId" ></span><span>&nbsp;&nbsp;</span></b>
			<b><span id="headerFormTitle"></span></b>
			<b><span id="headerFormStatus" style="float:right;"></span></b>
		</div>
		<div id="formContainer">
		</div>
	</div>	
<div id="designertemplates"></div>\n\
<div id="ppanel"></div>
<div id="epanel"></div>
	<script>
		//top.startTime = Date.now();
		//console.log("offset: +" + (Date.now() - top.startTime) +" - model.sandbox.aspx: " + "loaded");	

		var require = {
			//baseUrl: './Form/Runtime/',
			paths: {
				designercache: 'designercache',
				'form-loader-sandbox': 'form-loader-sandbox.js'
			}
		};
		// data-main="designercache!startupsandbox.js"
	</script>
	<script type="text/javascript" data-main="../Runtime/source/designer/startup-sandbox.js" src="source/require_spaforms.js"></script>


</asp:Content>

