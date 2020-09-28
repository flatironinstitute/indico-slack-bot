"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function convert(htmlText) {
  // define default styleConfig
  var linkProcess = null;
  var imgProcess = null;
  var headingStyle = 'underline'; // hashify, breakline

  var listStyle = 'indention'; // indention, linebreak

  var uIndentionChar = '-';
  var listIndentionTabs = 3;
  var oIndentionChar = '-';
  var keepNbsps = false;

  var populateChar = (ch, amount) => {
    var result = '';

    for (var i = 0; i < amount; i += 1) {
      result += ch;
    }

    return result;
  }; // or accept user defined config
  // TODO: Test if I can remove
  // if (!!styleConfig) {
  //   if (typeof styleConfig.linkProcess === "function") {
  //     linkProcess = styleConfig.linkProcess;
  //   }
  //   if (typeof styleConfig.imgProcess === "function") {
  //     imgProcess = styleConfig.imgProcess;
  //   }
  //   if (!!styleConfig.headingStyle) {
  //     headingStyle = styleConfig.headingStyle;
  //   }
  //   if (!!styleConfig.listStyle) {
  //     listStyle = styleConfig.listStyle;
  //   }
  //   if (!!styleConfig.uIndentionChar) {
  //     uIndentionChar = styleConfig.uIndentionChar;
  //   }
  //   if (!!styleConfig.listIndentionTabs) {
  //     listIndentionTabs = styleConfig.listIndentionTabs;
  //   }
  //   if (!!styleConfig.oIndentionChar) {
  //     oIndentionChar = styleConfig.oIndentionChar;
  //   }
  //   if (!!styleConfig.keepNbsps) {
  //     keepNbsps = styleConfig.keepNbsps;
  //   }
  // }
  // removel all \n linebreaks


  var tmp = String(htmlText).replace(/\n|\r/g, ' '); // remove everything before and after <body> tags including the tag itself

  var bodyEndMatch = tmp.match(/<\/body>/i);

  if (bodyEndMatch) {
    tmp = tmp.substring(0, bodyEndMatch.index);
  }

  var bodyStartMatch = tmp.match(/<body[^>]*>/i);

  if (bodyStartMatch) {
    tmp = tmp.substring(bodyStartMatch.index + bodyStartMatch[0].length, tmp.length);
  } // remove inbody scripts and styles


  tmp = tmp.replace(/<(script|style)( [^>]*)*>((?!<\/\1( [^>]*)*>).)*<\/\1>/gi, ''); // remove all tags except that are being handled separately

  /* eslint-disable no-useless-escape */

  tmp = tmp.replace(/<(\/)?((?!h[1-6]( [^>]*)*>)(?!img( [^>]*)*>)(?!a( [^>]*)*>)(?!ul( [^>]*)*>)(?!ol( [^>]*)*>)(?!li( [^>]*)*>)(?!p( [^>]*)*>)(?!div( [^>]*)*>)(?!td( [^>]*)*>)(?!br( [^>]*)*>)[^>\/])[^<>]*>/gi, '');
  /* eslint-enable no-useless-escape */
  // remove or replace images - replacement texts with <> tags will be removed also, if not intentional, try to use other notation

  tmp = tmp.replace(/<img([^>]*)>/gi, (str, imAttrs) => {
    var imSrc = '';
    var imAlt = '';
    var imSrcResult = /src="([^"]*)"/i.exec(imAttrs);
    var imAltResult = /alt="([^"]*)"/i.exec(imAttrs);
    /* eslint-disable prefer-destructuring */

    if (imSrcResult !== null) {
      imSrc = imSrcResult[1];
    }

    if (imAltResult !== null) {
      imAlt = imAltResult[1];
    }
    /* eslint-enable prefer-destructuring */


    if (typeof imgProcess === 'function') {
      return imgProcess(imSrc, imAlt);
    }

    if (imAlt === '') {
      return "![image] (".concat(imSrc, ")");
    }

    return "![".concat(imAlt, "] (").concat(imSrc, ")");
  });

  function createListReplaceCb() {
    return (match, listType, listAttributes, listBody) => {
      var liIndex = 0;

      if (listAttributes && /start="([0-9]+)"/i.test(listAttributes)) {
        liIndex = /start="([0-9]+)"/i.exec(listAttributes)[1] - 1;
      }

      var uIndention = populateChar(uIndentionChar, listIndentionTabs);
      var plainListItem = "<p>".concat(listBody.replace(/<li[^>]*>(((?!<li[^>]*>)(?!<\/li>).)*)<\/li>/gi, (str, listItem) => {
        var actSubIndex = 0;
        var plainListLine = listItem.replace(/(^|(<br \/>))(?!<p>)/gi, () => {
          if (listType === 'o' && actSubIndex === 0) {
            liIndex += 1;
            actSubIndex += 1;
            return "<br />".concat(liIndex).concat(populateChar(oIndentionChar, listIndentionTabs - String(liIndex).length));
          }

          return " < br / > $ {\n        uIndention\n      }\n      ";
        });
        return plainListLine;
      }), " </p>");
      return plainListItem;
    };
  } // handle lists


  if (listStyle === 'linebreak') {
    tmp = tmp.replace(/<\/?ul[^>]*>|<\/?ol[^>]*>|<\/?li[^>]*>/gi, '\n');
  } else if (listStyle === 'indention') {
    while (/<(o|u)l[^>]*>(.*)<\/\1l>/gi.test(tmp)) {
      tmp = tmp.replace(/<(o|u)l([^>]*)>(((?!<(o|u)l[^>]*>)(?!<\/(o|u)l>).)*)<\/\1l>/gi, createListReplaceCb());
    }
  } // handle headings


  if (headingStyle === 'linebreak') {
    tmp = tmp.replace(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, '\n$2\n');
  } else if (headingStyle === 'underline') {
    tmp = tmp.replace(/<h1[^>]*>(((?!<\/h1>).)*)<\/h1>/gi, (str, p1) => "\n&nbsp;\n".concat(p1, "\n").concat(populateChar('=', p1.length), "\n&nbsp;\n"));
    tmp = tmp.replace(/<h2[^>]*>(((?!<\/h2>).)*)<\/h2>/gi, (str, p1) => "\n&nbsp;\n".concat(p1, "\n").concat(populateChar('-', p1.length), "\n&nbsp;\n"));
    tmp = tmp.replace(/<h([3-6])[^>]*>(((?!<\/h\1>).)*)<\/h\1>/gi, (str, p1, p2) => "\n&nbsp;\n".concat(p2, "\n&nbsp;\n"));
  } else if (headingStyle === 'hashify') {
    tmp = tmp.replace(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, (str, p1, p2) => "\n&nbsp;\n".concat(populateChar('#', p1), " ").concat(p2, "\n&nbsp;\n"));
  } // replace <br>s, <td>s, <divs> and <p>s with linebreaks


  tmp = tmp.replace(/<br( [^>]*)*>|<p( [^>]*)*>|<\/p( [^>]*)*>|<div( [^>]*)*>|<\/div( [^>]*)*>|<td( [^>]*)*>|<\/td( [^>]*)*>/gi, '\n'); // replace <a href>b<a> links with b (href) or as described in the linkProcess function

  tmp = tmp.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a[^>]*>/gi, (str, href, linkText) => {
    if (typeof linkProcess === 'function') {
      return linkProcess(href, linkText);
    }

    return " [".concat(linkText, "] (").concat(href, ") ");
  }); // remove whitespace from empty lines excluding nbsp

  tmp = tmp.replace(/\n[ \t\f]*/gi, '\n'); // remove duplicated empty lines

  tmp = tmp.replace(/\n\n+/gi, '\n');

  if (keepNbsps) {
    // remove duplicated spaces including non braking spaces
    tmp = tmp.replace(/( |\t)+/gi, ' ');
    tmp = tmp.replace(/&nbsp;/gi, ' ');
  } else {
    // remove duplicated spaces including non braking spaces
    tmp = tmp.replace(/( |&nbsp;|\t)+/gi, ' ');
  } // remove line starter spaces


  tmp = tmp.replace(/\n +/gi, '\n'); // remove content starter spaces

  tmp = tmp.replace(/^ +/gi, ''); // remove first empty line

  while (tmp.indexOf('\n') === 0) {
    tmp = tmp.substring(1);
  } // put a new line at the end


  if (tmp.length === 0 || tmp.lastIndexOf('\n') !== tmp.length - 1) {
    tmp += '\n';
  }

  return tmp;
}

var _default = {
  convert
};
exports.default = _default;