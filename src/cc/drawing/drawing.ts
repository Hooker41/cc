import {Element} from "../dom/element";
import {dispose, IDisposable} from "../../base/common/lifecycle";
import {ILollipop, IOnePointDrawing, IThreePointDrawing, ITwoPointDrawing} from "./def";
import {Lollipop} from "./lollipop";
import {addDisposableListener, EventType} from "../../base/browser/event";
import {IStage} from "../dom/def";
import {IBaseVector} from "../core/def";

export class OnePointDrawing extends Element implements IOnePointDrawing, IDisposable {
	isDrawing: boolean = false
	_isHovered: boolean = false
	_isSelected: boolean = false

	_x: number
	_y: number
	scaleCanvas: HTMLCanvasElement
	lollipop: ILollipop

	toDispose: IDisposable[] = []
	globalMouseDisposable: IDisposable

	constructor(l: IOnePointDrawing, scaleCanvas: HTMLCanvasElement) {
		super()
		this.type = 'TrendLine'
		this.scaleCanvas = scaleCanvas
		this._x = l.x
		this._y = l.y

		this.lollipop = new Lollipop(l.x, l.y)
		this.lollipop.parent = this

		this.toDispose.push(this.on(EventType.MOUSE_OVER, this._handleMouseEnter.bind(this)))
		this.toDispose.push(this.on(EventType.MOUSE_OUT, this._handleMouseLeave.bind(this)))
		this.toDispose.push(this.lollipop.on(EventType.MOUSE_DOWN, this._handleStartDragControlPoint.bind(this)))
		this.toDispose.push(this.lollipop.on(EventType.MOUSE_UP, this._handleEndDragControlPoint.bind(this)))
		this.toDispose.push(this._handleDragControlPoint = this._handleDragControlPoint.bind(this))
	}

	_handleMouseEnter(e) {
		if (e.target === this || this.isAncestorOf(e.target)) {
			this.isHovered = true
		}
		return true
	}

	_handleMouseLeave(e) {
		if (e.target === this || !this.hitTest({x: e.x, y: e.y})) {
			this.isHovered = false
		}
		return true
	}

	_handleStartDragControlPoint(e) {
		e.target.opacity = 0
		const x = e.x
		const y = e.y

		this.x = x
		this.y = y

		this.globalMouseDisposable = addDisposableListener(window, EventType.MOUSE_MOVE, this._handleDragControlPoint, true)
		return true
	}

	_handleEndDragControlPoint(e) {
		e.target.opacity = 1
		e.target.isSelected = false
		this.globalMouseDisposable.dispose()
		this.globalMouseDisposable = null
	}

	_handleDragControlPoint(e) {
		e.preventDefault()
		e.stopPropagation()
		const rect = this.scaleCanvas.getBoundingClientRect();
		const mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * this.scaleCanvas.width;
		const mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.scaleCanvas.height;
		this.x = mouseX
		this.y = mouseY
		let stage = this.root as IStage
		stage.update({x: e.clientX , y: e.clientY})
	}

	get x() {
		return this._x
	}

	set x(val) {
		this._x = val
		if (this.lollipop) this.lollipop.cx = val
	}

	get y() {
		return this._y
	}

	set y(val) {
		this._y = val
		if (this.lollipop) this.lollipop.cy = val
	}

	get isHovered() {
		return this._isHovered
	}

	set isHovered(val) {
		this._isHovered = val

		if (val && this.lollipop) this.lollipop.isVisible = true
		if (!val && !this.isSelected && this.lollipop) {
			this.lollipop.isSelected = false
			this.lollipop.isHovered = false
		}
	}

	get isSelected() {
		return this._isSelected
	}

	set isSelected(val) {
		this._isSelected = val
		if (this.lollipop) this.lollipop.isSelected = val
		if (!val) this.isHovered = false
	}

	public dispose(): void {
		super.dispose()
		dispose(this.toDispose)
		this.toDispose = []
		if (this.globalMouseDisposable) {
			this.globalMouseDisposable.dispose()
			this.globalMouseDisposable = null
		}
	}
}

export class TwoPointDrawing extends Element implements ITwoPointDrawing, IDisposable {
	isDrawing: boolean = false
	_isHovered: boolean = false
	_isSelected: boolean = false

	_x1: number
	_y1: number
	_x2: number
	_y2: number
	_tmpX1: number
	_tmpX2: number
	dragStartX: number
	dragStartY: number
	scaleCanvas: HTMLCanvasElement
	lollipops: ILollipop[] = []

	draggingPoint: ILollipop

	toDispose: IDisposable[] = []
	globalMouseDisposable: IDisposable
	panEndDisposable: IDisposable
	resizeEndDisposable: IDisposable
	constructor(l: ITwoPointDrawing, scaleCanvas: HTMLCanvasElement) {
		super()
		this.type = 'TrendLine'
		this.scaleCanvas = scaleCanvas
		this._x1 = l.x1
		this._x2 = l.x2
		this._y1 = l.y1
		this._y2 = l.y2

		this.lollipops = [
			new Lollipop(l.x1, l.y1),
			new Lollipop(l.x2, l.y2),
		]

		for (let i = 0; i < 2; i++) {
			this.lollipops[i].parent = this
		}

		this.toDispose.push(this.on(EventType.MOUSE_OVER, this._handleMouseEnter.bind(this)))
		this.toDispose.push(this.on(EventType.MOUSE_OUT, this._handleMouseLeave.bind(this)))
		this.toDispose.push(this.on(EventType.MOUSE_DOWN, this._handleStartDrag.bind(this)))
		this.toDispose.push(this.firstLollipop.on(EventType.MOUSE_DOWN, this._handleStartDragControlPoint.bind(this)))
		this.toDispose.push(this.secondLollipop.on(EventType.MOUSE_DOWN, this._handleStartDragControlPoint.bind(this)))
		this._handleDragControlPoint = this._handleDragControlPoint.bind(this)
		this._handleDrag = this._handleDrag.bind(this)
		this._handleEndDrag = this._handleEndDrag.bind(this)
		this._handleEndDragControlPoint = this._handleEndDragControlPoint.bind(this)
	}

	contains(pt: IBaseVector): boolean {
		return !!this.hitTest(pt)
	}

	get firstLollipop() {
		return this.lollipops[0]
	}

	get secondLollipop() {
		return this.lollipops[1]
	}

	_handleMouseEnter(e) {
		if (this.isDrawing) return true
		if (e.target === this || this.isAncestorOf(e.target)) {
			this.isHovered = true
		}
		return true
	}

	_handleMouseLeave(e) {
		if (this.isDrawing) return true
		if (e.target === this || !this.contains({x: e.x, y: e.y})) {
			this.isHovered = false
		}
		return true
	}
	_handleStartDrag(e) {
		console.log('START DRAG')
		if (this.isDrawing) return true
		this.dragStartX = e.x
		this.dragStartY = e.y
		this._tmpX1 = this.x1;
		this._tmpX2 = this.x2;
		this.globalMouseDisposable = addDisposableListener(window, EventType.MOUSE_MOVE, this._handleDrag, true)
		this.panEndDisposable = addDisposableListener(window, EventType.MOUSE_UP, this._handleEndDrag, true)
		return true
	}
	_handleDrag(e) {
		console.log('DRAGGING')
		e.preventDefault()
		e.stopPropagation()
		let stage = this.root as IStage
		const rect = this.scaleCanvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.scaleCanvas.width;
		const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.scaleCanvas.height;
		let dx = x - this.dragStartX
		let dy = y - this.dragStartY
		this.dragStartX = x
		this.dragStartY = y
		this._tmpX1 = this._tmpX1 + dx;
		this._tmpX2 = this._tmpX2 + dx;
		this.y1 = this.y1 + dy;
		this.y2 = this.y2 + dy;
		const contentWidth = stage.contentWidth
		const stickLength = stage.stickLength
		const moveY = stage.moveY
		const left = (contentWidth - moveY * 2) % stickLength;
		this.x1 = Math.trunc((this._tmpX1 - left) / stickLength) * stickLength + stickLength / 2 + left
		this.x2 = Math.trunc((this._tmpX2 - left) / stickLength) * stickLength + stickLength / 2 + left
		stage.update({x: e.clientX , y: e.clientY})
	}
	_handleEndDrag(e){
		console.log('END DRAG')
		if (this.isDrawing) return true
		let stage = this.root as IStage
		stage.saveUpdate(this.id, this.x1, this.y1, this.x2, this.y2);
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
		if (this.isDrawing) return true
		const x = e.x
		const y = e.y
		const {target} = e
		if (target === this.firstLollipop) {
			this.draggingPoint = this.firstLollipop
			this.x1 = x
			this.y1 = y
		} else {
			this.draggingPoint = this.secondLollipop
			this.x2 = x
			this.y2 = y
		}

		this.globalMouseDisposable = addDisposableListener(window, EventType.MOUSE_MOVE, this._handleDragControlPoint, true)
		this.resizeEndDisposable = addDisposableListener(window, EventType.MOUSE_UP, this._handleEndDragControlPoint, true)
		return true
	}

	_handleEndDragControlPoint(e) {
		if (this.isDrawing) return true
		this.draggingPoint = null
		let stage = this.root as IStage
		stage.saveUpdate(this.id, this.x1, this.y1, this.x2, this.y2);
		if (this.globalMouseDisposable) {
			this.globalMouseDisposable.dispose()
			this.globalMouseDisposable = null
		}
		if (this.resizeEndDisposable) {
			this.resizeEndDisposable.dispose()
			this.resizeEndDisposable = null
		}
		return true
	}

	_handleDragControlPoint(e) {
		e.preventDefault()
		e.stopPropagation()
		const rect = this.scaleCanvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.scaleCanvas.width;
		const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.scaleCanvas.height;
		let stage = this.root as IStage
		const contentWidth = stage.contentWidth
		const stickLength = stage.stickLength
		const moveY = stage.moveY
		const left = (contentWidth - moveY * 2) % stickLength;
		const newX = Math.trunc((x - left) / stickLength) * stickLength + stickLength / 2 + left
		if (this.draggingPoint === this.firstLollipop) {
			this.x1 = newX
			this.y1 = y
		} else {
			this.x2 = newX
			this.y2 = y
		}
		stage.update({x: e.clientX , y: e.clientY})
	}

	get x1() {
		return this._x1
	}

	set x1(val) {
		this._x1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cx = val
	}

	get y1() {
		return this._y1
	}

	set y1(val) {
		this._y1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cy = val
	}

	get x2() {
		return this._x2
	}

	set x2(val) {
		this._x2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cx = val
	}

	get y2() {
		return this._y2
	}

	set y2(val) {
		this._y2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cy = val
	}

	get isHovered() {
		return this._isHovered
	}

	set isHovered(val) {
		this._isHovered = val

		if (this.lollipops) for (let i = 0; i < 2; i++) {
			let l = this.lollipops[i]
			if (val) l.isVisible = true
			if (!val && !this.isSelected) {
				l.isSelected = false
				l.isHovered = false
			}
		}
	}

	get isSelected() {
		return this._isSelected
	}

	set isSelected(val) {
		this._isSelected = val
		if (this.lollipops) for (let i = 0; i < 2; i++) this.lollipops[i].isSelected = val
		if (!val) this.isHovered = false
	}

	public dispose(): void {
		super.dispose()
		dispose(this.toDispose)
		this.toDispose = []
		if (this.globalMouseDisposable) {
			this.globalMouseDisposable.dispose()
			this.globalMouseDisposable = null
		}
	}
}

export class ThreePointDrawing extends Element implements IThreePointDrawing, IDisposable {
	isDrawing: boolean = false
	_isHovered: boolean = false
	_isSelected: boolean = false

	_x1: number
	_y1: number
	_x2: number
	_y2: number
	_x3: number
	_y3: number
	_tmpX1: number
	_tmpX2: number
	_tmpX3: number
	dragStartX: number
	dragStartY: number
	scaleCanvas: HTMLCanvasElement
	lollipops: ILollipop[] = []

	draggingPoint: ILollipop

	toDispose: IDisposable[] = []
	globalMouseDisposable: IDisposable
	panEndDisposable: IDisposable
	resizeEndDisposable: IDisposable
	constructor(l: IThreePointDrawing, scaleCanvas: HTMLCanvasElement) {
		super()

		this._x1 = l.x1
		this._x2 = l.x2
		this._x3 = l.x3
		this._y1 = l.y1
		this._y2 = l.y2
		this._y3 = l.y3
		this.scaleCanvas = scaleCanvas
		this.lollipops = [
			new Lollipop(l.x1, l.y1),
			new Lollipop(l.x2, l.y2),
			new Lollipop(l.x3, l.y3),
		]

		for (let i = 0; i < 3; i++) {
			this.lollipops[i].parent = this
		}

		this.toDispose.push(this.on(EventType.MOUSE_OVER, this._handleMouseEnter.bind(this)))
		this.toDispose.push(this.on(EventType.MOUSE_OUT, this._handleMouseLeave.bind(this)))
		this.toDispose.push(this.on(EventType.MOUSE_DOWN, this._handleStartDrag.bind(this)))
		// this.toDispose.push(this.on(EventType.MOUSE_UP, this._handleEndDrag.bind(this)))
		this.toDispose.push(this.firstLollipop.on(EventType.MOUSE_DOWN, this._handleStartDragControlPoint.bind(this)))
		this.toDispose.push(this.secondLollipop.on(EventType.MOUSE_DOWN, this._handleStartDragControlPoint.bind(this)))
		this.toDispose.push(this.thirdLollipop.on(EventType.MOUSE_DOWN, this._handleStartDragControlPoint.bind(this)))
		// this.toDispose.push(this.firstLollipop.on(EventType.MOUSE_UP, this._handleEndDragControlPoint.bind(this)))
		// this.toDispose.push(this.secondLollipop.on(EventType.MOUSE_UP, this._handleEndDragControlPoint.bind(this)))
		// this.toDispose.push(this.thirdLollipop.on(EventType.MOUSE_UP, this._handleEndDragControlPoint.bind(this)))
		this._handleDragControlPoint = this._handleDragControlPoint.bind(this)
		this._handleDrag = this._handleDrag.bind(this)
		this._handleEndDrag = this._handleEndDrag.bind(this)
		this._handleEndDragControlPoint = this._handleEndDragControlPoint.bind(this)
	}

	get firstLollipop() {
		return this.lollipops[0]
	}

	get secondLollipop() {
		return this.lollipops[1]
	}

	get thirdLollipop() {
		return this.lollipops[2]
	}

	contains(pt: IBaseVector): boolean {
		return !!this.hitTest(pt)
	}

	_handleMouseEnter(e) {
		if (e.target === this || this.isAncestorOf(e.target)) {
			this.isHovered = true
		}
		return true
	}

	_handleMouseLeave(e) {
		if (e.target === this || !this.contains({x: e.x, y: e.y})) {
			this.isHovered = false
		}
		return true
	}
	_handleStartDrag(e) {
		console.log('START DRAG')
		if (this.isDrawing) return true
		this.dragStartX = e.x
		this.dragStartY = e.y
		this._tmpX1 = this.x1;
		this._tmpX2 = this.x2;
		this._tmpX3 = this.x3;
		this.globalMouseDisposable = addDisposableListener(window, EventType.MOUSE_MOVE, this._handleDrag, true)
		this.panEndDisposable = addDisposableListener(window, EventType.MOUSE_UP, this._handleEndDrag, true)
		return true
	}
	_handleDrag(e) {
		console.log('DRAGGING')
		e.preventDefault()
		e.stopPropagation()
		let stage = this.root as IStage
		const rect = this.scaleCanvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.scaleCanvas.width;
		const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.scaleCanvas.height;
		let dx = x - this.dragStartX
		let dy = y - this.dragStartY
		this.dragStartX = x
		this.dragStartY = y
		this._tmpX1 = this._tmpX1 + dx;
		this._tmpX2 = this._tmpX2 + dx;
		this._tmpX3 = this._tmpX3 + dx;
		this.y1 = this.y1 + dy;
		this.y2 = this.y2 + dy;
		this.y3 = this.y3 + dy;
		const contentWidth = stage.contentWidth
		const stickLength = stage.stickLength
		const moveY = stage.moveY
		const left = (contentWidth - moveY * 2) % stickLength;
		this.x1 = Math.trunc((this._tmpX1 - left) / stickLength) * stickLength + stickLength / 2 + left
		this.x2 = Math.trunc((this._tmpX2 - left) / stickLength) * stickLength + stickLength / 2 + left
		this.x3 = Math.trunc((this._tmpX3 - left) / stickLength) * stickLength + stickLength / 2 + left
		stage.update({x: e.clientX , y: e.clientY})
	}
	_handleEndDrag(e){
		console.log('END DRAG')
		if (this.isDrawing) return true
		let stage = this.root as IStage
		stage.saveUpdate(this.id, this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
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
		const x = e.x
		const y = e.y
		const {target} = e
		if (target === this.firstLollipop) {
			this.draggingPoint = this.firstLollipop
			this.x1 = x
			this.y1 = y
		} else if (target === this.secondLollipop) {
			this.draggingPoint = this.secondLollipop
			this.x2 = x
			this.y2 = y
		} else {
			this.draggingPoint = this.thirdLollipop
			this.x3 = x
			this.y3 = y
		}

		this.globalMouseDisposable = addDisposableListener(window, EventType.MOUSE_MOVE, this._handleDragControlPoint, true)
		this.resizeEndDisposable = addDisposableListener(window, EventType.MOUSE_UP, this._handleEndDragControlPoint, true)
		return true
	}

	_handleEndDragControlPoint(e) {
		if (this.isDrawing) return true
		this.draggingPoint = null
		let stage = this.root as IStage
		stage.saveUpdate(this.id, this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
		if (this.globalMouseDisposable) {
			this.globalMouseDisposable.dispose()
			this.globalMouseDisposable = null
		}
		if (this.resizeEndDisposable) {
			this.resizeEndDisposable.dispose()
			this.resizeEndDisposable = null
		}
		return true
	}

	_handleDragControlPoint(e) {
		e.preventDefault()
		e.stopPropagation()
		const rect = this.scaleCanvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / (rect.right - rect.left) * this.scaleCanvas.width;
		const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.scaleCanvas.height;
		let stage = this.root as IStage
		const contentWidth = stage.contentWidth
		const stickLength = stage.stickLength
		const moveY = stage.moveY
		const left = (contentWidth - moveY * 2) % stickLength;
		const newX = Math.trunc((x - left) / stickLength) * stickLength + stickLength / 2 + left
		if (this.draggingPoint === this.firstLollipop) {
			this.x1 = newX
			this.y1 = y
		} else if (this.draggingPoint === this.secondLollipop) {
			this.x2 = newX
			this.y2 = y
		} else {
			this.x3 = newX
			this.y3 = y
		}
		stage.update({x: e.clientX , y: e.clientY})
	}

	get x1() {
		return this._x1
	}

	set x1(val) {
		this._x1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cx = val
	}

	get y1() {
		return this._y1
	}

	set y1(val) {
		this._y1 = val
		if (this.lollipops && this.lollipops[0]) this.lollipops[0].cy = val
	}

	get x2() {
		return this._x2
	}

	set x2(val) {
		this._x2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cx = val
	}

	get y2() {
		return this._y2
	}

	set y2(val) {
		this._y2 = val
		if (this.lollipops && this.lollipops[1]) this.lollipops[1].cy = val
	}

	get x3() {
		return this._x3
	}

	set x3(val) {
		this._x3 = val
		if (this.lollipops && this.lollipops[2]) this.lollipops[2].cx = val
	}

	get y3() {
		return this._y3
	}

	set y3(val) {
		this._y3 = val
		if (this.lollipops && this.lollipops[2]) this.lollipops[2].cy = val
	}

	get isHovered() {
		return this._isHovered
	}

	set isHovered(val) {
		this._isHovered = val

		if (this.lollipops) for (let i = 0; i < 3; i++) {
			let l = this.lollipops[i]
			if (val) l.isVisible = true
			if (!val && !this.isSelected) {
				l.isSelected = false
				l.isHovered = false
			}
		}
	}

	get isSelected() {
		return this._isSelected
	}

	set isSelected(val) {
		this._isSelected = val
		if (this.lollipops) for (let i = 0; i < 3; i++) this.lollipops[i].isSelected = val
		if (!val) this.isHovered = false
	}

	public dispose(): void {
		super.dispose()
		dispose(this.toDispose)
		this.toDispose = []
		if (this.globalMouseDisposable) {
			this.globalMouseDisposable.dispose()
			this.globalMouseDisposable = null
		}
	}
}
