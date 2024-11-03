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
    LineType,  
    Coordinate} from "lightweight-charts";

export type ChartConfig = {
    container: string | HTMLElement;
    chartOptions?: DeepPartial<ChartOptions>;
};

export type SeriesDataPoint = {
    time: string;
    value: number;
};

export type Options = {
    chartType?: ChartType;
    showLabels?: boolean;
};

export type SeriesConfig = {
    seriesOptions?: DeepPartial<AreaStyleOptions & LineStyleOptions & SeriesOptionsCommon>;
    seriesData?: SeriesDataPoint[];
    visibleRange?: LogicalRange
};

export type ShowLabelsDefinition = {
    labelsContainer: HTMLDivElement;
    labels: {
        labelElement: HTMLElement
        point: SeriesDataPoint
    }[];
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
    private labelsAppendDom: any[] = [];
    private paneId = crypto.getRandomValues(new Uint32Array(1))[0];

    constructor(
        chartConfig: ChartConfig, 
        seriesConfig: SeriesConfig, 
        options?: Options
    ) {

        const opts = {
            chartType: ChartType.AREA,
            showLabels: false,
            ...options
        }    
        this.seriesValue = seriesConfig?.seriesData || [];

        
        // STEP 1
        // Initialize the chart
        this.chartElement = createChart(chartConfig.container, chartConfig?.chartOptions);


        // STEP 2
        // Set the series to the chart
        if (opts.chartType === ChartType.AREA) this.seriesElement = this.chartElement.addAreaSeries();
        if (opts.chartType === ChartType.LINE || 
            opts.chartType === ChartType.STEPLINE
        ) this.seriesElement = this.chartElement.addLineSeries();
        
        if (!this.seriesElement) throw new Error("You must provide a serie");

        // STEP 3
        // Set series to the chart
        const updatedOptions = {
            ...seriesConfig?.seriesOptions,
            lineType: LineType.WithSteps
        }
        seriesConfig?.seriesOptions && this.seriesElement.applyOptions(opts.chartType === ChartType.STEPLINE ? updatedOptions : seriesConfig?.seriesOptions);
        this.seriesValue && this.seriesElement.setData(this.seriesValue);


        // STEP 4
        // Initial boundaries of displayed elements on the chart
        this.seriesValue.length && this.chartElement.timeScale().setVisibleLogicalRange({
            from: seriesConfig?.visibleRange?.from || 0,
            to: seriesConfig?.visibleRange?.to || this.seriesValue.length - 1
        });



        // STEP 5: Afficher les labels de valeur

        if (opts.showLabels) {
            const {labelsContainer, labels} = this.showLabels(
                chartConfig.container,
                seriesConfig.seriesData
            );
            this.syncLabels(labelsContainer, labels);
        }
    }


    private syncLabels = (labelsContainer: HTMLDivElement, labels: ShowLabelsDefinition["labels"]) => {
        const elementsArray = Array.from(labels.map(label => label.labelElement));
        if (elementsArray.length > 0) {
            (elementsArray as HTMLElement[]).forEach(e => {
               e.remove();
            });
        }  

        
        this.chart.timeScale().subscribeVisibleLogicalRangeChange(() => {

            const elementsArray = Array.from(document.getElementsByClassName(`chart-label-${this.paneId}`));
            if (elementsArray.length > 0) {
                (elementsArray as HTMLElement[]).forEach(e => {
                   e.remove();
                });
            }  

            labels?.forEach((label) => {
                if (!label?.labelElement || !label?.point) throw new Error("Point or LabelElement is not defined !");
                const {point, labelElement} = label;
                const coordinate = this.series!.priceToCoordinate(point.value);
                const timeCoordinate = this.chart!.timeScale().timeToCoordinate(point.time as any);

                if (coordinate !== null && timeCoordinate !== null) {
                    const labelElement = this.createLabel(label?.point, timeCoordinate, coordinate);
                    this.labelsAppendDom.push(labelsContainer.appendChild(labelElement));

                    const left = parseInt(labelElement.style.left.split('px')[0]);
                    const top = parseInt(labelElement.style.top.split('px')[0]);
                    const labelHeight = labelElement.clientHeight;
                    const labelWidth = labelElement.clientWidth;

                    console.log('labelWidth', left)
                    labelElement.style.left = `${left - labelWidth/2}px`; // Centrer la valeur horizontalement
                    labelElement.style.top = `${top - labelHeight - 10}px`; // Positionner au-dessus du point
                } else {

                }
            });
        });  
    };



    private createLabel = (point: SeriesDataPoint, timeCoordinate: Coordinate, coordinate: Coordinate) => {
        const uniqueNumber = crypto.getRandomValues(new Uint32Array(1))[0];

        const labelElement = document.createElement('div');
        const uniqueId = `chart-label-${uniqueNumber}`;
        labelElement.className = `chart-label-${this.paneId}`;
        labelElement.id = uniqueId;
        labelElement.style.position = 'absolute';
        labelElement.style.background = 'transparent';
        labelElement.style.color = 'white';
        labelElement.style.fontSize = '12px';
        labelElement.style.maxWidth = '50px';
        labelElement.style.textAlign = 'center';
        labelElement.style.lineHeight = '1.2'; // Ajuste l'espacement entre les lignes
        
        //labelElement.style.webkitTextStroke = '1px #000'; // Contour noir de 2 pixels pour créer l'effet bien prononcé
        const width = 1;
        labelElement.style.textShadow = `
        -${width}px -${width}px 0 #000,
        ${width}px -${width}px 0 #000,
        -${width}px ${width}px 0 #000,
        ${width}px ${width}px 0 #000,
        0px -${width + 1}px 0 #000,
        0px ${width + 1}px 0 #000,
        -${width + 1}px 0px 0 #000,
        ${width + 1}px 0px 0 #000
    `;
        
        labelElement.innerHTML = `${point.value}`;
        labelElement.style.left = `${timeCoordinate}px`; // Centrer la valeur horizontalement
        labelElement.style.top = `${coordinate}px`; // Positionner au-dessus du point
        
        return labelElement;
    }


    private showLabels = (
        container: ChartConfig["container"],
        values: SeriesConfig["seriesData"]
    ): ShowLabelsDefinition => {
        if (!container) throw new Error("Container must be defined to be able to show labels !");

        // STEP 4: Créer un conteneur pour les labels
        const labelsContainer: HTMLDivElement = document.createElement("div");
        labelsContainer.className = "labels-container";
        labelsContainer.style.position = "absolute";
        labelsContainer.style.top = "0";
        labelsContainer.style.left = "0";
        labelsContainer.style.width = "100%";
        labelsContainer.style.height = "100%";
        labelsContainer.style.zIndex = "1000";
        
        if (typeof container === "string") {
            const containerElement = document.getElementById(container);
            containerElement?.appendChild(labelsContainer);
        } else {
            container.appendChild(labelsContainer);
        }


        const labels: ShowLabelsDefinition["labels"] = [];
        // Display initial position of labels
        values?.forEach((point) => {
            const coordinate = this.series!.priceToCoordinate(point.value);
            const timeCoordinate = this.chart!.timeScale().timeToCoordinate(point.time as any);

            if (coordinate !== null && timeCoordinate !== null) {
                const labelElement = this.createLabel(point, timeCoordinate, coordinate)
                labelsContainer.appendChild(labelElement);

                

                const labelHeight = labelElement.clientHeight;
                const labelWidth = labelElement.clientWidth;
                console.log('labelWidth', labelWidth)
                labelElement.style.left = `${labelElement.style.left + labelWidth}px`; // Centrer la valeur horizontalement
                labelElement.style.top = `${labelElement.style.top + labelHeight}px`; // Positionner au-dessus du point
                labels.push({
                    labelElement,
                    point
                })

            }
        });

        return {
            labelsContainer,
            labels
        };
    };

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