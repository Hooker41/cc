import {TrendLine} from "./trendLine";
import {IArrow, ITwoPointDrawing} from "./def";
import {Vector} from "../core/vector";
import {Angle} from "../core/angle";
import { Color } from "../core";

export class Arrow extends TrendLine implements IArrow {
	static type = 'Arrow'
	strokeWidth: number
	strokeColor: Color
	constructor(l: ITwoPointDrawing, scaleCanvas: HTMLCanvasElement) {
		super(l, scaleCanvas)
		this.type = Arrow.type
	}
	set setStrokeWidth(val: number) {
		this.line.strokeWidth = val
		this.strokeWidth = val
	}
	set setStrokeColor(hex: string) {
		this.line.strokeColor = Color.fromHex(hex)
		this.strokeColor = Color.fromHex(hex)
	}
	set setLineStyle(style: string) {
		if (style === 'line') {
			this.line.dashArray = []
		} if (style === 'dash') {
			this.line.dashArray = [10, 15]
		} if (style === 'dot') {
			this.line.dashArray = [5, 8]
		}
	}
	render(ctx: CanvasRenderingContext2D) {
		if (!this.isVisible) return
		if (this.opacity === 0) return
		this.line.render(ctx)

		let vec = Vector.subtract({x: this.x2, y: this.y2}, {x: this.x1, y: this.y1})
		if (Vector.euclideanMetric(vec) > 10) {
			let angle = Math.PI - Vector.radian(vec)

			let delta = Angle.toRadian(30)
			let angle1 = angle + delta
			let angle2 = angle - delta

			ctx.save()
			ctx.lineWidth = this.strokeWidth
			ctx.strokeStyle = this.strokeColor.toString()
			ctx.beginPath()
			ctx.moveTo(this.x2, this.y2)
			ctx.lineTo(this.x2 + Math.cos(angle1) * 10 * this.strokeWidth, this.y2 - Math.sin(angle1) * 10 * this.strokeWidth)
			ctx.moveTo(this.x2, this.y2)
			ctx.lineTo(this.x2 + Math.cos(angle2) * 10 * this.strokeWidth, this.y2 - Math.sin(angle2) * 10 * this.strokeWidth)
			ctx.closePath()
			ctx.stroke()
			ctx.restore()
		}

		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 2; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}