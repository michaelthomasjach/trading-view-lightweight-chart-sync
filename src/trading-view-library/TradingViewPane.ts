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
    Coordinate,
    PriceFormat,
    PriceFormatCustom,
    BarPrice,
    CandlestickData,
    CandlestickSeriesOptions,
    LineSeriesPartialOptions} from "lightweight-charts";

export type ChartConfig = {
    container: string | HTMLElement;
    chartOptions?: DeepPartial<ChartOptions>;
};



export type SeriesDataCandle = {
    time: string;
    open: number;
    high: number;
    low: number;
};

export type Options = {
    chartType?: ChartType;
    showLabels?: boolean;
    showMarkers?: boolean;
};

export type SeriesConfig = {
    seriesOptions?: DeepPartial<AreaStyleOptions & LineStyleOptions & SeriesOptionsCommon>;
    seriesData?: (SeriesDataDefinition)[];
    seriesTitle?: string;
    visibleRange?: LogicalRange
};

export type ShowLabelsDefinition = {
    labelsContainer: HTMLDivElement;
    labels: {
        labelElement: HTMLElement
        point: SeriesDataDefinition
    }[];
};

export type ShowMarkersDefinition = {
    markersContainer: HTMLDivElement;
    markers: {
        markerElement: HTMLElement
        point: SeriesDataDefinition
    }[];
}

export enum ChartType {
    AREA = "AREA",
    BAR = "BAR",
    BASELINE = "BASELINE",
    CANDLESTICK = "CANDLESTICK",
    HISTOGRAM = "HISTOGRAM",
    LINE = "LINE",
    STEPLINE = "STEPLINE",
}

export type SeriesDataDefinition = 
    AreaData<Time> | 
    LineData<Time> | 
    CandlestickData<Time> | 
    WhitespaceData<Time>;

export class TradingViewPane {
    private seriesValue: SeriesConfig["seriesData"] = [];
    private chartElement: IChartApi | undefined = undefined;
    private seriesElement: ISeriesApi<
        "Area" | "Line" | "Candlestick",
        Time, 
        SeriesDataDefinition, 
        AreaSeriesOptions |  LineSeriesOptions | CandlestickSeriesOptions, 
        DeepPartial<AreaStyleOptions & LineStyleOptions & SeriesOptionsCommon>
    > | undefined;
    private labelsAppendDom: any[] = [];
    private paneId = crypto.getRandomValues(new Uint32Array(1))[0];
    private seriesConfig: SeriesConfig;

    constructor(
        chartConfig: ChartConfig, 
        seriesConfig: SeriesConfig, 
        options?: Options
    ) {
        this.seriesConfig = seriesConfig;
        
        const opts = {
            chartType: ChartType.AREA,
            showLabels: false,
            showMarkers: false,
            ...options
        }    
        this.seriesValue = seriesConfig?.seriesData || [];

        
        // STEP 1
        // Initialize the chart
        this.chartElement = createChart(chartConfig.container, chartConfig?.chartOptions);


        // STEP 2
        // Set the series to the chart
        if (opts.chartType === ChartType.CANDLESTICK) this.seriesElement = this.chartElement.addCandlestickSeries();
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

        // STEP 5: Afficher le titre
        if (seriesConfig.seriesTitle) {
            this.createTitle(chartConfig.container, seriesConfig.seriesTitle)
        }

        // STEP 6: Afficher les labels de valeur
        if (opts.showLabels) {
            const {labelsContainer, labels} = this.showLabels(
                chartConfig.container,
                seriesConfig.seriesData
            );
            this.syncLabels(labelsContainer, labels);
        }

        // STEP 5: Afficher les markers
        if (opts.showMarkers) {
            const {markersContainer, markers} = this.showMarkers(
                chartConfig.container,
                seriesConfig.seriesData
            );
            this.syncMarkers(markersContainer, markers);
        }          
    }


    public addLineSeries = (
        data: LineData<Time>[] | undefined, 
        options?: LineSeriesPartialOptions
    ) => {
        const line = this.chart.addLineSeries(options);
        data && line.setData(data);
    }


    private createTitle = (container: ChartConfig["container"], title: string) => {
        if (!container) throw new Error("Container must be defined to be able to show labels !");

        const uniqueNumber = crypto.getRandomValues(new Uint32Array(1))[0];

        const labelElement = document.createElement('div');
        const uniqueId = `chart-title-${uniqueNumber}`;
        labelElement.className = `chart-title-${this.paneId}`;
        labelElement.id = uniqueId;
        labelElement.style.position = 'absolute';
        labelElement.style.background = 'rgba(255, 255, 255, 0.7)';
        labelElement.style.color = 'black';
        labelElement.style.fontSize = '14px';
        labelElement.style.textAlign = 'center';
        labelElement.style.lineHeight = '1.2'; // Ajuste l'espacement entre les lignes
        labelElement.style.left = `${10}px`; // Centrer la valeur horizontalement
        labelElement.style.top = `${10}px`; // Positionner au-dessus du point
        labelElement.style.zIndex = `9999`; // Positionner au-dessus du point
        labelElement.innerHTML = `${title}`;
        
        if (typeof container === "string") {
            const containerElement = document.getElementById(container);
            containerElement?.appendChild(labelElement);
        } else {
            container.appendChild(labelElement);
        }
        return labelElement;
    }

    private createLabel = (point: SeriesDataDefinition, timeCoordinate: Coordinate, coordinate: Coordinate) => {
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
        if (this.seriesConfig?.seriesOptions?.priceFormat) {
            const priceFormat = this.seriesConfig?.seriesOptions?.priceFormat;
            if (priceFormat && priceFormat?.type === 'custom' && 'formatter' in priceFormat) {
                const { formatter } = priceFormat as PriceFormatCustom;
                if (point && 'value' in point) labelElement.innerHTML = `${formatter(point.value as BarPrice)}`;
                if (point && 'close' in point) labelElement.innerHTML = `${formatter(point.close as BarPrice)}`;
            }
        } else {
            if (point && 'value' in point) labelElement.innerHTML = `${point.value}`;
            if (point && 'close' in point) labelElement.innerHTML = `${point.close}`;
        }
        labelElement.style.left = `${timeCoordinate}px`; // Centrer la valeur horizontalement
        labelElement.style.top = `${coordinate}px`; // Positionner au-dessus du point
        
        return labelElement;
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
                
                let coordinate: Coordinate | null = null;
                if (point && 'value' in point) coordinate = this.series!.priceToCoordinate(point.value);
                if (point && 'close' in point) coordinate = this.series!.priceToCoordinate(point.close);

                const timeCoordinate = this.chart!.timeScale().timeToCoordinate(point.time as any);

                if (coordinate !== null && timeCoordinate !== null) {
                    const labelElement = this.createLabel(label?.point, timeCoordinate, coordinate);
                    this.labelsAppendDom.push(labelsContainer.appendChild(labelElement));

                    const left = parseInt(labelElement.style.left.split('px')[0]);
                    const top = parseInt(labelElement.style.top.split('px')[0]);
                    const labelHeight = labelElement.clientHeight;
                    const labelWidth = labelElement.clientWidth;

                    labelElement.style.left = `${left - labelWidth/2}px`; // Centrer la valeur horizontalement
                    labelElement.style.top = `${top - labelHeight - 10}px`; // Positionner au-dessus du point
                } else {

                }
            });
        });  
    };

    private showLabels = (
        container: ChartConfig["container"],
        values: SeriesConfig["seriesData"]
    ): ShowLabelsDefinition => {
        if (!container) throw new Error("Container must be defined to be able to show labels !");

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
            let coordinate: Coordinate | null = null;
            if (point && 'value' in point) coordinate = this.series!.priceToCoordinate(point.value);
            if (point && 'close' in point) coordinate = this.series!.priceToCoordinate(point.close);

            const timeCoordinate = this.chart!.timeScale().timeToCoordinate(point.time as any);

            if (coordinate !== null && timeCoordinate !== null) {
                const labelElement = this.createLabel(point, timeCoordinate, coordinate)
                labelsContainer.appendChild(labelElement);

                

                const labelHeight = labelElement.clientHeight;
                const labelWidth = labelElement.clientWidth;

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


    private syncMarkers = (markersContainer: HTMLDivElement, markers: ShowMarkersDefinition["markers"]) => {
        const elementsArray = Array.from(markers.map(marker => marker.markerElement));
        if (elementsArray.length > 0) {
            (elementsArray as HTMLElement[]).forEach(e => {
               e.remove();
            });
        }  

        
        this.chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
            const elementsArray = Array.from(document.getElementsByClassName(`chart-marker-${this.paneId}`));
            if (elementsArray.length > 0) {
                (elementsArray as HTMLElement[]).forEach(e => {
                   e.remove();
                });
            }  

            markers?.forEach((marker) => {
                if (!marker?.markerElement || !marker?.point) throw new Error("Point or MarkerElement is not defined !");
                const {point, markerElement} = marker;
                
                let coordinate: Coordinate | null = null;
                if (point && 'value' in point) coordinate = this.series!.priceToCoordinate(point.value);
                if (point && 'close' in point) coordinate = this.series!.priceToCoordinate(point.close);

                const timeCoordinate = this.chart!.timeScale().timeToCoordinate(point.time as any);

                if (coordinate !== null && timeCoordinate !== null) {
                    const markerElement = this.createMarker(marker?.point, timeCoordinate, coordinate);
                    this.labelsAppendDom.push(markersContainer.appendChild(markerElement));

                    const left = parseInt(markerElement.style.left.split('px')[0]);
                    const top = parseInt(markerElement.style.top.split('px')[0]);
                    const labelHeight = markerElement.clientHeight;
                    const labelWidth = markerElement.clientWidth;

                    markerElement.style.left = `${left }px`; // Centrer la valeur horizontalement
                    markerElement.style.top = `${top}px`; // Positionner au-dessus du point
                } else {

                }
            });
        });  
    }

    private showMarkers = (
        container: ChartConfig["container"],
        values: SeriesConfig["seriesData"]
    ): ShowMarkersDefinition => {
        if (!container) throw new Error("Container must be defined to be able to show markers !");

        const markersContainer: HTMLDivElement = document.createElement("div");
        markersContainer.className = "markers-container";
        markersContainer.style.position = "absolute";
        markersContainer.style.top = "0";
        markersContainer.style.left = "0";
        markersContainer.style.width = "100%";
        markersContainer.style.height = "100%";
        markersContainer.style.zIndex = "1";
        
        if (typeof container === "string") {
            const containerElement = document.getElementById(container);
            containerElement?.appendChild(markersContainer);
        } else {
            container.appendChild(markersContainer);
        }


        const markers: ShowMarkersDefinition["markers"] = [];
        // Display initial position of labels
        values?.forEach((point) => {
            let coordinate: Coordinate | null = null;
            if (point && 'value' in point) coordinate = this.series!.priceToCoordinate(point.value);
            if (point && 'close' in point) coordinate = this.series!.priceToCoordinate(point.close);

            const timeCoordinate = this.chart!.timeScale().timeToCoordinate(point.time as any);

            if (coordinate !== null && timeCoordinate !== null) {
                const markerElement = this.createMarker(point, timeCoordinate, coordinate)

                const markerHeight = markerElement.clientHeight;
                const markerWidth = markerElement.clientWidth;

                const top = parseInt(markerElement.style.top.split("px")[0]);
                const left = parseInt(markerElement.style.left.split("px")[0]);

                markerElement.style.left = `${left - markerWidth / 2}px`; // Centrer la valeur horizontalement
                markerElement.style.top = `${top - markerHeight / 2}px`; // Positionner au-dessus du point
                
                markersContainer.appendChild(markerElement);
                
                markers.push({
                    markerElement,
                    point
                })

            }
        });

        return {
            markersContainer,
            markers
        };
    }

    private createMarker = (point: SeriesDataDefinition, timeCoordinate: Coordinate, coordinate: Coordinate) => {
        const uniqueNumber = crypto.getRandomValues(new Uint32Array(1))[0];

        const markerElement = document.createElement('div');
        const uniqueId = `chart-marker-${uniqueNumber}`;
        const markerSize = 8;
        markerElement.className = `chart-marker-${this.paneId}`;
        markerElement.id = uniqueId;
        markerElement.style.position = 'absolute';
        markerElement.style.background = this.seriesConfig.seriesOptions?.color ? this.seriesConfig.seriesOptions?.color : 'red';
        markerElement.style.border = '2px solid white';
        markerElement.style.width = `${markerSize}px`; // Centrer la valeur horizontalement
        markerElement.style.height = `${markerSize}px`; // Centrer la valeur horizontalement
        markerElement.style.borderRadius = `${50}%`; // Centrer la valeur horizontalement

        markerElement.style.left = `${timeCoordinate - markerSize / 2 -1}px`; // Centrer la valeur horizontalement
        markerElement.style.top = `${coordinate - markerSize / 2 -1}px`; // Positionner au-dessus du point
        
        return markerElement;
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