const $ = require('cheerio');
import fetch from 'node-fetch';
import * as URL from 'url';

/**
 * Represents a singe list item within a list in the navbox. A `ListItem` may contain multiple links.
 */
export interface ListItem {
  /**
   * The links inside of the `ListItem`
   */
  links: Link[],
  /**
   * The index of the `ListItem` in the parent list.
   */
  index?: number
}

/**
 * Link to an external page on Wikipedia.
 */
export interface Link {
  /**
   * Title of the external page on Wikipedia.
   */
  title: string;
  /**
   * URL to the external page on Wikipedia.
   */
  url: string;
}

/**
 * A collection of `ListItem`s
 */
export interface List {
  /**
   * Title of the list. If the list has no title, defaults to the title of the collection
   */
  title: string;
  listItems: Array<ListItem>;
}

/**
 * A collection of `List`s
 */
export interface Collection {
  /**
   * Title of the collection.
   */
  title: string;
  lists: Array<List>;
}

/**
 * Options for the Navbox Parser
 */
export interface NavboxParserOptions {
  /**
   * If true, will prepend the host of the Wikipedia site (e.g. `en.wikipedia.org` to the URL).
   */
  prependHost: boolean;
}

/**
 * Parser for the Wikipedia Navbox
 */
export class NavboxParser {
  /**
   * Creates the Navbox Parser
   * @param $ An existing `cheerio` instance with the page loaded
   * @param options Options for the Navbox Parser
   */
  constructor(protected $: any, public options: NavboxParserOptions = { prependHost: true }) {
  }

  /**
   * Parses the various navboxes at the bottom of the wikipedia page loaded in the cheerio instance
   * as `Collection` objects, returning the `Collection`s as a `Map` with the key as the title of
   * the `Collection`.
   */
  public getCollections(): Map<string, Collection> {
    let collections = new Map<string, Collection>();

    let { $ } = this;

    $('br').replaceWith("<span> </span>");

    let selfLink = $('link[rel="canonical"]').attr('href');
    let selfUrl = require('url').parse(selfLink);
    let selfHostname = selfUrl.protocol + '//' + selfUrl.host;
    if (!this.options.prependHost) {
      selfLink = selfLink.replace(selfHostname, '');
    }

    $('a.selflink').attr('href', selfLink);

    let navboxes = Array.from($('.navbox'));

    for (let box of navboxes) {
      let trs = Array.from($('tr', $('table', box).first()));
      let header = $('th > div', trs.shift()).last();
      let collection = { title: $(header).text().trim().replace(/ /g, ' '), lists: [] as any };

      let lists = Array.from($('.navbox-list', box));

      for (let navList of lists) {
        let header = $(navList).parent().children('th');
        let title = header?.text() || collection.title;
        let listItems = Array.from($('ol > li, ul > li', navList)).map((li, index: number) => {
          return {
            links: Array.from($('a', li)).map((a) => ({
              index,
              title: $(a).text().trim().replace(/ /g, ' '),
              url: $(a).is('.selflink') ? selfLink: (
                this.options.prependHost ? selfHostname : ''
              ) + $(a).attr('href')
            }))
          }
        });

        if (!title.length && !listItems.length)
          continue;

        let list = {
          title: title.replace(/ /g, ' '),
          listItems
        }
        collection.lists.push(list);
      }

      collections.set(collection.title, collection);
    }

    return collections;
  }

  /**
   * Retrieves the Wikipedia page from a URL, and creates a new `NavboxParser` from that page.
   * @param url URL to the Wikipedia page
   * @param options Options for the NavboxParser
   */
  public static async fromUrl(url: string, options?: NavboxParserOptions): Promise<NavboxParser> {
    let page = await (await fetch(url)).text();
    return new NavboxParser($.load(page), options);
  }
}
