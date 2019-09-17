import {IArc, ILine} from "../path/def";
import {Line} from "../path/line";
import {TwoPointDrawing} from "./drawing";
import {ITrendAngle, ITwoPointDrawing} from "./def";
import {Arc} from "../path/arc";
import {Vector} from "../core/vector";
import {TextAlign, TextBaseLine} from "../typography/def";
import {Text} from '../typography/text'
import {IStage} from "../dom/def";
import { Color } from "../core";
import {Line as BaseLine} from '../core/line';
export class TrendAngle extends TwoPointDrawing implements ITrendAngle {
	line: ILine
	horizontalLine: ILine
	arc: IArc
	label: Text
	static ArcSize = 50

	constructor(l: ITwoPointDrawing, scaleCanvas: HTMLCanvasElement, stageWidth: number, stageHeight: number) {
		super(l, scaleCanvas)
		this.type = 'TrendAngle'

		this.line = new Line(l)
		this.line.stageHeight = stageHeight
		this.line.stageWidth = stageWidth
		this.horizontalLine = new Line({x1: l.x1, y1: l.y1, x2: l.x1 + TrendAngle.ArcSize, y2: l.y1})

		let angle = Vector.angle(Vector.subtract({x: l.x2, y: l.y2}, {x: l.x1, y: l.y1}))
		angle = parseFloat(angle.toFixed(2))
		this.arc = new Arc({
			cx: l.x1,
			cy: l.y1,
			radius: TrendAngle.ArcSize,
			startAngle: 0,
			endAngle: angle,
			anticlockwise: angle < 0
		})
		this.label = new Text({
			x: this.horizontalLine.x2,
			y: this.horizontalLine.y2,
			value: `${-angle}°`,
			font: 'bold 13px Arial',
			textAlign: TextAlign.Left,
			textBaseline: TextBaseLine.Middle
		})

	}

	_handleMouseLeave(e) {
		if (e.target === this || !this.line.contains({x: e.x, y: e.y})) {
			this.isHovered = false
		}
		return true
	}
	_handleDrag(e) {
		e.preventDefault()
		e.stopPropagation()
		const rect = this.scaleCanvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.scaleCanvas.width;
		const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.scaleCanvas.height;
		let dx = x - this.dragStartX
		let dy = y - this.dragStartY
		this.dragStartX = x
		this.dragStartY = y
		this._tmpX1 = this._tmpX1 + dx;
		let stage = this.root as IStage
		const contentWidth = stage.contentWidth
		const stickLength = stage.stickLength
		const moveY = stage.moveY
		const left = (contentWidth - moveY * 2) % stickLength;
		this.x1 = Math.trunc((this._tmpX1 - left) / stickLength) * stickLength + stickLength / 2 + left
		this.y1 = this.y1 + dy
		stage.update({x: e.clientX , y: e.clientY})
	}
	get x1() {
		return this.line.x1
	}

	set x1(val) {
		let delta = val - this.line.x1
		this.x2 += +delta
		this.line.x1 = val
		this.horizontalLine.x1 = val
		this.horizontalLine.x2 = val + TrendAngle.ArcSize
		this.arc.cx = val

		let angle = Vector.angle(Vector.subtract({x: this.x2, y: this.y2}, {x: val, y: this.y1}))
		angle = parseFloat(angle.toFixed(2))
		this.arc.endAngle = angle
		this.arc.anticlockwise = angle < 0
		this.label.value = `${-angle}°`
		this.label.x = val + TrendAngle.ArcSize

		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cx = val
	}

	get y1() {
		return this.line.y1
	}

	set y1(val) {
		let delta = val - this.line.y1
		this.y2 += delta
		this.line.y1 = val
		this.horizontalLine.y1 = val
		this.horizontalLine.y2 = val
		this.arc.cy = val

		let angle = Vector.angle(Vector.subtract({x: this.x2, y: this.y2}, {x: this.x1, y: val}))
		angle = parseFloat(angle.toFixed(2))
		this.arc.endAngle = angle
		this.arc.anticlockwise = angle < 0
		this.label.value = `${-angle}°`
		this.label.y = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cy = val
	}

	get x2() {
		return this.line.x2
	}

	set x2(val) {
		this.line.x2 = val

		let angle = Vector.angle(Vector.subtract({x: val, y: this.y2}, {x: this.x1, y: this.y1}))
		angle = parseFloat(angle.toFixed(2))
		this.arc.endAngle = angle
		this.arc.anticlockwise = angle < 0
		this.label.value = `${-angle}°`
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cx = val
	}

	get y2() {
		return this.line.y2
	}

	set y2(val) {
		this.line.y2 = val

		let angle = Vector.angle(Vector.subtract({x: this.x2, y: val}, {x: this.x1, y: this.y1}))
		angle = parseFloat(angle.toFixed(2))
		this.arc.endAngle = angle
		this.arc.anticlockwise = angle < 0
		this.label.value = `${-angle}°`
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cy = val
	}
	set setStrokeWidth(val: number) {
		this.line.strokeWidth = val
	}
	set setStrokeColor(hex: string) {
		this.line.strokeColor = Color.fromHex(hex)
		this.horizontalLine.strokeColor = Color.fromHex(hex)
		this.arc.strokeColor = Color.fromHex(hex)
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
		// TODO: text hit test
		// if (this.label.contains(point)) return this
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
		ctx.setLineDash([1, 2])
		this.horizontalLine.render(ctx)
		ctx.setLineDash([1, 1])
		this.arc.render(ctx)
		ctx.setLineDash([])
		this.label.render(ctx)
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 2; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}
