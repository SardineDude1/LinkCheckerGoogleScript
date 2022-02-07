/*
 This script will get the http request response code for web addresses listed
 or linked in the google document it is attached to.
 
 This is limited to wed addresses that begin with "http" and are written out in the
 document or hyperlinks that begin at the first character after a line break.
 
 If the request code is 200, meaning the website request succeded, no action
 is taken. If the request code is not 200, an email is sent to the address listed
 in the first variable.
*/

var email = "your-emial@gmail.com";
var not_200 = [];

function Check_Links() {
  var body = DocumentApp.getActiveDocument().getBody();
  var all_links = getAllLinks(body);
  
  for (var i=0; i<all_links.length; i++){
    if (getStatusCode(all_links[i]) != 200){
      not_200.push(all_links[i]);
    }
  }

  if (not_200.length>0){
    GmailApp.sendEmail(email, "Links failed in document " + DocumentApp.getActiveDocument().getName(), not_200);
  }
}

function getAllLinks(element) {
  var links = [];
  num_of_children = element.getNumChildren();

  for(var i=0; i<num_of_children; i++){
    var child = element.getChild(i);                // get each element in the body
    var split_child = child.getText().split(" ");   // create an array of words from the text of each child
    var text = child.editAsText();                  // get the rich text within each element
    var l = text.getLinkUrl();                      // set variable to the link 

    if (l){
      links.push(l);
    }

    for (var x=0; x<split_child.length; x++){

      if (split_child[x].slice(0,4) == "http"){

        if (links.indexOf(split_child.toString()) < 0){
          links.push(split_child.toString());
        }
      }
    }
    
    for (var y=0; y < child.getNumChildren(); y++){
      var url = child.getChild(y).getAttributes();

      if (url.LINK_URL != null){

        if (url.LINK_URL[0] != "#"){

          if (links.indexOf(url.LINK_URL) < 0){
            links.push(url.LINK_URL);
          }
        }

      }
    }
  }
  console.log(links);
  return links;
}

function getStatusCode(url){
  try{
    var response = null;
    if (url.slice(0,6) != "mailto"){     // exclude hyperlinked email addresses
      var response = UrlFetchApp.fetch(url);
    }
    return response.getResponseCode();
  }catch(err){
    console.log(err);
  } 
}
