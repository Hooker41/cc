import {ThreePointDrawing} from "./drawing";
import {IThreePointDrawing} from "./def";
import {ILine} from "../path/def";
import {Line} from "../path/line";
import { Color } from "../core";
import {Line as BaseLine} from "../core/line";

export class TrendBasedFibonacciExtension extends ThreePointDrawing {
	static type = 'TrendBasedFibonacciExtension'
	static ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

	trendLine: ILine
	fibLines: ILine[]

	constructor(l: IThreePointDrawing, scaleCanvas: HTMLCanvasElement, stageWidth: number, stageHeight: number) {
		super(l, scaleCanvas)

		this.type = TrendBasedFibonacciExtension.type

		this.trendLine = new Line(l)
		this.fibLines = []
		const {x2, y2} = l
		for (let i = 0, len = TrendBasedFibonacciExtension.ratios.length; i < len; i++) {
			const newLine = new Line({x1: x2, y1: y2, x2, y2})
			newLine.stageWidth = stageWidth
			newLine.stageHeight = stageHeight
			this.fibLines.push(newLine)
		}
		this._recalculateLines()
	}
	get x1() {
		return this._x1
	}

	get y1() {
		return this._y1
	}

	get x2() {
		return this._x2
	}

	get y2() {
		return this._y2
	}

	get x3() {
		return this._x3
	}

	get y3() {
		return this._y3
	}
	set x1(val) {
		this._x1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cx = val
		this._recalculateLines()
	}

	set y1(val) {
		this._y1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cy = val
		this._recalculateLines()
	}

	set x2(val) {
		this._x2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cx = val
		this._recalculateLines()
	}

	set y2(val) {
		this._y2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cy = val
		this._recalculateLines()
	}

	set x3(val) {
		this._x3 = val
		if (this.lollipops && this.lollipops[2]) this.lollipops[2].cx = val
		this._recalculateLines()
	}

	set y3(val) {
		this._y3 = val
		if (this.lollipops && this.lollipops[2]) this.lollipops[2].cy = val
		this._recalculateLines()
	}
	set setStrokeWidth(val: number) {
		this.strokeWidth = val
		this.trendLine.strokeWidth = val;
		for (let i = 0, len = TrendBasedFibonacciExtension.ratios.length; i < len; i++) {
			this.fibLines[i].strokeWidth = val;
		}
	}
	set setStrokeColor(hex: string) {
		this.strokeColor = Color.fromHex(hex)
		this.trendLine.strokeColor = Color.fromHex(hex)
		for (let i = 0, len = TrendBasedFibonacciExtension.ratios.length; i < len; i++) {
			this.fibLines[i].strokeColor = Color.fromHex(hex)
		}
	}
	set setLineStyle(style: string) {
		let dashArray = undefined;
		if (style === 'line') {
			dashArray = []
		} if (style === 'dash') {
			dashArray = [10, 15]
		} if (style === 'dot') {
			dashArray = [5, 8]
		}
		this.trendLine.dashArray = dashArray
		for (let i = 0, len = TrendBasedFibonacciExtension.ratios.length; i < len; i++) {
			this.fibLines[i].dashArray = dashArray
		}
	}
	_recalculateLines() {
		const {_x1, _y1, _x2, _y2, _x3, _y3} = this

		this.trendLine.x1 = _x1
		this.trendLine.y1 = _y1
		this.trendLine.x2 = _x2
		this.trendLine.y2 = _y2

		const dy = _y2 - _y1
		for (let i = 0, len = TrendBasedFibonacciExtension.ratios.length; i < len; i++) {
			let ratio = TrendBasedFibonacciExtension.ratios[i]

			let y = _y3 + dy * ratio

			let h = this.fibLines[i]
			h.x1 = _x2
			h.y1 = y
			h.x2 = _x3
			h.y2 = y
		}
	}
	set setExtend(extend: boolean[]) {
		for (let i = 0, len = TrendBasedFibonacciExtension.ratios.length; i < len; i++) {
			this.fibLines[i].extendLeft = extend[0]
			this.fibLines[i].extendRight = extend[1]
		}
	}
	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 3; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}
		if (this.trendLine.contains(point)) return this
		for (let i = 0, len = this.fibLines.length; i < len; i++) {
			const line = this.fibLines[i]
			let remotePoint1 = {x: line.x1, y: line.y1}
			let remotePoint2 = {x: line.x2, y: line.y2}
			if (line.extendLeft) {
				remotePoint1 = BaseLine.remotePointOfRay(line.x2, line.y2, line.x1, line.y1, line.stageWidth, line.stageHeight)
			}
			if (line.extendRight) {
				remotePoint2 = BaseLine.remotePointOfRay(line.x1, line.y1, line.x2, line.y2, line.stageWidth, line.stageHeight)
			}

			if (BaseLine.contains(remotePoint1.x, remotePoint1.y, remotePoint2.x, remotePoint2.y, line.strokeWidth + line.hitRange, point.x, point.y)) return this
		}
		return null
	}

	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return

		this.trendLine.render(ctx)

		for (let i = 0, len = this.fibLines.length; i < len; i++) {
			this.fibLines[i].render(ctx)
		}

		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 3; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}