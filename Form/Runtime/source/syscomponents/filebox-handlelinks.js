"use strict";

define(['text!./../../../syscomponents/filebox-handlelinks.css', 'jquery'], function(cssString, $ ){

  var loadCSS = function(css) {
    var node = document.createElement('style');
    document.body.appendChild(node);
    node.innerHTML = css;
  };
  
  var getUrlParameter = function (name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

 
  var sandbox = getUrlParameter("Sandbox");

  var Medline = window.Medline = window.Medline || {};

  Medline.Utils = Medline.Utils || {};
  Medline.HandleLinks = Medline.HandleLinks || {};
  Medline.HandleLinks.hoverFileRenderer = "internalFileDetailsWrapper";

  //check and update content links
  Medline.HandleLinks.UpdateContentLinks = function (contentWrapper) {
    window.APPPART.isAppPart = false;
    window.APPPART.setitemview();
    //iterate though each anchor in the contentWrapper
    if(!sandbox)
    $("a", contentWrapper).each(function (index) {
      var hrefValue = $(this).attr('href');
      //handle anchors that are pointing to other internal documents with wopiframe
      if (typeof hrefValue !== typeof undefined &&
        hrefValue !== false &&
        hrefValue.toLowerCase().indexOf('https://collaboration.medline.com') != -1 &&
        hrefValue.toLowerCase().indexOf('_layouts/15/wopiframe') != -1 &&
        hrefValue.toLowerCase().indexOf('&action=') != -1) {

        var sourceDoc = hrefValue.toLowerCase().split('?sourcedoc=')[1];

        var iframeLink = hrefValue.split('&action=')[0] + getActionPreview(sourceDoc);


        $(this).attr('href', '#').attr('iframeLink', encodeURI(decodeURI(iframeLink)));
        $(this).addClass('iframeLink handleThisAnchor');
        //handle anchors that are pointing to other internal documents without wopiframe,nd skip the links with .aspx
      } else if (typeof hrefValue !== typeof undefined &&
        hrefValue !== false &&
        hrefValue.toLowerCase().indexOf('https://collaboration.medline.com') != -1 &&
        hrefValue.toLowerCase().indexOf('.aspx') == -1 &&
        hrefValue.toLowerCase().indexOf('.mp4') == -1 &&
        //check if this is supported file type
        (hrefValue.toLowerCase().indexOf('.pdf') != -1 ||
          hrefValue.toLowerCase().indexOf('.pptx') != -1 ||
          hrefValue.toLowerCase().indexOf('.potx') != -1 ||
          hrefValue.toLowerCase().indexOf('.ppt') != -1 ||
          hrefValue.toLowerCase().indexOf('.doc') != -1 ||
          hrefValue.toLowerCase().indexOf('.docx') != -1 ||
          hrefValue.toLowerCase().indexOf('.xls') != -1 ||
          hrefValue.toLowerCase().indexOf('.xlsm') != -1 ||
          hrefValue.toLowerCase().indexOf('.xlsx') != -1)
      ) {

        var iframeLink = getiframelink(hrefValue);
        $(this).attr('href', '#').attr('iframeLink', iframeLink);
        $(this).addClass('iframeLink handleThisAnchor');

        //handle image urls
      } else if (typeof hrefValue !== typeof undefined &&
        hrefValue !== false &&
        hrefValue.toLowerCase().indexOf('https://collaboration.medline.com') != -1 &&
        hrefValue.toLowerCase().indexOf('.aspx') == -1 &&
        hrefValue.toLowerCase().indexOf('.mp4') == -1 &&
        //check if this is supported image type
        hrefValue.toLowerCase().match(/\.(jpeg|jpg|gif|png|jfif|exif|tiff|gif|bmp)$/) != null) {

        $(this).attr('href', '#')
          .attr('imageLink', hrefValue)
          .attr('downloadLink', getiframelink(hrefValue));
        $(this).addClass('imageLink handleThisAnchor');
        //handle links pointing other site pages on same site
      } else if (typeof hrefValue !== typeof undefined &&
        hrefValue !== false &&
        hrefValue.toLowerCase().indexOf('.aspx') != -1 &&
        hrefValue.toLowerCase().indexOf('\/sitepages\/') != -1 &&
        hrefValue.toLowerCase().indexOf(_spPageContextInfo.webAbsoluteUrl.toLowerCase()) != -1) {
        $(this).attr('target', '_self');
        //handle mail to links not to open new tab
      } else if (typeof hrefValue !== typeof undefined &&
        hrefValue !== false && hrefValue.toLowerCase().indexOf('mailto:') != -1) {

        $(this).attr('target', '');
        //handle spa form links
      } else if (typeof hrefValue !== typeof undefined &&
        hrefValue !== false && spaform.checkUrl(hrefValue)) {
        $(this).attr('href', '#')
          .attr('spaformLink', hrefValue);
        $(this).addClass('spaformLink handleThisAnchor');

      } else if (typeof hrefValue !== typeof undefined &&
        hrefValue !== false) {

        $(this).attr('href', '#')
          .attr('externalLink', hrefValue);
        $(this).addClass('externalLink');
      }
    });

    //attach event listeners for anchor links
    eventListenerContentLink();
    //check if the current url is a copy link
    checkForCopyLinkUrl();
  };


  //attach listener to find the item from nav menu and avoid page refresh
  function eventListenerContentLink() {
    

    $('a.handleThisAnchor').off().on('click', function (event) {
      event.preventDefault();
      var internalFileToDisplay = {};

      if(!$(this).hasClass('spaformLink')){
        internalFileToDisplay.Title = $(this).text().toUpperCase();
        internalFileToDisplay.downloadLink = getDownloadLink(this);
      }

      internalFileToDisplay.copyLink = getCopyLink(this);

      //link for rendering preview
      if($(this).hasClass('iframeLink')){
        internalFileToDisplay.link = $(this).attr('iframeLink');

      }else if($(this).hasClass('imageLink')){
        internalFileToDisplay.imagePath = $(this).attr('imageLink');
      
      }else if($(this).hasClass('spaformLink')){
        internalFileToDisplay.spaformLink = $(this).attr('spaformLink');
      
        var errormessage = spaform.open({
          mode: 'NewForm', //'NewForm', 'DispForm', 'EditForm'
          //itemId: '29',
          listUrl: $(this).attr('spaformLink'),
          onCloseCallback: function () {
            if (window.location.href.toLowerCase().indexOf('&internalfilelink=') !== -1) {
              history.go(-1);
            }

            $('#sfpClientView').empty();
            $("#DeltaPlaceHolderMain").css('display', 'block');
            $("#sideNavBox").css('display', 'block');


          },
          parentId: 'spaform365'
        });

        if (errormessage) alert(errormessage);
      }

      $("#sfpClientView").html($("#" + Medline.HandleLinks.hoverFileRenderer).html());
      //viewModel.internalFileToDisplay(internalFileToDisplay);
      var bindEditProfileObj = bindHoverDetails(internalFileToDisplay);
      //change id
      ko.applyBindings(bindEditProfileObj, document.getElementById('internalFileDetails'));
      
      //set the CSS for preview
      /*
      $("#internalFileDetails iframe").css(
        {
          "min-height": $("#sfpClientView2").height() + "px",
          "height": ($("#sfpClientView2").height() + 20) + "px",
          "width": "100%"
        });

      $("#DeltaPlaceHolderMain").css("display", "none");
      
      $("#sfpClientView iframe").css(
        {
          "min-height": $("#sfpClientView2").height() + "px",
          "height": ($("#sfpClientView2").height() + 20) + "px",
          "width": "100%"
        });
      */
      $("#sfpClientView").css({ "display": "block" });

            $("#DeltaPlaceHolderMain").css('display', 'none');
            $("#sideNavBox").css('display', 'none');

      });
    
    /*
    $('a.externalLink').off().on('click', function (event) {
      event.preventDefault();
      var externalLink = $(this).attr('externalLink');
      //dont show dialog for video files
      if (externalLink.toLowerCase().match(/\.(mp3|mp4|flv|wmv|mov)$/)) {
        window.open(externalLink, '_target');
      } else {
        var myDialog = $("#externalLinkDialog").dialog({
          autoOpen: false,
          modal: true,
          resizable: false
        });
        myDialog.dialog({
          resizable: true,
          buttons: {
            Continue: function () {
              window.open(externalLink, '_target');
              myDialog.dialog("close");
            },
            Cancel: function () {
              myDialog.dialog("close");
            }
          },
          open: function (event, ui) {
            $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
            $(".ui-dialog").css("z-index", 1000);
          }
        });
        myDialog.dialog("open");
      }

    });
    */
    

  };

  function bindHoverDetails(internalFileToDisplay) {
    return {
      Title : ko.observable(internalFileToDisplay.Title),
      FilePath : ko.observable(internalFileToDisplay.link),
      DownloadLink : ko.observable(internalFileToDisplay.downloadLink),
      CopyLinkText : ko.observable('COPY LINK'),
      ShowCopyLink : ko.observable(false),
      CopyLinkUrl : ko.observable(internalFileToDisplay.copyLink),
      ImagePath : ko.observable(internalFileToDisplay.imagePath),
      SpaFormLink : ko.observable(internalFileToDisplay.spaformLink),
      ToggleCopyLink : function(data,event) {
        if(this.ShowCopyLink()){
          this.ShowCopyLink(false);
          this.CopyLinkText('COPY LINK');
        }else{
          this.ShowCopyLink(true);
          this.CopyLinkText('HIDE LINK');
          $(event.target).closest('.ms-srch-hover-actions').find('textarea').focus().select();
          $(event.target).closest('.ms-srch-hover-actions').find('textarea')[0].setSelectionRange(0, 9999);
        }
      },
      HoverClose : function(data,event) {

        $('#sfpClientView').empty();

        //spaform.close(this.SpaFormLink());

        //reset copy link divs and url
        this.CopyLinkUrl("");
        this.ShowCopyLink(false);
        this.CopyLinkText('COPY LINK');

        this.SpaFormLink('');

        //clear download link, title and iframelink
        this.DownloadLink('');
        this.Title('');
        this.FilePath('');

        if (window.location.href.toLowerCase().indexOf('&internalfilelink=') !== -1) {
          history.go(-1);
        }
        //switch divs
        //for image holder
        $("#DeltaPlaceHolderMain").css('display', 'block');
        $("#sideNavBox").css('display', 'block');


      }


    };
  };


  //get copy link based on the link clicked
  function getCopyLink(element){
    var copyLink = ""
    if (window.location.href.toLowerCase().toLowerCase().indexOf('&internalfilelink') != -1) {
      copyLink = window.location.href.toLowerCase();
    }

    if($(element).hasClass('iframeLink')){
      copyLink = $(element).attr('iframeLink').toLowerCase().split('&action')[0].replace('.aspx?sourcedoc=', '.aspx?sourceurl=');
      if ($(element).attr('iframeLink').toLowerCase().indexOf('sourcedoc=') != -1) {
          copyLink = window.location.href.toLowerCase().split('#itemview')[0] +
              '&InternalFileLink=' + $(element).attr('iframeLink').toLowerCase().split('sourcedoc=')[1];

      }
    }else if($(element).hasClass('imageLink')){
    copyLink = window.location.href.toLowerCase().split('#itemview')[0] +
                '&InternalFileLink=' + $(element).attr('imageLink').toLowerCase();
    }else if($(element).hasClass('spaformLink')){
      copyLink = window.location.href.toLowerCase().split('#itemview')[0] +
              '&InternalFileLink=' + $(element).attr('spaformLink').toLowerCase();
    }

    return copyLink;
  }


  //get download link based on the link clicked
  function getDownloadLink(element){
    var downloadLink = ""
    if($(element).hasClass('iframeLink')){
      downloadLink = $(element).attr('iframeLink').toLowerCase().split('&action')[0].replace('.aspx?sourcedoc=', '.aspx?sourceurl=');
      if (downloadLink.indexOf('_layouts/15/wopiframe.aspx?') != -1) {
        downloadLink = downloadLink.replace('_layouts/15/wopiframe.aspx?', '_layouts/15/download.aspx?')
      } else if (downloadLink.indexOf('_layouts/15/wopiframe2.aspx?') != -1) {
        downloadLink = downloadLink.replace('_layouts/15/wopiframe2.aspx?', '_layouts/15/download.aspx?')
      }
    }else if($(element).hasClass('imageLink')){
      downloadLink = $(element).attr('downloadLink').toLowerCase().split('&action')[0].replace('.aspx?sourcedoc=', '.aspx?sourceurl=');

      if (downloadLink.indexOf('_layouts/15/wopiframe.aspx?') != -1) {
        downloadLink = downloadLink.replace('_layouts/15/wopiframe.aspx?', '_layouts/15/download.aspx?')
      }
    }

    return downloadLink;
  }

  //function to check if this is a link to some internal file through copy link
  function checkForCopyLinkUrl() {
    var InternalFileLink = "";
    InternalFileLink = Medline.Utils.GetQueryStringParameter("InternalFileLink", window.location.toString());
    if (typeof InternalFileLink !== 'undefined' &&
        InternalFileLink !== '') {

        $("a.iframeLink").each(function (index) {
            if (decodeURIComponent($(this).attr('iframeLink')).toLowerCase().indexOf(InternalFileLink.toLowerCase()) != -1) {
                $(this).trigger('click');
                return false;
            }
        })

        $("a.imageLink").each(function (index) {
            if (decodeURIComponent($(this).attr('imageLink')).toLowerCase().indexOf(InternalFileLink.toLowerCase()) != -1) {
                $(this).trigger('click');
                return false;
            }
        })

        //check if this is spa form link
        $("a.spaformLink").each(function (index) {
            if (decodeURIComponent($(this).attr('spaformLink')).toLowerCase().indexOf(InternalFileLink.toLowerCase()) != -1) {
                $(this).trigger('click');
                return false;
            }
        })
    } else {
        //needed for browser forward button when moving for details with copy link
        $('#sfpClientView').empty();
        $("#DeltaPlaceHolderMain").css('display', 'block');
        $("#sideNavBox").css('display', 'block');

    }
  }



  //form the iframe src link for internal links
  function getiframelink(hrefValue) {
    var iframeLink = "";
    var a = $('<a>', { href: hrefValue })[0];
    var sourcedoc = a.pathname.substring(0, a.pathname.lastIndexOf("/"));
    sourcedoc = sourcedoc.substring(0, sourcedoc.lastIndexOf("/") + 1);
    if (a.pathname.indexOf('.xls') != -1 ||
      a.pathname.indexOf('.xlsm') != -1 ||
      a.pathname.indexOf('.xlsx') != -1) {
      sourcedoc = sourcedoc + '_layouts/15/WopiFrame2.aspx?sourcedoc=';
    } else {
      sourcedoc = sourcedoc + '_layouts/15/WopiFrame.aspx?sourcedoc=';
    }
    
    if(a.pathname.toLowerCase().indexOf('/lists/') != -1 && a.pathname.toLowerCase().indexOf('/attachments/') != -1){
      iframeLink = a.href.toLowerCase().split('/lists/')[0] + '/_layouts/15/WopiFrame2.aspx?sourcedoc=' + a.pathname + getActionPreview(a.pathname);
    }else{
      //ie needs extra slash
      if (window.navigator.userAgent.indexOf("MSIE ") > 0) {
        iframeLink = a.protocol + '//' + a.hostname + '/' + sourcedoc + '/' + a.pathname + getActionPreview(a.pathname);
      } else {
        iframeLink = a.protocol + '//' + a.hostname + sourcedoc + a.pathname + getActionPreview(a.pathname);
      }
    }
    //need encode,decode to fix links with foreign chracaters in ie
    return encodeURI(decodeURI(iframeLink));
  };


  //form the action preview based on the file extension
  function getActionPreview(sourceDoc) {
    var actionPreview = "";
    var sourceDoc = sourceDoc.toLowerCase();
    //preview for word, ppt, and pdf documents
    if (sourceDoc.indexOf('.pdf') != -1 ||
      sourceDoc.indexOf('.pptx') != -1 ||
      sourceDoc.indexOf('.potx') != -1 ||
      sourceDoc.indexOf('.ppt') != -1 ||
      sourceDoc.indexOf('.doc') != -1 ||
      sourceDoc.indexOf('.docx') != -1) {
      actionPreview = '&action=interactivePreview';
      //preview for excel documents
    } else if (sourceDoc.indexOf('.xls') != -1 ||
      sourceDoc.indexOf('.xlsm') != -1 ||
      sourceDoc.indexOf('.xlsx') != -1) {
      actionPreview = '&action=embedview';
      //no preview for other doc types
    }

    return actionPreview;
  };

  var getUrlParameter = function (name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

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
              <b><span data-bind="text:Title"></span></b>\n\
            </div>\n\
            <div class="ms-srch-hover-close">\n\
              <a class="ms-uppercase" href="javascript:void(0);" title="Close panel" data-bind="click:HoverClose">CLOSE</a>\n\
            </div>\n\
            <div id="linkurlplaceholder" class="ms-srch-hover-copylinkinner" data-bind="css:{showcopylinkinner : ShowCopyLink(),  hidecopylinkinner: !ShowCopyLink()}">\n\
              <div class="copyLinkMessage">Note : This link is for internal use only.</div>\n\
              <textarea id="copyDocumentLink" rows="3" readonly="true" data-bind="textInput:CopyLinkUrl,value: CopyLinkUrl"></textarea>\n\
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
  //var sandbox = getUrlParameter("Sandbox");
  if( !sandbox) {
    loadCSS( cssString);
    var fileName = 'attachment-preview';
    var attachmentMarkup = '<div id="' + fileName + '">' + pageLinksMarkup + '</div>';
    var attachments = document.querySelector("#spaform365-attachments");
    attachments.insertAdjacentHTML('afterbegin', attachmentMarkup);  
    //var attachments = document.querySelector("#s4-workspace");
    //attachments.insertAdjacentHTML('afterbegin', attachmentMarkup);  
  }

});