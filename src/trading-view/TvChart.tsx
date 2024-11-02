import './tv.css';
import jsonData from './data.json';
import React, { useEffect, useRef, useState } from 'react';
import {ColorType, createChart} from 'lightweight-charts';

interface ITvChartState {
}

type Props = { 
    className?: string;
};

export const TvChart = ({ className }: Props) => {
    const firstChartRef = useRef<HTMLDivElement>(null);
    const secondChartRef = useRef<HTMLDivElement>(null);
    const [range, setRange] = useState(null);
    const isSynchronizing = useRef<boolean>(false);

    const priceLength = jsonData.length;

    const syncCharts = (sourceChart, targetChart) => {
        sourceChart.timeScale().subscribeVisibleLogicalRangeChange((visibleRange) => {
            if (isSynchronizing.current) return; // Evite une boucle infinie
            if (visibleRange !== null) {
                isSynchronizing.current = true; // Définir le verrou pour empêcher la boucle
                targetChart.timeScale().setVisibleLogicalRange(visibleRange);
                setRange(visibleRange);
                isSynchronizing.current = false;  // Libérer le verrou après la mise à jour
            }
        });
    };

    useEffect(() => {
        //////////////////////////
        // Création du graphique 1
        if (!firstChartRef.current) return;
        const firstChartInstance = createChart(firstChartRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            width: firstChartRef.current.clientWidth,
            height: firstChartRef.current.clientHeight || 300, // Définissez la hauteur désirée ici
        });

        //////////////////////////
        // Création du graphique 2
        if (!secondChartRef.current) return;
        const secondChartInstance = createChart(secondChartRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            width: secondChartRef.current.clientWidth,
            height: secondChartRef.current.clientHeight || 300, // Définissez la hauteur désirée ici
        });


        //////////////////////////
        // Ajout données (graphique 1)
        const series1 = firstChartInstance.addAreaSeries();
        series1.applyOptions({
            lineColor: '#2962FF',
            topColor: '#2962FF',
            bottomColor: 'rgba(41, 98, 255, 0.28)',
        });
        series1.setData(jsonData as any);
        


        //////////////////////////
        // Ajout données (graphique 2)
        const series2 = secondChartInstance.addAreaSeries();
        series2.applyOptions({
            lineColor: '#2962FF',
            topColor: '#2962FF',
            bottomColor: 'rgba(41, 98, 255, 0.28)',
        });
        series2.setData(jsonData as any);


        
        //////////////////////////
        // Syncronisation des chart
        if (firstChartInstance && secondChartInstance) {
            syncCharts(firstChartInstance, secondChartInstance);
            syncCharts(secondChartInstance, firstChartInstance);
        }

        firstChartInstance.timeScale().setVisibleLogicalRange({"from": 0,"to": priceLength - 1});


        //////////////////////////
        // Netoyage des charts
        return () => {
            firstChartInstance.remove();
            secondChartInstance.remove();
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