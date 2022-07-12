import React, { ForwardedRef, useCallback, useContext } from "react";
import { GenericComponent, GenericComponentProps, GenericComponentRef, MoreProps } from "./GenericComponent";
import { isDefined } from "./utils";
import { ChartContext } from "./Chart";

const ALWAYS_TRUE_TYPES = ["drag", "dragend"];

const postCanvasDraw = (ctx: CanvasRenderingContext2D) => {
    ctx.restore();
};

export const GenericChartComponent = React.memo(
    React.forwardRef((props: GenericComponentProps, ref: ForwardedRef<GenericComponentRef>) => {
        const context = useContext(ChartContext);
        const { chartConfig } = context;
        const getMoreProps = useCallback(
            (moreProps: MoreProps) => {
                // const result =
                // if (isDefined(moreProps.chartConfig)) {
                //     const {
                //         origin: [ox, oy],
                //     } = moreProps.chartConfig;
                //     if (isDefined(moreProps.mouseXY)) {
                //         const {
                //             mouseXY: [x, y],
                //         } = moreProps;
                //         moreProps.mouseXY = [x - ox, y - oy];
                //     }
                //     if (isDefined(moreProps.startPos)) {
                //         const {
                //             startPos: [x, y],
                //         } = moreProps;
                //         moreProps.startPos = [x - ox, y - oy];
                //     }
                // }
                // if (isDefined(moreProps.mouseXY)) {
                //     const {
                //         mouseXY: [x, y],
                //     } = moreProps;
                //     moreProps.mouseXY = [x - ox, y - oy];
                // }
                return {
                    chartConfig,
                };
            },
            [chartConfig],
        );
        const preCanvasDraw = useCallback(
            (ctx: CanvasRenderingContext2D) => {
                ctx.save();
                const { margin, ratio } = context;
                const { width, height, origin } = chartConfig;

                const canvasOriginX = 0.5 * ratio + origin[0] + margin.left;
                const canvasOriginY = 0.5 * ratio + origin[1] + margin.top;

                const { clip, edgeClip } = props;

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(ratio, ratio);
                if (edgeClip) {
                    ctx.beginPath();
                    ctx.rect(-1, canvasOriginY - 10, width + margin.left + margin.right + 1, height + 20);
                    ctx.clip();
                }

                ctx.translate(canvasOriginX, canvasOriginY);

                if (clip) {
                    ctx.beginPath();
                    ctx.rect(-1, -1, width + 1, height + 1);
                    ctx.clip();
                }
            },
            [context.margin, context.ratio, props.clip, props.edgeClip, chartConfig],
        );

        const shouldTypeProceed = useCallback((type: string, moreProps: MoreProps) => {
            if ((type === "mousemove" || type === "click") && props.disablePan) {
                return true;
            }
            if (ALWAYS_TRUE_TYPES.indexOf(type) === -1 && isDefined(moreProps) && isDefined(moreProps.currentCharts)) {
                return moreProps.currentCharts.indexOf(context.chartId) > -1;
            }
            return true;
        }, []);

        const updateMoreProps = useCallback((newMoreProps: MoreProps | undefined, moreProps: MoreProps) => {
            const { chartConfigs: chartConfigList } = newMoreProps || moreProps;
            if (chartConfigList && Array.isArray(chartConfigList)) {
                const { chartId } = context;
                moreProps.chartConfig = chartConfigList.find((each) => each.id === chartId);
            }
            if (isDefined(moreProps.chartConfig)) {
                const {
                    origin: [ox, oy],
                } = moreProps.chartConfig;
                if (isDefined(moreProps.mouseXY)) {
                    const {
                        mouseXY: [x, y],
                    } = moreProps;
                    moreProps.mouseXY = [x - ox, y - oy];
                }
                if (isDefined(moreProps.startPos)) {
                    const {
                        startPos: [x, y],
                    } = moreProps;
                    moreProps.startPos = [x - ox, y - oy];
                }
            }
        }, []);

        return (
            <GenericComponent
                {...props}
                ref={ref}
                preCanvasDraw={preCanvasDraw}
                postCanvasDraw={postCanvasDraw}
                shouldTypeProceed={shouldTypeProceed}
                updateMoreProps={updateMoreProps}
                getMoreProps={getMoreProps}
            />
        );
    }),
);
