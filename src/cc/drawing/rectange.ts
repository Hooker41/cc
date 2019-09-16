import {ILine} from "../path/def";
import {Line} from "../path/line";
import {TwoPointDrawing} from "./drawing";
import {ITrendLine, ITwoPointDrawing} from "./def";
import { Color } from "../core";

export class Rect extends TwoPointDrawing implements ITrendLine {
	static type = "Rectangle"
	static ratios = [0, 1]

	horizontalLines: ILine[]
	verticalLines: ILine[]

	constructor(l: ITwoPointDrawing, scaleCanvas: HTMLCanvasElement) {
		super(l, scaleCanvas)
		this.type = Rect.type

		this.horizontalLines = []
		this.verticalLines = []

		for (let i = 0, len = Rect.ratios.length; i < len; i++) {
			this.horizontalLines.push(new Line(l))
			this.verticalLines.push(new Line(l))
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
	set setStrokeWidth(val: number) {
		this.strokeWidth = val
		for (let i = 0, len = Rect.ratios.length; i < len; i++) {
			this.horizontalLines[i].strokeWidth = val;
			this.verticalLines[i].strokeWidth = val;
		}
	}
	set setStrokeColor(hex: string) {
		this.strokeColor = Color.fromHex(hex)
		for (let i = 0, len = Rect.ratios.length; i < len; i++) {
			this.horizontalLines[i].strokeColor = Color.fromHex(hex)
			this.verticalLines[i].strokeColor = Color.fromHex(hex)
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
		for (let i = 0, len = Rect.ratios.length; i < len; i++) {
			this.horizontalLines[i].dashArray = dashArray
			this.verticalLines[i].dashArray = dashArray
		}
	}
	_recalculateLines() {
		const {_x1, _y1, _x2, _y2} = this

		for (let i = 0, len = Rect.ratios.length; i < len; i++) {
			let dx = _x2 - _x1
			let dy = _y2 - _y1
			let ratio = Rect.ratios[i]
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
		}
	}

	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 2; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}

		for (let i = 0, len = Rect.ratios.length; i < len; i++) {
			if (this.horizontalLines[i].contains(point)) return this
			if (this.verticalLines[i].contains(point)) return this
		}
		return null
	}

	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return
		for (let i = 0, len = this.horizontalLines.length; i < len; i++) {
			this.horizontalLines[i].render(ctx)
		}
		for (let i = 0, len = this.verticalLines.length; i < len; i++) {
			this.verticalLines[i].render(ctx)
		}
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 2; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}