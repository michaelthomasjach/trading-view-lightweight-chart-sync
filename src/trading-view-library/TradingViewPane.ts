import { createChart, ChartOptions, DeepPartial, IChartApi, ISeriesApi, Time, AreaData, WhitespaceData, AreaSeriesOptions, AreaStyleOptions, SeriesOptionsCommon, LogicalRange } from "lightweight-charts";

export type ChartConfig = {
    container: string | HTMLElement;
    chartOptions?: DeepPartial<ChartOptions>;
};

export type SeriesConfig = {
    seriesOptions?: DeepPartial<AreaStyleOptions & SeriesOptionsCommon>;
    seriesData?: { time: string; value: number }[];
    visibleRange?: LogicalRange
};

export class TradingViewPane {
    private seriesValue: SeriesConfig["seriesData"] = [];
    private chartElement: IChartApi | undefined = undefined;
    private seriesElement: ISeriesApi<"Area", Time, AreaData<Time> | WhitespaceData<Time>, AreaSeriesOptions, DeepPartial<AreaStyleOptions & SeriesOptionsCommon>> | undefined;

    constructor(chartConfig: ChartConfig, seriesConfig: SeriesConfig) {
        this.seriesValue = seriesConfig?.seriesData || [];

        // STEP 1
        // Initialize the chart
        this.chartElement = createChart(chartConfig.container, chartConfig?.chartOptions);


        // STEP 2
        // Set the series to the chart
        this.seriesElement = this.chartElement.addAreaSeries();
        seriesConfig?.seriesOptions && this.seriesElement.applyOptions(seriesConfig?.seriesOptions);
        this.seriesValue && this.seriesElement.setData(this.seriesValue);


        // STEP 3
        // Initial boundaries of displayed elements on the chart
        this.seriesValue.length && this.chartElement.timeScale().setVisibleLogicalRange({
            from: seriesConfig?.visibleRange?.from || 0,
            to: seriesConfig?.visibleRange?.to || this.seriesValue.length - 1
        });
    }


    get chart(): IChartApi {
        return this.chartElement as IChartApi;
    }

    get series() {
        return this.seriesElement;
    }

    get values() {
        return this.seriesValue;
    }
}