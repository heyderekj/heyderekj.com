---
title: "The 48 hour project"
tags: [ai, making]
date: 2026-03-22
draft: false
---

It all started with a text message at 3 am on Sunday March 8th. The text was from one of my best friends. The message: “A map of every Christian church in the US would be pretty interesting to see.” 

I agreed so I started to build. 

I wouldn’t open up Cursor or Claude Desktop to start this. I’d go to Figma Make for the second time. You see this idea came from sharing a fun interactive map I had made a couple weeks back using Figma Make. And well of course with Claude Opus 4.6. 

This time I knew what was capable so prompt after prompt with a set overall feel of color and font Claude in Figma Make starting putting together this interactive map of churches in the U.S. Seeing it get built wasn’t the fun part this time—it was figuring out what data sources to use and how to fully use them to accomplish what we needed. 

We’d use OpenStreetMap to get the locations that would be cross-referenced with data from the U.S. Census and another association that specializes in religious denominations and their institutions. This is all the data that is free and there ready to use and make sense of. Of course could use Google Places API to make this data more rich but this was a great start and I know this Google Places API would most likely need to be an additional payment. So I passed for the time being. 

The map was made. It was a simple React map as an SVG using Motion for animations and the Lucide icon pack. Nothing revolutionary but to my surprise no comprehensive and well designed directory of churches had existed. Either you had to pay to access it and see what was all available or the church directory was definitely not representative of every church with many denominations having their own. 

Aside from missing churches and addresses overall the estimated weekly attendance data needed improvement with our current data of churches. The initial way of calculating this was to take the surrounding population size/density of where said church was and the average size of the denomination of that church to come up with an estimate. But, overall many if not all were all low/outdated. Now this is where things got really fun... 

Turns out there is building square footage data that can be sent through from the data sources we’ve already been using. So tapping into this 40-50% of churches now had a more realistic estimated weekly attendance number. “We” took the total square footage and assumed a portion of that to of course only be the sanctuary or the place used for worship and service to get a number that would be an estimated capacity. Then this number would be shrunk as more than not the space wouldn’t reach 100% capacity every week. Again, this isn’t perfect and far from exact but it was better than the previous estimate numbers. 

70k tokens used with Claude later the project was now a thing and well I couldn’t help but make it more real. 

Brainstormed a name (came up with [Here’s My Church](https://heresmychurch.com) to be more approachable and casual), bought a domain, pushed all the code to a GitHub repo setup under my primary project, Harvous, and along the way all the data was saved in Supabase. 

All of this was feeling like the early days, back in 2010, when I’d start side projects late at night or over the weekend. Only difference was that the entire project was built in a matter of hours and the brand and domain and and announcement post all came after the idea already had a v1. 

I’m a designer that has always loved to tinker. I’d get the biggest dopamine hit going from initial idea to logo and announcement. Now, because of Claude that initial idea is actually something—more than just an idea. And when I announced this the community on X flocked to it. 

This side project went from idea to creation and being shared in a matter of 48 hours. Wild.
