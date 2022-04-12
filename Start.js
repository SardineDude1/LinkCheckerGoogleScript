/*
 This script will get the http request response code for web addresses
 linked in the google document it is attached to.
 
 If the request code is 200, meaning the website request succeded, no action
 is taken. If the request code is not 200, an email is sent to the address listed
 in the first variable.
*/

var email = "your-email-address";
var not_200 = [];


function getAllLinks(element) {
  var links = [];
  element = element || DocumentApp.getActiveDocument().getBody();
  
  if (element.getType() === DocumentApp.ElementType.TEXT) {
    var textObj = element.editAsText();
    var text = element.getText();
    var inUrl = false;
    for (var ch=0; ch < text.length; ch++) {
      var url = textObj.getLinkUrl(ch);
      if (url != null) {
        if (!inUrl) {
          inUrl = true;
          var curUrl = {};
          curUrl.element = element;
          curUrl.url = String( url );
          curUrl.startOffset = ch;
        }
        else {
          curUrl.endOffsetInclusive = ch;
        }          
      }
      else {
        if (inUrl) {
          inUrl = false;
          links.push(curUrl);  // add to links
          curUrl = {};
        }
      }
    }
    if (inUrl) {
      // if the link ends on the same char that the element does
      links.push(curUrl); 
    }
  }
  else {
    var numChildren = element.getNumChildren();
    for (var i=0; i<numChildren; i++) {
      links = links.concat(getAllLinks(element.getChild(i)));
    }
  }
  
  return links;
}

function Check_Links() {
  var much_link = getAllLinks();

  for (var x = 0; x < much_link.length; x++){
    if (much_link[x]['url'][0] == "#"){
      continue
    }
    else if (much_link[x]['url'].slice(0,6) == "mailto"){
      continue
    }
    console.log(much_link[x]['url']);
    if (getStatusCode(much_link[x]['url']) != 200){
      not_200.push("\n" + much_link[x]['url']);
    }
  }

  if (not_200.length>0){
    GmailApp.sendEmail(email, "Links failed in document " + DocumentApp.getActiveDocument().getName(), "Failed Links: \n\n" + not_200);
  }
}

function getStatusCode(url){
  try{
    var response = null;
    var response = UrlFetchApp.fetch(url);
    return response.getResponseCode();
  }catch(err){
    console.log(err);
  } 
}
