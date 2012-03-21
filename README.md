Molecule.js provides a command-line style interpreter for generating interactions between your DOM and your RESTful api. 

Ideal for one page applications such as administration interfaces, this library allows you to type commands, attach commands to buttons within your html page or run commands upon page load.

** Examples

An example command might be:

`show clients then append result to #sidebar_div`

Which can you can type into a specified `<input type="text" />` element. Molecule will interpret this command and formulate an ajax request to fire off to a RESTful URL. Another way to run commands is by attaching them to a button, such as:

`<a href="http://..." data-command="empty #content_div then new product then append result to #content_div" />`

When this button is clicked the dom element with an id of #content_div would be emptied of all children elements, then an ajax request would be sent to the RESTful url for creating an object. Molecule expects html to be returned from your back-end system - in this case probably a form for creating a product which it would then append to the #content_div element.

To further this example, the html form that our RESTful API returns could have a command attached to it's submit button:

`<input type="submit" name="save" data-command="create product from form#this_form then empty #content_div then edit product 2365 then append result to #content_div" />`

This command would send the form data from the element - `<form id="this_form">` - to the create url of your API, which would hopefully create the record in your database and return a 200 'Ok' Header. It would then remove the form from the DOM (keep in mind there are no page-refreshes). After that we specified that we would like to then place the form for editing this new product into the #content_div element on the page.

