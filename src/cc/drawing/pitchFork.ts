import {ThreePointDrawing} from "./drawing";
import {IThreePointDrawing} from "./def";
import {Line as BaseLine} from "../core/line";
import {ILine} from "../path/def";
import {IStage} from "../dom/def";
import {Vector} from "../core/vector";
import {Line} from "../path/line";
import { Color } from "../core";
import { IBand, ILevelLine } from "../core/def";
import { Polyline } from "../path";
import { RGBA } from "../core/color";

export class PitchFork extends ThreePointDrawing {
	static type = 'PitchFork'

	line0: ILine

	initHeight: number
	initWidth: number
	levelLineAry: Line[]
	levelBand: IBand[]
	levels: ILevelLine[]
	bgOpacity: number
	constructor(l: IThreePointDrawing, scaleCanvas: HTMLCanvasElement, initWidth: number, initHeight: number) {
		super(l, scaleCanvas)

		this.type = PitchFork.type
		this.initHeight = initHeight
		this.initWidth = initWidth
		this.line0 = new Line(l)
		this.levels = [{
			value: 0.5,
			rgba: {r: 68, g: 152, b: 42, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 1,
			rgba: {r: 0, g: 11, b: 147, a: 1},
			dash: 'line',
			width: 2
		}]
		this.levelLineAry = []
		this.levelBand = []
		this.bgOpacity = 0.2
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

	_recalculateLines() {
		const {_x1, _y1, _x2, _y2, _x3, _y3} = this
		this.levelLineAry = []
		this.levelBand = []
		this.line0.x1 = _x2
		this.line0.y1 = _y2
		this.line0.x2 = _x3
		this.line0.y2 = _y3
		this.line0.strokeColor = this.strokeColor
		this.line0.strokeWidth = this.strokeWidth
		this.line0.dashArray = this.dashArray
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
		let midPt = Vector.midPoint({x: _x2, y: _y2}, {x: _x3, y: _y3})
		let midRemotepoint = BaseLine.remotePointOfRay(_x1, _y1, midPt.x, midPt.y, width, height)
		let midLine = new Line({x1: _x1, y1: _y1, x2: midRemotepoint.x, y2: midRemotepoint.y})
		midLine.strokeColor = this.strokeColor
		midLine.strokeWidth = this.strokeWidth
		midLine.dashArray = this.dashArray
		this.levelLineAry.push(midLine)

		let preLeftPt = midPt
		let preLeftRemotPt = midRemotepoint
		let preRightPt = midPt
		let preRightRemotPt = midRemotepoint
		for (let i = 0; i < this.levels.length; i++) {
			const level = this.levels[i]
			const levelDash = level.dash
			const rgba = level.rgba;
			const levelColor = new Color(new RGBA(rgba.r, rgba.g, rgba.b, rgba.a))

			const leftX = midPt.x + (_x2 - midPt.x) * level.value
			const leftY = midPt.y - (midPt.y - _y2) * level.value
			const rightX = _x3 + (midPt.x - _x3) * (1 - level.value)
			const rightY = _y3 - (_y3 - midPt.y) * (1 - level.value)

			let leftOffset = BaseLine.verticalOffsetOfParallelLine(_x1, _y1, midPt.x, midPt.y, leftX, leftY)
			let rightOffset = BaseLine.verticalOffsetOfParallelLine(_x1, _y1, midPt.x, midPt.y, rightX, rightY)

			let remotePointLeft = BaseLine.remotePointOfRay(_x1, _y1 + leftOffset, midPt.x, midPt.y + leftOffset, width, height)
			let remotePointRight = BaseLine.remotePointOfRay(_x1, _y1 + rightOffset, midPt.x, midPt.y + rightOffset, width, height)

			let leftLine = new Line({x1: leftX, y1: leftY, x2: remotePointLeft.x, y2: remotePointLeft.y})
			leftLine.strokeColor = levelColor
			leftLine.strokeWidth = this.strokeWidth
			leftLine.dashArray = this.levelStyle(levelDash)

			let rightLine = new Line({x1: rightX, y1: rightY, x2: remotePointRight.x, y2: remotePointRight.y})
			rightLine.strokeColor = levelColor
			rightLine.strokeWidth = this.strokeWidth
			rightLine.dashArray = this.levelStyle(levelDash)
			this.levelLineAry.push(leftLine)
			this.levelLineAry.push(rightLine)

			const newLeftBand = new Polyline(preLeftPt, {x: leftX, y: leftY}, remotePointLeft, preLeftRemotPt)
			this.levelBand.push({polyPath: newLeftBand, fillColor:  new Color(new RGBA(rgba.r, rgba.g, rgba.b, this.bgOpacity))})
			const newRightBand = new Polyline(preRightPt, {x: rightX, y: rightY}, remotePointRight, preRightRemotPt)
			this.levelBand.push({polyPath: newRightBand, fillColor:  new Color(new RGBA(rgba.r, rgba.g, rgba.b, this.bgOpacity))})

			preLeftPt = {x: leftX, y: leftY}
			preLeftRemotPt = remotePointLeft
			preRightPt = {x: rightX, y: rightY}
			preRightRemotPt = remotePointRight
		}
	}

	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 3; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}
		if (this.line0.contains(point)) return this
		for (let i = 0; i < this.levelLineAry.length; i++) {
			const line = this.levelLineAry[i]
			if (line.contains(point)) return this
		}
		return null
	}
	levelStyle(style: string) {
		let dashArray = undefined
		if (style === 'line') {
			dashArray = []
		} if (style === 'dash') {
			dashArray = [10, 15]
		} if (style === 'dot') {
			dashArray = [5, 8]
		}
		return dashArray
	}
	set setStrokeWidth(val: number) {
		this.strokeWidth = val
		this._recalculateLines()
	}
	set setStrokeColor(hex: string) {
		this.strokeColor = Color.fromHex(hex)
		this._recalculateLines()
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
		this.dashArray = dashArray
		this._recalculateLines()
	}
	set setBGOpacity(opacity: number){
		this.bgOpacity = opacity / 100
		this._recalculateLines()
	}
	set setLevels(levels){
		this.levels = []
		for (let i = 0; i < levels[0].length; i++) {
			const level = levels[0][i];
			if (level.active.checked) {
				const newLevel = {
					value: level.value.value,
					rgba: level.fillColor.rgba,
					dash: level.style.values[level.style.index].value,
					width: 2
				}
				this.levels.push(newLevel)
			}
		}
		this.levels.sort((a, b) => a.value - b.value)
		this._recalculateLines()
	}
	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return

		this.line0.render(ctx)
		for (let i = 0; i < this.levelLineAry.length; i++) {
			const line = this.levelLineAry[i];
			line.render(ctx)
		}
		for (let i = 0; i < this.levelBand.length; i++) {
			const band = this.levelBand[i];
			band.polyPath.fillColor = band.fillColor
			band.polyPath.render(ctx)
		}
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 3; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}