/// Utils
function mimeType(link){
    link = link.split(".");
    link = link.pop();
    switch(link){
        case 'js':
            return 'text/javascript';
        case 'css':
            return 'text/css';
        case 'html':
            return 'text/html'
        default:
            return 'text/plain';
    }
};

function makeRelative(link){
    if(link[0] == "/")
        return link.slice(1);
}





exports.makeRelative = makeRelative;
exports.mimeType = mimeType;