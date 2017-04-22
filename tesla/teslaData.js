/*
    I think that when the event is the same as the first index, it fails to show 
    because I'm trying to subtract dates or something.
   */
var series = [
    {
        name: 'roadster',
        title: 'Roadster',
        image: './images/roadster.png',
        pathStroke: 'rgba(255, 0, 0, 0.5)',
        labelYPercentage: 0.2,
        data: [
            //{index: '2008-May', value: 0},
            {index: '2009-03-31', value: 0},
            {index: '2009-04-01', value: 320, source: 'http://phys.org/news/2009-04-streaming-tesla-electric-sedans.html'},
            {index: '2011-04-01', value: 1650, source: 'http://money.cnn.com/2011/06/21/autos/tesla_roadster_selling_out'},
            {index: '2012-12-31', value: 2450, source: 'http://ir.teslamotors.com/secfiling.cfm?filingid=1193125-13-96241&cik='}
        ],
        events: [
            {
                index: '2010-02-01',
                title: 'Released'
            },
            {
                index: '2011-02-01',
                title: 'Production'
            },
            {
                index: '2011-08-01',
                title: 'Stopped Taking Orders'
            }
        ]
    },
    {
        name: 'model-s',
        title: 'Model S',
        image: './images/model-s.png',
        pathStroke: 'rgba(0, 255, 0, 0.5)',
        labelYPercentage: 0.4,
        data: [
            //{index: '2009-Mar-26', value: 0},
            {index: '2009-04-01', value: 0},
            {index: '2009-04-02', value: 520, source: 'http://ir.teslamotors.com/releasedetail.cfm?releaseid=477990'},
            {index: '2010-04-20', value: 1000, source: 'https://www.teslamotors.com/blog/tesla-surpasses-1000-reservations-model-s'},
            {index: '2012-12-31', value: 2650, source: 'http://www.reuters.com/article/teslamotors-results-idUSL4N0BK65V20130220'},
            {index: '2013-12-31', value: 25000, source: 'http://files.shareholder.com/downloads/ABEA-4CW8X0/456867397x0x874449/945B9CF5-86DA-4C35-B03C-4892824F058D/Q4_15_Tesla_Update_Letter.pdf'},
            {index: '2014-12-31', value: 57000, source: 'http://files.shareholder.com/downloads/ABEA-4CW8X0/456867397x0x874449/945B9CF5-86DA-4C35-B03C-4892824F058D/Q4_15_Tesla_Update_Letter.pdf'},
            {index: '2015-06-01', value: 75000, source: 'http://www.westernmorningnews.co.uk/Tesla-Model-S-billion-miles/story-26750842-detail/story.html'},
            {index: '2015-12-01', value: 100000, source: 'http://www.hybridcars.com/tesla-model-s-crossed-100000-sales-milestone-this-month/'}
        ],
        events: [
            {
                index: '2009-03-26',
                title: 'Announced'
            },
            {
                index: '2012-06-22',
                title: 'First Deliveries'
            },
            {
                index: '2015-06-01',
                title: '1B Miles Traveled'
            }
        ]
    },
    {
        name: 'model-x',
        title: 'Model X',
        image: './images/model-x.png',
        pathStroke: 'rgba(132, 112, 255, 0.5)',
        labelYPercentage: 0.3,
        data: [
            {index: '2012-02-09', value: 0, source: 'https://www.teslamotors.com/blog/model-x-fastest-selling-tesla-ever'},
            {index: '2012-02-10', value: 500, source: 'https://www.teslamotors.com/blog/model-x-fastest-selling-tesla-ever'},
            {index: '2014-03-01', value: 12000, source: 'http://gas2.org/2014/03/24/tesla-model-x-reservations-exceed-12000/'},
            {index: '2014-09-01', value: 20000, source: 'http://gas2.org/2014/09/05/20000-tesla-model-x-reservations-and-counting/'},
            {index: '2015-04-30', value: 26460, source: 'http://www.teslarati.com/model-x-reservations-reach-time-high-september/'},
            {index: '2015-04-30', value: 26460, source: 'http://www.teslarati.com/model-x-reservations-reach-time-high-september/'},
            {index: '2015-08-01', value: 30000},
            {index: '2015-10-01', value: 32618, source: 'http://www.teslarati.com/model-x-reservations-reach-time-high-september/'}
        ],
        events: [
            {
                index: '2012-02-09',
                title: 'Announced'
            },
            {
                index: '2015-09-01',
                title: 'First Deliveries'
            }
        ]
    },
    {
        name: 'model-3',
        title: 'Model 3',
        image: './images/model-3.png',
        pathStroke: 'rgba(255, 165, 0, 0.5)',
        labelYPercentage: 0.6,
        labelXOffset: -50,
        data: [
            //{index: '2014-Jul-16', value: 0},
            {index: '2016-03-31', value: 0},
            {index: '2016-04-01 13:23', value: 198000, source: 'https://twitter.com/elonmusk/status/715952781895426048'},
            {index: '2016-04-01 22:26', value: 232000, source: 'https://twitter.com/elonmusk/status/715952781895426048'},
            {index: '2016-04-02 07:00', value: 253000, source: 'https://twitter.com/elonmusk/status/716341849409998849'},
            {index: '2016-04-02 23:59', value: 276000, source: 'https://twitter.com/elonmusk/status/716693951260938241'}
        ],
        events: [
            {
                index: '2016-03-31',
                title: 'Announced'
            }
        ]
    }
];

