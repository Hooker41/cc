import {ILollipop, ITwoPointDrawing} from "./def";
import {IBaseVector} from "../core/def";
import {Lollipop} from "./lollipop";
import {ILine} from "../path/def";
import {addDisposableListener, EventType} from "../../base/browser/event";
import {IStage} from "../dom/def";
import {Line} from "../path/line";
import {TwoPointDrawing} from "./drawing";
import {Matrix} from "../core/matrix";

export class Brush extends TwoPointDrawing {
	static type = 'Brush'
	lines: ILine[]

	constructor(l: ITwoPointDrawing, scaleCanvas: HTMLCanvasElement) {
		super(l, scaleCanvas)
		this.type = Brush.type

		this.lines = []
		// this.lines.push(new Line(l))
	}
	_handleStartDrag(e) {
		this.dragStartX = e.x
		this.dragStartY = e.y
		this._tmpX1 = e.x;
		this.globalMouseDisposable = addDisposableListener(window, EventType.MOUSE_MOVE, this._handleDragControlPoint, true)
		this.panEndDisposable = addDisposableListener(window, EventType.MOUSE_UP, this._handleEndDrag, true)
		return true
	}
	_handleEndDrag(e){
		if (this.isDrawing) return true
		let stage = this.root as IStage
		stage.saveUpdate(this.id, this.x1, this.y1, this.x2, this.y2, undefined, undefined, this.lines);
		if (this.globalMouseDisposable) {
			this.globalMouseDisposable.dispose()
			this.globalMouseDisposable = null
		}
		if (this.panEndDisposable) {
			this.panEndDisposable.dispose()
			this.panEndDisposable = null
		}
		return true
	}
	_handleStartDragControlPoint(e) {
		this.dragStartX = e.x
		this.dragStartY = e.y
		this.globalMouseDisposable = addDisposableListener(window, EventType.MOUSE_MOVE, this._handleDragControlPoint, true)
		this.panEndDisposable = addDisposableListener(window, EventType.MOUSE_UP, this._handleEndDrag, true)
		return true
	}

	_handleDragControlPoint(e) {
		e.preventDefault()
		e.stopPropagation()
		const rect = this.scaleCanvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.scaleCanvas.width;
		const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.scaleCanvas.height;
		let dy = y - this.dragStartY
		this.dragStartY = y
		let stage = this.root as IStage
		const contentWidth = stage.contentWidth
		const stickLength = stage.stickLength
		const moveY = stage.moveY
		const left = (contentWidth - moveY * 2) % stickLength;
		const newX1 = Math.trunc((x - left) / stickLength) * stickLength + stickLength / 2 + left
		const newDx = newX1 - this.dragStartX;
		this.dragStartX = newX1;
		this.translate({x: newDx, y: dy})
		// this.lollipops.forEach(l => {
		// 	l.cx = l.cx + dx
		// 	l.cy = l.cy + dy
		// })
		// this.lines.forEach(l => {
		// 	l.x1 = l.x1 + dx
		// 	l.y1 = l.y1 + dy
		// 	l.x2 = l.x2 + dx
		// 	l.y2 = l.y2 + dy
		// })
		stage.update({x: e.clientX , y: e.clientY})
	}

	push(pt: IBaseVector) {
		const {x, y} = pt
		this.lines.push(new Line({x1: this._x2, y1: this._y2, x2: x, y2: y}))
		this.x2 = x
		this.y2 = y
	}

	hitTest(pt) {
		if (!this.isVisible) return null
		let point = Matrix.inverseTransform(this.matrix, pt)
		for (let i = 0; i < 2; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}
		for (let i = 0, len = this.lines.length; i < len; i++) {
			if (this.lines[i].contains(point)) return this
		}
		return null
	}

	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return
		ctx.save()
		let mx = this.matrix
		ctx.transform(mx.a, mx.b, mx.c, mx.d, mx.tx, mx.ty)
		for (let i = 0, len = this.lines.length; i < len; i++) {
			this.lines[i].render(ctx)
		}

		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 2; i++) {
				this.lollipops[i].render(ctx)
			}
		}
		ctx.restore()
	}
}
