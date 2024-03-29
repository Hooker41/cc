import {ThreePointDrawing} from "./drawing";
import {IThreePointDrawing} from "./def";
import {IArc, ILine} from "../path/def";
import {Vector} from "../core/vector";
import {Arc} from "../path/arc";
import { Color } from "../core";

export class FibonacciWedge extends ThreePointDrawing {
	static type = 'FibonacciWedge'

	static ratios = [0.236, 0.382, 0.5, 0.618, 0.786, 1]

	arcs: IArc[]

	constructor(l: IThreePointDrawing, scaleCanvas: HTMLCanvasElement) {
		super(l, scaleCanvas)

		this.arcs = []

		let conf = {
			cx: l.x1,
			cy: l.y1,
			radius: 0,
			startAngle: 0,
			endAngle: 180,
			anticlockwise: false
		}
		for (let i = 0, len = FibonacciWedge.ratios.length; i < len; i++) {
			this.arcs.push(new Arc(conf))
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
		for (let i = 0, len = FibonacciWedge.ratios.length; i < len; i++) {
			this.arcs[i].strokeWidth = val;
		}
	}
	set setStrokeColor(hex: string) {
		this.strokeColor = Color.fromHex(hex)
		for (let i = 0, len = FibonacciWedge.ratios.length; i < len; i++) {
			this.arcs[i].strokeColor = Color.fromHex(hex)
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
		for (let i = 0, len = FibonacciWedge.ratios.length; i < len; i++) {
			this.arcs[i].dashArray = dashArray
		}
	}
	_recalculateLines() {
		const {_x1, _y1, _x2, _y2, _x3, _y3} = this

		let dx = _x2 - _x1
		let dy = _y2 - _y1
		let startAngle = Vector.angle(Vector.subtract({x: _x2, y: _y2}, {x: _x1, y: _y1}))
		let endAngle = Vector.angle(Vector.subtract({x: _x3, y: _y3}, {x: _x1, y: _y1}))
		let d = Vector.euclideanMetric({x: dx, y: dy})
		for (let i = 0, len = FibonacciWedge.ratios.length; i < len; i++) {
			let ratio = FibonacciWedge.ratios[i]

			let r = d * ratio

			let a = this.arcs[i]
			a.cx = _x1
			a.cy = _y1
			a.radius = r

			if (dy > 0) {
				a.startAngle = startAngle
				a.endAngle = endAngle
				a.anticlockwise = true
			} else {
				a.startAngle = startAngle
				a.endAngle = endAngle
				a.anticlockwise = true
			}
		}
	}

	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 3; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}

		for (let i = 0, len = this.arcs.length; i < len; i++) {
			if (this.arcs[i].contains(point)) return this
		}
		return null
	}

	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return

		for (let i = 0, len = this.arcs.length; i < len; i++) {
			this.arcs[i].render(ctx)
		}

		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 3; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}