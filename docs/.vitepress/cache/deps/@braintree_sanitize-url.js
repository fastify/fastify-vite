import {
  __commonJS
} from "./chunk-76J2PTFD.js";

// ../node_modules/.pnpm/@braintree+sanitize-url@6.0.4/node_modules/@braintree/sanitize-url/dist/index.js
var require_dist = __commonJS({
  "../node_modules/.pnpm/@braintree+sanitize-url@6.0.4/node_modules/@braintree/sanitize-url/dist/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sanitizeUrl = exports.BLANK_URL = void 0;
    var invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
    var htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g;
    var htmlCtrlEntityRegex = /&(newline|tab);/gi;
    var ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
    var urlSchemeRegex = /^.+(:|&colon;)/gim;
    var relativeFirstCharacters = [".", "/"];
    exports.BLANK_URL = "about:blank";
    function isRelativeUrlWithoutProtocol(url) {
      return relativeFirstCharacters.indexOf(url[0]) > -1;
    }
    function decodeHtmlCharacters(str) {
      var removedNullByte = str.replace(ctrlCharactersRegex, "");
      return removedNullByte.replace(htmlEntitiesRegex, function(match, dec) {
        return String.fromCharCode(dec);
      });
    }
    function sanitizeUrl(url) {
      if (!url) {
        return exports.BLANK_URL;
      }
      var sanitizedUrl = decodeHtmlCharacters(url).replace(htmlCtrlEntityRegex, "").replace(ctrlCharactersRegex, "").trim();
      if (!sanitizedUrl) {
        return exports.BLANK_URL;
      }
      if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
        return sanitizedUrl;
      }
      var urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);
      if (!urlSchemeParseResults) {
        return sanitizedUrl;
      }
      var urlScheme = urlSchemeParseResults[0];
      if (invalidProtocolRegex.test(urlScheme)) {
        return exports.BLANK_URL;
      }
      return sanitizedUrl;
    }
    exports.sanitizeUrl = sanitizeUrl;
  }
});
export default require_dist();
//# sourceMappingURL=@braintree_sanitize-url.js.map
