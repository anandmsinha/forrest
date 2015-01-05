var getHashTags = function(str) {
    var output = []
    if (str && str.length > 0) {
        for (var i = 0, _l = str.length - 1; i < _l; ++i) {
            if (str.charAt(i) == '#') {
                var j = ++i
                var tmpChar = str.charAt(i)
                while (tmpChar != ' ' && tmpChar != '-' && tmpChar != '#' && i <= _l) {
                    tmpChar = str.charAt(++i)
                }
                var pushStr = str.substring(j, i)
                if (pushStr.length > 0) { output.push(pushStr) }
            }
        }
    }
    return output
}

console.log(getHashTags('# Hello www#.facebook.com #first world #test-hello#world#'))