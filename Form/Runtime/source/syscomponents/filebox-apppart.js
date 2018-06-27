// http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html

define(["jquery"], function(jQuery){

window.APPPART = (function($) {
    // Private variables
    var publicMembers = {}; //,
    //base = 10,
    //heightCalcModeDefault = 'offset',
    //heightCalcMode = heightCalcModeDefault;
    // Private methods
    function privateMethod() {
        // ...
    }

    function getParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)')
            .exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    };

    function getOffsetSum(elem) {
        var top = 0,
            left = 0

        while (elem) {
            top = top + parseInt(elem.offsetTop)
            left = left + parseInt(elem.offsetLeft)
            elem = elem.offsetParent
        }

        return {
            top: top,
            left: left
        }
    }

    function getOffsetRect(elem) {
        // (1)
        var box = elem.getBoundingClientRect()

        var body = document.body
        var docElem = document.documentElement

        // (2)
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

        // (3)
        var clientTop = docElem.clientTop || body.clientTop || 0
        var clientLeft = docElem.clientLeft || body.clientLeft || 0

        // (4)
        var top = box.top + scrollTop - clientTop
        var left = box.left + scrollLeft - clientLeft

        return {
            top: Math.round(top),
            left: Math.round(left),
            width: box.width,
            height: box.height
        }
    }

    function getOffset(elem) {
        if (elem.getBoundingClientRect) {
            return getOffsetRect(elem)
        } else { // old browser
            return getOffsetSum(elem)
        }
    }

    //... height calculation
    // document.documentElement.offsetHeight is not reliable, so
    // we have to jump through hoops to get a better value.
    //function getBodyOffsetHeight() {
    //    function getComputedBodyStyle(prop) {
    //        function convertUnitsToPxForIE8(value) {
    //            var PIXEL = /^\d+(px)?$/i;

    //            if (PIXEL.test(value)) {
    //                return parseInt(value, base);
    //            }

    //            var
    //                style = el.style.left,
    //                runtimeStyle = el.runtimeStyle.left;

    //            el.runtimeStyle.left = el.currentStyle.left;
    //            el.style.left = value || 0;
    //            value = el.style.pixelLeft;
    //            el.style.left = style;
    //            el.runtimeStyle.left = runtimeStyle;

    //            return value;
    //        }

    //        var
    //            el = document.body,
    //            retVal = 0;

    //        if (('defaultView' in document) && ('getComputedStyle' in document.defaultView)) {
    //            retVal = document.defaultView.getComputedStyle(el, null);
    //            retVal = (null !== retVal) ? retVal[prop] : 0;
    //        } else {//IE8
    //            retVal = convertUnitsToPxForIE8(el.currentStyle[prop]);
    //        }

    //        return parseInt(retVal, base);
    //    }

    //    return document.body.offsetHeight +
    //            getComputedBodyStyle('marginTop') +
    //            getComputedBodyStyle('marginBottom');
    //}
    //function getBodyScrollHeight() {
    //    return document.body.scrollHeight;
    //}
    //function getDEOffsetHeight() {
    //    return document.documentElement.offsetHeight;
    //}
    //function getDEScrollHeight() {
    //    return document.documentElement.scrollHeight;
    //}
    ////From https://github.com/guardian/iframe-messenger
    //function getLowestElementHeight() {
    //    var
    //        allElements = document.querySelectorAll('body *'),
    //        allElementsLength = allElements.length,
    //        maxBottomVal = 0,
    //        timer = new Date().getTime();

    //    for (var i = 0; i < allElementsLength; i++) {
    //        if (allElements[i].getBoundingClientRect().bottom > maxBottomVal) {
    //            maxBottomVal = allElements[i].getBoundingClientRect().bottom;
    //        }
    //    }

    //    timer = new Date().getTime() - timer;

    //    //log('Parsed ' + allElementsLength + ' HTML elements');
    //    //log('LowestElement bottom position calculated in ' + timer + 'ms');

    //    return maxBottomVal;
    //}
    //function getAllHeights() {
    //    return [
    //        getBodyOffsetHeight(),
    //        getBodyScrollHeight(),
    //        getDEOffsetHeight(),
    //        getDEScrollHeight()
    //    ];
    //}
    //function getMaxHeight() {
    //    return Math.max.apply(null, getAllHeights());
    //}
    //function getMinHeight() {
    //    return Math.min.apply(null, getAllHeights());
    //}
    //function getBestHeight() {
    //    return Math.max(getBodyOffsetHeight(), getLowestElementHeight());
    //}
    //var getHeight = {
    //    offset: getBodyOffsetHeight, //Backward compatability
    //    bodyOffset: getBodyOffsetHeight,
    //    bodyScroll: getBodyScrollHeight,
    //    documentElementOffset: getDEOffsetHeight,
    //    scroll: getDEScrollHeight, //Backward compatability
    //    documentElementScroll: getDEScrollHeight,
    //    max: getMaxHeight,
    //    min: getMinHeight,
    //    grow: getMaxHeight,
    //    lowestElement: getBestHeight
    //};
    //function getWidth() {
    //    return Math.max(
    //		document.documentElement.scrollWidth,
    //		document.body.scrollWidth
    //	);
    //}
    var statusListener = function(e) {
        //        console.log("APPPART Handler called.");
        //var messageData;
        try {
            //messageData = JSON.parse(e.data);
            var eventName = e.data[0];
            var data = e.data[1];
            //			console.log("APPPART Handler called. eventName=" + eventName + " data=" + data);
            if (eventName == 'owaSetHeight') {
                publicMembers.owaDocumentHeight = parseInt(data, 10);
                publicMembers.resize();
            }
        } catch (error) {
            //            console.log("Could not parse the message response:"+e.data);
            return;
        }
    }
    // Register the listener
    if (typeof window.addEventListener !== 'undefined') {
        window.addEventListener('message', statusListener, false);
    } else if (typeof window.attachEvent !== 'undefined') {
        window.attachEvent('onmessage', statusListener);
    }

    function resizeItemViewHeight1() {
        if (publicMembers.isAppPart == false) return 0; // safeguard to run only on hosting AppPart pages
        if (publicMembers.outerHeightControl == "windowHeight") {
            var w = window;
            var d = document;
            var e = d.documentElement;
            var g = d.getElementsByTagName('body')[0];
            var x = w.innerWidth || e.clientWidth || g.clientWidth;
            var y = w.innerHeight || e.clientHeight || g.clientHeight;
            var rect_contentBox = document.getElementById("contentBox").getBoundingClientRect();
            contentHeight = y - rect_contentBox.top - 50;
            //$("#sfpClientView2").css({ 'height' : (h-245)+'px'});
            $(".ms-srch-hover-viewerContainer").first().css({
                'min-height': (contentHeight - 75) + 'px'
            });
            var viewerContainer = document.getElementsByClassName("ms-srch-hover-viewerContainer");
            var cssText = "min-height:" + contentHeight - 75 + "px!important;";
            cssText += "border-style:solid; border-color:green;";
            //viewerContainer[0].style.cssText = cssText;
            return 0;
        }
        if (publicMembers.outerHeightControl == "documentHeight") {
            if ($("div.productInformation").length) {
                var propertiesContainer = document.getElementsByClassName("productInformation")[0];
                //                console.log("div.productInformation h=" + propertiesContainer.scrollHeight);
                var h = propertiesContainer.scrollHeight;
                var y = window.innerHeight - 120;
                var docHeight = (y > h) ? y : h;
                $(".ms-srch-hover-viewerContainer").first().css({
                    'min-height': docHeight + 'px'
                });
                return h + 120; // + TOOLBAR & HEADER
            } else {
                var h = 0;
                var y = window.innerHeight - 120;
                var docHeight = (y > h) ? y : h;
                $(".ms-srch-hover-viewerContainer").first().css({
                    'min-height': docHeight + 'px'
                });
                return y + 120; // + TOOLBAR & HEADER
                //var content = document.getElementById("contentBox");
                //return content.scrollHeight;
            }
        }
    }

    function resizeItemViewHeight2() {
        if (publicMembers.isAppPart == true) return 0; // safeguard to run only on hosting WIKI pages
        if (publicMembers.outerHeightControl == "windowHeight") {
            var w = window;
            var d = document;
            var e = d.documentElement;
            var g = d.getElementsByTagName('body')[0];
            var x = w.innerWidth || e.clientWidth || g.clientWidth;
            var y = w.innerHeight || e.clientHeight || g.clientHeight;
            var rect_contentBox = document.getElementById("contentBox").getBoundingClientRect();
            contentHeight = y - rect_contentBox.top - 50;
            //$("#sfpClientView2").css({ 'height' : (h-245)+'px'});
            $(".ms-srch-hover-viewerContainer").first().css({
                'min-height': (contentHeight - 75) + 'px'
            });
            var viewerContainer = document.getElementsByClassName("ms-srch-hover-viewerContainer");
            var cssText = "min-height:" + contentHeight - 75 + "px!important;";
            cssText += "border-style:solid; border-color:green;";
            //viewerContainer[0].style.cssText = cssText;
            return 0;
        }
        if (publicMembers.outerHeightControl == "documentHeight") {
            if ($("div.productInformation").length) {
                var propertiesContainer = document.getElementsByClassName("productInformation")[0];
                //               console.log("div.productInformation h=" + propertiesContainer.scrollHeight);
                var h = propertiesContainer.scrollHeight;
                var y = window.innerHeight - 120;
                var docHeight = (y > h) ? y : h;
                $(".ms-srch-hover-viewerContainer").first().css({
                    'min-height': docHeight + 'px'
                });
                return h + 120; // + TOOLBAR & HEADER
            } else {
                var h = 0;
                var y = window.innerHeight - 120;
                var docHeight = (y > h) ? y : h;
                $(".ms-srch-hover-viewerContainer").first().css({
                    'min-height': docHeight + 'px'
                });
                return y + 120; // + TOOLBAR & HEADER
                //var content = document.getElementById("contentBox");
                //return content.scrollHeight;
            }
        }
    }

    // Public properties and methods
    publicMembers.propertiesItemView = null;
    publicMembers.documentItemView = null;

    publicMembers.isAppPart = true; // TRUE = resizeable Item View is hosted on "iFramed" specially styled web page belonging to Client Web Part
    // FALSE = resizeable Item View is hosted on regular SharePoint WIKI page
    publicMembers.owaDocumentHeight = 0;
    publicMembers.expanded = false; // List or Item view
    publicMembers.outerHeightControl = ""; // windowHeight | documentHeight
    publicMembers.innerHeightControl = ""; // windowHeight | documentHeight
    publicMembers.innerItemPropertiesElem = null;
    publicMembers.innerItemDocumentElem = null;
    publicMembers.getitemviewheight = function() {
        if (publicMembers.isAppPart == true) return resizeItemViewHeight1();
        else return resizeItemViewHeight2();
    }
    publicMembers.setitemview = function() {
        //debugger;
        // safeguard to prevent errors as this will run prematurely on page load.
        // but will also be run after fetching search results - in which jQuery will be loaded.185
        if (typeof $ == 'undefined') {
            return;
        }
        if ($("#sfpClientView").length == 0) {
            $("#DeltaPlaceHolderMain").before("<div id='sfpClientView' class='ms-srch-hover-outerContainer' style='display:none;' ></div>"); //contentBox
            $("#DeltaPlaceHolderMain").before("<div id='sfpClientView2' style='display:none;' ></div>");
            publicMembers.owaDocumentHeight = 0;
        }
        $(document).ready(function() {
            APPPART.resize();
            $(window).resize(function(e) {
                
                //var rect_s4workspace = document.getElementById("s4-workspace").getBoundingClientRect();
                //console.log("Recent_Materials.aspx - s4-workspace width:" + rect_s4workspace.width + " height:" + rect_s4workspace.height);
                APPPART.resize();
            });
        });
    }
    // for APP PART
    function resize1() {
        //////////////////////////////////////////////////////////////////////////
        // Resize ItemView using APPHOST listener on hosting dashboard page.
        //////////////////////////////////////////////////////////////////////////
        if (publicMembers.expanded) {
            var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
            var message = {
                message: "",
                senderId: getParameterByName("SenderId")
            };
            message.message = "resize";
            message.width = document.body.clientWidth;
            //message.height = document.body.clientHeight;
            //debugger;
            //publicMembers.innerHeightControl = "windowHeight";
            message.height = publicMembers.getitemviewheight(); //resizeItemViewHeight1();

            //var content = document.getElementById("contentBox");
            //message.height = content.offsetHeight;


            //           console.log('APPPART.resize on expanded:' + JSON.stringify(message));
            target.postMessage(JSON.stringify(message), document.referrer);
            return false;
        }
        //////////////////////////////////////////////////////////////////////////
        // Resize ListView using Microsoft's listener on hosting dashboard page.
        //////////////////////////////////////////////////////////////////////////
        try {
            var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
            var width = "100%";
            var content = document.getElementById("contentBox");

            var height = {};
            //height.content = content.offsetHeight;
            //height.body = document.body.clientHeight;
            height.request = content.offsetHeight; //(height.content >= height.body) ? height.content : height.body;
            height.request += "px";
            //var height = content.offsetHeight + "px";//(document.body.clientHeight) + "px";//content.offsetHeight + "px";

            //            console.log('APPPART.resize on collapsed:' + JSON.stringify(height));
            target.postMessage('<message senderId=' + getParameterByName("SenderId") + '>resize(' + width + ',' + height.request + ')</message>', '*');
        } catch (e) {
            alert(e);
        }
    }
    // for WIKI page
    function resize2() {
        // var h;

        // var w = window,
        //     d = document,
        //     e = d.documentElement,
        //     g = d.getElementsByTagName('body')[0],
        //     x = w.innerWidth || e.clientWidth || g.clientWidth;

        // if(!/Android|webOS|iPhone|iPad|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        //   y = w.innerHeight || e.clientHeight || g.clientHeight;
        // } else{
        //   y = e.clientHeight;

        // }
        // delay to let sharepoint's code recalc dimensions
        setTimeout(function(){

            var workspace = document.getElementById("s4-workspace");

            $("#sfpClientView").css({ 
                "left":"10px",
                //"width": workspace.width(), 
                "right":"10px",
                "position": "fixed"  
            });
    //debugger;
    console.log('workspace Height: '+workspace.clientHeight);
            var div = document.querySelector(".ms-srch-hover-innerContainer2");
            var iframe = (div) ? div.querySelector("iframe") : null;
            if(iframe)
            $(iframe).css({ 
                "height": ((workspace.clientHeight - 100) + "px"),
                "width": "100%",
                "padding-left":"1px",
                'min-height': ((workspace.clientHeight - 100) + "px")
            });
        },100);
        
return;

console.log('x: '+x + ' y:'+y);
        var rect_contentBox = getOffset(document.getElementById("contentBox"));
console.log('rect_contentBox.top: '+rect_contentBox.top);        
        var windowHeight = y - rect_contentBox.top - 50;
console.log('windowHeight: '+windowHeight);
        if ($('#Cache').attr('contentBoxOffset') != undefined && $('#Cache').attr('contentBoxOffset') != '') {
            windowHeight = y - $('#Cache').attr('contentBoxOffset') - 50;
        }

        h = windowHeight;
        //Sales Force Branding
        if ($(".footer").length != 0) {
            //console.log("resize2 - sales force branding");
            //h = ($(".footer").first().position().top - $("#DeltaPlaceHolderMain").position().top - 55);
            //h = ($("#footer").position().top - $("#DeltaPlaceHolderMain").position().top - 55);
            //var dTop2 = $("#DeltaPlaceHolderMain").position().top - $("#s4-workspace").position().top;
            //h = ($("#s4-workspace").height() - $("#DeltaPlaceHolderMain").position().top - dTop2 - 55);
            //$("#sfpClientView").css({ 'height': h +'px' });

            var adjustedHeight = h - 185 - 19 + 65 - 30;
            if (publicMembers.owaDocumentHeight != 0)
                //h = publicMembers.owaDocumentHeight;
                adjustedHeight = publicMembers.owaDocumentHeight;

            // OOB contenjtRow div has padding-top: 19px

            publicMembers.adjustedHeight = adjustedHeight;
            //$("#sfpClientView2").css({ 'height' : (h-185)+'px'});
            $("#sfpClientView2").css({
                'height': (adjustedHeight) + 'px'
            });
            // div containing iframe
            if ($(".ms-srch-hover-viewerContainer").length)
                //$(".ms-srch-hover-viewerContainer").first().css({'min-height' : adjustedHeight+'px'});
                $(".ms-srch-hover-viewerContainer").first().css({
                    'height': adjustedHeight + 'px'
                });
            if ($("div.productInformation").length)
                $("div.productInformation").first().css({
                    'min-height': adjustedHeight + 'px'
                });
            if ($("div.mediaPlayerContainer").length) {
                //$('div.mediaPlayerContainer').css({'min-height' : adjustedHeight+'px'});
                $("div.mediaPlayerContainer").css({
                    'height': adjustedHeight + 'px'
                });
            }
            if ($("object.mediaPlayerVideoObject").length) {
                //$('object.mediaPlayerVideoObject').css({'min-height' : adjustedHeight +'px'});
                $('object.mediaPlayerVideoObject').css({
                    'height': adjustedHeight + 'px'
                });
            }
        }
        //Collaboration Branding
        else {
            //console.log("resize2 - collaboration branding");
            //			if( $("#footer").length != 0)
            //				h = ($("#footer").position().top - $("#DeltaPlaceHolderMain").position().top - 55);
            //			else {
            //				var dTop = $("#DeltaPlaceHolderMain").position().top - $("#s4-workspace").position().top;
            //				h = ($("#s4-workspace").height() - $("#DeltaPlaceHolderMain").position().top - dTop - 55);
            //			}			//w = $( "#DeltaPlaceHolderMain" ).width();
            //			$("#sfpClientView").css({ 'height': h +'px'});//, 'max-width': w });
            // OOB contenjtRow div has padding-top: 19px
            //			var adjustedHeight = h-245-19;
            var adjustedHeight = h - 65 - 19 - 30;
            if (publicMembers.owaDocumentHeight != 0)
                //h = publicMembers.owaDocumentHeight;
                adjustedHeight = publicMembers.owaDocumentHeight;

            //var adjustedHeight = h-135-19+70;
console.log("adjustedHeight = "+adjustedHeight);
            publicMembers.adjustedHeight = adjustedHeight;
            $("#sfpClientView2").css({
                'height': (adjustedHeight) + 'px'
            });
            // div containing iframe
            if ($(".ms-srch-hover-innerContainer2").length)
                //$(".ms-srch-hover-viewerContainer").first().css({'min-height' : adjustedHeight +'px'});
                $(".ms-srch-hover-innerContainer2").first().css({
                    'height': adjustedHeight + 'px'
                });
            // if ($(".ms-srch-hover-viewerContainer").length)
            //     //$(".ms-srch-hover-viewerContainer").first().css({'min-height' : adjustedHeight +'px'});
            //     $(".ms-srch-hover-viewerContainer").first().css({
            //         'height': adjustedHeight + 'px'
            //     });
            if ($("div.productInformation").length)
                $("div.productInformation").first().css({
                    'min-height': adjustedHeight + 'px'
                });
            if ($("div.mediaPlayerContainer").length) {
                //$('div.mediaPlayerContainer').css({'min-height' : (h-185)+'px'});
                $("div.mediaPlayerContainer").css({
                    'height': adjustedHeight + 'px'
                });
            }
            if ($("object.mediaPlayerVideoObject").length) {
                //$('object.mediaPlayerVideoObject').css({'min-height' : (h-185)+'px'});
                $('object.mediaPlayerVideoObject').css({
                    'height': adjustedHeight + 'px'
                });
            }

            //console.log('COLLAB');
        }
    }
    //CALLED BY ONRESIZE EVENT ON APPPART WINDOW, WHICH IS HOSTED IN IFRAME AND WHICH IS HOSTING CONTENT SEARCH LIST AND ITEM HOVER
    publicMembers.resize = function() {
//console.log("APPPART.resize");
//        if (publicMembers.isAppPart == true) return resize1();
//        else return resize2();
        resize2();
    };
    publicMembers.status = function(title, htmlbody, color) {
        var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
        var message = {
            message: "",
            senderId: getParameterByName("SenderId")
        };
        message.message = "SP.UI.Status.AddStatus";
        message.title = title;
        message.html = htmlbody;
        message.color = color;
        message.atBeginning = true;
        target.postMessage(JSON.stringify(message), document.referrer);
        return false;
    };
    publicMembers.notification = function(htmlbody) {
        var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
        var message = {
            message: "",
            senderId: getParameterByName("SenderId")
        };
        message.message = "SP.UI.Notify.AddNotification";
        message.title = htmlbody;
        message.isSticky = false;
        target.postMessage(JSON.stringify(message), document.referrer);
        return false;
    };
    publicMembers.expand = function(hostHeightControl) {
        var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
        var message = {
            message: "",
            senderId: getParameterByName("SenderId")
        };
        message.message = "expand";
        //height control type:
        // windowHeight - parent window height
        // documentHeight - parent document height
        // iframeContentHeight - containing document height;
        message.heightcontrol = hostHeightControl;

        publicMembers.expanded = true;
        publicMembers.outerHeightControl = hostHeightControl;
        target.postMessage(JSON.stringify(message), document.referrer);
        return false;
    };
    publicMembers.collapse = function() {
        var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
        var message = {
            message: "",
            senderId: getParameterByName("SenderId")
        };
        message.message = "collapse";
        publicMembers.expanded = false;
        target.postMessage(JSON.stringify(message), document.referrer);
        publicMembers.resize();
        return false;
    };
    //publicMembers.
    return publicMembers;
})(jQuery);
});