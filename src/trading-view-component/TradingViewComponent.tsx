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