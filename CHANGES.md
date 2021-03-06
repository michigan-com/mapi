CHANGELOG
=========

v0.0.11, 10-21-2015
-------------------

* Replaced MAPI\_DB with MONGO\_URI
* Remove 'db' from config.js
* Added new gulp taks

v0.0.10, 10-08-2015
-------------------

* Added recipes to api explorer
* Moved production branch to 'live'

v0.0.9, 09-17-2015
------------------

* Removed old dependencies
* Replaced express.io for socket.io

v0.0.8, 09-15-2015
------------------

* Added Toppage mongoose collection
* Added routes for popular event request and socket events
* Refactored library files
* Refactored async/await route requests

v0.0.7, 09-09-2015
------------------

* Added CORS support

v0.0.6, 08-27-2015
------------------

* Articles are not being sorted properly on the server

v0.0.5, 08-25-2015
------------------

* Reorganized folder structure based on Andrey's https://github.com/michigan-com/SpeedNewsReader
* Added new endpoint, /v1/article/:id/ which will fetch the individual data for that article (news site id, not mongo id

v0.0.4, 08-20-2015
------------------

* Setting a default limit on news endpoint to 100

v0.0.3, 08-01-2015
------------------

* The fetching portion of mapi has been moved
github.com/michigan-com/newsfetch
* Updated unit tests to reflect changes
* Article body is now in the news endpoint response
* New query param: "limit" which limits the number
of articles sent in response

v0.0.1, 01-27-2015
------------------

* Only allow unique articles to be added to database
* Added unique article test
