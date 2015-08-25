CHANGELOG
=========

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
