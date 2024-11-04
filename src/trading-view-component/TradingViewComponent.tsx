import './trading-view-component.css';
import './trading-view-global.css';
import jsonData1 from './serie1.json';
import jsonData2 from './serie2.json';
import jsonData3 from './serie3.json';
import React, { useEffect, useRef, useState } from 'react';
import {ColorType, createChart, LogicalRange, Time, WhitespaceData} from 'lightweight-charts';
import { ChartType, TradingViewPane } from '../trading-view-library/TradingViewPane';
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

/** ***************************
 * Changer la largeur de l'axe Y
 * https://stackoverflow.com/questions/71901106/a-way-to-set-pricescale-width-in-lightweight-charts
 */
    const axisColor = "#c8c8c8";
    const defaultOptionsChart = {
        layout: {
            background: { type: ColorType.Solid, color: 'white' },
            textColor: axisColor,
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
            textColor: axisColor, // Couleur de la police de l'axe Y
            visible: false, // Masquer complètement l'axe X
            borderColor: 'rgba(0, 0, 0, 0)', // Rendre la bordure du timeScale complètement transparente
            tickMarkFormatter: (time, tickMarkType) => {
                const date = new Date(time); // Convertir le temps Unix en date JavaScript
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Les mois commencent à 0
                const year = date.getFullYear();
                return `${day}/${month}/${year}`; // Format "dd/mm/yyyy"
            },
        },
        priceScale: {
            textColor: axisColor, // Couleur de la police de l'axe Y
            borderColor: 'rgba(0, 0, 0, 0)', // Rendre la bordure de l'axe Y transparente
        },
        rightPriceScale: {
            textColor: axisColor, // Couleur de la police de l'axe Y
            borderColor: 'rgba(0, 0, 0, 0)', // Masquer la bordure de l'axe Y à droite
            minimumWidth: 65
        },
        leftPriceScale: {
            textColor: axisColor, // Couleur de la police de l'axe Y
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
            seriesTitle: "LOREAL",
            seriesData: jsonData1,
            seriesOptions: {
                lineColor: '#2962FF',
                topColor: '#2962FF',
                bottomColor: 'rgba(41, 98, 255, 0.28)',
            }
        },
        {
            chartType: ChartType.CANDLESTICK,
        });


        const optionsChart2 = Utils.mergeDeep(defaultOptionsChart, {
            width: chartRef2.current.clientWidth,
            height: chartRef2.current.clientHeight || 300, // Définissez la hauteur désirée ici
        });
        const jsonData2WhiteSpaced = jsonData1.map((candle) => {
            const existingData = jsonData2.find((s) => s.time === candle.time);
            return existingData || { time: candle.time } as WhitespaceData;
        });
        const chartInstance2 = new TradingViewPane({
                container: chartRef2.current,
                chartOptions: optionsChart2,
            }, {
                seriesTitle: "Total revenue",
                seriesData: jsonData2WhiteSpaced,
                seriesOptions: {
                    color: '#46a474',
                    lineWidth: 2,
                    priceFormat: {
                        type: 'custom',
                        formatter: (price) => {
                          return `$${price.toFixed(2)}B`; // Format "prix avec deux décimales" et signe dollar
                        },
                    },
                },
                
            },
            {
                chartType: ChartType.STEPLINE,
                showLabels: true,
                showMarkers: true,
            }
            
        );


        const optionsChart3 = Utils.mergeDeep(defaultOptionsChart, {
            width: chartRef3.current.clientWidth,
            height: chartRef3.current.clientHeight || 300, // Définissez la hauteur désirée ici
            timeScale: {
                visible: true, // Affiche l'axe X
            },
        });
        const jsonData3WhiteSpaced = jsonData1.map((candle) => {
            const existingData = jsonData3.find((s) => s.time === candle.time);
            return existingData || { time: candle.time } as WhitespaceData;
        });
        const chartInstance3 = new TradingViewPane({
            container: chartRef3.current,
            chartOptions: optionsChart3,
        }, {
            seriesTitle: "Net income",
            seriesData: jsonData3WhiteSpaced,
            seriesOptions: {
                color: '#f2d13a',
                lineWidth: 2,
            }
        }, {
            chartType: ChartType.STEPLINE,
            showLabels: true,
            showMarkers: true 
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
            <div className="chart-wrapper">
                <div className="chart chart1" ref={chartRef1}></div>
                <div className="chart chart2" ref={chartRef2}></div>
                <div className="chart chart3" ref={chartRef3}></div>
            </div>
            
        </>          
    )
};