Molecule.js provides a command-line style interpreter for interaction with your RESTful api. 

Ideal for one page applications such as administration interfaces, this library allows you to type commands, attach commands to buttons within your html page or run commands upon page load.

An example command might be:

`show clients then append result to #sidebar_div`

Which can you can type into a specified `<input type="text" />` tag. Molecule will interpret this command and formulate an ajax request to fire off to a RESTful URL.Another way to run commands is by attaching them to a button, such as:

`<a href="http://..." data-command="empty #content_div then create product then append result to #content_div " />`

When this button is clicked the dom element with an id of #content_div would be emptied of all children elements, then an ajax request would be sent to the RESTful url for creating an object. Molecule expects html to be returned from your back-end system, which it would then append to the #content_div element.