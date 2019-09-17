import {ILine} from "../path/def";
import {Line} from "../path/line";
import {Line as BaseLine} from '../core/line';
import {TwoPointDrawing} from "./drawing";
import {ITrendLine, ITwoPointDrawing} from "./def";
import { Color } from "../core";
import { IStage } from "../dom/def";

export class TrendLine extends TwoPointDrawing implements ITrendLine {
	line: ILine
	constructor(l: ITwoPointDrawing, scaleCanvas: HTMLCanvasElement, stageWidth: number, stageHeight: number) {
		super(l, scaleCanvas)
		this.type = 'TrendLine'
		this.line = new Line(l)
		this.line.stageHeight = stageHeight
		this.line.stageWidth = stageWidth
	}

	_handleMouseLeave(e) {
		if (e.target === this || !this.line.hitTest({x: e.x, y: e.y})) {
			this.isHovered = false
		}
		return true
	}

	get x1() {
		return this.line.x1
	}

	set x1(val) {
		this.line.x1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cx = val
	}

	get y1() {
		return this.line.y1
	}

	set y1(val) {
		this.line.y1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cy = val
	}

	get x2() {
		return this.line.x2
	}

	set x2(val) {
		this.line.x2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cx = val
	}

	get y2() {
		return this.line.y2
	}

	set y2(val) {
		this.line.y2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cy = val
	}

	set setStrokeWidth(val: number) {
		this.line.strokeWidth = val
	}
	set setStrokeColor(hex: string) {
		this.line.strokeColor = Color.fromHex(hex)
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
	set setExtend(extend: boolean[]) {
		this.line.extendLeft = extend[0]
		this.line.extendRight = extend[1]
	}
	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 2; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}
		// if (this.line.contains(point)) return this

		let stage = this.root as IStage

		let remotePoint1 = {x: this.x1, y: this.y1}
		let remotePoint2 = {x: this.x2, y: this.y2}
		if (this.line.extendLeft) {
			remotePoint1 = BaseLine.remotePointOfRay(this.x2, this.y2, this.x1, this.y1, stage.bounds.width, stage.bounds.height)
		}
		if (this.line.extendRight) {
			remotePoint2 = BaseLine.remotePointOfRay(this.x1, this.y1, this.x2, this.y2, stage.bounds.width, stage.bounds.height)
		}
		if (BaseLine.contains(remotePoint1.x, remotePoint1.y, remotePoint2.x, remotePoint2.y, this.hitRange, point.x, point.y)) return this
		return null
	}

	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return
		this.line.render(ctx)
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 2; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}
