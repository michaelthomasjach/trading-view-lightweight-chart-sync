import { 
    createChart, 
    ChartOptions,
    DeepPartial, 
    IChartApi, 
    ISeriesApi, 
    Time, 
    AreaData,
    WhitespaceData, 
    AreaSeriesOptions, 
    AreaStyleOptions, 
    SeriesOptionsCommon,
    LogicalRange, 
    LineStyleOptions,
    LineSeriesOptions,
    LineData,
    LineType  } from "lightweight-charts";

export type ChartConfig = {
    container: string | HTMLElement;
    chartOptions?: DeepPartial<ChartOptions>;
};

export type SeriesConfig = {
    seriesOptions?: DeepPartial<AreaStyleOptions & LineStyleOptions & SeriesOptionsCommon>;
    seriesData?: { time: string; value: number }[];
    visibleRange?: LogicalRange
};


export enum ChartType {
    AREA = "AREA",
    BAR = "BAR",
    BASELINE = "BASELINE",
    CANDLESTICK = "CANDLESTICK",
    HISTOGRAM = "HISTOGRAM",
    LINE = "LINE",
    STEPLINE = "STEPLINE",
}

export class TradingViewPane {
    private seriesValue: SeriesConfig["seriesData"] = [];
    private chartElement: IChartApi | undefined = undefined;
    private seriesElement: ISeriesApi<"Area" | "Line", Time, AreaData<Time> | LineData<Time> | WhitespaceData<Time>, AreaSeriesOptions | LineSeriesOptions, DeepPartial<AreaStyleOptions & LineStyleOptions & SeriesOptionsCommon>> | undefined;

    constructor(chartConfig: ChartConfig, seriesConfig: SeriesConfig, chartType: ChartType = ChartType.AREA) {
        this.seriesValue = seriesConfig?.seriesData || [];

        
        // STEP 1
        // Initialize the chart
        this.chartElement = createChart(chartConfig.container, chartConfig?.chartOptions);


        // STEP 2
        // Set the series to the chart
        if (chartType === ChartType.AREA) this.seriesElement = this.chartElement.addAreaSeries();
        if (chartType === ChartType.LINE || 
            chartType === ChartType.STEPLINE
        ) this.seriesElement = this.chartElement.addLineSeries();
        

        // STEP 2
        // Check if series if defined
        if (!this.seriesElement) throw new Error("You must provide a serie");

        // STEP 3
        // Set series to the chart
        const updatedOptions = {
            ...seriesConfig?.seriesOptions,
            lineType: LineType.WithSteps
        }
        seriesConfig?.seriesOptions && this.seriesElement.applyOptions(chartType === ChartType.STEPLINE ? updatedOptions : seriesConfig?.seriesOptions);
        this.seriesValue && this.seriesElement.setData(this.seriesValue);


        // STEP 4
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