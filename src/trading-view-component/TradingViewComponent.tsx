import './tv.css';
import jsonData1 from './serie1.json';
import jsonData2 from './serie2.json';
import jsonData3 from './serie3.json';
import React, { useEffect, useRef, useState } from 'react';
import {ColorType, createChart, LogicalRange, Time} from 'lightweight-charts';
import { TradingViewPane } from '../trading-view-library/TradingViewPane';
import { TradingView } from '../trading-view-library/TradingView';
import { Utils } from '../Utils';

interface ITvChartState {
}

type Props = { 
    className?: string;
};

export const TradingViewComponent = ({ className }: Props) => {
    const chartRef1 = useRef<HTMLDivElement>(null);
    const chartRef2 = useRef<HTMLDivElement>(null);
    const chartRef3 = useRef<HTMLDivElement>(null);


    const defaultOptionsChart = {
        layout: {
            background: { type: ColorType.Solid, color: 'white' },
            textColor: 'black',
        },
        grid: {
            vertLines: {
                color: 'rgba(0, 0, 0, 0)', // Transparence totale (invisible)
            },
            horzLines: {
                color: 'rgba(0, 0, 0, 0)', // Transparence totale (invisible)
            },
        },
        timeScale: {
            visible: false, // Masquer complètement l'axe X
            borderColor: 'rgba(0, 0, 0, 0)', // Rendre la bordure du timeScale complètement transparente
        },
        priceScale: {
            borderColor: 'rgba(0, 0, 0, 0)', // Rendre la bordure de l'axe Y transparente
        },
        rightPriceScale: {
            borderColor: 'rgba(0, 0, 0, 0)', // Masquer la bordure de l'axe Y à droite
        },
        leftPriceScale: {
            borderColor: 'rgba(0, 0, 0, 0)', // Masquer la bordure de l'axe Y à gauche (si utilisée)
        },
    }


    useEffect(() => {
        //////////////////////////
        // Création du graphique 1
        if (!chartRef1.current || 
            !chartRef2.current || 
            !chartRef3.current
        ) return;

        const optionsChart1 = Utils.mergeDeep(defaultOptionsChart, {
            width: chartRef1.current.clientWidth,
            height: chartRef1.current.clientHeight || 300, // Définissez la hauteur désirée ici
        });
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


        const optionsChart2 = Utils.mergeDeep(defaultOptionsChart, {
            width: chartRef2.current.clientWidth,
            height: chartRef2.current.clientHeight || 300, // Définissez la hauteur désirée ici
        });
        const chartInstance2 = new TradingViewPane({
            container: chartRef2.current,
            chartOptions: optionsChart2,
        }, {
            seriesData: jsonData3,
            seriesOptions: {
                lineColor: '#2962FF',
                topColor: '#2962FF',
                bottomColor: 'rgba(41, 98, 255, 0.28)',
            }
        });


        const optionsChart3 = Utils.mergeDeep(defaultOptionsChart, {
            width: chartRef3.current.clientWidth,
            height: chartRef3.current.clientHeight || 300, // Définissez la hauteur désirée ici
            timeScale: {
                visible: true, // Affiche l'axe X
            },
        });
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
            <div className="chart chart1" ref={chartRef1}></div>
            <div className="chart chart2" ref={chartRef2}></div>
            <div className="chart chart3" ref={chartRef3}></div>
        </>          
    )
};