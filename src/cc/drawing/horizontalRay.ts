import {OnePointDrawing} from "./drawing";
import {IHorizontalLine, IHorizontalRay, IOnePointDrawing} from "./def";
import {IStage} from "../dom/def";
import {Line} from "../core/line";
import { Color } from "../core";

export class HorizontalRay extends OnePointDrawing implements IHorizontalRay {
	static type = 'HorizontalRay'
	initHeight: number
	initWidth: number
	constructor(l: IOnePointDrawing, scaleCanvas: HTMLCanvasElement, initWidth: number, initHeight: number) {
		super(l, scaleCanvas)

		this.type = HorizontalRay.type
		this.initHeight = initHeight
		this.initWidth = initWidth
	}

	hitTest(point) {
		if (!this.isVisible) return null
		if (this.lollipop.contains(point)) return this.lollipop
		let stage = this.root as IStage
		return Line.contains(this.x, this.y, stage.bounds.width, this.y, this.strokeWidth + this.hitRange, point.x, point.y) ? this : null
	}
	set setStrokeWidth(val: number) {
		this.strokeWidth = val
	}
	set setStrokeColor(hex: string) {
		this.strokeColor = Color.fromHex(hex)
	}
	set setLineStyle(style: string) {
		if (style === 'line') {
			this.dashArray = []
		} if (style === 'dash') {
			this.dashArray = [10, 15]
		} if (style === 'dot') {
			this.dashArray = [5, 8]
		}
	}
	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return
		ctx.save()

		ctx.lineWidth = this.strokeWidth
		ctx.strokeStyle = this.strokeColor.toString()
		ctx.setLineDash(this.dashArray)
		let mx = this.matrix
		ctx.transform(mx.a, mx.b, mx.c, mx.d, mx.tx, mx.ty)
		ctx.beginPath()

		let stage = this.root as IStage
		let width = undefined
		if (!stage) {
			width = this.initWidth
		} else {
			width = stage.bounds.width
		}
		ctx.moveTo(this.x, this.y)
		ctx.lineTo(width, this.y)

		ctx.closePath()
		ctx.stroke()
		ctx.restore()
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			this.lollipop.render(ctx)
		}
	}
}