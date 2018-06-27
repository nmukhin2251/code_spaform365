<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>
<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>
<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>


<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
	<script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.userprofiles.js"></script>
	<script type="text/javascript">
	    window.listtitle = '<SharePoint:ListProperty Property="Title" runat="server"/>';
	</script>
    <script type="text/javascript" src="jquery-1.10.2.min.js"></script>
	<script id="spaform365" type="text/javascript" src="require.js"></script>
	<script type="text/javascript" src="spaform.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
	<WebPartPages:AllowFraming ID="AllowFraming" runat="server" />
</asp:Content>

<asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">
	<input id = "fileSelector" style="display:none;" type="file" onchange="openFile(event)" ></input>
	<script>		
		spaform.open({
			//debug: false,
			mode: 'proxy', //'NewForm', //'NewForm', 'DispForm', 'EditForm'
			//itemId: '30',
			//listUrl: 'https://collaboration.medline.com/development/nmukhin/Lists/C0',
			//onCloseCallback: function() {alert('FORM CLOSED!');},
			parentId: 'spaform365'
		});
	</script>
</asp:Content>
