import { ScaleContinuousNumeric, scaleLinear } from "d3-scale";
import * as React from "react";
import { ChartCanvasContext } from "./ChartCanvas";
import { ChartConfig } from "./utils/ChartDataUtil";

export type ChartContextType = {
    chartConfig: ChartConfig;
    chartId: number | string;
};
export const ChartContext = React.createContext<ChartContextType>({
    // @ts-ignore
    chartConfig: {},
    chartId: 0,
});

export interface ChartProps {
    readonly flipYScale?: boolean;
    readonly height?: number;
    readonly id: number | string;
    readonly onContextMenu?: (event: React.MouseEvent, moreProps: any) => void;
    readonly onDoubleClick?: (event: React.MouseEvent, moreProps: any) => void;
    readonly origin?: number[] | ((width: number, height: number) => number[]);
    readonly padding?: number | { top: number; bottom: number };
    readonly yExtents?: number[] | ((data: any) => number) | ((data: any) => number[]);
    readonly yExtentsCalculator?: (options: {
        plotData: any[];
        xDomain: any;
        xAccessor: any;
        displayXAccessor: any;
        fullData: any[];
    }) => number[];
    readonly yPan?: boolean;
    readonly yPanEnabled?: boolean;
    readonly yScale?: ScaleContinuousNumeric<number, number>;
}

export const Chart = React.memo((props: React.PropsWithChildren<ChartProps>) => {
    const {
        // flipYScale = false,
        id = 0,
        // origin = [0, 0],
        // padding = 0,
        // yPan = true,
        // yPanEnabled = false,
        // yScale = scaleLinear(),
        onContextMenu,
        onDoubleClick,
    } = props;

    const { subscribe, unsubscribe, chartConfig } = React.useContext(ChartCanvasContext);

    const listener = React.useCallback(
        (type: string, moreProps: any, _: any, e: React.MouseEvent) => {
            switch (type) {
                case "contextmenu": {
                    if (onContextMenu === undefined) {
                        return;
                    }

                    const { currentCharts } = moreProps;
                    if (currentCharts.indexOf(id) > -1) {
                        onContextMenu(e, moreProps);
                    }

                    break;
                }
                case "dblclick": {
                    if (onDoubleClick === undefined) {
                        return;
                    }

                    const { currentCharts } = moreProps;
                    if (currentCharts.indexOf(id) > -1) {
                        onDoubleClick(e, moreProps);
                    }

                    break;
                }
            }
        },
        [onContextMenu, onDoubleClick, id],
    );

    React.useEffect(() => {
        subscribe(`chart_${id}`, {
            listener,
        });
        return () => unsubscribe(`chart_${id}`);
    }, [subscribe, unsubscribe, id, listener]);

    const config = chartConfig.find(({ id }) => id === props.id)!;
    const contextValue = React.useMemo(() => {
        return {
            chartId: id,
            chartConfig: config,
        };
    }, [id, config]);

    const {
        origin: [x, y],
    } = config;

    return (
        <ChartContext.Provider value={contextValue}>
            <g transform={`translate(${x}, ${y})`}>{props.children}</g>
        </ChartContext.Provider>
    );
});

export const ChartDefaultConfig = {
    flipYScale: false,
    id: 0,
    origin: [0, 0],
    padding: 0,
    yPan: true,
    yPanEnabled: false,
    yScale: scaleLinear(),
};

Chart.displayName = "Chart";
