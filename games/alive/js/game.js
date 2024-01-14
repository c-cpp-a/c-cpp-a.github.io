const gametype = {
	version: "v1.0.0.0"
};
var timems = 0;
const template = {
	rettoHTML: "<div class=\"res\"> \
	<span class=\"resname\">{{name}}</span> \
	<span class=\"resval\">{{nowval}}/{{maxval}}</span>\
	<span class=\"resdelta\">{{dval}}</span>\
	</div>",
	versiontoHTML: "version:{{version}}",
	buildingtoHTML: "<div id=\"building{{id}}\" class=\"building\" onclick=\"newbuilding({{id}});\">\
	{{name}}({{number}})\
	</div>",
	gametime: "第{{time}}年"
}

function replacesrun(s, obj) {
	var _keys = Object.keys(obj);
	for (var i = 0; i < _keys.length; i++) {
		var item = _keys[i];
		s = s.replaceAll("{{" + item + "}}", obj[item]);
	}
	return s;
}
class restype {
	constructor(name, maxval, nowval, dval) {
		this.name = name;
		this.maxval = maxval;
		this.nowval = nowval;
		this.dval = dval;
	}
	changed(delta) {
		this.dval = Number(delta);
	}
	add(delta) {
		this.nowval = Math.max(Math.min(Number(this.nowval) + Number(delta), this.maxval), 0);
	}
	toHTML() {
		return replacesrun(template.rettoHTML, {
			name: this.name,
			maxval: this.maxval,
			nowval: this.nowval.toFixed(2),
			dval: (this.dval < 1e-6 ? new String() : this.dval+"/s")
		});
	}
	update() {
		this.add(this.dval);
	}
}

class GameRes {
	constructor(resrcourses) {
		this.resrcourses = resrcourses;
	}
	showGameRes() {
		document.getElementById("playerabbr").innerHTML = new String("");
		var _keys = Object.keys(this.resrcourses);
		for (var i = 0; i < _keys.length; i++) {
			document.getElementById("playerabbr").innerHTML +=
				this.resrcourses[_keys[i]].toHTML() + "<br />";
		}
		document.getElementById("playerabbr").innerHTML = this.resrcourses.food.toHTML();
	}
	update() {
		for (var i = 0; i < this.resrcourses.length; i++) {
			this.resrcourses[i].update();
		}
	}
}
var res = new GameRes({
	food: new restype("食物", 100, 0, 0)
});
class buildtype {
	constructor(id, name, oncreate, onshow) {
		this.id = id;
		this.name = name;
		this.visible = (onshow() ? true : false);
		this.number = 0;
		this.oncreate = oncreate;
		this.onshow = onshow;
	}
	toHTML() {
		if (this.visible == false) return new String();
		return replacesrun(template.buildingtoHTML, {
			id: this.id,
			name: this.name,
			number: this.number
		});
	}
	newone() {
		this.number++;
		this.oncreate();
		if (this.onshow() || this.visible) this.visible = true;
	}
}

var buildings = [
	new buildtype(0, "采集食物", function() {
		//oncreate
		// console.log(res);
		res.resrcourses.food.add(1);
	}, function() {
		//onshow
		return true;
	}),
	new buildtype(1, "自动采集", function() {
		//oncreate
		// console.log(res);
		res.resrcourses.food.changed(res.resrcourses.food.delta + 1);
	}, function() {
		//onshow
		res.food >= 10;
	})
];

function buildingtoHTML() {
	var s = new String();
	for (var i = 0, numcnt = 0; i < buildings.length; i++) {
		// console.log(buildings[i]);
		if (buildings[i].visible) ++numcnt;
		s = s + buildings[i].toHTML();
		if (numcnt % 3 == 0) {
			s += "<br />";
		}

	}
	return s;
}

function newbuilding(id) {
	buildings[id].newone();
}

function update() {
	//显示 刷新
	res.showGameRes();
	document.getElementById("gametime").innerHTML = replacesrun(template.gametime, {
		time: Math.floor(timems / 1000 / 400)
	});
	document.getElementById("buildingshow").innerHTML = buildingtoHTML();
	//数据 更新
	timems += 10;
	(res.resrcourses.food).update();
}

function load() {
	document.getElementById("version").innerHTML = replacesrun(template.versiontoHTML, gametype);
	update();
	setInterval(update, 10);
}