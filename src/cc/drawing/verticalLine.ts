import {OnePointDrawing} from "./drawing";
import {IOnePointDrawing, IVerticalLine} from "./def";
import {IStage} from "../dom/def";
import { Color } from "../core";

export class VerticalLine extends OnePointDrawing implements IVerticalLine {
	static type = 'VerticalLine'
	initHeight: number
	initWidth: number
	constructor(l: IOnePointDrawing, scaleCanvas: HTMLCanvasElement, initWidth: number, initHeight: number) {
		super(l, scaleCanvas)

		this.type = VerticalLine.type
		this.initHeight = initHeight
		this.initWidth = initWidth
	}

	hitTest(point) {
		if (!this.isVisible) return null
		if (this.lollipop.contains(point)) return this.lollipop
		if (Math.abs(point.x - this.x) <= this.strokeWidth + this.hitRange) return this
		return null
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
		let height = undefined
		if (!stage) {
			height = this.initHeight
		} else {
			height = stage.bounds.height
		}
		ctx.moveTo(this.x, 0)
		ctx.lineTo(this.x, height)

		ctx.closePath()
		ctx.stroke()
		ctx.restore()
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			this.lollipop.render(ctx)
		}
	}
}