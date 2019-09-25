import {Line} from "../path/line";
import {TwoPointDrawing} from "./drawing";
import {ITrendLine, ITwoPointDrawing} from "./def";
import { Color } from "../core";
import { ILevelLine, IBand } from "../core/def";
import { RGBA } from "../core/color";
import { Polyline } from "../path";
import {Text} from "../typography/text";
import { TextAlign, TextBaseLine } from "../typography/def";
export class GannBox extends TwoPointDrawing implements ITrendLine {
	static type = "GannBox"
	static priceRatios = [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1]
	static timeRatios = [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1]

	levelLineAry: Line[]
	levelBand: IBand[]
	priceLevels: ILevelLine[]
	priceLeftLabels: Text[]
	priceRightLabels: Text[]
	timeLevels: ILevelLine[]
	timeTopLabels: Text[]
	timeBottomLabels: Text[]
	priceBGOpacity: number
	timeBGOpacity: number
	constructor(l: ITwoPointDrawing, scaleCanvas: HTMLCanvasElement) {
		super(l, scaleCanvas)
		this.type = GannBox.type

		this.priceLevels = [{
			value: 0,
			rgba: {r: 128, g: 128, b: 128, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.25,
			rgba: {r: 152, g: 109, b: 34, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.382,
			rgba: {r: 117, g: 156, b: 45, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.5,
			rgba: {r: 68, g: 152, b: 42, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.618,
			rgba: {r: 67, g: 150, b: 105, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.75,
			rgba: {r: 41, g: 100, b: 149, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 1,
			rgba: {r: 128, g: 128, b: 128, a: 1},
			dash: 'line',
			width: 2
		}]
		this.timeLevels = [{
			value: 0,
			rgba: {r: 128, g: 128, b: 128, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.25,
			rgba: {r: 152, g: 109, b: 34, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.382,
			rgba: {r: 117, g: 156, b: 45, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.5,
			rgba: {r: 68, g: 152, b: 42, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.618,
			rgba: {r: 67, g: 150, b: 105, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 0.75,
			rgba: {r: 41, g: 100, b: 149, a: 1},
			dash: 'line',
			width: 2
		}, {
			value: 1,
			rgba: {r: 128, g: 128, b: 128, a: 1},
			dash: 'line',
			width: 2
		}]
		this.priceBGOpacity = 0.2
		this.timeBGOpacity = 0.2
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
		// this.strokeWidth = val
		// for (let i = 0, len = GannBox.ratios.length; i < len; i++) {
		// 	this.horizontalLines[i].strokeWidth = val;
		// 	this.verticalLines[i].strokeWidth = val;
		// }
	}
	set setStrokeColor(hex: string) {
		// this.strokeColor = Color.fromHex(hex)
		// for (let i = 0, len = GannBox.ratios.length; i < len; i++) {
		// 	this.horizontalLines[i].strokeColor = Color.fromHex(hex)
		// 	this.verticalLines[i].strokeColor = Color.fromHex(hex)
		// }
	}
	set setLineStyle(style: string) {
		// let dashArray = undefined;
		// if (style === 'line') {
		// 	dashArray = []
		// } if (style === 'dash') {
		// 	dashArray = [10, 15]
		// } if (style === 'dot') {
		// 	dashArray = [5, 8]
		// }
		// for (let i = 0, len = GannBox.ratios.length; i < len; i++) {
		// 	this.horizontalLines[i].dashArray = dashArray
		// 	this.verticalLines[i].dashArray = dashArray
		// }
	}
	set setBGOpacity(opacities){
		this.priceBGOpacity = opacities[0].value / 100
		this.timeBGOpacity = opacities[1].value / 100
		this._recalculateLines()
	}
	set setLevels(levels){
		this.priceLevels = []
		this.timeLevels = []
		const priceLevels = levels[0]
		const timeLevels = levels[1]

		for (let i = 0; i < priceLevels.length; i++) {
			const level = priceLevels[i];
			if (level.active.checked) {
				const newLevel = {
					value: level.value.value,
					rgba: level.fillColor.rgba,
					dash: level.style ? level.style.values[level.style.index].value : 'line',
					width: 2
				}
				this.priceLevels.push(newLevel)
			}
		}
		this.priceLevels.sort((a, b) => a.value - b.value)

		for (let i = 0; i < timeLevels.length; i++) {
			const level = timeLevels[i];
			if (level.active.checked) {
				const newLevel = {
					value: level.value.value,
					rgba: level.fillColor.rgba,
					dash: level.style ? level.style.values[level.style.index].value : 'line',
					width: 2
				}
				this.timeLevels.push(newLevel)
			}
		}
		this.timeLevels.sort((a, b) => a.value - b.value)
		this._recalculateLines()
	}
	_recalculateLines() {
		const {_x1, _y1, _x2, _y2} = this
		this.levelLineAry = []
		this.levelBand = []
		this.priceLeftLabels = []
		this.priceRightLabels = []
		this.timeTopLabels = []
		this.timeBottomLabels = []
		let preLine = {x1: 0, y1: 0, x2: 0, y2: 0}
		for (let i = 0, len = this.priceLevels.length; i < len; i++) {
			const dy = _y2 - _y1
			const level = this.priceLevels[i]
			const levelDash = level.dash
			const rgba = level.rgba;
			const levelColor = new Color(new RGBA(rgba.r, rgba.g, rgba.b, rgba.a))
			const ratio = level.value
			const y = _y1 + dy * ratio

			const priceLine = new Line({x1: _x1, y1: y, x2: _x2, y2: y})
			priceLine.strokeColor = levelColor
			priceLine.strokeWidth = this.strokeWidth
			priceLine.dashArray = this.levelStyle(levelDash)
			this.levelLineAry.push(priceLine)
			const newPriceLeftLabel = new Text({value: ratio.toString(), x: _x1, y: y})
			const newPriceRightLabel = new Text({value: ratio.toString(), x: _x2, y: y})

			if (_x1 < _x2) {
				newPriceLeftLabel.textAlign = TextAlign.Right
				newPriceLeftLabel.x = newPriceLeftLabel.x - 20
				newPriceRightLabel.textAlign = TextAlign.Left
				newPriceRightLabel.x = newPriceRightLabel.x + 20
			} else {
				newPriceLeftLabel.textAlign = TextAlign.Left
				newPriceLeftLabel.x = newPriceLeftLabel.x + 20
				newPriceRightLabel.textAlign = TextAlign.Right
				newPriceRightLabel.x = newPriceRightLabel.x - 20
			}
			this.priceLeftLabels.push(newPriceLeftLabel)
			this.priceRightLabels.push(newPriceRightLabel)
			if (i > 0) {
				const newPriceBand = new Polyline(
					{x: preLine.x1, y: preLine.y1},
					{x: preLine.x2, y: preLine.y2},
					{x: _x2, y: y},
					{x: _x1, y: y})
				this.levelBand.push({polyPath: newPriceBand, fillColor:  new Color(new RGBA(rgba.r, rgba.g, rgba.b, this.priceBGOpacity))})
			}
			preLine = {x1: _x1, y1: y, x2: _x2, y2: y}
		}
		for (let i = 0, len = this.timeLevels.length; i < len; i++) {
			const dx = _x2 - _x1
			const level = this.timeLevels[i]
			const levelDash = level.dash
			const rgba = level.rgba;
			const levelColor = new Color(new RGBA(rgba.r, rgba.g, rgba.b, rgba.a))
			const ratio = level.value
			const x = _x1 + dx * ratio

			const timeLine = new Line({x1: x, y1: _y1, x2: x, y2: _y2})
			timeLine.strokeColor = levelColor
			timeLine.strokeWidth = this.strokeWidth
			timeLine.dashArray = this.levelStyle(levelDash)
			this.levelLineAry.push(timeLine)
			const newTimeTopLabel = new Text({value: ratio.toString(), x: x, y: _y1})
			const newTimeBottomLabel = new Text({value: ratio.toString(), x: x, y: _y2})
			if (_y1 < _y2) {
				newTimeTopLabel.textBaseline = TextBaseLine.Bottom
				newTimeTopLabel.y = newTimeTopLabel.y - 20
				newTimeBottomLabel.textBaseline = TextBaseLine.Top
				newTimeBottomLabel.y = newTimeBottomLabel.y + 20
			} else {
				newTimeTopLabel.textBaseline = TextBaseLine.Top
				newTimeTopLabel.y = newTimeTopLabel.y + 20
				newTimeBottomLabel.textBaseline = TextBaseLine.Bottom
				newTimeBottomLabel.y = newTimeBottomLabel.y - 20
			}
			this.timeTopLabels.push(newTimeTopLabel)
			this.timeBottomLabels.push(newTimeBottomLabel)
			if (i > 0) {
				const newTimeBand = new Polyline(
					{x: preLine.x1, y: preLine.y1},
					{x: preLine.x2, y: preLine.y2},
					{x: x, y: _y2},
					{x: x, y: _y1})
				this.levelBand.push({polyPath: newTimeBand, fillColor:  new Color(new RGBA(rgba.r, rgba.g, rgba.b, this.timeBGOpacity))})
			}
			preLine = {x1: x, y1: _y1, x2: x, y2: _y2}
		}
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
	hitTest(point) {
		if (!this.isVisible) return null

		for (let i = 0; i < 2; i++) {
			let l = this.lollipops[i]
			if (l.contains(point)) return l
		}

		for (let i = 0; i < this.levelLineAry.length; i++) {
			const line = this.levelLineAry[i]
			if (line.contains(point)) return this
		}

		return null
	}

	render(ctx) {
		if (!this.isVisible) return
		if (this.opacity === 0) return
		for (let i = 0; i < this.levelLineAry.length; i++) {
			const line = this.levelLineAry[i];
			line.render(ctx)
		}
		for (let i = 0; i < this.levelBand.length; i++) {
			const band = this.levelBand[i];
			band.polyPath.fillColor = band.fillColor
			band.polyPath.render(ctx)
		}
		for (let i = 0; i < this.priceLeftLabels.length; i++) {
			const label = this.priceLeftLabels[i];
			label.render(ctx)
		}
		for (let i = 0; i < this.priceRightLabels.length; i++) {
			const label = this.priceRightLabels[i];
			label.render(ctx)
		}
		for (let i = 0; i < this.timeTopLabels.length; i++) {
			const label = this.timeTopLabels[i];
			label.render(ctx)
		}
		for (let i = 0; i < this.timeBottomLabels.length; i++) {
			const label = this.timeBottomLabels[i];
			label.render(ctx)
		}
		if (!this.isDrawing && (this._isHovered || this._isSelected)) {
			for (let i = 0; i < 2; i++) {
				this.lollipops[i].render(ctx)
			}
		}
	}
}