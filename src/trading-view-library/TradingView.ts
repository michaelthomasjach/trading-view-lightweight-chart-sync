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

    
    //////////////////////////
    // Syncronisation des crosshair
    // https://tradingview.github.io/lightweight-charts/tutorials/how_to/set-crosshair-position
    private syncCrosshair = (sourceChart: TradingViewPane, targetChart: TradingViewPane) => {
        sourceChart.chart.subscribeCrosshairMove((param) => {
            console.log('param', param.logical)
            let dataPoint: {time: Time; value: number} | undefined = undefined; 
            param.seriesData.forEach((value, key) => {
                dataPoint = {
                    time: value.time,
                    value: (value as unknown as any)?.value 
                }
            });
                        
            if (!dataPoint && param?.logical) {
                // Récupérer la valeur la plus proche en termes de temps
                const coordinate = targetChart.chart.timeScale().logicalToCoordinate(param.logical);

                if (!coordinate) throw new Error("Unable to get coordinate with logical informations");
                const time = sourceChart.chart.timeScale().coordinateToTime(coordinate);
                console.log('time', time)
                if (!time) throw new Error("Unable to get Time from coordinates");
                targetChart.series && targetChart.chart.setCrosshairPosition(0, time, targetChart.series);
                return;
            }

            if (dataPoint) {
                const {time, value} = dataPoint;
                targetChart.series && targetChart.chart.setCrosshairPosition(value, time, targetChart.series);
                return;
            }
            targetChart.chart.clearCrosshairPosition();
        });
    };


    //////////////////////////
    // Fonction pour récupérer la valeur la plus proche d'une série
    private getClosestValue(seriesData: Array<{ time: Time; value: number }> | undefined, targetTime: Time): number | undefined {
        if (!seriesData || seriesData.length === 0) return undefined;

        let closestValue: number | undefined = undefined;
        let smallestDifference = Number.MAX_SAFE_INTEGER;

        seriesData.forEach((point) => {
            const timeDifference = Math.abs((point.time as number) - (targetTime as number));
            if (timeDifference < smallestDifference) {
                smallestDifference = timeDifference;
                closestValue = point.value;
            }
        });

        return closestValue;
    }
}