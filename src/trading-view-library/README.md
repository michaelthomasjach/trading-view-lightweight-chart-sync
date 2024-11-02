### 1) Create reference
Create a reference where you wish to append the pane

```js
const firstChartRef = useRef<HTMLDivElement>(null);
const secondChartRef = useRef<HTMLDivElement>(null);

<div className="chart1" ref={firstChartRef}></div>
<div className="chart2" ref={secondChartRef}></div>
```



### 2) Create a Pane
Create a pane with the following options. You can found more options on `https://tradingview.github.io/lightweight-charts/`. The pane should be displayed inside the referenced element.

```js
const optionsChart1 = {
    layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: 'black',
    },
    width: firstChartRef.current.clientWidth,
    height: firstChartRef.current.clientHeight || 300,
};


const firstChartInstance = new TradingViewPane({
    container: firstChartRef.current,
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
    firstChartInstance,
    secondChartInstance
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
    const firstChartRef = useRef<HTMLDivElement>(null);
    const secondChartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        //////////////////////////
        // Création du graphique 1
        if (!firstChartRef.current || !secondChartRef.current) return;
        const optionsChart1 = {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            width: firstChartRef.current.clientWidth,
            height: firstChartRef.current.clientHeight || 300, // Définissez la hauteur désirée ici
        };
        const firstChartInstance = new TradingViewPane({
            container: firstChartRef.current,
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
            width: secondChartRef.current.clientWidth,
            height: secondChartRef.current.clientHeight || 300, // Définissez la hauteur désirée ici
        };
        const secondChartInstance = new TradingViewPane({
            container: secondChartRef.current,
            chartOptions: optionsChart2,
        }, {
            seriesData: jsonData2,
            seriesOptions: {
                lineColor: '#2962FF',
                topColor: '#2962FF',
                bottomColor: 'rgba(41, 98, 255, 0.28)',
            }
        });


        new TradingView([
            firstChartInstance,
            secondChartInstance
        ])
        
        return () => {
            firstChartInstance.chart.remove();
            secondChartInstance.chart.remove();
        };
    }, []);
    

    return (
        <>
            <div className="chart1" ref={firstChartRef}></div>
            <div className="chart2" ref={secondChartRef}></div>
        </>          
    )
};
```