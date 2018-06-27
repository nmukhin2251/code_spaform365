define(['require', 'spaform', 'ribbon-attachment'], function( require, SPAFORM, ribbon) {

	"use strict";
	
	var Attachments = function(ribbon) {
		this.attachments = {};
		this.ribbon = ribbon;
	};

	(function() {
		this.addAttachment = function ( fileName) {
			var fn = fileName.toLowerCase();
			var attachment = this.attachments[fn] = new Attachment(fn);			
			return attachment;
		};
		this.getAttachment = function ( fileName) {
			var fn = fileName.toLowerCase();
			return (this.attachments[ fn]) ? this.attachments[fn] : this.addAttachment(fn);
		};
		this.getAllAttachments = function ( fileName) {
			return this.attachments;
		};
	}).call(Attachments.prototype);

	var Attachment = function(fileName) {
		var _this = this;

		this.fileName = fileName.toLowerCase();			
		this.createPage(ribbon);
		this.showPage();	

		return {
			close: 		function() { _this.closeAttachment(); },
			show: 		function() { _this.showPage(); },
			hide: 		function() { _this.hidePage(); },
			select: 	function() { _this.selectAttachment(); },
			download:   function() {
				console.log('download');
			},
			copylink:   function() {
				console.log('copylink');
			},
			element: 	_this.getMarkupElement(),
			name: 		_this.fileName,
			id: 		_this.getTabCommandId()
		}
	};

	(function() {
		this.createPage = function (ribbon) {

			this.createMarkup();

			this.ribbon = new ribbon( {
				Title: this.fileName,
				Require: {
					name: this.fileName
				}
			});			
			this.ribbon.onSelected(function(r){
				console.log('onSelected ' );
			});

		};
		this.createMarkup = function() {
			var pageLinksMarkup =  '\
				<div id="internalFileDetailsWrapper" style="display:none;">\n\
					<div id="internalFileDetails">\n\
						<div class="ms-srch-hover-innerContainer2">\n\
							<div class="ms-srch-hover-actions">\n\
								<!-- ko if: DownloadLink -->\n\
									<div class="ms-srch-hover-action">\n\
										<a class="ms-uppercase download" data-bind="attr: {href: DownloadLink }">DOWNLOAD</a>\n\
									</div>\n\
								<!-- /ko -->\n\
								<div class="ms-srch-hover-action copyLinkContainer">\n\
									<a class="ms-uppercase copyLink" href="javascript:void(0);" data-bind="click:ToggleCopyLink,text: ShowCopyLink() ? '+ "'HIDE LINK'" + ' : ' + "'COPY LINK'" + '></a>\n\
								</div>\n\
								<div class="ms-srch-hover-close">\n\
									<a class="ms-uppercase" href="javascript:void(0);" title="Close panel" data-bind="click:HoverClose">back</a>\n\
								</div>\n\
								<div id="linkurlplaceholder" class="ms-srch-hover-copylinkinner" data-bind="css:{showcopylinkinner : ShowCopyLink(),  hidecopylinkinner: !ShowCopyLink()}">\n\
									<div class="copyLinkMessage">Note : This link is for internal use only.</div>\n\
									<textarea id="copyDocumentLink" rows="3" readonly="true" data-bind="textInput:CopyLinkUrl,value: CopyLinkUrl"></textarea>\n\
								</div>\n\
							</div>\n\
							<div class="ms-srch-hover-header">\n\
								<div class="Heading" >\n\
									<h1 data-bind="attr: {title: Title },text:Title"></h1>\n\
								</div>\n\
							</div>\n\
							<!-- ko if: ImagePath -->\n\
								<img class="intranetImageHolder" data-bind="attr: {src: ImagePath }" alt="Intranet Image" />\n\
							<!-- /ko -->\n\
							<!-- ko if: FilePath -->\n\
								<iframe data-bind="attr: {src: FilePath }" scrolling="no" frameborder="0px" class="ms-srch-hover-viewer" style="display: block;"></iframe>\n\
							<!-- /ko -->\n\
						</div>\n\
					</div>\n\
				</div>\n\
			';

			var markup = '<div id="' + this.fileName + '">' + pageLinksMarkup + '</div>';
			var elm = document.querySelector("#spaform365-attachments");
			elm.insertAdjacentHTML('afterbegin', markup);
		};
		this.deleteMarkup = function() {			
			var elm = this.getMarkupElement();
			if( elm) elm.parentNode.removeChild(elm);
		};
		this.closeAttachment = function() {
			this.hidePage();			
			this.ribbon.close();
			this.deleteMarkup();
			return;
		};
		this.selectAttachment = function() {
			this.showPage();
			this.ribbon.select();
			return this;
		};
		this.getMarkupElement = function() {			
			return document.querySelector('#' + this.fileName);;
		};
		this.hidePage = function() {
			this.getMarkupElement().style.display = 'none';
		};
		this.showPage = function() {
			this.getMarkupElement().style.display = 'block';
		};
		this.getTabCommandId = function() {
			var ribbonId = 'FormAttachment';
			return ribbonId + '.Command.Tab.' + this.fileName.toLowerCase();
		};
	}).call(Attachment.prototype);
	
	
	// constructor
	var createAttachments = function( ) {

		//var f = SPAFORM().form;
		//var _this = this;
		var attachments = new Attachments(ribbon);
		
		return {
			get: function(fileName) {							
				return attachments.getAttachment(fileName);
			},
			onSelected: function(callback) {
				$(document).on('ribbontabselected', function(e, commandId) {

					var atts = attachments.getAllAttachments();
					var attachment = undefined;
					
					for( var fileName in atts) {
						if( atts[fileName].id != commandId) atts[fileName].hide();						
						else {
							attachment = atts[fileName];
							attachment.show();	
						};
					}
					if( typeof callback === 'function' && attachment) callback(attachment);
				});	
				return this;
			}
		}
	}

	return createAttachments;
	
});	
