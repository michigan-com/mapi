# News API

The news API endpoint:

  https://api.michigan.com/news/:source/:section

where:

* `:source` is a site identifier, which is one of the sites from [constant.js](src/lib/constant.js) without the `.com` suffix (e.g. `freep` or `detroitnews`)
* `:section` is `news`, `sports` or perhaps something else (`life`?) — TODO FIXME

The response is a dictionary with `articles` key, which is an array of article objects.

Properties described as optional may be missing or null, both of which MUST be treated identically. Properties described as required MUST NOT be null or empty, unless specified otherwise.

## Article object

Keys:

* `_id` (required): a unique identifier of the article
* `headline` (required): a title of the article
* `subheadline` (optional): a second headline or a short summary of the article, null if no subheadline
* `url` (required): a canonical absolute web URL of the article
* `photo` (required): an object describing a photo attached to the article, null if no photo

## Photo object

Keys:

* `full` (required): full-size image object
* `thumb350` (optional): thumbnail image object, suitable for 350x350 rectangle

## Image object

Keys:

* `url` (required)
* `width`, `height` (optional): sizes (as integers) of the image if known
