### 1) Create reference
Create a reference where you wish to append the pane

```js
const chartRef1 = useRef<HTMLDivElement>(null);
const chartRef2 = useRef<HTMLDivElement>(null);

<div className="chart1" ref={chartRef1}></div>
<div className="chart2" ref={chartRef2}></div>
```



### 2) Create a Pane
Create a pane with the following options. You can found more options on `https://tradingview.github.io/lightweight-charts/`. The pane should be displayed inside the referenced element.

```js
const optionsChart1 = {
    layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: 'black',
    },
    width: chartRef1.current.clientWidth,
    height: chartRef1.current.clientHeight || 300,
};


const chartInstance1 = new TradingViewPane({
    container: chartRef1.current,
    chartOptions: optionsChart1,
}, {
    seriesData: jsonData1,
    seriesOptions: {
        lineColor: '#2962FF',
        topColor: '#2962FF',
        bottomColor: 'rgba(41, 98, 255, 0.28)',
    }
});
```


```json
const jsonData1 = [
    { "time": "2019-04-11", "value": 80.01 },
    { "time": "2019-04-12", "value": 96.63 },
    { "time": "2019-04-13", "value": 76.64 },
    { "time": "2019-04-14", "value": 81.89 },
    { "time": "2019-04-15", "value": 74.43 },
    { "time": "2019-04-16", "value": 80.01 },
    { "time": "2019-04-17", "value": 96.63 },
    { "time": "2019-04-18", "value": 76.64 },
    { "time": "2019-04-19", "value": 81.89 },
    { "time": "2019-04-20", "value": 74.43 }
]
```


### 3) Synchronize multiple panes together 
on top of that, you can synchronize multiple panes together by using the following class. You just need to pass all the panes created before.

```js
new TradingView([
    chartInstance1,
    chartInstance2,
    chartInstance3
])
```

<br>
<br>

---
---
---
---
---

<br>
<br>

### 4) Full code example

```js
import './tv.css';
import jsonData1 from './serie1.json';
import jsonData2 from './serie2.json';
import jsonData3 from './serie3.json';
import React, { useEffect, useRef, useState } from 'react';
import {ColorType, createChart, LogicalRange, Time} from 'lightweight-charts';
import { TradingViewPane } from '../trading-view-library/TradingViewPane';
import { TradingView } from '../trading-view-library/TradingView';

interface ITvChartState {
}

type Props = { 
    className?: string;
};

export const TradingViewComponent = ({ className }: Props) => {
    const chartRef1 = useRef<HTMLDivElement>(null);
    const chartRef2 = useRef<HTMLDivElement>(null);
    const chartRef3 = useRef<HTMLDivElement>(null);


    useEffect(() => {
        //////////////////////////
        // Création du graphique 1
        if (!chartRef1.current || !chartRef2.current || !chartRef3.current) return;
        const optionsChart1 = {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            width: chartRef1.current.clientWidth,
            height: chartRef1.current.clientHeight || 300, // Définissez la hauteur désirée ici
        };
        const chartInstance1 = new TradingViewPane({
            container: chartRef1.current,
            chartOptions: optionsChart1,
        }, {
            seriesData: jsonData1,
            seriesOptions: {
                lineColor: '#2962FF',
                topColor: '#2962FF',
                bottomColor: 'rgba(41, 98, 255, 0.28)',
            }
        });


        const optionsChart2 = {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            width: chartRef2.current.clientWidth,
            height: chartRef2.current.clientHeight || 300, // Définissez la hauteur désirée ici
        };
        const chartInstance2 = new TradingViewPane({
            container: chartRef2.current,
            chartOptions: optionsChart2,
        }, {
            seriesData: jsonData2,
            seriesOptions: {
                lineColor: '#2962FF',
                topColor: '#2962FF',
                bottomColor: 'rgba(41, 98, 255, 0.28)',
            }
        });


        const optionsChart3 = {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            width: chartRef3.current.clientWidth,
            height: chartRef3.current.clientHeight || 300, // Définissez la hauteur désirée ici
        };
        const chartInstance3 = new TradingViewPane({
            container: chartRef3.current,
            chartOptions: optionsChart3,
        }, {
            seriesData: jsonData3,
            seriesOptions: {
                lineColor: '#2962FF',
                topColor: '#2962FF',
                bottomColor: 'rgba(41, 98, 255, 0.28)',
            }
        });

        new TradingView([
            chartInstance1,
            chartInstance2,
            chartInstance3,
        ])
        
        return () => {
            chartInstance1.chart.remove();
            chartInstance2.chart.remove();
            chartInstance3.chart.remove();
        };
    }, []);
    

    return (
        <>
            <div className="chart1" ref={chartRef1}></div>
            <div className="chart2" ref={chartRef2}></div>
            <div className="chart3" ref={chartRef3}></div>
        </>          
    )
};
```