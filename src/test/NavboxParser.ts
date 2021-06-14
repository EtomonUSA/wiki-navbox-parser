import { assert } from 'chai';
import { NavboxParser } from '../NavboxParser';
import fetch from 'node-fetch';
const cheerio = require('cheerio');

describe('NavboxParser', async function (){
  describe('fromUrl', async function () {
    it(`fromUrl should generate the same URL as using fetch/cheerio directly`, async function () {
      let url = 'https://en.wikipedia.org/wiki/President_of_the_United_States';
      let html = (await (await fetch(url)).text());
      let $ = cheerio.load(html);
      html = $.html();

      let navboxParser = await NavboxParser.fromUrl(url);
      // @ts-ignore
      let html2 = navboxParser.$.html();
      assert.equal(html2, html);
    });
  });
  describe('getCollections', async function () {
    let parser: NavboxParser;
    let $: any;

    let cache = new Map<string, any>();

    async function loadParser(url: string = 'https://en.wikipedia.org/wiki/Administrative_divisions_of_Ukraine') {
      let html = cache.get(url) || (await (await fetch(url)).text());

      cache.set(url, html);

      $ = cheerio.load(html);

      parser = await NavboxParser.fromUrl(url);
      return { parser, html, $ };
    }

    it('should have all of the collections listed on the page', async function () {
        await loadParser();
        let collections = await parser.getCollections();
        let colNames = Array.from(collections.keys());
        assert.deepEqual(colNames, [
          "Ukraine articles",
          "Administrative divisions of Ukraine",
          "Administrative divisions of Ukraine's regions",
          "First-level administrative divisions in European countries"
        ]);
    });

    it('should have all of the lists in a given collection', async function () {
      await loadParser();
      let collection = (await parser.getCollections()).get('Administrative divisions of Ukraine');
      assert.isOk(collection);
      assert.equal(collection.title, 'Administrative divisions of Ukraine');
      assert.isNotEmpty(collection.lists);
      assert.deepEqual(collection.lists.map(l => l.title), [
        "Oblasts",
        "Cities with special status",
        "Autonomous republic",
        "Administrative centers"
      ]);
    });

    it('should have all of the list items in a given list', async function () {
      await loadParser();
      let collection = (await parser.getCollections()).get('Administrative divisions of Ukraine');
      let list = collection.lists[0];
      assert.ok(list);
      assert.isNotEmpty(list.listItems);
      let links = require('lodash').flatten(list.listItems.map(l => l.links));
      assert.isNotEmpty(links);

      assert.deepEqual(links, [
        {
          "index": 0,
          "title": "Cherkasy",
          "url": "https://en.wikipedia.org/wiki/Cherkasy_Oblast"
        },
        {
          "index": 1,
          "title": "Chernihiv",
          "url": "https://en.wikipedia.org/wiki/Chernihiv_Oblast"
        },
        {
          "index": 2,
          "title": "Chernivtsi",
          "url": "https://en.wikipedia.org/wiki/Chernivtsi_Oblast"
        },
        {
          "index": 3,
          "title": "Dnipropetrovsk",
          "url": "https://en.wikipedia.org/wiki/Dnipropetrovsk_Oblast"
        },
        {
          "index": 4,
          "title": "Donetsk",
          "url": "https://en.wikipedia.org/wiki/Donetsk_Oblast"
        },
        {
          "index": 5,
          "title": "Ivano-Frankivsk",
          "url": "https://en.wikipedia.org/wiki/Ivano-Frankivsk_Oblast"
        },
        {
          "index": 6,
          "title": "Kharkiv",
          "url": "https://en.wikipedia.org/wiki/Kharkiv_Oblast"
        },
        {
          "index": 7,
          "title": "Kherson",
          "url": "https://en.wikipedia.org/wiki/Kherson_Oblast"
        },
        {
          "index": 8,
          "title": "Khmelnytskyi",
          "url": "https://en.wikipedia.org/wiki/Khmelnytskyi_Oblast"
        },
        {
          "index": 9,
          "title": "Kyiv",
          "url": "https://en.wikipedia.org/wiki/Kyiv_Oblast"
        },
        {
          "index": 10,
          "title": "Kirovohrad",
          "url": "https://en.wikipedia.org/wiki/Kirovohrad_Oblast"
        },
        {
          "index": 11,
          "title": "Luhansk",
          "url": "https://en.wikipedia.org/wiki/Luhansk_Oblast"
        },
        {
          "index": 12,
          "title": "Lviv",
          "url": "https://en.wikipedia.org/wiki/Lviv_Oblast"
        },
        {
          "index": 13,
          "title": "Mykolaiv",
          "url": "https://en.wikipedia.org/wiki/Mykolaiv_Oblast"
        },
        {
          "index": 14,
          "title": "Odessa",
          "url": "https://en.wikipedia.org/wiki/Odessa_Oblast"
        },
        {
          "index": 15,
          "title": "Poltava",
          "url": "https://en.wikipedia.org/wiki/Poltava_Oblast"
        },
        {
          "index": 16,
          "title": "Rivne",
          "url": "https://en.wikipedia.org/wiki/Rivne_Oblast"
        },
        {
          "index": 17,
          "title": "Sumy",
          "url": "https://en.wikipedia.org/wiki/Sumy_Oblast"
        },
        {
          "index": 18,
          "title": "Ternopil",
          "url": "https://en.wikipedia.org/wiki/Ternopil_Oblast"
        },
        {
          "index": 19,
          "title": "Vinnytsia",
          "url": "https://en.wikipedia.org/wiki/Vinnytsia_Oblast"
        },
        {
          "index": 20,
          "title": "Volyn",
          "url": "https://en.wikipedia.org/wiki/Volyn_Oblast"
        },
        {
          "index": 21,
          "title": "Zakarpattia",
          "url": "https://en.wikipedia.org/wiki/Zakarpattia_Oblast"
        },
        {
          "index": 22,
          "title": "Zaporizhzhia",
          "url": "https://en.wikipedia.org/wiki/Zaporizhzhia_Oblast"
        },
        {
          "index": 23,
          "title": "Zhytomyr",
          "url": "https://en.wikipedia.org/wiki/Zhytomyr_Oblast"
        }
      ]);
    });
  });
});
