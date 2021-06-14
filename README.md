# Wiki Navbox Parser

This project is a parser for the data in the navbox section at the bottom of Wikipedia pages.

This data is great for gathering lists of data on specific topics.

### Example
```javascript
const { NavboxParser } = require('@etomon/wiki-nav-parser');
(async () => {
  let parser = await NavboxParser.fromUrl(`https://en.wikipedia.org/wiki/President_of_the_United_States`);
  let collections = parser.getCollections();
  console.log(JSON.stringify(Array.from(collections.entries()), null, 2));
})();
```
```json
[
  [
    "Presidents of the United States",
    {
      "title": "Presidents of the United States",
      "lists": [
        {
          "title": "Presidents of the United States",
          "listItems": [
            {
              "links": [
                {
                  "index": 0,
                  "title": "George Washington",
                  "url": "https://en.wikipedia.org/wiki/George_Washington"
                },
                {
                  "index": 0,
                  "title": "1789–1797",
                  "url": "https://en.wikipedia.org/wiki/Presidency_of_George_Washington"
                }
              ]
            },
            ...
```

### Structure

An image of the data structure mapped onto an actual Wikipedia page is included below.

## Building 

`@etomon/wiki-navbox-parser` is written in TypeScript, to build run `npm run build`.

## Documentation

Documentation can be [found here](https://etomonusa.github.io/wiki-navbox-parser).

## Tests

Tests are written in Mocha. Run `npm test` to test.

## License

Wiki Navbox Parser is licensed under the ISC License, a copy of which can be found at [https://opensource.org/licenses/ISC](https://opensource.org/licenses/ISC).
