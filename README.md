# Scrape Meetup

🏴‍☠️ Web scrape Meetup.com now that they have locked down their API. 😤

In August 2019, Meetup.com shutdown open access their API. In order to gain access
to the API you needed to apply. In order to apply, you needed to pay for a PRO account. This action hurt individual groups, like the Coffee Club of Seattle, which used the API to help organizers use historical data to schedule new events.

Without access to the API, one now needs to scrape the website to get event details.

## Last 10 Events

Every public Meetup group has a page with their last 10 events.

Example [https://www.meetup.com/seattle-coffee-club/events/past/]

**getEventHistory.js** will scrape that page to pull out the eventID from the _a.eventCard--link element_. My sample code adds the eventID to a MySQL table for processing.

## Event Detail

With the eventID, you can build a direct link to an event page.

Example: [https://www.meetup.com/seattle-coffee-club/events/265684295/]

On this page, we will scrape to pull up all the details related to the event and the venue. The only piece of data not inside the scrape that was available in the API was the venueID. If you have a table of prior events already saved you can write a query that matches the latitude and longitude of the venue to get a match. 😎

Once the data is pulled, this code will save a JSON file locally. You can process your JSON in whatever way is best for your situation.

## More Ideas

I used the Last 10 page for my group, because we have all the legacy data saved for over 1,300 events going back to 2006. If I didn't have that data, I'd look into scraping the monthly pages.

Example [https://www.meetup.com/seattle-coffee-club/events/calendar/2019-09/]
