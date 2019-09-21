import {ThreePointDrawing} from "./drawing";
import {IThreePointDrawing} from "./def";
import {ILine, ITriangle} from "../path/def";
import {Line} from "../path/line";
import { Color } from "../core";
import { Triangle as TrianglePath } from "../path/triangle";
import { RGBA } from "../core/color";
export class Triangle extends ThreePointDrawing {
	static type = 'Triangle'

	line0: ILine
	line1: ILine
	line2: ILine
	pathTriangle: ITriangle
	constructor(l: IThreePointDrawing, scaleCanvas: HTMLCanvasElement) {
		super(l, scaleCanvas)

		this.type = Triangle.type

		this.pathTriangle = new TrianglePath({x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2, x3: l.x3, y3: l.y3})
		this.pathTriangle.fillColor = new Color(new RGBA(255, 0, 0, 0.5))
		this.line0 = new Line(l)
		this.line1 = new Line(l)
		this.line2 = new Line(l)
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
		this.pathTriangle.x1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cx = val
		this._recalculateLines()
	}

	set y1(val) {
		this._y1 = val
		this.pathTriangle.y1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cy = val
		this._recalculateLines()
	}

	set x2(val) {
		this._x2 = val
		this.pathTriangle.x2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cx = val
		this._recalculateLines()
	}

	set y2(val) {
		this._y2 = val
		this.pathTriangle.y2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cy = val
		this._recalculateLines()
	}

	set x3(val) {
		this._x3 = val
		this.pathTriangle.x3 = val
		if (this.lollipops && this.lollipops[2]) this.lollipops[2].cx = val
		this._recalculateLines()
	}

	set y3(val) {
		this._y3 = val
		this.pathTriangle.y3 = val
		if (this.lollipops && this.lollipops[2]) this.lollipops[2].cy = val
		this._recalculateLines()
	}

	_recalculateLines() {
		const {_x1, _y1, _x2, _y2, _x3, _y3} = this

		this.line0.x1 = _x1
		this.line0.y1 = _y1
		this.line0.x2 = _x2
		this.line0.y2 = _y2

		this.line1.x1 = _x2
		this.line1.y1 = _y2
		this.line1.x2 = _x3
		this.line1.y2 = _y3

		this.line2.x1 = _x1
		this.line2.y1 = _y1
		this.line2.x2 = _x3
		this.line2.y2 = _y3
	}

	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 3; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}
		if (this.line0.contains(point)) return this
		if (this.line1.contains(point)) return this
		if (this.line2.contains(point)) return this
		return null
	}
	set setStrokeWidth(val: number) {
		this.line0.strokeWidth = val
		this.line1.strokeWidth = val
		this.line2.strokeWidth = val
	}
	set setStrokeColor(hex: string) {
		this.line0.strokeColor = Color.fromHex(hex)
		this.line1.strokeColor = Color.fromHex(hex)
		this.line2.strokeColor = Color.fromHex(hex)
	}
	set setLineStyle(style: string) {
		let dashArray = undefined
		if (style === 'line') {
			dashArray = []
		} if (style === 'dash') {
			dashArray = [10, 15]
		} if (style === 'dot') {
			dashArray = [5, 8]
		}
		this.line0.dashArray = dashArray
		this.line1.dashArray = dashArray
		this.line2.dashArray = dashArray
	}
	set setFillColor(rgba){
		const fillColor = new RGBA(rgba.r, rgba.g, rgba.b, rgba.a)
		this.pathTriangle.fillColor = new Color(fillColor)
	}
	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return

		this.line1.render(ctx)
		this.line2.render(ctx)
		this.line0.render(ctx)
		this.pathTriangle.render(ctx)
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 3; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}