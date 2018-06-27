﻿<%-- The following 2 lines are ASP.NET directives needed when using SharePoint components --%>
<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>


<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
	<style>
	    .ms-cui-tabContainer {
		    display: none;
			z-index: 9;
	    }
	</style>
    <link rel="stylesheet" href="Form/Runtime/form-styles.css">
	<script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.userprofiles.js"></script>
	<script type="text/javascript">
	    top.listtitle = '<SharePoint:ListProperty Property="Title" runat="server"/>';
		top.listdefaultviewurl = '<SharePoint:ListProperty Property="DefaultViewUrl" runat="server"/>';
		top.listrelativefolderpath = '<SharePoint:ListProperty Property="RelativeFolderPath" runat="server"/>';
	</script>
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


	<script> top.startTime = Date.now(); </script>
	<script id="spaform365" type="text/javascript" src="Form/Runtime/require.js"></script>
	<script type="text/javascript" src="Form/Runtime/spaform.js"></script>
	<script>	
		spaform.open({
			//debug: true,
			parentId: 'spaform365'
		});
	</script>
</asp:Content>

