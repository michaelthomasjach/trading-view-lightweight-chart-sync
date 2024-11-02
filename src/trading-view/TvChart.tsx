import './tv.css';
import jsonData1 from './serie1.json';
import jsonData2 from './serie2.json';
import React, { useEffect, useRef, useState } from 'react';
import {ColorType, createChart, LogicalRange, Time} from 'lightweight-charts';
import { CustomTradingViewChart } from './CustomTradingViewChart';

interface ITvChartState {
}

type Props = { 
    className?: string;
};

export const TvChart = ({ className }: Props) => {
    const firstChartRef = useRef<HTMLDivElement>(null);
    const secondChartRef = useRef<HTMLDivElement>(null);
    const [range, setRange] = useState<LogicalRange | null>(null);
    const isSynchronizing = useRef<boolean>(false);

    const syncCharts = (sourceChart: CustomTradingViewChart, targetChart: CustomTradingViewChart) => {
        sourceChart.chart.timeScale().subscribeVisibleLogicalRangeChange((visibleRange) => {
            if (isSynchronizing.current) return; // Evite une boucle infinie
            if (visibleRange !== null) {
                isSynchronizing.current = true; // Définir le verrou pour empêcher la boucle
                targetChart.chart.timeScale().setVisibleLogicalRange(visibleRange);
                setRange(visibleRange);
                isSynchronizing.current = false;  // Libérer le verrou après la mise à jour
            }
        });
    };

    const syncCrosshair = (sourceChart: CustomTradingViewChart, targetChart: CustomTradingViewChart) => {
        sourceChart.chart.subscribeCrosshairMove((param) => {
            let dataPoint: {time: Time; value: number} | undefined = undefined; 
            param.seriesData.forEach((value, key) => {
                dataPoint = {
                    time: value.time,
                    value: (value as unknown as any).value 
                }
            });
            
            if (dataPoint) {
                const {time, value} = dataPoint;
                targetChart.series && targetChart.chart.setCrosshairPosition(value, time, targetChart.series);
                return;
            }
            targetChart.chart.clearCrosshairPosition();
        });
    };

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
        const firstChartInstance = new CustomTradingViewChart({
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
        const secondChartInstance = new CustomTradingViewChart({
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
        
        
        //////////////////////////
        // Syncronisation des chart
        if (firstChartInstance && secondChartInstance) {
            syncCharts(firstChartInstance, secondChartInstance);
            syncCharts(secondChartInstance, firstChartInstance);

            syncCrosshair(firstChartInstance, secondChartInstance);
            syncCrosshair(secondChartInstance, firstChartInstance);
        }

        
        //////////////////////////
        // Netoyage des charts
        return () => {
            firstChartInstance.chart.remove();
            secondChartInstance.chart.remove();
        };
    }, []);
    

    return (
        <>
        range: {JSON.stringify(range)}
            <div className="chart1" ref={firstChartRef}></div>
            <div className="chart2" ref={secondChartRef}></div>
        </>          
    )
};