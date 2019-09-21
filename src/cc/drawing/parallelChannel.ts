import {ThreePointDrawing} from "./drawing";
import {IThreePointDrawing} from "./def";
import {ILine, IPolyline} from "../path/def";
import {Line} from "../path/line";
import {Line as BaseLine} from "../core/line";
import {IDisposable} from "../../base/common/lifecycle";
import {addDisposableListener, EventType} from "../../base/browser/event";
import {IStage} from "../dom/def";
import { Color } from "../core";
import { RGBA } from "../core/color";
import { Polyline } from "../path";

export class ParallelChannel extends ThreePointDrawing {
	static type = 'ParallelChannel'

	line: ILine
	__x3: number
	polyPath: IPolyline
	thirdDispose: IDisposable
	constructor(l: IThreePointDrawing, scaleCanvas: HTMLCanvasElement, stageWidth: number, stageHeight: number) {
		super(l, scaleCanvas)

		this.type = ParallelChannel.type
		this.line = new Line(l)
		this.stageHeight = stageHeight
		this.stageWidth = stageWidth
		this.polyPath = new Polyline({x: l.x1, y: l.y1}, {x: l.x2, y: l.y2}, {x: l.x2, y: l.y2 + this.offset}, {x: l.x1, y: l.y1 + this.offset});
		this.polyPath.fillColor = new Color(new RGBA(178, 168, 211, 0.5))
	}

	_handleStartDragControlPoint(e) {
		super._handleStartDragControlPoint(e)
		if (this.draggingPoint === this.thirdLollipop) {
			this.thirdDispose = addDisposableListener(window, EventType.MOUSE_UP, this._handleEndDragControlPoint.bind(this), true)
		}
		return true
	}

	_handleDragControlPoint(e) {
		e.preventDefault()
		e.stopPropagation()
		const rect = this.scaleCanvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.scaleCanvas.width;
		const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.scaleCanvas.height;
		if (this.draggingPoint === this.firstLollipop) {
			this.x1 = x
			this.y1 = y
		} else if (this.draggingPoint === this.secondLollipop) {
			this.x2 = x
			this.y2 = y
		} else {
			this.x3 = x
			this.y3 = y
		}

		this._refineThirdLollipop()

		let stage = this.root as IStage
		stage.update({x: e.clientX , y: e.clientY})
	}

	_handleEndDragControlPoint(e) {
		super._handleEndDragControlPoint(e)
		if (this.thirdDispose) {
			this.thirdDispose.dispose()
			this.thirdDispose = null
		}
		return true
	}

	get offset() {
		const {_x1, _y1, _x2, _y2, __x3, _y3} = this
		if (_x1 - _x2 === 0) return _y3 - (_y2 - _y1) / 2
		if (_x2 === __x3 && _y2 === _y3) return 0
		if (_y2 === _y1) return _y3 - _y2
		return _y3 - (__x3 - _x1) * (_y2 - _y1) / (_x2 - _x1) - _y1
	}

	_refineThirdLollipop() {
		let max = Math.max(this._x1, this._x2)
		let min = Math.min(this._x1, this._x2)
		if (this.__x3 > max) {
			this.x3 = max
		} else if (this.__x3 < min) {
			this.x3 = min
		}
	}
	get x3() {
		return this._x3
	}
	set x3(val) {
		let max = Math.max(this._x1, this._x2)
		let min = Math.min(this._x1, this._x2)
		if (val > max) val = max
		if (val < min) val = min
		this._x3 = val
	}

	get _x3() {
		return this.__x3
	}

	set _x3(val) {
		this.__x3 = val
		if (this.lollipops && this.lollipops[2]) this.lollipops[2].cx = val
	}
	set setExtend(extend: boolean[]) {
		this.extendLeft = extend[0]
		this.extendRight = extend[1]
	}
	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 3; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}
		let remotePoint1 = {x: this.x1, y: this.y1}
		let remotePoint2 = {x: this.x2, y: this.y2}
		if (this.extendLeft) {
			remotePoint1 = BaseLine.remotePointOfRay(this.x2, this.y2, this.x1, this.y1, this.stageWidth, this.stageHeight)
		}
		if (this.extendRight) {
			remotePoint2 = BaseLine.remotePointOfRay(this.x1, this.y1, this.x2, this.y2, this.stageWidth, this.stageHeight)
		}

		if (BaseLine.contains(remotePoint1.x, remotePoint1.y, remotePoint2.x, remotePoint2.y, this.strokeWidth + this.hitRange, point.x, point.y)) return this
		let {offset} = this
		if (BaseLine.contains(remotePoint1.x, remotePoint1.y + offset, remotePoint2.x, remotePoint2.y + offset, this.strokeWidth + this.hitRange, point.x, point.y)) return this
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
	set setFillColor(rgba){
		const fillColor = new RGBA(rgba.r, rgba.g, rgba.b, rgba.a)
		this.polyPath.fillColor = new Color(fillColor)
	}
	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return
		ctx.save()
		ctx.lineWidth = this.strokeWidth
		ctx.strokeStyle = this.strokeColor.toString()
		ctx.setLineDash(this.dashArray)
		let mx = this.matrix
		ctx.transform(mx.a, mx.b, mx.c, mx.d, mx.tx, mx.ty)
		ctx.beginPath()

		this.remotePoint1 = {x: this.x1, y: this.y1}
		this.remotePoint2 = {x: this.x2, y: this.y2}
		if (this.extendLeft) {
			this.remotePoint1 = BaseLine.remotePointOfRay(this.x2, this.y2, this.x1, this.y1, this.stageWidth, this.stageHeight)
		}
		if (this.extendRight) {
			this.remotePoint2 = BaseLine.remotePointOfRay(this.x1, this.y1, this.x2, this.y2, this.stageWidth, this.stageHeight)
		}

		ctx.moveTo(this.remotePoint1.x, this.remotePoint1.y)
		ctx.lineTo(this.remotePoint2.x, this.remotePoint2.y)

		ctx.moveTo(this.remotePoint1.x, this.remotePoint1.y + this.offset)
		ctx.lineTo(this.remotePoint2.x, this.remotePoint2.y + this.offset)

		ctx.closePath()
		ctx.stroke()
		ctx.restore()
		this.polyPath.points = [
			{x: this.remotePoint1.x, y: this.remotePoint1.y},
			{x: this.remotePoint2.x, y: this.remotePoint2.y},
			{x: this.remotePoint2.x, y: this.remotePoint2.y + this.offset},
			{x: this.remotePoint1.x, y: this.remotePoint1.y + this.offset}]
		this.polyPath.render(ctx)
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 3; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}