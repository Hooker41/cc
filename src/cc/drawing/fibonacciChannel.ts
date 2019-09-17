import {ILine} from "../path/def";
import {Line} from "../path/line";
import {ThreePointDrawing} from "./drawing";
import {IThreePointDrawing} from "./def";
import { Color } from "../core";
import {Line as BaseLine} from "../core/line";

export class FibonacciChannel extends ThreePointDrawing {
	static type = 'FibonacciChannel'
	static ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

	lines: ILine[]

	constructor(l: IThreePointDrawing, scaleCanvas: HTMLCanvasElement, stageWidth: number, stageHeight: number) {
		super(l, scaleCanvas)
		this.type = FibonacciChannel.type

		this.lines = []

		for (let i = 0, len = FibonacciChannel.ratios.length; i < len; i++) {
			const newLine = new Line(l);
			newLine.stageWidth = stageWidth
			newLine.stageHeight = stageHeight
			this.lines.push(newLine)
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
		for (let i = 0, len = FibonacciChannel.ratios.length; i < len; i++) {
			this.lines[i].strokeWidth = val;
		}
	}
	set setStrokeColor(hex: string) {
		this.strokeColor = Color.fromHex(hex)
		for (let i = 0, len = FibonacciChannel.ratios.length; i < len; i++) {
			this.lines[i].strokeColor = Color.fromHex(hex)
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
		for (let i = 0, len = FibonacciChannel.ratios.length; i < len; i++) {
			this.lines[i].dashArray = dashArray
		}
	}
	_recalculateLines() {
		const {_x1, _y1, _x2, _y2, _x3, _y3} = this

		let v = {x: _x3 - _x1, y: _y3 - _y1}
		for (let i = 0, len = FibonacciChannel.ratios.length; i < len; i++) {
			let ratio = FibonacciChannel.ratios[i]
			let x = v.x * ratio
			let y = v.y * ratio

			let l = this.lines[i]
			l.x1 = _x1 + x
			l.y1 = _y1 + y
			l.x2 = _x2 + x
			l.y2 = _y2 + y
		}
	}
	set setExtend(extend: boolean[]) {
		for (let i = 0, len = FibonacciChannel.ratios.length; i < len; i++) {
			this.lines[i].extendLeft = extend[0]
			this.lines[i].extendRight = extend[1]
		}
	}
	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 3; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}

		for (let i = 0, len = this.lines.length; i < len; i++) {
			const line = this.lines[i]
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
		for (let i = 0, len = this.lines.length; i < len; i++) {
			this.lines[i].render(ctx)
		}
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 3; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}