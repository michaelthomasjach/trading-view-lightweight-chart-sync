import { Time } from "lightweight-charts";
import { TradingViewPane } from "./TradingViewPane";

export class TradingView {
    private isSynchronizing = false;

    constructor(charts: TradingViewPane[]) {
        if (!charts) throw new Error(`You must provide at least 1 chart ${TradingViewPane}`)
        const combinedCharts = this.generateCombinations(charts);

        combinedCharts.forEach(combined => {
            this.syncCharts(combined.source, combined.target);
            this.syncCrosshair(combined.source, combined.target);
        })
    }


    private generateCombinations(charts: TradingViewPane[]): {source: TradingViewPane; target: TradingViewPane}[] {
        if (!charts) return [];
        let combinations: {source: TradingViewPane; target: TradingViewPane}[] = [];
    
        for (let i = 0; i < charts.length; i++) {
            for (let j = i + 1; j < charts.length; j++) {
                combinations.push({source: charts[i], target: charts[j]});
                combinations.push({source: charts[j], target: charts[i]});
            }
        }
    
        return combinations;
    }
    
    
    //////////////////////////
    // Syncronisation des chart
    private syncCharts = (sourceChart: TradingViewPane, targetChart: TradingViewPane) => {
        sourceChart.chart.timeScale().subscribeVisibleLogicalRangeChange((visibleRange) => {
            if (this.isSynchronizing) return; // Evite une boucle infinie
            if (visibleRange !== null) {
                this.isSynchronizing = true; // Définir le verrou pour empêcher la boucle
                targetChart.chart.timeScale().setVisibleLogicalRange(visibleRange);
                this.isSynchronizing = false;  // Libérer le verrou après la mise à jour
            }
        });

    
        
    };


    private syncLabels = () => {
    
    }


    
    //////////////////////////
    // Syncronisation des crosshair
    // https://tradingview.github.io/lightweight-charts/tutorials/how_to/set-crosshair-position
    private syncCrosshair = (sourceChart: TradingViewPane, targetChart: TradingViewPane) => {
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
}