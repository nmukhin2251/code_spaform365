"use strict";
define(["jquery"], function($){

var Medline = window.Medline = window.Medline || {};

Medline.Utils = Medline.Utils || {};
Medline.WebSiteSearch = Medline.WebSiteSearch || {};
Medline.WebSiteSearch.Resources = Medline.WebSiteSearch.Resources || {};
Medline.WebSiteSearch.Models = Medline.WebSiteSearch.Models || {};
Medline.WebSiteSearch.ViewModels = Medline.WebSiteSearch.ViewModels || {};
Medline.Utils.guidSortingOrder = [];
Medline.Utils.GetQueryString = function (location) {
  var qsStart = location.indexOf('?');
  if (location != -1) {
    return decodeURIComponent(location.substring(qsStart + 1).split('#').join(''));
  }
  else
    return '';
};

Medline.Utils.GetQueryStringParameter = function (param, location) {
  //var params = document.URL.split("?")[1].split("&");
  var params = Medline.Utils.GetQueryString(location).split("&");
  var strParams = "";
  for (var i = 0; i < params.length; i = i + 1) {
    var singleParam = params[i].split("=");
    if (singleParam[0].toLowerCase() == param.toLowerCase())
      return decodeURIComponent(singleParam[1]);
  }
  return "";
};
Medline.Utils.GetReworkedAppWebUrl = function (s) {
  s = s.substring(s.indexOf("//") + 2);
  return s.substring(s.indexOf("/"));
};

Medline.Utils.DisplayErrorMessage = function (error) {
  alert(error);
}

Medline.Utils.Log = function (message) {
  if (typeof console != "undefined") {
    console.log(message);
  }
};
Medline.Utils.GetSearchResultField = function (result, fieldName) {
  return Enumerable.From(result.Cells.results)
    .Where(function (field) { return field.Key === fieldName })
    .Select(function (field) { return field.Value })
    .FirstOrDefault();
}

Medline.Utils.GetTaxonomyPropertyObject = function (propertyValue) {
  var res = {};
  try {
    var items = propertyValue.split(';');
    for (var i = 0; i < items.length; i++) {
      var parts = items[i].split('|');
      if (parts[0] == 'L0') {
        res.displayName = parts[2].split(':')[parts[2].split(':').length - 1];
        res.guid = parts[1].split('#0')[1];
      }
    }
    return res;
  }
  catch (e) {
  }
}

Medline.Utils.sortAndDisplayMenuItems = function (termStoreArray, guidSortingOrder, departmentsMenuMaxLevel, DepartmentNavSelector) {
  var termStoreArrayNoSorting = [];
  var termStoreArrayNeedSorting = [];

  //seperate out arrays that need sorting and joing them
  $.map(termStoreArray, function (term) {
    if (guidSortingOrder.indexOf(term.guid) != -1) {
      termStoreArrayNeedSorting.push(term);
    } else {
      termStoreArrayNoSorting.push(term);
    }
  });
  Medline.Utils.guidSortingOrder = guidSortingOrder;
  var termStoreArraySorted = termStoreArrayNeedSorting.sort(Medline.Utils.customSort);
  //joing the arrays to build the nav menu
  termStoreArraySorted = termStoreArraySorted.concat(termStoreArrayNoSorting);

  Medline.Utils.buildDepartmentNav(termStoreArraySorted, departmentsMenuMaxLevel, DepartmentNavSelector);

}

//build department menu using the taxonomy term store
Medline.Utils.buildDepartmentNav = function (termStoreArr, departmentsMenuMaxLevel, DepartmentNavSelector) {
  var navString = '';
  var departmentsNavHtml = '';
  var mainLevelGuid = '';
  for (var menuLevel = 0; menuLevel < departmentsMenuMaxLevel; menuLevel++) {
    $.map(termStoreArr, function (item) {
      //for main level items
      if (item.level == menuLevel + 1 && menuLevel == 0) {
        departmentsNavHtml = departmentsNavHtml + "<li class='mainLevel' id='" + item.guid + "'><a href='#' termSetGuid='" + item.termSetGuid + "'>" + item.name + "</a></li>";
        //for sub levels need to search for parent
      } else if (item.level == menuLevel + 1) {
        if ($('ul', '#' + item.parentGuid).length) {
          $('ul', '#' + item.parentGuid).append("<li id='" + item.guid + "'><a href='#' termSetGuid='" + item.termSetGuid + "'>" + item.name + "</a></li>");
        } else {
          $('#' + item.parentGuid).append("<ul><li id='" + item.guid + "'><a href='#' termSetGuid='" + item.termSetGuid + "'>" + item.name + "</a></li></ul>");
        }

      }

    });
    if (menuLevel == 0) {
      $(DepartmentNavSelector).append(departmentsNavHtml);
    }
  }

}

//remove the empty links after all the results are fetched
Medline.Utils.removeEmptyLinks = function (searchResults, DepartmentNavSelector) {
  //debugger;
  //add list id and list item id to anchor tags in department menu
  $.map(searchResults, function (listItem) {
    //update with actual list id
    //item.ListID = '6F9CACB4-D5D4-42E8-A1F3-D7A2FA79AD3C';
    $('#' + listItem.navigation.guid).addClass('hasContent');
    $('#' + listItem.navigation.guid + '>a').attr('ListItemID', listItem.ListItemID).attr('ListID', listItem.ListID);

  });

  //remove links that dont have content tagged
  $("li", DepartmentNavSelector).each(function (index) {
    if (!$(this).hasClass('hasContent') && $('.hasContent', this).length == 0) {
      $(this).remove();
    }
  });
};

//set the department menu to be high lighted
Medline.Utils.highlightDepartmentMenu = function (searchResult, DepartmentNavSelector) {
  //high light the menu item
  $("li", DepartmentNavSelector).each(function (index) {
    var ListIDAttr = $(this).find('>a').attr('listid');
    var ListItemIDAttr = $(this).find('>a').attr('listitemid');
    if (typeof ListIDAttr !== typeof undefined && ListIDAttr !== false &&
      typeof ListItemIDAttr !== typeof undefined && ListItemIDAttr !== false &&
      ListIDAttr == searchResult.ListID &&
      ListItemIDAttr == searchResult.ListItemID) {
      $(this).addClass('active');
      $(this).parentsUntil("li.mainLevel").addClass('active');
      $("li.active", DepartmentNavSelector).not(".mainLevel").find(">a").next().slideToggle();
    }
  });

};

//check and update content links
Medline.Utils.updateDepartmentLinks = function (contentWrapper,ListID, guid) {
  //remove links that dont have content tagged
  $("a", contentWrapper).each(function (index) {
    var hrefValue = $(this).attr('href');
    //handle anchors that use authoring links
    if (typeof hrefValue !== typeof undefined && hrefValue !== false && hrefValue.indexOf('www.contentlink.com\/?id=') != -1) {
      var id = hrefValue.split('?id=')[1];
      /*var newHrefValue = window.location.protocol +'//'+
                            window.location.hostname +
                            window.location.pathname +
                            '?ListID='+encodeURI(ListID)+
                            '&ListItemID='+hrefValue.split('?id=')[1]+
                            '&termSetGuid='+guid;*/
      $(this).attr('href', '#')
        .attr('ListID', ListID)
        .attr('ListItemID', hrefValue.split('?id=')[1])
        .attr('termSetGuid', guid);
      $(this).addClass('linkToAnotherItem');
    }
    //handle anchors that use browser url copy links
    else if (typeof hrefValue !== typeof undefined &&
      hrefValue !== false &&
      hrefValue.toLowerCase().indexOf('listid') != -1 &&
      hrefValue.toLowerCase().indexOf('listitemid') != -1 &&
      hrefValue.toLowerCase().indexOf('termsetguid') != -1 &&
      ListID == Medline.Utils.GetQueryStringParameter('ListID', hrefValue) &&
      hrefValue.toLowerCase().indexOf(_spPageContextInfo.serverRequestPath.toLocaleLowerCase()) != -1
    ) {
      $(this).attr('href', '#')
        .attr('ListID', Medline.Utils.GetQueryStringParameter('ListID', hrefValue))
        .attr('ListItemID', Medline.Utils.GetQueryStringParameter('ListItemID', hrefValue))
        .attr('termSetGuid', Medline.Utils.GetQueryStringParameter('termSetGuid', hrefValue));
      $(this).addClass('linkToAnotherItem');
    }

    //handle anchors that are pointing to other internal documents with wopiframe
    /*else if (typeof hrefValue !== typeof undefined &&
      hrefValue !== false &&
      hrefValue.toLowerCase().indexOf('https://collaboration.medline.com') != -1 &&
      hrefValue.toLowerCase().indexOf('_layouts/15/wopiframe') != -1 &&
      hrefValue.toLowerCase().indexOf('&action=') != -1) {

      var sourceDoc = hrefValue.toLowerCase().split('?sourcedoc=')[1];

      var iframeLink = hrefValue.split('&action=')[0] + getActionPreview(sourceDoc);


      $(this).attr('href', '#').attr('iframeLink', encodeURI(decodeURI(iframeLink)));
      $(this).addClass('iframeLink');
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
      $(this).addClass('iframeLink');

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
      $(this).addClass('imageLink');
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
      $(this).addClass('spaformLink');

    } else if (typeof hrefValue !== typeof undefined &&
      hrefValue !== false) {

      $(this).attr('href', '#')
        .attr('externalLink', hrefValue);
      $(this).addClass('externalLink');
    }*/




  });
};

//form the iframe src link for internal links
/*function getiframelink(hrefValue) {
  var iframeLink = "";
  //iframeLink = "https://collaboration.medline.com/department/sales/materials/_layouts/15/WopiFrame.aspx?sourcedoc=/department/sales/materials/Sales%20Documents/Letterhead-NoAddress.docx&action=interactivePreview";
  //https://collaboration.medline.com/development/salesauthoring/Sales%20Documents/Copy of SOURCE R16 Regression.xlsx
  // The magic: create a new anchor element, and set the URL as its href attribute.
  // Notice that I am accessing the DOM element inside the jQuery object with [0]:
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

  //ie needs extra slash
  if (window.navigator.userAgent.indexOf("MSIE ") > 0) {
    iframeLink = a.protocol + '//' + a.hostname + '/' + sourcedoc + '/' + a.pathname + getActionPreview(a.pathname);
  } else {
    iframeLink = a.protocol + '//' + a.hostname + sourcedoc + a.pathname + getActionPreview(a.pathname);
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
};*/

Medline.Utils.customSort = function (a, b) {
  if ((Medline.Utils.guidSortingOrder.indexOf(a.guid) != -1) && (Medline.Utils.guidSortingOrder.indexOf(b.guid) != -1) && (Medline.Utils.guidSortingOrder.indexOf(a.guid) < Medline.Utils.guidSortingOrder.indexOf(b.guid)))
    return -1;
  if ((Medline.Utils.guidSortingOrder.indexOf(a.guid) != -1) && (Medline.Utils.guidSortingOrder.indexOf(b.guid) != -1) && (Medline.Utils.guidSortingOrder.indexOf(a.guid) > Medline.Utils.guidSortingOrder.indexOf(b.guid)))
    return 1;
  return 0;
}
});