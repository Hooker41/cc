import {ILine} from "../path/def";
import {Line} from "../path/line";
import {ThreePointDrawing} from "./drawing";
import {IThreePointDrawing} from "./def";
import {IStage} from "../dom/def";
import {Line as BaseLine} from "../core/line";
import { Color } from "../core";

export class FibonacciSpeedResistanceFan extends ThreePointDrawing {
	static type = 'FibonacciSpeedResistanceFan'
	static ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

	horizontalLines: ILine[]
	verticalLines: ILine[]
	leftFanLines: ILine[]
	rightFanlines: ILine[]
	initHeight: number
	initWidth: number
	constructor(l: IThreePointDrawing, scaleCanvas: HTMLCanvasElement, initWidth: number, initHeight: number) {
		super(l, scaleCanvas)
		this.type = FibonacciSpeedResistanceFan.type

		this.horizontalLines = []
		this.verticalLines = []
		this.leftFanLines = []
		this.rightFanlines = []
		this.initHeight = initHeight
		this.initWidth = initWidth
		for (let i = 0, len = FibonacciSpeedResistanceFan.ratios.length; i < len; i++) {
			this.horizontalLines.push(new Line(l))
			this.verticalLines.push(new Line(l))
			this.leftFanLines.push(new Line(l))
			this.rightFanlines.push(new Line(l))
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
		for (let i = 0, len = FibonacciSpeedResistanceFan.ratios.length; i < len; i++) {
			this.horizontalLines[i].strokeWidth = val;
			this.verticalLines[i].strokeWidth = val;
			this.leftFanLines[i].strokeWidth = val;
			this.rightFanlines[i].strokeWidth = val;
		}
	}
	set setStrokeColor(hex: string) {
		this.strokeColor = Color.fromHex(hex)
		for (let i = 0, len = FibonacciSpeedResistanceFan.ratios.length; i < len; i++) {
			this.horizontalLines[i].strokeColor = Color.fromHex(hex)
			this.verticalLines[i].strokeColor = Color.fromHex(hex)
			this.leftFanLines[i].strokeColor = Color.fromHex(hex)
			this.rightFanlines[i].strokeColor = Color.fromHex(hex)
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
		for (let i = 0, len = FibonacciSpeedResistanceFan.ratios.length; i < len; i++) {
			this.horizontalLines[i].dashArray = dashArray
			this.verticalLines[i].dashArray = dashArray
			this.leftFanLines[i].dashArray = dashArray
			this.rightFanlines[i].dashArray = dashArray
		}
	}
	_recalculateLines() {
		const {_x1, _y1, _x2, _y2} = this

		let stage = this.root as IStage
		let width = undefined
		let height = undefined
		if (!stage) {
			width = this.initWidth
			height = this.initHeight
		} else {
			width = stage.bounds.width
			height = stage.bounds.height
		}

		let dx = _x2 - _x1
		let dy = _y2 - _y1
		for (let i = 0, len = FibonacciSpeedResistanceFan.ratios.length; i < len; i++) {
			let ratio = FibonacciSpeedResistanceFan.ratios[i]
			let x = _x1 + dx * ratio
			let y = _y1 + dy * ratio

			let h = this.horizontalLines[i]
			h.x1 = _x1
			h.y1 = y
			h.x2 = _x2
			h.y2 = y

			let v = this.verticalLines[i]
			v.x1 = x
			v.y1 = _y1
			v.x2 = x
			v.y2 = _y2

			let remotePoint1 = BaseLine.remotePointOfRay(_x1, _y1, x, _y2, width, height)
			let remotePoint2 = BaseLine.remotePointOfRay(_x1, _y1, _x2, y, width, height)

			let l = this.leftFanLines[i]
			l.x1 = _x1
			l.y1 = _y1
			l.x2 = remotePoint1.x
			l.y2 = remotePoint1.y

			let r = this.rightFanlines[i]
			r.x1 = _x1
			r.y1 = _y1
			r.x2 = remotePoint2.x
			r.y2 = remotePoint2.y
		}
	}

	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 2; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}

		for (let i = 0, len = FibonacciSpeedResistanceFan.ratios.length; i < len; i++) {
			if (this.horizontalLines[i].contains(point)) return this
			if (this.verticalLines[i].contains(point)) return this
			if (this.leftFanLines[i].contains(point)) return this
			if (this.rightFanlines[i].contains(point)) return this
		}
		return null
	}

	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return
		for (let i = 0, len = FibonacciSpeedResistanceFan.ratios.length; i < len; i++) {
			this.horizontalLines[i].render(ctx)
			this.verticalLines[i].render(ctx)
			this.leftFanLines[i].render(ctx)
			this.rightFanlines[i].render(ctx)
		}
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 2; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}