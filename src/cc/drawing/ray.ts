import {IRay, ITwoPointDrawing} from "./def";
import {TwoPointDrawing} from "./drawing";
import {IStage} from "../dom/def";
import {Line} from "../core/line";
import {IBaseVector} from "../core/def";
import { Color } from "../core";

export class Ray extends TwoPointDrawing implements IRay {
	static type = 'Ray'

	constructor(l: ITwoPointDrawing, scaleCanvas: HTMLCanvasElement) {
		super(l, scaleCanvas)

		this.type = Ray.type
	}

	_handleMouseLeave(e) {
		if (e.target === this || !this.hitTest({x: e.x, y: e.y})) {
			this.isHovered = false
		}
		return true
	}

	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 2; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}
		let stage = this.root as IStage

		let remotePoint = Line.remotePointOfRay(this.x1, this.y1, this.x2, this.y2, stage.bounds.width, stage.bounds.height)
		if (Line.contains(this.x1, this.y1, remotePoint.x, remotePoint.y, this.hitRange, point.x, point.y)) return this
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
		ctx.beginPath()
		ctx.moveTo(this.x1, this.y1)
		let stage = this.root as IStage
		let remotePoint = Line.remotePointOfRay(this.x1, this.y1, this.x2, this.y2, stage.bounds.width, stage.bounds.height)

		ctx.lineTo(remotePoint.x, remotePoint.y)
		ctx.closePath()
		ctx.stroke()
		ctx.restore()

		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 2; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}
