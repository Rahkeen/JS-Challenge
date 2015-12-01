// This is the JavaScript challenge.  In this challenge, you will pull website
// performance data from the Compete.com API and use it to display a
// graph.

// Your finished product will be a page where the user can enter a
// domain, specify a metric from the drop down, and optionally specify
// a date range or the last x months from which to gather data.  When
// they click the GO button, a chart should appear.  Additionally, the
// user should be able to change these inputs and load a different
// chart WITHOUT refreshing the page.

// This is the only file you may edit. index.html is pre set up enough
// that you can complete the challenge without changing it.  You will of
// course need to review index.html throughout the challenge as it contains
// the dom elements you will need to either manipulate or read values
// from.  You are allowed to append script tags, but the script tags
// may not point to third party JS libraries like jQuery

// The documentation for Compete.com is located here: https://developer.compete.com/documentation/

// IMPORTANT: YOU WILL BE REQUESTING THE DATA WITH JSONP, NOT "TRADITIONAL" AJAX.
// The bottom of the Compete documentation has a little blurb about JSONP.
// Here is a wikipedia article about JSONP: https://en.wikipedia.org/wiki/JSONP

// You can use this API Key for Compete: 82111ef10ef31de9926eb2df16b9f657
// But it is preferable that you create your own key.

// Feel free to e-mail lots of questions.

// API KEY: b365ad8f3305bcf1662d82000001c021

var API_KEY = 'b365ad8f3305bcf1662d82000001c021';
var BASE_URL = 'https://apps.compete.com/sites/'
var JSONP_CALLBACK = 'processData'

var requestObject = {};

function getData() {    
    var script = document.createElement('script');
    script.type = 'text/javascript';
    
    // required params
    var domainValue = document.getElementById('domain').value;
    var metric = document.getElementById('metric');
    var metricCode = metric.options[metric.selectedIndex].value;
    var metricName = metric.options[metric.selectedIndex].text;
    
    requestObject.domain = domainValue;
    requestObject.metricCode = metricCode;
    requestObject.metricName = metricName;
    
    var src = BASE_URL + domainValue + '/trended/' 
            + metricCode + '/?apikey=' + API_KEY;
    
    // optional params
    var startDate = document.getElementsByName('start_date')[0].value;
    var endDate = document.getElementsByName('end_date')[0].value;
    var latest = document.getElementsByName('latest')[0].value;
    
    if(startDate.length != 0 && endDate.length != 0) {
        startDate = startDate.replace(/-/,'');
        endDate = endDate.replace(/-/,'');
        src += '&start_date=' + startDate + '&end_date=' + endDate;
    } else if(latest.length != 0) {
        src += '&latest=' + latest;
    }
    
    src += '&jsonp=' + JSONP_CALLBACK;

    console.log(src);
    script.src = src;
    
    // only need the browser to process the script
    // so we can just add it and delete it
    document.head.appendChild(script);
    document.head.removeChild(script);
    
}

function processData(data) {
    console.log(data);
    if(data.status === 'OK') {
        makeChart(data,requestObject.metricName,requestObject.metricCode,
              requestObject.domain);
    } else {
        alert(data.status + '\n' + data.status_message);
    }
    
}
 
function makeChart (data, metricName, metricCode, domain) {
    // Params:
    // `data` - the raw data Compete gives you after the JSONP request
    // `metricName` - a name from the Metric drop down.
    // `metricCode` - the corresponding value denoted in each metricName <option>
    // `domain`  -  the domain of interest.
    
    // This function is used to create the Highcharts graph with the
    // data you retrieve from Compete.
    
    // Don't try to understand this function.  Just give it the right
    // inputs and it will create the chart and render it into the page
    // for you.

    
    function getUTC(datestring){
        return Date.UTC(datestring.substring(0,4), datestring.substring(4)-1);
    }
    var met = data.data.trends[metricCode];
    console.log(met);
    var firstdate = met[0].date;
    var year = parseInt(firstdate.substring(0,4));
    var month = parseInt(firstdate.substring(4));
    new Highcharts.Chart({
        chart:{
            renderTo:'container',
            type:'area',
            zoomType:'x',
            resetZoomButton: {
                position: {
                    x: 0,
                    y: -24
                }
            },
            borderRadius: 0,
            backgroundColor: 'rgba(255, 255, 255, 0)',
            spacingTop: 10,
            spacingBottom: 5,
            spacingRight: 5,
            spacingLeft: 5
        },
        title:{
            text:metricName + ' at ' + domain,
            style: {
                color: 'rgba(2, 50, 71, .9)',
                fontSize: '24px',
                fontFamily: '\'Montserrat\''
            }
        },
        legend: {
            verticalAlign:"top",
            y:30,
            backgroundColor: 'rgba(196, 195, 195, .03)',
            borderColor: 'rgba(249, 174, 57, .3)'
        },
        tooltip: {
            shared: true,
            crosshairs: true,
        },
        credits: {
            enabled: false
        },
        xAxis:{
            type:'datetime',
            minRange:14*24*3600000,
            lineWidth: 1,
            labels: {
                style: {
                    color: 'rgba(2, 50, 71, .85)',
                    fontSize: '11px',
                    fontFamily: 'Montserrat'
                }
            }
        },
        yAxis:{
            title:{
                text:metricName
            }
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: false
                },
                lineWidth: 1,
                lineColor: 'rgba(2, 50, 71, .75)',
                shadow: false,
                states: {
                    hover: {
                        enabled: false
                    }
                },
                stacking:'normal'
            },
            spline: {
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            lineWidth: 5
                        }
                    }
                },
                lineWidth: 2,
                states: {
                    hover: {
                        enabled: false
                    }
                }
            }
        },
        series:[{
            type:'area',
            name:metricName,
            pointInterval:30*24*3600*1000,
            pointStart: Date.UTC(year, month-1),
            data:met.map(function(e){return [getUTC(e.date), parseFloat(e.value)];})
        }]
    });
}

